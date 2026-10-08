// prisma/seed.ts
import { PrismaClient, Rank, Rarity, ItemType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// 🗂️ CATEGORÍAS + SUBCATEGORÍAS
// ============================================

const CATEGORIES = [
  { name: 'Vida Diaria', slug: 'vida-diaria', icon: '🌸', color: '#FFB7C5', subs: [
    { name: 'Rutinas matutinas', slug: 'rutinas-matutinas', icon: '☀️' },
    { name: 'Diario personal', slug: 'diario-personal', icon: '📔' },
  ]},
  { name: 'Estudio', slug: 'estudio', icon: '📚', color: '#A855F7', subs: [
    { name: 'Tareas escolares', slug: 'tareas-escolares', icon: '✏️' },
    { name: 'Cursos online', slug: 'cursos-online', icon: '💻' },
  ]},
  { name: 'Trabajo', slug: 'trabajo', icon: '💼', color: '#22D3EE', subs: [
    { name: 'Reuniones', slug: 'reuniones', icon: '🗣️' },
    { name: 'Deadlines', slug: 'deadlines', icon: '⏰' },
  ]},
  { name: 'Salud & Bienestar', slug: 'salud', icon: '💖', color: '#F472B6', subs: [
    { name: 'Ejercicio', slug: 'ejercicio', icon: '🏃' },
    { name: 'Meditación', slug: 'meditacion', icon: '🧘' },
  ]},
  { name: 'Ocio & Gaming', slug: 'ocio', icon: '🎮', color: '#818CF8', subs: [
    { name: 'Backlog gaming', slug: 'backlog-gaming', icon: '🕹️' },
    { name: 'Anime temporada', slug: 'anime-temporada', icon: '📺' },
  ]},
  { name: 'Finanzas', slug: 'finanzas', icon: '💰', color: '#FBBF24', subs: [
    { name: 'Presupuesto mensual', slug: 'presupuesto-mensual', icon: '📊' },
    { name: 'Ahorros', slug: 'ahorros', icon: '🏦' },
  ]},
  { name: 'Creatividad', slug: 'creatividad', icon: '🎨', color: '#FB7185', subs: [
    { name: 'Sketchbook', slug: 'sketchbook', icon: '🖌️' },
  ]},
  { name: 'Social', slug: 'social', icon: '👥', color: '#34D399', subs: [
    { name: 'Cumpleaños', slug: 'cumpleanos', icon: '🎂' },
  ]},
  { name: 'Alimentación', slug: 'alimentacion', icon: '🍜', color: '#F59E0B', subs: [
    { name: 'Recetas favoritas', slug: 'recetas-favoritas', icon: '🍳' },
  ]},
  { name: 'Metas & Sueños', slug: 'metas', icon: '⛩️', color: '#EF4444', subs: [] },
  
  { name: 'Cocina', slug: 'cocina', icon: '🍳', color: '#F59E0B', subs: [
    { name: 'Recetas favoritas', slug: 'recetas-favoritas', icon: '⭐' },
    { name: 'Ideas para cenar', slug: 'ideas-cena', icon: '🌙' },
    { name: 'Postres', slug: 'postres', icon: '🍰' },
  ]},

  // === NUEVAS CATEGORÍAS ANIME ===
  { name: 'Anime & Manga', slug: 'anime-manga', icon: '📺', color: '#F472B6', subs: [
    { name: 'Por ver', slug: 'anime-por-ver', icon: '🎬' },
    { name: 'Favoritos', slug: 'anime-favoritos', icon: '⭐' },
  ]},
  { name: 'Japón & Cultura', slug: 'japon-cultura', icon: '🗾', color: '#EF4444', subs: [
    { name: 'Idioma japonés', slug: 'idioma-japones', icon: '🈶' },
    { name: 'Cocina japonesa', slug: 'cocina-japonesa', icon: '🍱' },
  ]},
  { name: 'Cosplay & Eventos', slug: 'cosplay', icon: '🎭', color: '#A855F7', subs: [
    { name: 'Convenciones', slug: 'convenciones', icon: '🎪' },
    { name: 'Trajes', slug: 'trajes', icon: '👘' },
  ]},
  { name: 'Coleccionismo', slug: 'coleccionismo', icon: '🎴', color: '#FBBF24', subs: [
    { name: 'Figuras', slug: 'figuras', icon: '🗿' },
    { name: 'Cartas TCG', slug: 'cartas-tcg', icon: '🃏' },
  ]},
  { name: 'Streaming & Pod', slug: 'streaming', icon: '🎙️', color: '#22D3EE', subs: [
    { name: 'Directos', slug: 'directos', icon: '🔴' },
    { name: 'Ideas contenido', slug: 'ideas-contenido', icon: '💡' },
  ]},
  { name: 'Idiomas', slug: 'idiomas', icon: '🌐', color: '#34D399', subs: [
    { name: 'Vocabulario', slug: 'vocabulario', icon: '📖' },
    { name: 'Práctica', slug: 'practica-idioma', icon: '🗣️' },
  ]},
  { name: 'Mascotas', slug: 'mascotas', icon: '🐾', color: '#FB7185', subs: [
    { name: 'Cuidados', slug: 'cuidados-mascota', icon: '💊' },
    { name: 'Paseos', slug: 'paseos', icon: '🦮' },
  ]},
  { name: 'Viajes & Aventura', slug: 'viajes', icon: '✈️', color: '#818CF8', subs: [
    { name: 'Destinos soñados', slug: 'destinos', icon: '🗺️' },
    { name: 'Packing', slug: 'packing', icon: '🎒' },
  ]},
  { name: 'Hogar & Orden', slug: 'hogar', icon: '🏠', color: '#F59E0B', subs: [
    { name: 'Limpieza', slug: 'limpieza', icon: '🧹' },
    { name: 'Compras', slug: 'compras-hogar', icon: '🛍️' },
  ]},
  { name: 'Zen & Mindfulness', slug: 'zen', icon: '🧘', color: '#06B6D4', subs: [
    { name: 'Meditación Zen', slug: 'meditacion-zen', icon: '🕉️' },
    { name: 'Gratitud', slug: 'gratitud', icon: '🙏' },
  ]},
];

// ============================================
// 🎮 NIVELES (1-60)
// ============================================

function rankForLevel(level: number): Rank {
  if (level <= 5) return Rank.GENIN;
  if (level <= 15) return Rank.CHUNIN;
  if (level <= 30) return Rank.JONIN;
  if (level <= 50) return Rank.ANBU;
  return Rank.HOKAGE;
}

const RANK_TITLES: Record<Rank, string> = {
  [Rank.GENIN]: 'Genin de la Hoja',
  [Rank.CHUNIN]: 'Chunin Estratega',
  [Rank.JONIN]: 'Jonin de Élite',
  [Rank.ANBU]: 'ANBU Sombrío',
  [Rank.HOKAGE]: 'Hokage Legendario',
};

function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 100 * n + 10 * n * n;
}

