"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "../_components/Icon";
import { Pill } from "../_components/Pill";
import type { NotionSyncItem } from "@/lib/fs-adapter";

interface NotionSettingsState {
  connected: boolean;
  contentDbId: string;
  researchDbId: string;
  workspaceName: string;
  lastSyncAt: string;
  hasToken: boolean;
}

export default function NotionClient({ initialPages }: { initialPages: NotionSyncItem[] }) {
  const [pages] = useState(initialPages);
  const [settings, setSettings] = useState<NotionSettingsState | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  // Form state
  const [token, setToken] = useState("");
  const [contentDb, setContentDb] = useState("");
  const [researchDb, setResearchDb] = useState("");
  const [wsName, setWsName] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/notion/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => setSettings({ connected: false, contentDbId: "", researchDbId: "", workspaceName: "", lastSyncAt: "", hasToken: false }));
  }, []);

  const handleConnect = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!token.startsWith("ntn_")) {
      setFormError("Token must start with ntn_");
      return;
    }
    if (!contentDb.trim()) {
      setFormError("Content database ID is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/notion/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationToken: token,
          contentDbId: contentDb.trim(),
          researchDbId: researchDb.trim(),
          workspaceName: wsName.trim() || "My Workspace",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setFormError(d.error || "Failed to save");
        return;
      }
      const d = await res.json();
      setSettings(d);
      setShowSetup(false);
      setToken("");
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  }, [token, contentDb, researchDb, wsName]);

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/notion/settings", { method: "DELETE" });
      setSettings({ connected: false, contentDbId: "", researchDbId: "", workspaceName: "", lastSyncAt: "", hasToken: false });
    } catch { /* ignore */ }
    setDisconnecting(false);
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/bus-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "content",
          from: "web-ui",
          to: "notion-publisher",
          type: "task",
          body: "Manual sync requested from web UI",
          ref: "notion-sync",
        }),
      });
      if (res.ok) {
        setSyncMsg("Sync request queued — notion-publisher will pick it up");
      } else {
        setSyncMsg("Failed to queue sync request");
      }
    } catch {
      setSyncMsg("Network error");
    }
    setSyncing(false);
  }, []);

  const conflicts = pages.filter((p) => p.conflict).length;

  if (!settings) {
    return (
      <div className="cs-page-inner">
        <div className="cs-page-title"><div><h1>Notion sync</h1><p>Loading…</p></div></div>
      </div>
    );
  }

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Notion sync</h1>
          <p>
            {settings.connected
              ? <>{pages.length} pages mirrored · {conflicts} conflict{conflicts !== 1 ? "s" : ""} pending</>
              : "Connect your Notion workspace to mirror content"}
          </p>
        </div>
        <div className="row gap-2">
          {settings.connected ? (
            <>
              <button className="cs-btn" onClick={handleSync} disabled={syncing}>
                <Icon name="play" size={13} />{syncing ? "Syncing…" : "Sync now"}
              </button>
              <button className="cs-btn" onClick={() => setShowSetup(true)}>
                <Icon name="settings" size={13} />Settings
              </button>
            </>
          ) : (
            <button className="cs-btn" data-variant="primary" onClick={() => setShowSetup(true)}>
              <Icon name="notion" size={13} />Connect Notion
            </button>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className="cs-card" style={{ padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
          <Pill tone="meta" dot>{syncMsg}</Pill>
        </div>
      )}

      {/* Connection setup dialog */}
      {showSetup && (
        <div className="cs-card" style={{ marginBottom: "var(--pad-4)", border: "1px solid var(--accent)", padding: "var(--pad-4)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: "var(--pad-3)" }}>
            {settings.connected ? "Notion connection settings" : "Connect to Notion"}
          </h2>
          <form onSubmit={handleConnect} style={{ display: "flex", flexDirection: "column", gap: "var(--pad-3)" }}>
            <div>
              <label htmlFor="notion-token" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                Integration token
              </label>
              <input
                id="notion-token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={settings.hasToken ? "••••••••••• (saved)" : "ntn_..."}
                autoComplete="off"
                style={{
                  width: "100%", padding: "6px 10px", fontSize: 13,
                  border: "1px solid var(--hairline)", borderRadius: "var(--r-sm)",
                  background: "var(--bg-elev-2)", color: "var(--text)",
                }}
              />
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                Create an internal integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>notion.so/my-integrations</a>
              </p>
            </div>
            <div>
              <label htmlFor="notion-content-db" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                Content database ID <span style={{ color: "var(--accent-system)" }}>*</span>
              </label>
              <input
                id="notion-content-db"
                type="text"
                value={contentDb}
                onChange={(e) => setContentDb(e.target.value)}
                placeholder={settings.contentDbId || "32-character UUID from database URL"}
                required
                style={{
                  width: "100%", padding: "6px 10px", fontSize: 13,
                  border: "1px solid var(--hairline)", borderRadius: "var(--r-sm)",
                  background: "var(--bg-elev-2)", color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            <div>
              <label htmlFor="notion-research-db" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                Research database ID <span style={{ color: "var(--text-3)" }}>(optional)</span>
              </label>
              <input
                id="notion-research-db"
                type="text"
                value={researchDb}
                onChange={(e) => setResearchDb(e.target.value)}
                placeholder={settings.researchDbId || "32-character UUID"}
                style={{
                  width: "100%", padding: "6px 10px", fontSize: 13,
                  border: "1px solid var(--hairline)", borderRadius: "var(--r-sm)",
                  background: "var(--bg-elev-2)", color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            <div>
              <label htmlFor="notion-ws" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                Workspace name
              </label>
              <input
                id="notion-ws"
                type="text"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                placeholder={settings.workspaceName || "My Workspace"}
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
                <button type="button" className="cs-btn" onClick={handleDisconnect} disabled={disconnecting}
                  style={{ color: "var(--accent-system)" }}>
                  {disconnecting ? "Disconnecting…" : "Disconnect"}
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

      {/* Connection status card */}
      {settings.connected && !showSetup && (
        <div className="cs-card" style={{ display: "flex", alignItems: "center", gap: "var(--pad-3)", padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
          <Icon name="notion" size={18} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{settings.workspaceName}</span>
            <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>Connected</span>
          </div>
          <Pill tone="meta" dot>active</Pill>
          {settings.lastSyncAt && (
            <span style={{ fontSize: 11, color: "var(--text-4)" }}>Last sync: {settings.lastSyncAt}</span>
          )}
        </div>
      )}

      {/* Not connected state */}
      {!settings.connected && !showSetup && (
        <div className="cs-card" style={{ textAlign: "center", padding: "var(--pad-6)" }}>
          <Icon name="notion" size={32} />
          <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: "var(--pad-3)" }}>Connect Notion</h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: "var(--pad-2)", maxWidth: 400, margin: "var(--pad-2) auto 0" }}>
            Mirror your content queue and research digests to a Notion database. Local markdown is always the source of truth.
          </p>
          <button className="cs-btn" data-variant="primary" style={{ marginTop: "var(--pad-4)" }} onClick={() => setShowSetup(true)}>
            <Icon name="notion" size={13} />Connect workspace
          </button>
        </div>
      )}

      {/* Sync table */}
      {settings.connected && (
        <div className="cs-card">
          <table className="cs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Last synced</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-3)" }}>No content to sync</td></tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.title}</b>
                      {p.conflict && (
                        <Pill tone="alert" dot style={{ marginLeft: 8 }}>conflict</Pill>
                      )}
                    </td>
                    <td><Pill tone="content">{p.channel}</Pill></td>
                    <td>
                      <Pill tone={p.status.toLowerCase() === "ready" ? "meta" : "content"} dot>
                        {p.status}
                      </Pill>
                    </td>
                    <td className="muted tnum">{p.scheduled}</td>
                    <td className="muted tnum">{p.lastSynced}</td>
                    <td>
                      <button className="cs-btn" data-variant="ghost">
                        <Icon name="arrow-right" size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
