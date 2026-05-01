"use client";

import { useState } from "react";
import { Pill } from "../_components/Pill";
import { Icon } from "../_components/Icon";
import type { IconName } from "../_components/Icon";

interface QueueItem {
  id: string;
  channel: string;
  title: string;
  status: string;
  date: string;
  author: string;
  hooks: number;
}

const icoFor = (c: string): IconName =>
  c === "LinkedIn" ? "linkedin" : c === "Instagram" ? "instagram" : c === "X" ? "twitter" : "mail";

export default function QueueClient({ items }: { items: QueueItem[] }) {
  const [tab, setTab] = useState("all");
  const list = items.filter((c) => tab === "all" || c.channel.toLowerCase() === tab);

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Content queue</h1>
          <p>Drafted posts across LinkedIn / Instagram / X / Newsletter — staged, never auto-posted</p>
        </div>
        <div className="row gap-2">
          <button className="cs-btn">
            <Icon name="notion" size={13} />Sync to Notion
          </button>
          <button className="cs-btn" data-variant="primary">
            <Icon name="plus" size={13} />New draft
          </button>
        </div>
      </div>

      <div className="cs-nav-tabs" style={{ marginBottom: "var(--pad-3)", display: "inline-flex", background: "var(--bg-sunken)" }}>
        {["all", "linkedin", "instagram", "x", "newsletter"].map((t) => (
          <button key={t} className="cs-nav-tab" data-active={tab === t ? "1" : "0"} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--pad-3)" }}>
        {list.length === 0 ? (
          <div className="cs-card">
            <div className="cs-card-body" style={{ color: "var(--text-3)" }}>No items in queue</div>
          </div>
        ) : (
          list.map((c) => (
            <div key={c.id} className="cs-card">
              <div className="cs-card-h">
                <h3><Icon name={icoFor(c.channel)} size={14} />{c.channel}</h3>
                <Pill
                  tone={c.status.toLowerCase() === "ready" ? "meta" : c.status.toLowerCase() === "drafting" ? "content" : "projects"}
                  dot
                >
                  {c.status}
                </Pill>
              </div>
              <div className="cs-card-body">
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 10 }}>{c.title}</div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 11.5, color: "var(--text-3)" }}>
                  <span className="row" style={{ gap: 6 }}><Icon name="dot" size={10} />{c.author}</span>
                  <span className="tnum">{c.date}</span>
                </div>
                {c.hooks > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <Pill tone="content">{c.hooks} hooks</Pill>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
