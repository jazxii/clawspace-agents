"use client";

/**
 * Clawspace UI v3 Tweaks store.
 *
 * Tweaks set [data-theme/density/radius/sidebar] on <html> and CSS vars
 * (--accent, --accent-soft, --font-ui). Persisted to localStorage and
 * synced across tabs via the `storage` event.
 */

import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";
export type AccentKey = "projects" | "content" | "research" | "meta" | "red";
export type Density = "compact" | "regular" | "spacious";
export type Radius = "sharp" | "regular" | "soft";
export type SidebarStyle = "full" | "rail";
export type FontFamily = "sans" | "mono" | "serif";

export interface Tweaks {
  theme: Theme;
  accent: AccentKey;
  density: Density;
  radius: Radius;
  sidebarStyle: SidebarStyle;
  fontFamily: FontFamily;
}

export const TWEAK_DEFAULTS: Tweaks = {
  theme: "light",
  accent: "projects",
  density: "regular",
  radius: "regular",
  sidebarStyle: "full",
  fontFamily: "sans",
};

const ACCENT_VAR: Record<AccentKey, string> = {
  projects: "var(--accent-projects)",
  content: "var(--accent-content)",
  research: "var(--accent-research)",
  meta: "var(--accent-meta)",
  red: "var(--accent-system)",
};

const FONT_VAR: Record<FontFamily, string> = {
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
  serif: "var(--font-serif)",
};

const STORAGE_KEY = "clawspace.tweaks";

function readStored(): Tweaks {
  if (typeof window === "undefined") return TWEAK_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return TWEAK_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Tweaks>;
    return { ...TWEAK_DEFAULTS, ...parsed };
  } catch {
    return TWEAK_DEFAULTS;
  }
}

function applyToDOM(t: Tweaks) {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  r.setAttribute("data-theme", t.theme);
  r.setAttribute("data-density", t.density);
  r.setAttribute("data-radius", t.radius);
  r.setAttribute("data-sidebar", t.sidebarStyle);
  r.style.setProperty("--accent", ACCENT_VAR[t.accent] ?? ACCENT_VAR.projects);
  r.style.setProperty(
    "--accent-soft",
    `color-mix(in srgb, ${ACCENT_VAR[t.accent] ?? ACCENT_VAR.projects} 14%, transparent)`,
  );
  r.style.setProperty("--font-ui", FONT_VAR[t.fontFamily] ?? FONT_VAR.sans);
}

export function useTweaks() {
  const [t, setT] = useState<Tweaks>(TWEAK_DEFAULTS);

  useEffect(() => {
    const initial = readStored();
    setT(initial);
    applyToDOM(initial);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const next = { ...TWEAK_DEFAULTS, ...JSON.parse(e.newValue) } as Tweaks;
        setT(next);
        applyToDOM(next);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTweak = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setT((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      applyToDOM(next);
      return next;
    });
  }, []);

  return [t, setTweak] as const;
}
