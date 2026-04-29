import "./globals.css";
import type { Metadata } from "next";
import RouteAnnouncer from "./_components/RouteAnnouncer";
import Sidebar from "./_components/Sidebar";
import CommandPalette from "./_components/CommandPalette";
import ShortcutsOverlay from "./_components/ShortcutsOverlay";
import UserMenu from "./_components/UserMenu";
import Providers from "./_components/Providers";
import TweaksPanel from "./_components/TweaksPanel";

export const metadata: Metadata = {
  title: "Clawspace",
  description: "Local hierarchical multi-agent personal workforce.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        {/* Skip link */}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <Providers>
          <div className="grid md:grid-cols-[14rem_1fr] min-h-screen">
            <Sidebar />

            {/* The page-chrome's outer wrapper is the role="banner" landmark.
                Removed from the v1 site-wide <header>. */}
            <div className="flex flex-col">
              <header role="banner" className="border-b border-subtle px-4 md:px-8 py-3 flex items-center justify-between" style={{ background: "var(--bg-canvas)" }}>
                <div className="md:hidden font-semibold">Clawspace</div>
                <div className="ml-auto flex items-center gap-2">
                  <UserMenu />
                </div>
              </header>

              <main
                id="main"
                tabIndex={-1}
                className="px-4 md:px-8 py-6 outline-none flex-1"
              >
                {children}
              </main>
            </div>
          </div>

          {/* Global live regions */}
          <div id="live-region-polite" aria-live="polite" aria-atomic="false" className="sr-only" />
          <div
            id="live-region-assertive"
            aria-live="assertive"
            aria-atomic="false"
            role="alert"
            className="sr-only"
          />

          <RouteAnnouncer />
          <CommandPalette />
          <ShortcutsOverlay />
          <TweaksPanel />
        </Providers>
      </body>
    </html>
  );
}