const LEVELS = Array.from({ length: 60 }, (_, i) => {
  const level = i + 1;
  const rank = rankForLevel(level);
  return {
    level,
    xpRequired: xpRequiredForLevel(level),
    rank,
    title: `${RANK_TITLES[rank]} Nv.${level}`,
    rewardCoins: level * 5,
    badgeUrl: null,
  };
});

// ============================================
// 🏆 LOGROS
// ============================================

const ACHIEVEMENTS = [
  { code: 'first_task', name: '¡Primera misión!', description: 'Completa tu primera tarea', icon: '⚔️', rarity: Rarity.COMMON, xpReward: 50, coinReward: 10, requirement: { type: 'TASKS_COMPLETED', count: 1 } },
  { code: 'first_note', name: 'Diario del ninja', description: 'Escribe tu primera nota', icon: '📔', rarity: Rarity.COMMON, xpReward: 30, coinReward: 5, requirement: { type: 'NOTES_CREATED', count: 1 } },
  { code: 'first_pomodoro', name: 'Modo concentración', description: 'Completa tu primer pomodoro', icon: '🍅', rarity: Rarity.COMMON, xpReward: 40, coinReward: 8, requirement: { type: 'POMODOROS_DONE', count: 1 } },
  { code: 'first_habit', name: 'Semilla plantada', description: 'Crea tu primer hábito', icon: '🌱', rarity: Rarity.COMMON, xpReward: 30, coinReward: 5, requirement: { type: 'HABITS_CREATED', count: 1 } },
  { code: 'tasks_10', name: 'Aprendiz', description: 'Completa 10 tareas', icon: '🥉', rarity: Rarity.COMMON, xpReward: 100, coinReward: 20, requirement: { type: 'TASKS_COMPLETED', count: 10 } },
  { code: 'tasks_100', name: 'Veterano', description: 'Completa 100 tareas', icon: '🥈', rarity: Rarity.RARE, xpReward: 500, coinReward: 100, requirement: { type: 'TASKS_COMPLETED', count: 100 } },
  { code: 'tasks_500', name: 'Maestro de misiones', description: 'Completa 500 tareas', icon: '🥇', rarity: Rarity.EPIC, xpReward: 2000, coinReward: 500, requirement: { type: 'TASKS_COMPLETED', count: 500 } },
  { code: 'streak_3d', name: 'En racha', description: '3 días consecutivos activo', icon: '🔥', rarity: Rarity.COMMON, xpReward: 60, coinReward: 15, requirement: { type: 'STREAK_DAYS', days: 3 } },
  { code: 'streak_7d', name: 'Semana de fuego', description: '7 días consecutivos activo', icon: '🔥', rarity: Rarity.RARE, xpReward: 200, coinReward: 50, requirement: { type: 'STREAK_DAYS', days: 7 } },
  { code: 'streak_30d', name: 'Mes imparable', description: '30 días consecutivos activo', icon: '💥', rarity: Rarity.EPIC, xpReward: 1000, coinReward: 250, requirement: { type: 'STREAK_DAYS', days: 30 } },
  { code: 'streak_100d', name: 'Leyenda viviente', description: '100 días consecutivos activo', icon: '👑', rarity: Rarity.LEGENDARY, xpReward: 5000, coinReward: 1000, requirement: { type: 'STREAK_DAYS', days: 100 } },
  { code: 'level_5', name: 'Genin prometedor', description: 'Alcanza el nivel 5', icon: '🍥', rarity: Rarity.COMMON, xpReward: 100, coinReward: 20, requirement: { type: 'LEVEL_REACHED', level: 5 } },
  { code: 'level_10', name: 'Chunin', description: 'Alcanza el nivel 10', icon: '🎖️', rarity: Rarity.RARE, xpReward: 300, coinReward: 75, requirement: { type: 'LEVEL_REACHED', level: 10 } },
  { code: 'level_25', name: 'Jonin', description: 'Alcanza el nivel 25', icon: '🏅', rarity: Rarity.EPIC, xpReward: 800, coinReward: 200, requirement: { type: 'LEVEL_REACHED', level: 25 } },
  { code: 'level_50', name: 'Hokage', description: 'Alcanza el nivel 50', icon: '🔥', rarity: Rarity.LEGENDARY, xpReward: 3000, coinReward: 800, requirement: { type: 'LEVEL_REACHED', level: 50 } },
  { code: 'pomodoro_10', name: 'Concentrado', description: '10 pomodoros completados', icon: '⏱️', rarity: Rarity.COMMON, xpReward: 100, coinReward: 25, requirement: { type: 'POMODOROS_DONE', count: 10 } },
  { code: 'pomodoro_100', name: 'Mente de acero', description: '100 pomodoros completados', icon: '🧠', rarity: Rarity.EPIC, xpReward: 1000, coinReward: 300, requirement: { type: 'POMODOROS_DONE', count: 100 } },
  { code: 'habit_30d', name: 'Hábito forjado', description: '30 días seguidos con un hábito', icon: '⚒️', rarity: Rarity.RARE, xpReward: 500, coinReward: 150, requirement: { type: 'HABIT_STREAK', days: 30 } },
  { code: 'goal_completed', name: 'Sueño cumplido', description: 'Completa tu primera meta', icon: '🌟', rarity: Rarity.RARE, xpReward: 500, coinReward: 150, requirement: { type: 'GOALS_COMPLETED', count: 1 } },
  { code: 'shop_first', name: 'Consumista ninja', description: 'Primera compra en la tienda', icon: '🛒', rarity: Rarity.COMMON, xpReward: 50, coinReward: 0, requirement: { type: 'PURCHASES_MADE', count: 1 } },
];

