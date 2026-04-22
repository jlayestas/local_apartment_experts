-- ─────────────────────────────────────────────────────────────────────────────
-- V20 · reseed_properties_miami
-- Replaces the Mexico City properties seeded in V19 with Miami-area listings.
--
-- Delete order matters:
--   1. activities WHERE property_id IN (...) — must go first because
--      activities.property_id is ON DELETE SET NULL with a CHECK that requires
--      at least one of lead_id / property_id to be non-null. Deleting the
--      property would set property_id to NULL on any row where lead_id is also
--      NULL, violating that constraint.
--   2. lead_property_links WHERE property_id IN (...)
--   3. properties WHERE id IN (...) — cascades to property_images automatically.
--
-- Then re-inserts 10 Miami-area properties using the same UUIDs so that the
-- lead ↔ property link activities in V8 remain contextually valid.
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- DELETE V19 DATA
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM activities
WHERE property_id IN (
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000009',
    'c0000000-0000-0000-0000-000000000010'
);

DELETE FROM lead_property_links
WHERE property_id IN (
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000009',
    'c0000000-0000-0000-0000-000000000010'
);

DELETE FROM properties
WHERE id IN (
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000009',
    'c0000000-0000-0000-0000-000000000010'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- PROPERTIES  (Miami area)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO properties (
    id, title, slug, description, internal_notes,
    address_line_1, address_line_2, neighborhood, city, state, zip_code,
    latitude, longitude,
    price, price_frequency,
    property_type, bedrooms, bathrooms, square_feet, available_date,
    status, featured, amenities, pet_policy, parking_info,
    listing_agent_user_id, contact_phone, contact_whatsapp,
    public_sort_order,
    created_at, updated_at, published_at, archived_at
)
VALUES

-- ── Property 1: Brickell · PUBLISHED · FEATURED ────────────────────────────
(
    'c0000000-0000-0000-0000-000000000001',
    'Luxury Condo in Brickell with Bay Views',
    'luxury-condo-brickell-bay-views',
    'Stunning 2-bedroom, 2-bath condo on the 28th floor of a premier Brickell tower. '
    || 'Floor-to-ceiling windows with panoramic views of Biscayne Bay and the Miami skyline. '
    || 'European kitchen, marble bathrooms, and private balcony. Building features resort-style amenities.',
    'Owner is flexible on move-in date. Allows small pets with a $500 deposit.',
    '1000 Brickell Ave', 'Unit 2805',
    'Brickell', 'Miami', 'FL', '33131',
    25.7617, -80.1918,
    4800.00, 'MONTHLY',
    'CONDO', 2, 2, 1050.0, (NOW() + INTERVAL '15 days')::DATE,
    'PUBLISHED', TRUE,
    ARRAY['Pool', 'Rooftop Deck', 'Gym', 'Concierge 24/7', 'Valet Parking', 'Security 24/7', 'Elevator', 'Bay Views'],
    'NEGOTIABLE', 'One assigned spot in secured garage included.',
    '00000000-0000-0000-0000-000000000002', '+1 305 100 2200', '+1 305 100 2200',
    1,
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days', NULL
),

-- ── Property 2: Wynwood · PUBLISHED · (Miguel's appointment) ──────────────
(
    'c0000000-0000-0000-0000-000000000002',
    'Modern Loft in the Heart of Wynwood',
    'modern-loft-wynwood',
    'Stylish 2-bedroom loft in Wynwood, Miami''s vibrant arts district. '
    || 'Open floor plan with exposed concrete, 14-foot ceilings, and a private terrace. '
    || 'Walking distance to top galleries, restaurants, and Wynwood Walls. '
    || 'Perfect for professionals who want to live in the center of it all.',
    'Miguel Fernández has an appointment today to tour this unit. Bring draft lease.',
    '2525 NW 2nd Ave', 'Unit 4B',
    'Wynwood', 'Miami', 'FL', '33127',
    25.8006, -80.1993,
    3800.00, 'MONTHLY',
    'APARTMENT', 2, 2, 1100.0, (NOW() + INTERVAL '10 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Private Terrace', 'Gym', 'Bike Storage', 'Keyless Entry', 'Rooftop Lounge'],
    'NOT_ALLOWED', 'One assigned parking spot included.',
    '00000000-0000-0000-0000-000000000002', '+1 305 100 2201', '+1 305 100 2201',
    2,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days', NULL
),

-- ── Property 3: Coconut Grove · PUBLISHED ─────────────────────────────────
(
    'c0000000-0000-0000-0000-000000000003',
    'Renovated Home in Coconut Grove',
    'renovated-home-coconut-grove',
    'Beautifully renovated 3-bedroom, 2-bath home in the lush neighborhood of Coconut Grove. '
    || 'Private backyard with tropical landscaping and a patio perfect for entertaining. '
    || 'Gourmet kitchen, hardwood floors throughout, and a separate home office. '
    || '5-minute walk to Peacock Park and CocoWalk.',
    'Full house. Owner lives abroad; we manage directly. Lawn care included in rent.',
    '3300 Mary St', '',
    'Coconut Grove', 'Miami', 'FL', '33133',
    25.7310, -80.2386,
    6500.00, 'MONTHLY',
    'HOUSE', 3, 2, 1800.0, (NOW() + INTERVAL '30 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Private Backyard', 'Home Office', 'Gourmet Kitchen', 'Patio', 'Washer/Dryer', 'Central A/C'],
    'NEGOTIABLE', 'Driveway for 2 cars.',
    '00000000-0000-0000-0000-000000000003', '+1 305 300 4400', '+1 305 300 4400',
    3,
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days', NULL
),

-- ── Property 4: Coral Gables · PUBLISHED · (Sofía's options) ──────────────
(
    'c0000000-0000-0000-0000-000000000004',
    'Elegant Condo in Coral Gables near Miracle Mile',
    'elegant-condo-coral-gables-miracle-mile',
    'Bright and spacious 1-bedroom, 2-bath condo in the prestigious City Beautiful. '
    || 'Open-concept living area, updated kitchen with quartz countertops, and a large balcony. '
    || 'Steps from Miracle Mile, top-rated restaurants, and A-rated schools. '
    || 'Ideal for families relocating to Miami.',
    'Sofía Reyes wants to visit this weekend with her husband. Confirm availability.',
    '355 Miracle Mile', 'Unit 602',
    'Coral Gables', 'Coral Gables', 'FL', '33134',
    25.7215, -80.2684,
    4200.00, 'MONTHLY',
    'CONDO', 1, 2, 920.0, (NOW() + INTERVAL '20 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Pool', 'Gym', 'Concierge', 'Assigned Parking', 'Security 24/7', 'Balcony', 'Elevator'],
    'NOT_ALLOWED', '1 assigned covered spot included.',
    '00000000-0000-0000-0000-000000000003', '+1 305 300 4401', '+1 305 300 4401',
    4,
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days', NULL
),

-- ── Property 5: South Beach · PUBLISHED · (Roberto's match) ───────────────
(
    'c0000000-0000-0000-0000-000000000005',
    'Furnished Studio Steps from South Beach',
    'furnished-studio-south-beach',
    'Fully furnished studio 2 blocks from the ocean in South Beach. '
    || 'Modern and bright with a Murphy queen bed, full kitchen, and in-unit washer/dryer. '
    || 'Includes high-speed internet, Netflix, and utilities. Flexible lease terms available.',
    'Great match for Roberto Mendoza — furnished, flexible term, beachside. No pets.',
    '1500 Collins Ave', 'Unit 3C',
    'South Beach', 'Miami Beach', 'FL', '33139',
    25.7826, -80.1340,
    2400.00, 'MONTHLY',
    'STUDIO', 0, 1, 480.0, (NOW() + INTERVAL '7 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Furnished', 'Internet Included', 'Utilities Included', 'In-Unit W/D', 'Rooftop Pool', 'Gym'],
    'NOT_ALLOWED', 'No parking. Street parking and garages nearby.',
    '00000000-0000-0000-0000-000000000002', '+1 305 100 2202', '+1 305 100 2202',
    5,
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days', NULL
),

-- ── Property 6: Edgewater · PUBLISHED ─────────────────────────────────────
(
    'c0000000-0000-0000-0000-000000000006',
    'Apartment with Bay Views in Edgewater',
    'apartment-bay-views-edgewater',
    'Spacious 2-bedroom, 2-bath apartment in Edgewater with direct views of Biscayne Bay. '
    || 'Freshly painted with updated fixtures, split bedroom layout, and large wraparound balcony. '
    || 'Walking distance to Margaret Pace Park and minutes to Wynwood and Midtown.',
    'Good option for Roberto or Ana. Price negotiable for 12-month lease.',
    '3001 NE 2nd Ave', 'Unit 8A',
    'Edgewater', 'Miami', 'FL', '33137',
    25.7892, -80.1918,
    4500.00, 'MONTHLY',
    'APARTMENT', 2, 2, 1020.0, NOW()::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Bay Views', 'Balcony', 'Pool', 'Gym', 'Assigned Parking', 'Concierge', 'Pet Friendly'],
    'NEGOTIABLE', '1 assigned spot in covered garage.',
    '00000000-0000-0000-0000-000000000002', '+1 305 100 2203', NULL,
    6,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days', NULL
),

-- ── Property 7: Doral · PUBLISHED ─────────────────────────────────────────
(
    'c0000000-0000-0000-0000-000000000007',
    'Cozy Townhouse in Doral',
    'cozy-townhouse-doral',
    'Well-maintained 2-bedroom, 1-bath townhouse in a quiet Doral community. '
    || 'Private fenced patio, impact windows, and in-unit laundry. '
    || 'Minutes from top-rated Doral schools, Doral City Place, and easy access to the Palmetto Expressway. '
    || 'Perfect for families or professionals working in the Doral corridor.',
    'Possible match for Andrés Morales if he responds. Also consider for Ana Torres.',
    '3450 NW 107th Ave', 'Unit 12',
    'Doral', 'Doral', 'FL', '33178',
    25.8194, -80.3556,
    3100.00, 'MONTHLY',
    'TOWNHOUSE', 2, 1, 950.0, (NOW() + INTERVAL '25 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Private Patio', 'In-Unit Laundry', 'Impact Windows', 'A/C', 'Assigned Parking x2'],
    'ALLOWED', '2 assigned parking spots.',
    '00000000-0000-0000-0000-000000000002', '+1 305 100 2204', '+1 305 100 2204',
    7,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days', NULL
),

-- ── Property 8: Aventura · DRAFT · (Sofía's 2nd option) ───────────────────
(
    'c0000000-0000-0000-0000-000000000008',
    'Spacious Condo in Aventura near Aventura Mall',
    'spacious-condo-aventura-mall',
    'Bright 3-bedroom, 2-bath condo in a gated Aventura community. '
    || 'Open kitchen with island, large master suite, and a screened balcony with garden views. '
    || 'Minutes from Aventura Mall, top-rated schools, and easy access to 95.',
    'Pending: professional photos and lease review. Do not publish until confirmed.',
    '3100 NE 190th St', 'Unit 412',
    'Aventura', 'Aventura', 'FL', '33180',
    25.9565, -80.1398,
    5500.00, 'MONTHLY',
    'CONDO', 3, 2, 1650.0, (NOW() + INTERVAL '45 days')::DATE,
    'DRAFT', FALSE,
    ARRAY['Pool', 'Gym', 'Gated Community', 'Assigned Parking x2', 'Screened Balcony', 'Security 24/7', 'Near Top Schools'],
    'NEGOTIABLE', '2 assigned spots in covered garage.',
    '00000000-0000-0000-0000-000000000003', '+1 305 300 4402', '+1 305 300 4402',
    NULL,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
    NULL, NULL
),

-- ── Property 9: Miami Beach Penthouse · DRAFT ──────────────────────────────
(
    'c0000000-0000-0000-0000-000000000009',
    'Ocean-View Penthouse in Miami Beach',
    'ocean-view-penthouse-miami-beach',
    'Spectacular 4-bedroom, 3-bath penthouse with direct ocean views in Miami Beach. '
    || 'Two wraparound terraces, chef''s kitchen, home theater, and a private rooftop plunge pool. '
    || 'Premium finishes throughout with smart home technology. Private elevator access.',
    'Premium listing. Requires income verification. Internal review pending before publishing.',
    '101 Ocean Dr', 'PH-14',
    'South Beach', 'Miami Beach', 'FL', '33139',
    25.7756, -80.1300,
    12000.00, 'MONTHLY',
    'CONDO', 4, 3, 3200.0, (NOW() + INTERVAL '60 days')::DATE,
    'DRAFT', FALSE,
    ARRAY['Ocean Views', 'Private Rooftop Pool', 'Home Theater', 'Private Elevator', 'Parking x3', 'Smart Home', 'Security 24/7', 'Concierge'],
    'NOT_ALLOWED', '3 spots in private garage + storage unit.',
    '00000000-0000-0000-0000-000000000001', '+1 305 000 1111', NULL,
    NULL,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
    NULL, NULL
),

-- ── Property 10: Little Havana · ARCHIVED · (Laura CLOSED_WON) ────────────
(
    'c0000000-0000-0000-0000-000000000010',
    'Apartment in Little Havana near Downtown',
    'apartment-little-havana-downtown',
    '1-bedroom, 1-bath apartment in the vibrant neighborhood of Little Havana. '
    || 'Private courtyard access, updated kitchen, and tile floors throughout. '
    || '10 minutes from Downtown Miami and Brickell. Close to Calle Ocho, transit, and shops.',
    'Leased to Laura Jiménez. Signed lease, rent $2,200/mo. Keys delivered on the 15th.',
    '900 SW 8th St', 'Unit 2B',
    'Little Havana', 'Miami', 'FL', '33130',
    25.7689, -80.2316,
    2200.00, 'MONTHLY',
    'APARTMENT', 1, 1, 650.0, NULL,
    'ARCHIVED', FALSE,
    ARRAY['Private Courtyard', 'Updated Kitchen', 'On-Site Laundry', 'Near Transit'],
    'NOT_ALLOWED', 'Street parking. Transit accessible.',
    '00000000-0000-0000-0000-000000000003', '+1 305 300 4403', NULL,
    NULL,
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- PROPERTY IMAGES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO property_images (id, property_id, storage_key, image_url, alt_text, sort_order, is_cover, created_at)
VALUES

-- ── Prop 1: Brickell ──────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001',
 'properties/c01/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c01/cover.jpg',
 'Living room with panoramic bay views from the 28th floor', 0, TRUE, NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001',
 'properties/c01/kitchen.jpg',
 'https://cdn.localapartmentexperts.com/properties/c01/kitchen.jpg',
 'European kitchen with quartz countertops and stainless appliances', 1, FALSE, NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001',
 'properties/c01/balcony.jpg',
 'https://cdn.localapartmentexperts.com/properties/c01/balcony.jpg',
 'Private balcony overlooking Biscayne Bay', 2, FALSE, NOW() - INTERVAL '20 days'),

-- ── Prop 2: Wynwood ───────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002',
 'properties/c02/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c02/cover.jpg',
 'Open loft with exposed concrete and 14-foot ceilings', 0, TRUE, NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002',
 'properties/c02/terrace.jpg',
 'https://cdn.localapartmentexperts.com/properties/c02/terrace.jpg',
 'Private terrace with views of the Wynwood arts district', 1, FALSE, NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002',
 'properties/c02/bedroom.jpg',
 'https://cdn.localapartmentexperts.com/properties/c02/bedroom.jpg',
 'Master bedroom with custom closet and city views', 2, FALSE, NOW() - INTERVAL '18 days'),

-- ── Prop 3: Coconut Grove ─────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/cover.jpg',
 'Front exterior of the renovated Coconut Grove home', 0, TRUE, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/backyard.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/backyard.jpg',
 'Backyard with tropical landscaping and covered patio', 1, FALSE, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/kitchen.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/kitchen.jpg',
 'Gourmet kitchen with island and high-end appliances', 2, FALSE, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/office.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/office.jpg',
 'Dedicated home office with built-in shelving', 3, FALSE, NOW() - INTERVAL '15 days'),

-- ── Prop 4: Coral Gables ──────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004',
 'properties/c04/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c04/cover.jpg',
 'Bright living room with balcony access in Coral Gables condo', 0, TRUE, NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004',
 'properties/c04/balcony.jpg',
 'https://cdn.localapartmentexperts.com/properties/c04/balcony.jpg',
 'Balcony with views of Miracle Mile', 1, FALSE, NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004',
 'properties/c04/pool.jpg',
 'https://cdn.localapartmentexperts.com/properties/c04/pool.jpg',
 'Resort-style community pool', 2, FALSE, NOW() - INTERVAL '12 days'),

-- ── Prop 5: South Beach ───────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005',
 'properties/c05/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c05/cover.jpg',
 'Furnished South Beach studio with Murphy bed and full kitchen', 0, TRUE, NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005',
 'properties/c05/building.jpg',
 'https://cdn.localapartmentexperts.com/properties/c05/building.jpg',
 'Building exterior 2 blocks from the beach', 1, FALSE, NOW() - INTERVAL '10 days'),

-- ── Prop 6: Edgewater ─────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006',
 'properties/c06/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c06/cover.jpg',
 'Living room with floor-to-ceiling windows and bay views', 0, TRUE, NOW() - INTERVAL '8 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006',
 'properties/c06/balcony.jpg',
 'https://cdn.localapartmentexperts.com/properties/c06/balcony.jpg',
 'Wraparound balcony overlooking Biscayne Bay', 1, FALSE, NOW() - INTERVAL '8 days'),

