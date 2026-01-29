FROM node:18-alpine

# Instalar herramientas de desarrollo
RUN apk add --no-cache \
    bash \
    curl \
    git \
    nano \
    postgresql-client \
    tzdata

# Configurar timezone
ENV TZ=America/Mexico_City

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias (incluyendo devDependencies)
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puertos
EXPOSE 3000 9229

# Comando por defecto
CMD ["npm", "run", "dev"]