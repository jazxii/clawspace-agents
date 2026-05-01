"use client";

import { useState } from "react";
import { Pill } from "../_components/Pill";
import type { DomainKey } from "@/lib/route-meta";
import { DOMAIN_COLOR } from "@/lib/route-meta";

interface AgentInfo {
  id: string;
  tier: number;
  domain: string;
  model: string;
  desc: string;
}

const tierLabel = (t: number) =>
  ({ 4: "Tier 4 — Meta", 3: "Tier 3 — Supervisor", 2: "Tier 2 — Lead", 1: "Tier 1 — Worker" }[t] || `Tier ${t}`);

export default function AgentsClient({ agents }: { agents: AgentInfo[] }) {
  const [filter, setFilter] = useState("all");
  const list = agents.filter((a) => filter === "all" || a.domain === filter);

  const grouped: Record<number, AgentInfo[]> = {};
  for (const a of list) {
    (grouped[a.tier] = grouped[a.tier] || []).push(a);
  }

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Agents</h1>
          <p>{agents.length} custom workforce agents</p>
        </div>
        <div className="cs-nav-tabs" style={{ background: "var(--bg-sunken)" }}>
          {(["all", "content", "projects", "research", "meta"] as const).map((d) => (
            <button
              key={d}
              className="cs-nav-tab"
              data-active={filter === d ? "1" : "0"}
              onClick={() => setFilter(d)}
            >
              {d !== "all" && <span className="dot" style={{ background: DOMAIN_COLOR[d as DomainKey] }} />}
              {d}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(grouped)
        .map(Number)
        .sort((a, b) => b - a)
        .map((tier) => (
          <section key={tier} style={{ marginBottom: "var(--pad-5)" }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", margin: "0 0 var(--pad-2)" }}>
              {tierLabel(tier)}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--pad-3)" }}>
              {grouped[tier].map((a) => (
                <div key={a.id} className="cs-card">
                  <div className="cs-card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <span className="row" style={{ gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOMAIN_COLOR[a.domain as DomainKey] || "var(--text-4)" }} />
                        <b style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{a.id}</b>
                      </span>
                      <Pill tone={a.model === "opus" ? "research" : a.model === "sonnet" ? "projects" : "meta"}>
                        {a.model}
                      </Pill>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
