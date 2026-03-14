# Task Manager Backend

Backend completo para sistema de gestion de tareas estilo Notion con multi-tenancy.

## Inicio rapido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+
- npm 8+

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd task-manager-backend
cp .env.example .env
```

### 2. Levantar entorno de desarrollo

```bash
docker compose up -d --build
```

Nota: por defecto `DB_SYNC_MODE=false` para evitar bloqueos en arranque. Usa migraciones para cambios de esquema.

Servicios disponibles:

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Adminer (DB UI): `http://localhost:8080`
- Redis Commander: `http://localhost:8081`

### 3. Acceder a PostgreSQL desde Adminer

Usa estos datos en `http://localhost:8080`:

- Sistema: `PostgreSQL`
- Servidor: `postgres`
- Usuario: `taskmanager_user`
- Contrasena: `dev_password_123`
- Base de datos: `taskmanager_dev`

### 4. Apagar servicios

```bash
docker compose down
```
