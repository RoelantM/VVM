/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { neon: { DEFAULT: '#39ff88', soft: '#7dffb0', deep: '#00c25a' } },
      fontFamily: { display: ['"Barlow Condensed"', 'Impact', 'Arial Narrow Bold', 'sans-serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { neon: '0 0 40px -8px rgba(57,255,136,.55)' },
    },
  },
  plugins: [],
}