-- ── Prop 7: Doral ─────────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007',
 'properties/c07/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c07/cover.jpg',
 'Doral townhouse with fenced patio and tropical plants', 0, TRUE, NOW() - INTERVAL '6 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007',
 'properties/c07/living.jpg',
 'https://cdn.localapartmentexperts.com/properties/c07/living.jpg',
 'Bright living area with tile floors and impact windows', 1, FALSE, NOW() - INTERVAL '6 days'),

-- ── Prop 10: Little Havana (ARCHIVED) ─────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010',
 'properties/c10/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c10/cover.jpg',
 'Little Havana apartment with courtyard access', 0, TRUE, NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010',
 'properties/c10/courtyard.jpg',
 'https://cdn.localapartmentexperts.com/properties/c10/courtyard.jpg',
 'Private courtyard shared with 4 units', 1, FALSE, NOW() - INTERVAL '30 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITIES (property lifecycle events)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO activities (id, lead_id, property_id, actor_id, activity_type, metadata, created_at)
VALUES

-- Brickell
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_CREATED',
 '{"title":"Luxury Condo in Brickell with Bay Views"}'::jsonb, NOW() - INTERVAL '25 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_PUBLISHED',
 '{"title":"Luxury Condo in Brickell with Bay Views"}'::jsonb, NOW() - INTERVAL '20 days'),

