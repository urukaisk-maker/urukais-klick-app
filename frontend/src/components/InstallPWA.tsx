import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallPWA() {
  const { canInstall, isInstalled, isIOS, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('urukais-install-dismissed') === 'true',
  );
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Si ya está instalada, no mostrar nada
  if (isInstalled) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHelp(true);
      return;
    }
    const ok = await install();
    if (ok) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('urukais-install-dismissed', 'true');
    setDismissed(true);
  };

  // No mostrar el banner si: ya descartado, o (no instalable en Android/Chrome)
  // Excepto si es iOS, que siempre mostramos (instrucciones manuales)
  const showBanner =
    !dismissed && (canInstall || isIOS);

  return (
    <>
      {/* Banner flotante */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-20 right-4 z-40 max-w-xs"
          >
            <div className="glass-card p-4 border-sakura-500/40 shadow-glow-pink relative overflow-hidden">
              {/* Glow animado */}
              <div className="absolute inset-0 bg-gradient-sakura opacity-10 animate-pulse-glow" />

              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-colors z-10"
                title="Cerrar"
              >
                ✕
              </button>

              <div className="relative flex items-start gap-3 pr-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  📱
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm mb-1">
                    Instala Urukais Klick
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    {isIOS
                      ? 'Añádela a tu pantalla de inicio'
                      : 'Accede más rápido y sin conexión'}
                  </p>
                  <button
                    onClick={handleInstall}
                    className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-2"
                  >
                    {isIOS ? '📲 Cómo instalar' : '✨ Instalar app'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal instrucciones iOS */}
      <AnimatePresence>
        {showIOSHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIOSHelp(false)}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-sm w-full p-6"
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">📱</div>
                <h3 className="font-display text-lg">Instalar en iOS</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sigue estos 3 pasos en Safari
                </p>
              </div>

              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-sakura text-white text-xs flex items-center justify-center shrink-0 font-medium">
                    1
                  </span>
                  <span>
                    Pulsa el botón <strong>Compartir</strong>{' '}
                    <span className="text-lg">⬆️</span> en Safari
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-sakura text-white text-xs flex items-center justify-center shrink-0 font-medium">
                    2
                  </span>
                  <span>
                    Desplázate y pulsa{' '}
                    <strong>"Añadir a pantalla de inicio"</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-sakura text-white text-xs flex items-center justify-center shrink-0 font-medium">
                    3
                  </span>
                  <span>
                    Pulsa <strong>Añadir</strong> arriba a la derecha
                  </span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSHelp(false)}
                className="btn-primary w-full mt-5"
              >
                Entendido 👍
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-sakura px-6 py-3 rounded-2xl shadow-glow-pink z-50"
          >
            <p className="font-medium text-white text-sm">
              🎉 ¡App instalada! Búscala en tu escritorio
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}