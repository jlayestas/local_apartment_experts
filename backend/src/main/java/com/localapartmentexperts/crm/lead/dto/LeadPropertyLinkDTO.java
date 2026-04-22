package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.lead.LeadPropertyLink;
import com.localapartmentexperts.crm.lead.LeadPropertyLinkType;
import com.localapartmentexperts.crm.property.dto.PropertySummaryDTO;
import com.localapartmentexperts.crm.user.User;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for a {@link LeadPropertyLink}.
 * Embeds a {@link PropertySummaryDTO} so the caller gets property details
 * without a separate round-trip.
 */
public record LeadPropertyLinkDTO(
        UUID id,
        UUID leadId,
        PropertySummaryDTO property,
        LeadPropertyLinkType linkType,
        String note,
        UUID createdByUserId,
        String createdByUserName,
        Instant createdAt
) {

    public static LeadPropertyLinkDTO from(LeadPropertyLink link) {
        User createdBy = link.getCreatedBy();
        return new LeadPropertyLinkDTO(
                link.getId(),
                link.getLead().getId(),
                link.getProperty() != null ? PropertySummaryDTO.from(link.getProperty()) : null,
                link.getLinkType(),
                link.getNote(),
                createdBy != null ? createdBy.getId() : null,
                createdBy != null ? createdBy.getFirstName() + " " + createdBy.getLastName() : null,
                link.getCreatedAt()
        );
    }
}
