package com.localapartmentexperts.crm.user;

import com.localapartmentexperts.crm.common.entity.BaseEntity;
import com.localapartmentexperts.crm.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    /**
     * UI locale for this employee (e.g. "es", "en").
     * Distinct from leads.language_preference, which is about the lead's communication language.
     */
    @Column(nullable = false, length = 10)
    private String language;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    /** Nullable — NULL means the user has never logged in. Updated on every successful login. */
    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
