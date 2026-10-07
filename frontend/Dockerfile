# ============================================
# URUKAIS KLICK - Frontend Dockerfile
# Build con Vite + servidor Nginx
# ============================================

# ---------- ETAPA 1: BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Variable de entorno: la API se sirve en /api (por proxy de nginx)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Compilar Vite
RUN npm run build

# ---------- ETAPA 2: NGINX ----------
FROM nginx:alpine AS runner

# Copiar la configuración customizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
