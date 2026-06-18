import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, softAccent, type DomainAccent } from "../theme";
import { AppFrame, Camera, Vignette, type CamKey } from "../ui/shell";
import { AgentAvatar, Caption } from "../ui/widgets";

type Msg = {
  from: string;
  domain: DomainAccent;
  tier: number;
  type: string;
  to?: string;
  body: string;
  ref?: string;
  ts: string;
};

const MESSAGES: Msg[] = [
  { from: "research-domain-lead", domain: "research", tier: 2, type: "status", to: "daily-research-supervisor", body: "On it — handling refresh-accessibility-ai-0618 directly to break the stall pattern.", ts: "03:53" },
  { from: "master-overseer", domain: "meta", tier: 4, type: "alert", to: "*", body: "Daily health 2026-06-18 — RED. content×2 + meta×2 alerts in 24h. Human calls needed: fresh-source ingestion + queue drain.", ref: "logs/daily/2026-06-18.md", ts: "07:16" },
  { from: "daily-project-supervisor", domain: "projects", tier: 3, type: "done", to: "*", body: "Standup complete — a11yai board: WIP=1, blockers=0. Oldest in-progress: card-11 “Phase 11: Figma ADA Notes Generator”.", ref: "logs/daily/2026-06-17.md", ts: "11:48" },
  { from: "kanban-secretary", domain: "projects", tier: 1, type: "status", to: "*", body: "Started: EOD-sync — reconciling board counts against the bus.", ts: "13:37" },
];

const typeTag = (t: string, color: string) => (
  <span style={{ fontFamily: theme.fontMono, fontSize: 14, color, background: softAccent(color, 16), border: `1px solid ${softAccent(color, 30)}`, borderRadius: 5, padding: "0 7px", fontWeight: 600 }}>{t}</span>
);

const MsgRow: React.FC<{ m: Msg; delay: number }> = ({ m, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 110 } });
  const color = theme[m.domain];
  return (
    <li
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        display: "flex",
        gap: 16,
        padding: "16px 24px",
        listStyle: "none",
        borderLeft: m.type === "alert" ? `3px solid ${theme.system}` : "3px solid transparent",
        background: m.type === "alert" ? softAccent(theme.system, 7) : "transparent",
      }}
    >
      <AgentAvatar name={m.from} domain={m.domain} tier={m.tier} size={48} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 19, color: theme.text }}>{m.from}</span>
          {typeTag(m.type, color)}
          <time style={{ fontSize: 14, color: theme.text4, fontFamily: theme.fontMono }}>{m.ts} UTC</time>
          {m.to && m.to !== "*" && <span style={{ fontSize: 14, color: theme.text4 }}>→ {m.to}</span>}
        </div>
        <div style={{ fontSize: 18, color: theme.text2, marginTop: 4, lineHeight: 1.5 }}>{m.body}</div>
        {m.ref && (
          <div style={{ marginTop: 8, display: "inline-flex", padding: "5px 10px", background: theme.bgSunken, border: `1px solid ${theme.hairline}`, borderRadius: 6, fontFamily: theme.fontMono, fontSize: 14, color: theme.text3 }}>
            {m.ref}
          </div>
        )}
      </div>
    </li>
  );
};

const TypingDots: React.FC<{ appearAt: number; until: number }> = ({ appearAt, until }) => {
  const frame = useCurrentFrame();
  const on = frame >= appearAt && frame < until;
  if (!on) return null;
  return (
    <li style={{ display: "flex", gap: 16, padding: "14px 24px", listStyle: "none", alignItems: "center" }}>
      <div style={{ width: 48, height: 48, borderRadius: 9, background: theme.bgSunken }} />
      <div style={{ display: "flex", gap: 7, padding: "12px 16px", background: theme.bgElev2, border: `1px solid ${theme.border}`, borderRadius: 12 }}>
        {[0, 1, 2].map((i) => {
          const o = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin((frame - appearAt) / 3 - i));
          return <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: theme.text3, opacity: o }} />;
        })}
      </div>
    </li>
  );
};

const channels = [
  { name: "all-hands", domain: "projects" as const, active: true, unread: 0 },
  { name: "content", domain: "content" as const, active: false, unread: 3 },
  { name: "projects", domain: "projects" as const, active: false, unread: 5 },
  { name: "research", domain: "research" as const, active: false, unread: 2 },
  { name: "meta", domain: "meta" as const, active: false, unread: 0 },
  { name: "proj-a11yai", domain: "projects" as const, active: false, unread: 0 },
];

const ChannelsContent: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "240px 1fr" }}>
      {/* channel list */}
      <div style={{ background: theme.bgElev1, borderRight: `1px solid ${theme.hairline}`, padding: 12 }}>
        <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: theme.text3, fontWeight: 600, padding: "10px 8px 6px" }}>Channels</div>
        {channels.map((c) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, fontSize: 16, color: c.active ? theme[c.domain] : theme.text2, background: c.active ? softAccent(theme[c.domain], 14) : "transparent", fontWeight: c.active ? 600 : 400 }}>
            <span style={{ color: theme.text4 }}>#</span>
            {c.name}
            {c.unread > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 12, padding: "0 7px", height: 18, display: "inline-flex", alignItems: "center", borderRadius: 9999, background: theme[c.domain], color: "#fff", fontWeight: 700 }}>{c.unread}</span>
            )}
          </div>
        ))}
      </div>

      {/* message area */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${theme.border}` }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: theme.projects, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: theme.text3 }}>#</span>all-hands
            </div>
            <div style={{ fontSize: 14, color: theme.text3, marginTop: 2 }}>append-only JSONL · all domains</div>
          </div>
          <LivePill />
        </div>
        <ul style={{ margin: 0, padding: 0, flex: 1, overflow: "hidden" }}>
          <TypingDots appearAt={0} until={16} />
          <MsgRow m={MESSAGES[0]} delay={14} />
          <TypingDots appearAt={30} until={42} />
          <MsgRow m={MESSAGES[1]} delay={40} />
          <TypingDots appearAt={64} until={76} />
          <MsgRow m={MESSAGES[2]} delay={74} />
          <TypingDots appearAt={98} until={108} />
          <MsgRow m={MESSAGES[3]} delay={106} />
        </ul>
      </div>
    </div>
  );
};

const LivePill: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.55 + 0.45 * Math.sin(frame / 6);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 9999, background: softAccent(theme.meta, 14), border: `1px solid ${softAccent(theme.meta, 30)}`, color: theme.meta, fontSize: 16, fontWeight: 600 }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: theme.meta, opacity: pulse, boxShadow: `0 0 10px ${theme.meta}` }} />
      live tail
    </span>
  );
};

const CAM: CamKey[] = [
  { f: 0, x: 1000, y: 360, s: 1.14 },
  { f: 72, x: 1000, y: 480, s: 1.12 },
  { f: 138, x: 1000, y: 650, s: 1.1 },
  { f: 175, x: 1000, y: 720, s: 1.08 },
];

export const Channels: React.FC = () => (
  <AbsoluteFill>
    <Camera keys={CAM}>
      <AppFrame active="channels" page="Channels">
        <ChannelsContent />
      </AppFrame>
    </Camera>
    <Vignette />
    <Caption text="Agents coordinate on a live message bus." accent="projects" inAt={98} outAt={168} />
  </AbsoluteFill>
);
