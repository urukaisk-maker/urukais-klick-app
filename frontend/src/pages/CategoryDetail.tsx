import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import type { Category, Task, Priority, Difficulty } from '../types';

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'text-slate-400 border-slate-500/40',
  MEDIUM: 'text-blue-400 border-blue-500/40',
  HIGH: 'text-orange-400 border-orange-500/40',
  URGENT: 'text-red-400 border-red-500/40',
};

export function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const refreshUser = useAuth((s) => s.refreshUser);

  const [category, setCategory] = useState<Category | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    difficulty: 'NORMAL' as Difficulty,
  });
  const [subForm, setSubForm] = useState({ name: '', icon: '✨' });
  const [editForm, setEditForm] = useState({ name: '', icon: '', color: '' });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      // 1. Buscar la categoría por slug en la lista
      const { data: cats } = await api.get<Category[]>('/categories');
      const cat = cats.find((c) => c.slug === slug);
      if (!cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCategory(cat);
      setEditForm({
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      });

      // 2. Cargar sus tareas
      const { data: ts } = await api.get<Task[]>('/tasks', {
        params: { categoryId: cat.id },
      });
      setTasks(ts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const filteredTasks = useMemo(() => {
    if (!subFilter) return tasks;
    return tasks.filter((t) => t.subcategoryId === subFilter);
  }, [tasks, subFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pending = total - completed;
    const xpEarned = tasks
      .filter((t) => t.status === 'COMPLETED')
      .reduce((s, t) => s + t.xpReward, 0);
    return { total, completed, pending, xpEarned };
  }, [tasks]);

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return;

    await api.post('/tasks', {
      title: taskForm.title,
      description: taskForm.description || undefined,
      categoryId: category.id,
      subcategoryId: subFilter ?? undefined,
      priority: taskForm.priority,
      difficulty: taskForm.difficulty,
    });

    setTaskForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      difficulty: 'NORMAL',
    });
    setShowTaskForm(false);
    await load();
    showToast('✅ Tarea creada');
  };

  const handleComplete = async (id: string) => {
    setCompleting(id);
    try {
      const { data } = await api.patch(`/tasks/${id}/complete`);
      showToast(
        `✨ +${data.xpEarned} XP · +${data.coinsEarned} 🪙${
          data.levelUp ? ' · ¡SUBISTE DE NIVEL!' : ''
        }`,
      );
      await refreshUser();
      await load();
    } finally {
      setCompleting(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('¿Borrar esta tarea?')) return;
    await api.delete(`/tasks/${id}`);
    await load();
    showToast('🗑️ Tarea borrada');
  };

  const handleCreateSub = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return;
    await api.post(`/categories/${category.id}/subcategories`, subForm);
    setSubForm({ name: '', icon: '✨' });
    setShowSubForm(false);
    await load();
    showToast('✨ Subcategoría creada');
  };

  const handleDeleteSub = async (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('¿Borrar esta subcategoría? Las tareas no se borrarán.')) return;
    await api.delete(`/categories/subcategories/${subId}`);
    await load();
    showToast('🗑️ Subcategoría borrada');
  };

  const handleUpdateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return;
    await api.patch(`/categories/${category.id}`, editForm);
    setShowEdit(false);
    await load();
    showToast('✨ Categoría actualizada');
  };

  // Estados
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-4xl animate-pulse">🌸</div>
      </div>
    );
  }

  if (notFound || !category) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="font-display text-2xl mb-2">Categoría no encontrada</h1>
        <p className="text-slate-400 mb-6">
          La categoría "{slug}" no existe
        </p>
        <Link to="/" className="btn-primary">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/')}
        className="text-sm text-slate-400 hover:text-sakura-300 transition-colors mb-4 flex items-center gap-1"
      >
        ← Volver al inicio
      </button>

      {/* Header de la categoría */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6 relative overflow-hidden"
      >
        {/* Fondo con el color de la categoría */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at top right, ${category.color}, transparent 60%)`,
          }}
        />

        <div className="relative flex flex-wrap items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
            }}
          >
            {category.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl truncate">{category.name}</h1>
            <p className="text-sm text-slate-400">
              {category.subcategories.length} subcategorías · {stats.total}{' '}
              tareas
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="btn-ghost text-xs"
              title="Editar categoría"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="btn-primary text-sm"
            >
              {showTaskForm ? '✕ Cancelar' : '+ Nueva tarea'}
            </button>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-display text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-display text-green-400">
              {stats.completed}
            </p>
            <p className="text-xs text-slate-400">Completadas</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-display text-yellow-400">
              {stats.pending}
            </p>
            <p className="text-xs text-slate-400">Pendientes</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-display text-sakura-400">
              {stats.xpEarned}
            </p>
            <p className="text-xs text-slate-400">XP ganada</p>
          </div>
        </div>

        {/* Edit form */}
        <AnimatePresence>
          {showEdit && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleUpdateCategory}
              className="relative mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden"
            >
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Nombre"
                className="input-anime text-sm"
                required
              />
              <input
                type="text"
                value={editForm.icon}
                onChange={(e) =>
                  setEditForm({ ...editForm, icon: e.target.value })
                }
                placeholder="Emoji"
                maxLength={4}
                className="input-anime text-sm text-center text-2xl"
              />
              <div className="flex gap-2">
                <input
                  type="color"
                  value={editForm.color}
                  onChange={(e) =>
                    setEditForm({ ...editForm, color: e.target.value })
                  }
                  className="w-12 h-full rounded-xl cursor-pointer bg-transparent"
                />
                <button type="submit" className="btn-primary flex-1 text-sm">
                  Guardar
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Subcategorías */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg">🗂️ Subcategorías</h2>
          <button
            onClick={() => setShowSubForm(!showSubForm)}
            className="btn-ghost text-xs"
          >
            {showSubForm ? '✕' : '+ Añadir'}
          </button>
        </div>

        <AnimatePresence>
          {showSubForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateSub}
              className="glass-card p-3 mb-3 flex gap-2 overflow-hidden"
            >
              <input
                type="text"
                value={subForm.icon}
                onChange={(e) =>
                  setSubForm({ ...subForm, icon: e.target.value })
                }
                maxLength={4}
                className="input-anime w-16 text-center text-xl"
                placeholder="✨"
              />
              <input
                type="text"
                value={subForm.name}
                onChange={(e) =>
                  setSubForm({ ...subForm, name: e.target.value })
                }
                className="input-anime flex-1 text-sm"
                placeholder="Nombre de la subcategoría"
                required
              />
              <button type="submit" className="btn-primary text-sm">
                Crear
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {category.subcategories.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            Sin subcategorías todavía
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubFilter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                subFilter === null
                  ? 'bg-gradient-sakura text-white shadow-glow-pink'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Todas ({tasks.length})
            </button>
            {category.subcategories.map((sub) => {
              const count = tasks.filter(
                (t) => t.subcategoryId === sub.id,
              ).length;
              return (
                <div key={sub.id} className="relative group/chip">
                  <button
                    onClick={() =>
                      setSubFilter(subFilter === sub.id ? null : sub.id)
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                      subFilter === sub.id
                        ? 'bg-gradient-sakura text-white shadow-glow-pink'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteSub(sub.id, e)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover/chip:opacity-100 transition-opacity flex items-center justify-center"
                    title="Borrar subcategoría"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Formulario de tarea */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateTask}
            className="glass-card p-5 mb-4 space-y-3 overflow-hidden"
          >
            <input
              type="text"
              required
              placeholder="¿Qué quieres hacer?"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              className="input-anime"
              autoFocus
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              rows={2}
              className="input-anime text-sm resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    priority: e.target.value as Priority,
                  })
                }
                className="input-anime text-sm"
              >
                <option value="LOW">🟢 Baja</option>
                <option value="MEDIUM">🔵 Media</option>
                <option value="HIGH">🟠 Alta</option>
                <option value="URGENT">🔴 Urgente</option>
              </select>
              <select
                value={taskForm.difficulty}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    difficulty: e.target.value as Difficulty,
                  })
                }
                className="input-anime text-sm"
              >
                <option value="EASY">⚪ Fácil (+10 XP)</option>
                <option value="NORMAL">🔵 Normal (+15 XP)</option>
                <option value="HARD">🟠 Difícil (+20 XP)</option>
                <option value="BOSS">🔴 Jefe (+30 XP)</option>
              </select>
            </div>
            {subFilter && (
              <p className="text-xs text-slate-400">
                Se creará en la subcategoría:{' '}
                <span className="text-sakura-400">
                  {category.subcategories.find((s) => s.id === subFilter)?.name}
                </span>
              </p>
            )}
            <button type="submit" className="btn-primary w-full text-sm">
              Crear tarea ✨
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-3">
            {subFilter ? '🗂️' : '🎌'}
          </p>
          <p className="text-slate-400 mb-4">
            {subFilter
              ? 'No hay tareas en esta subcategoría'
              : 'No tienes tareas en esta categoría todavía'}
          </p>
          {!showTaskForm && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="btn-primary"
            >
              + Crear primera tarea
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.map((task) => (
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
                      className={`px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    {task.subcategory && (
                      <span className="text-slate-400">
                        {task.subcategory.icon} {task.subcategory.name}
                      </span>
                    )}
                    <span className="text-sakura-400">+{task.xpReward} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-sakura px-6 py-3 rounded-2xl shadow-glow-pink z-50"
          >
            <p className="font-medium text-white text-sm">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
