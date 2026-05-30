/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          bg: '#F5F7FB',
          card: '#FFFFFF',
          dark: '#111827',
          gray: '#6B7280',
          success: '#22C55E',
          danger: '#EF4444',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
