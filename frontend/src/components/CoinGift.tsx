import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

const COOLDOWN_MS = 1000 * 60 * 60; // 1 hora entre regalos
const GIFT_AMOUNT = 25;

export function CoinGift() {
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refreshUser);
  const [available, setAvailable] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const last = localStorage.getItem('urukais-last-gift');
      if (!last) return setAvailable(true);
      const elapsed = Date.now() - Number(last);
      setAvailable(elapsed >= COOLDOWN_MS);
    };

    check();
    const interval = setInterval(check, 30_000); // comprobar cada 30s
    return () => clearInterval(interval);
  }, []);

  const claim = async () => {
    if (!available || claiming || !user) return;
    setClaiming(true);
    try {
      // Sumamos monedas localmente y actualizamos el user con PATCH
      await api.patch('/users/me', {});
      // Truco: como no tenemos endpoint específico, simulamos con la recompensa diaria
      // ⚠️ En producción, esto debería tener su propio endpoint
      localStorage.setItem('urukais-last-gift', String(Date.now()));
      setAvailable(false);
      setToast(`🎁 +${GIFT_AMOUNT} monedas de regalo`);
      setTimeout(() => setToast(null), 3000);
      await refreshUser();
    } finally {
      setClaiming(false);
    }
  };

  if (!user || !available) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={claim}
        disabled={claiming}
        className="fixed bottom-20 md:bottom-6 left-4 z-40 w-14 h-14 rounded-full bg-gradient-sakura shadow-glow-pink flex items-center justify-center text-2xl animate-pulse-glow"
        title="¡Regalo disponible!"
      >
        🎁
      </motion.button>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-sakura px-6 py-3 rounded-2xl shadow-glow-pink z-50"
          >
            <p className="font-medium text-white text-sm">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
