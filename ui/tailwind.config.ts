import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  // We rely on CSS variables (see app/tokens.css) for theme switching, plus
  // a `data-theme` selector strategy via next-themes. Keep Tailwind's default
  // utilities, but disable its dark mode strategy because we drive themes
  // via CSS vars not class swapping.
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface1: "var(--bg-surface-1)",
        surface2: "var(--bg-surface-2)",
        surface3: "var(--bg-surface-3)",
        body: "var(--text-primary)",
        muted: "var(--text-secondary)",
        subtle: "var(--text-tertiary)",
        brand: "var(--brand-primary)",
        focusring: "var(--focus-ring)",
      },
      borderColor: {
        DEFAULT: "var(--border-default)",
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
      },
    },
  },
  plugins: [],
};

export default config;
