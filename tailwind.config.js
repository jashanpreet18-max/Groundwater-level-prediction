/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        env: {
          bg: "#090f1d",
          card: "#111c35",
          border: "#1e2d50",
          emerald: "#10b981",
          teal: "#14b8a6",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          warning: "#f59e0b",
          danger: "#ef4444",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
}
