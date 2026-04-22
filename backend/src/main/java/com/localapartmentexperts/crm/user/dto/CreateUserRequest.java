package com.localapartmentexperts.crm.user.dto;

import com.localapartmentexperts.crm.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String password,
        @NotNull UserRole role,
        String language
) {}
