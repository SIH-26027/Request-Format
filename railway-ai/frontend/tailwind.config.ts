import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          dark: "#0f172a",
          navy: "#1e293b",
          steel: "#334155",
          muted: "#64748b",
          border: "#cbd5e1",
          surface: "#f8fafc",
          card: "#ffffff",
          primary: "#1d4ed8",
          primaryHover: "#1e40af",
        },
        dept: {
          engineering: "#b45309",      // Warm bronze / track earth
          engineeringBg: "#fef3c7",
          trd: "#0284c7",              // Electric / Traction cyan-blue
          trdBg: "#e0f2fe",
          snt: "#7c3aed",              // Signal violet
          sntBg: "#ede9fe",
        }
      },
      fontFamily: {
        sans: [
          "Segoe UI",
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
        mono: [
          "Consolas",
          "Monaco",
          "Courier New",
          "monospace"
        ]
      }
    },
  },
  plugins: [],
};
export default config;
