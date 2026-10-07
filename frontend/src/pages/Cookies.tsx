import { Link } from 'react-router-dom';

export function Cookies() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 relative z-10">
      <h1 className="font-display text-3xl mb-6">Política de cookies</h1>
      <div className="glass-card p-6 space-y-4 text-sm text-slate-300">
        <p>
          Urukais Klick utiliza cookies para mejorar tu experiencia. Aquí te explicamos qué son y cómo las usamos.
        </p>
        <h2 className="font-display text-lg mt-6">1. ¿Qué son las cookies?</h2>
        <p>
          Son pequeños archivos que se almacenan en tu navegador para recordar tus preferencias.
        </p>
        <h2 className="font-display text-lg mt-6">2. Cookies que usamos</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Esenciales:</strong> para el funcionamiento de la sesión (login).</li>
          <li><strong>De preferencias:</strong> para recordar tu tema y configuración.</li>
          <li><strong>Analíticas:</strong> para entender cómo se usa la app (anónimas).</li>
        </ul>
        <h2 className="font-display text-lg mt-6">3. Control de cookies</h2>
        <p>
          Puedes aceptar o rechazar las cookies no esenciales desde el banner de cookies o desde la configuración de tu navegador.
        </p>
        <h2 className="font-display text-lg mt-6">4. Cookies de terceros</h2>
        <p>
          No usamos cookies de terceros para publicidad.
        </p>
        <p className="mt-6 text-xs text-slate-500">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>
      </div>
      <Link to="/" className="btn-ghost mt-6 inline-block">← Volver al inicio</Link>
    </div>
  );
}
