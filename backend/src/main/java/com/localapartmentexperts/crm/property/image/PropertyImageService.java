package com.localapartmentexperts.crm.property.image;

import com.localapartmentexperts.crm.activity.ActivityService;
import com.localapartmentexperts.crm.common.exception.BusinessException;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.property.PropertyRepository;
import com.localapartmentexperts.crm.property.image.dto.PropertyImageDTO;
import com.localapartmentexperts.crm.property.image.dto.ReorderImagesRequest;
import com.localapartmentexperts.crm.property.image.dto.UpdatePropertyImageRequest;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PropertyImageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

    private final PropertyImageRepository imageRepository;
    private final PropertyRepository propertyRepository;
    private final StorageService storageService;
    private final ActivityService activityService;
    private final UserRepository userRepository;

    // ── Upload ────────────────────────────────────────────────────────────────

    public PropertyImageDTO upload(UUID propertyId, MultipartFile file, String altText, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Property property = findProperty(propertyId);
        validateFile(file);

        String ext = extension(file.getOriginalFilename());
        String key = "properties/" + propertyId + "/" + UUID.randomUUID() + ext;

        String publicUrl;
        try {
            publicUrl = storageService.store(key, file.getInputStream(),
                    file.getContentType());
        } catch (IOException e) {
            log.error("Failed to store image for property {}: {}", propertyId, e.getMessage());
            throw new BusinessException("Image upload failed. Please try again.");
        }

        int sortOrder = imageRepository.countByPropertyId(propertyId);
        boolean isFirst = sortOrder == 0;

        PropertyImage image = PropertyImage.builder()
                .property(property)
                .storageKey(key)
                .imageUrl(publicUrl)
                .altText(altText != null && !altText.isBlank() ? altText.trim() : null)
                .sortOrder(sortOrder)
                .cover(isFirst) // first upload becomes cover automatically
                .build();

        PropertyImageDTO result;
        try {
            result = PropertyImageDTO.from(imageRepository.save(image));
        } catch (Exception dbEx) {
            // Storage succeeded but DB failed — attempt immediate compensation.
            log.error("DB save failed for image key '{}' on property {} — attempting storage cleanup: {}",
                    key, propertyId, dbEx.getMessage(), dbEx);
            try {
                storageService.delete(key);
                log.info("Compensating storage delete succeeded for key '{}'", key);
            } catch (IOException cleanupEx) {
                log.error("ORPHANED STORAGE OBJECT — manual cleanup required. key='{}', propertyId={}, error={}",
                        key, propertyId, cleanupEx.getMessage(), cleanupEx);
            }
            throw dbEx;
        }

        tryRecordActivity(() -> activityService.recordPropertyImageUploaded(property, actor, result.id(), isFirst));
        return result;
    }

    // ── Update alt text ───────────────────────────────────────────────────────

    public PropertyImageDTO updateAltText(UUID propertyId, UUID imageId, UpdatePropertyImageRequest req) {
        PropertyImage image = findImage(propertyId, imageId);
        image.setAltText(req.altText() != null && !req.altText().isBlank() ? req.altText().trim() : null);
        return PropertyImageDTO.from(imageRepository.save(image));
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PropertyImageDTO> list(UUID propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property", propertyId);
        }
        return imageRepository.findByPropertyIdOrderBySortOrderAsc(propertyId)
                .stream()
                .map(PropertyImageDTO::from)
                .toList();
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void delete(UUID propertyId, UUID imageId, String actorEmail) {
        User actor = resolveUser(actorEmail);
        PropertyImage image = findImage(propertyId, imageId);

        // Capture details before deletion — entity won't be accessible afterward
        Property property = image.getProperty();
        String key = image.getStorageKey();
        boolean wasCover = image.isCover();

        imageRepository.delete(image);
        imageRepository.flush();

        // Delete from storage (best-effort — don't roll back the DB row on failure)
        try {
            if (key != null) storageService.delete(key);
        } catch (IOException e) {
            log.warn("Could not delete storage object '{}': {}", key, e.getMessage());
        }

        // If the deleted image was the cover, promote the next image
        if (wasCover) {
            imageRepository.findByPropertyIdOrderBySortOrderAsc(propertyId)
                    .stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setCover(true);
                        imageRepository.save(next);
                    });
        }

        tryRecordActivity(() -> activityService.recordPropertyImageDeleted(property, actor, imageId, wasCover));
    }

    // ── Set cover ─────────────────────────────────────────────────────────────

    public PropertyImageDTO setCover(UUID propertyId, UUID imageId, String actorEmail) {
        User actor = resolveUser(actorEmail);
        PropertyImage image = findImage(propertyId, imageId);
        Property property = image.getProperty();

        // Clear existing cover in one UPDATE, then set the new one
        imageRepository.clearCoverForProperty(propertyId);
        imageRepository.flush();

        image.setCover(true);
        PropertyImageDTO result = PropertyImageDTO.from(imageRepository.save(image));

        tryRecordActivity(() -> activityService.recordPropertyImageCoverChanged(property, actor, imageId));
        return result;
    }

    // ── Reorder ───────────────────────────────────────────────────────────────

    public List<PropertyImageDTO> reorder(UUID propertyId, ReorderImagesRequest request, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Property property = findProperty(propertyId);

        List<PropertyImage> existing =
                imageRepository.findByPropertyIdOrderBySortOrderAsc(propertyId);

        Set<UUID> existingIds = existing.stream()
                .map(PropertyImage::getId)
                .collect(Collectors.toSet());

        List<UUID> incoming = request.orderedIds();

        // Validate: every incoming ID must belong to this property
        for (UUID id : incoming) {
            if (!existingIds.contains(id)) {
                throw new BusinessException("Image " + id + " does not belong to property " + propertyId);
            }
        }
        // Validate: all images must be represented (no partial lists)
        if (incoming.size() != existingIds.size()) {
            throw new BusinessException(
                    "orderedIds must include all " + existingIds.size() + " images for this property");
        }

        // Build an id→entity map for O(1) lookup
        var byId = existing.stream()
                .collect(Collectors.toMap(PropertyImage::getId, img -> img));

        for (int i = 0; i < incoming.size(); i++) {
            byId.get(incoming.get(i)).setSortOrder(i);
        }

        imageRepository.saveAll(existing);

        List<PropertyImageDTO> result = imageRepository.findByPropertyIdOrderBySortOrderAsc(propertyId)
                .stream()
                .map(PropertyImageDTO::from)
                .toList();

        int count = incoming.size();
        tryRecordActivity(() -> activityService.recordPropertyImagesReordered(property, actor, count));
        return result;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Property findProperty(UUID id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", id));
    }

    private PropertyImage findImage(UUID propertyId, UUID imageId) {
        PropertyImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("PropertyImage", imageId));
        if (!image.getProperty().getId().equals(propertyId)) {
            throw new ResourceNotFoundException("PropertyImage", imageId);
        }
        return image;
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private void tryRecordActivity(Runnable recorder) {
        try {
            recorder.run();
        } catch (Exception e) {
            log.warn("Failed to record image activity (operation already persisted): {}", e.getMessage(), e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new BusinessException("File exceeds the 10 MB size limit");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct.toLowerCase())) {
            throw new BusinessException(
                    "Unsupported file type. Allowed: JPEG, PNG, WebP");
        }
    }

    private String extension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }
}
