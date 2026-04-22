package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.common.enums.UrgencyLevel;
import com.localapartmentexperts.crm.lead.Lead;
import com.localapartmentexperts.crm.user.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Lightweight projection used in the leads list. Does not include free-text or array fields. */
public record LeadSummaryDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        LeadStatus status,
        LeadSource source,
        UrgencyLevel urgencyLevel,
        UUID assignedUserId,
        String assignedUserName,
        LocalDate nextFollowUpDate,
        Instant createdAt
) {

    public static LeadSummaryDTO from(Lead lead) {
        User assignee = lead.getAssignedUser();
        return new LeadSummaryDTO(
                lead.getId(),
                lead.getFirstName(),
                lead.getLastName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getStatus(),
                lead.getSource(),
                lead.getUrgencyLevel(),
                assignee != null ? assignee.getId() : null,
                assignee != null ? assignee.getFirstName() + " " + assignee.getLastName() : null,
                lead.getNextFollowUpDate(),
                lead.getCreatedAt()
        );
    }
}
