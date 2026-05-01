"use client";

import { useState } from "react";
import { Icon } from "../_components/Icon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LogsClientProps {
  dates: string[];
  initialDate: string | null;
  initialBody: string | null;
}

export default function LogsClient({ dates, initialDate, initialBody }: LogsClientProps) {
  const [date, setDate] = useState(initialDate || dates[0] || "");
  const [body, setBody] = useState(initialBody || "");
  const [loading, setLoading] = useState(false);

  const loadLog = async (d: string) => {
    setDate(d);
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${d}`);
      if (res.ok) {
        const data = await res.json();
        setBody(data.body || "");
      } else {
        setBody("*No log for this date.*");
      }
    } catch {
      setBody("*Failed to load log.*");
    }
    setLoading(false);
  };

  return (
    <div className="cs-page-inner" style={{ maxWidth: 1200 }}>
      <div className="cs-page-title">
        <div>
          <h1>Daily log</h1>
          <p>Reasoning + decisions, written by supervisors at 18:00</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "var(--pad-4)" }}>
        <aside className="cs-card" style={{ padding: "var(--pad-2)", alignSelf: "start" }}>
          <div className="cs-ch-grp">Logs</div>
          {dates.length === 0 ? (
            <div style={{ padding: "var(--pad-3)", color: "var(--text-3)", fontSize: 13 }}>No logs yet</div>
          ) : (
            dates.map((d) => (
              <div
                key={d}
                className="cs-ch-item"
                data-active={d === date ? "1" : "0"}
                role="button"
                tabIndex={0}
                onClick={() => loadLog(d)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); loadLog(d); } }}
                style={{ cursor: "pointer" }}
              >
                <Icon name="log" size={12} />
                <span>{d.slice(5)}</span>
              </div>
            ))
          )}
        </aside>
        <article className="cs-card">
          <div className="cs-card-body" style={{ padding: "var(--pad-5) var(--pad-6)" }}>
            {loading ? (
              <div className="muted">Loading…</div>
            ) : body ? (
              <div className="cs-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              </div>
            ) : (
              <div className="muted">Select a date to view its log.</div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
