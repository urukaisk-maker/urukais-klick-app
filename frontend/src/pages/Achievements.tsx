import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Achievement, AchievementStats, Rarity } from '../types';

const RARITY_STYLES: Record<
  Rarity,
  { gradient: string; glow: string; label: string }
> = {
  COMMON: {
    gradient: 'from-slate-500 to-slate-700',
    glow: '',
    label: 'Común',
  },
  RARE: {
    gradient: 'from-blue-500 to-blue-700',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    label: 'Raro',
  },
  EPIC: {
    gradient: 'from-purple-500 to-purple-700',
    glow: 'shadow-glow-purple',
    label: 'Épico',
  },
  LEGENDARY: {
    gradient: 'from-orange-400 via-yellow-400 to-orange-500',
    glow: 'shadow-[0_0_25px_rgba(251,191,36,0.6)]',
    label: 'Legendario',
  },
  MYTHIC: {
    gradient: 'from-pink-500 via-red-500 to-purple-600',
    glow: 'shadow-[0_0_30px_rgba(244,114,182,0.7)]',
    label: 'Mítico',
  },
};

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'LOCKED' | 'UNLOCKED'>('ALL');

  useEffect(() => {
    Promise.all([
      api.get<Achievement[]>('/achievements'),
      api.get<AchievementStats>('/achievements/stats'),
    ])
      .then(([a, s]) => {
        setAchievements(a.data);
        setStats(s.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = achievements.filter((a) => {
    if (filter === 'LOCKED') return !a.isUnlocked;
    if (filter === 'UNLOCKED') return a.isUnlocked;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl">🏆 Mis logros</h1>
        {stats && (
          <p className="text-sm text-slate-400 mt-1">
            {stats.unlocked} de {stats.total} desbloqueados ({stats.progress}%)
          </p>
        )}
      </div>

      {/* Progress */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="h-3 rounded-full bg-ink-700 overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-sakura shadow-glow-pink"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.byRarity.map((r) => {
              const style = RARITY_STYLES[r.rarity];
              return (
                <div
                  key={r.rarity}
                  className={`p-3 rounded-xl bg-gradient-to-br ${style.gradient} bg-opacity-20 border border-white/10`}
                >
                  <p className="text-xs text-white/80">{style.label}</p>
                  <p className="font-display text-lg">
                    {r.unlocked}/{r.total}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              filter === f
                ? 'bg-gradient-sakura text-white shadow-glow-pink'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {f === 'ALL'
              ? 'Todos'
              : f === 'UNLOCKED'
                ? '✨ Desbloqueados'
                : '🔒 Bloqueados'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ach, i) => {
            const style = RARITY_STYLES[ach.rarity];
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`glass-card p-4 relative overflow-hidden transition-all ${
                  ach.isUnlocked ? style.glow : 'opacity-60 grayscale'
                }`}
              >
                {/* Rarity band */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient}`}
                />

                <div className="flex justify-between items-start mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${style.gradient}`}
                  >
                    {ach.isUnlocked ? ach.icon : '🔒'}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${style.gradient} text-white font-medium`}
                  >
                    {style.label}
                  </span>
                </div>

                <h3 className="font-medium text-sm mb-1">{ach.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {ach.description}
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="text-sakura-400">+{ach.xpReward} XP</span>
                  {ach.coinReward > 0 && (
                    <span className="text-yellow-400">
                      +{ach.coinReward} 💰
                    </span>
                  )}
                </div>

                {!ach.isUnlocked && ach.progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-ink-700 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${style.gradient}`}
                        style={{
                          width: `${Math.min(100, ach.progress)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {ach.isUnlocked && (
                  <p className="text-[10px] text-slate-500 mt-2">
                    ✓ Desbloqueado
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
