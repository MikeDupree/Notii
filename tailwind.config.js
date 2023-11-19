/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/App.tsx", "./src/components/**/*.{tsx,jsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      ringWidth: {
        DEFAULT: 0,
      },
    },
  },
  plugins: [],
};
