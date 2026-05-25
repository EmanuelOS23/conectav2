import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Paleta extraída do Figma ──────────────────────
        brand: {
          50:  "#e8f0fb",
          100: "#c5d8f5",
          200: "#9dbfee",
          300: "#6fa3e6",
          400: "#4d8fe0",
          500: "#317EDF",
          600: "#254983",
          700: "#1351B4",
          800: "#032A69",
          900: "#022A69",
        },
        // neutros
        neutral: {
          50:  "#F8F8F8",
          100: "#EEEEEE",
          200: "#CCCCCC",
          300: "#AAAAAA",
          400: "#888888",
          500: "#555555",
          600: "#444444",
          700: "#333333",
          800: "#222222",
          900: "#111111",
        },
        // feedback
        success: "#1A7A4A",
        warning: "#F5A623",
        error:   "#CC0000",
        info:    "#1351B4",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        rawline: ["Rawline", "sans-serif"],
        lato:    ["Lato", "sans-serif"],
      },
      borderRadius: {
        input:  "4px",
        card:   "8px",
        cardLg: "14px",
        pill:   "57px",
      },
      boxShadow: {
        header: "0px 1px 6px rgba(0,0,0,0.16)",
        card:   "0px 2px 8px rgba(0,0,0,0.12)",
        modal:  "6px 13px 33.6px rgba(0,0,0,0.25)",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