// ============================================
// 🛒 TIENDA
// ============================================

const SHOP_ITEMS = [
  { code: 'theme_sakura', name: 'Tema Sakura', description: 'Rosa suave con pétalos flotando', icon: '🌸', price: 500, type: ItemType.THEME, payload: { themeId: 'sakura' } },
  { code: 'theme_neon', name: 'Tema Neón', description: 'Colores cyberpunk neón brillantes', icon: '🌈', price: 800, type: ItemType.THEME, payload: { themeId: 'neon' } },
  { code: 'theme_cyber', name: 'Tema Cyber', description: 'Estilo hacker con glitches', icon: '💻', price: 1000, type: ItemType.THEME, payload: { themeId: 'cyber' } },
  { code: 'theme_dark', name: 'Tema Dark Souls', description: 'Oscuro, minimalista y elegante', icon: '🌑', price: 600, type: ItemType.THEME, payload: { themeId: 'dark' } },
  { code: 'skin_kitsune_sakura', name: 'Uru-chan Sakura', description: 'Skin rosa con pétalos', icon: '🦊', price: 1200, type: ItemType.MASCOT_SKIN, payload: { skin: 'sakura' } },
  { code: 'skin_kitsune_neon', name: 'Uru-chan Neón', description: 'Skin brillante cyberpunk', icon: '🦊', price: 1500, type: ItemType.MASCOT_SKIN, payload: { skin: 'neon' } },
  { code: 'skin_kitsune_shadow', name: 'Uru-chan Sombra', description: 'Skin oscura y misteriosa', icon: '🦊', price: 2000, type: ItemType.MASCOT_SKIN, payload: { skin: 'shadow' } },
  { code: 'avatar_samurai', name: 'Avatar Samurái', description: 'Guerrero honorable con katana', icon: '⚔️', price: 400, type: ItemType.AVATAR, payload: { avatar: 'samurai' } },
  { code: 'avatar_mage', name: 'Avatar Mago', description: 'Sabio de las artes arcanas', icon: '🧙', price: 400, type: ItemType.AVATAR, payload: { avatar: 'mage' } },
  { code: 'avatar_ninja', name: 'Avatar Ninja', description: 'Silencioso y letal', icon: '🥷', price: 400, type: ItemType.AVATAR, payload: { avatar: 'ninja' } },
  { code: 'sticker_neko', name: 'Sticker Neko', description: 'Gatito kawaii para tus tareas', icon: '🐱', price: 150, type: ItemType.STICKER, payload: { sticker: 'neko' } },
  { code: 'sticker_dragon', name: 'Sticker Dragón', description: 'Dragón épico para misiones difíciles', icon: '🐉', price: 300, type: ItemType.STICKER, payload: { sticker: 'dragon' } },
  { code: 'sticker_ramen', name: 'Sticker Ramen', description: 'Tazón humeante para pausas', icon: '🍜', price: 150, type: ItemType.STICKER, payload: { sticker: 'ramen' } },
  { code: 'boost_xp_2x', name: 'Boost XP x2 (24h)', description: 'Duplica tu XP durante 24 horas', icon: '⚡', price: 2000, type: ItemType.BOOST, payload: { multiplier: 2, durationHours: 24 } },
  { code: 'boost_coins_2x', name: 'Boost Monedas x2 (24h)', description: 'Duplica tus monedas durante 24h', icon: '💰', price: 2000, type: ItemType.BOOST, payload: { multiplier: 2, durationHours: 24 } },
];

