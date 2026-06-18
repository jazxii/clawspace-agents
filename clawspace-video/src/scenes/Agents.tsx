import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, type DomainAccent } from "../theme";
import { AppFrame, Camera, Vignette, type CamKey } from "../ui/shell";
import { Pill, Caption, AnimatedNumber } from "../ui/widgets";

type Agent = { id: string; domain: DomainAccent; model: "opus" | "sonnet"; desc: string };
type TierBlock = { tier: number; label: string; agents: Agent[] };

const TIERS: TierBlock[] = [
  {
    tier: 4,
    label: "Tier 4 — Meta",
    agents: [
      { id: "master-overseer", domain: "meta", model: "opus", desc: "Daily health + weekly evolution kickoff" },
      { id: "self-evolution-proposer", domain: "meta", model: "opus", desc: "Friday weekly self-evolution proposal" },
    ],
  },
  {
    tier: 3,
    label: "Tier 3 — Supervisors",
    agents: [
      { id: "daily-content-supervisor", domain: "content", model: "sonnet", desc: "EOD digest, content domain" },
      { id: "daily-project-supervisor", domain: "projects", model: "sonnet", desc: "EOD digest, projects domain" },
      { id: "daily-research-supervisor", domain: "research", model: "sonnet", desc: "EOD digest, research domain" },
    ],
  },
  {
    tier: 2,
    label: "Tier 2 — Leads",
    agents: [
      { id: "content-domain-lead", domain: "content", model: "opus", desc: "Content strategy + calendar" },
      { id: "project-domain-lead", domain: "projects", model: "opus", desc: "Project orchestration + Kanban" },
      { id: "research-domain-lead", domain: "research", model: "opus", desc: "Research strategy + newsletter" },
    ],
  },
  {
    tier: 1,
    label: "Tier 1 — Workers",
    agents: [
      { id: "linkedin-writer", domain: "content", model: "sonnet", desc: "LinkedIn post drafting" },
      { id: "kanban-secretary", domain: "projects", model: "sonnet", desc: "Board hygiene every 15m" },
      { id: "domain-researcher", domain: "research", model: "sonnet", desc: "Topic deep-dives, Exa + Tavily" },
      { id: "humanizer", domain: "content", model: "sonnet", desc: "Applies the writing signature" },
    ],
  },
];

const AgentCard: React.FC<{ a: Agent; delay: number }> = ({ a, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px) scale(${interpolate(s, [0, 1], [0.96, 1])})`,
        background: theme.bgElev2,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: theme[a.domain] }} />
          <b style={{ fontFamily: theme.fontMono, fontSize: 17, color: theme.text }}>{a.id}</b>
        </span>
        <Pill tone={a.model === "opus" ? "research" : "projects"}>{a.model}</Pill>
      </div>
      <div style={{ fontSize: 16, color: theme.text3, lineHeight: 1.45 }}>{a.desc}</div>
    </div>
  );
};

const AgentsContent: React.FC = () => {
  let delay = 14;
  return (
    <div style={{ padding: 34, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", color: theme.text }}>
            <AnimatedNumber to={33} delay={10} duration={30} /> agents
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 19, color: theme.text3 }}>
            Custom workforce · four tiers · opus + sonnet
          </p>
        </div>
        <div style={{ display: "flex", gap: 3, background: theme.bgSunken, padding: 3, borderRadius: 9999 }}>
          {["all", "content", "projects", "research", "meta"].map((d, i) => (
            <span key={d} style={{ padding: "6px 13px", borderRadius: 9999, fontSize: 15, fontWeight: 500, color: i === 0 ? theme.text : theme.text3, background: i === 0 ? theme.bgElev2 : "transparent" }}>
              {d}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        {TIERS.map((tb) => (
          <div key={tb.tier}>
            <div style={{ fontSize: 15, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: theme.text3, margin: "0 0 10px" }}>
              {tb.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(tb.agents.length, 2)}, 1fr)`, gap: 14 }}>
              {tb.agents.map((a) => {
                delay += 4;
                return <AgentCard key={a.id} a={a} delay={delay} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CAM: CamKey[] = [
  { f: 0, x: 880, y: 300, s: 1.22 }, // open on the "33 agents" headline
  { f: 58, x: 880, y: 390, s: 1.14 },
  { f: 116, x: 880, y: 520, s: 1.0 },
  { f: 155, x: 880, y: 540, s: 0.93 }, // slow zoom-out to the full workforce view
];

export const Agents: React.FC = () => (
  <AbsoluteFill>
    <Camera keys={CAM}>
      <AppFrame active="agents" page="Agents">
        <AgentsContent />
      </AppFrame>
    </Camera>
    <Vignette />
    <Caption text="33 specialized agents. Four tiers. One workforce." accent="meta" inAt={88} outAt={150} />
  </AbsoluteFill>
);
