-- ─────────────────────────────────────────────────────────────────────────────
-- V8 · seed_leads
-- 6 realistic sample leads across multiple statuses.
-- Each lead includes matching status_history, assignments, notes, and activities
-- so the UI timeline renders meaningful data from first boot.
--
-- User references:
--   Admin   → '00000000-0000-0000-0000-000000000001'
--   María   → '00000000-0000-0000-0000-000000000002'
--   Carlos  → '00000000-0000-0000-0000-000000000003'
--
-- Lead UUIDs use 'b' prefix to distinguish from user UUIDs at a glance.
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- LEADS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO leads (
    id, first_name, last_name, email, phone, whatsapp_number,
    preferred_contact_method, source,
    move_in_date, budget_min, budget_max,
    preferred_neighborhoods, bedroom_count, bathroom_count,
    message, language_preference, urgency_level, status,
    last_contact_date, next_follow_up_date, assigned_user_id,
    created_at, updated_at
)
VALUES

-- ── Lead 1: NEW · unassigned ───────────────────────────────────────────────
(
    'b0000000-0000-0000-0000-000000000001',
    'Ana', 'Torres',
    'ana.torres@email.com', '+52 55 1234 5678', '+52 55 1234 5678',
    'WHATSAPP', 'WEBSITE',
    (NOW() + INTERVAL '45 days')::DATE,
    12000.00, 18000.00,
    ARRAY['Polanco', 'Lomas de Chapultepec'],
    2, 1,
    'Busco departamento amueblado cerca del metro. Tengo mascota (perro pequeño). '
    || 'Preferiblemente con estacionamiento.',
    'es', 'HIGH', 'NEW',
    NULL, (NOW() + INTERVAL '1 day')::DATE, NULL,
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
),

-- ── Lead 2: CONTACTED · assigned to María ─────────────────────────────────
(
    'b0000000-0000-0000-0000-000000000002',
    'Roberto', 'Mendoza',
    'roberto.mendoza@gmail.com', '+52 55 9876 5432', NULL,
    'PHONE', 'FACEBOOK',
    (NOW() + INTERVAL '30 days')::DATE,
    8000.00, 12000.00,
    ARRAY['Condesa', 'Roma Norte', 'Narvarte'],
    1, 1,
    'Vengo de Guadalajara por trabajo. Necesito algo temporal por 6 meses '
    || 'con opción a renovar. Sin muebles está bien.',
    'es', 'MEDIUM', 'CONTACTED',
    (NOW() - INTERVAL '3 days')::DATE, (NOW() + INTERVAL '4 days')::DATE,
    '00000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days'
),

-- ── Lead 3: QUALIFIED · assigned to Carlos ────────────────────────────────
(
    'b0000000-0000-0000-0000-000000000003',
    'Sofía', 'Reyes',
    'sofia.reyes@empresa.mx', '+52 55 5555 4444', '+52 55 5555 4444',
    'EMAIL', 'REFERRAL',
    (NOW() + INTERVAL '60 days')::DATE,
    25000.00, 38000.00,
    ARRAY['Santa Fe', 'Interlomas', 'Pedregal'],
    3, 2,
    'Me recomendaron con ustedes. Busco algo para mi familia (2 adultos, 2 niños). '
    || 'Necesito colegio cercano y zona tranquila.',
    'es', 'MEDIUM', 'QUALIFIED',
    (NOW() - INTERVAL '2 days')::DATE, (NOW() + INTERVAL '7 days')::DATE,
    '00000000-0000-0000-0000-000000000003',
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'
),

-- ── Lead 4: APPOINTMENT_SCHEDULED · assigned to María · due today ─────────
(
    'b0000000-0000-0000-0000-000000000004',
    'Miguel', 'Fernández',
    'mfernandez@correo.com', '+52 55 7777 8888', '+52 55 7777 8888',
    'WHATSAPP', 'WEBSITE',
    (NOW() + INTERVAL '20 days')::DATE,
    16000.00, 22000.00,
    ARRAY['Del Valle', 'Narvarte', 'Benito Juárez'],
    2, 2,
    'Pareja sin hijos. Ambos trabajamos desde casa, necesitamos cuarto adicional '
    || 'para oficina. Edificio con gimnasio ideal.',
    'es', 'CRITICAL', 'APPOINTMENT_SCHEDULED',
    NOW()::DATE, NOW()::DATE,
    '00000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '1 day'
),

-- ── Lead 5: CLOSED_WON · assigned to Carlos ───────────────────────────────
(
    'b0000000-0000-0000-0000-000000000005',
    'Laura', 'Jiménez',
    'laurajimenez@hotmail.com', '+52 55 3333 2222', NULL,
    'PHONE', 'WALKIN',
    (NOW() - INTERVAL '10 days')::DATE,
    9000.00, 13000.00,
    ARRAY['Doctores', 'Obrera', 'Centro'],
    1, 1,
    'Estudiante de posgrado. Busco algo económico y seguro, cerca de metro. '
    || 'Pago puntual garantizado.',
    'es', 'HIGH', 'CLOSED_WON',
    (NOW() - INTERVAL '5 days')::DATE, NULL,
    '00000000-0000-0000-0000-000000000003',
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'
),

