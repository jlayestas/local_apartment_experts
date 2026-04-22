package com.localapartmentexperts.crm.user.dto;

import com.localapartmentexperts.crm.common.enums.UserRole;
import com.localapartmentexperts.crm.user.User;

import java.util.UUID;

/**
 * Lightweight user projection used by the assignment dropdown and the activity timeline.
 * Never exposes password_hash, last_login_at, or audit timestamps.
 */
public record UserSummaryDTO(
        UUID id,
        String firstName,
        String lastName,
        UserRole role
) {
    public static UserSummaryDTO from(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }
}
