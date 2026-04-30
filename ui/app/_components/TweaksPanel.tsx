"use client";

/**
 * TweaksPanel — floating control for v3 design tokens.
 *
 * Mounted globally from app/layout.tsx. Hidden by default; opened with
 * the floating launch button or Cmd-/. Persists choices via useTweaks.
 *
 * Phase A only renders the panel — Phase B may wire it into the top nav.
 */

import * as React from "react";
import {
  useTweaks,
  type AccentKey,
  type Density,
  type Radius,
  type SidebarStyle,
  type Theme,
  type FontFamily,
} from "@/lib/use-tweaks";
import { Icon } from "./Icon";

const ACCENT_OPTIONS: { value: AccentKey; label: string }[] = [
  { value: "projects", label: "Blue (projects)" },
  { value: "content", label: "Orange (content)" },
  { value: "research", label: "Violet (research)" },
  { value: "meta", label: "Green (meta)" },
  { value: "red", label: "Red (alerts)" },
];

function Section({ label }: { label: string }) {
  return <div className="twk-sect">{label}</div>;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  const groupId = React.useId();
  return (
    <div className="twk-row" role="group" aria-labelledby={`${groupId}-l`}>
      <div className="twk-lbl" id={`${groupId}-l`}>
        <span>{label}</span>
      </div>
      <div className="twk-seg">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            data-on={value === opt ? "1" : "0"}
            aria-pressed={value === opt}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const id = React.useId();
  return (
    <div className="twk-row">
      <label className="twk-lbl" htmlFor={id}>
        <span>{label}</span>
      </label>
      <select
        id={id}
        className="twk-field"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TweaksPanel() {
  const [t, setTweak] = useTweaks();
  const [open, setOpen] = React.useState(false);

  // Cmd-/ toggle (avoid clashing with Cmd-K, kept by CommandPalette).
  // Also listen for the cross-component "clawspace:open-tweaks" event so
  // the Cmd-K palette can deep-link here.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpenEvt = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("clawspace:open-tweaks", onOpenEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("clawspace:open-tweaks", onOpenEvt);
    };
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        className="twk-launch"
        aria-label="Open Tweaks panel"
        title="Tweaks (⌘/)"
        onClick={() => setOpen(true)}
      >
        <Icon name="palette" size={16} />
      </button>
    );
  }

  return (
    <aside
      className="twk-panel"
      role="dialog"
      aria-label="Tweaks"
      aria-modal="false"
    >
      <div className="twk-hd">
        <b>Clawspace · Tweaks</b>
        <button
          type="button"
          className="twk-x"
          aria-label="Close Tweaks"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>
      <div className="twk-body">
        <Section label="Appearance" />
        <Segmented<Theme>
          label="Mode"
          value={t.theme}
          options={["light", "dark"]}
          onChange={(v) => setTweak("theme", v)}
        />
        <Select<AccentKey>
          label="Accent"
          value={t.accent}
          options={ACCENT_OPTIONS}
          onChange={(v) => setTweak("accent", v)}
        />

        <Section label="Layout" />
        <Segmented<Density>
          label="Density"
          value={t.density}
          options={["compact", "regular", "spacious"]}
          onChange={(v) => setTweak("density", v)}
        />
        <Segmented<Radius>
          label="Radius"
          value={t.radius}
          options={["sharp", "regular", "soft"]}
          onChange={(v) => setTweak("radius", v)}
        />
        <Segmented<SidebarStyle>
          label="Sidebar"
          value={t.sidebarStyle}
          options={["full", "rail"]}
          onChange={(v) => setTweak("sidebarStyle", v)}
        />

        <Section label="Typography" />
        <Segmented<FontFamily>
          label="Font"
          value={t.fontFamily}
          options={["sans", "mono", "serif"]}
          onChange={(v) => setTweak("fontFamily", v)}
        />
      </div>
    </aside>
  );
}
