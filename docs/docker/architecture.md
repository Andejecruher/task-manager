# Docker Architecture

## Objetivo

Unificar desarrollo local en un unico `docker-compose.yml` en la raiz, con puertos DEV anti-choques y sin romper comportamiento interno del backend.

## Servicios

- `frontend` (Next.js): sirve UI y consume API via `NEXT_PUBLIC_API_URL`.
- `app` (backend Node.js): expone API interna en `3000` dentro de contenedor.
- `postgres`: base principal para backend.
- `redis`: cache/sesiones para backend.
- `adminer`: UI de administracion de postgres.
- `redis-commander`: UI de administracion de redis.

## Red y puertos

Todos los servicios corren en la red bridge `taskmanager-network-dev`.

Mapeos host->contenedor oficiales:

- frontend `5173:3000`
- backend `8000:3000`
- debug `9230:9229`
- postgres `5433:5432`
- redis `6380:6379`
- adminer `8082:8080`
- redis-commander `8083:8081`

## Compatibilidad backend

No se modifica el puerto interno del backend (`3000`) ni puertos internos de postgres/redis.
Solo cambia publicacion en host para evitar choques con otras apps locales.

## Reuso de configuracion existente

El compose root reutiliza configuracion del backend actual:

- build de `task-manager-backend/docker/postgres/Dockerfile`
- build de `task-manager-backend/docker/app/Dockerfile.dev`
- mismos env vars de backend
- mismos volumenes de datos y logs

Con ajustes minimos de rutas para contexto de monorepo (`./task-manager-backend/...`).
