package com.localapartmentexperts.crm.property.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Partial update payload for PATCH /properties/{id}.
 *
 * <p>Null means "leave unchanged". Send only the fields you want to modify.
 * A non-null value always overwrites the stored value.
 *
 * <p>Uses a plain class (not a record) so all fields default to null and absent
 * JSON keys deserialize to null.
 */
@Getter
@Setter
@NoArgsConstructor
public class UpdatePropertyRequest {

    @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
    String title;

    @Size(max = 200, message = "Slug must not exceed 200 characters")
    @Pattern(regexp = "^[a-z0-9]([a-z0-9-]*[a-z0-9])?$",
             message = "Slug may only contain lowercase letters, digits, and hyphens")
    String slug;

    String description;
    String internalNotes;

    // Location
    @Size(min = 1, max = 300, message = "Address line 1 must not exceed 300 characters")
    String addressLine1;

    @Size(max = 300, message = "Address line 2 must not exceed 300 characters")
    String addressLine2;

    @Size(max = 100, message = "Neighborhood must not exceed 100 characters")
    String neighborhood;

    @Size(min = 1, max = 100, message = "City must not exceed 100 characters")
    String city;

    @Size(min = 1, max = 100, message = "State must not exceed 100 characters")
    String state;

    @Size(max = 20, message = "Zip code must not exceed 20 characters")
    String zipCode;

    @DecimalMin(value = "-90", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90", message = "Latitude must be between -90 and 90")
    BigDecimal latitude;

    @DecimalMin(value = "-180", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180", message = "Longitude must be between -180 and 180")
    BigDecimal longitude;

    // Pricing
    @DecimalMin(value = "0", message = "Price must be non-negative")
    BigDecimal price;

    @Pattern(regexp = "^(MONTHLY|WEEKLY|DAILY|ONCE)$",
             message = "Price frequency must be MONTHLY, WEEKLY, DAILY, or ONCE")
    String priceFrequency;

    // Property details
    @Pattern(regexp = "^(APARTMENT|HOUSE|STUDIO|CONDO|TOWNHOUSE|COMMERCIAL|OTHER)$",
             message = "Property type must be one of: APARTMENT, HOUSE, STUDIO, CONDO, TOWNHOUSE, COMMERCIAL, OTHER")
    String propertyType;

    @Min(value = 0, message = "Bedrooms must be non-negative")
    @Max(value = 99, message = "Bedrooms must not exceed 99")
    Short bedrooms;

    @Min(value = 0, message = "Bathrooms must be non-negative")
    @Max(value = 99, message = "Bathrooms must not exceed 99")
    Short bathrooms;

    @DecimalMin(value = "0", message = "Square feet must be non-negative")
    BigDecimal squareFeet;

    LocalDate availableDate;

    Boolean featured;

    // Features & policies
    String[] amenities;

    @Pattern(regexp = "^(ALLOWED|NOT_ALLOWED|NEGOTIABLE)$",
             message = "Pet policy must be ALLOWED, NOT_ALLOWED, or NEGOTIABLE")
    String petPolicy;

    String parkingInfo;

    // Sourcing
    @Size(max = 100, message = "External reference ID must not exceed 100 characters")
    String externalReferenceId;

    @Size(max = 100, message = "Source company must not exceed 100 characters")
    String sourceCompany;

    // Contact
    UUID listingAgentId;

    @Size(max = 30, message = "Contact phone must not exceed 30 characters")
    String contactPhone;

    @Size(max = 30, message = "Contact WhatsApp must not exceed 30 characters")
    String contactWhatsapp;

    // Public ordering
    Integer publicSortOrder;
}
