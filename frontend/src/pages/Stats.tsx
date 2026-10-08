import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '../lib/api';

interface StatsResponse {
  user: {
    xp: number;
    level: number;
    coins: number;
    currentStreak: number;
    longestStreak: number;
    createdAt: string;
  };
  dailyStats: Array<{
    date: string;
    tasksCompleted: number;
    xpEarned: number;
    coinsEarned: number;
    habitsCompleted: number;
    notesCreated: number;
    pomodorosDone: number;
  }>;
  tasksByCategory: Array<{
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    count: number;
  }>;
  habitsProgress: Array<{
    date: string;
    count: number;
    completed: boolean;
  }>;
}

export function Stats() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<StatsResponse>('/stats/overview')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-4xl animate-pulse">📊</div>
      </div>
    );
  }

  const last30Days = data.dailyStats.slice(0, 30).reverse();
  const weeklyData = buildWeeklyData(data.dailyStats);

  const totalStats = data.dailyStats.reduce(
    (acc, d) => ({
      tasks: acc.tasks + d.tasksCompleted,
      xp: acc.xp + d.xpEarned,
      notes: acc.notes + d.notesCreated,
      pomodoros: acc.pomodoros + d.pomodorosDone,
    }),
    { tasks: 0, xp: 0, notes: 0, pomodoros: 0 },
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl">📊 Estadísticas</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tu progreso en Urukais Klick
        </p>
      </motion.div>

      {/* Stats destacadas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="⚡"
          label="XP Total"
          value={data.user.xp}
          color="from-purple-500 to-purple-700"
        />
        <StatCard
          icon="✅"
          label="Tareas totales"
          value={totalStats.tasks}
          color="from-pink-500 to-pink-700"
        />
        <StatCard
          icon="🔥"
          label="Racha actual"
          value={`${data.user.currentStreak} días`}
          color="from-orange-500 to-red-600"
        />
        <StatCard
          icon="🏆"
          label="Racha máxima"
          value={`${data.user.longestStreak} días`}
          color="from-yellow-500 to-amber-600"
        />
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <h2 className="font-display text-lg mb-4">
          🗓️ Actividad (últimos 6 meses)
        </h2>
        <Heatmap data={data.dailyStats} />
      </motion.div>

      {/* XP semanal + Tareas por categoría */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="font-display text-lg mb-4">📈 XP por semana</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #ffffff20',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="xp"
                stroke="#FF4D79"
                strokeWidth={3}
                dot={{ fill: '#FF4D79', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="font-display text-lg mb-4">🍩 Tareas por categoría</h2>
          {data.tasksByCategory.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">
              Sin datos todavía
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.tasksByCategory}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.tasksByCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #ffffff20',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {data.tasksByCategory.slice(0, 6).map((c) => (
                  <div
                    key={c.categoryId}
                    className="flex items-center gap-1.5 text-xs text-slate-300"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>
                      {c.icon} {c.name} ({c.count})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Tareas últimos 30 días */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="font-display text-lg mb-4">📊 Últimos 30 días</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={last30Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={10}
              tickFormatter={(d: any) =>
                new Date(String(d)).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }
            />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #ffffff20',
                borderRadius: '12px',
              }}
              labelFormatter={(d: any) =>
                new Date(String(d)).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              }
            />
            <Bar
              dataKey="tasksCompleted"
              fill="#A855F7"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

// ============================================
// Componentes auxiliares
// ============================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass-card p-4">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg mb-2`}
      >
        {icon}
      </div>
      <p className="text-2xl font-display">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function buildWeeklyData(dailyStats: StatsResponse['dailyStats']) {
  const weeks: Record<string, number> = {};
  for (const d of dailyStats) {
    const date = new Date(d.date);
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    const key = `${year}-W${weekNum}`;
    weeks[key] = (weeks[key] ?? 0) + d.xpEarned;
  }

  const sorted = Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  return sorted.map(([week, xp]) => ({
    week: week.split('-W')[1],
    xp,
  }));
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function Heatmap({ data }: { data: StatsResponse['dailyStats'] }) {
  const weeks: Array<Array<{ date: string; count: number } | null>> = [];
  let currentWeek: Array<{ date: string; count: number } | null> = [];

  const dateMap = new Map<string, number>();
  for (const d of data) {
    const key = new Date(d.date).toISOString().split('T')[0];
    dateMap.set(key, (dateMap.get(key) ?? 0) + d.tasksCompleted);
  }

  const start = new Date();
  start.setDate(start.getDate() - 180);
  const dayOfWeek = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayOfWeek);

  const cursor = new Date(start);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  while (cursor <= today) {
    const key = cursor.toISOString().split('T')[0];
    const count = dateMap.get(key) ?? 0;
    currentWeek.push({ date: key, count });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const maxCount = Math.max(...Array.from(dateMap.values()), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    const ratio = count / maxCount;
    if (ratio < 0.25) return 'bg-sakura-500/30';
    if (ratio < 0.5) return 'bg-sakura-500/50';
    if (ratio < 0.75) return 'bg-sakura-500/70';
    return 'bg-sakura-500';
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-fit">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${
                  day ? getColor(day.count) : 'bg-transparent'
                }`}
                title={
                  day
                    ? `${new Date(day.date).toLocaleDateString('es-ES')}: ${day.count} tareas`
                    : ''
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-white/5" />
          <div className="w-3 h-3 rounded-sm bg-sakura-500/30" />
          <div className="w-3 h-3 rounded-sm bg-sakura-500/50" />
          <div className="w-3 h-3 rounded-sm bg-sakura-500/70" />
          <div className="w-3 h-3 rounded-sm bg-sakura-500" />
        </div>
        <span>Más</span>
      </div>
    </div>
  );
}