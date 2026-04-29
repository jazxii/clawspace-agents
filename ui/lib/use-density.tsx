"use client";

/**
 * Density preference — comfortable | compact (ACCESSIBILITY-BRIEF-V2 §1.4).
 * Persisted in localStorage. Sets data-density on <html>.
 */
import { useCallback, useEffect, useState } from "react";
import { liveAnnounce } from "./live-announce";

export type Density = "comfortable" | "compact";
const KEY = "clawspace.density";

export function useDensity() {
  const [density, setDensityState] = useState<Density>("comfortable");

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY) as Density | null;
      if (v === "comfortable" || v === "compact") {
        setDensityState(v);
        document.documentElement.setAttribute("data-density", v);
      }
    } catch { /* ignore */ }
  }, []);

  const setDensity = useCallback((d: Density) => {
    setDensityState(d);
    try { localStorage.setItem(KEY, d); } catch { /* ignore */ }
    document.documentElement.setAttribute("data-density", d);
    liveAnnounce.polite(`Density: ${d}`, "form-feedback");
  }, []);

  return { density, setDensity };
}
