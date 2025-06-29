/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base-100': '#1D232A', // Dark background
        'base-200': '#2A323C', // Slightly lighter card background
        'base-300': '#4A5568', // Borders and dividers
        'accent': '#34D399',   // Vibrant green
        'text-main': '#E5E7EB', // Primary text
        'text-secondary': '#9CA3AF', // Subtitles and secondary text
      }
    },
  },
  plugins: [],
}