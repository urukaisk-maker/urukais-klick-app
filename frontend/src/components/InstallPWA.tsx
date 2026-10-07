import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallPWA() {
  const { canInstall, isInstalled, isIOS, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('urukais-install-dismissed') === 'true',
  );
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  // No mostrar si: ya instalada, ya descartada, o no es instalable
  if (isInstalled || dismissed || (!canInstall && !isIOS)) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHelp(true);
      return;
    }
    await install();
  };

  const handleDismiss = () => {
    localStorage.setItem('urukais-install-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 md:bottom-6 right-4 z-40 max-w-xs"
        >
          <div className="glass-card p-4 border-sakura-500/40 shadow-glow-pink relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-colors"
              title="Cerrar"
            >
              ✕
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="text-3xl">📱</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm mb-1">
                  Instala Urukais Klick
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Accede más rápido desde tu pantalla de inicio
                </p>
                <button
                  onClick={handleInstall}
                  className="btn-primary text-xs w-full py-2"
                >
                  {isIOS ? '📲 Cómo instalar' : '✨ Instalar app'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
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
                    Desplázate y pulsa <strong>"Añadir a inicio"</strong>
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
    </>
  );
}