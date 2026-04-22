-- ─────────────────────────────────────────────────────────────────────────────
-- V19 · seed_properties
-- 10 realistic sample properties across PUBLISHED / DRAFT / ARCHIVED statuses.
-- Each property includes images, lifecycle activities, and where applicable,
-- lead_property_links that tie back to the leads seeded in V8.
--
-- User references:
--   Admin   → '00000000-0000-0000-0000-000000000001'
--   María   → '00000000-0000-0000-0000-000000000002'
--   Carlos  → '00000000-0000-0000-0000-000000000003'
--
-- Lead references (from V8):
--   Ana Torres      → 'b0000000-0000-0000-0000-000000000001'  NEW
--   Roberto Mendoza → 'b0000000-0000-0000-0000-000000000002'  CONTACTED
--   Sofía Reyes     → 'b0000000-0000-0000-0000-000000000003'  QUALIFIED
--   Miguel Fernández→ 'b0000000-0000-0000-0000-000000000004'  APPOINTMENT_SCHEDULED
--   Laura Jiménez   → 'b0000000-0000-0000-0000-000000000005'  CLOSED_WON
--   Andrés Morales  → 'b0000000-0000-0000-0000-000000000006'  UNRESPONSIVE
--
-- Property UUIDs use 'c' prefix to distinguish from users ('0') and leads ('b').
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════
-- PROPERTIES
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

-- ── Property 1: Polanco · PUBLISHED · FEATURED ─────────────────────────────
(
    'c0000000-0000-0000-0000-000000000001',
    'Departamento de lujo en Polanco',
    'departamento-lujo-polanco',
    'Hermoso departamento de 2 recámaras en el corazón de Polanco. Pisos de madera, '
    || 'cocina integral equipada, balcón con vista a Parque Lincoln. Edificio con '
    || 'vigilancia 24/7, lobby de mármol y roof garden exclusivo.',
    'Propietario pide depósito de 2 meses. Permite mascotas pequeñas con depósito extra de $2,000.',
    'Av. Presidente Masaryk 456', 'Piso 8, Depto 801',
    'Polanco', 'Ciudad de México', 'CDMX', '11560',
    19.4326, -99.1924,
    16500.00, 'MONTHLY',
    'APARTMENT', 2, 1, 95.0, (NOW() + INTERVAL '15 days')::DATE,
    'PUBLISHED', TRUE,
    ARRAY['Gimnasio', 'Roof garden', 'Concierge 24/7', 'Estacionamiento incluido', 'Seguridad 24/7', 'Elevador'],
    'NEGOTIABLE', 'Un cajón cubierto incluido en renta.',
    '00000000-0000-0000-0000-000000000002', '+52 55 1100 2200', '+52 55 1100 2200',
    1,
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days', NULL
),

