"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { liveAnnounce } from "@/lib/live-announce";

/**
 * Route announcer — ACCESSIBILITY-BRIEF-V2 §0 (revised: announce title +
 * breadcrumb tail). Moves focus to <main id="main"> on every client-side
 * navigation, then announces "{title}".
 *
 * Skips first render so initial load uses native browser announcement.
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
    liveAnnounce.polite(`Navigated to ${document.title}`, "route-change");
  }, [pathname]);

  return null;
}
