import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/auth';
import { Footer } from '../components/Footer';

export function Register() {
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);
  const loading = useAuth((s) => s.loading);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al crear la cuenta');
    }
  };

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-2">✨</div>
            <h1 className="font-display text-4xl text-gradient-sakura">
              Únete a Urukais
            </h1>
            <p className="text-slate-400 mt-2">Empieza tu aventura anime</p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-2xl mb-6 text-center">
              Crear cuenta
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  className="input-anime"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  required
                  minLength={3}
                  className="input-anime"
                  placeholder="urukais_chan"
                />
              </div>

                            <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  minLength={10}
                  className="input-anime"
                  placeholder="Mínimo 10 caracteres"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Debe tener: 10+ caracteres, 1 MAYÚSCULA, 1 minúscula, 1 número
                  y 1 símbolo (!@#$%...)
                </p>

                {/* Indicador de fortaleza */}
                {form.password.length > 0 && (
                  <PasswordStrength password={form.password} />
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  minLength={8}
                  className="input-anime"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? '✨ Creando...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-sakura-400 hover:text-sakura-300 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = {
    length: password.length >= 10,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>_\-\[\]\/\\+=~`;]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < score ? colors[score - 1] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
        <span className={checks.length ? 'text-green-400' : ''}>
          {checks.length ? '✓' : '○'} 10+ chars
        </span>
        <span className={checks.upper ? 'text-green-400' : ''}>
          {checks.upper ? '✓' : '○'} A-Z
        </span>
        <span className={checks.lower ? 'text-green-400' : ''}>
          {checks.lower ? '✓' : '○'} a-z
        </span>
        <span className={checks.number ? 'text-green-400' : ''}>
          {checks.number ? '✓' : '○'} 0-9
        </span>
        <span className={checks.symbol ? 'text-green-400' : ''}>
          {checks.symbol ? '✓' : '○'} !@#
        </span>
      </div>
      {score > 0 && (
        <p className="text-[10px] mt-1 text-slate-400">
          {labels[score - 1]}
        </p>
      )}
    </div>
  );
}
