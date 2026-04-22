package com.localapartmentexperts.crm.lead.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateNoteRequest(

        @NotBlank(message = "Note body must not be blank")
        @Size(max = 10_000, message = "Note body must not exceed 10,000 characters")
        String body

) {}
