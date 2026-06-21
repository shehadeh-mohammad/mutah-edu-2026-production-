import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-tajawal)', 'Tajawal', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-tajawal)', 'Tajawal', 'Sora', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#0f2040',
          2: '#142850',
          3: '#0c1a30',
        },
        bg: {
          DEFAULT: '#050d1a',
          2: '#081225',
          3: '#0c1a30',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'flip': 'flip 0.6s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
        spin: 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        'gradient-violet': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        'gradient-surface': 'linear-gradient(135deg, #0f2040, #0c1a30)',
      },
    },
  },
  plugins: [],
}

export default config
