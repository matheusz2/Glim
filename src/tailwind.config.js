/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#111827',
          light: '#1F2937',
          dark: '#030712'
        },
        primary: {
          DEFAULT: '#646cff',
          dark: '#4F46E5'
        },
        secondary: {
          DEFAULT: '#52525B'
        }
      },
      container: {
        center: true,
        padding: '1rem'
      }
    },
  },
  plugins: [],
} 