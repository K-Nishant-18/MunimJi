/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep ink navy used for the sidebar / dark surfaces
        ink: {
          950: "#070d1a",
          900: "#0a1424",
          800: "#0f1b31",
          700: "#16233d",
          600: "#1e2f4f",
          500: "#2a4069",
        },
        // Brand: money-green teal with a warm gold companion accent
        brand: {
          50: "#eefbf6",
          100: "#d5f5e9",
          200: "#aeead5",
          300: "#79d9bc",
          400: "#42c19e",
          500: "#1ea785",
          600: "#0f886d",
          700: "#0d6c59",
          800: "#0e5648",
          900: "#0e473d",
        },
        gold: {
          100: "#fef3d9",
          200: "#fce4a6",
          300: "#f9cf68",
          400: "#f6b93c",
          500: "#f0a21c",
          600: "#d47e10",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 20, 36, 0.04), 0 4px 16px rgba(10, 20, 36, 0.04)",
        lift: "0 8px 30px rgba(10, 20, 36, 0.10)",
        glow: "0 0 0 4px rgba(15, 136, 109, 0.12)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.35s ease-out both",
        popIn: "popIn 0.25s ease-out both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
