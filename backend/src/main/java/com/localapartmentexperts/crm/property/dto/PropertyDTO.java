package com.localapartmentexperts.crm.property.dto;

import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.property.PropertyStatus;
import com.localapartmentexperts.crm.property.image.dto.PropertyImageDTO;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Read-only projection of a {@link Property} for API responses.
 * All fields map 1-to-1 with the properties table.
 */
public record PropertyDTO(
        UUID id,

        // Content
        String title,
        String slug,
        String description,
        // internal_notes intentionally omitted from this DTO.
        // Add an InternalPropertyDTO when admin endpoints need it.

        // Location
        String addressLine1,
        String addressLine2,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        BigDecimal latitude,
        BigDecimal longitude,

        // Pricing
        BigDecimal price,
        String priceFrequency,

        // Property details
        String propertyType,
        Short bedrooms,
        Short bathrooms,
        BigDecimal squareFeet,
        LocalDate availableDate,

        // Publishing
        PropertyStatus status,
        boolean featured,

        // Features & policies
        String[] amenities,
        String petPolicy,
        String parkingInfo,

        // Sourcing
        String externalReferenceId,
        String sourceCompany,

        // Contact
        UUID listingAgentId,
        String listingAgentName,
        String contactPhone,
        String contactWhatsapp,

        // Timestamps
        Instant createdAt,
        Instant updatedAt,
        Instant publishedAt,
        Instant archivedAt,

        // Images
        List<PropertyImageDTO> images
) {

    public static PropertyDTO from(Property p) {
        return from(p, List.of());
    }

    public static PropertyDTO from(Property p, List<PropertyImageDTO> images) {
        return new PropertyDTO(
                p.getId(),

                p.getTitle(),
                p.getSlug(),
                p.getDescription(),

                p.getAddressLine1(),
                p.getAddressLine2(),
                p.getNeighborhood(),
                p.getCity(),
                p.getState(),
                p.getZipCode(),
                p.getLatitude(),
                p.getLongitude(),

                p.getPrice(),
                p.getPriceFrequency(),

                p.getPropertyType(),
                p.getBedrooms(),
                p.getBathrooms(),
                p.getSquareFeet(),
                p.getAvailableDate(),

                p.getStatus(),
                p.isFeatured(),

                p.getAmenities(),
                p.getPetPolicy(),
                p.getParkingInfo(),

                p.getExternalReferenceId(),
                p.getSourceCompany(),

                p.getListingAgent() != null ? p.getListingAgent().getId() : null,
                p.getListingAgent() != null
                        ? p.getListingAgent().getFirstName() + " " + p.getListingAgent().getLastName()
                        : null,
                p.getContactPhone(),
                p.getContactWhatsapp(),

                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getPublishedAt(),
                p.getArchivedAt(),

                images
        );
    }
}
