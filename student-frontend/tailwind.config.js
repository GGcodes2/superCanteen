/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: "#2563eb",
          accent: "#ec4899",
        },
      },
    },
    plugins: [],
  };
  