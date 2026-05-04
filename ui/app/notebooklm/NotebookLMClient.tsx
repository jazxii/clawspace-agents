"use client";

import { useCallback, useState } from "react";
import { Icon } from "../_components/Icon";
import { Pill } from "../_components/Pill";
import type { NotebookLMDomainData } from "@/lib/fs-adapter";

interface Props {
  initialDomains: NotebookLMDomainData[];
  mode: "auto" | "manual";
}

export default function NotebookLMClient({ initialDomains, mode }: Props) {
  const [domains] = useState(initialDomains);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(
    initialDomains.length > 0 ? initialDomains[0].domain : null
  );
  const [runningPrompt, setRunningPrompt] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const totalPrompts = domains.reduce((n, d) => n + d.prompts.length, 0);
  const answeredPrompts = domains.reduce((n, d) => n + d.prompts.filter((p) => p.answered).length, 0);
  const totalSources = domains.reduce((n, d) => n + d.sourceCount, 0);
  const totalNotes = domains.reduce((n, d) => n + d.noteCount, 0);

  const handleRunPrompt = useCallback(async (domain: string, promptIndex: number, promptText: string) => {
    const key = `${domain}-${promptIndex}`;
    setRunningPrompt(key);
    setStatusMsg("");
    try {
      const res = await fetch("/api/bus-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "research",
          from: "web-ui",
          to: "notebooklm-bridge",
          type: "task",
          body: `Run prompt for ${domain}: ${promptText.slice(0, 200)}`,
          ref: `research/domains/${domain}/notebooklm-prompts.md`,
        }),
      });
      setStatusMsg(res.ok ? `Queued prompt for ${domain}` : "Failed to queue prompt");
    } catch {
      setStatusMsg("Network error");
    }
    setRunningPrompt(null);
  }, []);

  const handleRunAll = useCallback(async (domain: string) => {
    setStatusMsg("");
    try {
      const res = await fetch("/api/bus-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "research",
          from: "web-ui",
          to: "notebooklm-bridge",
          type: "task",
          body: `Run all unanswered prompts for domain: ${domain}`,
          ref: `research/domains/${domain}/notebooklm-prompts.md`,
        }),
      });
      setStatusMsg(res.ok ? `Queued all unanswered prompts for ${domain}` : "Failed to queue");
    } catch {
      setStatusMsg("Network error");
    }
  }, []);

  const handleCreateNotebook = useCallback(async (domain: string) => {
    setStatusMsg("");
    try {
      const res = await fetch("/api/bus-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "research",
          from: "web-ui",
          to: "notebooklm-bridge",
          type: "task",
          body: `Create notebook for domain: ${domain}`,
          ref: `research/domains/${domain}/PRD.md`,
        }),
      });
      setStatusMsg(res.ok ? `Create notebook queued for ${domain}` : "Failed to queue");
    } catch {
      setStatusMsg("Network error");
    }
  }, []);

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>NotebookLM</h1>
          <p>
            {domains.length} domain{domains.length !== 1 ? "s" : ""} · {answeredPrompts}/{totalPrompts} prompts answered · {totalSources} sources · {totalNotes} notes
          </p>
        </div>
        <div className="row gap-2">
          <Pill tone="research" dot>{mode === "auto" ? "Auto via MCP" : "Manual staging"}</Pill>
        </div>
      </div>

      {statusMsg && (
        <div className="cs-card" style={{ padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
          <Pill tone="research" dot>{statusMsg}</Pill>
        </div>
      )}

      {/* Connection bar */}
      <div className="cs-card" style={{ display: "flex", alignItems: "center", gap: "var(--pad-3)", padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
        <Icon name="sparkles" size={18} />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>NotebookLM</span>
          <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>
            {mode === "auto" ? "Auto via MCP" : "Manual staging"}
          </span>
        </div>
        <Pill tone="research" dot>active</Pill>
      </div>

      {domains.length === 0 && (
        <div className="cs-card" style={{ textAlign: "center", padding: "var(--pad-6)" }}>
          <Icon name="sparkles" size={32} />
          <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: "var(--pad-3)" }}>No research domains</h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: "var(--pad-2)" }}>
            Create a research domain using <code>/new-research-domain</code> to get started.
          </p>
        </div>
      )}

      {/* Domain accordions */}
      {domains.map((d) => {
        const isExpanded = expandedDomain === d.domain;
        const unanswered = d.prompts.filter((p) => !p.answered).length;

        return (
          <div key={d.domain} className="cs-card" style={{ marginBottom: "var(--pad-2)" }}>
            <button
              type="button"
              onClick={() => setExpandedDomain(isExpanded ? null : d.domain)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "var(--pad-3)",
                padding: "var(--pad-3) var(--pad-4)", background: "none", border: "none",
                cursor: "pointer", textAlign: "left", color: "inherit",
              }}
              aria-expanded={isExpanded}
            >
              <Icon name={isExpanded ? "chevron-down" : "chevron"} size={12} />
              <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{d.domain}</span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {d.sourceCount} sources · {d.noteCount} notes
              </span>
              {d.notebookId && (
                <Pill tone="research">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{d.notebookId.slice(0, 8)}…</span>
                </Pill>
              )}
              {unanswered > 0 && (
                <span style={{
                  fontSize: 10, padding: "0 5px", height: 14,
                  display: "inline-flex", alignItems: "center",
                  borderRadius: 999, background: "var(--accent-content)",
                  color: "white", fontWeight: 600,
                }}>
                  {unanswered}
                </span>
              )}
            </button>

            {isExpanded && (
              <div style={{ padding: "0 var(--pad-4) var(--pad-3)", borderTop: ".5px solid var(--hairline)" }}>
                {/* Notebook ID + actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "var(--pad-2) 0" }}>
                  {d.notebookId ? (
                    <a
                      href={`https://notebooklm.google.com/notebook/${d.notebookId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "var(--accent-research)", fontFamily: "var(--font-mono)" }}
                    >
                      Open in NotebookLM ↗
                    </a>
                  ) : (
                    <button className="cs-btn" onClick={() => handleCreateNotebook(d.domain)} style={{ fontSize: 12 }}>
                      <Icon name="plus" size={11} /> Create notebook
                    </button>
                  )}
                  <span style={{ flex: 1 }} />
                  {unanswered > 0 && (
                    <button className="cs-btn" onClick={() => handleRunAll(d.domain)} style={{ fontSize: 12 }}>
                      <Icon name="play" size={11} /> Run {unanswered} unanswered
                    </button>
                  )}
                </div>

                {/* Prompts list */}
                {d.prompts.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "var(--text-3)", fontStyle: "italic" }}>No prompts staged</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    {d.prompts.map((p, pi) => (
                      <li key={pi} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "4px 8px", borderRadius: "var(--r-sm)",
                        background: p.answered ? "transparent" : "var(--bg-sunken)",
                        fontWeight: p.answered ? 400 : 500,
                      }}>
                        {p.answered ? (
                          <Icon name="check" size={12} />
                        ) : (
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-content)", flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 12.5, flex: 1, color: p.answered ? "var(--text-3)" : "var(--text)" }}>
                          {p.text.slice(0, 120)}{p.text.length > 120 ? "…" : ""}
                        </span>
                        {p.answeredDate && (
                          <span style={{ fontSize: 11, color: "var(--text-4)" }}>{p.answeredDate}</span>
                        )}
                        {!p.answered && (
                          <button
                            className="cs-btn"
                            style={{ height: 22, fontSize: 11 }}
                            onClick={() => handleRunPrompt(d.domain, p.index, p.text)}
                            disabled={runningPrompt === `${d.domain}-${p.index}`}
                          >
                            {runningPrompt === `${d.domain}-${p.index}` ? "…" : "Run"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
