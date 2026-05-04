"use client";

import { ThemeProvider } from "next-themes";
import { ModeProvider } from "@/lib/use-mode";
import { useGlobalShortcuts } from "@/lib/use-shortcuts";
import type { ReactNode } from "react";

/**
 * Providers wrapper. Ordering matters:
 *   1. ThemeProvider (next-themes inline-script-before-paint to prevent FOUC)
 *   2. ModeProvider (state machine for the keyboard layer)
 *   3. ShortcutsBinder hook (must be inside ModeProvider)
 */

function ShortcutsBinder() {
  useGlobalShortcuts();
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      storageKey="clawspace.theme"
      themes={["light", "dark"]}
      disableTransitionOnChange
    >
      <ModeProvider>
        <ShortcutsBinder />
        {children}
      </ModeProvider>
    </ThemeProvider>
  );
}
