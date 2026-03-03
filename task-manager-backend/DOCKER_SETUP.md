# Docker Setup - Task Manager Backend

## Descripción de cambios realizados

Se han optimizado los Dockerfiles para cumplir con mejores prácticas de seguridad, rendimiento y mantenibilidad.

### 1. **Dockerfile (Producción)**
Ubicación: `docker/app/Dockerfile`

**Características:**
- ✅ **Multi-stage build**: Separa la etapa de compilación de la de runtime
- ✅ **Optimización de capas**: Reduce el tamaño final de la imagen
- ✅ **Seguridad mejorada**: 
  - Ejecuta como usuario no-root (`nodejs`)
  - Usa `dumb-init` para manejar signals correctamente
  - Solo instala dependencias de producción
- ✅ **Health check**: Verifica que la aplicación esté saludable
- ✅ **Variables de entorno**: `NODE_ENV=production`
- ✅ **Compilación TypeScript**: Compila en el builder, ejecuta en runtime

**Uso:**
```bash
# Construir imagen de producción
docker build -f docker/app/Dockerfile -t task-manager-app:latest .

# Ejecutar contenedor
docker run -p 3000:3000 task-manager-app:latest
```

### 2. **Dockerfile.dev (Desarrollo)**
Ubicación: `docker/app/Dockerfile.dev`

**Características:**
- ✅ **Herramientas de desarrollo**: Incluye bash, curl, git, nano
- ✅ **Hot reload**: Soporta cambios en tiempo real con `npm run dev`
- ✅ **Debug port**: Expone puerto 9229 para debugging
- ✅ **Health check**: Verifica que la aplicación esté saludable
- ✅ **Todas las dependencias**: Instala devDependencies para desarrollo

**Uso:**
```bash
# Construir imagen de desarrollo
docker build -f docker/app/Dockerfile.dev -t task-manager-app:dev .

# Ejecutar contenedor
docker run -p 3000:3000 -p 9229:9229 task-manager-app:dev
```

### 3. **.dockerignore**
Ubicación: `docker/.dockerignore`

**Propósito:**
- Excluye archivos innecesarios del contexto de build
- Reduce el tamaño del contexto enviado al daemon de Docker
- Mejora la velocidad de construcción

### 4. **docker-compose.yml (Actualizado)**

**Cambios:**
- Usa `Dockerfile.dev` para desarrollo
- Simplifica el comando de inicio (npm install ya está en el Dockerfile)
- Mantiene volúmenes para hot reload
- Ejecuta migraciones antes de iniciar la aplicación

**Uso:**
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs de la aplicación
docker-compose logs -f app

# Detener servicios
docker-compose down
```

## Comparativa de imágenes

### Dockerfile (Producción)
- **Tamaño**: ~300-350MB (optimizado)
- **Startup time**: ~2-3 segundos
- **Seguridad**: Usuario no-root, sin herramientas innecesarias
- **Uso**: Deployments en producción

### Dockerfile.dev (Desarrollo)
- **Tamaño**: ~400-450MB (incluye herramientas)
- **Startup time**: ~3-5 segundos
- **Características**: Hot reload, debugging, herramientas
- **Uso**: Desarrollo local con Docker

## Health Check

Ambos Dockerfiles incluyen health checks que verifican el endpoint `/health`:

```bash
# Verificar manualmente
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-26T23:26:00.000Z",
    "uptime": 45.123,
    "environment": "production|development",
    "version": "1.0.0"
  }
}
```

## Mejores prácticas implementadas

1. **Security**
   - Usuario no-root
   - Minimización de capas
   - Solo dependencias necesarias en runtime

2. **Performance**
   - Multi-stage build
   - Caché de npm
   - Optimización de capas

3. **Reliability**
   - Health checks
   - Proper signal handling con dumb-init
   - Graceful shutdown

4. **Maintainability**
   - .dockerignore para contexto limpio
   - Separación dev/prod
   - Documentación clara

## Notas importantes

- El endpoint `/health` ya existe en `src/app.ts` (línea 110)
- Las migraciones se ejecutan automáticamente en docker-compose
- Los puertos 3000 (app) y 9229 (debug) están expuestos
- Redis y PostgreSQL tienen health checks configurados
