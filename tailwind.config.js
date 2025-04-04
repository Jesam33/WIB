/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}', 
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f3f0fe',
          100: '#e0d9fd',
          200: '#c1b3fb',
          300: '#a38df9',
          400: '#8567f8',
          500: '#9C84F6',  // your main color
          600: '#7b68c5',
          700: '#5a4c94',
          800: '#3a3163',
          900: '#1a1632',
        },
      },
    },
  },
  plugins: [],
}