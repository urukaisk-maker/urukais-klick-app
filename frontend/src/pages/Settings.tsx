import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useFeedback } from '../hooks/useFeedback';
import { THEMES, type ThemeId } from '../types';
import { useTheme } from '../store/theme';

interface Session {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  expiresAt: string;
}

const TABS = [
  { id: 'profile', label: 'Perfil', icon: '👤' },
  { id: 'security', label: 'Seguridad', icon: '🔒' },
  { id: 'preferences', label: 'Preferencias', icon: '🎨' },
  { id: 'sessions', label: 'Sesiones', icon: '📱' },
];

export function Settings() {
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refreshUser);
  const logoutAll = useAuth((s) => s.logoutAll);
  const currentTheme = useTheme((s) => s.currentTheme);
  const setTheme = useTheme((s) => s.setTheme);
  const { play, confetti } = useFeedback();

  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Formularios
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [prefsForm, setPrefsForm] = useState({
    language: 'es',
    timezone: 'Europe/Madrid',
    soundEnabled: true,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName ?? '',
        bio: user.bio ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
      setPrefsForm({
        language: user.language,
        timezone: user.timezone,
        soundEnabled: user.soundEnabled,
      });
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'sessions') {
      api.get<Session[]>('/auth/sessions').then((r) => setSessions(r.data));
    }
  }, [tab]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/users/me', profileForm);
      await refreshUser();
      showToast('✨ Perfil actualizado');
      play('click');
      confetti.sparkle();
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message ?? 'Error'));
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('❌ Las contraseñas no coinciden');
      return;
    }
    try {
      await api.post('/users/me/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('🔐 Contraseña cambiada. Vuelve a iniciar sesión.');
      play('levelUp');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message ?? 'Error'));
    }
  };

  const handleSavePrefs = async (e: FormEvent) => {
    e.preventDefault();
    await api.patch('/users/me', prefsForm);
    await refreshUser();
    showToast('✨ Preferencias guardadas');
    play('click');
  };

  const handleLogoutAll = async () => {
    if (!confirm('¿Cerrar sesión en TODOS los dispositivos?')) return;
    await logoutAll();
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl">⚙️ Ajustes</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configura tu cuenta y preferencias
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              tab === t.id
                ? 'bg-gradient-sakura text-white shadow-glow-pink'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Perfil */}
      {tab === 'profile' && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="font-display text-xl mb-4">👤 Mi perfil</h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-sakura flex items-center justify-center text-3xl shadow-glow-pink overflow-hidden">
              {profileForm.avatarUrl ? (
                <img
                  src={profileForm.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                '👤'
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">
                URL del avatar
              </label>
              <input
                type="url"
                value={profileForm.avatarUrl}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    avatarUrl: e.target.value,
                  })
                }
                className="input-anime"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={profileForm.displayName}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  displayName: e.target.value,
                })
              }
              className="input-anime"
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Bio
            </label>
            <textarea
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm({ ...profileForm, bio: e.target.value })
              }
              rows={3}
              className="input-anime resize-none"
              maxLength={200}
            />
          </div>

          <div className="pt-3 border-t border-white/10 text-xs text-slate-500">
            Email: <span className="text-slate-300">{user.email}</span> ·{' '}
            Usuario: <span className="text-slate-300">@{user.username}</span>
          </div>

          <button type="submit" className="btn-primary w-full">
            Guardar cambios ✨
          </button>
        </motion.form>
      )}

      {/* Tab: Seguridad */}
      {tab === 'security' && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleChangePassword}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="font-display text-xl mb-4">🔒 Cambiar contraseña</h2>

          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300 mb-4">
            ⚠️ Al cambiar la contraseña, se cerrarán TODAS tus sesiones activas.
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="input-anime"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              minLength={10}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="input-anime"
              placeholder="10+ chars, MAYÚS, min, número, símbolo"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              className="input-anime"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Cambiar contraseña 🔐
          </button>
        </motion.form>
      )}

      {/* Tab: Preferencias */}
      {tab === 'preferences' && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSavePrefs}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="font-display text-xl mb-4">🎨 Preferencias</h2>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Tema visual
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as ThemeId)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    currentTheme === t.id
                      ? 'bg-gradient-sakura text-white shadow-glow-pink'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Idioma
            </label>
            <select
              value={prefsForm.language}
              onChange={(e) =>
                setPrefsForm({ ...prefsForm, language: e.target.value })
              }
              className="input-anime"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English (pronto)</option>
              <option value="ja">🇯🇵 日本語 (pronto)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Zona horaria
            </label>
            <select
              value={prefsForm.timezone}
              onChange={(e) =>
                setPrefsForm({ ...prefsForm, timezone: e.target.value })
              }
              className="input-anime"
            >
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="Europe/London">Londres (GMT)</option>
              <option value="America/Mexico_City">Ciudad de México</option>
              <option value="America/New_York">Nueva York</option>
              <option value="America/Bogota">Bogotá</option>
              <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
              <option value="Asia/Tokyo">Tokio</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefsForm.soundEnabled}
              onChange={(e) =>
                setPrefsForm({
                  ...prefsForm,
                  soundEnabled: e.target.checked,
                })
              }
              className="w-4 h-4 accent-sakura-500"
            />
            <span className="text-sm">🔊 Activar sonidos</span>
          </label>

          <button type="submit" className="btn-primary w-full">
            Guardar preferencias ✨
          </button>
        </motion.form>
      )}

      {/* Tab: Sesiones */}
      {tab === 'sessions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-display text-xl">📱 Sesiones activas</h2>
              <button
                onClick={handleLogoutAll}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm hover:bg-red-500/30 transition-all"
              >
                🚪 Cerrar todas
              </button>
            </div>

            {sessions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No hay sesiones activas
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="text-2xl">💻</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {s.userAgent ?? 'Dispositivo desconocido'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.ip ?? 'IP desconocida'} ·{' '}
                        {new Date(s.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                    {i === 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Actual
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-sakura px-6 py-3 rounded-2xl shadow-glow-pink z-50"
          >
            <p className="font-medium text-white text-sm">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
