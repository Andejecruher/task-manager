# Task Manager (Monorepo)

Este repositorio contiene el backend y el frontend del proyecto en el mismo árbol de carpetas.

Estructura:

- `task-manager-backend/` — API y servicios (repo principal, historial preservado).
- `task-manager-frontend/` — Aplicación cliente (sin historial git independiente).

Uso rápido:

Instalar dependencias (root, gestionado por npm workspaces):

```bash
npm install
```

Iniciar sólo backend:

```bash
npm run start:backend
```

Iniciar sólo frontend:

```bash
npm run start:frontend
```

Iniciar ambos en paralelo (requiere `concurrently`):

```bash
npm run dev
```
