-- ─────────────────────────────────────────────────────────────────────────────
-- V22 · Canonicalize amenity values in seed properties
--
-- Replaces free-text amenity strings inserted by V20 with the canonical
-- uppercase keys defined in the application (POOL, GYM, ROOFTOP, …).
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE properties SET amenities = ARRAY['POOL','ROOFTOP','GYM','CONCIERGE','PARKING','SECURITY','ELEVATOR','DOORMAN']
WHERE id = 'c0000000-0000-0000-0000-000000000001';

UPDATE properties SET amenities = ARRAY['BALCONY','GYM','STORAGE','ROOFTOP','WIFI']
WHERE id = 'c0000000-0000-0000-0000-000000000002';

UPDATE properties SET amenities = ARRAY['WASHER','DRYER','AIR_CONDITIONING','DISHWASHER','REFRIGERATOR','MICROWAVE']
WHERE id = 'c0000000-0000-0000-0000-000000000003';

UPDATE properties SET amenities = ARRAY['POOL','GYM','CONCIERGE','PARKING','SECURITY','BALCONY','ELEVATOR']
WHERE id = 'c0000000-0000-0000-0000-000000000004';

UPDATE properties SET amenities = ARRAY['FURNISHED','WIFI','WASHER','DRYER','ROOFTOP','GYM','CABLE_TV']
WHERE id = 'c0000000-0000-0000-0000-000000000005';

UPDATE properties SET amenities = ARRAY['BALCONY','POOL','GYM','PARKING','CONCIERGE','STORAGE']
WHERE id = 'c0000000-0000-0000-0000-000000000006';

UPDATE properties SET amenities = ARRAY['BALCONY','WASHER','DRYER','AIR_CONDITIONING','PARKING','REFRIGERATOR','MICROWAVE']
WHERE id = 'c0000000-0000-0000-0000-000000000007';

UPDATE properties SET amenities = ARRAY['POOL','GYM','SECURITY','PARKING','BALCONY','ELEVATOR']
WHERE id = 'c0000000-0000-0000-0000-000000000008';

UPDATE properties SET amenities = ARRAY['ROOFTOP','ELEVATOR','PARKING','SECURITY','CONCIERGE','DOORMAN','CABLE_TV']
WHERE id = 'c0000000-0000-0000-0000-000000000009';

UPDATE properties SET amenities = ARRAY['WASHER','DRYER','AIR_CONDITIONING','WIFI']
WHERE id = 'c0000000-0000-0000-0000-000000000010';
