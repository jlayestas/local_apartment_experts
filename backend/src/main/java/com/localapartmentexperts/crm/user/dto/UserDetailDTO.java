package com.localapartmentexperts.crm.user.dto;

import com.localapartmentexperts.crm.common.enums.UserRole;
import com.localapartmentexperts.crm.user.User;

import java.time.Instant;
import java.util.UUID;

/** Full user projection for admin management views. Never exposes password_hash. */
public record UserDetailDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        UserRole role,
        String language,
        boolean active,
        Instant lastLoginAt,
        Instant createdAt
) {
    public static UserDetailDTO from(User user) {
        return new UserDetailDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getLanguage(),
                user.isActive(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }
}