-- Wynwood
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_CREATED',
 '{"title":"Modern Loft in the Heart of Wynwood"}'::jsonb, NOW() - INTERVAL '20 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_PUBLISHED',
 '{"title":"Modern Loft in the Heart of Wynwood"}'::jsonb, NOW() - INTERVAL '18 days'),

-- Coconut Grove
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_CREATED',
 '{"title":"Renovated Home in Coconut Grove"}'::jsonb, NOW() - INTERVAL '18 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_PUBLISHED',
 '{"title":"Renovated Home in Coconut Grove"}'::jsonb, NOW() - INTERVAL '15 days'),

-- Coral Gables
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_CREATED',
 '{"title":"Elegant Condo in Coral Gables near Miracle Mile"}'::jsonb, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_PUBLISHED',
 '{"title":"Elegant Condo in Coral Gables near Miracle Mile"}'::jsonb, NOW() - INTERVAL '12 days'),

-- South Beach
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_CREATED',
 '{"title":"Furnished Studio Steps from South Beach"}'::jsonb, NOW() - INTERVAL '12 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_PUBLISHED',
 '{"title":"Furnished Studio Steps from South Beach"}'::jsonb, NOW() - INTERVAL '10 days'),

-- Edgewater
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_CREATED',
 '{"title":"Apartment with Bay Views in Edgewater"}'::jsonb, NOW() - INTERVAL '10 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_PUBLISHED',
 '{"title":"Apartment with Bay Views in Edgewater"}'::jsonb, NOW() - INTERVAL '8 days'),

