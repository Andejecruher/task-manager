-- ============================================
-- SEED: 001_initial_setup
-- DESCRIPCIÓN: Configuración inicial del sistema
-- Empresas de ejemplo, usuarios administradores
-- ============================================

BEGIN;

-- Desactivar triggers temporales para performance
SET session_replication_role = 'replica';

-- ====================
-- EMPRESAS DE EJEMPLO
-- ====================
INSERT INTO companies (id, name, slug, plan, settings, created_at) VALUES
-- Startup tecnológica
(
    '11111111-1111-1111-1111-111111111111',
    'TechCorp Solutions',
    'techcorp',
    'pro',
    '{
        "theme": "dark",
        "timezone": "America/Mexico_City",
        "language": "es",
        "dateFormat": "DD/MM/YYYY",
        "firstDayOfWeek": 1,
        "defaultWorkspace": null,
        "notifications": {
            "email": true,
            "push": true,
            "inApp": true
        },
        "features": {
            "timeTracking": true,
            "fileAttachments": true,
            "customFields": true,
            "reports": true
        }
    }'::jsonb,
    NOW() - INTERVAL '30 days'
),
-- Agencia de marketing
(
    '22222222-2222-2222-2222-222222222222',
    'Creative Agency MX',
    'creative-agency',
    'starter',
    '{
        "theme": "light",
        "timezone": "America/Mexico_City",
        "language": "es",
        "dateFormat": "MM/DD/YYYY",
        "firstDayOfWeek": 0,
        "defaultWorkspace": null,
        "brandColor": "#FF6B6B",
        "logo": "https://cdn.creativeagency.com/logo.png",
        "notifications": {
            "email": true,
            "push": false,
            "inApp": true
        }
    }'::jsonb,
    NOW() - INTERVAL '15 days'
),
-- Consultoría empresarial
(
    '33333333-3333-3333-3333-333333333333',
    'Business Consultants LLC',
    'business-consultants',
    'enterprise',
    '{
        "theme": "system",
        "timezone": "America/New_York",
        "language": "en",
        "dateFormat": "YYYY-MM-DD",
        "firstDayOfWeek": 1,
        "defaultWorkspace": null,
        "security": {
            "requireMFA": true,
            "passwordExpiryDays": 90,
            "sessionTimeout": 30
        },
        "compliance": {
            "gdpr": true,
            "hipaa": false,
            "auditLogging": true
        }
    }'::jsonb,
    NOW() - INTERVAL '7 days'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- ====================
-- USUARIOS ADMINISTRADORES
-- ====================
-- Contraseñas: Todas son "Password123!" (bcrypt hash)
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
    created_at,
    updated_at
) VALUES
-- Admin de TechCorp
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'admin@techcorp.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2', -- Password123!
    'Ana García',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    'owner',
    TRUE,
    TRUE,
    TRUE,
    '[]'::jsonb,
    NOW() - INTERVAL '30 days',
    NOW()
),
-- Manager de TechCorp
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    'manager@techcorp.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'Carlos Rodríguez',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    'manager',
    TRUE,
    TRUE,
    TRUE,
    '[]'::jsonb,
    NOW() - INTERVAL '25 days',
    NOW()
),
-- Admin de Creative Agency
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '22222222-2222-2222-2222-222222222222',
    'admin@creative-agency.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'María López',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    'owner',
    TRUE,
    TRUE,
    TRUE,
    '{}'::jsonb,
    NOW() - INTERVAL '15 days',
    NOW()
),
-- Admin de Business Consultants
(
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '33333333-3333-3333-3333-333333333333',
    'admin@business-consultants.com',
    '$2a$12$5RzpyimIe0xYlnF5Y8wC.OMj6zD3WAVAm6rQDMjOqDpJQ8KQwW8W2',
    'John Smith',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    'owner',
    TRUE,
    TRUE,
    TRUE,
    '[]'::jsonb,
    NOW() - INTERVAL '7 days',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- ====================
-- SESIONES DE USUARIO (para testing)
-- ====================
INSERT INTO user_sessions (
    id,
    company_id,
    user_id,
    session_token,
    refresh_token,
    device_info,
    expires_at,
    refresh_token_expires_at
) VALUES
(
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYWFhYWFhYS1hYWFhLWFhYWEtYWFhYS1hYWFhYWFhYWFhYTQiLCJjb21wYW55SWQiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJyb2xlIjoib3duZXIiLCJpYXQiOjE3MDEyMzQ1NjksImV4cCI6MTcwMTMyMDk2OX0.test-token-admin',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJkZGRkZGRkZC1kZGRkLWRkZGQtZGRkZC1kZGRkZGRkZGRkZDEiLCJpYXQiOjE3MDEyMzQ1NjksImV4cCI6MTcwMTgzOTM2OX0.test-refresh-token',
    '{
        "browser": "Chrome",
        "os": "Windows 10",
        "device": "Desktop",
        "ip": "192.168.1.100"
    }'::jsonb,
    NOW() + INTERVAL '24 hours',
    NOW() + INTERVAL '7 days'
);

-- Reactivar triggers
SET session_replication_role = 'origin';

COMMIT;

-- Verificación
SELECT 
    'Companies' as entity,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as samples
FROM companies
UNION ALL
SELECT 
    'Users',
    COUNT(*),
    STRING_AGG(email, ', ')
FROM users;