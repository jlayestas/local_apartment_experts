-- ─────────────────────────────────────────────────────────────────────────────
-- V9 · add last_login_at to users
-- Nullable: NULL means the user has never logged in.
-- Set on every successful authentication in AuthService.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE users
    ADD COLUMN last_login_at TIMESTAMPTZ;
