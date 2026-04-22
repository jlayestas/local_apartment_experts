-- Adds a manual public ordering field to properties.
-- NULL means "no explicit order" — sorts after all explicitly-ordered rows,
-- with published_at DESC as the stable tiebreaker.
ALTER TABLE properties
    ADD COLUMN public_sort_order INTEGER;
