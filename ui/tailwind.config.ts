import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Status badge palette — every pair audited ≥7:1 against white/slate-50 (per ACCESSIBILITY-BRIEF §6).
        badge: {
          drafting: { fg: "#1e3a8a", bg: "#dbeafe" },
          ready: { fg: "#14532d", bg: "#dcfce7" },
          posted: { fg: "#475569", bg: "#f1f5f9" },
          inprogress: { fg: "#7c2d12", bg: "#fef3c7" },
          review: { fg: "#581c87", bg: "#f3e8ff" },
          done: { fg: "#14532d", bg: "#dcfce7" },
        },
        severity: {
          info: { fg: "#1e3a8a", bg: "#dbeafe" },
          warning: { fg: "#78350f", bg: "#fef3c7" },
          error: { fg: "#7f1d1d", bg: "#fee2e2" },
        },
        focusring: "#2563eb",
      },
    },
  },
  plugins: [],
};

export default config;