-- ── Lead 6: UNRESPONSIVE · assigned to María · OVERDUE ────────────────────
(
    'b0000000-0000-0000-0000-000000000006',
    'Andrés', 'Morales',
    NULL, '+52 55 6666 1111', '+52 55 6666 1111',
    'WHATSAPP', 'FACEBOOK',
    NULL,
    11000.00, 16000.00,
    ARRAY['Coyoacán', 'Pedregal', 'Ajusco'],
    2, 1,
    'Sin mensaje. Captado por anuncio de Facebook. Intentó contactar por WhatsApp '
    || 'pero no ha respondido desde entonces.',
    'es', 'LOW', 'UNRESPONSIVE',
    (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '3 days')::DATE,
    '00000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '10 days'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- STATUS HISTORY
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO lead_status_history (id, lead_id, from_status, to_status, changed_by, note, created_at)
VALUES

-- Lead 1 · NEW (fresh, just created)
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001',
 NULL, 'NEW', '00000000-0000-0000-0000-000000000001', 'Lead ingresado desde formulario web.',
 NOW() - INTERVAL '2 hours'),

-- Lead 2 · NEW → CONTACT_ATTEMPTED → CONTACTED
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 NULL, 'NEW', '00000000-0000-0000-0000-000000000002', NULL,
 NOW() - INTERVAL '8 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 'NEW', 'CONTACT_ATTEMPTED', '00000000-0000-0000-0000-000000000002',
 'Llamada sin respuesta. Dejé buzón de voz.',
 NOW() - INTERVAL '7 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 'CONTACT_ATTEMPTED', 'CONTACTED', '00000000-0000-0000-0000-000000000002',
 'Respondió al segundo intento. Interesado, confirma presupuesto.',
 NOW() - INTERVAL '3 days'),

-- Lead 3 · NEW → CONTACTED → QUALIFIED
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 NULL, 'NEW', '00000000-0000-0000-0000-000000000001', NULL,
 NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 'NEW', 'CONTACTED', '00000000-0000-0000-0000-000000000003',
 'Primera llamada exitosa. Confirmó necesidades y presupuesto.',
 NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 'CONTACTED', 'QUALIFIED', '00000000-0000-0000-0000-000000000003',
 'Perfil calificado: presupuesto sólido, urgencia media, zona definida.',
 NOW() - INTERVAL '2 days'),

-- Lead 4 · NEW → CONTACTED → QUALIFIED → APPOINTMENT_SCHEDULED
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 NULL, 'NEW', '00000000-0000-0000-0000-000000000001', NULL,
 NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 'NEW', 'CONTACTED', '00000000-0000-0000-0000-000000000002',
 'Primer contacto por WhatsApp. Muy interesado.',
 NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 'CONTACTED', 'QUALIFIED', '00000000-0000-0000-0000-000000000002',
 'Verificado: trabajo estable, buen historial. Lista corta de 3 propiedades.',
 NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 'QUALIFIED', 'APPOINTMENT_SCHEDULED', '00000000-0000-0000-0000-000000000002',
 'Cita confirmada para hoy a las 11am. Ver departamento en Del Valle.',
 NOW() - INTERVAL '1 day'),

-- Lead 5 · NEW → CONTACTED → QUALIFIED → APPOINTMENT_SCHEDULED → APPLICATION_IN_PROGRESS → CLOSED_WON
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 NULL, 'NEW', '00000000-0000-0000-0000-000000000001', NULL,
 NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 'NEW', 'CONTACTED', '00000000-0000-0000-0000-000000000003',
 'Entró directamente a la oficina. Perfil claro desde el primer momento.',
 NOW() - INTERVAL '28 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 'CONTACTED', 'QUALIFIED', '00000000-0000-0000-0000-000000000003',
 'Documentación lista, aval confirmado.',
 NOW() - INTERVAL '24 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 'QUALIFIED', 'APPOINTMENT_SCHEDULED', '00000000-0000-0000-0000-000000000003',
 'Cita para ver 2 propiedades en Doctores.',
 NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 'APPOINTMENT_SCHEDULED', 'APPLICATION_IN_PROGRESS', '00000000-0000-0000-0000-000000000003',
 'Le encantó la primera propiedad. Comenzando trámites.',
 NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 'APPLICATION_IN_PROGRESS', 'CLOSED_WON', '00000000-0000-0000-0000-000000000003',
 'Contrato firmado. Entrega de llaves el 15 del mes.',
 NOW() - INTERVAL '5 days'),

