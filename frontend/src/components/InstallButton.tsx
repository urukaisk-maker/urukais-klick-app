import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallButton() {
  const { canInstall, isInstalled, isIOS, install } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);

  // Si ya está instalada, no mostrar
  if (isInstalled) {
    return (
      <div className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
        <span>✅</span>
        <span>App instalada</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowHelp(true);
      return;
    }
    if (canInstall) {
      await install();
    } else {
      setShowHelp(true);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleClick}
        className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-sakura text-white text-xs font-medium shadow-glow-pink hover:scale-[1.02] transition-transform"
        title="Instalar Urukais Klick como app"
      >
        <span className="text-base">📱</span>
        <span>Instalar app</span>
      </motion.button>

      {/* Modal de ayuda */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-md w-full p-6"
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">📱</div>
                <h3 className="font-display text-lg">
                  Instala Urukais Klick
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Añádela a tu pantalla de inicio y úsala como una app nativa
                </p>
              </div>

              {/* iOS */}
              {isIOS && (
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
              )}

              {/* Android / Chrome / Edge */}
              {!isIOS && (
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-sakura text-white text-xs flex items-center justify-center shrink-0 font-medium">
                      1
                    </span>
                    <span>
                      Abre el menú del navegador (los 3 puntos <strong>⋮</strong>)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-sakura text-white text-xs flex items-center justify-center shrink-0 font-medium">
                      2
                    </span>
                    <span>
                      Pulsa <strong>"Instalar aplicación"</strong> o{' '}
                      <strong>"Añadir a pantalla de inicio"</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-sakura text-white text-xs flex items-center justify-center shrink-0 font-medium">
                      3
                    </span>
                    <span>
                      Confirma y búscala en tu <strong>escritorio o cajón de apps</strong>
                    </span>
                  </li>
                </ol>
              )}

              <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300">
                💡 <strong>Nota:</strong> en Firefox no está soportado. Usa Chrome, Edge o Safari.
              </div>

              <button
                onClick={() => setShowHelp(false)}
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
