/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5A3E2B',
        primaryDark: '#3E2A1E',
        cream: '#F4EDE4',
        card: '#E8D8C3',
        accent: '#C6A969',
        border: '#D7C2AE',
        text: '#2C1B12',
        muted: '#8B6F5A',
        success: '#16a34a',
        error: '#dc2626',
        warning: '#d97706',
        ring: 'rgba(90, 62, 43, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
