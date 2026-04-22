package com.localapartmentexperts.crm.user.dto;

import com.localapartmentexperts.crm.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 1) String firstName,
        @Size(min = 1) String lastName,
        @Email String email,
        UserRole role,
        String language,
        Boolean active
) {}
