import "./globals.css";
import type { Metadata } from "next";
import RouteAnnouncer from "./_components/RouteAnnouncer";

export const metadata: Metadata = {
  title: "Clawspace",
  description: "Local hierarchical multi-agent personal workforce.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Skip link — first interactive element (WCAG 2.4.1) */}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <header role="banner" className="border-b border-slate-200 bg-slate-50">
          <nav aria-label="Primary" className="mx-auto max-w-6xl px-4 py-3">
            <ul className="flex flex-wrap gap-4 text-sm font-medium" role="list">
              <li>
                <a href="/" className="hover:underline">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/kanban" className="hover:underline">
                  Kanban
                </a>
              </li>
              <li>
                <a href="/channels" className="hover:underline">
                  Channels
                </a>
              </li>
              <li>
                <a href="/proposals" className="hover:underline">
                  Proposals
                </a>
              </li>
              <li>
                <a href="/research/digests" className="hover:underline">
                  Research
                </a>
              </li>
            </ul>
          </nav>
        </header>

        {/* `tabindex=-1` so the route announcer can move focus here on navigation (WCAG 2.4.3) */}
        <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 outline-none">
          {children}
        </main>

        {/* Two global live-region sentinels (per ACCESSIBILITY-BRIEF §0, §3) */}
        <div id="live-region-polite" aria-live="polite" aria-atomic="false" className="sr-only" />
        <div
          id="live-region-assertive"
          aria-live="assertive"
          aria-atomic="false"
          role="alert"
          className="sr-only"
        />

        <RouteAnnouncer />
      </body>
    </html>
  );
}
