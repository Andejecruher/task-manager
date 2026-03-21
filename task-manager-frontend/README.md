# Task Manager Frontend

Frontend Next.js del monorepo.

## Docker en monorepo (oficial)

El flujo Docker oficial esta centralizado en la raiz del monorepo.

Desde `task-manager/`:

```bash
docker compose up --build
```

Aplicacion disponible en `http://localhost:5173`.

Documentacion oficial Docker:

- `docs/docker/fullstack-quickstart.md`
- `docs/docker/architecture.md`
- `docs/docker/env-vars.md`

## Desarrollo local sin Docker

Desde `task-manager-frontend/`:

```bash
npm install
npm run dev
```