-- ── Property 2: Del Valle · PUBLISHED · (Miguel's appointment) ────────────
(
    'c0000000-0000-0000-0000-000000000002',
    'Departamento amplio en Del Valle',
    'departamento-amplio-del-valle',
    'Espacioso departamento de 2 recámaras y 2 baños en Del Valle Centro. '
    || 'Recámara principal con baño en suite y walk-in closet. Sala-comedor amplio, '
    || 'cocina semi-equipada, cuarto de lavado. Edificio boutique de 12 unidades.',
    'Miguel Fernández tiene cita hoy para visitar esta propiedad. Llevar contrato borrador.',
    'Av. División del Norte 1850', 'Piso 7, Depto 703',
    'Del Valle Centro', 'Ciudad de México', 'CDMX', '03100',
    19.3878, -99.1625,
    19500.00, 'MONTHLY',
    'APARTMENT', 2, 2, 110.0, (NOW() + INTERVAL '10 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Estacionamiento incluido', 'Bodega', 'Elevador', 'Interfón', 'Gas centralizado'],
    'NOT_ALLOWED', 'Un cajón asignado en planta baja.',
    '00000000-0000-0000-0000-000000000002', '+52 55 1100 2201', '+52 55 1100 2201',
    2,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days', NULL
),

-- ── Property 3: Roma Norte · PUBLISHED ────────────────────────────────────
(
    'c0000000-0000-0000-0000-000000000003',
    'Casa remodelada en Roma Norte',
    'casa-remodelada-roma-norte',
    'Preciosa casa de 3 recámaras totalmente remodelada en Roma Norte. '
    || 'Patio interior con jardín, estudio independiente, cocina gourmet con isla. '
    || 'A 5 minutos caminando del Parque España y mejores restaurantes de la zona.',
    'Casa entera. Propietario vive en el extranjero, gestión directa con nosotros.',
    'Calle Orizaba 87', '',
    'Roma Norte', 'Ciudad de México', 'CDMX', '06700',
    19.4167, -99.1594,
    28000.00, 'MONTHLY',
    'HOUSE', 3, 2, 185.0, (NOW() + INTERVAL '30 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Jardín privado', 'Estudio', 'Cocina equipada', 'Patio interior', 'Calefacción', 'A/C'],
    'NEGOTIABLE', 'Cochera para 1 auto en la misma calle (costo adicional $1,500/mes).',
    '00000000-0000-0000-0000-000000000003', '+52 55 3300 4400', '+52 55 3300 4400',
    3,
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days', NULL
),

-- ── Property 4: Santa Fe · PUBLISHED · (Sofía's options) ──────────────────
(
    'c0000000-0000-0000-0000-000000000004',
    'Loft moderno en Santa Fe',
    'loft-moderno-santa-fe',
    'Loft de diseño contemporáneo en Santa Fe, ideal para ejecutivos. '
    || 'Planta abierta de 1 recámara con mezzanine, 2 baños, terraza privada con '
    || 'vista panorámica a la ciudad. A 10 minutos de Centro Santa Fe.',
    'Sofía Reyes visitará este fin de semana con su esposo. Confirmar disponibilidad.',
    'Blvd. Manuel Ávila Camacho 2407', 'Torre B, Piso 22',
    'Santa Fe', 'Ciudad de México', 'CDMX', '05109',
    19.3601, -99.2625,
    22000.00, 'MONTHLY',
    'APARTMENT', 1, 2, 88.0, (NOW() + INTERVAL '20 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Terraza privada', 'Gimnasio', 'Alberca', 'Concierge', 'Estacionamiento', 'Seguridad 24/7', 'Sala de juntas'],
    'NOT_ALLOWED', '2 cajones incluidos en renta.',
    '00000000-0000-0000-0000-000000000003', '+52 55 3300 4401', '+52 55 3300 4401',
    4,
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days', NULL
),

-- ── Property 5: Condesa · PUBLISHED · (Roberto's match) ──────────────────
(
    'c0000000-0000-0000-0000-000000000005',
    'Estudio amueblado en Condesa',
    'estudio-amueblado-condesa',
    'Estudio completamente amueblado en la mejor zona de Condesa. '
    || 'Moderno, luminoso, con cama queen murphy, sofá, cocina equipada y escritorio. '
    || 'Incluye internet de 500 Mbps, Netflix y servicios básicos. Ideal para estancias temporales.',
    'Ideal para Roberto Mendoza - 6 meses con opción a renovar. Sin mascotas.',
    'Calle Ámsterdam 145', 'Depto 3-B',
    'Condesa', 'Ciudad de México', 'CDMX', '06100',
    19.4116, -99.1780,
    9800.00, 'MONTHLY',
    'STUDIO', 0, 1, 42.0, (NOW() + INTERVAL '7 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Amueblado', 'Internet incluido', 'Servicios incluidos', 'A/C', 'Lavandería en edificio'],
    'NOT_ALLOWED', 'Sin estacionamiento. Bicicletas permitidas en bodega.',
    '00000000-0000-0000-0000-000000000002', '+52 55 1100 2202', '+52 55 1100 2202',
    5,
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days', NULL
),

-- ── Property 6: Narvarte · PUBLISHED ──────────────────────────────────────
(
    'c0000000-0000-0000-0000-000000000006',
    'Departamento en Narvarte Poniente',
    'departamento-narvarte-poniente',
    'Departamento de 2 recámaras en Narvarte Poniente, a pasos del metro Eugenia. '
    || 'Recién pintado, pisos de mosaico original, ventanas dobles. '
    || 'Zona tranquila con mucho comercio a pie de calle.',
    'Buena opción para Roberto o Ana. Precio negociable a partir de 6 meses.',
    'Calle Moctezuma 324', 'Depto 2-A',
    'Narvarte Poniente', 'Ciudad de México', 'CDMX', '03020',
    19.3955, -99.1589,
    14200.00, 'MONTHLY',
    'APARTMENT', 2, 1, 78.0, NOW()::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Estacionamiento incluido', 'Interfón', 'Gas centralizado', 'Cuarto de lavado'],
    'NEGOTIABLE', 'Un cajón cubierto.',
    '00000000-0000-0000-0000-000000000002', '+52 55 1100 2203', NULL,
    6,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days', NULL
),

-- ── Property 7: Coyoacán · PUBLISHED ──────────────────────────────────────
(
    'c0000000-0000-0000-0000-000000000007',
    'Departamento acogedor en Coyoacán',
    'departamento-acogedor-coyoacan',
    'Luminoso departamento de 1 recámara en Coyoacán, a 3 cuadras del Jardín Centenario. '
    || 'Planta alta, mucha luz natural, terraza pequeña con plantas. '
    || 'Edificio de 8 unidades, vecinos tranquilos.',
    'Posible match para Andrés Morales si responde. También considerar para Ana Torres.',
    'Calle Francisco Sosa 210', 'Depto 4',
    'Coyoacán', 'Ciudad de México', 'CDMX', '04000',
    19.3500, -99.1622,
    11500.00, 'MONTHLY',
    'APARTMENT', 1, 1, 58.0, (NOW() + INTERVAL '25 days')::DATE,
    'PUBLISHED', FALSE,
    ARRAY['Terraza', 'Gas centralizado', 'Agua incluida', 'Interfón'],
    'ALLOWED', 'Sin estacionamiento asignado. Calle con fácil estacionamiento.',
    '00000000-0000-0000-0000-000000000002', '+52 55 1100 2204', '+52 55 1100 2204',
    7,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days', NULL
),

-- ── Property 8: Interlomas · DRAFT ────────────────────────────────────────
(
    'c0000000-0000-0000-0000-000000000008',
    'Casa en Interlomas con jardín',
    'casa-interlomas-jardin',
    'Amplia casa de 3 recámaras en privada cerrada en Interlomas. '
    || 'Jardín trasero de 80m2, cocina americana, sala de TV, 2 cajones de estacionamiento. '
    || 'Zona escolar excelente (British School a 5 minutos).',
    'Pendiente: fotografías profesionales y revisión de contrato. No publicar hasta confirmación.',
    'Av. Lomas de las Palmas 567', 'Casa 12',
    'Interlomas', 'Huixquilucan', 'Estado de México', '52786',
    19.4102, -99.3011,
    35000.00, 'MONTHLY',
    'HOUSE', 3, 2, 220.0, (NOW() + INTERVAL '45 days')::DATE,
    'DRAFT', FALSE,
    ARRAY['Jardín privado', 'Estacionamiento x2', 'Cuarto de servicio', 'Cocina equipada', 'Privada cerrada', 'Vigilancia'],
    'NEGOTIABLE', '2 cajones techados dentro de la privada.',
    '00000000-0000-0000-0000-000000000003', '+52 55 3300 4402', '+52 55 3300 4402',
    NULL,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
    NULL, NULL
),

-- ── Property 9: Lomas de Chapultepec · DRAFT ──────────────────────────────
(
    'c0000000-0000-0000-0000-000000000009',
    'Penthouse en Lomas de Chapultepec',
    'penthouse-lomas-chapultepec',
    'Penthouse de 4 recámaras con vistas espectaculares en Lomas de Chapultepec. '
    || 'Dos terrazas, sala de cine, cocina de chef, 3 baños completos + medio baño. '
    || 'Acabados de lujo, domótica, elevador privado desde el sótano.',
    'Propiedad premium. Requiere verificación de ingresos. Revisión interna pendiente antes de publicar.',
    'Calle Prado Norte 540', 'Piso 14 (PH)',
    'Lomas de Chapultepec', 'Ciudad de México', 'CDMX', '11000',
    19.4274, -99.2108,
    58000.00, 'MONTHLY',
    'CONDO', 4, 3, 320.0, (NOW() + INTERVAL '60 days')::DATE,
    'DRAFT', FALSE,
    ARRAY['Terraza x2', 'Sala de cine', 'Elevador privado', 'Estacionamiento x3', 'Bodega', 'Domótica', 'Seguridad 24/7', 'Concierge'],
    'NOT_ALLOWED', '3 cajones en sótano + bodega de 10m2.',
    '00000000-0000-0000-0000-000000000001', '+52 55 0000 1111', NULL,
    NULL,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
    NULL, NULL
),

-- ── Property 10: Doctores · ARCHIVED · (Laura CLOSED_WON) ────────────────
(
    'c0000000-0000-0000-0000-000000000010',
    'Departamento en Colonia Doctores',
    'departamento-colonia-doctores',
    'Departamento de 1 recámara en Colonia Doctores, a 2 cuadras del metro Doctores. '
    || 'Planta baja, patio exclusivo, servicios incluidos. Perfecto para estudiantes o '
    || 'profesionistas que buscan ubicación céntrica a precio accesible.',
    'Arrendado a Laura Jiménez. Contrato firmado, renta $10,500/mes. Llaves entregadas el día 15.',
    'Calle Doctor Navarro 45', 'Depto PB-2',
    'Doctores', 'Ciudad de México', 'CDMX', '06720',
    19.4173, -99.1465,
    10500.00, 'MONTHLY',
    'APARTMENT', 1, 1, 55.0, NULL,
    'ARCHIVED', FALSE,
    ARRAY['Patio exclusivo', 'Servicios incluidos', 'Gas centralizado', 'Interfón'],
    'NOT_ALLOWED', 'Sin estacionamiento. Metro a 2 cuadras.',
    '00000000-0000-0000-0000-000000000003', '+52 55 3300 4403', NULL,
    NULL,
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- PROPERTY IMAGES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO property_images (id, property_id, storage_key, image_url, alt_text, sort_order, is_cover, created_at)
VALUES

-- ── Prop 1: Polanco ────────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001',
 'properties/c01/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c01/cover.jpg',
 'Sala principal con vista a Parque Lincoln', 0, TRUE, NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001',
 'properties/c01/cocina.jpg',
 'https://cdn.localapartmentexperts.com/properties/c01/cocina.jpg',
 'Cocina integral equipada con barra desayunadora', 1, FALSE, NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001',
 'properties/c01/recamara.jpg',
 'https://cdn.localapartmentexperts.com/properties/c01/recamara.jpg',
 'Recámara principal con balcón', 2, FALSE, NOW() - INTERVAL '20 days'),

-- ── Prop 2: Del Valle ─────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002',
 'properties/c02/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c02/cover.jpg',
 'Vista desde el piso 7 hacia División del Norte', 0, TRUE, NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002',
 'properties/c02/sala.jpg',
 'https://cdn.localapartmentexperts.com/properties/c02/sala.jpg',
 'Sala-comedor amplio con luz natural', 1, FALSE, NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002',
 'properties/c02/bano.jpg',
 'https://cdn.localapartmentexperts.com/properties/c02/bano.jpg',
 'Baño en suite con acabados modernos', 2, FALSE, NOW() - INTERVAL '18 days'),

-- ── Prop 3: Roma Norte ────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/cover.jpg',
 'Fachada de la casa remodelada en Roma Norte', 0, TRUE, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/patio.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/patio.jpg',
 'Patio interior con jardín y área de asador', 1, FALSE, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/cocina.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/cocina.jpg',
 'Cocina gourmet con isla central', 2, FALSE, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
 'properties/c03/estudio.jpg',
 'https://cdn.localapartmentexperts.com/properties/c03/estudio.jpg',
 'Estudio independiente con escritorio y librero', 3, FALSE, NOW() - INTERVAL '15 days'),

-- ── Prop 4: Santa Fe ──────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004',
 'properties/c04/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c04/cover.jpg',
 'Vista panorámica desde terraza privada en Santa Fe', 0, TRUE, NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004',
 'properties/c04/interior.jpg',
 'https://cdn.localapartmentexperts.com/properties/c04/interior.jpg',
 'Loft de diseño con planta abierta y doble altura', 1, FALSE, NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004',
 'properties/c04/terraza.jpg',
 'https://cdn.localapartmentexperts.com/properties/c04/terraza.jpg',
 'Terraza exterior con muebles incluidos', 2, FALSE, NOW() - INTERVAL '12 days'),

