-- ============================================
-- SEED: 003_sample_boards
-- DESCRIPCIÓN: Tableros Kanban y columnas para cada workspace
-- ============================================

BEGIN;

SET session_replication_role = 'replica';

-- ====================
-- BOARDS PARA TECHCORP - PRODUCTO PRINCIPAL
-- ====================
INSERT INTO boards (
    id,
    company_id,
    workspace_id,
    name,
    slug,
    description,
    settings,
    created_by,
    created_at,
    updated_at
) VALUES
-- Sprint Actual
(
    '88888888-8888-8888-8888-888888888881',
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'Sprint Q4 2024',
    'sprint-q4-2024',
    'Sprint actual de desarrollo - Octubre 2024',
    '{
        "columns": ["backlog", "todo", "in_progress", "review", "done"],
        "defaultView": "board",
        "allowComments": true,
        "allowAttachments": true,
        "taskNumbering": true,
        "wipLimits": {
            "in_progress": 3,
            "review": 2
        }
    }'::jsonb,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '27 days',
    NOW()
),
-- Bugs y Mejoras
(
    '88888888-8888-8888-8888-888888888882',
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'Bugs & Mejoras',
    'bugs-mejoras',
    'Seguimiento de bugs reportados y mejoras sugeridas',
    '{
        "columns": ["reported", "investigating", "fixing", "testing", "resolved"],
        "defaultView": "board",
        "allowComments": true,
        "allowAttachments": true,
        "priorityColors": true
    }'::jsonb,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '20 days',
    NOW()
),

-- ====================
-- BOARDS PARA CREATIVE AGENCY
-- ====================
-- Campaña Google 2024
(
    '55555555-5555-5555-5555-555555555551',
    '22222222-2222-2222-2222-222222222222',
    'ffffffff-ffff-ffff-ffff-fffffffffff1',
    'Campaña Google Q4',
    'campana-google-q4',
    'Campaña publicitaria para Google Ads - Temporada navideña',
    '{
        "columns": ["planning", "design", "copywriting", "approval", "live"],
        "defaultView": "board",
        "budget": 50000,
        "currency": "MXN",
        "client": "Google México"
    }'::jsonb,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    NOW() - INTERVAL '12 days',
    NOW()
),

-- ====================
-- BOARDS PARA BUSINESS CONSULTANTS
-- ====================
-- Proyecto Acme Corp
(
    '77777777-7777-7777-7777-777777777771',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444441',
    'Acme Corp - Transformación Digital',
    'acme-corp-transformacion',
    'Proyecto de transformación digital para Acme Corporation',
    '{
        "columns": ["discovery", "planning", "execution", "review", "delivery"],
        "defaultView": "board",
        "hourlyRate": 200,
        "currency": "USD",
        "timeline": "3 meses"
    }'::jsonb,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    NOW() - INTERVAL '5 days',
    NOW()
);

-- ====================
-- COLUMNAS PARA CADA BOARD
-- ====================

-- Columnas para Sprint Q4 2024
INSERT INTO board_columns (id, board_id, company_id, name, slug, color, position, wip_limit) VALUES
('66666666-6666-6666-6666-666666666661', '88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'Backlog', 'backlog', '#6B7280', 0, NULL),
('66666666-6666-6666-6666-666666666662', '88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'Por Hacer', 'todo', '#3B82F6', 1, NULL),
('66666666-6666-6666-6666-666666666663', '88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'En Progreso', 'in_progress', '#F59E0B', 2, 3),
('66666666-6666-6666-6666-666666666664', '88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'En Revisión', 'review', '#8B5CF6', 3, 2),
('66666666-6666-6666-6666-666666666665', '88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'Completado', 'done', '#10B981', 4, NULL);

-- Columnas para Bugs & Mejoras
INSERT INTO board_columns (id, board_id, company_id, name, slug, color, position) VALUES
('22222222-2222-2222-2222-222222222221', '88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', 'Reportado', 'reported', '#EF4444', 0),
('22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', 'Investigando', 'investigating', '#F59E0B', 1),
('22222222-2222-2222-2222-222222222223', '88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', 'Corrigiendo', 'fixing', '#3B82F6', 2),
('22222222-2222-2222-2222-222222222224', '88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', 'Probando', 'testing', '#8B5CF6', 3),
('22222222-2222-2222-2222-222222222225', '88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', 'Resuelto', 'resolved', '#10B981', 4);

-- Columnas para Campaña Google
INSERT INTO board_columns (id, board_id, company_id, name, slug, color, position) VALUES
('99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', 'Planificación', 'planning', '#3B82F6', 0),
('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', 'Diseño', 'design', '#EC4899', 1),
('99999999-9999-9999-9999-999999999993', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', 'Copywriting', 'copywriting', '#10B981', 2),
('99999999-9999-9999-9999-999999999994', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', 'Aprobación', 'approval', '#F59E0B', 3),
('99999999-9999-9999-9999-999999999995', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', 'En Vivo', 'live', '#06B6D4', 4);

-- Columnas para Acme Corp
INSERT INTO board_columns (id, board_id, company_id, name, slug, color, position) VALUES
('77777777-7777-7777-7777-777777777781', '77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333333', 'Discovery', 'discovery', '#3B82F6', 0),
('77777777-7777-7777-7777-777777777782', '77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333333', 'Planificación', 'planning', '#8B5CF6', 1),
('77777777-7777-7777-7777-777777777783', '77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333333', 'Ejecución', 'execution', '#10B981', 2),
('77777777-7777-7777-7777-777777777784', '77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333333', 'Revisión', 'review', '#F59E0B', 3),
('77777777-7777-7777-7777-777777777785', '77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333333', 'Entrega', 'delivery', '#06B6D4', 4);

SET session_replication_role = 'origin';

COMMIT;

-- Verificación
SELECT 
    b.workspace_id,
    w.name as workspace_name,
    COUNT(DISTINCT b.id) as board_count,
    COUNT(DISTINCT bc.id) as column_count
FROM boards b
JOIN workspaces w ON b.workspace_id = w.id
LEFT JOIN board_columns bc ON b.id = bc.board_id
GROUP BY b.workspace_id, w.name
ORDER BY w.name;