-- Lead 6 · NEW → CONTACT_ATTEMPTED → UNRESPONSIVE
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 NULL, 'NEW', '00000000-0000-0000-0000-000000000002', NULL,
 NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 'NEW', 'CONTACT_ATTEMPTED', '00000000-0000-0000-0000-000000000002',
 'WhatsApp enviado. Mensaje leído (doble palomita azul) pero sin respuesta.',
 NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 'CONTACT_ATTEMPTED', 'UNRESPONSIVE', '00000000-0000-0000-0000-000000000002',
 '3 intentos sin respuesta en 5 días.',
 NOW() - INTERVAL '10 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- LEAD ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO lead_assignments (id, lead_id, assigned_to_id, assigned_by_id, created_at)
VALUES

-- Lead 2: assigned to María by Admin
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '8 days'),

-- Lead 3: assigned to Carlos by Admin
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '15 days'),

-- Lead 4: first assigned to Carlos, then reassigned to María
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '11 days'),

-- Lead 5: assigned to Carlos by Admin
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '30 days'),

-- Lead 6: assigned to María by Admin
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '18 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- LEAD NOTES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO lead_notes (id, lead_id, author_id, body, created_at)
VALUES

-- Lead 2 (Roberto · CONTACTED)
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'Roberto confirmó que viene por trabajo en corporativo de Reforma. '
 || 'Contrato temporal 6 meses con opción a indefinido. '
 || 'Le envié lista de 4 departamentos en Condesa y Roma Norte.',
 NOW() - INTERVAL '3 days'),

-- Lead 3 (Sofía · QUALIFIED)
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'Sofía fue referida por el cliente Martínez (cerrado en enero). '
 || 'Familia de 4, requiere al menos 120m2. '
 || 'Prioridad: buenas escuelas en la zona.',
 NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'Le presenté 2 opciones en Santa Fe. Ambas gustan. '
 || 'Espera visita de su esposo el próximo fin de semana para decidir.',
 NOW() - INTERVAL '2 days'),

-- Lead 4 (Miguel · APPOINTMENT_SCHEDULED)
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000002',
 'Cita confirmada para hoy a las 11:00 AM. '
 || 'Departamento en Av. División del Norte 1850, piso 7. '
 || 'Llevar contrato borrador por si deciden hoy.',
 NOW() - INTERVAL '1 day'),

-- Lead 5 (Laura · CLOSED_WON)
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003',
 'Cierre exitoso. Departamento en Calle Dr. Navarro 45, Col. Doctores. '
 || 'Renta mensual $10,500. Depósito 1 mes + 1 mes adelantado. '
 || 'Entrega de llaves coordinada con propietario para el día 15.',
 NOW() - INTERVAL '5 days'),

-- Lead 6 (Andrés · UNRESPONSIVE)
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'Intento 1: WhatsApp (leído, sin respuesta). '
 || 'Intento 2: Llamada (buzón). '
 || 'Intento 3: WhatsApp con brochure adjunto (no leído). '
 || 'Marcar para re-contactar en 2 semanas si no responde.',
 NOW() - INTERVAL '10 days');


-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITIES (unified timeline — one entry per event)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO activities (id, lead_id, actor_id, activity_type, metadata, created_at)
VALUES

-- ── Lead 1 ────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 'LEAD_CREATED', '{}'::jsonb,
 NOW() - INTERVAL '2 hours'),

-- ── Lead 2 ────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'LEAD_CREATED', '{}'::jsonb,
 NOW() - INTERVAL '8 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 'ASSIGNED',
 '{"assignedToId":"00000000-0000-0000-0000-000000000002","assignedToName":"María García"}'::jsonb,
 NOW() - INTERVAL '8 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'STATUS_CHANGED', '{"from":"NEW","to":"CONTACT_ATTEMPTED"}'::jsonb,
 NOW() - INTERVAL '7 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'FOLLOW_UP_SET',
 ('{"date":"' || (NOW() + INTERVAL '4 days')::DATE || '"}')::jsonb,
 NOW() - INTERVAL '7 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'STATUS_CHANGED', '{"from":"CONTACT_ATTEMPTED","to":"CONTACTED"}'::jsonb,
 NOW() - INTERVAL '3 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000002',
 'NOTE_ADDED',
 '{"preview":"Roberto confirmó que viene por trabajo en corporativo de Reforma..."}'::jsonb,
 NOW() - INTERVAL '3 days'),

