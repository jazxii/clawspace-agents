import { readActivity } from "@/lib/fs-adapter";
import { Pill } from "../_components/Pill";
import { StatTile } from "../_components/StatTile";
import type { DomainKey } from "@/lib/route-meta";
import { DOMAIN_COLOR } from "@/lib/route-meta";

export const metadata = { title: "Cost — Clawspace" };
export const dynamic = "force-dynamic";

export default async function CostPage() {
  const activity = await readActivity();

  // Aggregate by domain
  const byDomain: Record<string, number> = {};
  const byAgent: Record<string, { agent: string; domain: string; runs: number; tokens: number; cost: number; model: string }> = {};

  for (const a of activity) {
    byDomain[a.domain] = (byDomain[a.domain] || 0) + 1;
    if (!byAgent[a.agent]) {
      byAgent[a.agent] = { agent: a.agent, domain: a.domain, runs: 0, tokens: a.tokens, cost: 0, model: "sonnet" };
    }
    byAgent[a.agent].runs++;
    byAgent[a.agent].tokens += a.tokens;
  }

  const sorted = Object.values(byAgent).sort((a, b) => b.runs - a.runs);
  const maxRuns = sorted[0]?.runs || 1;
  const totalRuns = activity.length;

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Cost &amp; token usage</h1>
          <p>Today · {totalRuns} runs across {Object.keys(byDomain).length} domains</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--pad-3)", marginBottom: "var(--pad-4)" }}>
        {(["content", "projects", "research", "meta"] as const).map((d) => (
          <StatTile
            key={d}
            tint={d}
            label={d}
            value={`${byDomain[d] || 0} runs`}
            delta={totalRuns > 0 ? `${Math.round(((byDomain[d] || 0) / totalRuns) * 100)}% of activity` : "—"}
            icon="dot"
          />
        ))}
      </div>

      <div className="cs-card">
        <div className="cs-card-h">
          <h3>Per-agent breakdown</h3>
          <span className="meta">sorted by runs</span>
        </div>
        <div style={{ padding: "var(--pad-2)" }}>
          {sorted.length === 0 ? (
            <div style={{ padding: "var(--pad-4)", textAlign: "center", color: "var(--text-3)" }}>No agent activity yet</div>
          ) : (
            sorted.map((a) => (
              <div key={a.agent} className="row" style={{ padding: "10px var(--pad-3)", gap: 14, borderBottom: ".5px solid var(--hairline)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: DOMAIN_COLOR[a.domain as DomainKey] || "var(--text-4)" }} />
                <div style={{ width: 200, fontWeight: 500, fontSize: 13 }} className="ellipsis">{a.agent}</div>
                <Pill tone={a.domain as DomainKey}>{a.model}</Pill>
                <div style={{ flex: 1, height: 6, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(a.runs / maxRuns) * 100}%`, background: DOMAIN_COLOR[a.domain as DomainKey] || "var(--text-4)", opacity: 0.7 }} />
                </div>
                <span className="tnum mono muted" style={{ width: 60, textAlign: "right", fontSize: 12 }}>{a.runs}×</span>
                <span className="tnum" style={{ width: 80, textAlign: "right", fontWeight: 600 }}>{a.tokens > 0 ? a.tokens.toLocaleString() : "—"}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
