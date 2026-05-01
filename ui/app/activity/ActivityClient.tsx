"use client";

import { useState } from "react";
import type { DomainKey } from "@/lib/route-meta";
import { DOMAIN_COLOR } from "@/lib/route-meta";
import { Pill } from "../_components/Pill";

interface ActivityEntry {
  t: string;
  agent: string;
  domain: string;
  dur: number;
  tokens: number;
  status: string;
  note: string;
}

export default function ActivityClient({ items }: { items: ActivityEntry[] }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = items.filter((a) => filter === "all" || a.domain === filter);
  const totalTokens = items.reduce((s, a) => s + a.tokens, 0);

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Agent activity</h1>
          <p>
            Today · {items.length} runs · {totalTokens > 0 ? `${Math.round(totalTokens / 1000)}k tokens` : "activity from bus"}
          </p>
        </div>
        <div className="cs-nav-tabs" style={{ background: "var(--bg-sunken)" }}>
          {(["all", "content", "projects", "research", "meta"] as const).map((d) => (
            <button
              key={d}
              className="cs-nav-tab"
              data-active={filter === d ? "1" : "0"}
              onClick={() => setFilter(d)}
            >
              {d !== "all" && (
                <span className="dot" style={{ background: DOMAIN_COLOR[d as DomainKey] }} />
              )}
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="cs-card">
        <table className="cs-table">
          <thead>
            <tr>
              <th style={{ width: 64 }}>Time</th>
              <th>Agent</th>
              <th>Domain</th>
              <th>Note</th>
              <th className="num" style={{ width: 80 }}>Duration</th>
              <th className="num" style={{ width: 90 }}>Tokens</th>
              <th style={{ width: 80 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-3)" }}>No activity</td></tr>
            ) : (
              filtered.map((a, i) => (
                <tr key={i}>
                  <td className="mono muted tnum">{a.t}</td>
                  <td><b style={{ fontWeight: 600 }}>{a.agent}</b></td>
                  <td><Pill tone={a.domain as DomainKey} dot>{a.domain}</Pill></td>
                  <td className="muted ellipsis" style={{ maxWidth: 360 }}>{a.note || "—"}</td>
                  <td className="num tnum">{a.dur > 0 ? `${a.dur}s` : "—"}</td>
                  <td className="num tnum">{a.tokens > 0 ? a.tokens.toLocaleString() : "—"}</td>
                  <td>
                    <Pill tone={a.status === "warn" ? "alert" : "meta"} dot>
                      {a.status === "warn" ? "warn" : "ok"}
                    </Pill>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
