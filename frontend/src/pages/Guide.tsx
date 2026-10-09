import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    icon: '⚡',
    title: 'XP y Niveles',
    color: 'from-purple-500 to-purple-700',
    description:
      'Cada vez que completas una tarea ganas XP. Al acumular suficiente, subes de nivel y desbloqueas nuevos rangos.',
    details: [
      { label: 'Tarea Fácil', value: '10 XP' },
      { label: 'Tarea Normal', value: '15 XP' },
      { label: 'Tarea Difícil', value: '20 XP' },
      { label: 'Tarea Jefe', value: '30 XP' },
      { label: 'Hábito completado', value: '5 XP' },
      { label: 'Pomodoro (25 min)', value: '15 XP' },
      { label: 'Meta completada', value: '200 XP' },
      { label: 'Recompensa diaria', value: '20-70 XP' },
    ],
  },
  {
    icon: '🎖️',
    title: 'Rangos Ninja',
    color: 'from-pink-500 to-pink-700',
    description:
      'Tu nivel determina tu rango. Sube como los ninjas de la Hoja.',
    details: [
      { label: 'Genin', value: 'Niveles 1-5' },
      { label: 'Chunin', value: 'Niveles 6-15' },
      { label: 'Jonin', value: 'Niveles 16-30' },
      { label: 'ANBU', value: 'Niveles 31-50' },
      { label: 'Hokage', value: 'Nivel 51+' },
    ],
  },
  {
    icon: '💰',
    title: 'Monedas',
    color: 'from-yellow-500 to-orange-600',
    description:
      'Las monedas son tu divisa en la tienda. Las ganas de varias formas:',
    details: [
      { label: 'Completar tarea', value: '+5 a +20 🪙' },
      { label: 'Pomodoro', value: '+3 🪙' },
      { label: 'Recompensa diaria', value: '+10 a +40 🪙' },
      { label: 'Desbloquear logro', value: '+5 a +1000 🪙' },
      { label: 'Regalo flotante', value: '+25 🪙 (cada hora)' },
      { label: 'Subir de nivel', value: '+Nivel × 5 🪙' },
      { label: 'Completar meta', value: '+50 🪙' },
    ],
  },
  {
    icon: '🏆',
    title: 'Logros',
    color: 'from-amber-400 to-amber-600',
    description:
      'Los logros son medallas que desbloqueas al cumplir hitos. Se clasifican por rareza:',
    details: [
      { label: '⚪ Común', value: 'Fáciles de conseguir' },
      { label: '🔵 Raro', value: 'Requieren esfuerzo' },
      { label: '🟣 Épico', value: 'Dedicación real' },
      { label: '🟠 Legendario', value: 'Muy difíciles' },
      { label: '🌈 Mítico', value: 'Casi imposibles' },
    ],
  },
  {
    icon: '🔥',
    title: 'Streaks (Rachas)',
    color: 'from-red-500 to-orange-600',
    description:
      'Entra cada día para mantener tu racha. Cuantos más días seguidos, mejores recompensas.',
    details: [
      { label: 'Día 1', value: '+20 XP · +10 🪙' },
      { label: 'Día 3', value: '+35 XP · +19 🪙' },
      { label: 'Día 7', value: '+55 XP · +31 🪙' },
      { label: 'Día 10+', value: '+70 XP · +40 🪙' },
      { label: 'Si rompes la racha', value: 'Vuelves a día 1 😢' },
    ],
  },
  {
    icon: '🍅',
    title: 'Pomodoro',
    color: 'from-red-400 to-pink-600',
    description:
      'Técnica de concentración: 25 min de trabajo + 5 min de descanso. Cada 4 pomodoros, descanso largo.',
    details: [
      { label: '🍅 Clásico', value: '25 / 5 / 15 min' },
      { label: '⚡ Rápido', value: '15 / 3 / 10 min' },
      { label: '🌊 Profundo', value: '50 / 10 / 20 min' },
      { label: 'Al completar', value: '+15 XP · +3 🪙' },
      { label: 'Notificación', value: 'Aviso al terminar' },
    ],
  },
  {
    icon: '📝',
    title: 'Notas y Diario',
    color: 'from-cyan-500 to-blue-600',
    description:
      'Escribe notas, ideas o entradas de diario con estado de ánimo.',
    details: [
      { label: '📝 Notas', value: 'Rápidas e informales' },
      { label: '📔 Diario', value: 'Entradas personales' },
      { label: '8 moods', value: '😊😢😡😴🤔🔥💖😎' },
      { label: '📌 Fijar', value: 'Las importantes arriba' },
    ],
  },
  {
    icon: '🎯',
    title: 'Metas y Sueños',
    color: 'from-orange-500 to-red-600',
    description:
      'Define metas a corto, largo plazo o de vida. Divídelas en hitos.',
    details: [
      { label: '⚡ Corto plazo', value: 'Días o semanas' },
      { label: '🎯 Largo plazo', value: 'Meses o un año' },
      { label: '🌟 Meta de vida', value: 'Sueño personal' },
      { label: 'Progreso', value: 'Se calcula por hitos' },
      { label: 'Al 100%', value: '+200 XP · +50 🪙' },
    ],
  },
  {
    icon: '🦊',
    title: 'Tu Mascota',
    color: 'from-pink-400 to-purple-500',
    description:
      'Uru-chan es tu compañera virtual. Cuídala para que te dé suerte.',
    details: [
      { label: '🍙 Alimentar', value: '-5 🪙 · +25 hambre' },
      { label: '🎾 Jugar', value: '+15 felicidad · -10 energía' },
      { label: '😴 Descansar', value: '+25 energía' },
      { label: 'Stats decaen', value: 'Con el tiempo real' },
    ],
  },
  {
    icon: '🛒',
    title: 'Tienda',
    color: 'from-cyan-500 to-blue-600',
    description:
      'Gasta tus monedas en cosméticos y mejoras. Los items son tuyos para siempre.',
    details: [
      { label: '🎨 Temas', value: 'Cambian colores de la app' },
      { label: '🏷️ Stickers', value: 'Aparecen al completar tareas' },
      { label: '👤 Avatares', value: 'Tu foto de perfil' },
      { label: '🦊 Skins mascota', value: 'Cambia el look de Uru-chan' },
      { label: '⚡ Boosts', value: 'Duplican XP/monedas 24h' },
    ],
  },
  {
    icon: '📅',
    title: 'Calendario',
    color: 'from-indigo-500 to-purple-600',
    description:
      'Visualiza tus tareas y eventos en un calendario. Cada punto es algo importante.',
    details: [
      { label: 'Punto rosa', value: 'Tarea con fecha límite' },
      { label: 'Punto de color', value: 'Evento personalizado' },
      { label: 'Clic en día', value: 'Ver y crear eventos' },
      { label: 'Navega meses', value: '← → para cambiar' },
    ],
  },
  {
    icon: '🔍',
    title: 'Buscador Global',
    color: 'from-pink-500 to-rose-600',
    description:
      'Encuentra cualquier cosa en tu agenda con Ctrl+K.',
    details: [
      { label: 'Atajo', value: 'Ctrl+K o Cmd+K' },
      { label: 'Busca en', value: 'Tareas, notas, eventos, categorías, hábitos' },
      { label: 'Navegación', value: '↑ ↓ para moverse, Enter para abrir' },
      { label: 'Cerrar', value: 'ESC' },
    ],
  },
  {
    icon: '📊',
    title: 'Estadísticas',
    color: 'from-emerald-500 to-cyan-600',
    description:
      'Visualiza tu progreso con gráficos y un heatmap tipo GitHub.',
    details: [
      { label: '🗓️ Heatmap', value: 'Últimos 6 meses de actividad' },
      { label: '📈 XP semanal', value: 'Evolución de tu XP' },
      { label: '🍩 Categorías', value: 'Tareas por categoría' },
      { label: '📊 30 días', value: 'Tareas completadas' },
    ],
  },
  {
    icon: '🎨',
    title: 'Temas Visuales',
    color: 'from-fuchsia-500 to-purple-600',
    description:
      'Cambia el look de Urukais con 4 temas dinámicos.',
    details: [
      { label: '🌸 Sakura', value: 'Rosa + morado (defecto)' },
      { label: '🌈 Neón', value: 'Cyberpunk brillante' },
      { label: '💻 Cyber', value: 'Hacker verde neón' },
      { label: '🌑 Dark Souls', value: 'Oscuro elegante' },
    ],
  },
  {
    icon: '📱',
    title: 'Instalar como App',
    color: 'from-blue-500 to-indigo-600',
    description:
      'Urukais Klick es una PWA. Instálala en tu móvil o PC.',
    details: [
      { label: 'Chrome/Edge', value: 'Menú → Instalar aplicación' },
      { label: 'iOS Safari', value: 'Compartir → Añadir a inicio' },
      { label: 'Android', value: 'Menú → Añadir a pantalla inicio' },
      { label: 'Firefox', value: 'No soporta PWA de escritorio' },
      { label: 'Ventaja', value: 'Funciona como app nativa' },
    ],
  },
  {
    icon: '🔔',
    title: 'Notificaciones',
    color: 'from-violet-500 to-purple-600',
    description:
      'Activa las notificaciones del navegador para no perder el ritmo.',
    details: [
      { label: 'Activar', value: 'Ajustes → Preferencias' },
      { label: 'Avisos', value: 'Fin de Pomodoro, racha diaria' },
      { label: 'Permiso', value: 'Chrome pregunta una vez' },
    ],
  },
];

