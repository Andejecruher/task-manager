# Task Manager Backend

API REST multi-tenant para sistema de gestión de tareas. Construido con Express + TypeScript, Sequelize ORM, PostgreSQL y Redis.

---

## Stack

| Componente      | Tecnología                                               |
| --------------- | -------------------------------------------------------- |
| Runtime         | Node.js >= 18, TypeScript 5.2                            |
| Framework       | Express 4.18                                             |
| ORM             | Sequelize 6.37 + pg + pg-hstore                          |
| Caché/sesiones  | ioredis 5 + redis 4                                      |
| Autenticación   | JWT (access + refresh tokens), bcryptjs                  |
| Validación      | Zod + class-validator + class-transformer                |
| Logs            | Winston (rotación diaria) + Morgan                       |
| Documentación   | Swagger (swagger-jsdoc + swagger-ui-express)             |
| Tiempo real     | Socket.io 4.6                                            |
| Email           | Nodemailer                                               |
| Testing         | Jest + ts-jest + supertest                               |
| Archivos        | Multer + Sharp                                           |

---

## Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL 15
- Redis 7

---

## Estructura del proyecto

```
task-manager-backend/
├── docker/
│   ├── app/Dockerfile.dev         # Dockerfile para desarrollo
│   └── postgres/
│       ├── Dockerfile             # PostgreSQL con config optimizada
│       ├── init.sql               # Extensiones + setup inicial
│       ├── postgresql.conf        # Config sintonizada
│       └── health-check.sh        # Healthcheck personalizado
├── scripts/
│   ├── migrate.ts                 # Gestor de migraciones
│   ├── create-migration.ts        # Generador de migraciones
│   ├── seed.ts                    # Seed de datos
│   └── health-check.ts            # Healthcheck endpoint
├── src/
│   ├── config/
│   │   ├── index.ts               # Config central (env vars + defaults)
│   │   ├── redis.ts               # Cliente ioredis
│   │   └── swagger-token-manager.js  # JS custom para Swagger
│   ├── controllers/
│   │   ├── auth.controller.ts      # Registro, login, sesiones, perfil
│   │   ├── company.controller.ts   # Gestión de compañías
│   │   ├── tasks.controller.ts     # CRUD de tareas + transiciones
│   │   ├── user.controller.ts      # Administración de usuarios
│   │   └── workspace.controller.ts # CRUD workspaces + miembros
│   ├── database/
│   │   ├── connection.ts           # Pool raw pg nativo
│   │   ├── connection-sequelize.ts # Conexión Sequelize singleton
│   │   ├── migrations/             # Migraciones (usamos sync en dev)
│   │   └── models/
│   │       ├── Company.ts          # Multi-tenant root, planes
│   │       ├── User.ts             # Roles, MFA, lockout
│   │       ├── UserSession.ts
│   │       ├── Workspace.ts
│   │       ├── WorkspaceMember.ts
│   │       ├── Board.ts
│   │       ├── BoardColumn.ts
│   │       ├── Task.ts             # UUID PK, estados, prioridades, tags
│   │       ├── TaskComment.ts
│   │       ├── TaskAttachment.ts
│   │       ├── TaskHistory.ts      # Auditoría de cambios
│   │       ├── AuditLogs.ts
│   │       ├── Invitation.ts
│   │       └── Notification.ts
│   ├── docs/
│   │   └── routes/                 # Documentación Swagger por ruta
│   ├── guards/
│   │   ├── company.guard.ts        # Validación de compañía
│   │   ├── role.guard.ts           # Roles, permisos, ownership
│   │   └── workspace-access.guard.ts  # Acceso a workspace
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # Verificación JWT
│   │   ├── error.middleware.ts     # Manejador global de errores
│   │   ├── api-response.ts         # res.apiSuccess(), res.apiError()
│   │   └── request-id.ts          # x-request-id
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── user.routes.ts
│   │   ├── workspace.routes.ts
│   │   └── workspace-member.routes.ts
│   ├── services/
│   │   ├── auth.service.ts         # Registro, login, refresh, verify email
│   │   ├── company.service.ts
│   │   ├── email.service.ts        # Nodemailer (verificación, resets)
│   │   ├── password.service.ts     # Reset + change password flow
│   │   ├── session.service.ts      # Sesiones Redis + PostgreSQL
│   │   ├── tasks.service.ts
│   │   ├── token.service.ts        # JWT generate/verify, tokens en Redis
│   │   ├── user.service.ts
│   │   └── workspace.service.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── task.types.ts
│   │   ├── user.types.ts
│   │   ├── workspace.types.ts
│   │   └── express.d.ts            # Extensión de Request
│   ├── utils/
│   │   └── logger.ts               # Winston logger con rotación
│   ├── app.ts                      # Configuración de Express (middleware stack)
│   └── index.ts                    # Entrypoint (conexiones, sync, startup)
├── package.json
├── tsconfig.json
├── .eslintrc.cjs
├── jest.config.ts
└── nodemon.json
```

