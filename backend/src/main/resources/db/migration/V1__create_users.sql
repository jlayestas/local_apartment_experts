-- ─────────────────────────────────────────────────────────────────────────────
-- V1 · users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users
(
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    -- ADMIN can manage employees; AGENT works leads
    role          VARCHAR(20)  NOT NULL DEFAULT 'AGENT',
    -- UI locale for this employee; distinct from leads.language_preference
    language      VARCHAR(10)  NOT NULL DEFAULT 'es',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'AGENT')),
    CONSTRAINT chk_users_language CHECK (char_length(language) >= 2)
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_is_active ON users (is_active) WHERE is_active = TRUE;
