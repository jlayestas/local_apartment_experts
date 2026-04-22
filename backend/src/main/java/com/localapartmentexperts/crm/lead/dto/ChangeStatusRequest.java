package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.common.enums.LeadStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(

        @NotNull(message = "Status is required")
        LeadStatus status,

        /** Optional free-text reason stored in lead_status_history.note. */
        String note

) {}
