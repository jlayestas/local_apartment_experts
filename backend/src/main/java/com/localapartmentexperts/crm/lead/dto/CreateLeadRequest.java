package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.common.enums.ContactMethod;
import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.UrgencyLevel;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateLeadRequest(

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must not exceed 100 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must not exceed 100 characters")
        String lastName,

        @Email(message = "Email must be a valid address")
        @Size(max = 255, message = "Email must not exceed 255 characters")
        String email,

        @Size(max = 30, message = "Phone must not exceed 30 characters")
        String phone,

        @Size(max = 30, message = "WhatsApp number must not exceed 30 characters")
        String whatsappNumber,

        ContactMethod preferredContactMethod,

        LeadSource source,

        LocalDate moveInDate,

        @DecimalMin(value = "0", message = "Budget min must be non-negative")
        BigDecimal budgetMin,

        @DecimalMin(value = "0", message = "Budget max must be non-negative")
        BigDecimal budgetMax,

        List<String> preferredNeighborhoods,

        @Min(value = 0, message = "Bedroom count must be non-negative")
        @Max(value = 20, message = "Bedroom count must not exceed 20")
        Short bedroomCount,

        @Min(value = 0, message = "Bathroom count must be non-negative")
        @Max(value = 20, message = "Bathroom count must not exceed 20")
        Short bathroomCount,

        String message,

        @Size(max = 10, message = "Language preference must not exceed 10 characters")
        String languagePreference,

        UrgencyLevel urgencyLevel,

        LocalDate lastContactDate,

        LocalDate nextFollowUpDate,

        /** Nullable — lead may be created unassigned. */
        UUID assignedUserId

) {}
