import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { theme, type DomainAccent } from "../theme";
import { AppFrame, Camera, Vignette, type CamKey } from "../ui/shell";
import { StatTile, Pill, Caption } from "../ui/widgets";

type Row = { agent: string; domain: DomainAccent; model: string; runs: number };
const ROWS: Row[] = [
  { agent: "kanban-secretary", domain: "projects", model: "sonnet", runs: 46 },
  { agent: "daily-project-supervisor", domain: "projects", model: "sonnet", runs: 28 },
  { agent: "linkedin-writer", domain: "content", model: "sonnet", runs: 21 },
  { agent: "domain-researcher", domain: "research", model: "sonnet", runs: 17 },
  { agent: "master-overseer", domain: "meta", model: "opus", runs: 14 },
  { agent: "humanizer", domain: "content", model: "sonnet", runs: 12 },
  { agent: "content-domain-lead", domain: "content", model: "opus", runs: 9 },
];
const MAX = Math.max(...ROWS.map((r) => r.runs));

const BarRow: React.FC<{ r: Row; i: number }> = ({ r, i }) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame - (24 + i * 6), [0, 26], [0, (r.runs / MAX) * 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const appear = interpolate(frame - (20 + i * 6), [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const runsNow = Math.round(interpolate(frame - (24 + i * 6), [0, 26], [0, r.runs], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  return (
    <div style={{ opacity: appear, display: "flex", alignItems: "center", gap: 18, padding: "12px 18px", borderTop: i === 0 ? "none" : `1px solid ${theme.hairline}` }}>
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: theme[r.domain] }} />
      <div style={{ width: 320, fontWeight: 500, fontSize: 18, color: theme.text, fontFamily: theme.fontMono }}>{r.agent}</div>
      <Pill tone={r.model === "opus" ? "research" : "projects"} style={{ fontSize: 14 }}>{r.model}</Pill>
      <div style={{ flex: 1, height: 9, background: theme.bgSunken, borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ width: `${fill}%`, height: "100%", background: theme[r.domain], opacity: 0.85 }} />
      </div>
      <span style={{ width: 70, textAlign: "right", fontFamily: theme.fontMono, color: theme.text2, fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{runsNow}×</span>
    </div>
  );
};

const CostContent: React.FC = () => (
  <div style={{ padding: 32, height: "100%", boxSizing: "border-box" }}>
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", color: theme.text }}>Token cost</h1>
      <p style={{ margin: "6px 0 0", fontSize: 18, color: theme.text3 }}>Per-domain activity · per-agent breakdown · built for Claude Pro windows</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 22 }}>
      <StatTile tint="content" label="content" value={42} valueFormat={(n) => `${n} runs`} delta="28% of activity" spark={[2, 3, 4, 4, 5, 6, 6, 7, 7]} delay={6} />
      <StatTile tint="projects" label="projects" value={74} valueFormat={(n) => `${n} runs`} delta="49% of activity" spark={[5, 6, 7, 8, 9, 10, 11, 12, 12]} delay={10} />
      <StatTile tint="research" label="research" value={17} valueFormat={(n) => `${n} runs`} delta="11% of activity" spark={[1, 2, 2, 3, 3, 4, 4, 5, 5]} delay={14} />
      <StatTile tint="meta" label="meta" value={18} valueFormat={(n) => `${n} runs`} delta="12% of activity" spark={[2, 2, 3, 3, 3, 4, 4, 4, 5]} delay={18} />
    </div>

    <div style={{ background: theme.bgElev2, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${theme.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 19, fontWeight: 600, color: theme.text }}>Per-agent breakdown</span>
        <span style={{ fontSize: 15, color: theme.text3 }}>sorted by runs</span>
      </div>
      <div>
        {ROWS.map((r, i) => <BarRow key={r.agent} r={r} i={i} />)}
      </div>
    </div>
  </div>
);

const CAM: CamKey[] = [
  { f: 0, x: 880, y: 360, s: 1.18 },
  { f: 48, x: 880, y: 390, s: 1.14 },
  { f: 125, x: 880, y: 640, s: 1.1 }, // slow glide down the filling bars
];

export const Cost: React.FC = () => (
  <AbsoluteFill>
    <Camera keys={CAM}>
      <AppFrame active="cost" page="Cost">
        <CostContent />
      </AppFrame>
    </Camera>
    <Vignette />
    <Caption text="Token-aware — built for Claude Pro windows." accent="meta" inAt={58} outAt={118} />
  </AbsoluteFill>
);
