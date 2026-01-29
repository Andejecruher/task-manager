-- ============================================
-- SEED: 002_sample_workspaces
-- DESCRIPCIÓN: Workspaces de ejemplo para cada empresa
-- ============================================

BEGIN;

-- Desactivar triggers temporales
SET session_replication_role = 'replica';

-- ====================
-- WORKSPACES PARA TECHCORP
-- ====================
INSERT INTO workspaces (
    id,
    company_id,
    name,
    slug,
    description,
    icon,
    color,
    settings,
    created_by,
    created_at,
    updated_at
) VALUES
-- Producto principal
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '11111111-1111-1111-1111-111111111111',
    'Producto Principal',
    'producto-principal',
    'Desarrollo y mantenimiento del producto principal de la empresa',
    'rocket',
    '#3B82F6',
    '{
        "taskPrefix": "PROD",
        "defaultBoard": null,
        "permissions": {
            "canCreateBoards": ["admin", "manager"],
            "canInviteMembers": ["admin", "manager"],
            "canDeleteTasks": ["admin"]
        }
    }'::jsonb,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '28 days',
    NOW()
),
-- Marketing y Ventas
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    '11111111-1111-1111-1111-111111111111',
    'Marketing & Ventas',
    'marketing-ventas',
    'Campañas de marketing, seguimiento de leads y estrategias de ventas',
    'trending-up',
    '#10B981',
    '{
        "taskPrefix": "MKT",
        "defaultBoard": null,
        "permissions": {
            "canCreateBoards": ["admin", "manager", "member"],
            "canInviteMembers": ["admin", "manager"],
            "canDeleteTasks": ["admin", "manager"]
        }
    }'::jsonb,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '25 days',
    NOW()
),
-- Recursos Humanos
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
    '11111111-1111-1111-1111-111111111111',
    'Recursos Humanos',
    'recursos-humanos',
    'Gestión de empleados, onboarding, y desarrollo organizacional',
    'users',
    '#8B5CF6',
    '{
        "taskPrefix": "RH",
        "defaultBoard": null,
        "permissions": {
            "canCreateBoards": ["admin"],
            "canInviteMembers": ["admin"],
            "canDeleteTasks": ["admin"]
        },
        "confidential": true
    }'::jsonb,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '20 days',
    NOW()
),

-- ====================
-- WORKSPACES PARA CREATIVE AGENCY
-- ====================
-- Proyectos de Clientes
(
    'ffffffff-ffff-ffff-ffff-fffffffffff1',
    '22222222-2222-2222-2222-222222222222',
    'Proyectos de Clientes',
    'proyectos-clientes',
    'Gestión de todos los proyectos activos con clientes',
    'briefcase',
    '#F59E0B',
    '{
        "taskPrefix": "CLIENT",
        "defaultBoard": null,
        "budgetTracking": true,
        "timeTracking": true
    }'::jsonb,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    NOW() - INTERVAL '14 days',
    NOW()
),
-- Diseño Interno
(
    'ffffffff-ffff-ffff-ffff-fffffffffff2',
    '22222222-2222-2222-2222-222222222222',
    'Diseño Interno',
    'diseno-interno',
    'Proyectos internos de branding y mejora de procesos',
    'palette',
    '#EC4899',
    '{
        "taskPrefix": "DESIGN",
        "defaultBoard": null
    }'::jsonb,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    NOW() - INTERVAL '10 days',
    NOW()
),

-- ====================
-- WORKSPACES PARA BUSINESS CONSULTANTS
-- ====================
-- Consultorías Activas
(
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333333',
    'Consultorías Activas',
    'consultorias-activas',
    'Seguimiento de todos los proyectos de consultoría en curso',
    'bar-chart',
    '#06B6D4',
    '{
        "taskPrefix": "CONS",
        "defaultBoard": null,
        "hourlyRate": 150,
        "currency": "USD"
    }'::jsonb,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    NOW() - INTERVAL '6 days',
    NOW()
),
-- Desarrollo de Negocio
(
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333333',
    'Desarrollo de Negocio',
    'desarrollo-negocio',
    'Estrategias de crecimiento y adquisición de nuevos clientes',
    'target',
    '#8B5CF6',
    '{
        "taskPrefix": "BIZDEV",
        "defaultBoard": null
    }'::jsonb,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    NOW() - INTERVAL '3 days',
    NOW()
);

-- ====================
-- MIEMBROS DE WORKSPACES
-- ====================
INSERT INTO workspace_members (
    workspace_id,
    user_id,
    company_id,
    role,
    notification_settings,
    joined_at
) VALUES
-- TechCorp - Producto Principal
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'admin', '{}'::jsonb, NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'member', '{}'::jsonb, NOW()),

-- TechCorp - Marketing & Ventas
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'admin', '{}'::jsonb, NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'admin', '{}'::jsonb, NOW()),

-- Creative Agency - Proyectos de Clientes
('ffffffff-ffff-ffff-ffff-fffffffffff1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'admin', '{}'::jsonb, NOW()),

-- Business Consultants - Consultorías Activas
('44444444-4444-4444-4444-444444444441', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', '33333333-3333-3333-3333-333333333333', 'admin', '{}'::jsonb, NOW());

-- Reactivar triggers
SET session_replication_role = 'origin';

COMMIT;

-- Verificación
SELECT 
    w.company_id,
    c.name as company_name,
    COUNT(DISTINCT w.id) as workspace_count,
    COUNT(DISTINCT wm.user_id) as total_members
FROM workspaces w
JOIN companies c ON w.company_id = c.id
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
GROUP BY w.company_id, c.name
ORDER BY c.name;