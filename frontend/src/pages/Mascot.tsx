import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import type { Mascot as MascotType } from '../types';

const SPECIES_EMOJI: Record<string, string> = {
  kitsune: '🦊',
  neko: '🐱',
  dragon: '🐉',
  slime: '🟢',
  panda: '🐼',
};

export function Mascot() {
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refreshUser);
  const [mascot, setMascot] = useState<MascotType | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await api.get<MascotType>('/mascot');
    setMascot(data);
    setNewName(data.name);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const action = async (
    endpoint: string,
    successMsg: string,
  ) => {
    setBusy(true);
    try {
      const { data } = await api.post<MascotType>(`/mascot/${endpoint}`);
      setMascot(data);
      await refreshUser();
      showToast(successMsg);
    } catch (err: any) {
      showToast(
        '❌ ' + (err.response?.data?.message ?? 'Algo salió mal'),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === mascot?.name) {
      setEditingName(false);
      return;
    }
    const { data } = await api.patch<MascotType>('/mascot/name', {
      name: newName,
    });
    setMascot(data);
    setEditingName(false);
    showToast('✨ Nombre actualizado');
  };

  if (loading || !mascot) {
    return <div className="text-center py-12 text-slate-400">Cargando...</div>;
  }

  const emoji = SPECIES_EMOJI[mascot.species] ?? '🦊';
  const xpToNext = mascot.level * 100;
  const xpProgress = Math.min(100, (mascot.xp / xpToNext) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl">🦊 Mi mascota</h1>
        <p className="text-sm text-slate-400 mt-1">
          Cuida de tu compañero para que te dé suerte
        </p>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-sakura opacity-5" />

        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-8xl mb-4"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 77, 121, 0.6))',
            }}
          >
            {emoji}
          </motion.div>

          {/* Name */}
          {editingName ? (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={30}
                autoFocus
                className="input-anime text-center"
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
              <button onClick={handleRename} className="btn-primary">
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="font-display text-2xl mb-1 hover:text-sakura-300 transition-colors"
            >
              {mascot.name} ✏️
            </button>
          )}

          <p className="text-sm text-slate-400 mb-4">
            {mascot.species} · Nivel {mascot.level}
          </p>

          {/* XP bar */}
          <div className="w-full max-w-xs mb-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>XP mascota</span>
              <span>
                {mascot.xp} / {xpToNext}
              </span>
            </div>
            <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-sakura shadow-glow-pink"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="w-full max-w-md space-y-3">
            <StatBar
              icon="🍙"
              label="Hambre"
              value={mascot.hunger}
              color="orange"
            />
            <StatBar
              icon="😊"
              label="Felicidad"
              value={mascot.happiness}
              color="pink"
            />
            <StatBar
              icon="⚡"
              label="Energía"
              value={mascot.energy}
              color="cyan"
            />
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ActionButton
          icon="🍙"
          label="Alimentar"
          cost="5 💰"
          disabled={busy || (user?.coins ?? 0) < 5}
          onClick={() => action('feed', '🍙 ¡Ñam ñam! Uru-chan está feliz')}
        />
        <ActionButton
          icon="🎾"
          label="Jugar"
          disabled={busy || mascot.energy < 10}
          onClick={() => action('play', '🎾 ¡Qué divertido!')}
        />
        <ActionButton
          icon="😴"
          label="Descansar"
          disabled={busy}
          onClick={() => action('rest', '💤 Zzz...')}
        />
      </div>

      {/* Info */}
      <div className="glass-card p-4 text-sm text-slate-400">
        <p className="mb-2">
          💡 <strong className="text-slate-300">Tips:</strong>
        </p>
        <ul className="space-y-1 text-xs">
          <li>• Alimentar cuesta 5 monedas y sube +25 hambre, +10 felicidad</li>
          <li>• Jugar sube +15 felicidad, -10 energía</li>
          <li>• Descansar sube +25 energía pero -5 felicidad</li>
          <li>• La mascota gana XP con cada acción</li>
        </ul>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink-800 border border-sakura-500/50 px-6 py-3 rounded-2xl shadow-glow-pink z-50 max-w-md"
          >
            <p className="font-medium text-white text-sm">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBar({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: 'orange' | 'pink' | 'cyan';
}) {
  const colorMap = {
    orange: 'bg-orange-500',
    pink: 'bg-sakura-500',
    cyan: 'bg-neon-cyan',
  };
  const low = value < 30;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>
          {icon} {label}
        </span>
        <span className={low ? 'text-red-400' : ''}>{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-ink-700 overflow-hidden">
        <motion.div
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4 }}
          className={`h-full ${colorMap[color]} ${low ? 'animate-pulse' : ''}`}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  cost,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  cost?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glass-card-hover p-4 flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {cost && <span className="text-xs text-yellow-400">{cost}</span>}
    </button>
  );
}
