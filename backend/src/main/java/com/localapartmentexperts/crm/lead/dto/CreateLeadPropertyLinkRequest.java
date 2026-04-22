package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.lead.LeadPropertyLinkType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateLeadPropertyLinkRequest(

        @NotNull(message = "Property ID is required")
        UUID propertyId,

        @NotNull(message = "Link type is required")
        LeadPropertyLinkType linkType,

        /** Optional agent note (e.g. why this property was suggested, or tour feedback). */
        String note

) {}
