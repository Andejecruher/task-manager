BEGIN;

-- Eliminar índices creados en esta migración
DROP INDEX IF EXISTS idx_tasks_user_dashboard;
DROP INDEX IF EXISTS idx_tasks_workspace_status;
DROP INDEX IF EXISTS idx_tasks_date_range;
DROP INDEX IF EXISTS idx_tasks_board_column;
DROP INDEX IF EXISTS idx_tasks_search;
DROP INDEX IF EXISTS idx_comments_search;
DROP INDEX IF EXISTS idx_tasks_metadata;
DROP INDEX IF EXISTS idx_companies_settings;
DROP INDEX IF EXISTS idx_tasks_active;
DROP INDEX IF EXISTS idx_users_active;
DROP INDEX IF EXISTS idx_notifications_unread;
DROP INDEX IF EXISTS idx_workspace_members_composite;
DROP INDEX IF EXISTS idx_board_columns_composite;

COMMIT;