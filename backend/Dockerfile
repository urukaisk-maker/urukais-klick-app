# ============================================
# URUKAIS KLICK - Backend Dockerfile
# Multi-stage: build + producción
# ============================================

# ---------- ETAPA 1: BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema para Prisma
RUN apk add --no-cache openssl libc6-compat

# Copiar package.json y instalar TODO (incluye dev para compilar)
COPY package*.json ./
RUN npm ci

# Copiar schema de Prisma ANTES de generar
COPY prisma ./prisma

# Generar el cliente Prisma
RUN npx prisma generate

# Copiar el código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# ---------- ETAPA 2: PRODUCCIÓN ----------
FROM node:20-alpine AS runner

WORKDIR /app

# openssl es necesario para que Prisma funcione en alpine
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

# Copiar package.json para instalar SOLO dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar el cliente de Prisma generado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar el código compilado
COPY --from=builder /app/dist ./dist

# Copiar el schema y las migraciones (para poder migrar en runtime)
COPY prisma ./prisma

# Exponer el puerto
EXPOSE 3000

# Script de arranque: aplica migraciones y arranca
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
