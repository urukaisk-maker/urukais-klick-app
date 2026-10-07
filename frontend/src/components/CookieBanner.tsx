import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('urukais-cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('urukais-cookie-consent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('urukais-cookie-consent', 'rejected');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 glass-card p-4 border-sakura-500/30"
        >
          <p className="text-sm mb-3">
            🍪 Usamos cookies para mejorar tu experiencia en Urukais Klick. Al continuar, aceptas nuestra{' '}
            <Link to="/cookies" className="text-sakura-400 underline">
              política de cookies
            </Link>.
          </p>
          <div className="flex gap-2">
            <button onClick={handleAccept} className="btn-primary text-sm flex-1">
              Aceptar
            </button>
            <button onClick={handleReject} className="btn-ghost text-sm flex-1">
              Rechazar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
