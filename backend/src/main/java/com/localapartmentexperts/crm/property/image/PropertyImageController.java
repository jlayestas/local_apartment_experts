package com.localapartmentexperts.crm.property.image;

import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.property.image.dto.PropertyImageDTO;
import com.localapartmentexperts.crm.property.image.dto.ReorderImagesRequest;
import com.localapartmentexperts.crm.property.image.dto.UpdatePropertyImageRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST endpoints for property image management.
 *
 * <ul>
 *   <li>GET    /api/v1/properties/{id}/images                – list images ordered by sortOrder</li>
 *   <li>POST   /api/v1/properties/{id}/images                – upload a new image (multipart)</li>
 *   <li>DELETE /api/v1/properties/{id}/images/{imageId}      – remove an image</li>
 *   <li>PATCH  /api/v1/properties/{id}/images/{imageId}/cover – set as cover image</li>
 *   <li>PUT    /api/v1/properties/{id}/images/reorder        – reorder gallery</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/properties/{propertyId}/images")
@RequiredArgsConstructor
public class PropertyImageController {

    private final PropertyImageService imageService;

    // ── GET /api/v1/properties/{propertyId}/images ────────────────────────────

    @GetMapping
    public ApiResponse<List<PropertyImageDTO>> list(@PathVariable UUID propertyId) {
        return ApiResponse.ok(imageService.list(propertyId));
    }

    // ── POST /api/v1/properties/{propertyId}/images ───────────────────────────

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PropertyImageDTO> upload(
            @PathVariable UUID propertyId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "altText", required = false) String altText,
            Authentication authentication) {

        return ApiResponse.ok(imageService.upload(propertyId, file, altText, authentication.getName()), "Image uploaded");
    }

    // ── PATCH /api/v1/properties/{propertyId}/images/{imageId} ───────────────

    @PatchMapping("/{imageId}")
    public ApiResponse<PropertyImageDTO> updateAltText(
            @PathVariable UUID propertyId,
            @PathVariable UUID imageId,
            @RequestBody UpdatePropertyImageRequest request) {

        return ApiResponse.ok(imageService.updateAltText(propertyId, imageId, request), "Alt text updated");
    }

    // ── DELETE /api/v1/properties/{propertyId}/images/{imageId} ──────────────

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID propertyId,
            @PathVariable UUID imageId,
            Authentication authentication) {

        imageService.delete(propertyId, imageId, authentication.getName());
    }

    // ── PATCH /api/v1/properties/{propertyId}/images/{imageId}/cover ──────────

    @PatchMapping("/{imageId}/cover")
    public ApiResponse<PropertyImageDTO> setCover(
            @PathVariable UUID propertyId,
            @PathVariable UUID imageId,
            Authentication authentication) {

        return ApiResponse.ok(imageService.setCover(propertyId, imageId, authentication.getName()), "Cover image updated");
    }

    // ── PUT /api/v1/properties/{propertyId}/images/reorder ───────────────────

    @PutMapping("/reorder")
    public ApiResponse<List<PropertyImageDTO>> reorder(
            @PathVariable UUID propertyId,
            @Valid @RequestBody ReorderImagesRequest request,
            Authentication authentication) {

        return ApiResponse.ok(imageService.reorder(propertyId, request, authentication.getName()), "Gallery reordered");
    }
}
