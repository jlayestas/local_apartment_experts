-- ─────────────────────────────────────────────────────────────────────────────
-- V11 · properties
--
-- A property is an apartment unit or listing managed by agents.
-- Lifecycle: DRAFT (internal only) → PUBLISHED (visible on website) → ARCHIVED.
-- Prefer ARCHIVED over hard delete so history is preserved.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE properties
(
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- ── Content ───────────────────────────────────────────────────────────────
    title       VARCHAR(200) NOT NULL,
    -- URL-friendly identifier; generated from title, must be globally unique.
    -- Pattern: lowercase alphanumeric and hyphens only.
    slug        VARCHAR(200) NOT NULL,
    description TEXT,
    -- Never exposed to the public website or leads. Agents only.
    internal_notes TEXT,

    -- ── Location ──────────────────────────────────────────────────────────────
    address_line_1 VARCHAR(300) NOT NULL,
    address_line_2 VARCHAR(300),
    neighborhood   VARCHAR(100),
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    zip_code       VARCHAR(20),
    -- WGS-84 decimal degrees; 6 decimal places ≈ 11 cm precision.
    latitude  NUMERIC(9, 6),
    longitude NUMERIC(9, 6),

    -- ── Pricing ───────────────────────────────────────────────────────────────
    price           NUMERIC(12, 2),
    -- How often the price repeats. NULL for one-time or unspecified.
    price_frequency VARCHAR(20),

    -- ── Property details ──────────────────────────────────────────────────────
    property_type  VARCHAR(30)   NOT NULL,
    bedrooms       SMALLINT,
    bathrooms      SMALLINT,
    square_feet    NUMERIC(8, 1),
    available_date DATE,

    -- ── Publishing / visibility ───────────────────────────────────────────────
    -- DRAFT    – internal only, not shown on the website.
    -- PUBLISHED– live on the public website.
    -- ARCHIVED – removed from the website; data retained.
    status   VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    featured BOOLEAN     NOT NULL DEFAULT FALSE,

    -- ── Features & policies ───────────────────────────────────────────────────
    -- Free-text array of amenities (e.g. 'Pool', 'Gym', 'Rooftop').
    -- Consistent with leads.preferred_neighborhoods (TEXT[]).
    amenities    TEXT[],
    pet_policy   VARCHAR(20),
    parking_info TEXT,

    -- ── Sourcing / external sync ──────────────────────────────────────────────
    -- Used when a property is imported from an external MLS or portal.
    external_reference_id VARCHAR(100),
    source_company        VARCHAR(100),

    -- ── Contact ───────────────────────────────────────────────────────────────
    -- The internal agent responsible for this listing.
    listing_agent_user_id UUID,
    -- Public-facing contact numbers shown on the website (may differ from agent).
    contact_phone     VARCHAR(30),
    contact_whatsapp  VARCHAR(30),

    -- ── Audit / lifecycle ─────────────────────────────────────────────────────
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Set when status transitions to PUBLISHED. Never cleared on re-draft.
    published_at TIMESTAMPTZ,
    -- Set when status transitions to ARCHIVED.
    archived_at  TIMESTAMPTZ,

    -- ── Constraints ───────────────────────────────────────────────────────────

    CONSTRAINT pk_properties PRIMARY KEY (id),
    CONSTRAINT uq_properties_slug UNIQUE (slug),

    CONSTRAINT fk_properties_listing_agent
        FOREIGN KEY (listing_agent_user_id) REFERENCES users (id) ON DELETE SET NULL,

    -- Slug must be lowercase alphanumeric with interior hyphens only.
    CONSTRAINT chk_properties_slug_format
        CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),

    CONSTRAINT chk_properties_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),

    CONSTRAINT chk_properties_price_frequency
        CHECK (price_frequency IS NULL
            OR price_frequency IN ('MONTHLY', 'WEEKLY', 'DAILY', 'ONCE')),

    CONSTRAINT chk_properties_property_type
        CHECK (property_type IN (
            'APARTMENT', 'HOUSE', 'STUDIO', 'CONDO',
            'TOWNHOUSE', 'COMMERCIAL', 'OTHER'
        )),

    CONSTRAINT chk_properties_pet_policy
        CHECK (pet_policy IS NULL
            OR pet_policy IN ('ALLOWED', 'NOT_ALLOWED', 'NEGOTIABLE')),

    CONSTRAINT chk_properties_price
        CHECK (price IS NULL OR price >= 0),

    CONSTRAINT chk_properties_bedrooms
        CHECK (bedrooms IS NULL OR bedrooms >= 0),

    CONSTRAINT chk_properties_bathrooms
        CHECK (bathrooms IS NULL OR bathrooms >= 0),

    CONSTRAINT chk_properties_square_feet
        CHECK (square_feet IS NULL OR square_feet > 0),

    CONSTRAINT chk_properties_latitude
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),

    CONSTRAINT chk_properties_longitude
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),

    -- Lifecycle consistency: timestamps must be set when status matches.
    CONSTRAINT chk_properties_published_at
        CHECK (status <> 'PUBLISHED' OR published_at IS NOT NULL),
    CONSTRAINT chk_properties_archived_at
        CHECK (status <> 'ARCHIVED'  OR archived_at  IS NOT NULL)
);

-- ── Property list / filter indexes ────────────────────────────────────────────

-- Public website and internal list: filter by status (most common filter)
CREATE INDEX idx_properties_status ON properties (status);

-- Public website feed: PUBLISHED properties newest-first
CREATE INDEX idx_properties_status_published_at
    ON properties (published_at DESC)
    WHERE status = 'PUBLISHED';

-- Featured listings widget: only PUBLISHED + featured rows
CREATE INDEX idx_properties_featured
    ON properties (published_at DESC)
    WHERE status = 'PUBLISHED' AND featured = TRUE;

-- Location filters
CREATE INDEX idx_properties_city         ON properties (city);
CREATE INDEX idx_properties_neighborhood ON properties (neighborhood)
    WHERE neighborhood IS NOT NULL;

-- Price range filter (website search: price BETWEEN :min AND :max)
CREATE INDEX idx_properties_price ON properties (price)
    WHERE price IS NOT NULL;

-- Bedroom / bathroom filters
CREATE INDEX idx_properties_bedrooms  ON properties (bedrooms)  WHERE bedrooms IS NOT NULL;
CREATE INDEX idx_properties_bathrooms ON properties (bathrooms) WHERE bathrooms IS NOT NULL;

-- Agent: "show me my listings"
CREATE INDEX idx_properties_listing_agent ON properties (listing_agent_user_id, status)
    WHERE listing_agent_user_id IS NOT NULL;

-- Default internal list sort
CREATE INDEX idx_properties_created_at ON properties (created_at DESC);

-- External deduplication lookup when syncing from portals
CREATE INDEX idx_properties_external_ref
    ON properties (external_reference_id, source_company)
    WHERE external_reference_id IS NOT NULL;

COMMENT ON TABLE properties IS
    'Apartment units and listings. DRAFT = internal only; PUBLISHED = live on website; ARCHIVED = hidden but retained.';

COMMENT ON COLUMN properties.internal_notes IS
    'Private agent notes. Never exposed to the public website or to leads.';

COMMENT ON COLUMN properties.slug IS
    'URL-safe identifier for the public listing page. Generated from title, globally unique.';

COMMENT ON COLUMN properties.published_at IS
    'Timestamp of the first PUBLISHED transition. Set once; never cleared on re-draft.';
