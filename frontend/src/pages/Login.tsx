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

            {/* Demo hint */}
            <div className="mt-6 p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-center text-xs text-slate-300">
              🎁 Cuenta demo: <br />
              <code className="text-sakura-300">demo@urukais.kl</code> /{' '}
              <code className="text-sakura-300">demo1234</code>
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
