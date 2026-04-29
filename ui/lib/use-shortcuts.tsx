"use client";

/**
 * Global keyboard shortcuts — ACCESSIBILITY-BRIEF-V2 §6.1.
 *
 * Single-character shortcuts only fire when focus is NOT in input/textarea/
 * contenteditable/combobox/listbox (with two scoped exceptions: M inside the
 * Kanban listbox is the listbox's own keyDown; / inside the textarea is the
 * channel form's own keyDown — both handled in their components).
 *
 * Cmd/Ctrl+K is modifier-prefixed and safe everywhere (2.1.4 exempt).
 *
 * Honors a user setting `clawspace.shortcuts-disabled=true` in localStorage to
 * disable single-character shortcuts entirely (2.1.4 mandate).
 */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMode } from "./use-mode";
import { liveAnnounce } from "./live-announce";

const SHORTCUTS_KEY = "clawspace.shortcuts-disabled";

function inEditable(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
  if (el.isContentEditable) return true;
  const role = el.getAttribute("role");
  if (role === "combobox" || role === "listbox" || role === "option") return true;
  return false;
}

export function useGlobalShortcuts() {
  const router = useRouter();
  const { mode, setMode, clearMode } = useMode();
  const chordRef = useRef<{ key: string; ts: number } | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      setDisabled(localStorage.getItem(SHORTCUTS_KEY) === "true");
    } catch { /* ignore */ }
  }, []);

  const isDisabled = disabled;

  const goto = useCallback(
    (path: string, label: string) => {
      router.push(path);
      liveAnnounce.polite(`Navigating to ${label}`, "route-change");
    },
    [router],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Always handle modifier shortcut: Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Toggle palette
        setMode(mode === "palette" ? "idle" : "palette");
        return;
      }

      // Escape pops the topmost mode (one level)
      if (e.key === "Escape") {
        if (mode !== "idle") {
          e.stopPropagation();
          clearMode();
        }
        return;
      }

      // Single-char shortcuts: skip if disabled, in editable, or in a non-idle mode
      if (isDisabled) return;
      if (inEditable()) return;
      if (mode !== "idle") return;

      const k = e.key;

      // Chord: g <letter>
      if (chordRef.current && Date.now() - chordRef.current.ts < 1500) {
        const seq = `${chordRef.current.key}${k}`.toLowerCase();
        chordRef.current = null;
        switch (seq) {
          case "gd": goto("/", "Dashboard"); return;
          case "gk": goto("/kanban", "Kanban"); return;
          case "gc": goto("/channels", "Channels"); return;
          case "gt": goto("/timeline", "Timeline"); return;
          case "ga": goto("/agents", "Agents"); return;
          case "gu": goto("/audit", "Audit"); return;
          case "gl": goto("/logs", "Logs"); return;
          case "gs": goto("/search", "Search"); return;
          case "gp": goto("/proposals", "Proposals"); return;
          case "gr": goto("/research/digests", "Research"); return;
          default: return;
        }
      }

      if (k === "g") {
        chordRef.current = { key: "g", ts: Date.now() };
        return;
      }
      if (k === "?") {
        e.preventDefault();
        setMode("shortcuts-overlay");
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, setMode, clearMode, goto, isDisabled]);

  const setShortcutsDisabled = useCallback((d: boolean) => {
    setDisabled(d);
    try { localStorage.setItem(SHORTCUTS_KEY, d ? "true" : "false"); } catch { /* ignore */ }
    liveAnnounce.polite(d ? "Single-character shortcuts disabled" : "Single-character shortcuts enabled", "form-feedback");
  }, []);

  return useMemo(() => ({ disabled, setShortcutsDisabled }), [disabled, setShortcutsDisabled]);
}
