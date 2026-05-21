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
        darkBg: '#090d16',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        glassCard: 'rgba(15, 23, 42, 0.65)',
        accentCyan: '#06b6d4',
        accentPurple: '#8b5cf6',
        accentPink: '#ec4899',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glowCyan: '0 0 15px rgba(6, 182, 212, 0.4)',
        glowPurple: '0 0 15px rgba(139, 92, 246, 0.4)'
      }
    },
  },
  plugins: [],
}
