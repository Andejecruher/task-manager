-- ============================================
-- SEED: 004_sample_tasks
-- DESCRIPCIÓN: Tareas de ejemplo para cada board
-- Tareas realistas con diferentes estados y prioridades
-- ============================================

BEGIN;

SET session_replication_role = 'replica';

-- ====================
-- TAREAS PARA SPRINT Q4 2024 (TechCorp)
-- ====================
INSERT INTO tasks (
    id,
    company_id,
    workspace_id,
    board_id,
    column_id,
    title,
    description,
    description_html,
    status,
    priority,
    assignee_id,
    tags,
    due_date,
    time_estimate,
    created_by,
    updated_by,
    created_at,
    updated_at
) VALUES
-- Tarea 1: Implementar login con Google
(
    '10101010-1010-1010-1010-101010101010',
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '88888888-8888-8888-8888-888888888881',
    '66666666-6666-6666-6666-666666666665', -- done
    'Implementar autenticación con Google OAuth',
    'Integrar Google OAuth 2.0 para autenticación de usuarios. Incluir flujo completo de login, refresh tokens y manejo de sesiones.',
    '<p>Integrar Google OAuth 2.0 para autenticación de usuarios.</p><p><strong>Requisitos:</strong></p><ul><li>Flujo completo de login</li><li>Refresh tokens automáticos</li><li>Manejo de sesiones persistentes</li><li>Logout global</li></ul>',
    'done',
    'high',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    ARRAY['backend', 'auth', 'security'],
    NOW() - INTERVAL '3 days',
    480, -- 8 horas
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 days'
),
-- Tarea 2: Diseñar nuevo dashboard
(
    '10101010-1010-1010-1010-101010101011',
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '88888888-8888-8888-8888-888888888881',
    '66666666-6666-6666-6666-666666666663', -- in_progress
    'Diseñar nuevo dashboard de analytics',
    'Crear wireframes y mockups para el nuevo dashboard de analytics con métricas clave del negocio.',
    '<p>Crear wireframes y mockups para el nuevo dashboard de analytics.</p><p><strong>Métricas a incluir:</strong></p><ul><li>Usuarios activos</li><li>Tareas completadas</li><li>Tiempo promedio por tarea</li><li>Productividad por equipo</li></ul>',
    'in_progress',
    'medium',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    ARRAY['design', 'frontend', 'analytics'],
    NOW() + INTERVAL '5 days',
    720, -- 12 horas
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 day'
),
-- Tarea 3: Optimizar queries de base de datos
(
    '10101010-1010-1010-1010-101010101012',
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '88888888-8888-8888-8888-888888888881',
    '66666666-6666-6666-6666-666666666662', -- todo
    'Optimizar queries lentas en módulo de reportes',
    'Identificar y optimizar las queries más lentas en el módulo de reportes. Crear índices necesarios.',
    '<p>Identificar y optimizar las queries más lentas en el módulo de reportes.</p><p><strong>Áreas críticas:</strong></p><ul><li>Reporte de actividad mensual</li><li>Dashboard de métricas</li><li>Historial de cambios</li><li>Búsqueda de tareas</li></ul>',
    'todo',
    'high',
    NULL,
    ARRAY['backend', 'database', 'performance'],
    NOW() + INTERVAL '7 days',
    960, -- 16 horas
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NULL,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
-- Tarea 4: Implementar notificaciones push
(
    '10101010-1010-1010-1010-101010101013',
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '88888888-8888-8888-8888-888888888881',
    '66666666-6666-6666-6666-666666666664', -- review
    'Implementar notificaciones push en tiempo real',
    'Usar WebSockets para notificaciones en tiempo real cuando se asignan tareas o hay comentarios.',
    '<p>Usar WebSockets para notificaciones en tiempo real.</p><p><strong>Eventos a notificar:</strong></p><ul><li>Asignación de tareas</li><li>Nuevos comentarios</li><li>Cambios de estado</li><li>Menciones</li></ul>',
    'review',
    'medium',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    ARRAY['backend', 'realtime', 'websockets'],
    NOW() + INTERVAL '2 days',
    600, -- 10 horas
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    NOW() - INTERVAL '3 days',
    NOW()
),

-- ====================
-- TAREAS PARA BUGS & MEJORAS (TechCorp)
-- ====================
-- Bug 1: Error al exportar reportes
(
    '12121212-1212-1212-1212-121212121212',
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '88888888-8888-8888-8888-888888888882',
    '77777777-7777-7777-7777-777777777773', -- fixing
    'Error al exportar reportes a Excel con más de 1000 registros',
    'Cuando se intenta exportar un reporte con más de 1000 registros, la aplicación se bloquea y muestra error de memoria.',
    '<p><strong>Error:</strong> Cuando se intenta exportar un reporte con más de 1000 registros, la aplicación se bloquea.</p><p><strong>Stack trace:</strong></p><pre>MemoryError: Cannot allocate 512MB<br>at exportToExcel (line 245)</pre>',
    'in_progress',
    'urgent',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    ARRAY['bug', 'export', 'performance'],
    NOW() + INTERVAL '1 day',
    240, -- 4 horas
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '1 day',
    NOW()
),

(
    '13131313-1313-1313-1313-131313131313',
    '22222222-2222-2222-2222-222222222222',
    'ffffffff-ffff-ffff-ffff-fffffffffff1',
    '88888888-8888-8888-8888-888888888882',
    '99999999-9999-9999-9999-999999999992', -- design
    'Diseñar banners para campaña navideña',
    'Crear 5 diseños de banners en diferentes tamaños para Google Display Network con temática navideña.',
    '<p>Crear 5 diseños de banners para Google Display Network.</p><p><strong>Tamaños requeridos:</strong></p><ul><li>300x250</li><li>728x90</li><li>160x600</li><li>300x600</li><li>970x250</li></ul>',
    'in_progress',
    'high',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    ARRAY['design', 'google', 'christmas'],
    NOW() + INTERVAL '3 days',
    1200, -- 20 horas
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    NOW() - INTERVAL '5 days',
    NOW()
),

-- ====================
-- TAREAS PARA ACME CORP (Business Consultants)
-- ====================
(
    '14141414-1414-1414-1414-141414141414',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444441',
    '77777777-7777-7777-7777-777777777771',
    '22222222-2222-2222-2222-222222222224', -- discovery
    'Análisis de procesos actuales de Acme Corp',
    'Realizar entrevistas con stakeholders y mapear procesos actuales para identificar áreas de mejora.',
    '<p>Realizar entrevistas con stakeholders y mapear procesos actuales.</p><p><strong>Departamentos a analizar:</strong></p><ul><li>Ventas</li><li>Operaciones</li><li>TI</li><li>Finanzas</li></ul>',
    'todo',
    'medium',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    ARRAY['discovery', 'analysis', 'consulting'],
    NOW() + INTERVAL '10 days',
    2400, -- 40 horas
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);

-- ====================
-- HISTORIAL DE TAREAS (para auditoría)
-- ====================
INSERT INTO task_history (
    id,
    company_id,
    task_id,
    action,
    field_changed,
    old_value,
    new_value,
    change_description,
    changed_by,
    changed_at
) VALUES
-- Historial para tarea 1
(
    '15151515-1515-1515-1515-151515151511',
    '11111111-1111-1111-1111-111111111111',
    '10101010-1010-1010-1010-101010101010',
    'created',
    NULL,
    NULL,
    '{"title": "Implementar autenticación con Google OAuth"}'::jsonb,
    'Tarea creada',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '10 days'
),
(
    '15151515-1515-1515-1515-151515151512',
    '11111111-1111-1111-1111-111111111111',
    '10101010-1010-1010-1010-101010101010',
    'status_changed',
    'status',
    '"todo"'::jsonb,
    '"in_progress"'::jsonb,
    'Comenzando implementación',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '8 days'
),
(
    '15151515-1515-1515-1515-151515151513',
    '11111111-1111-1111-1111-111111111111',
    '10101010-1010-1010-1010-101010101010',
    'assigned',
    'assignee_id',
    NULL,
    '"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"'::jsonb,
    'Asignada a Ana García',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '8 days'
),
(
    '15151515-1515-1515-1515-151515151514',
    '11111111-1111-1111-1111-111111111111',
    '10101010-1010-1010-1010-101010101010',
    'status_changed',
    'status',
    '"in_progress"'::jsonb,
    '"done"'::jsonb,
    'Implementación completada y testeada',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '2 days'
);

SET session_replication_role = 'origin';

COMMIT;

-- Verificación
SELECT 
    t.board_id,
    b.name as board_name,
    COUNT(*) as task_count,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed,
    COUNT(CASE WHEN t.assignee_id IS NOT NULL THEN 1 END) as assigned,
    AVG(t.time_estimate) as avg_estimate_hours
FROM tasks t
JOIN boards b ON t.board_id = b.id
GROUP BY t.board_id, b.name
ORDER BY b.name;