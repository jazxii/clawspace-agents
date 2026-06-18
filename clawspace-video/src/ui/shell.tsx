import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { theme, softAccent, type DomainAccent } from "../theme";

/* World size of the app shell (camera operates in these coordinates). */
export const WORLD_W = 1760;
export const WORLD_H = 1000;

/* ─────────────────────────── virtual camera ──────────────────────────── */
export type CamKey = { f: number; x: number; y: number; s: number };

export const Camera: React.FC<{
  keys: CamKey[];
  children: React.ReactNode;
  drift?: number;
}> = ({ keys, children, drift = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const frames = keys.map((k) => k.f);
  const fx = interpolate(frame, frames, keys.map((k) => k.x), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const fy = interpolate(frame, frames, keys.map((k) => k.y), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const s = interpolate(frame, frames, keys.map((k) => k.s), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // subtle handheld drift
  const dx = Math.sin(frame / 47) * 5 * drift;
  const dy = Math.cos(frame / 39) * 4 * drift;

  // Center on the focus point, then clamp so the world always covers the
  // viewport (a real camera can't pan past the edge of what it's filming).
  const scaledW = WORLD_W * s;
  const scaledH = WORLD_H * s;
  let tx = width / 2 - fx * s + dx;
  let ty = height / 2 - fy * s + dy;
  if (scaledW <= width) {
    tx = (width - scaledW) / 2 + dx;
  } else {
    tx = Math.min(0, Math.max(width - scaledW, tx));
  }
  if (scaledH <= height) {
    ty = (height - scaledH) / 2 + dy;
  } else {
    ty = Math.min(0, Math.max(height - scaledH, ty));
  }

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          width: WORLD_W,
          height: WORLD_H,
          transform: `translate(${tx}px, ${ty}px) scale(${s})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ──────────────────────────── nav tab model ──────────────────────────── */
type Tab = { id: string; name: string; domain: DomainAccent };
const TABS: Tab[] = [
  { id: "dashboard", name: "Dashboard", domain: "meta" },
  { id: "agents", name: "Agents", domain: "meta" },
  { id: "channels", name: "Channels", domain: "projects" },
  { id: "kanban", name: "Kanban", domain: "projects" },
  { id: "cost", name: "Cost", domain: "meta" },
  { id: "graph", name: "Graphify", domain: "projects" },
  { id: "proposals", name: "Proposals", domain: "meta" },
];

const BrandMark: React.FC = () => (
  <div
    style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      background: `linear-gradient(135deg, ${theme.content}, ${theme.research})`,
      position: "relative",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,.4)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 5,
        borderRadius: 4,
        background: theme.bgElev2,
        clipPath:
          "polygon(0 50%, 30% 0, 60% 30%, 30% 60%, 60% 90%, 100% 50%, 100% 100%, 0 100%)",
      }}
    />
  </div>
);

/* ─────────────────────────── app frame (shell) ───────────────────────── */
export const AppFrame: React.FC<{
  active: string;
  page: string;
  children: React.ReactNode;
  budgetPct?: number;
}> = ({ active, page, children, budgetPct = 42 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = spring({ frame, fps, config: { damping: 200, mass: 0.9 } });
  const navY = interpolate(drop, [0, 1], [-70, 0]);

  const budgetFill = interpolate(frame, [18, 48], [0, budgetPct], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        width: WORLD_W,
        height: WORLD_H,
        background: theme.bg,
        border: `1px solid ${theme.borderStrong}`,
        borderRadius: 22,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 50px 140px rgba(0,0,0,.65)",
        fontFamily: theme.fontSans,
      }}
    >
      {/* TopNav */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 22px",
          background: "rgba(28,28,30,.85)",
          borderBottom: `1px solid ${theme.border}`,
          transform: `translateY(${navY}px)`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 9, paddingRight: 16, borderRight: `1px solid ${theme.hairline}` }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 16, borderRight: `1px solid ${theme.hairline}` }}>
          <BrandMark />
          <span style={{ fontSize: 19, fontWeight: 600, color: theme.text }}>Clawspace</span>
        </div>

        {/* nav tabs */}
        <div
          style={{
            display: "flex",
            gap: 2,
            background: theme.bgSunken,
            padding: 3,
            borderRadius: 9999,
          }}
        >
          {TABS.map((t) => {
            const on = t.id === active;
            return (
              <div
                key={t.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 15px",
                  borderRadius: 9999,
                  fontSize: 17,
                  fontWeight: 500,
                  color: on ? theme.text : theme.text3,
                  background: on ? theme.bgElev2 : "transparent",
                  boxShadow: on ? "0 1px 2px rgba(0,0,0,.3)" : "none",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme[t.domain] }} />
                {t.name}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 38,
            padding: "0 14px",
            background: theme.bgSunken,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            color: theme.text3,
            fontSize: 16,
            minWidth: 190,
          }}
        >
          <span style={{ opacity: 0.7 }}>Search…</span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: theme.fontMono,
              fontSize: 14,
              background: theme.bgElev2,
              border: `1px solid ${theme.border}`,
              borderRadius: 5,
              padding: "1px 7px",
            }}
          >
            ⌘K
          </span>
        </div>

        {/* budget */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 38,
            padding: "0 14px",
            background: theme.bgSunken,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            fontSize: 15,
            color: theme.text2,
          }}
        >
          <div style={{ width: 80, height: 5, borderRadius: 9999, background: theme.border, overflow: "hidden" }}>
            <div
              style={{
                width: `${budgetFill}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${theme.meta}, ${theme.content} 70%, ${theme.system})`,
              }}
            />
          </div>
          <span style={{ fontFamily: theme.fontMono, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(budgetFill)}%
          </span>
        </div>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.content}, ${theme.research})`,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          CS
        </div>
      </div>

      {/* SubBar */}
      <div
        style={{
          height: 46,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 24px",
          background: theme.bg,
          borderBottom: `1px solid ${theme.hairline}`,
          fontSize: 16,
          color: theme.text3,
          flexShrink: 0,
        }}
      >
        <span>Clawspace</span>
        <span style={{ opacity: 0.5 }}>/</span>
        <span style={{ color: theme.text, fontWeight: 500 }}>{page}</span>
        <span style={{ marginLeft: "auto", color: theme.text4 }}>updated 09:41 · ⌘K to navigate</span>
      </div>

      {/* content */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: theme.bg }}>
        {children}
      </div>
    </div>
  );
};

/* A soft vignette to sell the "camera" depth, placed above the camera layer. */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      boxShadow: "inset 0 0 240px 80px rgba(0,0,0,.55)",
      background:
        "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.28) 100%)",
    }}
  />
);
