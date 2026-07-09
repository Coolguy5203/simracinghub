import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          1: '#161b26',
          2: '#1e2535',
          3: '#252d40',
        },
        accent: {
          DEFAULT: '#e8322a',
          hover: '#c42820',
          muted: '#7a1a15',
        },
        border: '#2a3347',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 24px 0 rgba(232, 50, 42, 0.15)' },
          '50%': { boxShadow: '0 0 42px 4px rgba(232, 50, 42, 0.3)' },
        },
        'speed-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        ticker: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'speed-line': 'speed-line 2.8s ease-in-out infinite',
        ticker: 'ticker 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
