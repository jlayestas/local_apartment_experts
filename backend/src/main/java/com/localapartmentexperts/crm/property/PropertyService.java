package com.localapartmentexperts.crm.property;

import com.localapartmentexperts.crm.activity.ActivityService;
import com.localapartmentexperts.crm.common.exception.BusinessException;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.property.dto.CreatePropertyRequest;
import com.localapartmentexperts.crm.property.dto.InternalPropertyDTO;
import com.localapartmentexperts.crm.property.dto.PropertyDTO;
import com.localapartmentexperts.crm.property.dto.PropertySummaryDTO;
import com.localapartmentexperts.crm.property.dto.UpdatePropertyRequest;
import com.localapartmentexperts.crm.property.image.PropertyImage;
import com.localapartmentexperts.crm.property.image.PropertyImageRepository;
import com.localapartmentexperts.crm.property.image.dto.PropertyImageDTO;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final PropertyImageRepository imageRepository;

    private static final Pattern SLUG_SAFE = Pattern.compile("[^a-z0-9]+");

    // ── Create ────────────────────────────────────────────────────────────────

    public InternalPropertyDTO create(CreatePropertyRequest req, String actorEmail) {
        User actor = resolveUser(actorEmail);

        String slug = req.slug() != null && !req.slug().isBlank()
                ? req.slug().trim()
                : generateSlug(req.title());

        if (propertyRepository.existsBySlug(slug)) {
            throw new BusinessException("A property with slug '" + slug + "' already exists", HttpStatus.CONFLICT);
        }

        User listingAgent = req.listingAgentId() != null
                ? resolveUser(req.listingAgentId())
                : null;

        Property property = Property.builder()
                .title(req.title())
                .slug(slug)
                .description(req.description())
                .internalNotes(req.internalNotes())
                .addressLine1(req.addressLine1())
                .addressLine2(req.addressLine2())
                .neighborhood(req.neighborhood())
                .city(req.city())
                .state(req.state())
                .zipCode(req.zipCode())
                .latitude(req.latitude())
                .longitude(req.longitude())
                .price(req.price())
                .priceFrequency(req.priceFrequency())
                .propertyType(req.propertyType())
                .bedrooms(req.bedrooms())
                .bathrooms(req.bathrooms())
                .squareFeet(req.squareFeet())
                .availableDate(req.availableDate())
                .featured(req.featured() != null && req.featured())
                .amenities(req.amenities())
                .petPolicy(req.petPolicy())
                .parkingInfo(req.parkingInfo())
                .externalReferenceId(req.externalReferenceId())
                .sourceCompany(req.sourceCompany())
                .listingAgent(listingAgent)
                .contactPhone(req.contactPhone())
                .contactWhatsapp(req.contactWhatsapp())
                .build();

        Property saved = propertyRepository.save(property);
        tryRecordActivity(() -> activityService.recordPropertyCreated(saved, actor));

        return InternalPropertyDTO.from(saved);
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PropertySummaryDTO> list(
            String search,
            PropertyStatus status,
            Boolean featured,
            String city,
            String neighborhood,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Short bedrooms,
            String propertyType,
            List<String> amenities,
            int page,
            int size) {

        Specification<Property> spec = PropertySpecification.withFilters(
                search, status, featured, city, neighborhood, minPrice, maxPrice, bedrooms, propertyType, amenities);

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return propertyRepository.findAll(spec, pageable).map(PropertySummaryDTO::from);
    }

    // ── Get detail ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public InternalPropertyDTO getById(UUID id) {
        return InternalPropertyDTO.from(findProperty(id));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public InternalPropertyDTO update(UUID id, UpdatePropertyRequest req, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Property property = findProperty(id);

        List<String> changed = applyFields(req, property);

        Property saved = propertyRepository.save(property);

        if (!changed.isEmpty()) {
            tryRecordActivity(() -> activityService.recordPropertyUpdated(saved, actor, Map.of("fields", changed)));
        }

        return InternalPropertyDTO.from(saved);
    }

    // ── Publish ───────────────────────────────────────────────────────────────

    public InternalPropertyDTO publish(UUID id, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Property property = findProperty(id);

        if (property.getStatus() == PropertyStatus.PUBLISHED) {
            throw new BusinessException("Property is already published");
        }
        if (property.getStatus() == PropertyStatus.ARCHIVED) {
            throw new BusinessException("Archived properties cannot be published; unpublish first");
        }

        property.setStatus(PropertyStatus.PUBLISHED);
        if (property.getPublishedAt() == null) {
            // Only set publishedAt on first publish — never cleared on re-draft
            property.setPublishedAt(Instant.now());
        }

        Property saved = propertyRepository.save(property);
        tryRecordActivity(() -> activityService.recordPropertyPublished(saved, actor));

        return InternalPropertyDTO.from(saved);
    }

    // ── Unpublish ─────────────────────────────────────────────────────────────

    public InternalPropertyDTO unpublish(UUID id, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Property property = findProperty(id);

        if (property.getStatus() != PropertyStatus.PUBLISHED) {
            throw new BusinessException("Only published properties can be unpublished");
        }

        property.setStatus(PropertyStatus.DRAFT);
        Property saved = propertyRepository.save(property);
        tryRecordActivity(() -> activityService.recordPropertyUnpublished(saved, actor));

        return InternalPropertyDTO.from(saved);
    }

    // ── Archive ───────────────────────────────────────────────────────────────

    public InternalPropertyDTO archive(UUID id, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Property property = findProperty(id);

        if (property.getStatus() == PropertyStatus.ARCHIVED) {
            throw new BusinessException("Property is already archived");
        }

        property.setStatus(PropertyStatus.ARCHIVED);
        property.setArchivedAt(Instant.now());

        Property saved = propertyRepository.save(property);
        tryRecordActivity(() -> activityService.recordPropertyArchived(saved, actor));

        return InternalPropertyDTO.from(saved);
    }

    // ── Public read ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PropertySummaryDTO> listPublished(
            String search,
            Boolean featured,
            String city,
            String neighborhood,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Short bedrooms,
            String propertyType,
            List<String> amenities,
            int page,
            int size) {

        // Force status = PUBLISHED for all public queries
        Specification<Property> spec = PropertySpecification.withFilters(
                search, PropertyStatus.PUBLISHED, featured, city, neighborhood,
                minPrice, maxPrice, bedrooms, propertyType, amenities);

        // publicSortOrder ASC NULLS LAST → publishedAt DESC
        // Rows with an explicit sort order appear first (lower = higher in list).
        // Rows without an order fall back to most-recently-published.
        Sort sort = Sort.by(Sort.Order.asc("publicSortOrder").nullsLast())
                .and(Sort.by(Sort.Order.desc("publishedAt")));
        PageRequest pageable = PageRequest.of(page, size, sort);

        Page<Property> propertyPage = propertyRepository.findAll(spec, pageable);

        // Batch-load cover images for all properties on this page in one query
        List<UUID> ids = propertyPage.stream().map(Property::getId).toList();
        Map<UUID, String> coverUrlById = ids.isEmpty() ? Map.of() :
                imageRepository.findCoversByPropertyIdIn(ids).stream()
                        .collect(Collectors.toMap(
                                img -> img.getProperty().getId(),
                                PropertyImage::getImageUrl,
                                (a, b) -> a));

        return propertyPage.map(p -> PropertySummaryDTO.from(p, coverUrlById.get(p.getId())));
    }

    @Transactional(readOnly = true)
    public PropertyDTO getPublishedBySlug(String slug) {
        Property property = propertyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found: " + slug));

        if (property.getStatus() != PropertyStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Property not found: " + slug);
        }

        List<PropertyImageDTO> images = imageRepository
                .findByPropertyIdOrderBySortOrderAsc(property.getId())
                .stream()
                .map(PropertyImageDTO::from)
                .toList();

        return PropertyDTO.from(property, images);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<String> applyFields(UpdatePropertyRequest req, Property p) {
        List<String> changed = new ArrayList<>();

        if (req.getTitle() != null) { p.setTitle(req.getTitle()); changed.add("title"); }
        if (req.getSlug() != null) {
            if (p.getPublishedAt() != null && !req.getSlug().equals(p.getSlug())) {
                throw new BusinessException("Slug cannot be changed after a property has been published");
            }
            if (propertyRepository.existsBySlug(req.getSlug())
                    && !req.getSlug().equals(p.getSlug())) {
                throw new BusinessException("A property with slug '" + req.getSlug() + "' already exists", HttpStatus.CONFLICT);
            }
            p.setSlug(req.getSlug());
            changed.add("slug");
        }
        if (req.getDescription() != null) { p.setDescription(req.getDescription()); changed.add("description"); }
        if (req.getInternalNotes() != null) { p.setInternalNotes(req.getInternalNotes()); changed.add("internalNotes"); }
        if (req.getAddressLine1() != null) { p.setAddressLine1(req.getAddressLine1()); changed.add("addressLine1"); }
        if (req.getAddressLine2() != null) { p.setAddressLine2(req.getAddressLine2()); changed.add("addressLine2"); }
        if (req.getNeighborhood() != null) { p.setNeighborhood(req.getNeighborhood()); changed.add("neighborhood"); }
        if (req.getCity() != null) { p.setCity(req.getCity()); changed.add("city"); }
        if (req.getState() != null) { p.setState(req.getState()); changed.add("state"); }
        if (req.getZipCode() != null) { p.setZipCode(req.getZipCode()); changed.add("zipCode"); }
        if (req.getLatitude() != null) { p.setLatitude(req.getLatitude()); changed.add("latitude"); }
        if (req.getLongitude() != null) { p.setLongitude(req.getLongitude()); changed.add("longitude"); }
        if (req.getPrice() != null) { p.setPrice(req.getPrice()); changed.add("price"); }
        if (req.getPriceFrequency() != null) { p.setPriceFrequency(req.getPriceFrequency()); changed.add("priceFrequency"); }
        if (req.getPropertyType() != null) { p.setPropertyType(req.getPropertyType()); changed.add("propertyType"); }
        if (req.getBedrooms() != null) { p.setBedrooms(req.getBedrooms()); changed.add("bedrooms"); }
        if (req.getBathrooms() != null) { p.setBathrooms(req.getBathrooms()); changed.add("bathrooms"); }
        if (req.getSquareFeet() != null) { p.setSquareFeet(req.getSquareFeet()); changed.add("squareFeet"); }
        if (req.getAvailableDate() != null) { p.setAvailableDate(req.getAvailableDate()); changed.add("availableDate"); }
        if (req.getFeatured() != null) { p.setFeatured(req.getFeatured()); changed.add("featured"); }
        if (req.getAmenities() != null) { p.setAmenities(req.getAmenities()); changed.add("amenities"); }
        if (req.getPetPolicy() != null) { p.setPetPolicy(req.getPetPolicy()); changed.add("petPolicy"); }
        if (req.getParkingInfo() != null) { p.setParkingInfo(req.getParkingInfo()); changed.add("parkingInfo"); }
        if (req.getExternalReferenceId() != null) { p.setExternalReferenceId(req.getExternalReferenceId()); changed.add("externalReferenceId"); }
        if (req.getSourceCompany() != null) { p.setSourceCompany(req.getSourceCompany()); changed.add("sourceCompany"); }
        if (req.getListingAgentId() != null) {
            p.setListingAgent(resolveUser(req.getListingAgentId()));
            changed.add("listingAgent");
        }
        if (req.getContactPhone() != null) { p.setContactPhone(req.getContactPhone()); changed.add("contactPhone"); }
        if (req.getContactWhatsapp() != null) { p.setContactWhatsapp(req.getContactWhatsapp()); changed.add("contactWhatsapp"); }
        if (req.getPublicSortOrder() != null) { p.setPublicSortOrder(req.getPublicSortOrder()); changed.add("publicSortOrder"); }

        return changed;
    }

    private Property findProperty(UUID id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", id));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private User resolveUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    /**
     * Best-effort activity recording — failures are logged but never propagated.
     * The main transaction is already saved by the time this is called, so a
     * failure here must not roll it back. For most failure modes (application
     * bugs, serialization errors) the Hibernate session is unaffected and the
     * outer transaction commits normally.
     */
    private void tryRecordActivity(Runnable recorder) {
        try {
            recorder.run();
        } catch (Exception e) {
            log.warn("Failed to record property activity (operation already persisted): {}", e.getMessage(), e);
        }
    }

    /**
     * Converts a title to a URL-safe slug.
     * Appends a numeric suffix if the generated slug already exists.
     */
    private String generateSlug(String title) {
        String base = SLUG_SAFE.matcher(title.trim().toLowerCase()).replaceAll("-");
        // Strip leading/trailing hyphens
        base = base.replaceAll("^-+|-+$", "");
        if (base.isEmpty()) {
            base = "property";
        }

        if (!propertyRepository.existsBySlug(base)) {
            return base;
        }

        // Append counter until unique
        int counter = 2;
        while (propertyRepository.existsBySlug(base + "-" + counter)) {
            counter++;
        }
        return base + "-" + counter;
    }
}
