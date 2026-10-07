import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import type { Habit } from '../types';

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const HABIT_ICONS = ['💧', '🔥', '📚', '🏃', '🧘', '🎨', '🎵', '🍎', '😴', '🚭'];

export function Habits() {
  const refreshUser = useAuth((s) => s.refreshUser);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    icon: '🔥',
    color: '#FFB7C5',
  });

  const load = async () => {
    setLoading(true);
    const { data } = await api.get<Habit[]>('/habits');
    setHabits(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/habits', form);
    setForm({ name: '', icon: '🔥', color: '#FFB7C5' });
    setShowForm(false);
    load();
  };

  const handleCheck = async (id: string, wasDone: boolean) => {
    try {
      if (wasDone) {
        await api.post(`/habits/${id}/uncheck`);
      } else {
        const { data } = await api.post(`/habits/${id}/check`);
        setToast(`🔥 ¡Streak: ${data.streak} días! +5 XP`);
        setTimeout(() => setToast(null), 2500);
      }
      await refreshUser();
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar este hábito?')) return;
    await api.delete(`/habits/${id}`);
    load();
  };

  const completedToday = habits.filter((h) => h.todayDone).length;
  const total = habits.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">🔥 Mis hábitos</h1>
          <p className="text-sm text-slate-400 mt-1">
            {completedToday} de {total} completados hoy
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '✕ Cancelar' : '+ Nuevo hábito'}
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progreso de hoy</span>
            <span className="text-sakura-400">
              {Math.round((completedToday / total) * 100)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-ink-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedToday / total) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-sakura shadow-glow-pink"
            />
          </div>
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="glass-card p-6 mb-6 space-y-4 overflow-hidden"
          >
            <input
              type="text"
              required
              placeholder="¿Qué hábito quieres crear?"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-anime text-lg"
            />

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Elige un icono
              </label>
              <div className="flex gap-2 flex-wrap">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                      form.icon === icon
                        ? 'bg-gradient-sakura shadow-glow-pink scale-110'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Crear hábito ✨
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : habits.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-3">🌱</p>
          <p className="text-slate-400">
            No tienes hábitos todavía. ¡Crea uno!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {habits.map((habit) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`glass-card p-4 relative group transition-all ${
                  habit.todayDone
                    ? 'border-sakura-500/50 shadow-glow-pink'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      backgroundColor: `${habit.color}20`,
                    }}
                  >
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{habit.name}</h3>
                    <div className="flex gap-2 text-xs text-slate-400 mt-0.5">
                      <span>
                        🔥 {habit.streak} {habit.streak === 1 ? 'día' : 'días'}
                      </span>
                      <span>+{habit.xpReward} XP</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCheck(habit.id, habit.todayDone)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 transition-all ${
                      habit.todayDone
                        ? 'bg-gradient-sakura text-white shadow-glow-pink'
                        : 'bg-white/5 hover:bg-white/10 border border-white/20'
                    }`}
                    title={habit.todayDone ? 'Desmarcar hoy' : 'Marcar hoy'}
                  >
                    {habit.todayDone ? '✓' : ''}
                  </button>
                </div>

                {/* Week dots */}
                <div className="flex justify-between gap-1">
                  {DAYS.map((d, i) => (
                    <div
                      key={i}
                      className={`flex-1 text-center text-xs py-1 rounded-md ${
                        habit.todayDone && i === new Date().getDay()
                          ? 'bg-sakura-500/30 text-sakura-300'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleDelete(habit.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-lg transition-all"
                  title="Borrar"
                >
                  🗑️
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

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
  );
}
