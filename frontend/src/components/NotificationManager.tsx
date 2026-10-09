import { useEffect } from 'react';
import { useAuth } from '../store/auth';
import { isEnabled, showNotification } from '../hooks/useNotifications';

export function NotificationManager() {
  const user = useAuth((s) => s.user);

  // NO pedimos permiso automáticamente (Chrome lo bloquea).
  // Se pide desde Ajustes → Preferencias → Notificaciones.

  // Comprobar racha diaria al cargar
  useEffect(() => {
    if (!user) return;
    if (!isEnabled()) return;

    const checkStreak = () => {
      const lastCheck = localStorage.getItem('urukais-last-streak-check');
      const today = new Date().toDateString();

      if (lastCheck === today) return;

      const lastDate = user.lastStreakDate
        ? new Date(user.lastStreakDate).toDateString()
        : null;

      if (lastDate && lastDate !== today) {
        showNotification({
          title: '🔥 ¡Mantén tu racha!',
          body: `Llevas ${user.currentStreak} días. ¡No la pierdas!`,
          tag: 'streak-reminder',
        });
      }

      localStorage.setItem('urukais-last-streak-check', today);
    };

    const t = setTimeout(checkStreak, 5000);
    return () => clearTimeout(t);
  }, [user]);

  return null;
}