// ============================================
// 🚀 SEED PRINCIPAL
// ============================================

async function main() {
  console.log('🌱 Iniciando seed de Urukais Klick...\n');

  // --- Usuario demo CON MONEDAS DE REGALO ---
  const passwordHash = await bcrypt.hash('demo1234', 10);
    const demo = await prisma.user.upsert({
    where: { email: 'demo@urukais.kl' },
    update: {
      coins: 500,
      displayName: 'Urukais',
    },
    create: {
      email: 'demo@urukais.kl',
      username: 'urukais_demo',
      passwordHash,
      displayName: 'Urukais',
      bio: 'Cuenta de demostración ✨',
      emailVerified: true,
      coins: 500,
    },
  });
  console.log(`✅ Usuario demo: ${demo.email} (pass: demo1234) · 🎁 500 monedas de regalo`);

  // --- Categorías + subcategorías ---
  for (const [i, cat] of CATEGORIES.entries()) {
    const category = await prisma.category.upsert({
      where: { userId_slug: { userId: demo.id, slug: cat.slug } },
      update: { name: cat.name, icon: cat.icon, color: cat.color, order: i },
      create: {
        userId: demo.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        order: i,
        isDefault: true,
      },
    });

    for (const [j, sub] of cat.subs.entries()) {
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
        update: { name: sub.name, icon: sub.icon, order: j },
        create: {
          userId: demo.id,
          categoryId: category.id,
          name: sub.name,
          slug: sub.slug,
          icon: sub.icon,
          order: j,
        },
      });
    }
  }
  const totalSubs = CATEGORIES.reduce((a, c) => a + c.subs.length, 0);
  console.log(`✅ ${CATEGORIES.length} categorías + ${totalSubs} subcategorías`);

  // --- Niveles ---
  for (const lvl of LEVELS) {
    await prisma.levelConfig.upsert({
      where: { level: lvl.level },
      update: lvl,
      create: lvl,
    });
  }
  console.log(`✅ ${LEVELS.length} niveles configurados`);

  // --- Logros ---
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });
  }
  console.log(`✅ ${ACHIEVEMENTS.length} logros`);

  // --- Tienda ---
  for (const item of SHOP_ITEMS) {
    await prisma.shopItem.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
  }
  console.log(`✅ ${SHOP_ITEMS.length} items de tienda`);

  // --- Mascota inicial ---
  await prisma.mascot.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id, name: 'Uru-chan', species: 'kitsune' },
  });
  console.log(`✅ Mascota Uru-chan creada para el demo`);

  console.log('\n🎌 ¡Seed completado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
