/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#fff5f7',
          100: '#ffe4ea',
          200: '#ffc9d6',
          300: '#ffa3bb',
          400: '#ff7ba0',
          500: '#ff4d79',
          600: '#e63560',
          700: '#c2214c',
          800: '#a01840',
          900: '#7c1033',
        },
        neon: {
          purple: '#a855f7',
          cyan: '#22d3ee',
          pink: '#f472b6',
          green: '#34d399',
          yellow: '#fbbf24',
        },
        ink: {
          950: '#07070f',
          900: '#0a0a14',
          800: '#12121f',
          700: '#1a1a2e',
          600: '#252540',
          500: '#3a3a5c',
          400: '#5a5a7c',
        },
      },
      fontFamily: {
        display: ['"Mochiy Pop One"', 'sans-serif'],
        serif: ['"Sawarabi Mincho"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 77, 121, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.5)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-sakura': 'linear-gradient(135deg, #ff4d79 0%, #a855f7 100%)',
        'gradient-neon': 'linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        'fall-petal': {
          '0%': {
            transform: 'translateY(-10vh) translateX(0) rotate(0deg)',
            opacity: '0',
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': {
            transform: 'translateY(110vh) translateX(100px) rotate(360deg)',
            opacity: '0',
          },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 77, 121, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 77, 121, 0.9)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'fall-petal': 'fall-petal 10s linear infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
