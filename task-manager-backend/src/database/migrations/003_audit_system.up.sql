-- MIGRACIÓN: 003_audit_system
-- DESCRIPCIÓN: Sistema de auditoría, logs y notificaciones
-- AUTOR: Sistema
-- FECHA: $(date)

BEGIN;

-- ============================================
-- TABLA 11: AUDIT_LOGS (Logs de auditoría del sistema)
-- ============================================
CREATE TABLE audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- ACCIÓN
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    
    -- DATOS
    old_data JSONB,
    new_data JSONB,
    diff JSONB,
    
    -- CONTEXTO
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_ip INET,
    user_agent TEXT,
    
    -- METADATA
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- CONSTRAINTS
    PRIMARY KEY (id, performed_at)
)
PARTITION BY RANGE (performed_at);

COMMENT ON TABLE audit_logs IS 'Logs de auditoría para compliance y debugging';

-- ============================================
-- TABLA 12: NOTIFICATIONS (Notificaciones a usuarios)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- CONTENIDO
    type VARCHAR(50) NOT NULL
        CHECK (type IN ('task_assigned', 'task_updated', 'mention', 
                       'comment', 'due_date', 'invitation', 'system')),
    title VARCHAR(500) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    
    -- ESTADO
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
    
    -- ÍNDICES
);

COMMENT ON TABLE notifications IS 'Notificaciones push/email/in-app para usuarios';

-- ============================================
-- TABLA 13: USER_SESSIONS (Sesiones de usuario)
-- ============================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- DATOS DE SESIÓN
    session_token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    
    -- ESTADO
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- EXPIRACIÓN
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
    
    -- ÍNDICES
);

COMMENT ON TABLE user_sessions IS 'Sesiones de usuario para JWT invalidation';

-- ============================================
-- TABLA 14: INVITATIONS (Invitaciones pendientes)
-- ============================================
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- DATOS DE INVITACIÓN
    email VARCHAR(255) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    
    -- RELACIONES
    invited_by UUID NOT NULL REFERENCES users(id),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- ESTADO
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE
    
    -- ÍNDICES
    
);

COMMENT ON TABLE invitations IS 'Invitaciones pendientes a usuarios';

COMMIT;

-- Índices creados explícitamente para `003_audit_system`
CREATE INDEX idx_audit_logs_company ON audit_logs (company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs (performed_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_company ON notifications (company_id);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications (is_read) WHERE NOT is_read;
CREATE INDEX idx_notifications_type ON notifications (type);

CREATE INDEX idx_user_sessions_user ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_company ON user_sessions (company_id);
CREATE INDEX idx_user_sessions_token ON user_sessions (session_token);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions (refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions (expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions (is_active) WHERE is_active;

CREATE UNIQUE INDEX idx_invitations_pending_email ON invitations (company_id, email) WHERE status = 'pending';
CREATE INDEX idx_invitations_company ON invitations (company_id);
CREATE INDEX idx_invitations_token ON invitations (token);
CREATE INDEX idx_invitations_email ON invitations (email);
CREATE INDEX idx_invitations_status ON invitations (status);
CREATE INDEX idx_invitations_expires_at ON invitations (expires_at);