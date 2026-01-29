#!/bin/bash
set -e

# Health check para PostgreSQL
pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" || exit 1

# Verificar extensiones críticas
psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 'Extensions OK' FROM (SELECT COUNT(*) as count FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements')) t WHERE t.count = 3;" || exit 1

exit 0