-- Doral
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000007',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_CREATED',
 '{"title":"Cozy Townhouse in Doral"}'::jsonb, NOW() - INTERVAL '8 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000007',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_PUBLISHED',
 '{"title":"Cozy Townhouse in Doral"}'::jsonb, NOW() - INTERVAL '6 days'),

-- Aventura (DRAFT)
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000008',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_CREATED',
 '{"title":"Spacious Condo in Aventura near Aventura Mall","status":"DRAFT"}'::jsonb, NOW() - INTERVAL '5 days'),

-- Miami Beach Penthouse (DRAFT)
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000009',
 '00000000-0000-0000-0000-000000000001', 'PROPERTY_CREATED',
 '{"title":"Ocean-View Penthouse in Miami Beach","status":"DRAFT"}'::jsonb, NOW() - INTERVAL '3 days'),

-- Little Havana (ARCHIVED)
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_CREATED',
 '{"title":"Apartment in Little Havana near Downtown"}'::jsonb, NOW() - INTERVAL '35 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_PUBLISHED',
 '{"title":"Apartment in Little Havana near Downtown"}'::jsonb, NOW() - INTERVAL '30 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_ARCHIVED',
 '{"title":"Apartment in Little Havana near Downtown","reason":"Leased to Laura Jiménez"}'::jsonb, NOW() - INTERVAL '5 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- LEAD ↔ PROPERTY LINKS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO lead_property_links (id, lead_id, property_id, link_type, note, created_by_user_id, created_at)
