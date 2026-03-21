# Task Manager (Monorepo)

Este repositorio contiene backend y frontend en un solo monorepo.

## Estructura

- `task-manager-backend/` - API y servicios
- `task-manager-frontend/` - Aplicacion cliente Next.js
- `docs/docker/` - Documentacion oficial Docker para full stack

## Quickstart Docker full stack (oficial)

Comando unico desde la raiz del monorepo:

```bash
docker compose up --build
```

Para apagar:

```bash
docker compose down
```

## Puertos DEV oficiales (anti-choques)

| Servicio | Host:Container |
| --- | --- |
| Frontend (Next.js) | `5173:3000` |
| Backend API | `8000:3000` |
| Debug Node backend | `9230:9229` |
| PostgreSQL | `5433:5432` |
| Redis | `6380:6379` |
| Adminer | `8082:8080` |
| Redis Commander | `8083:8081` |

## Documentacion central Docker

- `docs/docker/fullstack-quickstart.md`
- `docs/docker/architecture.md`
- `docs/docker/env-vars.md`

## Desarrollo local sin Docker (opcional)

Instalar dependencias en workspaces:

```bash
npm install
```

Iniciar backend y frontend en paralelo:

```bash
npm run dev
```
