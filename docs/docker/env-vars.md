# Docker Environment Variables

## Frontend

Variables definidas por compose para `frontend`:

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- `API_INTERNAL_URL=http://app:3000/api/v1`

Uso esperado:

- `NEXT_PUBLIC_API_URL`: llamadas desde browser (host).
- `API_INTERNAL_URL`: llamadas server-side dentro de red Docker.

## Backend

Variables principales definidas para `app`:

- `NODE_ENV=development`
- `APP_PORT=3000`
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_NAME=taskmanager_dev`
- `DB_USER=taskmanager_user`
- `DB_PASSWORD=dev_password_123`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `REDIS_PASSWORD=redis_dev_password`
- `JWT_SECRET=dev_jwt_secret_key_change_in_production`

## Infra

- Postgres usa `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- Redis requiere password via `--requirepass redis_dev_password`.

## Regla de compatibilidad

Los puertos internos de contenedor no cambian. El backend sigue escuchando en `3000` dentro de Docker.
