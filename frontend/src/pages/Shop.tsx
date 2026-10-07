import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import type { ShopItem } from '../types';

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  THEME: { label: 'Temas', icon: '🎨' },
  STICKER: { label: 'Stickers', icon: '🏷️' },
  AVATAR: { label: 'Avatares', icon: '👤' },
  MASCOT_SKIN: { label: 'Skins mascota', icon: '🦊' },
  BOOST: { label: 'Boosts', icon: '⚡' },
  COSMETIC: { label: 'Cosméticos', icon: '✨' },
};

export function Shop() {
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refreshUser);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(
    null,
  );
  const [filter, setFilter] = useState<string>('ALL');

  const load = async () => {
    setLoading(true);
    const { data } = await api.get<ShopItem[]>('/shop/items');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (text: string, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 2500);
  };

  const handleBuy = async (item: ShopItem) => {
    if (item.owned) return;
    if ((user?.coins ?? 0) < item.price) {
      showToast(`❌ Necesitas ${item.price - (user?.coins ?? 0)} monedas más`, true);
      return;
    }
    if (!confirm(`¿Comprar "${item.name}" por ${item.price} monedas?`)) return;

    setBuying(item.id);
    try {
      const { data } = await api.post(`/shop/buy/${item.id}`);
      showToast(`✨ ¡${item.name} adquirido! Te quedan ${data.coinsLeft} 💰`);
      await refreshUser();
      await load();
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message ?? 'Error al comprar'), true);
    } finally {
      setBuying(null);
    }
  };

  const types = ['ALL', ...Object.keys(TYPE_LABELS)];
  const filtered =
    filter === 'ALL' ? items : items.filter((i) => i.type === filter);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">🛒 Tienda</h1>
          <p className="text-sm text-slate-400 mt-1">
            Gasta tus monedas en cosméticos
          </p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="font-display text-xl text-yellow-400">
            {user?.coins ?? 0}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {types.map((t) => {
          const info = t === 'ALL' ? { label: 'Todo', icon: '🌟' } : TYPE_LABELS[t];
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === t
                  ? 'bg-gradient-sakura text-white shadow-glow-pink'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => {
            const canAfford = (user?.coins ?? 0) >= item.price;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`glass-card p-4 flex flex-col relative overflow-hidden ${
                  item.owned ? 'border-green-500/40' : ''
                }`}
              >
                {/* Owned badge */}
                {item.owned && (
                  <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400">
                    ✓ Tuyo
                  </div>
                )}

                {/* Icon */}
                <div className="text-5xl text-center my-4">{item.icon}</div>

                <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2 flex-1">
                  {item.description}
                </p>

                {/* Price + buy */}
                {!item.owned && (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={buying === item.id}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-gradient-sakura text-white hover:shadow-glow-pink'
                        : 'bg-white/5 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {buying === item.id ? (
                      '⏳...'
                    ) : (
                      <>
                        <span className="text-yellow-400">💰</span>
                        <span>{item.price}</span>
                      </>
                    )}
                  </button>
                )}
                {item.owned && (
                  <div className="w-full py-2 rounded-xl text-sm text-center bg-green-500/10 border border-green-500/30 text-green-400">
                    Adquirido
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl z-50 max-w-md ${
              toast.error
                ? 'bg-red-500/20 border border-red-500/50'
                : 'bg-gradient-sakura shadow-glow-pink'
            }`}
          >
            <p className="font-medium text-white text-sm">{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
