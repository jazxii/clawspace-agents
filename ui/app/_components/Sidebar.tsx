"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Persistent sidebar — ACCESSIBILITY-BRIEF-V2 §7.1 + §9.2.
 *
 * Renders <aside aria-label="Primary"> outside <main>. Each link uses
 * aria-current="page" when the current path matches, color/weight is redundant.
 *
 * Mobile (<768px) is handled by CSS — sidebar collapses to a toggleable strip
 * via the wrapper layout's media query. v1 of the v2 ships persistent only;
 * the Radix-Dialog-side drawer pattern for true mobile is deferred to PR-B.
 */

const NAV_ITEMS: { href: string; label: string; shortcut: string }[] = [
  { href: "/", label: "Dashboard", shortcut: "g d" },
  { href: "/kanban", label: "Kanban", shortcut: "g k" },
  { href: "/channels", label: "Channels", shortcut: "g c" },
  { href: "/proposals", label: "Proposals", shortcut: "g p" },
  { href: "/research/digests", label: "Research", shortcut: "g r" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar w-56 hidden md:flex" aria-label="Primary">
      <div className="font-semibold text-lg flex items-center gap-2 px-3 py-2">
        <span aria-hidden="true">⌘</span>
        <span>Clawspace</span>
      </div>
      <nav aria-label="Sections">
        <ul role="list" className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="sidebar-link"
                  aria-current={active ? "page" : undefined}
                  aria-keyshortcuts={item.shortcut}
                >
                  <span className="flex-1">{item.label}</span>
                  <span className="kbd hidden lg:inline-flex" aria-hidden="true">
                    {item.shortcut}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto text-xs text-tertiary px-3">
        <p aria-hidden="true">
          <span className="kbd">⌘K</span> to search · <span className="kbd">?</span> for shortcuts
        </p>
      </div>
    </aside>
  );
}
