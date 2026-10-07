import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { usePlayer, formatTime, type Track } from '../store/player';

const GENRES = [
  { value: '', label: '🌟 Todo' },
  { value: 'Electronic', label: '🎧 Electrónica' },
  { value: 'Hip-Hop/Rap', label: '🎤 Hip-Hop' },
  { value: 'Lo-Fi', label: '🌙 Lo-Fi' },
  { value: 'Rock', label: '🎸 Rock' },
  { value: 'Pop', label: '🎵 Pop' },
  { value: 'House', label: '🏠 House' },
  { value: 'Dubstep', label: '🔊 Dubstep' },
];

const QUICK_SEARCHES = [
  'lofi',
  'chill',
  'anime',
  'japanese',
  'study',
  'gaming',
  'kawaii',
  'trap',
];

export function Music() {
  const [tab, setTab] = useState<'trending' | 'search'>('trending');
  const [trending, setTrending] = useState<Track[]>([]);
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');

  const playQueue = usePlayer((s) => s.playQueue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const queue = usePlayer((s) => s.queue);
  const currentTrack = usePlayer((s) => s.currentTrack);

  const loadTrending = async (g = '') => {
    setLoading(true);
    try {
      const { data } = await api.get<Track[]>('/audius/trending', {
        params: g ? { genre: g } : {},
      });
      setTrending(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrending(genre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setTab('search');
    try {
      const { data } = await api.get<Track[]>('/audius/search', {
        params: { q: query },
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const quickSearch = (q: string) => {
    setQuery(q);
    setTab('search');
    setSearching(true);
    api
      .get<Track[]>('/audius/search', { params: { q } })
      .then((r) => setResults(r.data))
      .finally(() => setSearching(false));
  };

  const activeList = tab === 'trending' ? trending : results;

  const isCurrentPlaying = (track: Track) => {
    const cur = currentTrack();
    return cur?.id === track.id;
  };

  const handlePlay = (track: Track) => {
    const idx = activeList.findIndex((t) => t.id === track.id);
    if (idx >= 0) playQueue(activeList, idx);
  };

  return (
    <div className="max-w-6xl mx-auto pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl">🎵 Música</h1>
        <p className="text-sm text-slate-400 mt-1">
          Descubre y escucha música libre de Audius
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
            placeholder="Busca canciones, artistas, géneros..."
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

        {/* Búsquedas rápidas */}
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

      {/* Filtros de género */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {GENRES.map((g) => (
          <button
            key={g.value}
            onClick={() => {
              setGenre(g.value);
              setTab('trending');
            }}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
              genre === g.value && tab === 'trending'
                ? 'bg-gradient-sakura text-white shadow-glow-pink'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('trending')}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            tab === 'trending'
              ? 'bg-gradient-sakura text-white shadow-glow-pink'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          🔥 Trending
        </button>
        {results.length > 0 && (
          <button
            onClick={() => setTab('search')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              tab === 'search'
                ? 'bg-gradient-sakura text-white shadow-glow-pink'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            🔍 Resultados ({results.length})
          </button>
        )}
      </div>

      {/* Grid de canciones */}
      {loading || searching ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl animate-pulse mb-2">🎵</div>
          Cargando canciones...
        </div>
      ) : activeList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-3">🎧</p>
          <p className="text-slate-400">
            {tab === 'search'
              ? 'Sin resultados. Prueba otra búsqueda.'
              : 'No hay canciones disponibles.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {activeList.map((track, i) => {
            const isCurrent = isCurrentPlaying(track);
            return (
              <motion.button
                key={`${track.id}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => handlePlay(track)}
                className={`glass-card p-3 text-left hover:border-sakura-500/50 hover:shadow-glow-pink transition-all group relative ${
                  isCurrent ? 'border-sakura-500/60 shadow-glow-pink' : ''
                }`}
              >
                {/* Artwork */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                  {track.artwork?.['480x480'] ? (
                    <img
                      src={track.artwork['480x480']}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🎵
                    </div>
                  )}

                  {/* Play overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-sakura shadow-glow-pink flex items-center justify-center text-xl">
                      {isCurrent && isPlaying ? '⏸️' : '▶️'}
                    </div>
                  </div>

                  {/* Duración */}
                  {track.duration > 0 && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-xs">
                      {formatTime(track.duration)}
                    </div>
                  )}
                </div>

                <h3 className="font-medium text-sm truncate">{track.title}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {track.user?.name ?? 'Artista desconocido'}
                </p>
                {track.genre && (
                  <p className="text-xs text-sakura-400/70 truncate mt-1">
                    {track.genre}
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Info abajo si hay queue activa */}
      {queue.length > 0 && currentIndex >= 0 && (
        <p className="text-center text-xs text-slate-500 mt-6">
          Sonando {currentIndex + 1} de {queue.length} en la cola
        </p>
      )}
    </div>
  );
}
