package com.localapartmentexperts.crm.common.init;

import com.localapartmentexperts.crm.common.enums.UserRole;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Seeds a default admin user on first startup when the users table is empty.
 * Only runs in non-test profiles.
 *
 * Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD env vars before first deploy.
 * If ADMIN_SEED_PASSWORD is not set, a secure random password is generated and
 * printed once to the startup logs — copy it immediately, it is never shown again.
 */
@Slf4j
@Component
@Profile("!test")
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed-email:admin@localapartmentexperts.com}")
    private String adminEmail;

    @Value("${app.admin.seed-password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        boolean generated = false;
        String password = adminPassword;
        if (password == null || password.isBlank()) {
            password = generateSecurePassword();
            generated = true;
        }

        User admin = User.builder()
                .firstName("Admin")
                .lastName("CRM")
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(password))
                .role(UserRole.ADMIN)
                .language("es")
                .active(true)
                .build();

        userRepository.save(admin);

        log.warn("=================================================================");
        log.warn("  Admin account created: {}", adminEmail);
        if (generated) {
            log.warn("  ADMIN_SEED_PASSWORD was not set — generated password: {}", password);
            log.warn("  Copy this now. It will NOT be shown again.");
        } else {
            log.warn("  Password set from ADMIN_SEED_PASSWORD env var.");
        }
        log.warn("  Change the password after first login.");
        log.warn("=================================================================");
    }

    private String generateSecurePassword() {
        byte[] bytes = new byte[18];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
