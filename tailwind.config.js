/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#097185',
          light: 'rgba(9,113,133,.08)',
          dark: '#065E70',
        },
        accent: {
          DEFAULT: '#0066CC',
          light: '#EFF6FF',
          dark: '#0052A3',
        },
        ok: '#059669',
        wa: '#D97706',
        er: '#DC2626',
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-out forwards',
        slideUp: 'slideUp 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}