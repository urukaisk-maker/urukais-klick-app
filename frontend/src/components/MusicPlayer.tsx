import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer, formatTime } from '../store/player';

export function MusicPlayer() {
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const volume = usePlayer((s) => s.volume);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const seek = usePlayer((s) => s.seek);
  const setVolume = usePlayer((s) => s.setVolume);
  const stop = usePlayer((s) => s.stop);

  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-ocultar al hacer scroll hacia abajo
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY.current;

      if (goingDown && currentY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      // Si para de hacer scroll 1.5s, mostrar
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        setHidden(false);
      }, 1500);

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const track =
    currentIndex >= 0 && currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  if (!track) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: hidden ? 100 : 0,
            opacity: hidden ? 0 : 1,
          }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-sakura-500/30 rounded-none backdrop-blur-xl"
        >
          {/* Barra de progreso global */}
          <div className="w-full h-0.5 bg-white/10 relative">
            <div
              className="h-full bg-gradient-sakura transition-all"
              style={{
                width: duration ? `${(progress / duration) * 100}%` : '0%',
              }}
            />
          </div>

          <div className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
            {/* Artwork */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-sakura flex items-center justify-center overflow-hidden shadow-glow-pink shrink-0">
              {track.artwork?.['150x150'] ? (
                <img
                  src={track.artwork['150x150']}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🎵</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{track.title}</h4>
              <p className="text-xs text-slate-400 truncate">
                {track.user?.name ?? 'Artista desconocido'}
              </p>

              {/* Barra progreso (desktop) */}
              <div className="hidden md:flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 w-10 text-right">
                  {formatTime(progress)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer accent-sakura-500"
                />
                <span className="text-xs text-slate-500 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Anterior"
              >
                ⏮️
              </button>
              <button
                onClick={toggle}
                className="w-11 h-11 rounded-full bg-gradient-sakura shadow-glow-pink flex items-center justify-center text-lg hover:scale-105 transition-transform"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Siguiente"
              >
                ⏭️
              </button>
            </div>

            {/* Volumen (desktop) */}
            <div className="hidden md:flex items-center gap-2 w-28">
              <span className="text-lg">
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer accent-sakura-500"
              />
            </div>

            {/* Cerrar */}
            <button
              onClick={stop}
              className="w-8 h-8 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors text-sm"
              title="Cerrar reproductor"
            >
              ✕
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Botón flotante para reabrir si está oculto */}
      <AnimatePresence>
        {hidden && track && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setHidden(false)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-sakura shadow-glow-pink flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            title="Mostrar reproductor"
          >
            {isPlaying ? '🎵' : '⏸️'}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}