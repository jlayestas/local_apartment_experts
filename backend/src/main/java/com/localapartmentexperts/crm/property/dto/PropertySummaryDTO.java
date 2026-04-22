package com.localapartmentexperts.crm.property.dto;

import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.property.PropertyStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight projection of a {@link Property} for paginated list responses.
 * Omits large text fields (description, internalNotes, parkingInfo, amenities)
 * that are only needed on the detail view.
 */
public record PropertySummaryDTO(
        UUID id,
        String title,
        String slug,

        String neighborhood,
        String city,
        String state,

        BigDecimal price,
        String priceFrequency,

        String propertyType,
        Short bedrooms,
        Short bathrooms,
        BigDecimal squareFeet,

        PropertyStatus status,
        boolean featured,

        String contactPhone,
        Instant createdAt,
        Instant publishedAt,

        String coverImageUrl
) {

    public static PropertySummaryDTO from(Property p) {
        return from(p, null);
    }

    public static PropertySummaryDTO from(Property p, String coverImageUrl) {
        return new PropertySummaryDTO(
                p.getId(),
                p.getTitle(),
                p.getSlug(),

                p.getNeighborhood(),
                p.getCity(),
                p.getState(),

                p.getPrice(),
                p.getPriceFrequency(),

                p.getPropertyType(),
                p.getBedrooms(),
                p.getBathrooms(),
                p.getSquareFeet(),

                p.getStatus(),
                p.isFeatured(),

                p.getContactPhone(),
                p.getCreatedAt(),
                p.getPublishedAt(),

                coverImageUrl
        );
    }
}
