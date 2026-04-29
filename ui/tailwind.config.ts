import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  // Theme switching via CSS vars + [data-theme] on <html>. Tailwind dark
  // utilities follow the same selector via the strategy below, so v2
  // `dark:` utilities still resolve.
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // v2 surfaces (kept for backward compat)
        canvas: "var(--bg-canvas)",
        surface1: "var(--bg-surface-1)",
        surface2: "var(--bg-surface-2)",
        surface3: "var(--bg-surface-3)",
        body: "var(--text-primary)",
        muted: "var(--text-secondary)",
        subtle: "var(--text-tertiary)",
        brand: "var(--brand-primary)",
        focusring: "var(--focus-ring)",

        // v3 design surfaces
        bg: "var(--bg)",
        elev1: "var(--bg-elev-1)",
        elev2: "var(--bg-elev-2)",
        sunken: "var(--bg-sunken)",
        text1: "var(--text)",
        text2: "var(--text-2)",
        text3: "var(--text-3)",
        text4: "var(--text-4)",

        // v3 multi-accent (per domain)
        "accent-content":  "var(--accent-content)",
        "accent-projects": "var(--accent-projects)",
        "accent-research": "var(--accent-research)",
        "accent-meta":     "var(--accent-meta)",
        "accent-system":   "var(--accent-system)",
        accent:            "var(--accent)",
        "accent-soft":     "var(--accent-soft)",
      },
      borderColor: {
        DEFAULT: "var(--border-default)",
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
        hairline: "var(--hairline)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
        serif: "var(--font-serif)",
        ui: "var(--font-ui)",
      },
      borderRadius: {
        xs: "var(--r-xs)",
        sm: "var(--r-sm)",
        DEFAULT: "var(--r-md)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        "2xl": "var(--r-2xl)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },
    },
  },
  plugins: [],
};

export default config;
