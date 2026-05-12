# Task Manager Frontend

Aplicación cliente web para sistema de gestión de tareas multi-tenant. Construida con Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui.

---

## Stack

| Componente         | Tecnología                                        |
| ------------------ | ------------------------------------------------- |
| Framework          | Next.js 16 (App Router)                           |
| UI                 | React 19.2, Tailwind CSS v4, shadcn/ui (58 cmp)   |
| Estado servidor    | TanStack React Query v5 (staleTime: 30s, retry: 1)|
| Estado cliente     | React Context (Auth, Workspace, Tasks)            |
| Formularios        | React Hook Form + @hookform/resolvers + Zod       |
| HTTP               | Axios (instancia pública + autenticada)           |
| Gráficos           | Recharts                                          |
| Notificaciones     | Sonner                                            |
| Iconos             | Lucide + Phosphor Icons                           |
| Animaciones        | embla-carousel                                    |
| Analytics          | @vercel/analytics                                 |

---

## Requisitos

- Node.js >= 18
- npm >= 8

---

## Estructura del proyecto

```
task-manager-frontend/
├── app/
│   ├── [subdominio]/            # Rutas dinámicas por subdominio de compañía
│   │   ├── (authenticated)/     # Layout protegido (sidebar + header)
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── workspaces/
│   │   │   ├── team/
│   │   │   ├── settings/
│   │   │   └── reports/
│   │   ├── login/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── layout.tsx           # Layout anidado con AuthProvider
│   ├── register/                # Registro de nueva compañía
│   ├── verify-email/            # Verificación de email
│   ├── layout.tsx               # Layout raíz (providers globales)
│   ├── page.tsx                 # Landing page
│   └── not-found.tsx            # Página 404
├── components/
│   ├── ui/                      # 58 componentes shadcn/ui
│   ├── app-sidebar.tsx          # Sidebar de navegación
│   ├── app-toaster.tsx          # Configuración de Sonner
│   ├── create-task-dialog.tsx   # Modal de creación de tareas
│   ├── task-card.tsx            # Card para tablero Kanban
│   ├── task-details-dialog.tsx  # Modal de detalle de tarea
│   ├── team/                    # Gestión de equipo
│   ├── workspace-members/       # Miembros de workspace
│   └── workspaces/              # Listado/administración de workspaces
├── context/
│   ├── auth-context.tsx         # Auth provider real (API)
│   ├── tasks-context.tsx        # Estado de tareas
│   └── workspace-context.tsx    # Estado de workspaces
├── hooks/                       # Custom hooks (9)
├── lib/
│   ├── api-client.ts            # Axios instance pública
│   ├── auth-api-client.ts       # Axios instance con Bearer token
│   ├── auth-context.tsx         # Auth provider con seed data (demo/local)
│   ├── cookies.ts               # Extracción de tokens de cookies
│   ├── query-provider.tsx       # TanStack Query provider
│   ├── schemas/                 # Schemas Zod para formularios
│   ├── types/                   # Tipos compartidos
│   └── utils.ts                 # Utilidades (cn, etc.)
├── services/
│   ├── auth.ts                  # register, login, getMe, verifyEmail, etc.
│   ├── tasks.ts                 # CRUD + moveToNextStatus
│   ├── user.ts                  # companyUsers, assign/unassign workspaces
│   └── workspace.ts             # CRUD workspaces + miembros
├── styles/
│   └── globals.css              # Tailwind v4 + variables CSS tema
├── types/                       # Tipos TypeScript
├── proxy.ts                     # Middleware Next.js (redirects, auth check)
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json              # Configuración shadcn/ui
├── package.json
└── tsconfig.json
```

---

## Scripts

| Comando           | Descripción                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Servidor de desarrollo (Next.js)   |
| `npm run build`   | Build de producción                |
| `npm run start`   | Iniciar servidor de producción     |
| `npm run lint`    | ESLint                             |

---

## Arquitectura de routing

El frontend usa **App Router** de Next.js 16 con **ruteo por subdominio dinámico**:

```
/[subdominio]/login
/[subdominio]/dashboard
/[subdominio]/tasks
/[subdominio]/workspaces
...
```

El middleware `proxy.ts` se ejecuta en cada request y:
- Redirige usuarios no autenticados a `/[subdominio]/login`
- Redirige usuarios autenticados fuera de `/register` y `/[slug]/login`
- Valida el slug de compañía contra la API
- Define rutas públicas explícitas

### Layout anidado