-- ── Prop 5: Condesa ───────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005',
 'properties/c05/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c05/cover.jpg',
 'Estudio amueblado en Condesa con cama murphy', 0, TRUE, NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005',
 'properties/c05/cocina.jpg',
 'https://cdn.localapartmentexperts.com/properties/c05/cocina.jpg',
 'Cocina equipada integrada al espacio principal', 1, FALSE, NOW() - INTERVAL '10 days'),

-- ── Prop 6: Narvarte ──────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006',
 'properties/c06/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c06/cover.jpg',
 'Sala principal con ventanas amplias en Narvarte', 0, TRUE, NOW() - INTERVAL '8 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006',
 'properties/c06/recamara.jpg',
 'https://cdn.localapartmentexperts.com/properties/c06/recamara.jpg',
 'Recámara principal con closet de madera', 1, FALSE, NOW() - INTERVAL '8 days'),

-- ── Prop 7: Coyoacán ──────────────────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007',
 'properties/c07/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c07/cover.jpg',
 'Vista desde la terraza en Coyoacán con plantas', 0, TRUE, NOW() - INTERVAL '6 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007',
 'properties/c07/sala.jpg',
 'https://cdn.localapartmentexperts.com/properties/c07/sala.jpg',
 'Sala luminosa con piso de madera', 1, FALSE, NOW() - INTERVAL '6 days'),

