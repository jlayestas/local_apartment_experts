-- ─────────────────────────────────────────────────────────────────────────────
-- V13 · lead_property_links
--
-- Records the relationship between a lead and a specific property.
-- Agents use this to suggest listings to leads, track interest, log tours,
-- and record rejections.
--
-- Link types:
--   SUGGESTED  – an agent proposed this property to the lead
--   INTERESTED – the lead expressed interest (self-reported or agent-noted)
--   TOURED     – the lead visited the property in person or virtually
--   REJECTED   – the lead declined this property
--
-- Each (lead_id, property_id, link_type) triple is unique: a lead cannot be
-- SUGGESTED the same property twice, but a property can go from SUGGESTED →
-- INTERESTED → TOURED as separate rows in chronological order.
--
-- Properties use ON DELETE SET NULL so that archiving a property does not
-- destroy the link history. Leads use ON DELETE CASCADE so that deleting a
-- lead removes all their link records.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE lead_property_links
(
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    lead_id     UUID        NOT NULL,
    property_id UUID        NOT NULL,

    link_type   VARCHAR(20) NOT NULL,

    -- Optional agent note about why this link was created or what the outcome was.
    note        TEXT,

    -- The employee who created this link record.
    created_by_user_id UUID,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ── Constraints ───────────────────────────────────────────────────────────

    CONSTRAINT pk_lead_property_links PRIMARY KEY (id),

    CONSTRAINT fk_links_lead
        FOREIGN KEY (lead_id)     REFERENCES leads      (id) ON DELETE CASCADE,
    CONSTRAINT fk_links_property
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE SET NULL,
    CONSTRAINT fk_links_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,

    CONSTRAINT chk_links_type
        CHECK (link_type IN ('SUGGESTED', 'INTERESTED', 'TOURED', 'REJECTED')),

    -- A note, if provided, must contain actual content (not just whitespace).
    CONSTRAINT chk_links_note_not_empty
        CHECK (note IS NULL OR char_length(trim(note)) > 0),

    -- Prevent duplicate link-type records for the same lead + property pair.
    CONSTRAINT uq_lead_property_link_type
        UNIQUE (lead_id, property_id, link_type)
);

-- ── Lead-property link indexes ─────────────────────────────────────────────

-- Primary: all properties linked to a lead (lead detail → suggested properties panel)
CREATE INDEX idx_links_lead
    ON lead_property_links (lead_id, created_at DESC);

-- Reverse: all leads linked to a property (property detail → interested leads panel)
CREATE INDEX idx_links_property
    ON lead_property_links (property_id, created_at DESC)
    WHERE property_id IS NOT NULL;

-- Filter by type within a lead's links (e.g. "show me all toured properties for this lead")
CREATE INDEX idx_links_lead_type
    ON lead_property_links (lead_id, link_type, created_at DESC);

-- Audit: all links created by a specific agent
CREATE INDEX idx_links_created_by
    ON lead_property_links (created_by_user_id, created_at DESC)
    WHERE created_by_user_id IS NOT NULL;

COMMENT ON TABLE lead_property_links IS
    'Tracks the evolving relationship between a lead and a property (suggested, interested, toured, rejected).';

COMMENT ON COLUMN lead_property_links.link_type IS
    'Stage of the relationship: SUGGESTED → INTERESTED → TOURED → REJECTED (any order; all stages optional).';

COMMENT ON COLUMN lead_property_links.note IS
    'Agent note about this link, e.g. reason for rejection or feedback after a tour.';
