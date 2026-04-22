package com.localapartmentexperts.crm.lead.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignLeadRequest(

        /**
         * UUID of the active user to assign the lead to.
         * The service validates that the user exists and is active.
         */
        @NotNull(message = "assignedUserId is required")
        UUID assignedUserId

) {}
