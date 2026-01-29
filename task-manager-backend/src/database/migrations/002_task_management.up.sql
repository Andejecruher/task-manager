-- MIGRACIÓN: 002_task_management
-- DESCRIPCIÓN: Sistema completo de gestión de tareas
-- AUTOR: Sistema
-- FECHA: $(date)

BEGIN;

-- ============================================
-- TABLA 5: BOARDS (Tableros Kanban)
-- ============================================
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- DATOS BÁSICOS
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#10B981',
    
    -- CONFIGURACIÓN
    settings JSONB DEFAULT '{
        "columns": ["todo", "in_progress", "review", "done"],
        "defaultView": "board",
        "allowComments": true,
        "allowAttachments": true,
        "taskNumbering": true
    }'::jsonb,
    
    -- VISIBILIDAD
    visibility VARCHAR(50) DEFAULT 'workspace'
        CHECK (visibility IN ('private', 'workspace', 'company', 'public')),
    
    -- ESTADÍSTICAS
    task_count INTEGER DEFAULT 0,
    archived_task_count INTEGER DEFAULT 0,
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id),
    archived_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- CONSTRAINTS E ÍNDICES
    UNIQUE (workspace_id, slug),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE boards IS 'Tableros Kanban dentro de un workspace';

-- ============================================
-- TABLA 6: BOARD_COLUMNS (Columnas del tablero)
-- ============================================
CREATE TABLE board_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- CONFIGURACIÓN
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    description TEXT,
    
    -- ORDEN Y LÍMITES
    position INTEGER NOT NULL DEFAULT 0,
    task_limit INTEGER,
    wip_limit INTEGER,
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id),
    
    -- CONSTRAINTS E ÍNDICES
    UNIQUE (board_id, slug),
    UNIQUE (board_id, position),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE board_columns IS 'Columnas configurables de un tablero Kanban';

-- ============================================
-- TABLA 7: TASKS (Tareas - Entidad principal)
-- ============================================
CREATE TABLE tasks (
    -- IDENTIFICACIÓN
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    
    -- ID LEGIBLE (para usuarios)
    task_number SERIAL,
    
    -- DATOS BÁSICOS
    title VARCHAR(500) NOT NULL,
    description TEXT,
    description_html TEXT,
    
    -- ESTADO Y FLUJO
    column_id UUID REFERENCES board_columns(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- ASIGNACIÓN
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_ids UUID[] DEFAULT '{}',
    
    -- FECHAS
    due_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_estimate INTEGER, -- en minutos
    
    -- METADATA Y TAGS
    tags VARCHAR(50)[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- SEGUIMIENTO DE TIEMPO
    total_time_spent INTEGER DEFAULT 0, -- en minutos
    last_time_tracked_at TIMESTAMP WITH TIME ZONE,
    
    -- RELACIONES
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    related_task_ids UUID[] DEFAULT '{}',
    
    -- AUDITORÍA COMPLETA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- CONSTRAINTS E ÍNDICES
    UNIQUE (company_id, task_number),
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE tasks IS 'Tareas principales del sistema con auditoría completa';
COMMENT ON COLUMN tasks.task_number IS 'Número legible único por compañía (ej: TASK-123)';
COMMENT ON COLUMN tasks.assignee_ids IS 'Múltiples asignados (para tareas colaborativas)';

-- ============================================
-- TABLA 8: TASK_COMMENTS (Comentarios en tareas)
-- ============================================
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- CONTENIDO
    content TEXT NOT NULL,
    content_html TEXT,
    
    -- MENCIONES
    mentioned_user_ids UUID[] DEFAULT '{}',
    
    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- CONSTRAINTS E ÍNDICES
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE task_comments IS 'Comentarios en tareas con soporte para mentions';

-- ============================================
-- TABLA 9: TASK_ATTACHMENTS (Archivos adjuntos)
-- ============================================
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- DATOS DEL ARCHIVO
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    
    -- ALMACENAMIENTO
    storage_provider VARCHAR(50) DEFAULT 'local',
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- METADATA
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
    
    -- CONSTRAINTS E ÍNDICES
    
);

COMMENT ON TABLE task_attachments IS 'Archivos adjuntos a tareas';

-- ============================================
-- TABLA 10: TASK_HISTORY (Historial de cambios)
-- ============================================
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- CAMBIO
    action VARCHAR(50) NOT NULL
        CHECK (action IN ('created', 'updated', 'deleted', 'status_changed', 
                         'assigned', 'commented', 'attachment_added')),
    field_changed VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    change_description TEXT,
    
    -- METADATA
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id)
    
    -- CONSTRAINTS E ÍNDICES
    
);

COMMENT ON TABLE task_history IS 'Historial completo de cambios en tareas para auditoría';

COMMIT;

-- Índices creados explícitamente para `002_task_management`
CREATE INDEX idx_boards_company ON boards (company_id);
CREATE INDEX idx_boards_workspace ON boards (workspace_id);
CREATE INDEX idx_boards_created_by ON boards (created_by);
CREATE INDEX idx_boards_deleted_at ON boards (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_board_columns_board ON board_columns (board_id);
CREATE INDEX idx_board_columns_company ON board_columns (company_id);

CREATE INDEX idx_tasks_company ON tasks (company_id);
CREATE INDEX idx_tasks_workspace ON tasks (workspace_id);
CREATE INDEX idx_tasks_board ON tasks (board_id);
CREATE INDEX idx_tasks_column ON tasks (column_id);
CREATE INDEX idx_tasks_assignee ON tasks (assignee_id);
CREATE INDEX idx_tasks_created_by ON tasks (created_by);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);
CREATE INDEX idx_tasks_tags ON tasks USING gin (tags);
CREATE INDEX idx_tasks_deleted_at ON tasks (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_completed_at ON tasks (completed_at) WHERE completed_at IS NOT NULL;

CREATE INDEX idx_task_comments_task ON task_comments (task_id);
CREATE INDEX idx_task_comments_company ON task_comments (company_id);
CREATE INDEX idx_task_comments_created_by ON task_comments (created_by);
CREATE INDEX idx_task_comments_created_at ON task_comments (created_at DESC);
CREATE INDEX idx_task_comments_deleted_at ON task_comments (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_task_attachments_task ON task_attachments (task_id);
CREATE INDEX idx_task_attachments_company ON task_attachments (company_id);
CREATE INDEX idx_task_attachments_uploaded_by ON task_attachments (uploaded_by);

CREATE INDEX idx_task_history_task ON task_history (task_id);
CREATE INDEX idx_task_history_company ON task_history (company_id);
CREATE INDEX idx_task_history_changed_by ON task_history (changed_by);
CREATE INDEX idx_task_history_changed_at ON task_history (changed_at DESC);
CREATE INDEX idx_task_history_action ON task_history (action);
