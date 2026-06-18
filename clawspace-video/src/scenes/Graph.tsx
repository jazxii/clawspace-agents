import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { theme, softAccent, type DomainAccent } from "../theme";
import { AppFrame, Camera, Vignette, type CamKey } from "../ui/shell";
import { Pill, Caption } from "../ui/widgets";

type GNode = { id: string; label: string; x: number; y: number; r: number; group: DomainAccent | "core" };
const W = 1180;
const H = 720;

const NODES: GNode[] = [
  { id: "page", label: "page.tsx", x: 0.16, y: 0.24, r: 30, group: "core" },
  { id: "layout", label: "layout.tsx", x: 0.40, y: 0.13, r: 26, group: "meta" },
  { id: "cost", label: "cost", x: 0.52, y: 0.34, r: 26, group: "content" },
  { id: "graph", label: "GraphClient", x: 0.70, y: 0.48, r: 30, group: "projects" },
  { id: "kanban", label: "kanban", x: 0.84, y: 0.27, r: 26, group: "projects" },
  { id: "stat", label: "StatTile", x: 0.37, y: 0.60, r: 22, group: "research" },
  { id: "queue", label: "queue", x: 0.24, y: 0.46, r: 22, group: "content" },
  { id: "digest", label: "digest", x: 0.58, y: 0.74, r: 22, group: "research" },
  { id: "agents", label: "agents", x: 0.86, y: 0.66, r: 24, group: "meta" },
  { id: "channels", label: "channels", x: 0.66, y: 0.18, r: 22, group: "projects" },
];

const EDGES: [string, string][] = [
  ["page", "layout"], ["page", "cost"], ["page", "queue"], ["page", "stat"],
  ["cost", "stat"], ["graph", "stat"], ["graph", "kanban"], ["graph", "digest"],
  ["graph", "agents"], ["layout", "channels"], ["kanban", "channels"], ["cost", "graph"],
];

const colorFor = (g: GNode["group"]) => (g === "core" ? theme.text2 : theme[g]);
const pos = (n: GNode) => ({ x: n.x * W, y: n.y * H });

const GraphContent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // scripted hover cycle
  const order = ["page", "graph", "kanban", "cost", "agents"];
  const hover = order[Math.floor(frame / 26) % order.length];
  const connected = EDGES.filter(([a, b]) => a === hover || b === hover).length;
  const hoverNode = NODES.find((n) => n.id === hover);

  return (
    <div style={{ padding: 30, height: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: theme.text }}>
          Graphify · clawspace-agents
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 17, color: theme.text3 }}>
          Knowledge graph — {NODES.length} nodes · {EDGES.length} edges
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}>
        <div style={{ background: theme.bgElev1, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: "hidden", height: H + 20 }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
            {EDGES.map(([a, b], i) => {
              const A = NODES.find((n) => n.id === a)!;
              const B = NODES.find((n) => n.id === b)!;
              const p1 = pos(A);
              const p2 = pos(B);
              const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
              const draw = interpolate(frame - (10 + i * 4), [0, 18], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              });
              const active = hover === a || hover === b;
              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={active ? colorFor(A.group) : theme.borderStrong}
                  strokeWidth={active ? 2.4 : 1.2}
                  opacity={active ? 0.95 : 0.45}
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - draw)}
                />
              );
            })}
            {NODES.map((n, i) => {
              const p = pos(n);
              const c = colorFor(n.group);
              const active = hover === n.id;
              const s = spring({ frame: frame - (16 + i * 4), fps, config: { damping: 12, stiffness: 130, mass: 0.6 } });
              const jitterX = Math.sin((frame + i * 30) / 40) * 3;
              const jitterY = Math.cos((frame + i * 20) / 36) * 3;
              return (
                <g key={n.id} transform={`translate(${p.x + jitterX}, ${p.y + jitterY})`} opacity={s}>
                  <circle r={(n.r + (active ? 8 : 0)) * s} fill={c} opacity={active ? 0.22 : 0.09} />
                  <circle r={n.r * s} fill={theme.bgElev2} stroke={c} strokeWidth={active ? 3 : 1.8} />
                  <text textAnchor="middle" y={5} fontSize={n.r > 24 ? 17 : 14} fontWeight={600} fill={theme.text} style={{ fontFamily: theme.fontSans }}>
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: theme.bgElev2, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${theme.hairline}`, fontSize: 18, fontWeight: 600, color: theme.text, fontFamily: theme.fontMono }}>
              {hoverNode?.label}
            </div>
            <div style={{ padding: 18, fontSize: 17, color: theme.text2, lineHeight: 1.6 }}>
              <div style={{ fontSize: 14, color: theme.text3, marginBottom: 8 }}>node detail</div>
              Connected to <b style={{ color: theme.text }}>{connected}</b> nodes.
              <div style={{ marginTop: 12 }}>
                <Pill tone={(hoverNode?.group === "core" ? "meta" : (hoverNode?.group ?? "projects")) as DomainAccent} dot>
                  {hoverNode?.group}
                </Pill>
              </div>
            </div>
          </div>
          <div style={{ background: theme.bgElev2, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${theme.hairline}`, fontSize: 18, fontWeight: 600, color: theme.text }}>
              Index stats
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, fontSize: 17 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: theme.text3 }}>Nodes</span><b>{NODES.length}</b></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: theme.text3 }}>Edges</span><b>{EDGES.length}</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CAM: CamKey[] = [
  { f: 0, x: 760, y: 470, s: 1.38 },
  { f: 58, x: 820, y: 450, s: 1.22 },
  { f: 135, x: 880, y: 500, s: 1.02 }, // slow pull-back to the full graph
];

export const Graph: React.FC = () => (
  <AbsoluteFill>
    <Camera keys={CAM}>
      <AppFrame active="graph" page="Graphify">
        <GraphContent />
      </AppFrame>
    </Camera>
    <Vignette />
    <Caption text="Your whole workspace as a knowledge graph." accent="research" inAt={66} outAt={128} />
  </AbsoluteFill>
);
