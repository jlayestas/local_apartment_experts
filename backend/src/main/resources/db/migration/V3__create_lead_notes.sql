-- ─────────────────────────────────────────────────────────────────────────────
-- V3 · lead_notes
-- Notes are append-only — no UPDATE or DELETE in v1.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE lead_notes
(
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    lead_id    UUID        NOT NULL,
    author_id  UUID        NOT NULL,
    body       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_lead_notes PRIMARY KEY (id),
    CONSTRAINT fk_notes_lead
        FOREIGN KEY (lead_id)   REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_notes_author
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_notes_body_not_empty CHECK (char_length(trim(body)) > 0)
);

-- Timeline query: all notes for a lead, newest first
CREATE INDEX idx_lead_notes_lead_timeline ON lead_notes (lead_id, created_at DESC);
