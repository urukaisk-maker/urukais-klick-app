import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Task } from '../types';

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  color: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
}

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const COLOR_OPTIONS = [
  '#A855F7', '#22D3EE', '#F472B6', '#34D399', '#FBBF24', '#EF4444',
];

export function Calendar() {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    color: '#A855F7',
    time: '18:00',
    duration: 60,
  });

  const { rangeStart, rangeEnd, gridDays } = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const startWeekday = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(start.getDate() - startWeekday);

    const endWeekday = (last.getDay() + 6) % 7;
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - endWeekday));

    const days: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return { rangeStart: start, rangeEnd: end, gridDays: days };
  }, [current]);

  const load = async () => {
    const [e, t] = await Promise.all([
      api.get<Event[]>('/events', {
        params: {
          from: rangeStart.toISOString(),
          to: rangeEnd.toISOString(),
        },
      }),
      api.get<Task[]>('/tasks'),
    ]);
    setEvents(e.data);
    setTasks(t.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart.toISOString(), rangeEnd.toISOString()]);

  const itemsByDay = useMemo(() => {
    const map: Record<string, { events: Event[]; tasks: Task[] }> = {};

    const keyOf = (d: Date) => {
      const dd = new Date(d);
      dd.setHours(0, 0, 0, 0);
      return dd.toISOString().split('T')[0];
    };

    for (const ev of events) {
      const key = keyOf(new Date(ev.startAt));
      if (!map[key]) map[key] = { events: [], tasks: [] };
      map[key].events.push(ev);
    }
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = keyOf(new Date(t.dueDate));
      if (!map[key]) map[key] = { events: [], tasks: [] };
      map[key].tasks.push(t);
    }
    return map;
  }, [events, tasks]);

  const prevMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
  };

  const nextMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    setCurrent(d);
  };

  const today = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    setCurrent(d);
  };

  const handleDayClick = (day: Date) => {
    setSelected(day.toISOString().split('T')[0]);
    setShowForm(false);
  };

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const [hh, mm] = form.time.split(':').map(Number);
    const start = new Date(selected + 'T00:00:00');
    start.setHours(hh, mm, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + form.duration);

    await api.post('/events', {
      title: form.title,
      description: form.description || undefined,
      location: form.location || undefined,
      color: form.color,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });

    setForm({
      title: '',
      description: '',
      location: '',
      color: '#A855F7',
      time: '18:00',
      duration: 60,
    });
    setShowForm(false);
    load();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Borrar este evento?')) return;
    await api.delete(`/events/${id}`);
    load();
  };

  const selectedDate = selected ? new Date(selected + 'T00:00:00') : null;
  const selectedKey = selected;
  const selectedItems = selectedKey ? itemsByDay[selectedKey] : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">📅 Calendario</h1>
          <p className="text-sm text-slate-400 mt-1">
            {MONTHS_ES[current.getMonth()]} {current.getFullYear()}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="btn-ghost">
            ←
          </button>
          <button onClick={today} className="btn-ghost">
            Hoy
          </button>
          <button onClick={nextMonth} className="btn-ghost">
            →
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="md:col-span-2 glass-card p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_ES.map((d) => (
              <div
                key={d}
                className="text-center text-xs text-slate-400 font-medium py-2"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((day) => {
              const key = day.toISOString().split('T')[0];
              const items = itemsByDay[key];
              const isCurrentMonth = day.getMonth() === current.getMonth();
              const isToday =
                day.toDateString() === new Date().toDateString();
              const isSelected = selectedKey === key;
              const eventCount = items?.events.length ?? 0;
              const taskCount =
                items?.tasks.filter((t) => t.status !== 'COMPLETED').length ??
                0;

              return (
                <button
                  key={key}
                  onClick={() => handleDayClick(day)}
                  className={`relative aspect-square rounded-xl p-1.5 text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-sakura text-white shadow-glow-pink'
                      : isToday
                        ? 'bg-sakura-500/20 border border-sakura-500/50'
                        : 'hover:bg-white/5'
                  } ${isCurrentMonth ? '' : 'opacity-30'}`}
                >
                  <span className={`text-xs ${isSelected ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </span>

                  <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                    {eventCount > 0 && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: isSelected
                            ? '#fff'
                            : items!.events[0].color,
                        }}
                      />
                    )}
                    {taskCount > 0 && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white/70' : 'bg-sakura-400'
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-neon-purple" />
              Eventos
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-sakura-400" />
              Tareas con fecha
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="glass-card p-4 h-fit md:sticky md:top-4">
          {!selectedDate ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <p className="text-4xl mb-3">📅</p>
              <p>Selecciona un día para ver o crear eventos</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg">
                    {selectedDate.getDate()} de{' '}
                    {MONTHS_ES[selectedDate.getMonth()]}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {DAYS_ES[(selectedDate.getDay() + 6) % 7]}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary text-xs"
                >
                  {showForm ? '✕' : '+ Evento'}
                </button>
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateEvent}
                    className="space-y-3 mb-4 overflow-hidden"
                  >
                    <input
                      required
                      placeholder="Título del evento"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="input-anime text-sm"
                    />
                    <input
                      placeholder="Lugar (opcional)"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className="input-anime text-sm"
                    />
                    <textarea
                      placeholder="Descripción (opcional)"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={2}
                      className="input-anime text-sm resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={form.time}
                        onChange={(e) =>
                          setForm({ ...form, time: e.target.value })
                        }
                        className="input-anime text-sm"
                      />
                      <select
                        value={form.duration}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            duration: Number(e.target.value),
                          })
                        }
                        className="input-anime text-sm"
                      >
                        <option value={30}>30 min</option>
                        <option value={60}>1 hora</option>
                        <option value={90}>1.5 h</option>
                        <option value={120}>2 horas</option>
                        <option value={180}>3 horas</option>
                        <option value={480}>Todo el día</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setForm({ ...form, color: c })}
                          className={`w-7 h-7 rounded-full transition-transform ${
                            form.color === c
                              ? 'scale-125 ring-2 ring-white'
                              : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full text-sm"
                    >
                      Crear evento ✨
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {selectedItems?.tasks
                  .filter((t) => t.status !== 'COMPLETED')
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded-lg bg-sakura-500/10 border border-sakura-500/30 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        <span className="flex-1 truncate">{t.title}</span>
                      </div>
                    </div>
                  ))}

                {selectedItems?.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded-lg border text-xs group relative"
                    style={{
                      backgroundColor: `${ev.color}15`,
                      borderColor: `${ev.color}60`,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-1 self-stretch rounded-full shrink-0"
                        style={{ backgroundColor: ev.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ev.title}</p>
                        <p className="text-slate-400 mt-0.5">
                          {new Date(ev.startAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ·{' '}
                          {new Date(ev.endAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {ev.location && (
                          <p className="text-slate-500 truncate">
                            📍 {ev.location}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                {!selectedItems?.events.length &&
                  !selectedItems?.tasks.filter(
                    (t) => t.status !== 'COMPLETED',
                  ).length && (
                    <p className="text-xs text-slate-500 text-center py-4">
                      Nada para este día
                    </p>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
