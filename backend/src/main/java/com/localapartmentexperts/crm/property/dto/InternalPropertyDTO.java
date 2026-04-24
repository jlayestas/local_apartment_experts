package com.localapartmentexperts.crm.property.dto;

import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.property.PropertyStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Full property projection for authenticated internal (employee) endpoints.
 *
 * <p>Identical to {@link PropertyDTO} but includes {@code internalNotes}, which
 * contains private agent remarks that must never appear on public-facing responses.
 *
 * <p>Use this DTO for all responses from {@code PropertyController}.
 * {@code PropertyPublicController} continues to use {@link PropertyDTO}, which
 * intentionally omits {@code internalNotes}.
 */
public record InternalPropertyDTO(
        UUID id,

        // Content
        String title,
        String slug,
        String referenceCode,
        String description,
        String internalNotes,   // exposed to internal users only

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

        // Public ordering
        Integer publicSortOrder
) {

    public static InternalPropertyDTO from(Property p) {
        return new InternalPropertyDTO(
                p.getId(),

                p.getTitle(),
                p.getSlug(),
                p.getReferenceCode(),
                p.getDescription(),
                p.getInternalNotes(),

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

                p.getPublicSortOrder()
        );
    }
}
