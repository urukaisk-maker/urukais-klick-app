export type Rank = 'GENIN' | 'CHUNIN' | 'JONIN' | 'ANBU' | 'HOKAGE';
export type Role = 'USER' | 'ADMIN' | 'MODERATOR';
export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'BOSS';
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  xp: number;
  level: number;
  rank: Rank;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  theme: string;
  mascotName: string;
  language: string;
  timezone: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  mascot?: Mascot;
  _count?: {
    tasks: number;
    notes: number;
    habits: number;
    goals: number;
    achievements: number;
  };
}

export interface Mascot {
  id: string;
  userId: string;
  name: string;
  species: string;
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  energy: number;
  skinCode: string;
  lastFedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  icon: string;
  color: string | null;
  order: number;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  coverUrl: string | null;
  order: number;
  isDefault: boolean;
  isArchived: boolean;
  subcategories: Subcategory[];
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isDone: boolean;
  order: number;
  completedAt: string | null;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  difficulty: Difficulty;
  dueDate: string | null;
  startDate: string | null;
  completedAt: string | null;
  reminderAt: string | null;
  xpReward: number;
  coinReward: number;
  sticker: string | null;
  moodTag: string | null;
  estimatedPomodoros: number;
  categoryId: string | null;
  subcategoryId: string | null;
  category?: Category | null;
  subcategory?: Subcategory | null;
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  xpReward: number;
  coinReward: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  progress: number;
  byRarity: Array<{
    rarity: Rarity;
    total: number;
    unlocked: number;
  }>;
}

export interface ShopItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  type: 'THEME' | 'STICKER' | 'AVATAR' | 'MASCOT_SKIN' | 'BOOST' | 'COSMETIC';
  payload: Record<string, any> | null;
  isActive: boolean;
  owned: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  targetDays: number[];
  targetCount: number;
  xpReward: number;
  categoryId: string | null;
  category?: Category | null;
  streak: number;
  todayDone: boolean;
  todayCount: number;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: string | null;
  moodEmoji: string | null;
  isPinned: boolean;
  isDiary: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}
// ============================================
// 🎨 TEMAS
// ============================================

export type ThemeId = 'sakura' | 'neon' | 'cyber' | 'dark';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    bgSoft: string;
    text: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    icon: '🌸',
    colors: {
      primary: '#FF4D79',
      secondary: '#A855F7',
      accent: '#FFB7C5',
      bg: '#0A0A14',
      bgSoft: '#12121F',
      text: '#F1F5F9',
    },
  },
  neon: {
    id: 'neon',
    name: 'Neón',
    icon: '🌈',
    colors: {
      primary: '#A855F7',
      secondary: '#22D3EE',
      accent: '#F472B6',
      bg: '#050510',
      bgSoft: '#0F0F1E',
      text: '#E0E7FF',
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    icon: '💻',
    colors: {
      primary: '#00FF88',
      secondary: '#00D4FF',
      accent: '#FF00A8',
      bg: '#000000',
      bgSoft: '#0A0F0A',
      text: '#00FF88',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark Souls',
    icon: '🌑',
    colors: {
      primary: '#8B4513',
      secondary: '#D4AF37',
      accent: '#C0C0C0',
      bg: '#0D0D0D',
      bgSoft: '#1A1A1A',
      text: '#D4C5B0',
    },
  },
};