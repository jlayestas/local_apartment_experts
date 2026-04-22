-- ─────────────────────────────────────────────────────────────────────────────
-- V4 · lead_status_history
-- Immutable record of every status transition on a lead.
-- Complements the activities table: activities is the unified timeline shown
-- in the UI; this table enables structured queries (e.g. avg time per status,
-- funnel analysis) without parsing JSONB metadata.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE lead_status_history
(
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    lead_id     UUID        NOT NULL,
    -- NULL on the initial LEAD_CREATED record (no previous status)
    from_status VARCHAR(40),
    to_status   VARCHAR(40) NOT NULL,
    -- The employee who made the change; NULL for system-initiated transitions
    changed_by  UUID,
    -- Optional free-text reason recorded at the time of transition
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_lead_status_history PRIMARY KEY (id),
    CONSTRAINT fk_status_history_lead
        FOREIGN KEY (lead_id)     REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_status_history_changed_by
        FOREIGN KEY (changed_by)  REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_status_history_to_status CHECK (to_status IN (
        'NEW', 'CONTACT_ATTEMPTED', 'CONTACTED', 'QUALIFIED',
        'APPOINTMENT_SCHEDULED', 'APPLICATION_IN_PROGRESS',
        'CLOSED_WON', 'CLOSED_LOST', 'UNRESPONSIVE'
    )),
    CONSTRAINT chk_status_history_from_status CHECK (
        from_status IS NULL OR from_status IN (
            'NEW', 'CONTACT_ATTEMPTED', 'CONTACTED', 'QUALIFIED',
            'APPOINTMENT_SCHEDULED', 'APPLICATION_IN_PROGRESS',
            'CLOSED_WON', 'CLOSED_LOST', 'UNRESPONSIVE'
        )
    ),
    CONSTRAINT chk_status_history_no_self_transition CHECK (
        from_status IS NULL OR from_status <> to_status
    )
);

-- Primary read pattern: full history for a lead, oldest → newest
CREATE INDEX idx_status_history_lead ON lead_status_history (lead_id, created_at ASC);

-- Find all leads that ever reached a given status (for funnel queries)
CREATE INDEX idx_status_history_to_status ON lead_status_history (to_status, created_at);