---

## Scripts

| Comando              | Descripción                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Hot reload con tsx watch                           |
| `npm run build`      | Compilación TypeScript a `dist/`                   |
| `npm run start`      | Producción desde `dist/`                           |
| `npm run type-check` | TypeScript type checking sin emitir                |
| `npm run lint`       | ESLint                                             |
| `npm run lint:fix`   | ESLint con auto-fix                                |
| `npm run format`     | Prettier                                           |
| `npm test`           | Jest                                               |
| `npm run test:watch` | Jest en modo watch                                 |
| `npm run test:coverage` | Jest con cobertura                              |
| `npm run migrate:up` | Ejecutar migraciones pendientes                    |
| `npm run migrate:down`| Revertir última migración                         |
| `npm run migrate:status` | Estado de migraciones                           |
| `npm run seed`       | Ejecutar seed de datos                             |
| `npm run seed:clear` | Limpiar datos insertados por seed                  |
| `npm run health:check` | Healthcheck de la aplicación                     |

---

## Variables de entorno

| Variable              | Default                  | Descripción                              |
| --------------------- | ------------------------ | ---------------------------------------- |
| `NODE_ENV`            | `development`            | Entorno                                  |
| `APP_PORT`            | `3000`                   | Puerto del servidor                      |
| `APP_URL`             | `http://localhost:3000`  | URL pública                              |
| `APP_FRONTEND_URL`    | `http://localhost:5173`  | URL del frontend (CORS)                  |
| `CORS_ORIGIN`         | `*`                      | Orígenes CORS permitidos                 |
| `DB_HOST`             | `localhost`              | Host PostgreSQL                          |
| `DB_PORT`             | `5432`                   | Puerto PostgreSQL                        |
| `DB_NAME`             | `taskmanager_dev`        | Nombre de la base de datos               |
| `DB_USER`             | `taskmanager_user`       | Usuario PostgreSQL                       |
| `DB_PASSWORD`         | —                        | Contraseña PostgreSQL                    |
| `DB_SYNC_MODE`        | `false`                  | Sincronizar modelos con DB (`sync`/`alter`) |
| `DB_SYNC_ALTER`       | `false`                  | Usar `alter: true` en sync               |
| `REDIS_HOST`          | `localhost`              | Host Redis                               |
| `REDIS_PORT`          | `6379`                   | Puerto Redis                             |
| `REDIS_PASSWORD`      | —                        | Contraseña Redis                         |
| `JWT_SECRET`          | —                        | Secreto JWT access tokens                |
| `JWT_ACCESS_EXPIRY`   | `15m`                    | Expiración access token                  |
| `JWT_REFRESH_EXPIRY`  | `7d`                     | Expiración refresh token                 |
| `BCRYPT_ROUNDS`       | `10`                     | Salt rounds para bcrypt                  |
| `SMTP_HOST`           | —                        | Host SMTP                                |
| `SMTP_PORT`           | `587`                    | Puerto SMTP                              |
| `SMTP_USER`           | —                        | Usuario SMTP                             |
| `SMTP_PASS`           | —                        | Contraseña SMTP                          |
| `SMTP_FROM`           | —                        | Remitente de emails                      |
| `LOG_LEVEL`           | `info`                   | Nivel de log                             |
| `LOG_TO_FILE`         | `false`                  | Persistir logs a archivos                |