const TIPS = [
  '💡 Empieza con tareas pequeñas para coger el ritmo',
  '💡 Entra cada día aunque sea 30 segundos para mantener la racha',
  '💡 Los logros de racha dan las mejores recompensas',
  '💡 Usa el calendario para planificar la semana',
  '💡 Completa hábitos a primera hora para motivarte',
  '💡 Usa Pomodoro para tareas que requieren concentración',
  '💡 Divide metas grandes en hitos pequeños',
  '💡 Escribe en el diario para reflexionar',
  '💡 Ahorra monedas para las skins legendarias de Uru-chan',
  '💡 Usa Ctrl+K para buscar cualquier cosa rápido',
];

export function Guide() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl mb-4"
        >
          📖
        </motion.div>
        <h1 className="font-display text-3xl mb-2">
          Cómo funciona Urukais
        </h1>
        <p className="text-slate-400">
          Guía completa de tu agenda personal anime
        </p>
      </div>

      {/* Grid de secciones */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-2xl`}
              >
                {section.icon}
              </div>
              <h2 className="font-display text-lg">{section.title}</h2>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              {section.description}
            </p>

            <div className="space-y-1.5">
              {section.details.map((d) => (
                <div
                  key={d.label}
                  className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0"
                >
                  <span className="text-slate-400">{d.label}</span>
                  <span className="text-slate-200 font-medium text-right ml-2">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="font-display text-xl mb-4">
          ✨ Consejos de maestría
        </h2>
        <ul className="space-y-2 text-sm">
          {TIPS.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-slate-300 hover:text-slate-100 transition-colors"
            >
              {tip}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Atajos de teclado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="font-display text-xl mb-4">
          ⌨️ Atajos de teclado
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            { key: 'Ctrl + K', action: 'Buscador global' },
            { key: 'ESC', action: 'Cerrar modales' },
            { key: '↑ ↓', action: 'Navegar resultados' },
            { key: 'Enter', action: 'Abrir resultado' },
            { key: 'Ctrl + Shift + R', action: 'Recarga dura' },
            { key: 'F12', action: 'Abrir DevTools' },
          ].map((s) => (
            <div
              key={s.key}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
            >
              <kbd className="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">
                {s.key}
              </kbd>
              <span className="text-xs text-slate-400">{s.action}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center p-6 rounded-2xl bg-gradient-sakura shadow-glow-pink"
      >
        <p className="font-display text-lg mb-3 text-white">
          ¿Listo para empezar tu aventura? 🎌
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            to="/tasks"
            className="px-6 py-2 rounded-xl bg-white text-sakura-600 font-medium hover:scale-105 transition-transform"
          >
            ✅ Crear tarea
          </Link>
          <Link
            to="/pomodoro"
            className="px-6 py-2 rounded-xl bg-white text-sakura-600 font-medium hover:scale-105 transition-transform"
          >
            🍅 Pomodoro
          </Link>
          <Link
            to="/goals"
            className="px-6 py-2 rounded-xl bg-white/20 text-white font-medium border border-white/30 hover:bg-white/30 transition"
          >
            🎯 Nueva meta
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
