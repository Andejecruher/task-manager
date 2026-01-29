FROM postgres:15-alpine

# Instalar herramientas útiles para debugging
RUN apk add --no-cache \
    bash \
    curl \
    nano \
    postgresql-client

# Copiar configuración optimizada
COPY postgresql.conf /etc/postgresql/postgresql.conf
COPY init.sql /docker-entrypoint-initdb.d/

# Crear directorio para scripts personalizados
RUN mkdir -p /docker-entrypoint-initdb.d/custom-scripts

# Configurar permisos
RUN chmod 644 /etc/postgresql/postgresql.conf && \
    chmod 644 /docker-entrypoint-initdb.d/init.sql

# Script de health check personalizado
COPY health-check.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/health-check.sh

# Cambiar usuario a postgres para seguridad
USER postgres

# Puerto expuesto
EXPOSE 5432

# Comando por defecto
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]