-- ── Prop 10: Doctores (ARCHIVED) ──────────────────────────────────────────
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010',
 'properties/c10/cover.jpg',
 'https://cdn.localapartmentexperts.com/properties/c10/cover.jpg',
 'Departamento en Doctores con patio exclusivo', 0, TRUE, NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010',
 'properties/c10/patio.jpg',
 'https://cdn.localapartmentexperts.com/properties/c10/patio.jpg',
 'Patio privado de uso exclusivo', 1, FALSE, NOW() - INTERVAL '30 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITIES (property lifecycle events)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO activities (id, lead_id, property_id, actor_id, activity_type, metadata, created_at)
VALUES

-- ── Prop 1: Polanco ────────────────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_CREATED', '{"title":"Departamento de lujo en Polanco"}'::jsonb,
 NOW() - INTERVAL '25 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_PUBLISHED', '{"title":"Departamento de lujo en Polanco"}'::jsonb,
 NOW() - INTERVAL '20 days'),

-- ── Prop 2: Del Valle ─────────────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_CREATED', '{"title":"Departamento amplio en Del Valle"}'::jsonb,
 NOW() - INTERVAL '20 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_PUBLISHED', '{"title":"Departamento amplio en Del Valle"}'::jsonb,
 NOW() - INTERVAL '18 days'),

