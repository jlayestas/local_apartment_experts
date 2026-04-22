package com.localapartmentexperts.crm.property;

import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.common.response.PagedResponse;
import com.localapartmentexperts.crm.property.dto.PropertyDTO;
import com.localapartmentexperts.crm.property.dto.PropertySummaryDTO;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Unauthenticated read-only endpoints for the public website.
 *
 * <ul>
 *   <li>GET /api/v1/public/properties          – paginated PUBLISHED listings</li>
 *   <li>GET /api/v1/public/properties/{slug}   – single PUBLISHED listing by slug</li>
 * </ul>
 *
 * These endpoints are explicitly permitted in {@link com.localapartmentexperts.crm.common.config.SecurityConfig}.
 * They only surface PUBLISHED properties and never expose internal_notes or draft/archived data.
 */
@RestController
@RequestMapping("/api/v1/public/properties")
@RequiredArgsConstructor
@Validated
public class PropertyPublicController {

    private final PropertyService propertyService;

    // ── GET /api/v1/public/properties ─────────────────────────────────────────

    @GetMapping
    public ApiResponse<PagedResponse<PropertySummaryDTO>> listPublished(
            @RequestParam(required = false) String search,
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

        Page<PropertySummaryDTO> result = propertyService.listPublished(
                search, featured, city, neighborhood,
                minPrice, maxPrice, bedrooms, propertyType, amenities, page, size);

        return ApiResponse.ok(new PagedResponse<>(result));
    }

    // ── GET /api/v1/public/properties/{slug} ──────────────────────────────────

    @GetMapping("/{slug}")
    public ApiResponse<PropertyDTO> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(propertyService.getPublishedBySlug(slug));
    }
}
