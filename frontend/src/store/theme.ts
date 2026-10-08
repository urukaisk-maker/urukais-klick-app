import { create } from 'zustand';
import { THEMES, type ThemeId } from '../types';

interface ThemeState {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  applyTheme: (theme: ThemeId) => void;
  initTheme: () => void;
}

function applyThemeToDOM(theme: ThemeId) {
  const config = THEMES[theme];
  if (!config) return;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', config.colors.primary);
  root.style.setProperty('--color-secondary', config.colors.secondary);
  root.style.setProperty('--color-accent', config.colors.accent);
  root.style.setProperty('--color-bg', config.colors.bg);
  root.style.setProperty('--color-bg-soft', config.colors.bgSoft);
  root.style.setProperty('--color-text', config.colors.text);
  root.setAttribute('data-theme', theme);
}

export const useTheme = create<ThemeState>((set) => ({
  currentTheme: 'sakura',

  setTheme: (theme) => {
    localStorage.setItem('urukais-theme', theme);
    applyThemeToDOM(theme);
    set({ currentTheme: theme });
  },

  applyTheme: (theme) => {
    applyThemeToDOM(theme);
    set({ currentTheme: theme });
  },

  initTheme: () => {
    const saved = localStorage.getItem('urukais-theme') as ThemeId | null;
    const theme = saved ?? 'sakura';
    applyThemeToDOM(theme);
    set({ currentTheme: theme });
  },
}));