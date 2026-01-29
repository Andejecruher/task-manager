-- EXTENSIONES ESENCIALES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- CONFIGURACIÓN INICIAL
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements,pgcrypto';
SELECT pg_reload_conf();

-- CREACIÓN DE ROLES DE APLICACIÓN
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taskmanager_app') THEN
        CREATE ROLE taskmanager_app WITH LOGIN PASSWORD 'app_password_456';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taskmanager_readonly') THEN
        CREATE ROLE taskmanager_readonly WITH LOGIN PASSWORD 'readonly_password_789';
    END IF;
END $$;

-- PERMISOS BÁSICOS
GRANT CONNECT ON DATABASE taskmanager_dev TO taskmanager_app, taskmanager_readonly;