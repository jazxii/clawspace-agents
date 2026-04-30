"use client";

/**
 * Top nav — Apple-native, multi-accent.
 *
 * Replaces the v2 sidebar. 13 routes from `lib/route-meta.ts`. Each tab is
 * a real <a> (Next.js Link) with `aria-current="page"` for the active route.
 *
 * Mobile (<720px): nav-tabs scroll horizontally, search collapses to icon,
 * budget pill hides — handled in globals.css media queries.
 */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES, DOMAIN_COLOR, matchRoute } from "@/lib/route-meta";
import { Icon } from "./Icon";
import { useTweaks } from "@/lib/use-tweaks";
import { useMode } from "@/lib/use-mode";

interface BudgetSnapshot {
  used: number;
  cap: number;
  pct: number;
}

export default function TopNav() {
  const pathname = usePathname();
  const active = matchRoute(pathname ?? "/");
  const [t, setTweak] = useTweaks();
  const { setMode } = useMode();

  const [budget, setBudget] = React.useState<BudgetSnapshot | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/budget")
      .then((r) => r.json())
      .then((d: BudgetSnapshot) => { if (!cancelled) setBudget(d); })
      .catch(() => { /* silent — pill simply hides if missing */ });
    return () => { cancelled = true; };
  }, []);

  const openPalette = React.useCallback(() => setMode("palette"), [setMode]);
  const toggleTheme = React.useCallback(() => {
    setTweak("theme", t.theme === "dark" ? "light" : "dark");
  }, [t.theme, setTweak]);

  return (
    <header className="cs-nav" role="banner">
      <div className="cs-traffic" aria-hidden="true">
        <i style={{ background: "#ff5f57" }} />
        <i style={{ background: "#febc2e" }} />
        <i style={{ background: "#28c840" }} />
      </div>

      <div className="cs-brand">
        <span className="cs-brand-mark" aria-hidden="true" />
        <span>Clawspace</span>
      </div>

      <nav className="cs-nav-tabs" aria-label="Primary">
        {ROUTES.map((r) => {
          const isActive = active?.id === r.id;
          return (
            <Link
              key={r.id}
              href={r.href}
              className="cs-nav-tab"
              data-active={isActive ? "1" : "0"}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="dot"
                aria-hidden="true"
                style={{ background: DOMAIN_COLOR[r.domain] }}
              />
              {r.name}
            </Link>
          );
        })}
      </nav>

      <div className="cs-nav-right">
        <button
          type="button"
          className="cs-search"
          aria-label="Open command palette"
          onClick={openPalette}
        >
          <Icon name="search" size={14} />
          <span className="label">Search…</span>
          <kbd>⌘K</kbd>
        </button>

        {budget && (
          <div
            className="cs-budget"
            title={`Used ${budget.used.toLocaleString()} of ${budget.cap.toLocaleString()} tokens`}
            aria-label={`Token budget: ${budget.pct} percent of 5-hour window used`}
          >
            <span>Budget</span>
            <div className="cs-budget-bar" aria-hidden="true">
              <i style={{ transform: `scaleX(${Math.min(budget.pct / 100, 1)})` }} />
            </div>
            <b className="tnum">{budget.pct}%</b>
          </div>
        )}

        <button
          type="button"
          className="cs-icon-btn"
          aria-label={t.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggleTheme}
        >
          <Icon name={t.theme === "dark" ? "sun" : "moon"} size={15} />
        </button>

        <Link
          href="/notifications"
          className="cs-icon-btn"
          aria-label="Notifications"
        >
          <Icon name="bell" size={15} />
        </Link>

        <Link
          href="/agents"
          className="cs-avatar"
          aria-label="Open agents registry"
          title="Agents registry"
        >
          <span aria-hidden="true">CS</span>
        </Link>
      </div>
    </header>
  );
}
