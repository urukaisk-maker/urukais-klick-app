export type NotificationPermission = 'default' | 'granted' | 'denied';

export function getPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isEnabled(): boolean {
  return (
    typeof window !== 'undefined' &&
    localStorage.getItem('urukais-notifications') !== 'off'
  );
}

export function setEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('urukais-notifications', enabled ? 'on' : 'off');
}

export interface ShowNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

export function showNotification(opts: ShowNotificationOptions) {
  if (!isEnabled()) return;
  if (getPermission() !== 'granted') return;
  if (!isSupported()) return;

  try {
    const notification = new Notification(opts.title, {
      body: opts.body,
      icon: opts.icon ?? '/icon-192.png',
      badge: '/icon-192.png',
      tag: opts.tag,
      silent: false,
    });

    if (opts.onClick) {
      notification.onclick = () => {
        window.focus();
        opts.onClick?.();
        notification.close();
      };
    }
  } catch (err) {
    console.warn('Error al mostrar notificación:', err);
  }
}
