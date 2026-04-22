-- ─────────────────────────────────────────────────────────────────────────────
-- V15 · Add lead-property link activity types
--
-- Extends the activity_type CHECK constraint to record when a property
-- is linked to a lead or when an existing link is updated.
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
        'PROPERTY_LINK_UPDATED'
    ));