---

## Middleware stack

Orden de ejecución en `app.ts`:

1. **helmet** — Seguridad HTTP (CSP configurado)
2. **CORS** — Orígenes desde env o localhost:3000/5173
3. **Rate limiter** — 1000 req/15min (dev) / 100 req/15min (prod)
4. **Body parsers** — JSON 10mb + URL-encoded 10mb
5. **cookie-parser** — Parseo de cookies
6. **compression** — Gzip
7. **Morgan → Winston** — Logging HTTP
8. **requestId** — `x-request-id` en cada request
9. **apiResponse** — `res.apiSuccess()`, `res.apiError()`, `res.apiValidationError()`
10. **Routes** — Montadas en `/api/v1`
11. **Swagger UI** — Documentación en `/api-docs`
12. **Health check** — `/health`
13. **Error handler** — Manejador global de errores

---

## Autenticación

### Flujo de login

1. POST `/api/v1/auth/login` → valida credenciales + verifica lockout
2. Genera access token (JWT, 15min) + refresh token (JWT, 7d)
3. Crea sesión en Redis (`session:{id}:{companyId}:{userId}`)
4. Crea registro en PostgreSQL (`UserSession`)
5. Setea cookies `access_token` y `refresh_token`

### Guards de autorización

| Guard                | Función                                           |
| -------------------- | ------------------------------------------------- |
| `CompanyGuard`       | Verifica que el usuario pertenezca a la compañía  |
| `RolesGuard`         | Rol específico (Owner, Admin, Manager, etc.)      |
| `MinRoleGuard`       | Rol mínimo numérico (Owner=100 → Viewer=20)       |
| `PermissionsGuard`   | Permisos granulares (ABAC)                        |
| `OwnershipGuard`     | Propietario del recurso vía raw SQL               |
| `WorkspaceAccessGuard` | Acceso al workspace + pertenencia              |

### Seguridad de contraseñas

- **Lockout**: 5 intentos fallidos → bloqueo 15 minutos
- **Reset**: Token en Redis (SHA-256, 1h TTL, one-time use)
- **Verificación de email**: Token en Redis (SHA-256, 24h TTL, one-time use)

---

## Modelos de base de datos

15 modelos Sequelize con UUID como PK, soft delete (paranoid), snake_case en DB:

| Modelo            | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| `Company`         | Root multi-tenant, planes (free/starter/pro/enterprise) |
| `User`            | Usuarios por compañía, roles, MFA, lockout     |
| `UserSession`     | Sesiones persistentes en PostgreSQL            |
| `Workspace`       | Workspaces tipo Slack (privados/públicos)      |
| `WorkspaceMember` | Relación N:N User ↔ Workspace                  |
| `Board`           | Tableros Kanban por workspace                  |
| `BoardColumn`     | Columnas dentro de tableros                    |
| `Task`            | Tarea con UUID, estados, prioridades, tags GIN |
| `TaskComment`     | Comentarios en tareas                          |
| `TaskAttachment`  | Archivos adjuntos                              |
| `TaskHistory`     | Auditoría de cambios en tareas                 |
| `AuditLogs`       | Logs de auditoría global                       |
| `Invitation`      | Invitaciones a compañías/workspaces            |
| `Notification`    | Notificaciones a usuarios                      |

### Task — estados y prioridades

**Estados** (6): `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled`

**Prioridades** (4): `critical`, `high`, `medium`, `low`

---

## API Routes

