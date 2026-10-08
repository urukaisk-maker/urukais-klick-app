import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface SearchResults {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    category: { icon: string; color: string } | null;
  }>;
  notes: Array<{
    id: string;
    title: string;
    content: string;
    moodEmoji: string | null;
    date: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    startAt: string;
    color: string;
    location: string | null;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  }>;
  habits: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
}

const EMPTY: SearchResults = {
  tasks: [],
  notes: [],
  events: [],
  categories: [],
  habits: [],
};

interface FlatResult {
  type: 'task' | 'note' | 'event' | 'category' | 'habit';
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  color?: string;
  href: string;
}

export function SearchModal() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Atajo Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(EMPTY);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounce búsqueda
  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResults(EMPTY);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .get<SearchResults>('/search', { params: { q: query } })
        .then((r) => {
          setResults(r.data);
          setSelectedIndex(0);
        })
        .catch(() => setResults(EMPTY))
        .finally(() => setLoading(false));
    }, 250);

        return () => clearTimeout(timeout);
  }, [query, open]);

  // Aplanar resultados para navegación con teclado
  const flat: FlatResult[] = [
    ...results.tasks.map((t) => ({
      type: 'task' as const,
      id: t.id,
      icon: t.category?.icon ?? '✅',
      title: t.title,
      subtitle: `Tarea · ${t.status}`,
      color: t.category?.color,
      href: '/tasks',
    })),
    ...results.habits.map((h) => ({
      type: 'habit' as const,
      id: h.id,
      icon: h.icon,
      title: h.name,
      subtitle: 'Hábito',
      color: h.color,
      href: '/habits',
    })),
    ...results.notes.map((n) => ({
      type: 'note' as const,
      id: n.id,
      icon: n.moodEmoji ?? '📝',
      title: n.title,
      subtitle: `Nota · ${new Date(n.date).toLocaleDateString('es-ES')}`,
      href: '/notes',
    })),
    ...results.events.map((ev) => ({
      type: 'event' as const,
      id: ev.id,
      icon: '📅',
      title: ev.title,
      subtitle: `Evento · ${new Date(ev.startAt).toLocaleDateString('es-ES')}`,
      color: ev.color,
      href: '/calendar',
    })),
    ...results.categories.map((c) => ({
      type: 'category' as const,
      id: c.id,
      icon: c.icon,
      title: c.name,
      subtitle: 'Categoría',
      color: c.color,
      href: `/category/${c.slug}`,
    })),
  ];

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flat[selectedIndex]) {
      e.preventDefault();
      const item = flat[selectedIndex];
      navigate(item.href);
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
          >
            <div className="glass-card border-sakura-500/30 shadow-glow-pink overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <span className="text-2xl">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDownInput}
                  placeholder="Busca en toda tu agenda..."
                  className="flex-1 bg-transparent border-0 outline-none text-lg placeholder-slate-500"
                />
                <kbd className="px-2 py-1 rounded bg-white/5 text-xs text-slate-400 border border-white/10">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">
                    <div className="text-3xl animate-pulse mb-2">🔍</div>
                    Buscando...
                  </div>
                ) : query.trim().length < 2 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    <p className="text-3xl mb-2">⌨️</p>
                    <p>Escribe al menos 2 caracteres para buscar</p>
                    <p className="text-xs mt-3 text-slate-500">
                      Busca en tareas, hábitos, notas, eventos y categorías
                    </p>
                  </div>
                ) : flat.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-3xl mb-2">🤷</p>
                    <p>Sin resultados para "{query}"</p>
                  </div>
                ) : (
                  <ul className="py-2">
                    {flat.map((item, i) => (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          onClick={() => {
                            navigate(item.href);
                            setOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                            selectedIndex === i
                              ? 'bg-gradient-sakura/20'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{
                              backgroundColor: item.color
                                ? `${item.color}20`
                                : 'rgba(255,255,255,0.05)',
                            }}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-xs text-slate-400 truncate">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          {selectedIndex === i && (
                            <span className="text-xs text-slate-500 shrink-0">
                              Enter ↵
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>↑↓ Navegar</span>
                  <span>↵ Abrir</span>
                  <span>ESC Cerrar</span>
                </div>
                <span>{flat.length} resultado{flat.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}