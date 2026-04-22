-- ─────────────────────────────────────────────────────────────────────────────
-- V5 · lead_assignments
-- Immutable log of every assignment change on a lead.
-- The *current* assignment is always leads.assigned_user_id (source of truth).
-- This table provides the full history: who assigned whom, and when.
-- assigned_to_id = NULL means the lead was explicitly unassigned.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE lead_assignments
(
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    lead_id         UUID        NOT NULL,
    -- The employee the lead was assigned to (NULL = unassigned)
    assigned_to_id  UUID,
    -- The employee who performed the assignment action
    assigned_by_id  UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_lead_assignments PRIMARY KEY (id),
    CONSTRAINT fk_assignments_lead
        FOREIGN KEY (lead_id)          REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_assigned_to
        FOREIGN KEY (assigned_to_id)   REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_assignments_assigned_by
        FOREIGN KEY (assigned_by_id)   REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_assignments_no_self_assign CHECK (
        assigned_to_id IS NULL OR assigned_to_id <> assigned_by_id
        -- Admins assigning to themselves is allowed; this check is informational,
        -- enforcement handled in the service layer.
    )
);

-- Primary read pattern: full assignment history for a lead
CREATE INDEX idx_assignments_lead       ON lead_assignments (lead_id, created_at ASC);

-- Find all leads ever assigned to a specific agent
CREATE INDEX idx_assignments_assigned_to ON lead_assignments (assigned_to_id, created_at DESC)
    WHERE assigned_to_id IS NOT NULL;
