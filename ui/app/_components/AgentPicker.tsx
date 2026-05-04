"use client";

import { useState, useRef, useEffect } from "react";
import AgentAvatar from "./AgentAvatar";
import { Pill } from "./Pill";

export interface AgentPickerItem {
  id: string;
  tier: number;
  domain: string;
  model: string;
  desc: string;
}

interface Props {
  agents: AgentPickerItem[];
  onSelect: (agent: AgentPickerItem) => void;
  onClose: () => void;
}

const tierLabel = (t: number) =>
  ({ 4: "Tier 4 — Meta", 3: "Tier 3 — Supervisor", 2: "Tier 2 — Lead", 1: "Tier 1 — Worker" }[t] || `Tier ${t}`);

export default function AgentPicker({ agents, onSelect, onClose }: Props) {
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = agents.filter((a) =>
    a.id.toLowerCase().includes(filter.toLowerCase()) ||
    a.domain.toLowerCase().includes(filter.toLowerCase())
  );

  const grouped: Record<number, AgentPickerItem[]> = {};
  for (const a of filtered) {
    (grouped[a.tier] = grouped[a.tier] || []).push(a);
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        right: 0,
        maxHeight: 320,
        background: "var(--bg-elev-2)",
        border: ".5px solid var(--border)",
        borderRadius: "var(--r-md)",
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
      role="dialog"
      aria-label="Select an agent"
    >
      <div style={{ padding: "8px", borderBottom: ".5px solid var(--hairline)" }}>
        <input
          ref={inputRef}
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter agents…"
          style={{
            width: "100%", padding: "4px 8px", fontSize: 12.5,
            border: ".5px solid var(--hairline)", borderRadius: "var(--r-sm)",
            background: "var(--bg)", color: "var(--text)", outline: "none",
          }}
          aria-label="Filter agents"
        />
      </div>
      <div style={{ overflow: "auto", flex: 1, padding: "4px" }}>
        {Object.keys(grouped)
          .map(Number)
          .sort((a, b) => b - a)
          .map((tier) => (
            <div key={tier}>
              <div style={{
                fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em",
                color: "var(--text-3)", fontWeight: 600, padding: "6px 8px",
              }}>
                {tierLabel(tier)}
              </div>
              {grouped[tier].map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { onSelect(a); onClose(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "4px 8px", border: "none", background: "none",
                    borderRadius: "var(--r-sm)", cursor: "pointer", color: "inherit",
                    textAlign: "left",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onFocus={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "none"; }}
                  onBlur={(e) => { e.currentTarget.style.background = "none"; }}
                >
                  <AgentAvatar name={a.id} domain={a.domain} size={24} />
                  <span style={{ flex: 1, fontSize: 12.5, fontFamily: "var(--font-mono)" }}>{a.id}</span>
                  <Pill tone={a.domain as "content" | "projects" | "research" | "meta"}>
                    {a.domain}
                  </Pill>
                </button>
              ))}
            </div>
          ))}
        {filtered.length === 0 && (
          <div style={{ padding: 16, textAlign: "center", color: "var(--text-3)", fontSize: 12.5 }}>
            No agents match
          </div>
        )}
      </div>
    </div>
  );
}
