-- ─────────────────────────────────────────────────────────────────────────────
-- V6 · activities
-- Unified, immutable event timeline for a lead. This is the primary source
-- the UI reads to render the activity timeline component.
-- Every mutation on a lead (status change, note, assignment, follow-up update)
-- writes one row here. Structured counterparts (lead_status_history,
-- lead_assignments) provide queryable detail; this table provides ordering.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE activities
(
    id            UUID        NOT NULL DEFAULT gen_random_uuid(),
    lead_id       UUID        NOT NULL,
    -- The employee who triggered the event; NULL for system-generated events
    actor_id      UUID,
    activity_type VARCHAR(40) NOT NULL,
    -- Flexible payload; shape depends on activity_type:
    --   LEAD_CREATED          {}
    --   STATUS_CHANGED        {"from":"NEW","to":"CONTACTED"}
    --   NOTE_ADDED            {"noteId":"<uuid>","preview":"First 80 chars..."}
    --   ASSIGNED              {"assignedToId":"<uuid>","assignedToName":"Jane Doe"}
    --   FOLLOW_UP_SET         {"date":"2025-06-01"}
    --   CONTACT_METHOD_UPDATED{"from":"EMAIL","to":"WHATSAPP"}
    metadata      JSONB       NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_activities PRIMARY KEY (id),
    CONSTRAINT fk_activities_lead
        FOREIGN KEY (lead_id)   REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_activities_actor
        FOREIGN KEY (actor_id)  REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_activities_type CHECK (activity_type IN (
        'LEAD_CREATED',
        'STATUS_CHANGED',
        'NOTE_ADDED',
        'ASSIGNED',
        'FOLLOW_UP_SET',
        'CONTACT_METHOD_UPDATED'
    ))
);

-- ── Timeline query indexes ─────────────────────────────────────────────────
-- Primary: render timeline for one lead, newest first
CREATE INDEX idx_activities_lead_timeline ON activities (lead_id, created_at DESC);

-- Secondary: filter timeline by type (e.g. show only STATUS_CHANGED events)
CREATE INDEX idx_activities_type ON activities (lead_id, activity_type, created_at DESC);

-- Audit: all actions performed by a specific employee
CREATE INDEX idx_activities_actor ON activities (actor_id, created_at DESC)
    WHERE actor_id IS NOT NULL;
