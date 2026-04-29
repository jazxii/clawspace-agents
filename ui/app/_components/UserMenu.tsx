"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useDensity } from "@/lib/use-density";
import { useGlobalShortcuts } from "@/lib/use-shortcuts";
import { liveAnnounce } from "@/lib/live-announce";

/**
 * User menu — settings panel.
 * Theme: System / Light / Dark (radiogroup, ACCESSIBILITY-BRIEF-V2 §8.4)
 * Density: Comfortable / Compact (radiogroup)
 * Pause announcements: checkbox (WCAG 2.2.2)
 * Disable single-character shortcuts: checkbox (WCAG 2.1.4)
 *
 * Inline panel rather than Radix Popover for v1 — easier focus, no extra
 * portal stacking. Could upgrade to Popover in PR-B if real estate gets tight.
 */

export default function UserMenu() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { density, setDensity } = useDensity();
  const { disabled: shortcutsDisabled, setShortcutsDisabled } = useGlobalShortcuts();
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function togglePause() {
    setPaused((p) => {
      const next = !p;
      liveAnnounce.setPaused(next);
      // Use assertive once so SR users know toggle worked even when polite is paused
      liveAnnounce.assertive(next ? "Announcements paused" : "Announcements resumed");
      return next;
    });
  }

  // Listen for Cmd-K's "open user menu" intent — for now, just announce the section.
  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent).detail as { focus?: string } | undefined;
      liveAnnounce.polite(`Settings panel: ${detail?.focus ?? "general"}`, "form-feedback");
    }
    function onTogglePause() { togglePause(); }
    window.addEventListener("clawspace:open-user-menu", onOpen);
    window.addEventListener("clawspace:toggle-pause", onTogglePause);
    return () => {
      window.removeEventListener("clawspace:open-user-menu", onOpen);
      window.removeEventListener("clawspace:toggle-pause", onTogglePause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) {
    // Avoid SSR/CSR theme mismatch flash; render nothing until hydrated.
    return null;
  }

  return (
    <details className="relative">
      <summary
        className="btn-secondary cursor-pointer list-none"
        aria-label={`Settings (theme: ${theme}, density: ${density})`}
      >
        Settings
      </summary>
      <div
        role="dialog"
        aria-label="Settings"
        className="absolute right-0 mt-2 w-80 rounded-lg p-4 z-30"
        style={{ background: "var(--bg-surface-1)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-2)" }}
      >
        <fieldset className="mb-4">
          <legend className="font-semibold mb-2">Theme</legend>
          <div role="radiogroup" className="flex flex-col gap-1">
            {(["system", "light", "dark"] as const).map((t) => (
              <label key={t} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="theme"
                  value={t}
                  checked={theme === t}
                  onChange={() => {
                    setTheme(t);
                    liveAnnounce.polite(`Theme: ${t}`, "form-feedback");
                  }}
                />
                <span style={{ textTransform: "capitalize" }}>{t}</span>
                {t === "system" && resolvedTheme && (
                  <span className="text-xs text-tertiary">(currently {resolvedTheme})</span>
                )}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="font-semibold mb-2">Density</legend>
          <div role="radiogroup" className="flex flex-col gap-1">
            {(["comfortable", "compact"] as const).map((d) => (
              <label key={d} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="density"
                  value={d}
                  checked={density === d}
                  onChange={() => setDensity(d)}
                />
                <span style={{ textTransform: "capitalize" }}>{d}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-2">
          <legend className="font-semibold mb-2">Accessibility</legend>
          <label className="inline-flex items-center gap-2 text-sm mb-1">
            <input type="checkbox" checked={paused} onChange={togglePause} />
            Pause screen-reader announcements
          </label>
          <br />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={shortcutsDisabled}
              onChange={(e) => setShortcutsDisabled(e.currentTarget.checked)}
            />
            Disable single-character shortcuts
          </label>
        </fieldset>
      </div>
    </details>
  );
}
