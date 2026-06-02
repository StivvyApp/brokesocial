import type { Config } from 'tailwindcss'
 
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#0a0a0a',
        'off-white': '#f2efe8',
        cream: '#e8e2d5',
        green: {
          DEFAULT: '#b8f060',
          dark: '#8fc43a',
          muted: 'rgba(184,240,96,0.15)',
        },
        card: '#141414',
        border: '#2a2a2a',
        muted: '#888880',
        red: '#ff4d4d',
        orange: '#ff8c42',
      },
      fontFamily: {
        sans: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        serif: ['var(--font-instrument-serif)', 'serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        lg: '10px',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease forwards',
        'slide-in': 'slideIn 0.25s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
 
export default config
