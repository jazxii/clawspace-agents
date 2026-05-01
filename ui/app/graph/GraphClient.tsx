"use client";

import { useState } from "react";
import { Pill } from "../_components/Pill";
import { Icon } from "../_components/Icon";
import type { DomainKey } from "@/lib/route-meta";

const DOMAIN_COLOR: Record<string, string> = {
  content: "var(--accent-content)",
  projects: "var(--accent-projects)",
  research: "var(--accent-research)",
  meta: "var(--accent-meta)",
  core: "var(--text-2)",
};

interface GraphNode {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  group: string;
}

type GraphEdge = [string, string];

export default function GraphClient({
  nodes,
  edges,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const W = 800;
  const H = 480;
  const pos = (n: GraphNode) => ({ x: n.x * W, y: n.y * H });
  const colorFor = (g: string) => DOMAIN_COLOR[g] || "var(--text-3)";

  const connectedCount = hover
    ? edges.filter(([a, b]) => a === hover || b === hover).length
    : 0;
  const hoverNode = hover ? nodes.find((n) => n.id === hover) : null;

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Graphify · clawspace-agents</h1>
          <p>Knowledge graph — {nodes.length} nodes · {edges.length} edges</p>
        </div>
        <div className="row gap-2">
          <button className="cs-btn">
            <Icon name="filter" size={13} />All domains
          </button>
          <button className="cs-btn" data-variant="primary">
            <Icon name="play" size={13} />Re-index
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "var(--pad-4)" }}>
        <div className="cs-graph" style={{ height: H }}>
          <svg viewBox={`0 0 ${W} ${H}`}>
            {edges.map(([a, b], i) => {
              const A = nodes.find((n) => n.id === a);
              const B = nodes.find((n) => n.id === b);
              if (!A || !B) return null;
              const p1 = pos(A);
              const p2 = pos(B);
              const active = hover && (hover === a || hover === b);
              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={active ? colorFor(A.group) : "var(--border-strong)"}
                  strokeWidth={active ? 1.5 : 0.7}
                  opacity={active ? 0.9 : 0.5}
                />
              );
            })}
            {nodes.map((n) => {
              const p = pos(n);
              const c = colorFor(n.group);
              const active = hover === n.id;
              return (
                <g
                  key={n.id}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "default" }}
                >
                  <circle cx={p.x} cy={p.y} r={n.r + (active ? 6 : 0)} fill={c} opacity={active ? 0.18 : 0.08} />
                  <circle cx={p.x} cy={p.y} r={n.r} fill="var(--bg-elev-2)" stroke={c} strokeWidth={active ? 2.5 : 1.5} />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fontSize={n.r > 18 ? 12 : 10}
                    fontWeight={600}
                    fill="var(--text)"
                    style={{ pointerEvents: "none", fontFamily: "var(--font-ui)" }}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <aside className="col gap-3">
          <div className="cs-card">
            <div className="cs-card-h">
              <h3>{hoverNode ? hoverNode.id : "Hover a node"}</h3>
            </div>
            <div className="cs-card-body" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-2)" }}>
              {hoverNode ? (
                <>
                  <div className="muted" style={{ fontSize: 11.5, marginBottom: 8 }}>node detail</div>
                  <div>Connected to <b>{connectedCount}</b> nodes.</div>
                  <div style={{ marginTop: 10 }}>
                    <Pill tone={hoverNode.group as DomainKey} dot>{hoverNode.group}</Pill>
                  </div>
                </>
              ) : (
                <span className="muted">Move over a node to see its neighbours.</span>
              )}
            </div>
          </div>
          <div className="cs-card">
            <div className="cs-card-h"><h3>Index stats</h3></div>
            <div className="cs-card-body" style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              {[
                ["Nodes", String(nodes.length)],
                ["Edges", String(edges.length)],
              ].map(([k, v]) => (
                <div key={k} className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted">{k}</span>
                  <b className="tnum">{v}</b>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