VALUES

-- Roberto (CONTACTED) · South Beach studio SUGGESTED, Edgewater apt SUGGESTED
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
 'SUGGESTED',
 'Furnished, flexible lease, beachside. Strong match with his profile.',
 '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006',
 'SUGGESTED',
 'Second option: 2BR in Edgewater with bay views. Slightly over budget but worth a look.',
 '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),

-- Sofía (QUALIFIED) · Coral Gables INTERESTED, Aventura SUGGESTED
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004',
 'INTERESTED',
 'Loved the location and school ratings. Wants her husband to see it this weekend.',
 '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 days'),
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008',
 'SUGGESTED',
 'Aventura condo: more space, top-rated schools nearby. Pending publication.',
 '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 days'),

-- Miguel (APPOINTMENT_SCHEDULED) · Wynwood loft INTERESTED, Brickell REJECTED
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002',
 'INTERESTED',
 'Appointment today. Shared photos; he loves the loft vibe. Check home office space.',
 '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day'),
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001',
 'REJECTED',
 'Over budget. $4,800 hits his ceiling — prefers to stay under $4,000.',
 '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),

-- Laura (CLOSED_WON) · Little Havana TOURED (the one she rented)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010',
 'TOURED',
 'Toured on the 20th. Loved the courtyard and the location. Decided to lease on the spot.',
 '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '15 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITIES (lead ↔ property link events)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO activities (id, lead_id, property_id, actor_id, activity_type, metadata, created_at)
