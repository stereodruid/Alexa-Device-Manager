/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aura: '#00d2ff',
        bgDark: '#0f172a',
        panel: '#1e293b',
      }
    },
  },
  plugins: [],
}
