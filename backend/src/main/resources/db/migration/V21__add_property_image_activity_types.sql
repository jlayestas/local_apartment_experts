-- ─────────────────────────────────────────────────────────────────────────────
-- V21 · Add property image activity types
--
-- Extends the activity_type CHECK constraint with the four image management
-- events that the PropertyImageService records but were never added to the
-- constraint (causing a violation when reordering, uploading, or deleting images).
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
        'PROPERTY_UNLINKED',
        'PROPERTY_IMAGE_UPLOADED',
        'PROPERTY_IMAGE_DELETED',
        'PROPERTY_IMAGE_COVER_CHANGED',
        'PROPERTY_IMAGE_REORDERED'
    ));
