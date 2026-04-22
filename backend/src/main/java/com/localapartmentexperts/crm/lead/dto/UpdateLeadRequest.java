package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.common.enums.ContactMethod;
import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.common.enums.UrgencyLevel;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Partial update payload for PATCH /leads/{id}.
 *
 * <p>Semantics: any field that is {@code null} in the deserialized object is
 * treated as "leave unchanged". Callers should send only the fields they intend
 * to modify. A non-null field always overwrites the stored value.
 *
 * <p>Uses a plain class (not a record) so that all fields default to {@code null}
 * and absent JSON keys map to {@code null} after deserialization.
 */
@Getter
@Setter
@NoArgsConstructor
public class UpdateLeadRequest {

    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    String firstName;

    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    String lastName;

    @Email(message = "Email must be a valid address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    String email;

    @Size(max = 30, message = "Phone must not exceed 30 characters")
    String phone;

    @Size(max = 30, message = "WhatsApp number must not exceed 30 characters")
    String whatsappNumber;

    ContactMethod preferredContactMethod;

    LeadSource source;

    LocalDate moveInDate;

    @DecimalMin(value = "0", message = "Budget min must be non-negative")
    BigDecimal budgetMin;

    @DecimalMin(value = "0", message = "Budget max must be non-negative")
    BigDecimal budgetMax;

    List<String> preferredNeighborhoods;

    @Min(value = 0, message = "Bedroom count must be non-negative")
    @Max(value = 20, message = "Bedroom count must not exceed 20")
    Short bedroomCount;

    @Min(value = 0, message = "Bathroom count must be non-negative")
    @Max(value = 20, message = "Bathroom count must not exceed 20")
    Short bathroomCount;

    String message;

    @Size(max = 10, message = "Language preference must not exceed 10 characters")
    String languagePreference;

    UrgencyLevel urgencyLevel;

    LeadStatus status;

    LocalDate lastContactDate;

    LocalDate nextFollowUpDate;

    /** Set to a user UUID to (re-)assign; the service resolves and validates the user. */
    UUID assignedUserId;

    /** When true, explicitly clears nextFollowUpDate to null regardless of the nextFollowUpDate field. */
    Boolean clearNextFollowUpDate;
}
