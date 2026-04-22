package com.localapartmentexperts.crm.auth.dto;

import com.localapartmentexperts.crm.common.enums.UserRole;
import com.localapartmentexperts.crm.user.User;

import java.util.UUID;

/**
 * Authenticated user summary returned by POST /auth/login and GET /auth/me.
 * Does not include password_hash, last_login_at, or internal audit fields.
 */
public record AuthUserDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        UserRole role,
        String language
) {
    public static AuthUserDTO from(User user) {
        return new AuthUserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getLanguage()
        );
    }
}
