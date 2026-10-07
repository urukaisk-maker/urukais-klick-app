#!/bin/bash
echo "🛑 Parando Urukais Klick..."

pkill -9 -f "nest start" 2>/dev/null && echo "✅ Backend parado" || echo "ℹ️  Backend no estaba corriendo"
pkill -9 -f "vite" 2>/dev/null && echo "✅ Frontend parado" || echo "ℹ️  Frontend no estaba corriendo"

# Preguntar si paramos la BD
read -p "¿Parar también Postgres? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  sudo docker stop urukais-db && echo "✅ Postgres parado"
else
  echo "ℹ️  Postgres sigue corriendo (puedes pararlo con: sudo docker stop urukais-db)"
fi

echo ""
echo "🌸 ¡Hasta pronto!"
