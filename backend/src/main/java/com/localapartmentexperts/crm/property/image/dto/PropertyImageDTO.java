package com.localapartmentexperts.crm.property.image.dto;

import com.localapartmentexperts.crm.property.image.PropertyImage;

import java.time.Instant;
import java.util.UUID;

/**
 * Read-only projection of a {@link PropertyImage} sent to the frontend.
 *
 * <p>{@code storageKey} is intentionally omitted — it is an internal implementation
 * detail that clients do not need.
 */
public record PropertyImageDTO(
        UUID id,
        UUID propertyId,
        String imageUrl,
        String altText,
        int sortOrder,
        boolean cover,
        Instant createdAt
) {
    public static PropertyImageDTO from(PropertyImage image) {
        return new PropertyImageDTO(
                image.getId(),
                image.getProperty().getId(),
                image.getImageUrl(),
                image.getAltText(),
                image.getSortOrder(),
                image.isCover(),
                image.getCreatedAt()
        );
    }
}
