package com.localapartmentexperts.crm.lead.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Minimal payload accepted by the unauthenticated public lead creation endpoint.
 * Source is always set to WEBSITE by the backend — callers cannot override it.
 */
public record PublicInquiryRequest(

        @NotBlank(message = "El nombre es requerido")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "El apellido es requerido")
        @Size(max = 100)
        String lastName,

        @NotBlank(message = "El teléfono es requerido")
        @Size(max = 30)
        String phone,

        @Email(message = "Correo electrónico inválido")
        @Size(max = 255)
        String email,

        @Size(max = 2000)
        String message

) {}