Todas bajo `/api/v1`.

### Auth

| Método | Ruta                                   | Auth    |
| ------ | -------------------------------------- | ------- |
| POST   | `/auth/register`                       | Público |
| POST   | `/auth/login`                          | Público |
| POST   | `/auth/refresh`                        | Público |
| POST   | `/auth/request-password-reset`         | Público |
| POST   | `/auth/reset-password`                 | Público |
| POST   | `/auth/verify-email/:token`            | Público |
| POST   | `/auth/logout`                         | Privado |
| POST   | `/auth/logout-all`                     | Miembro+|
| GET    | `/auth/me`                             | Privado |
| GET    | `/auth/profile`                        | Privado |
| PUT    | `/auth/profile`                        | Privado |
| POST   | `/auth/change-password`                | Verif.  |
| GET    | `/auth/sessions`                       | Privado |
| GET    | `/auth/companies`                      | Privado |
| POST   | `/auth/switch-company/:slug`           | Privado |
| GET    | `/auth/validate-slug/:slug`            | Privado |

### Users

| Método | Ruta                                    | Auth    |
| ------ | --------------------------------------- | ------- |
| POST   | `/user`                                 | Privado |
| GET    | `/user`                                 | Privado |
| PATCH  | `/user/:id/rol`                         | Privado |
| DELETE | `/user/:id`                             | Privado |
| PATCH  | `/user/:id/deactivate`                  | Privado |
| GET    | `/user/:id/workspaces`                  | Privado |
| POST   | `/user/:id/assign-workspaces`           | Privado |
| DELETE | `/user/:id/unassign-workspaces`         | Privado |

### Workspaces

| Método | Ruta                                    | Auth    |
| ------ | --------------------------------------- | ------- |
| GET    | `/workspace`                            | Privado |
| POST   | `/workspace`                            | Privado |
| GET    | `/workspace/:id`                        | Privado |
| PUT    | `/workspace/:id`                        | Privado |
| DELETE | `/workspace/:id`                        | Privado |
| GET    | `/workspace/:id/members`                | Privado |
| POST   | `/workspace/:id/members`                | Privado |
| DELETE | `/workspace/:id/members/:memberId`      | Privado |
| GET    | `/workspace/:id/tasks`                  | Privado |
| GET    | `/workspace/:id/users`                  | Privado |
| POST   | `/workspace/:id/assign`                 | Privado |
| DELETE | `/workspace/:id/unassign`               | Privado |

### Tasks

| Método | Ruta                             | Auth       |
| ------ | -------------------------------- | ---------- |
| GET    | `/task`                          | Verif.     |
| POST   | `/task`                          | Verif.     |
| PUT    | `/task/:taskId`                  | Verif.     |
| PATCH  | `/task/:taskId/next-status`      | Verif.     |
| DELETE | `/task/:taskId`                  | Verif.     |

*Verif. = requiere email verificado.*

---

## Respuesta API

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "meta": {
    "timestamp": "2026-05-12T10:00:00.000Z",
    "requestId": "uuid",
    "details": {}
  }
}
```

---

## Docker

El entrypoint oficial está en la raíz del monorepo con `docker compose up --build`.

Para levantar solo el backend (legacy):

```bash
docker compose -f docker-compose.yml up -d postgres redis app
```

Documentación Docker en `docs/docker/`:
- [fullstack-quickstart.md](../docs/docker/fullstack-quickstart.md)
- [architecture.md](../docs/docker/architecture.md)
- [env-vars.md](../docs/docker/env-vars.md)

---

## Swagger

Documentación interactiva disponible en `/api-docs` cuando el servidor está corriendo. Incluye Token Manager personalizado que captura automáticamente los tokens JWT de las respuestas.

---

## Pruebas

```bash
npm test                 # Todas las pruebas
npm run test:watch       # Modo watch
npm run test:coverage    # Reporte de cobertura
```

Framework: Jest + ts-jest + supertest.
