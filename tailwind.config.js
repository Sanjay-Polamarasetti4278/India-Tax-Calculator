/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
        'new-regime': '#2563EB',
        'old-regime': '#7C3AED',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
