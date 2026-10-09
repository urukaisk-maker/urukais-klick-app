<div align="center">

# ⛩️ Urukais Klick

**🎌 Tu agenda personal con gamificación estilo anime**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-96.2%25-3178C6?logo=typescript&logoColor=white)](#)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](#)

Agenda full-stack con sistema RPG de XP, niveles, logros, mascota virtual, tienda, música, recetas, estadísticas y más.

[🚀 Instalación](#-instalación) · [✨ Features](#-features) · [🎮 Gamificación](#-sistema-de-gamificación) · [🗺️ Roadmap](#️-roadmap)

</div>

---

## 📑 Tabla de contenidos

- [✨ Features](#-features)
- [🚀 Instalación](#-instalación)
- [🐳 Comandos útiles](#-comandos-útiles)
- [🏗️ Stack técnico](#️-stack-técnico)
- [📂 Estructura](#-estructura)
- [🎮 Sistema de gamificación](#-sistema-de-gamificación)
- [🔐 Seguridad](#-seguridad)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contribuir](#-contribuir)
- [👤 Autor](#-autor)
- [📄 Licencia](#-licencia)

---

## ✨ Features

### 📋 Gestión personal

- ✅ Tareas con subtareas, prioridades y dificultades.
- 🍅 Pomodoro con timer circular y notificaciones.
- 🔥 Hábitos con streaks diarios y seguimiento semanal.
- 📅 Calendario con eventos y vista mensual.
- 📝 Notas con moods y diario personal.
- 🎯 Metas con milestones y progreso visual.
- 📂 21 categorías + 28 subcategorías personalizables.
- 🔍 Buscador global con `Ctrl + K`.

### 🎮 Gamificación tipo RPG

- ⚡ XP y niveles con **5 rangos** (Genin → Hokage).
- 💰 Monedas para gastar en la tienda.
- 🏆 20 logros con rarezas (Común → Mítico).
- 🔥 Streaks con recompensas crecientes.
- 🦊 Mascota virtual (**Uru-chan**) que cuidar.
- 🛒 Tienda con temas, stickers, avatares y boosts.
- 🎁 Recompensa diaria con bonus por racha.
- 🎯 Misiones diarias con progreso automático.

### 🎨 Diseño y experiencia

- 🌸 Estética anime con pétalos de sakura flotando.
- ✨ Glassmorphism + gradientes neón.
- 🎨 4 temas dinámicos: Sakura, Neón, Cyber, Dark Souls.
- 📱 PWA instalable (funciona como app nativa).
- 🔔 Notificaciones del navegador.
- 🎵 Reproductor de música integrado con Audius.
- 🍳 Recetas de cocina con traducción automática.
- 📊 Estadísticas con heatmap tipo GitHub.
- 🎉 Confetti + sonidos al completar acciones.

---

## 🚀 Instalación

### Requisitos

- **Docker** (con **Docker Compose V2**, comando `docker compose`).
- **Git**.

> No necesitas instalar Node.js, PostgreSQL ni nada más en tu máquina. Todo se ejecuta dentro de contenedores.

### 1. Clonar el repositorio

```bash
git clone https://github.com/urukaisk-maker/urukais-klick-app.git
cd urukais-klick-app
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` si quieres cambiar contraseñas o puertos (opcional para desarrollo).

### 3. Levantar los contenedores

```bash
docker compose up -d --build
```

> La primera vez tarda entre 3 y 5 minutos según el hardware.

### 4. Aplicar migraciones y seed

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

> El `seed` requiere que `package.json` tenga configurada la clave `"prisma": { "seed": "..." }`. Si no, ejecútalo directamente con `ts-node prisma/seed.ts`.

### 5. Acceder

| Servicio | URL |
|---|---|
| 🌸 Frontend | http://localhost |
| 📖 Swagger | http://localhost/api/docs |
| 🎛️ PgAdmin | http://localhost:5050 |

**Cuenta demo:**

```text
Email:    demo@urukais.kl
Password: demo1234
```

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

# Comandos dentro del backend
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma db seed
docker compose exec backend npx prisma migrate deploy
```

---

## 🏗️ Stack técnico

### Backend

- **NestJS 10** — framework Node.js modular.
- **Prisma 6** — ORM con migraciones tipadas.
- **PostgreSQL 16** — base de datos.
- **JWT + cookies httpOnly** — autenticación segura.
- **Swagger** — documentación automática.
- **Throttler** — rate limiting por IP.
- **Audius API** — música libre.
- **TheMealDB + traducción** — recetas internacionales.

### Frontend

- **React 19 + Vite** — SPA ultrarrápida.
- **TypeScript** — tipado estricto.
- **TailwindCSS 3** — tema anime custom.
- **Zustand** — estado global ligero.
- **Framer Motion** — animaciones fluidas.
- **React Router 7** — navegación.
- **Recharts** — gráficos.
- **PWA** — instalable como app.

### Infra

- **Docker Compose** — orquestación.
- **Nginx** — servidor estático + proxy inverso.
- **Multi-stage builds** — imágenes optimizadas.

---

## 📂 Estructura

```text
urukais-klick-app/
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── auth/             # JWT + cookies + sesiones
│   │   ├── users/            # Perfiles, daily reward, contraseñas
│   │   ├── tasks/            # CRUD tareas + XP + logros
│   │   ├── habits/           # Hábitos + streaks
│   │   ├── categories/       # Categorías + subcategorías
│   │   ├── notes/            # Notas + diario
│   │   ├── events/           # Calendario
│   │   ├── goals/            # Metas + milestones
│   │   ├── achievements/     # Logros
│   │   ├── missions/         # Misiones diarias
│   │   ├── pomodoro/         # Timer pomodoro
│   │   ├── mascot/           # Mascota virtual
│   │   ├── shop/             # Tienda
│   │   ├── stats/            # Estadísticas
│   │   ├── search/           # Buscador global
│   │   ├── audius/           # Música
│   │   ├── recipes/          # Recetas + traducción
│   │   └── common/           # Guards, decorators, translate
│   ├── prisma/
│   │   ├── schema.prisma     # 30+ modelos
│   │   ├── migrations/       # Historial
│   │   └── seed.ts           # Datos iniciales
│   └── Dockerfile
│
├── frontend/                 # SPA React
│   ├── src/
│   │   ├── pages/            # 16 pantallas
│   │   ├── components/       # Componentes reutilizables
│   │   ├── hooks/            # useFeedback, useInstallPrompt, useNotifications
│   │   ├── store/            # Zustand (auth, player, theme)
│   │   ├── lib/              # Cliente Axios
│   │   └── types/            # Tipos TS
│   ├── public/
│   │   ├── manifest.json     # PWA
│   │   ├── sw.js             # Service worker
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── scripts/
│   ├── start.sh
│   └── stop.sh
└── README.md
```

> La API se monta bajo el prefijo global `/api`, por eso Swagger está disponible en `/api/docs`.

---

## 🎮 Sistema de gamificación

### XP por acción

| Acción | XP |
|---|---|
| Tarea Fácil | +10 |
| Tarea Normal | +15 |
| Tarea Difícil | +20 |
| Tarea Jefe | +30 |
| Hábito completado | +5 |
| Pomodoro (25 min) | +15 |
| Meta completada | +200 |
| Recompensa diaria | +20 a +70 |
| Logro desbloqueado | +30 a +5000 |

### Rangos

| Rango | Niveles |
|---|---|
| 🍥 Genin | 1 – 5 |
| 🎖️ Chunin | 6 – 15 |
| 🏅 Jonin | 16 – 30 |
| 🥷 ANBU | 31 – 50 |
| 👑 Hokage | 51+ |

### Monedas

| Acción | Monedas |
|---|---|
| Completar tarea | +5 a +20 🪙 |
| Pomodoro | +3 🪙 |
| Recompensa diaria | +10 a +40 🪙 |
| Desbloquear logro | +5 a +1000 🪙 |
| Completar meta | +50 🪙 |

---

## 🔐 Seguridad

- ✅ Autenticación JWT con cookies `httpOnly`.
- ✅ Refresh tokens con rotación.
- ✅ Rate limiting: 60 req/min global por IP, 5/min en login.
- ✅ Contraseñas fuertes obligatorias (10+ caracteres, mayúscula, minúscula, número y símbolo).
- ✅ Lista negra de contraseñas comunes.
- ✅ Helmet con CSP, HSTS y `X-Frame-Options`.
- ✅ CORS multi-origen.
- ✅ `logout-all` para cerrar todas las sesiones.
- ✅ Auto-limpieza de sesiones caducadas.
- ✅ Sanitización de logs.
- ✅ Swagger oculto en producción.
- ✅ Soft delete en lugar de borrado duro.

---

## 🗺️ Roadmap

- [x] Auth JWT + cookies `httpOnly`.
- [x] Tareas con subtareas.
- [x] Hábitos + streaks.
- [x] 20 logros con rarezas.
- [x] Mascota virtual con stats.
- [x] Tienda con ítems.
- [x] Calendario con eventos.
- [x] Reproductor de música (Audius).
- [x] Recetas con traducción automática.
- [x] Recompensa diaria.
- [x] Misiones diarias.
- [x] PWA instalable.
- [x] Confetti + sonidos.
- [x] 4 temas dinámicos.
- [x] Buscador global (`Ctrl + K`).
- [x] Estadísticas con heatmap.
- [x] Notas con moods.
- [x] Ajustes de perfil.
- [x] Metas con milestones.
- [x] Pomodoro con notificaciones.
- [x] Notificaciones del navegador.
- [ ] Modo claro.
- [ ] Multi-idioma (ES/EN).
- [ ] Deploy permanente con dominio propio.

---

## 🤝 Contribuir

¿Ideas, bugs o mejoras? Abre un **issue** o envía un **PR**.

**Convenciones:**

- Commits con emoji: `🎌 init`, `✨ feature`, `🐛 fix`, `🎨 estilos`, `📝 docs`.
- Código en español para el dominio, inglés para variables técnicas.
- Formato: [Prettier](https://prettier.io/) (ver `.prettierrc`).

---

## 👤 Autor

**Manuel Casimiro Carrasco** ([@urukaisk-maker](https://github.com/urukaisk-maker))

- 🐙 [GitHub](https://github.com/urukaisk-maker)
- 🏠 [Calculadora de Hipotecas](https://github.com/urukaisk-maker)
- 💼 [Mi Currículum](https://github.com/urukaisk-maker)

---

## 📄 Licencia

MIT © Manuel Casimiro Carrasco

---

<div align="center">

Hecho con 💖 en Garuda Linux

**🎌 ¡Ganbatte! 🎌**

</div>
