/**
 * Route metadata — single source of truth for nav/breadcrumbs/Cmd-K.
 *
 * Per the design bundle's `shell.jsx::ROUTES`. The `domain` drives the
 * dot color in the top-nav tab. Pages that exist in `app/` resolve to
 * their real route; pages still scaffolded in later phases route to a
 * 404 (acceptable per Phase B acceptance criteria).
 *
 * Each entry exposes:
 *   - id: stable key for the palette and tests
 *   - href: Next.js path
 *   - name: display label
 *   - icon: Icon component name
 *   - domain: used for dot color (content/projects/research/meta)
 *   - phase: which phase brings this route to "shipped" status (for the UI v3 plan)
 */

import type { IconName } from "@/app/_components/Icon";

export type DomainKey = "content" | "projects" | "research" | "meta";

export interface RouteMeta {
  id: string;
  href: string;
  name: string;
  icon: IconName;
  domain: DomainKey;
  phase: "B" | "C" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "E";
}

export const ROUTES: readonly RouteMeta[] = [
  { id: "dashboard", href: "/",                     name: "Dashboard",  icon: "home",     domain: "meta",     phase: "D1" },
  { id: "kanban",    href: "/kanban",               name: "Kanban",     icon: "kanban",   domain: "projects", phase: "C"  },
  { id: "channels",  href: "/channels",             name: "Channels",   icon: "chat",     domain: "projects", phase: "D2" },
  { id: "activity",  href: "/activity",             name: "Activity",   icon: "activity", domain: "meta",     phase: "D3" },
  { id: "cost",      href: "/cost",                 name: "Cost",       icon: "coin",     domain: "meta",     phase: "D3" },
  { id: "logs",      href: "/logs",                 name: "Daily log",  icon: "log",      domain: "meta",     phase: "D4" },
  { id: "graph",     href: "/graph",                name: "Graphify",   icon: "graph",    domain: "projects", phase: "D4" },
  { id: "digest",    href: "/research/digests",     name: "Digest",     icon: "digest",   domain: "research", phase: "D4" },
  { id: "audit",     href: "/audit",                name: "Audit",      icon: "audit",    domain: "meta",     phase: "D5" },
  { id: "queue",     href: "/queue",                name: "Content",    icon: "queue",    domain: "content",  phase: "D5" },
  { id: "notion",    href: "/notion",               name: "Notion",     icon: "notion",   domain: "content",  phase: "D6" },
  { id: "notebooklm", href: "/notebooklm",          name: "NotebookLM", icon: "sparkles", domain: "research", phase: "D7" },
  { id: "proposals", href: "/proposals",            name: "Proposals",  icon: "palette",  domain: "meta",     phase: "D8" },
  { id: "agents",    href: "/agents",               name: "Agents",     icon: "settings", domain: "meta",     phase: "D5" },
] as const;

export const DOMAIN_COLOR: Record<DomainKey, string> = {
  content:  "var(--accent-content)",
  projects: "var(--accent-projects)",
  research: "var(--accent-research)",
  meta:     "var(--accent-meta)",
};

export const DOMAIN_LABEL: Record<DomainKey, string> = {
  content:  "Content",
  projects: "Projects",
  research: "Research",
  meta:     "Meta",
};

/** Find the route metadata for the active pathname (longest-prefix match). */
export function matchRoute(pathname: string): RouteMeta | undefined {
  // Exact / longest-prefix
  let best: RouteMeta | undefined;
  for (const r of ROUTES) {
    if (r.href === "/" ? pathname === "/" : pathname === r.href || pathname.startsWith(`${r.href}/`)) {
      if (!best || r.href.length > best.href.length) best = r;
    }
  }
  return best;
}
