import { useMemo } from 'react';

interface Petal {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}

export function SakuraParticles({ count = 20 }: { count?: number }) {
  const petals: Petal[] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 10,
        size: 12 + Math.random() * 16,
        opacity: 0.4 + Math.random() * 0.4,
      })),
    [count],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall-petal"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            fontSize: `${p.size}px`,
            filter: 'drop-shadow(0 0 4px rgba(255, 77, 121, 0.5))',
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
}
