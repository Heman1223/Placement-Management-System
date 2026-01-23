/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'auth-bg': '#0f172a',
        'auth-card': '#1e293b/50',
        'auth-input': '#0f172a',
        'primary-blue': '#2563eb',
        'primary-blue-hover': '#1d4ed8',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
