const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    './src/layouts/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '500px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1780px',
      '4xl': '2160px', // only need to control product grid mode in ultra 4k device
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        brand: colors.teal,
        primary: 'rgba(var(--color-primary) / <alpha-value>)',
        dark: '#0D1321',
      },
      fontFamily: {
        body: ['Fira Code', 'monospace'],
      },
      animation: {
        floatingOne: 'floatingOne 12s infinite',
        floatingTwo: 'floatingTwo 9s infinite',
        floatingThree: 'floatingThree 15s infinite',
      },
      keyframes: {
        floatingOne: {
          '0%': { transform: 'translateY(-30%)' },
          '50%': { transform: 'translateY(10%)' },
          '100%': { transform: 'translateY(-30%)' },
        },
        floatingTwo: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(20%)' },
          '100%': { transform: 'translateY(0%)' },
        },
        floatingThree: {
          '0%': { transform: 'translateY(40%)' },
          '50%': { transform: 'translateY(10%)' },
          '100%': { transform: 'translateY(40%)' },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}