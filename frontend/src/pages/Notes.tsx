import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useFeedback } from '../hooks/useFeedback';

interface Note {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  moodEmoji: string | null;
  isPinned: boolean;
  isDiary: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const MOODS = [
  { emoji: '😊', label: 'feliz' },
  { emoji: '😢', label: 'triste' },
  { emoji: '😡', label: 'enfadado' },
  { emoji: '😴', label: 'cansado' },
  { emoji: '🤔', label: 'pensativo' },
  { emoji: '🔥', label: 'motivado' },
  { emoji: '💖', label: 'enamorado' },
  { emoji: '😎', label: 'genial' },
];

export function Notes() {
  const { play, confetti } = useFeedback();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'diary' | 'notes'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    moodEmoji: '😊',
    isDiary: false,
    isPinned: false,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Note[]>('/notes');
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      content: form.content,
      moodEmoji: form.moodEmoji,
      mood: MOODS.find((m) => m.emoji === form.moodEmoji)?.label,
      isDiary: form.isDiary,
      isPinned: form.isPinned,
    };

    if (editingId) {
      await api.patch(`/notes/${editingId}`, payload);
      showToast('✨ Nota actualizada');
      play('click');
    } else {
      await api.post('/notes', payload);
      showToast('📝 Nota creada');
      play('habitCheck');
      confetti.sparkle();
    }

    setForm({
      title: '',
      content: '',
      moodEmoji: '😊',
      isDiary: false,
      isPinned: false,
    });
    setEditingId(null);
    setShowForm(false);
    await load();
  };

  const handleEdit = (note: Note) => {
    setForm({
      title: note.title,
      content: note.content,
      moodEmoji: note.moodEmoji ?? '😊',
      isDiary: note.isDiary,
      isPinned: note.isPinned,
    });
    setEditingId(note.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar esta nota?')) return;
    await api.delete(`/notes/${id}`);
    showToast('🗑️ Nota borrada');
    play('error');
    load();
  };

  const togglePin = async (note: Note) => {
    await api.patch(`/notes/${note.id}`, { isPinned: !note.isPinned });
    play('click');
    load();
  };

  const filtered = notes.filter((n) => {
    if (filter === 'diary') return n.isDiary;
    if (filter === 'notes') return !n.isDiary;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">📝 Notas</h1>
          <p className="text-sm text-slate-400 mt-1">
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({
              title: '',
              content: '',
              moodEmoji: '😊',
              isDiary: false,
              isPinned: false,
            });
          }}
          className="btn-primary"
        >
          {showForm ? '✕ Cancelar' : '+ Nueva nota'}
        </button>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 mb-6 space-y-4 overflow-hidden"
          >
            <input
              type="text"
              required
              placeholder="Título de la nota"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-anime text-lg"
            />
            <textarea
              required
              placeholder="Escribe aquí tu nota..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="input-anime resize-none"
            />

            {/* Mood */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                ¿Cómo te sientes?
              </label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map((m) => (
                  <button
                    key={m.emoji}
                    type="button"
                    onClick={() => setForm({ ...form, moodEmoji: m.emoji })}
                    className={`w-11 h-11 rounded-xl text-2xl transition-all ${
                      form.moodEmoji === m.emoji
                        ? 'bg-gradient-sakura shadow-glow-pink scale-110'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones */}
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDiary}
                  onChange={(e) =>
                    setForm({ ...form, isDiary: e.target.checked })
                  }
                  className="w-4 h-4 accent-sakura-500"
                />
                <span>📔 Es una entrada de diario</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) =>
                    setForm({ ...form, isPinned: e.target.checked })
                  }
                  className="w-4 h-4 accent-sakura-500"
                />
                <span>📌 Fijar arriba</span>
              </label>
            </div>

            <button type="submit" className="btn-primary w-full">
              {editingId ? 'Guardar cambios ✨' : 'Crear nota 📝'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: '📚 Todas' },
          { value: 'notes', label: '📝 Notas' },
          { value: 'diary', label: '📔 Diario' },
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

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-3">📝</p>
          <p className="text-slate-400">
            No hay notas todavía. ¡Crea la primera!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`glass-card p-4 flex flex-col relative group transition-all ${
                  note.isPinned ? 'border-sakura-500/50 shadow-glow-pink' : ''
                }`}
              >
                {/* Pin */}
                {note.isPinned && (
                  <div className="absolute top-2 left-2 text-lg">📌</div>
                )}

                {/* Mood */}
                {note.moodEmoji && (
                  <div className="absolute top-2 right-2 text-2xl">
                    {note.moodEmoji}
                  </div>
                )}

                <h3 className="font-display text-lg mt-6 mb-2 line-clamp-1">
                  {note.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-4 flex-1">
                  {note.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs text-slate-500">
                    {new Date(note.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  {note.isDiary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      📔 Diario
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => togglePin(note)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                    title={note.isPinned ? 'Desfijar' : 'Fijar'}
                  >
                    📌
                  </button>
                  <button
                    onClick={() => handleEdit(note)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-sm"
                    title="Borrar"
                  >
                    🗑️
                  </button>
                </div>
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
