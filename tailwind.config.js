/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#2D1B69',
          'purple-dark': '#1A0F3C',
          'purple-mid': '#3D2580',
          'purple-light': '#5B3FA8',
          accent: '#7C5CDB',
          'accent-light': '#9B7EF0',
          blue: '#4A90D9',
          'blue-light': '#6BAEE8',
          teal: '#00C9A7',
          amber: '#F5A623',
          red: '#E85454',
          green: '#4CAF50',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
