# Task Manager (Monorepo)

Sistema multi-tenant de gestión de tareas con stack TypeScript full-stack. Backend API REST con Express + Sequelize + PostgreSQL + Redis, y frontend con Next.js 16 + React 19 + Tailwind v4 + shadcn/ui.

---

## Estructura del monorepo

```
task-manager/
├── task-manager-backend/      # API REST + servicios (Express + Sequelize + PostgreSQL + Redis)
├── task-manager-frontend/     # Cliente web (Next.js 16 + React 19 + shadcn/ui)
├── docs/docker/               # Documentación oficial Docker
├── docker-compose.yml         # Composición full-stack (6 servicios)
├── package.json               # Workspaces root (concurrently para dev local)
└── README.md
```

## Stack tecnológico

| Capa         | Tecnología                                                  |
| ------------ | ----------------------------------------------------------- |
| Frontend     | Next.js 16, React 19.2, Tailwind CSS v4, shadcn/ui (58 cmp) |
| Backend      | Express 4, TypeScript, Sequelize 6, Socket.io               |
| Base de datos| PostgreSQL 15 (Alpine)                                      |
| Caché        | Redis 7 (Alpine) — sesiones, rate limiting, tokens          |
| Validación   | Zod + class-validator + class-transformer                   |
| Testing      | Jest + ts-jest + supertest (backend)                        |
| Tiempo real  | Socket.io (backend)                                         |
| Logs         | Winston con rotación diaria + Morgan                        |

---

## Quickstart — Docker (oficial)

Comando único desde la raíz:

```bash
docker compose up --build
```

Apagar:

```bash
docker compose down
```

## Quickstart — Desarrollo local

```bash
npm install                  # Instala dependencias de ambos workspaces
npm run dev                  # Backend + frontend en paralelo
```

---

## Puertos DEV

| Servicio           | Host:Container | Propósito              |
| ------------------ | -------------- | ---------------------- |
| Frontend (Next.js) | `5173:3000`    | App cliente            |
| Backend API        | `8000:3000`    | API REST               |
| Debug Node backend | `9230:9229`    | Inspector de Node      |
| PostgreSQL         | `5433:5432`    | Base de datos          |
| Redis              | `6380:6379`    | Caché y sesiones       |
| Adminer            | `8082:8080`    | Cliente web PostgreSQL |
| Redis Commander    | `8081:8081`    | Cliente web Redis      |

---

## Scripts del monorepo

| Comando              | Descripción                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Backend + frontend en paralelo (concurrently) |
| `npm run docker:build` | `docker compose build`                      |
| `npm run docker:up`  | `docker compose up -d`                        |
| `npm run docker:down`| `docker compose down`                         |
| `npm run docker:logs`| `docker compose logs -f`                      |
| `npm run docker:ps`  | `docker compose ps`                           |

---

## Arquitectura general

```
                      ┌──────────────┐
                      │   Frontend   │
                      │  Next.js 16  │
                      │  :5173       │
                      └──────┬───────┘
                             │ HTTP (Axios)
                             ▼
                      ┌──────────────┐
                      │  Backend API │
                      │  Express 4   │
                      │  :8000       │
                      └──────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │PostgreSQL│   │  Redis   │   │  SMTP    │
       │ :5433    │   │ :6380    │   │ (email)  │
       └──────────┘   └──────────┘   └──────────┘
```

## Documentación relacionada

- [Backend README](task-manager-backend/README.md) — arquitectura, rutas, modelos, scripts
- [Frontend README](task-manager-frontend/README.md) — componentes, routing, estado
- [Docker: quickstart](docs/docker/fullstack-quickstart.md)
- [Docker: arquitectura](docs/docker/architecture.md)
- [Docker: variables de entorno](docs/docker/env-vars.md)
