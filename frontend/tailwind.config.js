/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-purple': '#3b3b58', 
        'light-white': 'rgba(255,255,255,0.18)',
      },
      width: {
        '21': '5.25rem', // 21 units
        '22': '5.5rem',  // 22 units
      },
      
    },
  },
  plugins: [],
}

