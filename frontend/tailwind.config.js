/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#fdf9eb',
          DEFAULT: '#d4af37',
          dark: '#aa8c2c',
        },
        luxury: {
          bg: '#0b0c10',
          card: 'rgba(26, 29, 40, 0.65)',
          border: 'rgba(255, 255, 255, 0.07)',
          accent: '#6366f1',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
