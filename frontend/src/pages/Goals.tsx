import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useFeedback } from '../hooks/useFeedback';

interface Milestone {
  id: string;
  title: string;
  isDone: boolean;
  order: number;
  completedAt: string | null;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  type: 'SHORT_TERM' | 'LONG_TERM' | 'LIFE';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  targetDate: string | null;
  progress: number;
  xpReward: number;
  coinReward: number;
  completedAt: string | null;
  milestones: Milestone[];
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  SHORT_TERM: '⚡ Corto plazo',
  LONG_TERM: '🎯 Largo plazo',
  LIFE: '🌟 Meta de vida',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '🔥 Activa',
  PAUSED: '⏸️ Pausada',
  COMPLETED: '✅ Completada',
  ABANDONED: '❌ Abandonada',
};

export function Goals() {
  const refreshUser = useAuth((s) => s.refreshUser);
  const { play, confetti } = useFeedback();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'SHORT_TERM' as const,
    targetDate: '',
  });

  const [milestoneInput, setMilestoneInput] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Goal[]>('/goals');
      setGoals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/goals', {
      title: form.title,
      description: form.description || undefined,
      type: form.type,
      targetDate: form.targetDate || undefined,
    });
    play('click');
    setForm({ title: '', description: '', type: 'SHORT_TERM', targetDate: '' });
    setShowForm(false);
    load();
    showToast('🎯 Meta creada');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar esta meta?')) return;
    await api.delete(`/goals/${id}`);
    load();
    showToast('🗑️ Meta borrada');
  };

  const handleAddMilestone = async (goalId: string) => {
    if (!milestoneInput.trim()) return;
    await api.post(`/goals/${goalId}/milestones`, {
      title: milestoneInput,
    });
    setMilestoneInput('');
    play('click');
    load();
  };

  const handleToggleMilestone = async (milestoneId: string, wasDone: boolean) => {
    try {
      await api.patch(`/goals/milestones/${milestoneId}/toggle`);
      play('taskComplete');
      if (!wasDone) confetti.sparkle();
      await refreshUser();
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('¿Borrar este hito?')) return;
    await api.delete(`/goals/milestones/${milestoneId}`);
    load();
  };

  const filtered = goals.filter((g) => {
    if (filter === 'active') return g.status === 'ACTIVE';
    if (filter === 'completed') return g.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">🎯 Mis metas</h1>
          <p className="text-sm text-slate-400 mt-1">
            {goals.filter((g) => g.status === 'ACTIVE').length} activas ·{' '}
            {goals.filter((g) => g.status === 'COMPLETED').length} completadas
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '✕ Cancelar' : '+ Nueva meta'}
        </button>
      </div>

      {/* Formulario */}
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
              placeholder="¿Cuál es tu meta?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-anime text-lg"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="input-anime resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as any })
                }
                className="input-anime"
              >
                <option value="SHORT_TERM">⚡ Corto plazo</option>
                <option value="LONG_TERM">🎯 Largo plazo</option>
                <option value="LIFE">🌟 Meta de vida</option>
              </select>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) =>
                  setForm({ ...form, targetDate: e.target.value })
                }
                className="input-anime"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Crear meta ✨
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'active', label: '🔥 Activas' },
          { value: 'completed', label: '✅ Completadas' },
          { value: 'all', label: '📚 Todas' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              filter === f.value
                ? 'bg-gradient-sakura text-white shadow-glow-pink'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de metas */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-3">🎯</p>
          <p className="text-slate-400">
            {filter === 'active'
              ? 'No tienes metas activas'
              : 'No hay metas para mostrar'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((goal) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`glass-card overflow-hidden ${
                  goal.status === 'COMPLETED' ? 'border-green-500/50' : ''
                }`}
              >
                {/* Cabecera de la meta */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === goal.id ? null : goal.id)
                  }
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg truncate">
                        {goal.title}
                      </h3>
                      <div className="flex gap-2 mt-1 text-xs flex-wrap">
                        <span className="text-slate-400">
                          {TYPE_LABELS[goal.type]}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span
                          className={
                            goal.status === 'COMPLETED'
                              ? 'text-green-400'
                              : 'text-slate-400'
                          }
                        >
                          {STATUS_LABELS[goal.status]}
                        </span>
                        {goal.targetDate && (
                          <>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">
                              📅{' '}
                              {new Date(goal.targetDate).toLocaleDateString(
                                'es-ES',
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(goal.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-lg transition-all"
                      title="Borrar"
                    >
                      🗑️
                    </button>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Barra de progreso */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-ink-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        className={`h-full transition-all ${
                          goal.progress === 100
                            ? 'bg-green-500'
                            : 'bg-gradient-sakura shadow-glow-pink'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-300 w-12 text-right">
                      {goal.progress}%
                    </span>
                    <span className="text-xs text-sakura-400">
                      +{goal.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* Hitos (expandible) */}
                <AnimatePresence>
                  {expandedId === goal.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 overflow-hidden"
                    >
                      <div className="p-5 space-y-2">
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                          Hitos ({goal.milestones.length})
                        </h4>

                        {goal.milestones.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            Sin hitos todavía. Añade uno para empezar.
                          </p>
                        ) : (
                          goal.milestones.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-3 group/milestone"
                            >
                              <button
                                onClick={() =>
                                  handleToggleMilestone(m.id, m.isDone)
                                }
                                className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                                  m.isDone
                                    ? 'bg-sakura-500 border-sakura-500 text-white'
                                    : 'border-slate-500 hover:border-sakura-400'
                                }`}
                              >
                                {m.isDone && '✓'}
                              </button>
                              <span
                                className={`flex-1 text-sm ${
                                  m.isDone
                                    ? 'line-through text-slate-500'
                                    : ''
                                }`}
                              >
                                {m.title}
                              </span>
                              <button
                                onClick={() => handleDeleteMilestone(m.id)}
                                className="opacity-0 group-hover/milestone:opacity-100 text-slate-500 hover:text-red-400 text-sm transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}

                        {/* Añadir hito */}
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            placeholder="Nuevo hito..."
                            value={milestoneInput}
                            onChange={(e) => setMilestoneInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddMilestone(goal.id);
                              }
                            }}
                            className="input-anime flex-1 text-sm py-2"
                          />
                          <button
                            onClick={() => handleAddMilestone(goal.id)}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
