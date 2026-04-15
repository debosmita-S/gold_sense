/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          600: "#d97706",
          800: "#92400e",
        },
      },
    },
  },
  plugins: [],
};
