package com.localapartmentexperts.crm.property;

import com.localapartmentexperts.crm.activity.ActivityService;
import com.localapartmentexperts.crm.activity.dto.ActivityDTO;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.common.response.PagedResponse;
import com.localapartmentexperts.crm.property.dto.CreatePropertyRequest;
import com.localapartmentexperts.crm.property.dto.InternalPropertyDTO;
import com.localapartmentexperts.crm.property.dto.PropertySummaryDTO;
import com.localapartmentexperts.crm.property.dto.UpdatePropertyRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Internal (authenticated) REST endpoints for property management.
 *
 * <ul>
 *   <li>GET    /api/v1/properties                    – paginated list with filters</li>
 *   <li>POST   /api/v1/properties                    – create a new property</li>
 *   <li>GET    /api/v1/properties/{id}               – property detail</li>
 *   <li>PATCH  /api/v1/properties/{id}               – partial update</li>
 *   <li>POST   /api/v1/properties/{id}/publish       – DRAFT → PUBLISHED</li>
 *   <li>POST   /api/v1/properties/{id}/unpublish     – PUBLISHED → DRAFT</li>
 *   <li>POST   /api/v1/properties/{id}/archive       – any → ARCHIVED</li>
 *   <li>GET    /api/v1/properties/{id}/activities    – activity timeline</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
@Validated
public class PropertyController {

    private final PropertyService propertyService;
    private final PropertyRepository propertyRepository;
    private final ActivityService activityService;

    // ── POST /api/v1/properties ───────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InternalPropertyDTO> create(
            @Valid @RequestBody CreatePropertyRequest request,
            Authentication authentication) {

        InternalPropertyDTO created = propertyService.create(request, authentication.getName());
        return ApiResponse.ok(created, "Property created");
    }

    // ── GET /api/v1/properties ────────────────────────────────────────────────

    @GetMapping
    public ApiResponse<PagedResponse<PropertySummaryDTO>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PropertyStatus status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String neighborhood,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Short bedrooms,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        Page<PropertySummaryDTO> result = propertyService.list(
                search, status, featured, city, neighborhood,
                minPrice, maxPrice, bedrooms, propertyType, amenities, page, size);

        return ApiResponse.ok(new PagedResponse<>(result));
    }

    // ── GET /api/v1/properties/{id} ───────────────────────────────────────────

    @GetMapping("/{id}")
    public ApiResponse<InternalPropertyDTO> getById(@PathVariable UUID id) {
        return ApiResponse.ok(propertyService.getById(id));
    }

    // ── PATCH /api/v1/properties/{id} ─────────────────────────────────────────

    @PatchMapping("/{id}")
    public ApiResponse<InternalPropertyDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePropertyRequest request,
            Authentication authentication) {

        InternalPropertyDTO updated = propertyService.update(id, request, authentication.getName());
        return ApiResponse.ok(updated, "Property updated");
    }

    // ── POST /api/v1/properties/{id}/publish ─────────────────────────────────

    @PostMapping("/{id}/publish")
    public ApiResponse<InternalPropertyDTO> publish(
            @PathVariable UUID id,
            Authentication authentication) {

        InternalPropertyDTO updated = propertyService.publish(id, authentication.getName());
        return ApiResponse.ok(updated, "Property published");
    }

    // ── POST /api/v1/properties/{id}/unpublish ────────────────────────────────

    @PostMapping("/{id}/unpublish")
    public ApiResponse<InternalPropertyDTO> unpublish(
            @PathVariable UUID id,
            Authentication authentication) {

        InternalPropertyDTO updated = propertyService.unpublish(id, authentication.getName());
        return ApiResponse.ok(updated, "Property unpublished");
    }

    // ── POST /api/v1/properties/{id}/archive ─────────────────────────────────

    @PostMapping("/{id}/archive")
    public ApiResponse<InternalPropertyDTO> archive(
            @PathVariable UUID id,
            Authentication authentication) {

        InternalPropertyDTO updated = propertyService.archive(id, authentication.getName());
        return ApiResponse.ok(updated, "Property archived");
    }

    // ── GET /api/v1/properties/{id}/activities ────────────────────────────────

    @GetMapping("/{id}/activities")
    public ApiResponse<List<ActivityDTO>> getActivities(@PathVariable UUID id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Property not found: " + id);
        }
        return ApiResponse.ok(activityService.getPropertyTimeline(id));
    }
}
