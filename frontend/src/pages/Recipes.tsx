import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

interface RecipeSummary {
  id: string;
  title: string;
  url: string;
  image_url?: string;
  description?: string;
  category?: string;
  area?: string;
}

interface RecipeDetail extends RecipeSummary {
  ingredients: { name: string; measure: string }[];
  steps: string[];
  tags?: string[];
  source?: string;
  youtube?: string;
}

const QUICK_SEARCHES = [
  'paella',
  'tortilla',
  'gazpacho',
  'churros',
  'sangria',
  'pulpo',
  'croquetas',
  'flamenquin',
];

const AREAS = [
  { value: 'Spanish', label: '🇪🇸 Española' },
  { value: 'Italian', label: '🇮🇹 Italiana' },
  { value: 'Mexican', label: '🇲🇽 Mexicana' },
  { value: 'Japanese', label: '🇯🇵 Japonesa' },
  { value: 'Chinese', label: '🇨🇳 China' },
  { value: 'French', label: '🇫🇷 Francesa' },
  { value: 'Greek', label: '🇬🇷 Griega' },
  { value: 'Indian', label: '🇮🇳 India' },
];

const CATEGORIES = [
  { value: 'Seafood', label: '🦐 Mariscos' },
  { value: 'Dessert', label: '🍰 Postres' },
  { value: 'Vegetarian', label: '🥗 Vegetariano' },
  { value: 'Vegan', label: '🌱 Vegano' },
  { value: 'Chicken', label: '🍗 Pollo' },
  { value: 'Beef', label: '🥩 Carne' },
  { value: 'Pasta', label: '🍝 Pasta' },
  { value: 'Breakfast', label: '🥞 Desayuno' },
];

export function Recipes() {
  const [tab, setTab] = useState<'search' | 'area' | 'category'>('area');
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [activeArea, setActiveArea] = useState('Spanish');
  const [activeCategory, setActiveCategory] = useState('Seafood');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadArea = async (area: string) => {
    setLoading(true);
    try {
      const { data } = await api.get<RecipeSummary[]>(
        `/recipes/area/${area}`,
      );
      setRecipes(data);
      setTab('area');
    } finally {
      setLoading(false);
    }
  };

  const loadCategory = async (category: string) => {
    setLoading(true);
    try {
      const { data } = await api.get<RecipeSummary[]>(
        `/recipes/category/${category}`,
      );
      setRecipes(data);
      setTab('category');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArea(activeArea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setTab('search');
    try {
      const { data } = await api.get<RecipeSummary[]>('/recipes/search', {
        params: { q: query },
      });
      setRecipes(data);
    } finally {
      setSearching(false);
    }
  };

  const quickSearch = (q: string) => {
    setQuery(q);
    setSearching(true);
    setTab('search');
    api
      .get<RecipeSummary[]>('/recipes/search', { params: { q } })
      .then((r) => setRecipes(r.data))
      .finally(() => setSearching(false));
  };

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      const { data } = await api.get<RecipeDetail>(`/recipes/${id}`);
      setDetail(data);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl">🍳 Recetas</h1>
        <p className="text-sm text-slate-400 mt-1">
          Descubre recetas de todo el mundo (TheMealDB)
        </p>
      </motion.div>

      {/* Buscador */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSearch}
        className="glass-card p-4 mb-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca una receta (ej: paella, pasta, tacos...)"
            className="input-anime flex-1"
          />
          <button
            type="submit"
            disabled={searching}
            className="btn-primary px-6"
          >
            {searching ? '⏳' : '🔍'}
          </button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {QUICK_SEARCHES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => quickSearch(q)}
              className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-sakura-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </motion.form>

      {/* Filtros por área */}
      <div className="mb-3">
        <h3 className="text-sm text-slate-400 mb-2">🌍 Por país/cultura</h3>
        <div className="flex gap-2 flex-wrap">
          {AREAS.map((a) => (
            <button
              key={a.value}
              onClick={() => {
                setActiveArea(a.value);
                loadArea(a.value);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                activeArea === a.value && tab === 'area'
                  ? 'bg-gradient-sakura text-white shadow-glow-pink'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="mb-6">
        <h3 className="text-sm text-slate-400 mb-2">🍽️ Por categoría</h3>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setActiveCategory(c.value);
                loadCategory(c.value);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                activeCategory === c.value && tab === 'category'
                  ? 'bg-gradient-sakura text-white shadow-glow-pink'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {loading || searching ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl animate-pulse mb-2">🍳</div>
          Buscando recetas...
        </div>
      ) : recipes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-3">👨‍🍳</p>
          <p className="text-slate-400">
            No hay recetas. Prueba otra búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recipes.map((recipe, i) => (
            <motion.button
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => openDetail(recipe.id)}
              className="glass-card-hover p-3 text-left group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/30 to-red-500/30 mb-3 relative">
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🍽️
                  </div>
                )}
                {recipe.area && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] backdrop-blur-sm">
                    {recipe.area}
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm line-clamp-2">
                {recipe.title}
              </h3>
              {recipe.category && (
                <p className="text-xs text-sakura-400/80 mt-1">
                  {recipe.category}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-2xl w-full my-8 overflow-hidden"
            >
              {detailLoading ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-4xl animate-pulse mb-2">🍳</div>
                  Cargando receta...
                </div>
              ) : detail ? (
                <>
                  {/* Imagen */}
                  {detail.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={detail.image_url}
                        alt={detail.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h2 className="font-display text-2xl">
                          {detail.title}
                        </h2>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {detail.category && (
                            <span className="px-2 py-0.5 rounded-full bg-sakura-500/20 text-sakura-300 text-xs">
                              {detail.category}
                            </span>
                          )}
                          {detail.area && (
                            <span className="px-2 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan text-xs">
                              {detail.area}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={closeDetail}
                        className="text-2xl text-slate-400 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Ingredientes */}
                    {detail.ingredients.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-display text-lg mb-3">
                          🧂 Ingredientes
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {detail.ingredients.map((ing, i) => (
                            <li
                              key={i}
                              className="flex justify-between text-sm py-1.5 border-b border-white/5"
                            >
                              <span className="text-slate-300">
                                {ing.name}
                              </span>
                              <span className="text-slate-500 text-xs">
                                {ing.measure}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pasos */}
                    {detail.steps.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-display text-lg mb-3">
                          👨‍🍳 Preparación
                        </h3>
                        <ol className="space-y-3">
                          {detail.steps.map((step, i) => (
                            <li
                              key={i}
                              className="flex gap-3 text-sm text-slate-300"
                            >
                              <span className="w-6 h-6 rounded-full bg-gradient-sakura text-white text-xs flex items-center justify-center shrink-0 font-medium">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Enlaces externos */}
                    <div className="flex gap-2 flex-wrap">
                      {detail.youtube && (
                        <a
                          href={detail.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost text-xs"
                        >
                          ▶️ Ver en YouTube
                        </a>
                      )}
                      <a
                        href={detail.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs"
                      >
                        🔗 Fuente original
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-400">Receta no disponible</p>
                  <button onClick={closeDetail} className="btn-primary mt-4">
                    Cerrar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}