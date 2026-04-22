-- ─────────────────────────────────────────────────────────────────────────────
-- V10 · Add LEAD_UPDATED to activities.activity_type check constraint
-- Needed to record generic lead field updates (phone, email, neighborhoods, etc.)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE activities
    DROP CONSTRAINT chk_activities_type;

ALTER TABLE activities
    ADD CONSTRAINT chk_activities_type CHECK (activity_type IN (
        'LEAD_CREATED',
        'LEAD_UPDATED',
        'STATUS_CHANGED',
        'NOTE_ADDED',
        'ASSIGNED',
        'FOLLOW_UP_SET',
        'CONTACT_METHOD_UPDATED'
    ));
