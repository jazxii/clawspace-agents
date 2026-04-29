"use client";

/**
 * Mode state machine — ACCESSIBILITY-BRIEF-V2 §6.3.
 *
 * One non-idle mode at a time. Escape pops the topmost. This module exposes a
 * tiny store via plain React state in a context provider. Components that own
 * a mode (Cmd-K, Move, Slash picker, Drawers, Modals) call setMode to claim
 * it and clearMode to release. Consumers can read via useMode().
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { liveAnnounce } from "./live-announce";

export type Mode =
  | "idle"
  | "move"
  | "palette"
  | "slash"
  | "shortcuts-overlay"
  | "drawer"
  | "modal";

interface ModeApi {
  mode: Mode;
  setMode: (m: Mode) => void;
  clearMode: () => void;
  /** True while the palette is open — used by liveAnnounce quiet zone. */
  isQuietZone: boolean;
}

const ModeContext = createContext<ModeApi>({
  mode: "idle",
  setMode: () => {},
  clearMode: () => {},
  isQuietZone: false,
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("idle");

  const setMode = useCallback((m: Mode) => {
    setModeState((prev) => {
      // If switching away from move (because Cmd-K opened, etc.), announce the cancel.
      if (prev === "move" && m !== "move") liveAnnounce.polite("Move cancelled.", "drag");
      // Quiet zone toggles.
      liveAnnounce.setQuietZone(m === "palette");
      return m;
    });
  }, []);

  const clearMode = useCallback(() => {
    setModeState((prev) => {
      if (prev === "move") liveAnnounce.polite("Move cancelled.", "drag");
      liveAnnounce.setQuietZone(false);
      return "idle";
    });
  }, []);

  const value = useMemo<ModeApi>(
    () => ({ mode, setMode, clearMode, isQuietZone: mode === "palette" }),
    [mode, setMode, clearMode],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  return useContext(ModeContext);
}