```
RootLayout
├── ReactQueryProvider
├── AuthProvider (context/auth-context.tsx)
│   ├── WorkspaceProvider
│   │   ├── TasksProvider
│   │   └── (authenticated)/layout.tsx → Sidebar + Header
│   └── AppToaster (Sonner)
└── Analytics (@vercel/analytics)
```

---

## Estado y data fetching

### TanStack React Query v5

Configuración global en `lib/query-provider.tsx`:
- `staleTime`: 30 segundos
- `retry`: 1 intento
- Provider envuelve toda la aplicación

### Contextos React

| Contexto            | Fuente       | Propósito                                  |
| ------------------- | ------------ | ------------------------------------------ |
| `AuthProvider`      | API real     | Login, registro, sesión, perfil            |
| `WorkspaceProvider` | API real     | CRUD workspaces, workspace activo          |
| `TasksProvider`     | API real     | CRUD tareas, transición de estados         |

> **Nota:** Existe un `AuthProvider` alternativo en `lib/auth-context.tsx` con datos semilla para desarrollo/demo offline.

---

## Autenticación

### Flujo completo

1. **Registro** → crea compañía + usuario owner + envía email de verificación
2. **Login** → valida credenciales → setea cookies `access_token` + `refresh_token`
3. **Restauración de sesión** → al montar, lee `access_token` de cookie y llama a `/auth/me`
4. **Refresh** → cuando expira el access token, usa el refresh token para renovar
5. **Logout** → elimina cookies + limpia sesión en backend

### Funcionalidades de auth

- Login/register con manejo de errores
- Verificación de email
- Recuperación de contraseña (request + reset)
- Cambio de contraseña (requiere email verificado)
- Switch entre compañías
- Validación de slug de compañía

---

## API Integration

Dos instancias de Axios:

| Instancia          | Archivo               | Característica                    |
| ------------------ | --------------------- | --------------------------------- |
| `apiClient`        | `lib/api-client.ts`   | Sin autenticación (pública)       |
| `authApiClient`    | `lib/auth-api-client.ts` | Interceptor Bearer token       |

Las URLs se configuran vía variables de entorno:
- `NEXT_PUBLIC_API_URL` — URL pública (ej. `http://localhost:8000/api/v1`)
- `API_INTERNAL_URL` — URL interna para server components (ej. `http://app:3000/api/v1`)

---

## Formularios

Usamos **React Hook Form** + **Zod** para validación client-side.

Esquemas de validación en `lib/schemas/` con `@hookform/resolvers/zod`.

---

## Componentes

### shadcn/ui (58 componentes)

Conjunto completo: accordion, alert, avatar, badge, button, calendar, card, checkbox, dialog, drawer, dropdown-menu, form, input, label, popover, select, sheet, sidebar, skeleton, switch, table, tabs, textarea, tooltip, etc.

Estilo: **New York**, baseColor: neutral.

### Componentes personalizados (9)

| Componente                | Propósito                                    |
| ------------------------- | -------------------------------------------- |
| `app-sidebar.tsx`         | Sidebar principal de navegación              |
| `app-toaster.tsx`         | Configuración de notificaciones Sonner       |
| `create-task-dialog.tsx`  | Diálogo de creación de tareas                |
| `task-card.tsx`           | Card para tablero Kanban                     |
| `task-details-dialog.tsx` | Vista detallada de tarea                     |
| `team/`                   | Gestión de miembros del equipo               |
| `workspace-members/`      | Administración de miembros por workspace     |
| `workspaces/`             | Listado y administración de workspaces       |

---

## Estilos y tema

### Tailwind CSS v4

Configuración moderna con `@import "tailwindcss"` + bloque `@theme inline` en `styles/globals.css`.

Esquema de colores en **oklch** con variables CSS para tema claro y oscuro (clase `.dark`).

Radio de borde global: `0.625rem`.

### Animaciones

Keyframes incluidos: accordion, caret-blink, fade-in/fade-out, slide-in/slide-out para todas las direcciones.

---

## Variables de entorno

| Variable                | Default                          | Descripción                     |
| ----------------------- | -------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL`   | `http://localhost:8000/api/v1`  | URL base de la API (pública)    |
| `API_INTERNAL_URL`      | `http://app:3000/api/v1`        | URL interna (server components) |

---

## Docker

El entrypoint oficial está en la raíz del monorepo con `docker compose up --build`.

El `Dockerfile.dev` del frontend:
- Base: `node:20-alpine`
- Comando: `npm ci && npm run dev`
- Expone puerto 3000 (mapeado a `5173` en host)
