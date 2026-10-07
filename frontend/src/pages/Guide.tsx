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
      { label: 'Recompensa diaria', value: '+10 a +40 🪙' },
      { label: 'Desbloquear logro', value: '+5 a +1000 🪙' },
      { label: 'Regalo flotante', value: '+25 🪙 (cada hora)' },
      { label: 'Subir de nivel', value: '+Nivel × 5 🪙' },
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
];

const TIPS = [
  '💡 Empieza con tareas pequeñas para coger el ritmo',
  '💡 Entra cada día aunque sea 30 segundos para mantener la racha',
  '💡 Los logros de racha dan las mejores recompensas',
  '💡 Usa el calendario para planificar la semana',
  '💡 Completa hábitos a primera hora para motivarte',
  '💡 Ahorra monedas para las skins legendarias de Uru-chan',
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
        <h1 className="font-display text-3xl mb-2">Cómo funciona Urukais</h1>
        <p className="text-slate-400">
          Guía rápida para sacarle todo el partido a tu agenda anime
        </p>
      </div>

      {/* Grid de secciones */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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

            <p className="text-sm text-slate-400 mb-4">{section.description}</p>

            <div className="space-y-1.5">
              {section.details.map((d) => (
                <div
                  key={d.label}
                  className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0"
                >
                  <span className="text-slate-400">{d.label}</span>
                  <span className="text-slate-200 font-medium">{d.value}</span>
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
        <h2 className="font-display text-xl mb-4">✨ Consejos de maestría</h2>
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
            to="/habits"
            className="px-6 py-2 rounded-xl bg-white/20 text-white font-medium border border-white/30 hover:bg-white/30 transition"
          >
            🔥 Nuevo hábito
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
