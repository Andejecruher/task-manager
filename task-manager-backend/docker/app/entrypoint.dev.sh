#!/bin/sh
set -eu

# Forzar ejecución como root para desarrollo
echo "Running as root (development mode)"
mkdir -p /app/logs /app/node_modules /app/dist
chmod -R 777 /app/logs /app/node_modules /app/dist

# Ejecutar el comando directamente sin cambiar de usuario
exec "$@"
