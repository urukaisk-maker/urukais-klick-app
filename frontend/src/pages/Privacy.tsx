import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 relative z-10">
      <h1 className="font-display text-3xl mb-6">Política de privacidad</h1>
      <div className="glass-card p-6 space-y-4 text-sm text-slate-300">
        <p>
          En Urukais Klick nos tomamos en serio tu privacidad. Esta política explica qué datos recogemos y cómo los usamos.
        </p>
        <h2 className="font-display text-lg mt-6">1. Datos que recogemos</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Email y nombre de usuario (para la cuenta)</li>
          <li>Contenido que creas (tareas, notas, hábitos)</li>
          <li>Datos de uso anónimos (para mejorar la app)</li>
        </ul>
        <h2 className="font-display text-lg mt-6">2. Cómo usamos tus datos</h2>
        <p>
          Usamos tus datos exclusivamente para prestarte el servicio. No vendemos ni compartimos tu información con terceros.
        </p>
        <h2 className="font-display text-lg mt-6">3. Seguridad</h2>
        <p>
          Tus datos se almacenan de forma segura con encriptación de contraseñas y conexiones HTTPS.
        </p>
        <h2 className="font-display text-lg mt-6">4. Tus derechos</h2>
        <p>
          Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento.
        </p>
        <p className="mt-6 text-xs text-slate-500">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>
      </div>
      <Link to="/" className="btn-ghost mt-6 inline-block">← Volver al inicio</Link>
    </div>
  );
}
