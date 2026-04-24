-- Human-readable reference codes for properties (e.g. LAE-0001).
-- Used by agents for quick lookup and displayed on the public website.

CREATE SEQUENCE IF NOT EXISTS property_ref_seq START 1;

ALTER TABLE properties
    ADD COLUMN reference_code VARCHAR(20);

-- Backfill existing rows in creation order so codes are stable after migration.
UPDATE properties p
SET reference_code = 'LAE-' || LPAD(sub.rn::TEXT, 4, '0')
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
    FROM properties
) sub
WHERE p.id = sub.id;

-- Advance the sequence past the backfilled rows so new inserts don't collide.
SELECT setval('property_ref_seq', (SELECT COUNT(*) FROM properties));

ALTER TABLE properties
    ALTER COLUMN reference_code SET NOT NULL,
    ADD CONSTRAINT uq_property_reference_code UNIQUE (reference_code);

CREATE INDEX idx_properties_reference_code ON properties (reference_code);
