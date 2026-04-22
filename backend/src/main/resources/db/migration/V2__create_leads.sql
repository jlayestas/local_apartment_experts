-- ─────────────────────────────────────────────────────────────────────────────
-- V2 · leads
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE leads
(
    id                       UUID           NOT NULL DEFAULT gen_random_uuid(),

    -- Contact info
    first_name               VARCHAR(100)   NOT NULL,
    last_name                VARCHAR(100)   NOT NULL,
    email                    VARCHAR(255),
    phone                    VARCHAR(30),
    whatsapp_number          VARCHAR(30),
    preferred_contact_method VARCHAR(20),

    -- Origin
    source                   VARCHAR(50),

    -- Preferences
    move_in_date             DATE,
    budget_min               NUMERIC(12, 2),
    budget_max               NUMERIC(12, 2),
    preferred_neighborhoods  TEXT[],
    bedroom_count            SMALLINT,
    bathroom_count           SMALLINT,
    message                  TEXT,

    -- Metadata
    -- language the lead uses for communication — separate from users.language (UI locale)
    language_preference      VARCHAR(10)    NOT NULL DEFAULT 'es',
    urgency_level            VARCHAR(20)    NOT NULL DEFAULT 'MEDIUM',
    status                   VARCHAR(40)    NOT NULL DEFAULT 'NEW',

    -- Follow-up tracking
    last_contact_date        DATE,
    next_follow_up_date      DATE,

    -- Assignment
    assigned_user_id         UUID,

    created_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_leads PRIMARY KEY (id),
    CONSTRAINT fk_leads_assigned_user
        FOREIGN KEY (assigned_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_leads_status CHECK (status IN (
        'NEW', 'CONTACT_ATTEMPTED', 'CONTACTED', 'QUALIFIED',
        'APPOINTMENT_SCHEDULED', 'APPLICATION_IN_PROGRESS',
        'CLOSED_WON', 'CLOSED_LOST', 'UNRESPONSIVE'
    )),
    CONSTRAINT chk_leads_urgency CHECK (urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_leads_contact_method CHECK (
        preferred_contact_method IS NULL
        OR preferred_contact_method IN ('EMAIL', 'PHONE', 'WHATSAPP')
    ),
    CONSTRAINT chk_leads_source CHECK (
        source IS NULL
        OR source IN ('WEBSITE', 'REFERRAL', 'FACEBOOK', 'WALKIN', 'OTHER')
    ),
    CONSTRAINT chk_leads_budget_range CHECK (
        budget_max IS NULL OR budget_min IS NULL OR budget_max >= budget_min
    ),
    CONSTRAINT chk_leads_bedroom_count CHECK (bedroom_count IS NULL OR bedroom_count > 0),
    CONSTRAINT chk_leads_bathroom_count CHECK (bathroom_count IS NULL OR bathroom_count > 0)
);

-- ── Lead list filter indexes ───────────────────────────────────────────────
-- Single-column indexes used by individual filter params
CREATE INDEX idx_leads_status          ON leads (status);
CREATE INDEX idx_leads_assigned_user   ON leads (assigned_user_id);
CREATE INDEX idx_leads_urgency         ON leads (urgency_level);
CREATE INDEX idx_leads_source          ON leads (source);
CREATE INDEX idx_leads_created_at      ON leads (created_at DESC);

-- Composite: status + assignment — the two most common combined filters
CREATE INDEX idx_leads_status_assigned ON leads (status, assigned_user_id);

-- Dashboard queries: due today / overdue
-- WHERE next_follow_up_date <= :today AND status NOT IN ('CLOSED_WON','CLOSED_LOST')
CREATE INDEX idx_leads_follow_up_status ON leads (next_follow_up_date, status)
    WHERE next_follow_up_date IS NOT NULL;

-- Dashboard: unassigned leads
CREATE INDEX idx_leads_unassigned ON leads (created_at DESC)
    WHERE assigned_user_id IS NULL;
