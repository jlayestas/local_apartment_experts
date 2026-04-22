package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.common.enums.ContactMethod;
import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.common.enums.UrgencyLevel;
import com.localapartmentexperts.crm.lead.Lead;
import com.localapartmentexperts.crm.user.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/** Full lead projection returned on POST, GET /{id}, and PATCH /{id}. */
public record LeadDetailDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String whatsappNumber,
        ContactMethod preferredContactMethod,
        LeadSource source,
        LocalDate moveInDate,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        List<String> preferredNeighborhoods,
        Short bedroomCount,
        Short bathroomCount,
        String message,
        String languagePreference,
        UrgencyLevel urgencyLevel,
        LeadStatus status,
        LocalDate lastContactDate,
        LocalDate nextFollowUpDate,
        UUID assignedUserId,
        String assignedUserName,
        Instant createdAt,
        Instant updatedAt
) {

    public static LeadDetailDTO from(Lead lead) {
        User assignee = lead.getAssignedUser();
        return new LeadDetailDTO(
                lead.getId(),
                lead.getFirstName(),
                lead.getLastName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getWhatsappNumber(),
                lead.getPreferredContactMethod(),
                lead.getSource(),
                lead.getMoveInDate(),
                lead.getBudgetMin(),
                lead.getBudgetMax(),
                lead.getPreferredNeighborhoods() != null
                        ? Arrays.asList(lead.getPreferredNeighborhoods())
                        : List.of(),
                lead.getBedroomCount(),
                lead.getBathroomCount(),
                lead.getMessage(),
                lead.getLanguagePreference(),
                lead.getUrgencyLevel(),
                lead.getStatus(),
                lead.getLastContactDate(),
                lead.getNextFollowUpDate(),
                assignee != null ? assignee.getId() : null,
                assignee != null ? assignee.getFirstName() + " " + assignee.getLastName() : null,
                lead.getCreatedAt(),
                lead.getUpdatedAt()
        );
    }
}