-- ── Lead 3 ────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'LEAD_CREATED', '{}'::jsonb,
 NOW() - INTERVAL '15 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'ASSIGNED',
 '{"assignedToId":"00000000-0000-0000-0000-000000000003","assignedToName":"Carlos Rodríguez"}'::jsonb,
 NOW() - INTERVAL '15 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'STATUS_CHANGED', '{"from":"NEW","to":"CONTACTED"}'::jsonb,
 NOW() - INTERVAL '12 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'NOTE_ADDED',
 '{"preview":"Sofía fue referida por el cliente Martínez (cerrado en enero)..."}'::jsonb,
 NOW() - INTERVAL '12 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'STATUS_CHANGED', '{"from":"CONTACTED","to":"QUALIFIED"}'::jsonb,
 NOW() - INTERVAL '2 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'NOTE_ADDED',
 '{"preview":"Le presenté 2 opciones en Santa Fe. Ambas gustan..."}'::jsonb,
 NOW() - INTERVAL '2 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000003',
 'FOLLOW_UP_SET',
 ('{"date":"' || (NOW() + INTERVAL '7 days')::DATE || '"}')::jsonb,
 NOW() - INTERVAL '2 days'),

-- ── Lead 4 ────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 'LEAD_CREATED', '{}'::jsonb,
 NOW() - INTERVAL '12 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 'ASSIGNED',
 '{"assignedToId":"00000000-0000-0000-0000-000000000003","assignedToName":"Carlos Rodríguez"}'::jsonb,
 NOW() - INTERVAL '12 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 'ASSIGNED',
 '{"assignedToId":"00000000-0000-0000-0000-000000000002","assignedToName":"María García"}'::jsonb,
 NOW() - INTERVAL '11 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000002',
 'STATUS_CHANGED', '{"from":"NEW","to":"CONTACTED"}'::jsonb,
 NOW() - INTERVAL '10 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000002',
 'STATUS_CHANGED', '{"from":"CONTACTED","to":"QUALIFIED"}'::jsonb,
 NOW() - INTERVAL '5 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000002',
 'STATUS_CHANGED', '{"from":"QUALIFIED","to":"APPOINTMENT_SCHEDULED"}'::jsonb,
 NOW() - INTERVAL '1 day'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000002',
 'NOTE_ADDED',
 '{"preview":"Cita confirmada para hoy a las 11:00 AM..."}'::jsonb,
 NOW() - INTERVAL '1 day'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000002',
 'FOLLOW_UP_SET',
 ('{"date":"' || NOW()::DATE || '"}')::jsonb,
 NOW() - INTERVAL '1 day'),

-- ── Lead 5 ────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000001',
 'LEAD_CREATED', '{}'::jsonb,
 NOW() - INTERVAL '30 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000001',
 'ASSIGNED',
 '{"assignedToId":"00000000-0000-0000-0000-000000000003","assignedToName":"Carlos Rodríguez"}'::jsonb,
 NOW() - INTERVAL '30 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003',
 'STATUS_CHANGED', '{"from":"NEW","to":"CONTACTED"}'::jsonb,
 NOW() - INTERVAL '28 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003',
 'STATUS_CHANGED', '{"from":"CONTACTED","to":"QUALIFIED"}'::jsonb,
 NOW() - INTERVAL '24 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003',
 'STATUS_CHANGED', '{"from":"QUALIFIED","to":"APPOINTMENT_SCHEDULED"}'::jsonb,
 NOW() - INTERVAL '20 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003',
 'STATUS_CHANGED', '{"from":"APPOINTMENT_SCHEDULED","to":"APPLICATION_IN_PROGRESS"}'::jsonb,
 NOW() - INTERVAL '15 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003',
 'STATUS_CHANGED', '{"from":"APPLICATION_IN_PROGRESS","to":"CLOSED_WON"}'::jsonb,
 NOW() - INTERVAL '5 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000003',
 'NOTE_ADDED',
 '{"preview":"Cierre exitoso. Departamento en Calle Dr. Navarro 45, Col. Doctores..."}'::jsonb,
 NOW() - INTERVAL '5 days'),

-- ── Lead 6 ────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'LEAD_CREATED', '{}'::jsonb,
 NOW() - INTERVAL '18 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000001',
 'ASSIGNED',
 '{"assignedToId":"00000000-0000-0000-0000-000000000002","assignedToName":"María García"}'::jsonb,
 NOW() - INTERVAL '18 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'STATUS_CHANGED', '{"from":"NEW","to":"CONTACT_ATTEMPTED"}'::jsonb,
 NOW() - INTERVAL '15 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'FOLLOW_UP_SET',
 ('{"date":"' || (NOW() - INTERVAL '3 days')::DATE || '"}')::jsonb,
 NOW() - INTERVAL '15 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'STATUS_CHANGED', '{"from":"CONTACT_ATTEMPTED","to":"UNRESPONSIVE"}'::jsonb,
 NOW() - INTERVAL '10 days'),

(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000002',
 'NOTE_ADDED',
 '{"preview":"Intento 1: WhatsApp (leído, sin respuesta). Intento 2: Llamada (buzón)..."}'::jsonb,
 NOW() - INTERVAL '10 days');
