#!/bin/bash
# ============================================
# Urukais Klick - Script de arranque
# ============================================

set -e

PROJECT_DIR="$HOME/urukais-klick"

echo "🌸 Iniciando Urukais Klick..."
echo ""

# 1. Asegurar que Docker/Postgres está arriba
if ! sudo docker ps --filter "name=urukais-db" --filter "status=running" | grep -q urukais-db; then
  echo "🐳 Arrancando Postgres..."
  sudo docker start urukais-db 2>/dev/null || \
    sudo docker run --name urukais-db \
      -e POSTGRES_USER=urukais \
      -e POSTGRES_PASSWORD=klick_secret \
      -e POSTGRES_DB=urukais_klick \
      -p 5432:5432 \
      -d postgres:16
  sleep 3
else
  echo "✅ Postgres ya está corriendo"
fi

# 2. Matar procesos viejos si quedaron
pkill -9 -f "nest start" 2>/dev/null || true
pkill -9 -f "vite" 2>/dev/null || true
sleep 1

# 3. Abrir backend en nueva terminal
echo "⚙️  Arrancando backend en puerto 3000..."
gnome-terminal --tab --title="Urukais Backend" -- \
  bash -c "cd '$PROJECT_DIR/backend' && npm run start:dev; exec bash" 2>/dev/null || \
  konsole --new-tab -p tabtitle="Urukais Backend" \
    -e bash -c "cd '$PROJECT_DIR/backend' && npm run start:dev; exec bash" 2>/dev/null || \
  xterm -T "Urukais Backend" -e "cd '$PROJECT_DIR/backend' && npm run start:dev; bash" &

sleep 6

# 4. Abrir frontend en nueva terminal
echo "🎨 Arrancando frontend en puerto 5173..."
gnome-terminal --tab --title="Urukais Frontend" -- \
  bash -c "cd '$PROJECT_DIR/frontend' && npm run dev; exec bash" 2>/dev/null || \
  konsole --new-tab -p tabtitle="Urukais Frontend" \
    -e bash -c "cd '$PROJECT_DIR/frontend' && npm run dev; exec bash" 2>/dev/null || \
  xterm -T "Urukais Frontend" -e "cd '$PROJECT_DIR/frontend' && npm run dev; bash" &

sleep 5

echo ""
echo "🎌 ¡Todo listo!"
echo ""
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000/api"
echo "   Swagger:   http://localhost:3000/api/docs"
echo "   Prisma:    http://localhost:5555  (ejecuta: npx prisma studio)"
echo ""
echo "   Demo:      demo@urukais.kl / demo1234"
echo ""
