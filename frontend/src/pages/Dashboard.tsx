import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import type { Category } from '../types';

const RANK_LABELS: Record<string, string> = {
  GENIN: 'Genin',
  CHUNIN: 'Chunin',
  JONIN: 'Jonin',
  ANBU: 'ANBU',
  HOKAGE: 'Hokage',
};

interface DailyStatus {
  claimed: boolean;
  claimedAt: string | null;
  streak: number;
  nextReward: { xp: number; coins: number };
}

export function Dashboard() {
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refreshUser);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<DailyStatus | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadDaily = async () => {
    try {
      const { data } = await api.get<DailyStatus>('/users/daily-reward');
      setDaily(data);
    } catch {
      /* ignora */
    }
  };

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/categories').then((r) => setCategories(r.data)),
      loadDaily(),
    ]).finally(() => setLoading(false));
  }, []);

  const claimDaily = async () => {
    try {
      const { data } = await api.post('/users/daily-reward/claim');
      setToast(
        `🎁 +${data.coinsGained} 💰 · +${data.xpGained} XP · Racha: ${data.streak} días`,
      );
      await refreshUser();
      await loadDaily();
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setToast('❌ ' + (err.response?.data?.message ?? 'Error'));
      setTimeout(() => setToast(null), 2500);
    }
  };

  if (!user) return null;

  const xpForNextLevel = user.level * 100 + 10 * user.level * user.level;
  const xpProgress = Math.min(
    100,
    Math.round((user.xp / xpForNextLevel) * 100),
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-sakura flex items-center justify-center text-3xl shadow-glow-pink">
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
            <div>
              <h1 className="font-display text-2xl">
                ¡Hola, {user.displayName ?? user.username}!
              </h1>
              <p className="text-sm text-slate-400">
                {RANK_LABELS[user.rank]} · Nivel {user.level}
              </p>
            </div>
          </div>

          <button
            onClick={() => useAuth.getState().logout()}
            className="btn-ghost text-sm"
          >
            Salir 🚪
          </button>
        </motion.header>

        {/* 🎁 Daily Reward */}
        {daily && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
              daily.claimed
                ? 'bg-white/5 border-white/10'
                : 'bg-gradient-sakura shadow-glow-pink border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{daily.claimed ? '✅' : '🎁'}</div>
              <div>
                <h3 className="font-display text-lg">
                  {daily.claimed
                    ? 'Recompensa reclamada hoy'
                    : '¡Recompensa diaria disponible!'}
                </h3>
                <p className="text-sm opacity-80">
                  {daily.claimed
                    ? `Vuelve mañana · Racha actual: ${daily.streak} días 🔥`
                    : `+${daily.nextReward.xp} XP · +${daily.nextReward.coins} 💰 · Racha: ${daily.streak} 🔥`}
                </p>
              </div>
            </div>
            {!daily.claimed && (
              <button
                onClick={claimDaily}
                className="px-6 py-2 rounded-xl bg-white text-sakura-600 font-medium hover:scale-105 transition-transform shadow-lg"
              >
                Reclamar 🎁
              </button>
            )}
          </motion.div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="⚡"
            label="XP Total"
            value={user.xp}
            color="neon-purple"
          />
          <StatCard
            icon="💰"
            label="Monedas"
            value={user.coins}
            color="neon-yellow"
          />
          <StatCard
            icon="🔥"
            label="Racha"
            value={`${user.currentStreak} días`}
            color="sakura"
          />
          <StatCard
            icon="✅"
            label="Tareas"
            value={user._count?.tasks ?? 0}
            color="neon-cyan"
          />
        </div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-display text-lg">
              Nivel {user.level} → {user.level + 1}
            </span>
            <span className="text-sm text-slate-400">
              {user.xp} / {xpForNextLevel} XP
            </span>
          </div>
          <div className="h-3 rounded-full bg-ink-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-sakura shadow-glow-pink"
            />
          </div>
        </motion.div>

        {/* Mascot & Achievements */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 md:col-span-1"
          >
            <h3 className="font-display text-lg mb-4">🦊 {user.mascotName}</h3>
            {user.mascot ? (
              <div className="space-y-3 text-sm">
                <MascotBar
                  label="Hambre"
                  value={user.mascot.hunger}
                  emoji="🍙"
                />
                <MascotBar
                  label="Felicidad"
                  value={user.mascot.happiness}
                  emoji="😊"
                />
                <MascotBar
                  label="Energía"
                  value={user.mascot.energy}
                  emoji="⚡"
                />
                <p className="text-center text-3xl mt-4 animate-float">🦊</p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Cargando mascota...</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 md:col-span-2"
          >
            <h3 className="font-display text-lg mb-4">🏆 Logros</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-display text-gradient-sakura">
                  {user._count?.achievements ?? 0}
                </p>
                <p className="text-xs text-slate-400 mt-1">Desbloqueados</p>
              </div>
              <div>
                <p className="text-3xl font-display text-gradient-neon">20</p>
                <p className="text-xs text-slate-400 mt-1">Totales</p>
              </div>
              <div>
                <p className="text-3xl font-display text-sakura-400">
                  {Math.round(((user._count?.achievements ?? 0) / 20) * 100)}%
                </p>
                <p className="text-xs text-slate-400 mt-1">Progreso</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">📂 Mis categorías</h2>
            <span className="text-xs text-slate-400">
              Clic en una para ver sus tareas
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Cargando categorías...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className="glass-card-hover p-4 cursor-pointer group block relative overflow-hidden"
                  >
                    {/* Glow al hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                      style={{
                        background: `radial-gradient(circle at top right, ${cat.color}, transparent 70%)`,
                      }}
                    />

                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                        }}
                      >
                        {cat.icon}
                      </div>
                      <h3 className="font-medium text-sm mb-1 flex items-center justify-between gap-1">
                        <span className="truncate">{cat.name}</span>
                        <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0">
                          →
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {cat._count?.tasks ?? 0}{' '}
                        {cat._count?.tasks === 1 ? 'tarea' : 'tareas'}
                      </p>
                      {cat.subcategories.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {cat.subcategories.length} subcategorías
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-sakura px-6 py-3 rounded-2xl shadow-glow-pink z-50"
            >
              <p className="font-medium text-white text-sm">{toast}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    'neon-purple': 'shadow-glow-purple',
    'neon-cyan': 'shadow-glow-cyan',
    'neon-yellow': '',
    sakura: 'shadow-glow-pink',
  };
  return (
    <div
      className={`glass-card p-4 transition-all hover:scale-[1.02] ${
        colorMap[color] ?? ''
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-2xl font-display">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function MascotBar({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number;
  emoji: string;
}) {
  const color =
    value > 60 ? 'bg-green-500' : value > 30 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>
          {emoji} {label}
        </span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
