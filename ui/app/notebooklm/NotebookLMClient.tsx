"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "../_components/Icon";
import { Pill } from "../_components/Pill";
import type { NotebookLMDomainData } from "@/lib/fs-adapter";

interface NLMSettings {
  connected: boolean;
  mode: "auto" | "manual";
  projectUrl: string;
  lastRunAt: string;
  hasAuth: boolean;
}

export default function NotebookLMClient({ initialDomains }: { initialDomains: NotebookLMDomainData[] }) {
  const [domains] = useState(initialDomains);
  const [settings, setSettings] = useState<NLMSettings | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(
    initialDomains.length > 0 ? initialDomains[0].domain : null
  );
  const [runningPrompt, setRunningPrompt] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  // Form state
  const [mode, setMode] = useState<"auto" | "manual">("manual");
  const [authToken, setAuthToken] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/notebooklm/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => setSettings({ connected: false, mode: "manual", projectUrl: "", lastRunAt: "", hasAuth: false }));
  }, []);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch("/api/notebooklm/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, authToken: authToken || undefined, projectUrl: projectUrl.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setFormError(d.error || "Failed to save");
        return;
      }
      const d = await res.json();
      setSettings(d);
      setShowSetup(false);
      setAuthToken("");
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  }, [mode, authToken, projectUrl]);

  const handleDisconnect = useCallback(async () => {
    try {
      await fetch("/api/notebooklm/settings", { method: "DELETE" });
      setSettings({ connected: false, mode: "manual", projectUrl: "", lastRunAt: "", hasAuth: false });
    } catch { /* ignore */ }
  }, []);

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
      if (res.ok) {
        setStatusMsg(`Queued prompt for ${domain} — notebooklm-bridge will process it`);
      } else {
        setStatusMsg("Failed to queue prompt");
      }
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
      if (res.ok) {
        setStatusMsg(`Queued all unanswered prompts for ${domain}`);
      } else {
        setStatusMsg("Failed to queue");
      }
    } catch {
      setStatusMsg("Network error");
    }
  }, []);

  const totalPrompts = domains.reduce((n, d) => n + d.prompts.length, 0);
  const answeredPrompts = domains.reduce((n, d) => n + d.prompts.filter((p) => p.answered).length, 0);
  const totalSources = domains.reduce((n, d) => n + d.sourceCount, 0);

  if (!settings) {
    return (
      <div className="cs-page-inner">
        <div className="cs-page-title"><div><h1>NotebookLM</h1><p>Loading…</p></div></div>
      </div>
    );
  }

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>NotebookLM sync</h1>
          <p>
            {settings.connected
              ? <>{domains.length} domain{domains.length !== 1 ? "s" : ""} · {answeredPrompts}/{totalPrompts} prompts answered · {totalSources} sources</>
              : "Connect NotebookLM to run grounded research queries"}
          </p>
        </div>
        <div className="row gap-2">
          {settings.connected ? (
            <>
              <Pill tone="research" dot>{settings.mode === "auto" ? "auto" : "manual"}</Pill>
              <button className="cs-btn" onClick={() => setShowSetup(true)}>
                <Icon name="settings" size={13} />Settings
              </button>
            </>
          ) : (
            <button className="cs-btn" data-variant="primary" onClick={() => setShowSetup(true)}>
              <Icon name="sparkles" size={13} />Connect NotebookLM
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="cs-card" style={{ padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
          <Pill tone="research" dot>{statusMsg}</Pill>
        </div>
      )}

      {/* Setup dialog */}
      {showSetup && (
        <div className="cs-card" style={{ marginBottom: "var(--pad-4)", border: "1px solid var(--accent-research)", padding: "var(--pad-4)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: "var(--pad-3)" }}>
            {settings.connected ? "NotebookLM settings" : "Connect NotebookLM"}
          </h2>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--pad-3)" }}>
            <div>
              <span id="nlm-mode-label" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Mode</span>
              <div className="row gap-2" role="group" aria-labelledby="nlm-mode-label">
                <button type="button" className="cs-btn" data-variant={mode === "auto" ? "primary" : undefined}
                  onClick={() => setMode("auto")} aria-pressed={mode === "auto"}>
                  Auto
                </button>
                <button type="button" className="cs-btn" data-variant={mode === "manual" ? "primary" : undefined}
                  onClick={() => setMode("manual")} aria-pressed={mode === "manual"}>
                  Manual
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                <b>Auto:</b> notebooklm-bridge runs queries via MCP server. <b>Manual:</b> prompts are staged; you copy/paste to NotebookLM.
              </p>
            </div>
            {mode === "auto" && (
              <div>
                <label htmlFor="nlm-auth" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  Auth token
                </label>
                <input
                  id="nlm-auth"
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder={settings.hasAuth ? "••••••••••• (saved)" : "Per MCP server docs"}
                  autoComplete="off"
                  style={{
                    width: "100%", padding: "6px 10px", fontSize: 13,
                    border: "1px solid var(--hairline)", borderRadius: "var(--r-sm)",
                    background: "var(--bg-elev-2)", color: "var(--text)",
                  }}
                />
              </div>
            )}
            <div>
              <label htmlFor="nlm-url" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                NotebookLM project URL <span style={{ color: "var(--text-3)" }}>(optional)</span>
              </label>
              <input
                id="nlm-url"
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder={settings.projectUrl || "https://notebooklm.google.com/notebook/..."}
                style={{
                  width: "100%", padding: "6px 10px", fontSize: 13,
                  border: "1px solid var(--hairline)", borderRadius: "var(--r-sm)",
                  background: "var(--bg-elev-2)", color: "var(--text)",
                }}
              />
            </div>
            {formError && (
              <p role="alert" style={{ fontSize: 12, color: "var(--accent-system)" }}>{formError}</p>
            )}
            <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
              {settings.connected && (
                <button type="button" className="cs-btn" onClick={handleDisconnect}
                  style={{ color: "var(--accent-system)" }}>
                  Disconnect
                </button>
              )}
              <button type="button" className="cs-btn" onClick={() => setShowSetup(false)}>Cancel</button>
              <button type="submit" className="cs-btn" data-variant="primary" disabled={saving}>
                {saving ? "Saving…" : settings.connected ? "Update" : "Connect"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Connection status */}
      {settings.connected && !showSetup && (
        <div className="cs-card" style={{ display: "flex", alignItems: "center", gap: "var(--pad-3)", padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
          <Icon name="sparkles" size={18} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>NotebookLM</span>
            <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>
              {settings.mode === "auto" ? "Auto via MCP" : "Manual staging"}
            </span>
          </div>
          <Pill tone="research" dot>active</Pill>
          {settings.lastRunAt && (
            <span style={{ fontSize: 11, color: "var(--text-4)" }}>Last run: {settings.lastRunAt}</span>
          )}
        </div>
      )}

      {/* Not connected state */}
      {!settings.connected && !showSetup && (
        <div className="cs-card" style={{ textAlign: "center", padding: "var(--pad-6)" }}>
          <Icon name="sparkles" size={32} />
          <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: "var(--pad-3)" }}>Connect NotebookLM</h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: "var(--pad-2)", maxWidth: 420, margin: "var(--pad-2) auto 0" }}>
            Run grounded research queries against your NotebookLM notebooks. Prompts are defined per research domain in <code>notebooklm-prompts.md</code>.
          </p>
          <button className="cs-btn" data-variant="primary" style={{ marginTop: "var(--pad-4)" }} onClick={() => setShowSetup(true)}>
            <Icon name="sparkles" size={13} />Set up connection
          </button>
        </div>
      )}

      {/* Domain accordions with prompts */}
      {domains.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--pad-3)" }}>
          {domains.map((d) => {
            const unanswered = d.prompts.filter((p) => !p.answered).length;
            const isExpanded = expandedDomain === d.domain;
            return (
              <div key={d.domain} className="cs-card" style={{ overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setExpandedDomain(isExpanded ? null : d.domain)}
                  aria-expanded={isExpanded}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "var(--pad-3)",
                    padding: "var(--pad-3) var(--pad-4)", border: 0, background: "transparent",
                    cursor: "pointer", textAlign: "left", color: "var(--text)",
                  }}
                >
                  <Icon name={isExpanded ? "chevron-down" : "chevron"} size={12} />
                  <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>
                    {d.domain.replace(/-/g, " ")}
                  </span>
                  <span className="row gap-2">
                    <Pill tone="research">{d.sourceCount} sources</Pill>
                    <Pill tone="research">{d.noteCount} notes</Pill>
                    {unanswered > 0 && <Pill tone="alert">{unanswered} pending</Pill>}
                    {unanswered === 0 && d.prompts.length > 0 && <Pill tone="meta">all answered</Pill>}
                  </span>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--hairline)", padding: "var(--pad-3) var(--pad-4)" }}>
                    {unanswered > 0 && settings?.connected && (
                      <div style={{ marginBottom: "var(--pad-3)" }}>
                        <button className="cs-btn" data-variant="primary" onClick={() => handleRunAll(d.domain)}>
                          <Icon name="play" size={13} />Run {unanswered} unanswered prompt{unanswered !== 1 ? "s" : ""}
                        </button>
                      </div>
                    )}
                    {d.prompts.length === 0 ? (
                      <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>
                        No prompts defined. Add questions to <code>research/domains/{d.domain}/notebooklm-prompts.md</code>
                      </p>
                    ) : (
                      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--pad-2)" }}>
                        {d.prompts.map((p) => {
                          const key = `${d.domain}-${p.index}`;
                          return (
                            <li key={key} style={{
                              display: "flex", alignItems: "flex-start", gap: "var(--pad-3)",
                              padding: "var(--pad-2) var(--pad-3)",
                              background: p.answered ? "transparent" : "var(--bg-sunken)",
                              borderRadius: "var(--r-sm)",
                            }}>
                              <span style={{
                                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 600, marginTop: 1,
                                background: p.answered ? "var(--accent-meta)" : "var(--accent-research)",
                                color: "#fff",
                              }}>
                                {p.answered ? "✓" : p.index + 1}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: 13, lineHeight: 1.5, margin: 0,
                                  color: p.answered ? "var(--text-3)" : "var(--text)",
                                  textDecoration: p.answered ? "line-through" : "none",
                                }}>
                                  {p.text}
                                </p>
                                {p.answered && p.answeredDate && (
                                  <span style={{ fontSize: 11, color: "var(--text-4)" }}>
                                    Answered {p.answeredDate}
                                  </span>
                                )}
                              </div>
                              {!p.answered && settings?.connected && (
                                <button
                                  className="cs-btn"
                                  onClick={() => handleRunPrompt(d.domain, p.index, p.text)}
                                  disabled={runningPrompt === key}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Icon name="play" size={12} />
                                  {runningPrompt === key ? "…" : "Run"}
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {domains.length === 0 && settings.connected && (
        <div className="cs-card" style={{ textAlign: "center", padding: "var(--pad-5)", color: "var(--text-3)" }}>
          <p style={{ fontSize: 13 }}>No research domains found. Run <code>/new-research-domain</code> to create one.</p>
        </div>
      )}
    </div>
  );
}
