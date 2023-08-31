const colors = require("tailwindcss/colors");
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: "500px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1780px",
      "4xl": "2160px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      fontSize: {
        xs: "0.825rem",
      },
      colors: {
        brand: colors.indigo,
        primary: "rgba(var(--color-primary) / <alpha-value>)",
        dark: "#0D1321",
      },
      fontFamily: {
        body: ["Ubuntu Mono", "monospace"],
      },
      animation: {
        floatingOne: "floatingOne 12s infinite",
        floatingTwo: "floatingTwo 9s infinite",
        floatingThree: "floatingThree 15s infinite",
      },
      keyframes: {
        floatingOne: {
          "0%": { transform: "translateY(-30%)" },
          "50%": { transform: "translateY(10%)" },
          "100%": { transform: "translateY(-30%)" },
        },
        floatingTwo: {
          "0%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(20%)" },
          "100%": { transform: "translateY(0%)" },
        },
        floatingThree: {
          "0%": { transform: "translateY(40%)" },
          "50%": { transform: "translateY(10%)" },
          "100%": { transform: "translateY(40%)" },
        },
      },
    },
  },
  plugins: [nextui(), require("@tailwindcss/typography")],
};
