-- ─────────────────────────────────────────────────────────────────────────────
-- V14 · Extend activities table to support property events
--
-- Changes:
--   1. Makes lead_id nullable (property events don't belong to a lead)
--   2. Adds nullable property_id FK to properties
--   3. Adds CHECK to ensure every row is linked to either a lead or a property
--   4. Extends activity_type CHECK constraint with five new property event types
--   5. Adds a property timeline index
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Allow lead_id to be NULL for property-only events
ALTER TABLE activities
    ALTER COLUMN lead_id DROP NOT NULL;

-- 2. Add property_id column with FK (SET NULL on property delete preserves history)
ALTER TABLE activities
    ADD COLUMN property_id UUID;

ALTER TABLE activities
    ADD CONSTRAINT fk_activities_property
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE SET NULL;

-- 3. Every event must belong to at least one subject
ALTER TABLE activities
    ADD CONSTRAINT chk_activities_subject
        CHECK (lead_id IS NOT NULL OR property_id IS NOT NULL);

-- 4. Extend the allowed activity_type values
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
        'PROPERTY_ARCHIVED'
    ));

-- 5. Index for property timeline queries (property detail → activity feed)
CREATE INDEX idx_activities_property_timeline
    ON activities (property_id, created_at DESC)
    WHERE property_id IS NOT NULL;

COMMENT ON COLUMN activities.lead_id IS
    'Lead this event belongs to. NULL for property-only events.';

COMMENT ON COLUMN activities.property_id IS
    'Property this event belongs to. NULL for lead-only events.';
