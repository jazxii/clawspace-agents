import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, softAccent } from "../theme";
import { AppFrame, Camera, Vignette, type CamKey } from "../ui/shell";
import { Pill, Caption } from "../ui/widgets";

const worked = [
  "Week-23 applied cleanly (14/14) and the orchestrator now opens directed task hand-offs.",
  "The bus tool already supports to: plus the seven types — prompt-only, no infra change.",
];
const dragged = [
  "Worker replies are still broadcast monologues — every Tier-1 hardcodes type:\"done\".",
  "Children don't know who to reply to: the spawn brief omits the delegator id.",
];

const diffLines = [
  { kind: "hunk", text: "@@ Down-tier delegation (every run delegates its own work) @@" },
  { kind: "ctx", text: " The spawning agent waits for the delegate's result and folds it" },
  { kind: "ctx", text: " into its own done." },
  { kind: "add", text: "+ Every spawn brief MUST include a delegator: \"<your-agent-id>\" field" },
  { kind: "add", text: "+ naming the agent doing the spawning. The delegate uses it as the" },
  { kind: "add", text: "+ to: on its accept / question / done replies so the exchange threads." },
];

const Bullets: React.FC<{ items: string[]; color: string; delay: number }> = ({ items, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((it, i) => {
        const s = spring({ frame: frame - (delay + i * 7), fps, config: { damping: 200 } });
        return (
          <li key={i} style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`, display: "flex", gap: 10, fontSize: 17, color: theme.text2, lineHeight: 1.5 }}>
            <span style={{ color, marginTop: 2 }}>●</span>
            {it}
          </li>
        );
      })}
    </ul>
  );
};

const ProposalsContent: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ padding: 32, height: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", color: theme.text }}>Proposal · 2026-W24</h1>
        <p style={{ margin: "6px 0 0", fontSize: 18, color: theme.text3 }}>Self-evolution loop · awaiting your review</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
        <div style={{ background: theme.bgElev2, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 18px", borderBottom: `1px solid ${theme.hairline}`, fontSize: 18, fontWeight: 600, color: theme.meta }}>✓ What worked</div>
          <div style={{ padding: 18 }}><Bullets items={worked} color={theme.meta} delay={10} /></div>
        </div>
        <div style={{ background: theme.bgElev2, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 18px", borderBottom: `1px solid ${theme.hairline}`, fontSize: 18, fontWeight: 600, color: theme.system }}>⚑ What dragged</div>
          <div style={{ padding: 18 }}><Bullets items={dragged} color={theme.system} delay={20} /></div>
        </div>
      </div>

      <div style={{ background: theme.bgElev2, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${theme.hairline}`, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: theme.text, fontFamily: theme.fontMono }}>CLAUDE.md</span>
          <Pill tone="meta" dot style={{ fontSize: 14 }}>risk: low</Pill>
          <span style={{ marginLeft: "auto", fontSize: 15, color: theme.text3 }}>diff 1 / 8 · propose-only</span>
        </div>
        <div style={{ padding: 18, fontFamily: theme.fontMono, fontSize: 16, lineHeight: 1.7 }}>
          {diffLines.map((l, i) => {
            const reveal = frame >= 40 + i * 9;
            const bg = l.kind === "add" ? softAccent(theme.meta, 12) : l.kind === "hunk" ? softAccent(theme.projects, 10) : "transparent";
            const col = l.kind === "add" ? "#7ee2a0" : l.kind === "hunk" ? theme.projects : theme.text3;
            if (!reveal) return <div key={i} style={{ height: 27 }} />;
            return (
              <div key={i} style={{ background: bg, color: col, padding: "1px 10px", borderRadius: 4, whiteSpace: "pre" }}>
                {l.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CAM: CamKey[] = [
  { f: 0, x: 880, y: 360, s: 1.15 },
  { f: 50, x: 880, y: 430, s: 1.13 },
  { f: 135, x: 880, y: 650, s: 1.1 }, // settle slowly on the diff as it types
];

export const Proposals: React.FC = () => (
  <AbsoluteFill>
    <Camera keys={CAM}>
      <AppFrame active="proposals" page="Proposals">
        <ProposalsContent />
      </AppFrame>
    </Camera>
    <Vignette />
    <Caption text="It proposes its own upgrades — you approve." accent="meta" inAt={68} outAt={128} />
  </AbsoluteFill>
);
