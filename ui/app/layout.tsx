import "./globals.css";
import type { Metadata } from "next";
import RouteAnnouncer from "./_components/RouteAnnouncer";
import CommandPalette from "./_components/CommandPalette";
import ShortcutsOverlay from "./_components/ShortcutsOverlay";
import Providers from "./_components/Providers";
import TweaksPanel from "./_components/TweaksPanel";
import TopNav from "./_components/TopNav";
import SubBar from "./_components/SubBar";

export const metadata: Metadata = {
  title: "Clawspace",
  description: "Local hierarchical multi-agent personal workforce.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Skip link */}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <Providers>
          <div className="cs-app">
            <TopNav />
            <SubBar />
            <main
              id="main"
              tabIndex={-1}
              className="cs-page outline-none"
            >
              <div className="cs-page-inner">{children}</div>
            </main>
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
