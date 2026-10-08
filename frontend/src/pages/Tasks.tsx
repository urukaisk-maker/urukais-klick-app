import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useFeedback } from '../hooks/useFeedback';
import type {
  Category,
  Task,
  TaskStatus,
  Priority,
  Difficulty,
} from '../types';

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'text-slate-400 border-slate-500/40',
  MEDIUM: 'text-blue-400 border-blue-500/40',
  HIGH: 'text-orange-400 border-orange-500/40',
  URGENT: 'text-red-400 border-red-500/40',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: '⚪ Fácil',
  NORMAL: '🔵 Normal',
  HARD: '🟠 Difícil',
  BOSS: '🔴 Jefe',
};

const STATUS_FILTERS: { value: TaskStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'COMPLETED', label: 'Completadas' },
];

export function Tasks() {
  const refreshUser = useAuth((s) => s.refreshUser);
  const { play, confetti } = useFeedback();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    text: string;
    kind: 'xp' | 'levelup';
  } | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    difficulty: 'NORMAL' as Difficulty,
    categoryId: '',
  });

  const load = async () => {
    setLoading(true);
    const [t, c] = await Promise.all([
      api.get<Task[]>('/tasks'),
      api.get<Category[]>('/categories'),
    ]);
    setTasks(t.data);
    setCategories(c.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/tasks', {
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      difficulty: form.difficulty,
      categoryId: form.categoryId || undefined,
    });
    play('click');
    setForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      difficulty: 'NORMAL',
      categoryId: '',
    });
    setShowForm(false);
    load();
  };

  const handleComplete = async (id: string) => {
    setCompleting(id);
    try {
      const { data } = await api.patch(`/tasks/${id}/complete`);

      if (data.levelUp) {
        play('levelUp');
        confetti.rain();
        setToast({
          text: `🎉 ¡SUBISTE DE NIVEL! +${data.xpEarned} XP · +${data.coinsEarned} monedas`,
          kind: 'levelup',
        });
      } else {
        play('taskComplete');
        confetti.burst();
        setToast({
          text: `+${data.xpEarned} XP · +${data.coinsEarned} monedas`,
          kind: 'xp',
        });
      }

      await refreshUser();
      await load();
      setTimeout(() => setToast(null), 3000);
    } finally {
      setCompleting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar esta tarea?')) return;
    await api.delete(`/tasks/${id}`);
    play('error');
    load();
  };

  const filtered =
    filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">📋 Mis tareas</h1>
          <p className="text-sm text-slate-400 mt-1">
            {tasks.filter((t) => t.status !== 'COMPLETED').length} pendientes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '✕ Cancelar' : '+ Nueva tarea'}
        </button>
      </div>

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
              placeholder="¿Qué quieres hacer?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-anime text-lg"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input-anime resize-none"
              rows={2}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value as Priority,
                  })
                }
                className="input-anime"
              >
                <option value="LOW">🟢 Baja</option>
                <option value="MEDIUM">🔵 Media</option>
                <option value="HIGH">🟠 Alta</option>
                <option value="URGENT">🔴 Urgente</option>
              </select>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm({
                    ...form,
                    difficulty: e.target.value as Difficulty,
                  })
                }
                className="input-anime"
              >
                <option value="EASY">⚪ Fácil (1x XP)</option>
                <option value="NORMAL">🔵 Normal (1.5x)</option>
                <option value="HARD">🟠 Difícil (2x)</option>
                <option value="BOSS">🔴 Jefe (3x)</option>
              </select>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="input-anime col-span-2"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">
              Crear tarea ✨
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
              filter === f.value
                ? 'bg-gradient-sakura text-white shadow-glow-pink'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-3">🎌</p>
          <p className="text-slate-400">
            {filter === 'ALL'
              ? 'No tienes tareas todavía'
              : 'No hay tareas en este estado'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass-card p-4 flex items-center gap-4 group transition-all ${
                  task.status === 'COMPLETED' ? 'opacity-50' : ''
                }`}
              >
                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={
                    completing === task.id || task.status === 'COMPLETED'
                  }
                  className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    task.status === 'COMPLETED'
                      ? 'bg-sakura-500 border-sakura-500 text-white'
                      : 'border-slate-500 hover:border-sakura-400 hover:bg-sakura-500/20'
                  }`}
                >
                  {task.status === 'COMPLETED' && '✓'}
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-slate-500'
                        : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-slate-400 truncate">
                      {task.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1 text-xs flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full border ${
                        PRIORITY_COLORS[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-slate-500">
                      {DIFFICULTY_LABELS[task.difficulty]}
                    </span>
                    {task.category && (
                      <span className="text-slate-400">
                        {task.category.icon} {task.category.name}
                      </span>
                    )}
                    <span className="text-sakura-400">
                      +{task.xpReward} XP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all text-xl"
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
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl z-50 ${
              toast.kind === 'levelup'
                ? 'bg-gradient-sakura shadow-glow-pink'
                : 'bg-ink-800 border border-sakura-500/50 shadow-glow-pink'
            }`}
          >
            <p className="font-medium text-white text-sm">
              {toast.kind === 'levelup' ? '🎉 ' : '✨ '}
              {toast.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}