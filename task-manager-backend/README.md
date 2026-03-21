# Task Manager Backend

Backend para sistema de gestion de tareas multi-tenant.

## Docker en monorepo (oficial)

El flujo Docker oficial esta centralizado en la raiz del monorepo.

Desde `task-manager/`:

```bash
docker compose up --build
```

Documentacion oficial Docker:

- `docs/docker/fullstack-quickstart.md`
- `docs/docker/architecture.md`
- `docs/docker/env-vars.md`

## Compose local backend (legacy)

El archivo `task-manager-backend/docker-compose.yml` se mantiene como opcion legacy para casos donde solo quieras el backend.
No es el entrypoint oficial del monorepo.

## Desarrollo local sin Docker

```bash
npm install
npm run dev
```
