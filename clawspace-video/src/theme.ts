/**
 * Clawspace design tokens, ported from ui/app/tokens.css
 * Dark theme (the showcase uses the dark canvas for a premium feel).
 */
export const theme = {
  // Surfaces
  bg: "#0b0b0d",
  bgElev1: "#1c1c1e",
  bgElev2: "#2c2c2e",
  bgSunken: "#131315",
  // Text
  text: "#f5f5f7",
  text2: "#d1d1d6",
  text3: "#98989d",
  text4: "#6e6e73",
  // Hairlines / borders
  border: "rgba(255,255,255,.10)",
  borderStrong: "rgba(255,255,255,.18)",
  hairline: "rgba(255,255,255,.06)",
  // Domain accents (five hues)
  content: "#ff9f0a", // orange
  projects: "#0a84ff", // blue
  research: "#bf5af2", // violet
  meta: "#30d158", // green
  system: "#ff453a", // red
  // Fonts
  fontSans:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif",
  fontMono: "'SF Mono', 'JetBrains Mono', ui-monospace, Menlo, monospace",
} as const;

export type DomainAccent = "content" | "projects" | "research" | "meta" | "system";

export const accentFor = (d: DomainAccent): string => theme[d];

/** Tier ring colors (from AgentAvatar). */
export const tierColor: Record<number, string> = {
  4: "#ffd60a",
  3: "#bf5af2",
  2: "#0a84ff",
  1: "#8e8e93",
};

/** Mix an accent with transparent, mimicking color-mix(... 14%). */
export const softAccent = (hex: string, pct = 16): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${pct / 100})`;
};

/** color-mix(in srgb, accent X%, light text) — pill foreground on dark. */
export const mixWithText = (hex: string, pct = 60): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const t = (c: number, target: number) =>
    Math.round((c * pct + target * (100 - pct)) / 100);
  return `rgb(${t(r, 245)}, ${t(g, 245)}, ${t(b, 247)})`;
};
