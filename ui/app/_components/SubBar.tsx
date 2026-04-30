"use client";

/**
 * SubBar — breadcrumb + per-page meta actions.
 *
 * Sits below TopNav. Crumbs are derived from pathname via route-meta.
 * The right slot ("actions") is reserved for per-page action chips
 * (e.g. "last update 14:32 · ⌘K to navigate"). Pages can override via
 * the `actions` prop on a wrapper component (Phase D adds <PageActions/>).
 */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { matchRoute } from "@/lib/route-meta";
import { Icon, type IconName } from "./Icon";

interface Crumb {
  label: string;
  href?: string;
  icon?: IconName;
}

export default function SubBar({ actions }: { actions?: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const route = matchRoute(pathname);

  const crumbs: Crumb[] = [
    { label: "Clawspace", href: "/", icon: "home" },
  ];
  if (route && route.id !== "dashboard") {
    crumbs.push({ label: route.name, icon: route.icon });
  }

  return (
    <nav className="cs-subbar" aria-label="Breadcrumb">
      <ol style={{ display: "contents", listStyle: "none", margin: 0, padding: 0 }}>
        {crumbs.map((c, i) => {
          const isTail = i === crumbs.length - 1;
          return (
            <React.Fragment key={`${i}-${c.label}`}>
              {i > 0 && (
                <span className="cs-crumb-sep" aria-hidden="true">/</span>
              )}
              <li className="cs-crumb" style={{ display: "inline-flex" }}>
                {c.icon && <Icon name={c.icon} size={13} />}
                {isTail || !c.href ? (
                  <b aria-current={isTail ? "page" : undefined}>{c.label}</b>
                ) : (
                  <Link href={c.href} style={{ color: "inherit", textDecoration: "none" }}>
                    {c.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
      <div className="cs-subbar-actions">{actions ?? <DefaultActions />}</div>
    </nav>
  );
}

function DefaultActions() {
  const [time, setTime] = React.useState<string>(() => formatTime(new Date()));
  React.useEffect(() => {
    const t = setInterval(() => setTime(formatTime(new Date())), 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="muted" style={{ fontSize: 11 }}>
      last update <b className="tnum">{time}</b> · <kbd className="cs-kbd">⌘K</kbd> to navigate
    </span>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
