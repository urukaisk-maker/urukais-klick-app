import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useFeedback } from '../hooks/useFeedback';
import { showNotification } from '../hooks/useNotifications';

type Phase = 'focus' | 'break' | 'long-break';

interface Task {
  id: string;
  title: string;
  status: string;
}

const PRESETS = [
  { label: '🍅 Clásico', focus: 25, break: 5, longBreak: 15 },
  { label: '⚡ Rápido', focus: 15, break: 3, longBreak: 10 },
  { label: '🌊 Profundo', focus: 50, break: 10, longBreak: 20 },
];

export function Pomodoro() {
  const refreshUser = useAuth((s) => s.refreshUser);
  const { play, confetti } = useFeedback();

  const [phase, setPhase] = useState<Phase>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [preset, setPreset] = useState(0);
  const [taskId, setTaskId] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    null,
  );
  const [sessionCount, setSessionCount] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    today: number;
    totalMinutes: number;
    totalXp: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = PRESETS[preset];

  useEffect(() => {
    api.get<Task[]>('/tasks').then((r) => {
      setTasks(r.data.filter((t) => t.status !== 'COMPLETED'));
    });
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/pomodoro/history');
      setStats(data.stats);
    } catch {
      /* ignora */
    }
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          setTimeout(() => handlePhaseComplete(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handlePhaseComplete = async () => {
    if (phase === 'focus') {
      // 🍅 Completar la sesión de enfoque
      if (currentSessionId) {
        try {
          const { data } = await api.post(
            `/pomodoro/${currentSessionId}/complete`,
          );
          play('levelUp');
          confetti.rain();
          showToast(`🎉 +${data.xpEarned} XP · +${data.coinsEarned} 🪙`);
          await refreshUser();
          await loadStats();
        } catch (err: any) {
          showToast('❌ ' + (err.response?.data?.message ?? 'Error'));
        }
      }
      setCurrentSessionId(null);

      // Decidir tipo de descanso
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      const isLong = newCount % 4 === 0;
      const nextPhase: Phase = isLong ? 'long-break' : 'break';
      const nextSeconds = (isLong ? config.longBreak : config.break) * 60;

      setPhase(nextPhase);
      setSecondsLeft(nextSeconds);
      play('dailyReward');

      // 🔔 Notificación
      showNotification({
        title: isLong ? '🛋️ Descanso largo' : '☕ ¡Descanso!',
        body: isLong
          ? `Has completado 4 pomodoros. Tómate ${config.longBreak} min.`
          : `Tómate ${config.break} min de descanso.`,
        tag: 'pomodoro-break',
      });
    } else {
      // ☕ Terminar descanso → volver a enfoque
      play('click');
      setPhase('focus');
      setSecondsLeft(config.focus * 60);

      // 🔔 Notificación
      showNotification({
        title: '🍅 ¡A enfocarse!',
        body: `Empieza otro pomodoro de ${config.focus} min.`,
        tag: 'pomodoro-focus',
      });
    }
  };

  const startTimer = async () => {
    if (isRunning) return;

    if (phase !== 'focus') {
      setIsRunning(true);
      play('click');
      return;
    }

    try {
      const { data } = await api.post('/pomodoro/start', {
        taskId: taskId || undefined,
        durationMin: config.focus,
      });
      setCurrentSessionId(data.id);
      setIsRunning(true);
      play('click');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message ?? 'Error'));
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    play('click');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('focus');
    setSecondsLeft(config.focus * 60);
    setSessionCount(0);
    setCurrentSessionId(null);
    play('click');
  };

  const skipPhase = () => {
    setIsRunning(false);
    setTimeout(() => handlePhaseComplete(), 0);
  };

  const changePreset = (i: number) => {
    setPreset(i);
    setIsRunning(false);
    setPhase('focus');
    setSecondsLeft(PRESETS[i].focus * 60);
    setSessionCount(0);
    setCurrentSessionId(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const phaseInfo = {
    focus: { label: '🎯 Enfoque', color: '#FF4D79', emoji: '🍅' },
    break: { label: '☕ Descanso corto', color: '#34D399', emoji: '☕' },
    'long-break': { label: '🛋️ Descanso largo', color: '#22D3EE', emoji: '🛋️' },
  }[phase];

  const totalSeconds =
    (phase === 'focus'
      ? config.focus
      : phase === 'break'
        ? config.break
        : config.longBreak) * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl">🍅 Pomodoro</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enfócate {config.focus} minutos, descansa {config.break}, repite
        </p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => changePreset(i)}
            disabled={isRunning}
            className={`px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 ${
              preset === i
                ? 'bg-gradient-sakura text-white shadow-glow-pink'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {p.label} · {p.focus}min
          </button>
        ))}
      </div>

      {/* Timer circular */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 mb-6 flex flex-col items-center relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 blur-3xl transition-colors duration-1000 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${phaseInfo.color}, transparent 70%)`,
          }}
        />

        <div className="relative">
          <svg width="300" height="300" className="transform -rotate-90">
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={phaseInfo.color}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                filter: `drop-shadow(0 0 10px ${phaseInfo.color})`,
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-6xl mb-2">{phaseInfo.emoji}</div>
            <div className="font-display text-6xl tabular-nums text-white">
              {String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-slate-400 mt-2">{phaseInfo.label}</div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="btn-primary px-8 py-3 text-lg"
            >
              ▶️ Iniciar
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-3 text-lg rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 hover:bg-orange-500/30 transition-all"
            >
              ⏸️ Pausar
            </button>
          )}
          <button
            onClick={skipPhase}
            className="btn-ghost px-6"
            title="Siguiente fase"
          >
            ⏭️
          </button>
          <button onClick={resetTimer} className="btn-ghost px-6" title="Reset">
            🔄
          </button>
        </div>

        {sessionCount > 0 && (
          <p className="text-xs text-slate-500 mt-4">
            Sesiones de hoy: {sessionCount}{' '}
            {sessionCount % 4 === 0 && '· 🎉 ¡Descanso largo!'}
          </p>
        )}
      </motion.div>

      {/* Selector de tarea */}
      <div className="glass-card p-5 mb-6">
        <label className="block text-sm text-slate-400 mb-2">
          ¿En qué vas a trabajar? (opcional)
        </label>
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          disabled={isRunning}
          className="input-anime"
        >
          <option value="">Sin tarea específica</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="🍅" label="Hoy" value={stats.today} />
          <StatCard icon="📊" label="Esta semana" value={stats.total} />
          <StatCard icon="⏱️" label="Minutos" value={stats.totalMinutes} />
          <StatCard icon="⚡" label="XP ganada" value={stats.totalXp} />
        </div>
      )}

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
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-2xl font-display">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
