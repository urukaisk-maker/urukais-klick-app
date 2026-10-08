import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../store/theme';
import { api } from '../lib/api';
import { THEMES, type ThemeId } from '../types';

const ALL_THEMES = Object.values(THEMES);

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const currentTheme = useTheme((s) => s.currentTheme);
  const setTheme = useTheme((s) => s.setTheme);

  const handleSelect = async (themeId: ThemeId) => {
    setTheme(themeId);
    setOpen(false);

    try {
      await api.patch('/users/me', { theme: themeId });
    } catch {
      // fallback local
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
        title="Cambiar tema"
      >
        <span className="text-lg">{THEMES[currentTheme]?.icon ?? '🎨'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute bottom-12 left-0 z-50 w-64 glass-card p-3 border-sakura-500/30"
            >
              <h3 className="font-display text-sm mb-3 px-2">
                🎨 Temas disponibles
              </h3>

              <div className="space-y-1">
                {ALL_THEMES.map((theme) => {
                  const isSelected = currentTheme === theme.id;

                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelect(theme.id)}
                      className={`w-full p-2 rounded-xl flex items-center gap-3 transition-all text-left ${
                        isSelected
                          ? 'bg-gradient-sakura text-white'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{theme.icon}</span>
                      <span className="flex-1 text-sm font-medium">
                        {theme.name}
                      </span>
                      {isSelected && <span className="text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-slate-500 text-center">
                Compra más temas en la 🛒 Tienda
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}