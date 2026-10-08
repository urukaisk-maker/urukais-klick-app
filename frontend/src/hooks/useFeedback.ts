// ============================================
// 🎊 useFeedback — Confetti + Sonidos generados (sin archivos)
// ============================================

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  // Algunos navegadores suspenden el contexto hasta interacción del usuario
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Genera un tono con envolvente (attack + decay) para que suene bien.
 */
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.15,
  startTime = 0,
) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

  const t0 = ctx.currentTime + startTime;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

// ============================================
// 🎵 Sonidos predefinidos
// ============================================

const SOUNDS = {
  /** Click corto al navegar */
  click: () => {
    playTone(700, 0.06, 'sine', 0.08);
  },

  /** Ding al completar una tarea */
  taskComplete: () => {
    playTone(880, 0.15, 'sine', 0.12);
    playTone(1320, 0.25, 'sine', 0.1, 0.08);
  },

  /** Sonido épico al subir de nivel */
  levelUp: () => {
    playTone(523, 0.15, 'triangle', 0.15, 0);
    playTone(659, 0.15, 'triangle', 0.15, 0.12);
    playTone(784, 0.15, 'triangle', 0.15, 0.24);
    playTone(1047, 0.4, 'triangle', 0.18, 0.36);
  },

  /** Fanfarria al desbloquear un logro */
  achievement: () => {
    playTone(659, 0.1, 'square', 0.12, 0);
    playTone(880, 0.1, 'square', 0.12, 0.1);
    playTone(1047, 0.3, 'square', 0.14, 0.2);
  },

  /** Sonido al comprar en la tienda */
  purchase: () => {
    playTone(523, 0.1, 'sine', 0.12);
    playTone(784, 0.2, 'sine', 0.14, 0.08);
  },

  /** Error suave */
  error: () => {
    playTone(220, 0.15, 'sawtooth', 0.08);
    playTone(180, 0.25, 'sawtooth', 0.08, 0.1);
  },

  /** Nuevo hábito marcado */
  habitCheck: () => {
    playTone(660, 0.1, 'sine', 0.1);
    playTone(990, 0.2, 'sine', 0.12, 0.08);
  },

  /** Recompensa diaria */
  dailyReward: () => {
    playTone(784, 0.12, 'triangle', 0.14, 0);
    playTone(1047, 0.12, 'triangle', 0.14, 0.1);
    playTone(1319, 0.35, 'triangle', 0.16, 0.2);
  },
};

export type FeedbackSound = keyof typeof SOUNDS;

// ============================================
// 🎊 Confetti minimalista (sin librerías)
// ============================================

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'star';
  life: number;
  maxLife: number;
}

const CONFETTI_COLORS = [
  '#FFB7C5', // sakura
  '#A855F7', // purple
  '#22D3EE', // cyan
  '#F472B6', // pink
  '#FBBF24', // yellow
  '#34D399', // green
];

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const outerX = Math.cos(angle) * size;
    const outerY = Math.sin(angle) * size;
    const innerAngle = angle + Math.PI / 5;
    const innerX = Math.cos(innerAngle) * size * 0.5;
    const innerY = Math.sin(innerAngle) * size * 0.5;
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function triggerConfetti(options: {
  count?: number;
  origin?: { x: number; y: number };
  spread?: number;
  velocity?: number;
  duration?: number;
  colors?: string[];
  startFromTop?: boolean;
} = {}) {
  const {
    count = 80,
    origin,
    spread = Math.PI * 2,
    velocity = 12,
    duration = 2000,
    colors = CONFETTI_COLORS,
    startFromTop = false,
  } = options;

  // Crear canvas
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  // Origen por defecto: centro de la pantalla
  const cx = origin?.x ?? window.innerWidth / 2;
  const cy = origin?.y ?? window.innerHeight / 2;

  // Crear partículas
  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = startFromTop
      ? Math.random() * Math.PI + Math.PI // mitad inferior
      : -Math.PI / 2 + (Math.random() - 0.5) * spread;

    const speed = velocity * (0.5 + Math.random() * 0.8);

    particles.push({
      x: startFromTop ? Math.random() * canvas.width : cx,
      y: startFromTop ? -20 : cy,
      vx: Math.cos(angle) * speed * (startFromTop ? 0.5 : 1),
      vy: startFromTop ? Math.random() * 2 + 1 : Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: (['circle', 'square', 'star'] as const)[
        Math.floor(Math.random() * 3)
      ],
      life: 0,
      maxLife: duration,
    });
  }

  const startTime = performance.now();
  const gravity = 0.35;
  const friction = 0.99;

  let raf: number;

  const animate = () => {
    const elapsed = performance.now() - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = 0;

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= friction;
      p.vy *= friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life = elapsed;

      const remaining = 1 - p.life / p.maxLife;
      if (remaining <= 0) continue;
      alive++;

      ctx.globalAlpha = Math.min(1, remaining * 2);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        drawStar(ctx, p.x, p.y, p.size, p.rotation);
      }
    }

    ctx.globalAlpha = 1;

    if (alive > 0 && elapsed < duration) {
      raf = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };

  raf = requestAnimationFrame(animate);
}

// ============================================
// 🎯 Hook principal
// ============================================

export function useFeedback() {
  const enabled =
    typeof window !== 'undefined'
      ? localStorage.getItem('urukais-sound') !== 'off'
      : true;

  const play = (sound: FeedbackSound) => {
    if (!enabled) return;
    try {
      SOUNDS[sound]();
    } catch (e) {
      console.warn('Audio error', e);
    }
  };

  const confetti = {
    /** Confetti central (task complete) */
    burst: () => {
      if (!enabled) return;
      triggerConfetti({
        count: 60,
        velocity: 10,
        duration: 1500,
      });
    },

    /** Confetti desde arriba (level up) */
    rain: () => {
      if (!enabled) return;
      triggerConfetti({
        count: 120,
        startFromTop: true,
        duration: 3000,
      });
    },

    /** Solo un poco (compras, recompensas) */
    sparkle: () => {
      if (!enabled) return;
      triggerConfetti({
        count: 30,
        velocity: 8,
        duration: 1000,
      });
    },

    /** Confetti desde un punto concreto de la pantalla */
    fromElement: (el: HTMLElement) => {
      if (!enabled) return;
      const rect = el.getBoundingClientRect();
      triggerConfetti({
        count: 50,
        origin: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
        velocity: 10,
        duration: 1500,
      });
    },
  };

  const toggleSound = () => {
    const current =
      localStorage.getItem('urukais-sound') !== 'off';
    localStorage.setItem('urukais-sound', current ? 'off' : 'on');
    return !current;
  };

  const isSoundEnabled = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('urukais-sound') !== 'off'
      : true;

  return { play, confetti, toggleSound, isSoundEnabled };
}