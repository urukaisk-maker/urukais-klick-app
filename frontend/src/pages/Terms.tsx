import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 relative z-10">
      <h1 className="font-display text-3xl mb-6">Términos de uso</h1>
      <div className="glass-card p-6 space-y-4 text-sm text-slate-300">
        <p>
          Bienvenido a Urukais Klick. Al acceder y usar esta aplicación, aceptas los siguientes términos:
        </p>
        <h2 className="font-display text-lg mt-6">1. Uso del servicio</h2>
        <p>
          Urukais Klick es una agenda personal con gamificación. El servicio se proporciona "tal cual", sin garantías de disponibilidad continua.
        </p>
        <h2 className="font-display text-lg mt-6">2. Cuenta de usuario</h2>
        <p>
          Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. No nos hacemos responsables del uso no autorizado.
        </p>
        <h2 className="font-display text-lg mt-6">3. Contenido</h2>
        <p>
          El contenido que crees (tareas, notas, hábitos) es tuyo. No lo compartimos con terceros.
        </p>
        <h2 className="font-display text-lg mt-6">4. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado implica aceptación.
        </p>
        <p className="mt-6 text-xs text-slate-500">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>
      </div>
      <Link to="/" className="btn-ghost mt-6 inline-block">← Volver al inicio</Link>
    </div>
  );
}
