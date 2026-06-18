import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { AppFrame, Camera, Vignette, type CamKey } from "../ui/shell";
import { StatTile, Pill, Card, Caption } from "../ui/widgets";

const headlines = [
  { from: "master-overseer", domain: "meta" as const, body: "Daily health 2026-06-18 — all three domains reporting.", t: "07:16" },
  { from: "daily-project-supervisor", domain: "projects" as const, body: "Standup complete — a11yai board: WIP=1, blockers=0.", t: "09:41" },
  { from: "domain-researcher", domain: "research" as const, body: "Synthesized 6 new signals into accessibility-ai notes.", t: "09:21" },
  { from: "humanizer", domain: "content" as const, body: "Applied writing signature → staged to content queue.", t: "09:40" },
];

const Headline: React.FC<{ m: (typeof headlines)[number]; i: number }> = ({ m, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - (60 + i * 7), fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [24, 0])}px)`,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 14,
        alignItems: "center",
        padding: "13px 20px",
        borderTop: i === 0 ? "none" : `1px solid ${theme.hairline}`,
      }}
    >
      <Pill tone={m.domain} dot>{m.from}</Pill>
      <div style={{ fontSize: 17, color: theme.text2, lineHeight: 1.45 }}>{m.body}</div>
      <span style={{ fontSize: 14, color: theme.text4, fontFamily: theme.fontMono }}>{m.t}</span>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  const frame = useCurrentFrame();
  const greet = spring({ frame, fps: 30, config: { damping: 200, mass: 0.9 } });
  const budget = interpolate(frame, [40, 78], [0, 42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ padding: 34, height: "100%", boxSizing: "border-box" }}>
      {/* title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
        <div style={{ opacity: greet, transform: `translateY(${interpolate(greet, [0, 1], [16, 0])}px)` }}>
          <h1 style={{ margin: 0, fontSize: 46, fontWeight: 700, letterSpacing: "-0.02em", color: theme.text }}>
            Good morning, Jassim.
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 19, color: theme.text3 }}>
            Tuesday, June 18 · 12 messages today · 1 proposal pending
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ padding: "10px 16px", borderRadius: 10, background: theme.bgSunken, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 16, fontWeight: 500 }}>
            ▶ Run health check
          </div>
          <div style={{ padding: "10px 16px", borderRadius: 10, background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 500 }}>
            ＋ New project
          </div>
        </div>
      </div>

      {/* stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 26 }}>
        <StatTile tint="content" label="Content queue" value={8} delta="5 ready · 3 drafting" spark={[3, 4, 5, 5, 6, 7, 7, 8, 8]} delay={20} />
        <StatTile tint="projects" label="Open boards" value={3} delta="2 content boards" spark={[8, 9, 10, 9, 11, 12, 11, 12, 12]} delay={26} />
        <StatTile tint="research" label="Digests" value={7} delta="latest: 2026-W24" spark={[2, 3, 3, 4, 5, 5, 6, 7, 7]} delay={32} />
        <StatTile tint="meta" label="Proposals" value={2} delta="1 pending" spark={[1, 1, 1, 2, 2, 2, 2, 2, 2]} delay={38} />
      </div>

      {/* two-col */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 22, marginTop: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card
            title={<><span style={{ width: 9, height: 9, borderRadius: "50%", background: theme.projects, display: "inline-block" }} />Today&apos;s log</>}
          >
            <div style={{ fontSize: 17, color: theme.text2, lineHeight: 1.55 }}>
              09:15 standup swept all boards · 09:21 research synthesized 6 signals · content pipeline staged 2 drafts · 18:00 EOD digests posted to the bus.
            </div>
          </Card>
          <Card title={<>💬 Bus headlines</>} bodyStyle={{ padding: 0 }}>
            {headlines.map((m, i) => (
              <Headline key={i} m={m} i={i} />
            ))}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card title={<>◎ Token budget</>}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 34, fontWeight: 700, color: theme.text, fontVariantNumeric: "tabular-nums" }}>
                {Math.round(budget)}%
              </span>
              <span style={{ color: theme.text3, fontSize: 16 }}>/ daily window</span>
            </div>
            <div style={{ height: 7, borderRadius: 9999, background: theme.bgSunken, marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: `${budget}%`, height: "100%", background: `linear-gradient(90deg, ${theme.meta}, ${theme.content} 70%, ${theme.system})` }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 15, color: theme.text3 }}>≤105k tokens/day · Claude Pro window</div>
          </Card>
          <Card title={<>🪄 Weekly proposal</>} right={<Pill tone="meta" dot>awaiting review</Pill>}>
            <div style={{ fontSize: 17, color: theme.text2, lineHeight: 1.5 }}>
              <b style={{ color: theme.text }}>2026-W25</b> — 1 proposal pending review.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CAM: CamKey[] = [
  { f: 0, x: 880, y: 500, s: 1.0 },
  { f: 52, x: 540, y: 255, s: 1.0 },
  { f: 70, x: 470, y: 235, s: 1.46 }, // slow push into the greeting
  { f: 116, x: 470, y: 235, s: 1.46 }, // long hold on "Good morning, Jassim."
  { f: 148, x: 880, y: 445, s: 1.25 }, // pan across the stat row
  { f: 175, x: 1330, y: 585, s: 1.28 }, // glide to budget + headlines
];

export const Dashboard: React.FC = () => {
  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <AppFrame active="dashboard" page="Dashboard" budgetPct={42}>
          <DashboardContent />
        </AppFrame>
      </Camera>
      <Vignette />
      <Caption text="Good morning — your whole workforce, one dashboard." accent="projects" inAt={86} outAt={168} />
    </AbsoluteFill>
  );
};
