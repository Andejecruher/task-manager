-- MIGRACIÓN: 004_indexes_optimizations
-- DESCRIPCIÓN: Índices compuestos y optimizaciones de performance
-- AUTOR: Sistema
-- FECHA: $(date)

-- ============================================
-- ÍNDICES COMPUESTOS PARA CONSULTAS FRECUENTES
-- ============================================

-- Para dashboard de usuario
CREATE INDEX IF NOT EXISTS idx_tasks_user_dashboard 
ON tasks(company_id, assignee_id, status, due_date, priority) 
WHERE deleted_at IS NULL;

-- Para búsquedas por workspace
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_status 
ON tasks(workspace_id, status, created_at DESC) 
WHERE deleted_at IS NULL;

-- Para reportes por fecha
CREATE INDEX IF NOT EXISTS idx_tasks_date_range 
ON tasks(company_id, created_at) 
WHERE deleted_at IS NULL;

-- Para consultas de columnas
CREATE INDEX IF NOT EXISTS idx_tasks_board_column 
ON tasks(board_id, column_id) 
WHERE deleted_at IS NULL AND column_id IS NOT NULL;

-- ============================================
-- ÍNDICES PARA FULL TEXT SEARCH
-- ============================================

-- Búsqueda en títulos y descripciones
CREATE INDEX IF NOT EXISTS idx_tasks_search 
ON tasks USING GIN(
    to_tsvector('spanish', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '')
    )
);

-- Búsqueda en comentarios
CREATE INDEX IF NOT EXISTS idx_comments_search 
ON task_comments USING GIN(to_tsvector('spanish', content))
WHERE deleted_at IS NULL;

-- ============================================
-- ÍNDICES PARA JSONB FIELDS
-- ============================================

-- Búsqueda en metadata de tareas
CREATE INDEX IF NOT EXISTS idx_tasks_metadata 
ON tasks USING GIN(metadata);

-- Búsqueda en settings de companies
CREATE INDEX IF NOT EXISTS idx_companies_settings 
ON companies USING GIN(settings);

-- ============================================
-- ÍNDICES PARCIALES PARA PERFORMANCE
-- ============================================

-- Solo tareas activas (no eliminadas, no completadas)
CREATE INDEX IF NOT EXISTS idx_tasks_active 
ON tasks(company_id, status) 
WHERE deleted_at IS NULL AND status != 'done';

-- Usuarios activos
CREATE INDEX IF NOT EXISTS idx_users_active 
ON users(company_id, is_active) 
WHERE deleted_at IS NULL AND is_active = TRUE;

-- Notificaciones no leídas
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, created_at DESC) 
WHERE is_read = FALSE;

-- ============================================
-- ÍNDICES PARA FOREIGN KEYS
-- ============================================

-- Mejorar JOINs frecuentes
CREATE INDEX IF NOT EXISTS idx_workspace_members_composite 
ON workspace_members(workspace_id, user_id, role);

CREATE INDEX IF NOT EXISTS idx_board_columns_composite 
ON board_columns(board_id, position, slug);

-- ============================================
-- OPTIMIZACIONES ADICIONALES
-- ============================================

-- Configurar estadísticas para consultas complejas
ALTER TABLE tasks ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE tasks ALTER COLUMN priority SET STATISTICS 1000;
ALTER TABLE users ALTER COLUMN role SET STATISTICS 1000;

-- Vacuum y analyze para optimizar (ejecutar manualmente fuera del migrador si es necesario)