import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/auth';
import { Footer } from './Footer';
import { MusicPlayer } from './MusicPlayer';
import { SoundToggle } from './SoundToggle';
import { ThemeSelector } from './ThemeSelector';
import { SearchButton } from './SearchButton';

const RANK_LABELS: Record<string, string> = {
  GENIN: 'Genin',
  CHUNIN: 'Chunin',
  JONIN: 'Jonin',
  ANBU: 'ANBU',
  HOKAGE: 'Hokage',
};

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: '🏠', end: true },
  { to: '/tasks', label: 'Tareas', icon: '✅' },
  { to: '/calendar', label: 'Calendario', icon: '📅' },
  { to: '/notes', label: 'Notas', icon: '📝' },
  { to: '/habits', label: 'Hábitos', icon: '🔥' },
  { to: '/achievements', label: 'Logros', icon: '🏆' },
  { to: '/music', label: 'Música', icon: '🎵' },
  { to: '/recipes', label: 'Recetas', icon: '🍳' },
  { to: '/mascot', label: 'Mascota', icon: '🦊' },
  { to: '/shop', label: 'Tienda', icon: '🛒' },
  { to: '/guide', label: 'Guía', icon: '📖' },
  { to: '/stats', label: 'Estadísticas', icon: '📊' },
  { to: '/settings', label: 'Ajustes', icon: '⚙️' }
];

export function Layout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  if (!user) return null;

  return (
    <div className="min-h-screen flex relative z-10">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-card m-4 mr-0 p-4 sticky top-4 h-[calc(100vh-2rem)]">
        {/* Logo */}
        <div className="mb-6 text-center relative">
          {/* Halo brillante */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-gradient-sakura opacity-20 blur-2xl animate-pulse-glow" />
          </div>

          <div className="relative">
            <div className="text-4xl mb-2 animate-float filter drop-shadow-[0_0_15px_rgba(255,77,121,0.6)]">
              ⛩️
            </div>
            <h1 className="font-display text-2xl leading-tight text-gradient-sakura tracking-wide">
              Urukais
            </h1>
            <h2 className="font-display text-xs text-slate-400 tracking-[0.4em] mt-1">
              KLICK
            </h2>

            {/* Línea decorativa */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-sakura-500/50" />
              <div className="w-1 h-1 rounded-full bg-sakura-500/70" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-sakura-500/50" />
            </div>
          </div>
        </div>

        {/* 🔍 Buscar */}
        <SearchButton />

        {/* User mini */}
        <div className="glass-card p-3 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-sakura flex items-center justify-center text-lg shadow-glow-pink shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              '👤'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {user.displayName ?? user.username}
            </p>
            <p className="text-xs text-slate-400">
              {RANK_LABELS[user.rank]} · Nv.{user.level}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-sakura text-white shadow-glow-pink'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>💰 {user.coins}</span>
            <span>⚡ {user.xp} XP</span>
          </div>
          <div className="flex gap-2">
            <ThemeSelector />
            <SoundToggle />
            <button
              onClick={logout}
              className="flex-1 btn-ghost text-sm flex items-center justify-center gap-2"
            >
              Salir 🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-card m-2 rounded-2xl p-2 flex justify-around overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors shrink-0 ${
                isActive ? 'text-sakura-400' : 'text-slate-400'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
        <Footer />
      </main>

      <MusicPlayer />
    </div>
  );
}
