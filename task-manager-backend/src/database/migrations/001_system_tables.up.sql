-- MIGRACIÓN: 001_system_tables
-- DESCRIPCIÓN: Tablas base del sistema multi-tenant
-- AUTOR: Sistema
-- FECHA: $(date)

BEGIN;

-- ============================================
-- TABLA 1: COMPANIES (Empresas/organizaciones)
-- ============================================
CREATE TABLE companies (
    -- IDENTIFICACIÓN
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- DATOS BÁSICOS
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(500),
    logo_url TEXT,
    
    -- PLAN Y FACTURACIÓN
    plan VARCHAR(50) NOT NULL DEFAULT 'free' 
        CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    billing_email VARCHAR(255),
    subscription_id VARCHAR(255),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- CONFIGURACIONES
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE companies IS 'Empresas/organizaciones que usan el sistema';
COMMENT ON COLUMN companies.slug IS 'Identificador único en URL (ej: "mi-empresa")';
COMMENT ON COLUMN companies.settings IS 'Configuraciones específicas de la empresa';
COMMENT ON COLUMN companies.features IS 'Features habilitados según plan';

-- ============================================
-- TABLA 2: USERS (Usuarios del sistema)
-- ============================================
CREATE TABLE users (
    -- IDENTIFICACIÓN
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- DATOS PERSONALES
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'es-ES',
    
    -- AUTENTICACIÓN Y SEGURIDAD
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- ROLES Y PERMISOS
    role VARCHAR(50) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    permissions JSONB DEFAULT '[]'::jsonb,
    
    -- ESTADO
    is_active BOOLEAN DEFAULT TRUE,
    is_onboarded BOOLEAN DEFAULT FALSE,
    
    -- GDPR/COMPLIANCE
    gdpr_consent_at TIMESTAMP WITH TIME ZONE,
    data_retention_until DATE,
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- CONSTRAINTS E ÍNDICES
    UNIQUE (company_id, email)
);

COMMENT ON TABLE users IS 'Usuarios del sistema con multi-tenancy';
COMMENT ON COLUMN users.company_id IS 'Referencia a la empresa del usuario';
COMMENT ON COLUMN users.permissions IS 'Permisos adicionales específicos (ABAC)';

-- ============================================
-- TABLA 3: WORKSPACES (Espacios de trabajo)
-- ============================================
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- DATOS BÁSICOS
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    
    -- CONFIGURACIÓN
    settings JSONB DEFAULT '{}'::jsonb,
    is_private BOOLEAN DEFAULT FALSE,
    
    -- ESTADÍSTICAS
    task_count INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- CONSTRAINTS E ÍNDICES
    UNIQUE (company_id, slug),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE workspaces IS 'Espacios de trabajo dentro de una empresa';

-- ============================================
-- TABLA 4: WORKSPACE_MEMBERS (Miembros del workspace)
-- ============================================
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- ROLES Y PERMISOS
    role VARCHAR(50) NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}'::jsonb,
    
    -- NOTIFICACIONES
    notification_settings JSONB DEFAULT '{
        "email": true,
        "push": true,
        "inApp": true,
        "mentions": true,
        "dailyDigest": false
    }'::jsonb,
    
    -- METADATA
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    
    -- CONSTRAINTS E ÍNDICES
    UNIQUE (workspace_id, user_id),
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE workspace_members IS 'Relación muchos a muchos entre usuarios y workspaces';

-- Índices creados explícitamente (Postgres no permite DECLARE INDEX dentro de CREATE TABLE)
CREATE INDEX idx_companies_slug ON companies (slug);
CREATE INDEX idx_companies_deleted_at ON companies (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_users_company ON users (company_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_workspaces_company ON workspaces (company_id);
CREATE INDEX idx_workspaces_created_by ON workspaces (created_by);

CREATE INDEX idx_workspace_members_workspace ON workspace_members (workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members (user_id);
CREATE INDEX idx_workspace_members_company ON workspace_members (company_id);

COMMIT;