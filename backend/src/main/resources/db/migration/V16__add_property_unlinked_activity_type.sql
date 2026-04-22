-- ─────────────────────────────────────────────────────────────────────────────
-- V16 · Add PROPERTY_UNLINKED activity type
--
-- Extends the activity_type CHECK constraint so that removing a property
-- link from a lead can be recorded in the audit trail.
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
        'CONTACT_METHOD_UPDATED',
        'PROPERTY_CREATED',
        'PROPERTY_UPDATED',
        'PROPERTY_PUBLISHED',
        'PROPERTY_UNPUBLISHED',
        'PROPERTY_ARCHIVED',
        'PROPERTY_LINKED',
        'PROPERTY_LINK_UPDATED',
        'PROPERTY_UNLINKED'
    ));
