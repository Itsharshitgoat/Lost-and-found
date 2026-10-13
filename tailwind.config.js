/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#FAF9F5',
        'brand-text': '#222222',
        'brand-primary': '#38685F',
        'brand-secondary': '#56877D',
        'brand-surface': '#FFFFFF',
        'brand-neutral': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}