VALUES

(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_LINKED',
 '{"linkType":"SUGGESTED","propertyTitle":"Furnished Studio Steps from South Beach"}'::jsonb,
 NOW() - INTERVAL '3 days'),

(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_LINKED',
 '{"linkType":"SUGGESTED","propertyTitle":"Apartment with Bay Views in Edgewater"}'::jsonb,
 NOW() - INTERVAL '3 days'),

(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_LINKED',
 '{"linkType":"INTERESTED","propertyTitle":"Elegant Condo in Coral Gables near Miracle Mile"}'::jsonb,
 NOW() - INTERVAL '2 days'),

(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_LINKED',
 '{"linkType":"SUGGESTED","propertyTitle":"Spacious Condo in Aventura near Aventura Mall"}'::jsonb,
 NOW() - INTERVAL '2 days'),

(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_LINKED',
 '{"linkType":"INTERESTED","propertyTitle":"Modern Loft in the Heart of Wynwood"}'::jsonb,
 NOW() - INTERVAL '1 day'),

(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002', 'PROPERTY_LINKED',
 '{"linkType":"REJECTED","propertyTitle":"Luxury Condo in Brickell with Bay Views"}'::jsonb,
 NOW() - INTERVAL '5 days'),

(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003', 'PROPERTY_LINKED',
 '{"linkType":"TOURED","propertyTitle":"Apartment in Little Havana near Downtown"}'::jsonb,
 NOW() - INTERVAL '15 days');
