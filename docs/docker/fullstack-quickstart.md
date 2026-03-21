# Docker Full Stack Quickstart

Este documento define el flujo oficial para levantar el monorepo completo con Docker.

## Comando oficial

Desde la raiz del monorepo:

```bash
docker compose up --build
```

El comando levanta:

- frontend Next.js
- backend Node.js
- postgres
- redis
- adminer
- redis-commander

Para detener todo:

```bash
docker compose down
```

## Endpoints principales

- Frontend: `http://localhost:5173`
- Backend API base: `http://localhost:8000/api/v1`
- Adminer: `http://localhost:8082`
- Redis Commander: `http://localhost:8083`

## Notas

- El compose oficial es `docker-compose.yml` en la raiz.
- El compose en `task-manager-backend/docker-compose.yml` queda como legacy para uso local del backend, pero no es el entrypoint oficial del monorepo.