-- ── Prop 3: Roma Norte ────────────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_CREATED', '{"title":"Casa remodelada en Roma Norte"}'::jsonb,
 NOW() - INTERVAL '18 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_PUBLISHED', '{"title":"Casa remodelada en Roma Norte"}'::jsonb,
 NOW() - INTERVAL '15 days'),

-- ── Prop 4: Santa Fe ──────────────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_CREATED', '{"title":"Loft moderno en Santa Fe"}'::jsonb,
 NOW() - INTERVAL '15 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_PUBLISHED', '{"title":"Loft moderno en Santa Fe"}'::jsonb,
 NOW() - INTERVAL '12 days'),

-- ── Prop 5: Condesa ───────────────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_CREATED', '{"title":"Estudio amueblado en Condesa"}'::jsonb,
 NOW() - INTERVAL '12 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_PUBLISHED', '{"title":"Estudio amueblado en Condesa"}'::jsonb,
 NOW() - INTERVAL '10 days'),

-- ── Prop 6: Narvarte ──────────────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_CREATED', '{"title":"Departamento en Narvarte Poniente"}'::jsonb,
 NOW() - INTERVAL '10 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_PUBLISHED', '{"title":"Departamento en Narvarte Poniente"}'::jsonb,
 NOW() - INTERVAL '8 days'),

-- ── Prop 7: Coyoacán ──────────────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000007',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_CREATED', '{"title":"Departamento acogedor en Coyoacán"}'::jsonb,
 NOW() - INTERVAL '8 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000007',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_PUBLISHED', '{"title":"Departamento acogedor en Coyoacán"}'::jsonb,
 NOW() - INTERVAL '6 days'),

-- ── Prop 8: Interlomas (DRAFT) ────────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000008',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_CREATED', '{"title":"Casa en Interlomas con jardín","status":"DRAFT"}'::jsonb,
 NOW() - INTERVAL '5 days'),

-- ── Prop 9: Lomas Penthouse (DRAFT) ──────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000009',
 '00000000-0000-0000-0000-000000000001',
 'PROPERTY_CREATED', '{"title":"Penthouse en Lomas de Chapultepec","status":"DRAFT"}'::jsonb,
 NOW() - INTERVAL '3 days'),

