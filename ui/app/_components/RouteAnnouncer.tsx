"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Next.js App Router does NOT move focus or announce pages on client-side navigation.
 * This component:
 *   1. On pathname change, moves focus to <main id="main">.
 *   2. Pushes the document title into the polite live region so SR users hear it. (WCAG 2.4.3, 4.1.3)
 *
 * Skips the very first render (initial page load) — the browser handles that natively.
 */
export default function RouteAnnouncer() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const main = document.getElementById("main");
    if (main) main.focus();
    const title = document.title;
    const polite = document.getElementById("live-region-polite");
    if (polite) {
      // Toggle textContent on a microtask boundary so SRs notice the mutation.
      polite.textContent = "";
      requestAnimationFrame(() => {
        polite.textContent = `Navigated to ${title}`;
      });
    }
  }, [pathname]);

  return null;
}
