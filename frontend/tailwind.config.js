/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0F19',
          card: '#131B2E',
          surface: '#1E293B',
          border: '#2A374F',
          muted: '#94A3B8',
          text: '#F8FAFC',
          primary: '#10E57A', // Electric Lime
          primaryHover: '#05DF72',
          blue: '#38BDF8',
          purple: '#A855F7',
          gold: '#F59E0B',
          flame: '#F97316',
          danger: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-lime': '0 0 20px -3px rgba(16, 229, 122, 0.35)',
        'glow-purple': '0 0 20px -3px rgba(168, 85, 247, 0.35)',
        'glow-blue': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