-- ── Prop 10: Doctores (ARCHIVED) ─────────────────────────────────────────
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_CREATED', '{"title":"Departamento en Colonia Doctores"}'::jsonb,
 NOW() - INTERVAL '35 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_PUBLISHED', '{"title":"Departamento en Colonia Doctores"}'::jsonb,
 NOW() - INTERVAL '30 days'),
(gen_random_uuid(), NULL, 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_ARCHIVED', '{"title":"Departamento en Colonia Doctores","reason":"Arrendado a Laura Jiménez"}'::jsonb,
 NOW() - INTERVAL '5 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- LEAD ↔ PROPERTY LINKS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO lead_property_links (id, lead_id, property_id, link_type, note, created_by_user_id, created_at)
VALUES

-- Roberto (CONTACTED) · Condesa studio SUGGESTED, Narvarte apt SUGGESTED
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
 'SUGGESTED',
 'Amueblado, temporal 6 meses, zona céntrica. Muy buen match con su perfil.',
 '00000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '3 days'),
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006',
 'SUGGESTED',
 'Segunda opción: 2 recámaras en Narvarte, sin amueblar pero precio justo.',
 '00000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '3 days'),

-- Sofía (QUALIFIED) · Santa Fe loft INTERESTED, Interlomas casa INTERESTED
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004',
 'INTERESTED',
 'Le encantó la terraza y las vistas. Quiere que su esposo lo vea este fin de semana.',
 '00000000-0000-0000-0000-000000000003',
 NOW() - INTERVAL '2 days'),
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008',
 'SUGGESTED',
 'Casa en Interlomas: más espacio, zona escolar excelente. Pendiente publicación.',
 '00000000-0000-0000-0000-000000000003',
 NOW() - INTERVAL '2 days'),

-- Miguel (APPOINTMENT_SCHEDULED) · Del Valle apt INTERESTED
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002',
 'INTERESTED',
 'Cita hoy a las 11am. Le compartí fotos, le pareció perfecto. Verificar cuarto adicional para oficina.',
 '00000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '1 day'),
-- Miguel también vio Polanco pero lo rechazó por precio
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001',
 'REJECTED',
 'Fuera de presupuesto. $16,500 supera su techo de $22,000 pero prefiere no ir al límite.',
 '00000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '5 days'),

-- Laura (CLOSED_WON) · Doctores TOURED (the property she rented)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010',
 'TOURED',
 'Visitó la propiedad el día 20. Le encantó el patio y la ubicación. Decidió rentar.',
 '00000000-0000-0000-0000-000000000003',
 NOW() - INTERVAL '15 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITIES (lead ↔ property link events)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO activities (id, lead_id, property_id, actor_id, activity_type, metadata, created_at)
VALUES

-- Roberto ↔ Condesa (SUGGESTED)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_LINKED',
 '{"linkType":"SUGGESTED","propertyTitle":"Estudio amueblado en Condesa"}'::jsonb,
 NOW() - INTERVAL '3 days'),

-- Roberto ↔ Narvarte (SUGGESTED)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_LINKED',
 '{"linkType":"SUGGESTED","propertyTitle":"Departamento en Narvarte Poniente"}'::jsonb,
 NOW() - INTERVAL '3 days'),

-- Sofía ↔ Santa Fe (INTERESTED)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_LINKED',
 '{"linkType":"INTERESTED","propertyTitle":"Loft moderno en Santa Fe"}'::jsonb,
 NOW() - INTERVAL '2 days'),

-- Sofía ↔ Interlomas (SUGGESTED)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_LINKED',
 '{"linkType":"SUGGESTED","propertyTitle":"Casa en Interlomas con jardín"}'::jsonb,
 NOW() - INTERVAL '2 days'),

-- Miguel ↔ Del Valle (INTERESTED)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_LINKED',
 '{"linkType":"INTERESTED","propertyTitle":"Departamento amplio en Del Valle"}'::jsonb,
 NOW() - INTERVAL '1 day'),

-- Miguel ↔ Polanco (REJECTED)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002',
 'PROPERTY_LINKED',
 '{"linkType":"REJECTED","propertyTitle":"Departamento de lujo en Polanco"}'::jsonb,
 NOW() - INTERVAL '5 days'),

-- Laura ↔ Doctores (TOURED)
(gen_random_uuid(),
 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000003',
 'PROPERTY_LINKED',
 '{"linkType":"TOURED","propertyTitle":"Departamento en Colonia Doctores"}'::jsonb,
 NOW() - INTERVAL '15 days');
