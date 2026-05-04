"use client";

import { useState, useCallback } from "react";
import { Icon } from "../_components/Icon";
import { Pill } from "../_components/Pill";
import type { NotionFullState, NotionSyncItem } from "@/lib/fs-adapter";

const DB_TABS = [
  { key: "content_queue", label: "Content Queue", icon: "queue" as const },
  { key: "research_digests", label: "Digests", icon: "digest" as const },
  { key: "content_calendar", label: "Calendar", icon: "kanban" as const },
  { key: "source_library", label: "Sources", icon: "search" as const },
  { key: "newsletter_archive", label: "Newsletter", icon: "mail" as const },
  { key: "ideas_board", label: "Ideas", icon: "sparkles" as const },
] as const;

export default function NotionClient({ initialState }: { initialState: NotionFullState }) {
  const [state] = useState(initialState);
  const [activeTab, setActiveTab] = useState<string>(DB_TABS[0].key);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState("");

  const activeDb = state.dbs.find((d) => d.key === activeTab);

  const handleSync = useCallback(async (dbKey?: string) => {
    const target = dbKey || "full";
    setSyncing(target);
    setSyncMsg("");
    try {
      const res = await fetch("/api/bus-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "content",
          from: "web-ui",
          to: "notion-db-manager",
          type: "task",
          body: dbKey
            ? `Sync database: ${dbKey}`
            : "Full sync all 6 databases",
          ref: ".notion-sync.json",
        }),
      });
      if (res.ok) {
        setSyncMsg(dbKey ? `Sync queued for ${dbKey}` : "Full sync queued — notion-db-manager will process");
      } else {
        setSyncMsg("Failed to queue sync");
      }
    } catch {
      setSyncMsg("Network error");
    }
    setSyncing(null);
  }, []);

  // Not connected state
  if (!state.config) {
    return (
      <div className="cs-page-inner">
        <div className="cs-page-title"><div><h1>Notion sync</h1><p>Not connected</p></div></div>
        <div className="cs-card" style={{ textAlign: "center", padding: "var(--pad-6)" }}>
          <Icon name="notion" size={32} />
          <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: "var(--pad-3)" }}>Set up Notion</h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: "var(--pad-2)", maxWidth: 420, margin: "var(--pad-2) auto 0" }}>
            Run <code style={{ background: "var(--bg-sunken)", padding: "2px 6px", borderRadius: 4 }}>/notion-setup</code> in Claude to create all 6 databases and connect your workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Notion sync</h1>
          <p>
            6 databases · {state.pendingTotal} pending · {state.conflicts} conflict{state.conflicts !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="row gap-2">
          <button
            className="cs-btn"
            data-variant="primary"
            onClick={() => handleSync()}
            disabled={syncing === "full"}
          >
            <Icon name="play" size={13} />
            {syncing === "full" ? "Syncing…" : "Full sync"}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="cs-card" style={{ padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
          <Pill tone="meta" dot>{syncMsg}</Pill>
        </div>
      )}

      {/* Connection status */}
      <div className="cs-card" style={{ display: "flex", alignItems: "center", gap: "var(--pad-3)", padding: "var(--pad-3) var(--pad-4)", marginBottom: "var(--pad-3)" }}>
        <Icon name="notion" size={18} />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Connected</span>
          <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>
            Setup: {new Date(state.config.setup_at).toLocaleDateString()}
          </span>
        </div>
        <Pill tone="meta" dot>active</Pill>
      </div>

      {/* 6-tab navigation */}
      <div className="cs-nav-tabs" style={{ background: "var(--bg-sunken)", marginBottom: "var(--pad-3)" }}>
        {DB_TABS.map((tab) => {
          const db = state.dbs.find((d) => d.key === tab.key);
          const pending = db?.pendingCount ?? 0;
          return (
            <button
              key={tab.key}
              className="cs-nav-tab"
              data-active={activeTab === tab.key ? "1" : "0"}
              onClick={() => setActiveTab(tab.key)}
              style={{ position: "relative" }}
            >
              <Icon name={tab.icon} size={12} />
              {tab.label}
              {pending > 0 && (
                <span style={{
                  fontSize: 10, padding: "0 5px", height: 14,
                  display: "inline-flex", alignItems: "center",
                  borderRadius: 999, background: "var(--accent-content)",
                  color: "white", fontWeight: 600, marginLeft: 4,
                }}>
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      {activeDb && (
        <div className="cs-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--pad-3) var(--pad-4)", borderBottom: ".5px solid var(--hairline)" }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{activeDb.label}</h2>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: "2px 0 0" }}>
                {activeDb.totalCount} items · {activeDb.pendingCount} pending ·{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{activeDb.dbId.slice(0, 8)}…</span>
              </p>
            </div>
            <button
              className="cs-btn"
              onClick={() => handleSync(activeDb.key)}
              disabled={syncing === activeDb.key}
            >
              <Icon name="play" size={12} />
              {syncing === activeDb.key ? "Syncing…" : "Sync DB"}
            </button>
          </div>

          <table className="cs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Notion ID</th>
              </tr>
            </thead>
            <tbody>
              {activeDb.items.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-3)" }}>No items</td></tr>
              ) : (
                activeDb.items.map((item: NotionSyncItem) => (
                  <tr key={item.id} style={item.conflict ? { borderLeft: "3px solid var(--accent-system)" } : undefined}>
                    <td>
                      <b>{item.title}</b>
                      {item.conflict && <Pill tone="alert" dot style={{ marginLeft: 8 }}>conflict</Pill>}
                    </td>
                    <td><Pill tone={item.channel === "content" ? "content" : "research"}>{item.channel}</Pill></td>
                    <td>
                      <Pill tone={item.status === "ready" ? "meta" : item.status === "posted" ? "projects" : "content"} dot>
                        {item.status}
                      </Pill>
                    </td>
                    <td className="muted tnum">{item.scheduled}</td>
                    <td>
                      {item.notionPageId ? (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>
                          {item.notionPageId.slice(0, 8)}…
                        </span>
                      ) : (
                        <Pill tone="content" dot>pending</Pill>
                      )}
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
