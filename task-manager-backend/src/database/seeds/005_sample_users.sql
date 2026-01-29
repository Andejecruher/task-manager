-- ============================================
-- SEED: 005_sample_users
-- DESCRIPCIÓN: Usuarios adicionales para testing
-- ============================================

BEGIN;

SET session_replication_role = 'replica';

-- ====================
-- USUARIOS PARA TECHCORP
-- ====================
INSERT INTO users (
    id,
    company_id,
    email,
    password_hash,
    full_name,
    avatar_url,
    role,
    email_verified,
    is_active,
    is_onboarded,
    permissions,
    created_at
) VALUES
-- Desarrollador Frontend
(
    '17171717-1717-1717-1717-171717171711',
    '11111111-1111-1111-1111-111111111111',
    'dev.frontend@techcorp.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2', -- Password123!
    'Luis Martínez',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis',
    'member',
    TRUE,
    TRUE,
    TRUE,
    '[]'::jsonb,
    NOW() - INTERVAL '20 days'
),
-- Desarrollador Backend
(
    '17171717-1717-1717-1717-171717171712',
    '11111111-1111-1111-1111-111111111111',
    'dev.backend@techcorp.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Sofía Ramírez',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    'member',
    TRUE,
    TRUE,
    TRUE,
    '[]'::jsonb,
    NOW() - INTERVAL '15 days'
),
-- Diseñadora UX/UI
(
    '17171717-1717-1717-1717-171717171713',
    '11111111-1111-1111-1111-111111111111',
    'designer@techcorp.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Valeria Torres',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Valeria',
    'member',
    TRUE,
    TRUE,
    TRUE,
    '[]'::jsonb,
    NOW() - INTERVAL '10 days'
),
-- QA Tester
(
    '17171717-1717-1717-1717-171717171714',
    '11111111-1111-1111-1111-111111111111',
    'qa@techcorp.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Roberto Sánchez',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
    'member',
    TRUE,
    TRUE,
    FALSE, -- No completó onboarding
    '[]'::jsonb,
    NOW() - INTERVAL '5 days'
);

-- ====================
-- USUARIOS PARA CREATIVE AGENCY
-- ====================
INSERT INTO users (
    id,
    company_id,
    email,
    password_hash,
    full_name,
    avatar_url,
    role,
    email_verified,
    is_active,
    is_onboarded,
    created_at
) VALUES
-- Diseñador Gráfico
(
    '23232323-2323-2323-2323-232323232321',
    '22222222-2222-2222-2222-222222222222',
    'designer@creative-agency.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Alejandro Ruiz',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alejandro',
    'member',
    TRUE,
    TRUE,
    TRUE,
    NOW() - INTERVAL '8 days'
),
-- Copywriter
(
    '23232323-2323-2323-2323-232323232322',
    '22222222-2222-2222-2222-222222222222',
    'copywriter@creative-agency.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Gabriela Mendoza',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriela',
    'member',
    TRUE,
    TRUE,
    TRUE,
    NOW() - INTERVAL '5 days'
);

-- ====================
-- USUARIOS PARA BUSINESS CONSULTANTS
-- ====================
INSERT INTO users (
    id,
    company_id,
    email,
    password_hash,
    full_name,
    avatar_url,
    role,
    email_verified,
    is_active,
    is_onboarded,
    created_at
) VALUES
-- Consultor Senior
(
    '24242424-2424-2424-2424-242424242421',
    '33333333-3333-3333-3333-333333333333',
    'senior.consultant@business-consultants.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Robert Johnson',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    'manager',
    TRUE,
    TRUE,
    TRUE,
    NOW() - INTERVAL '4 days'
),
-- Analista de Negocios
(
    '24242424-2424-2424-2424-242424242422',
    '33333333-3333-3333-3333-333333333333',
    'analyst@business-consultants.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Emily Davis',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    'member',
    TRUE,
    TRUE,
    TRUE,
    NOW() - INTERVAL '2 days'
);

-- ====================
-- AGREGAR USUARIOS A WORKSPACES
-- ====================

-- TechCorp - Producto Principal
INSERT INTO workspace_members (workspace_id, user_id, company_id, role) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '17171717-1717-1717-1717-171717171711', '11111111-1111-1111-1111-111111111111', 'member'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '17171717-1717-1717-1717-171717171712', '11111111-1111-1111-1111-111111111111', 'member'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '17171717-1717-1717-1717-171717171713', '11111111-1111-1111-1111-111111111111', 'member');

-- TechCorp - Marketing & Ventas
INSERT INTO workspace_members (workspace_id, user_id, company_id, role) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '17171717-1717-1717-1717-171717171713', '11111111-1111-1111-1111-111111111111', 'member'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '17171717-1717-1717-1717-171717171714', '11111111-1111-1111-1111-111111111111', 'viewer');

-- Creative Agency - Proyectos de Clientes
INSERT INTO workspace_members (workspace_id, user_id, company_id, role) VALUES
('ffffffff-ffff-ffff-ffff-fffffffffff1', '23232323-2323-2323-2323-232323232321', '22222222-2222-2222-2222-222222222222', 'member'),
('ffffffff-ffff-ffff-ffff-fffffffffff1', '23232323-2323-2323-2323-232323232322', '22222222-2222-2222-2222-222222222222', 'member');

-- Business Consultants - Consultorías Activas
INSERT INTO workspace_members (workspace_id, user_id, company_id, role) VALUES
('44444444-4444-4444-4444-444444444441', '24242424-2424-2424-2424-242424242421', '33333333-3333-3333-3333-333333333333', 'admin'),
('44444444-4444-4444-4444-444444444441', '24242424-2424-2424-2424-242424242422', '33333333-3333-3333-3333-333333333333', 'member');

SET session_replication_role = 'origin';

COMMIT;

-- Verificación
SELECT 
    c.name as company,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN u.role = 'owner' THEN u.id END) as owners,
    COUNT(DISTINCT CASE WHEN u.role = 'manager' THEN u.id END) as managers,
    COUNT(DISTINCT CASE WHEN u.role = 'member' THEN u.id END) as members,
    COUNT(DISTINCT CASE WHEN NOT u.is_onboarded THEN u.id END) as pending_onboarding
FROM users u
JOIN companies c ON u.company_id = c.id
GROUP BY c.name
ORDER BY c.name;