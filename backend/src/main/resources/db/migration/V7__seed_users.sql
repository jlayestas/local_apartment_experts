-- ─────────────────────────────────────────────────────────────────────────────
-- V7 · seed_users
-- Local development credentials — DO NOT use in production.
--
-- admin@localapartmentexperts.com   / Admin1234!
-- maria.garcia@localapartmentexperts.com  / Employee1234!
-- carlos.rodriguez@localapartmentexperts.com / Employee1234!
--
-- Hashes generated with BCryptPasswordEncoder(10).
-- Fixed UUIDs allow V8 seed leads to reference these rows by ID.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (id, first_name, last_name, email, password_hash, role, language, is_active)
VALUES
    -- Admin
    (
        '00000000-0000-0000-0000-000000000001',
        'Admin',
        'CRM',
        'admin@localapartmentexperts.com',
        '$2a$10$gN/eyp/49Afzehtk1Wv3zeyUFBEZdG65D7dzFkKtvgiEpOnzOoLm6',
        'ADMIN',
        'es',
        TRUE
    ),
    -- Agent 1
    (
        '00000000-0000-0000-0000-000000000002',
        'María',
        'García',
        'maria.garcia@localapartmentexperts.com',
        '$2a$10$BIRMkEJ7ziDx/7Edkg7qFu7OadeVckhFroHWJwGq/om1cM5y/bghm',
        'AGENT',
        'es',
        TRUE
    ),
    -- Agent 2
    (
        '00000000-0000-0000-0000-000000000003',
        'Carlos',
        'Rodríguez',
        'carlos.rodriguez@localapartmentexperts.com',
        '$2a$10$BIRMkEJ7ziDx/7Edkg7qFu7OadeVckhFroHWJwGq/om1cM5y/bghm',
        'AGENT',
        'es',
        TRUE
    );
