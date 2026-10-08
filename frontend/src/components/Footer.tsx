import { Link } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { canInstall, isInstalled, isIOS, install } = useInstallPrompt();

  const showInstall = !isInstalled;

  const handleInstall = async () => {
    if (isIOS) {
      alert(
        '📱 En iOS:\n\n1. Pulsa el botón Compartir ⬆️\n2. "Añadir a pantalla de inicio"\n3. Pulsa "Añadir"',
      );
      return;
    }
    if (canInstall) {
      await install();
    } else {
      alert(
        '📱 Para instalar Urukais Klick:\n\n' +
          '• En Chrome/Edge: menú (3 puntos) → "Instalar aplicación"\n' +
          '• En Safari iOS: Compartir ⬆️ → "Añadir a pantalla de inicio"\n' +
          '• En Firefox: no soporta instalación de PWA (usa Chrome)\n\n' +
          '💡 Consejo: si ya lo cancelaste, borra los datos del sitio y recarga.',
      );
    }
  };

  return (
    <footer className="mt-12 pt-6 border-t border-white/10 text-sm text-slate-400">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg text-gradient-sakura mb-2">
              ⛩️ Urukais Klick
            </h3>
            <p className="text-xs">
              Tu agenda personal con gamificación estilo anime. Hecha con 💖 por
              Manuel Casimiro Carrasco.
            </p>

            {/* 📱 Botón de instalar app */}
            {showInstall && (
              <button
                onClick={handleInstall}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-sakura text-white text-xs font-medium shadow-glow-pink hover:scale-[1.02] transition-transform"
              >
                <span className="text-base">📱</span>
                <span>{isIOS ? 'Cómo instalar' : 'Instalar app'}</span>
              </button>
            )}

            {isInstalled && (
              <div className="mt-3 text-xs text-green-400 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
                <span>✅</span>
                <span>App instalada</span>
              </div>
            )}
          </div>

          {/* Enlaces */}
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Enlaces</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <a
                  href="https://github.com/urukaisk-maker/urukais-klick-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sakura-300 transition-colors"
                >
                  🐙 Repositorio GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://meek-frangipane-594897.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sakura-300 transition-colors"
                >
                  🏠 Calculadora de Hipotecas
                </a>
              </li>
              <li>
                <a
                  href="https://unique-biscochitos-31bcea.netlify.app/#hardware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sakura-300 transition-colors"
                >
                  💼 Mi Currículum
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Legal</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-sakura-300 transition-colors"
                >
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-sakura-300 transition-colors"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="hover:text-sakura-300 transition-colors"
                >
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Contacto</h4>
            <p className="text-xs">
              Manuel Casimiro Carrasco
              <br />
              Desarrollador Web
              <br />
              Urukais Klick
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <p>
            © {currentYear} Urukais Klick · Manuel Casimiro Carrasco · Todos los
            derechos reservados.
          </p>
          <p className="mt-1">
            Hecho con React, NestJS, Prisma y TailwindCSS 🎌
          </p>
        </div>
      </div>
    </footer>
  );
}