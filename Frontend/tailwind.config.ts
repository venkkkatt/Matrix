/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-mode-black": "#0c0c0c",
        "matrix-green": "#0fb037",
        "dark-blue-black": "#11001c",
        "stone-grey": "#6a6b70",
      },
    },
  },
  plugins: [],
};
