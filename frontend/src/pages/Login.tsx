import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/auth';
import { Footer } from '../components/Footer';

export function Login() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const loading = useAuth((s) => s.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'Error al iniciar sesión. Revisa tus datos.',
      );
    }
  };

  const quickLogin = async (quickEmail: string, quickPassword: string) => {
    setError('');
    try {
      await login(quickEmail, quickPassword);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'Error al iniciar sesión.',
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-2">⛩️</div>
            <h1 className="font-display text-4xl text-gradient-sakura">
              Urukais Klick
            </h1>
            <p className="text-slate-400 mt-2">Tu agenda personal anime 🎌</p>
          </div>

          {/* Card */}
          <div className="glass-card p-8">
            <h2 className="font-display text-2xl mb-6 text-center">
              Iniciar sesión
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-anime"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-anime"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? '✨ Cargando...' : 'Entrar'}
              </button>
            </form>

            {/* Acceso rápido con cuentas de prueba */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center mb-3">
                🎌 Accesos rápidos
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('invitado@urukais.kl', 'Invitado2026!')}
                  disabled={loading}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span className="text-sm text-slate-300">Entrar como invitado</span>
                  </div>
                  <span className="text-xs text-slate-500">→</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-slate-400 mt-6">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-sakura-400 hover:text-sakura-300 transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
