/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#0B0C10',
          medium: '#1F2833',
          light: '#66FCF1',
          accent: '#45A29E',
          white: '#FFFFFF',
          gray: '#C5C6C7'
        }
      },
      fontFamily: {
        'gilroy': ['Gilroy', 'sans-serif'],
        'gilroy-bold': ['Gilroy-Bold', 'sans-serif'],
        'gilroy-medium': ['Gilroy-Medium', 'sans-serif'],
        'gilroy-light': ['Gilroy-Light', 'sans-serif']
      },
      fontSize: {
        'heading': ['28px', { lineHeight: '36px' }],
        'subhead': ['20px', { lineHeight: '24px' }],
        'body': ['16px', { lineHeight: '18px' }]
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      }
    }
  },
  plugins: [],
} 