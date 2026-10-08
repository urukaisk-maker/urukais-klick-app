<div align="center">

# ⛩️ Urukais Klick

### 🎌 Tu agenda personal con gamificación estilo anime

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Agenda full-stack con sistema RPG de XP, niveles, logros, mascota virtual, tienda, música, recetas y más.**

[🚀 Instalación](#-instalación) · [✨ Features](#-features) · [📸 Capturas](#-capturas) · [🗺️ Roadmap](#-roadmap)

</div>

---

## ✨ Features

### 📋 Gestión personal
- ✅ **Tareas** con subtareas, prioridades y dificultades
- 🔥 **Hábitos** con streaks diarios y seguimiento semanal
- 📅 **Calendario** con eventos y vista mensual
- 📝 **Notas** con diario personal y moods
- 📂 **21 categorías** + 28 subcategorías personalizables

### 🎮 Gamificación tipo RPG
- ⚡ **XP y niveles** con 60 rangos (Genin → Hokage)
- 💰 **Monedas** para gastar en la tienda
- 🏆 **20 logros** con rarezas (Común → Mítico)
- 🔥 **Streaks** con recompensas crecientes
- 🦊 **Mascota virtual** (Uru-chan) que cuidar
- 🛒 **Tienda** con temas, stickers, avatares y boosts
- 🎁 **Recompensa diaria** con bonus por racha
- 🎯 **Misiones diarias** con progreso automático

### 🎨 Diseño
- 🌸 Estética anime con pétalos de sakura flotando
- ✨ Glassmorphism + gradientes neón
- 📱 **PWA instalable** (funciona como app nativa)
- 🎵 **Reproductor de música** integrado con Audius
- 🍳 **Recetas de cocina** con traducción automática
- 🌙 Modo oscuro elegante

---

## 📸 Capturas

<div align="center">

### 🏠 Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### 🎵 Reproductor de música
![Música](./docs/screenshots/music.png)

### 🍳 Recetas con traducción
![Recetas](./docs/screenshots/recipes.png)

### 🎯 Misiones diarias
![Misiones](./docs/screenshots/missions.png)

</div>

> 💡 **¿Aún no hay capturas?** Abre un PR con tus propias screenshots en `docs/screenshots/`

---

## 🚀 Instalación

### Requisitos
- **Docker** + Docker Compose
- **Git**

> No necesitas Node.js ni nada más. Todo va en contenedores.

### 1. Clonar
```bash
git clone https://github.com/urukaisk-maker/urukais-klick-app.git
cd urukais-klick-app
```

### 2. Configurar
```bash
cp .env.example .env
```

Edita `.env` si quieres cambiar contraseñas (opcional para desarrollo).

### 3. Levantar todo
```bash
docker compose up -d --build
```

Espera 3-5 minutos la primera vez.

### 4. Ejecutar el seed
```bash
docker compose exec backend npx prisma db seed
```

### 5. Abrir
- 🌸 **Frontend**: http://localhost
- 📖 **Swagger**: http://localhost/api/docs
- 🎛️ **PgAdmin**: http://localhost:5050

**Cuenta demo:**
- Email: `demo@urukais.kl`
- Password: `demo1234`

---

## 🐳 Comandos útiles

```bash
# Arrancar todo
docker compose up -d

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Parar todo
docker compose down

# Rebuild tras cambios
docker compose up -d --build

# Ejecutar comando en el backend
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma db seed
```

---

## 🏗️ Stack técnico

### Backend
- **NestJS 10** — framework Node.js modular
- **Prisma 6** — ORM con migraciones tipadas
- **PostgreSQL 16** — base de datos
- **JWT + cookies httpOnly** — autenticación segura
- **Swagger** — documentación automática
- **Audius API** — música libre
- **TheMealDB + traducción** — recetas internacionales

### Frontend
- **React 19** + **Vite** — SPA ultrarrápida
- **TypeScript** — tipado estricto
- **TailwindCSS 3** — tema anime custom
- **Zustand** — estado global ligero
- **Framer Motion** — animaciones fluidas
- **React Router 7** — navegación
- **PWA** — instalable como app

### Infra
- **Docker Compose** — orquestación
- **Nginx** — servidor estático + proxy
- **Multi-stage builds** — imágenes optimizadas

---

## 📂 Estructura

```
urukais-klick-app/
├── backend/               # API NestJS
│   ├── src/
│   │   ├── auth/         # JWT + cookies
│   │   ├── users/        # perfiles y gamificación
│   │   ├── tasks/        # CRUD tareas
│   │   ├── habits/       # hábitos + streaks
│   │   ├── categories/   # categorías
│   │   ├── notes/        # notas
│   │   ├── events/       # calendario
│   │   ├── achievements/ # logros
│   │   ├── missions/     # misiones diarias
│   │   ├── mascot/       # mascota virtual
│   │   ├── shop/         # tienda
│   │   ├── audius/       # música
│   │   ├── recipes/      # recetas + traducción
│   │   └── common/       # guards, decorators
│   ├── prisma/
│   │   ├── schema.prisma # 37 modelos
│   │   ├── migrations/   # historial
│   │   └── seed.ts       # datos iniciales
│   └── Dockerfile
│
├── frontend/              # SPA React
│   ├── src/
│   │   ├── pages/        # 12 pantallas
│   │   ├── components/   # reutilizables
│   │   ├── hooks/        # useFeedback, useInstallPrompt
│   │   ├── store/        # Zustand (auth, player)
│   │   ├── lib/          # axios
│   │   └── types/        # tipos TS
│   ├── public/
│   │   ├── manifest.json # PWA
│   │   └── sw.js         # service worker
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── start.sh
└── stop.sh
```

---

## 🎮 Sistema de gamificación

### XP y niveles
| Acción | XP |
|--------|-----|
| Tarea Fácil | +10 |
| Tarea Normal | +15 |
| Tarea Difícil | +20 |
| Tarea Jefe | +30 |
| Hábito completado | +5 |
| Recompensa diaria | +20 a +70 |
| Logro desbloqueado | +30 a +5000 |

### Rangos
| Rango | Niveles |
|-------|---------|
| 🍥 Genin | 1-5 |
| 🎖️ Chunin | 6-15 |
| 🏅 Jonin | 16-30 |
| 🥷 ANBU | 31-50 |
| 👑 Hokage | 51+ |

### Monedas
- Completar tarea: **+5 a +20** 🪙
- Recompensa diaria: **+10 a +40** 🪙
- Desbloquear logro: **+5 a +1000** 🪙

---

## 🗺️ Roadmap

- [x] Auth JWT + cookies httpOnly
- [x] Tareas con subtareas
- [x] Hábitos + streaks
- [x] 20 logros con rarezas
- [x] Mascota virtual con stats
- [x] Tienda con items
- [x] Calendario con eventos
- [x] Reproductor de música (Audius)
- [x] Recetas con traducción automática
- [x] Recompensa diaria
- [x] Misiones diarias
- [x] PWA instalable
- [x] Confetti + sonidos
- [x] **Temas de la tienda funcionando** ← *en desarrollo*
- [ ] Buscador global
- [ ] Modo claro
- [ ] Deploy en producción

---

## 🤝 Contribuir

¿Ideas, bugs o mejoras? Abre un **issue** o manda un **PR**.

**Convenciones:**
- Commits con emoji (🎌 init, ✨ feature, 🐛 fix, 🎨 estilos, 📝 docs)
- Código en español para el dominio, inglés para variables técnicas
- Formato: Prettier

---

## 👤 Autor

**Manuel Casimiro Carrasco** ([@urukaisk-maker](https://github.com/urukaisk-maker))

- 🐙 [GitHub](https://github.com/urukaisk-maker)
- 🏠 [Calculadora de Hipotecas](https://meek-frangipane-594897.netlify.app/)
- 💼 [Mi Currículum](https://unique-biscochitos-31bcea.netlify.app/#hardware)

---

## 📄 Licencia

MIT © Manuel Casimiro Carrasco

---

<div align="center">

**Hecho con 💖 en Garuda Linux**

🎌 **¡Ganbatte!** 🎌

</div>