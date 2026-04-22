-- ─────────────────────────────────────────────────────────────────────────────
-- V12 · property_images
--
-- Ordered image gallery for a property listing.
-- Images are owned by their property (CASCADE DELETE).
-- Exactly one image per property may be the cover (enforced by partial unique index).
-- storage_key is the internal path (e.g. S3 key); image_url is the CDN URL
-- served to the website. Both may coexist; image_url is what the frontend uses.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE property_images
(
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    property_id UUID        NOT NULL,

    -- Internal storage path (e.g. "properties/uuid/filename.jpg").
    -- Used by the backend to manage the file; not exposed publicly.
    storage_key VARCHAR(500),
    -- Public CDN URL served to the website and mobile apps.
    image_url   VARCHAR(500),

    -- Accessibility alt text for screen readers and SEO.
    alt_text    VARCHAR(300),

    -- 0-based display order within the gallery. Lower = appears first.
    sort_order  INTEGER     NOT NULL DEFAULT 0,

    -- Marks the primary hero image. At most one per property.
    -- Enforced by the partial unique index below, not a CHECK constraint,
    -- so that unsetting the cover (is_cover = FALSE) never blocks an update.
    is_cover    BOOLEAN     NOT NULL DEFAULT FALSE,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ── Constraints ───────────────────────────────────────────────────────────

    CONSTRAINT pk_property_images PRIMARY KEY (id),

    CONSTRAINT fk_images_property
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,

    CONSTRAINT chk_images_sort_order
        CHECK (sort_order >= 0),

    -- At least one of storage_key or image_url must be provided.
    CONSTRAINT chk_images_has_url
        CHECK (storage_key IS NOT NULL OR image_url IS NOT NULL)
);

-- ── Property images indexes ────────────────────────────────────────────────

-- Primary read pattern: fetch ordered gallery for a single property
CREATE INDEX idx_property_images_gallery
    ON property_images (property_id, sort_order ASC);

-- Fast cover-image lookup (used on listing cards and detail headers)
CREATE UNIQUE INDEX idx_property_images_cover
    ON property_images (property_id)
    WHERE is_cover = TRUE;
-- Note: UNIQUE partial index — not a UNIQUE constraint — so that rows with
-- is_cover = FALSE are unrestricted. Only one TRUE per property is allowed.

COMMENT ON TABLE property_images IS
    'Ordered image gallery for a property. Exactly one row per property may have is_cover = TRUE.';

COMMENT ON COLUMN property_images.storage_key IS
    'Internal file path (e.g. S3 object key). Used for file management; not public.';

COMMENT ON COLUMN property_images.image_url IS
    'CDN-served URL for the image. This is what the frontend and website use.';
