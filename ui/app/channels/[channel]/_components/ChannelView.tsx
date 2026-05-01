"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { BusMessage } from "@/lib/fs-adapter";

/**
 * Channels view — implements ACCESSIBILITY-BRIEF §3 in full.
 *
 * Live-region policy (two-tier):
 *   - The <ol id="message-log"> is NOT a live region.
 *   - A separate polite sentinel (#live-region-polite from root layout) gets
 *     announcements. Throttled: ≥3 in 2s coalesces, debounced 1.5s, max 200 chars.
 *   - When the user has scrolled away from bottom, no auto-scroll, no announcement;
 *     a sticky "{n} new messages" button reveals.
 *   - Pause-announcements toggle silences the polite region (sets aria-live="off").
 *
 * Reduced motion: scroll-to-bottom uses 'auto' when prefers-reduced-motion is set.
 */

function setPoliteText(text: string) {
  const el = document.getElementById("live-region-polite");
  if (!el) return;
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = text;
  });
}

function setPoliteOff(off: boolean) {
  const el = document.getElementById("live-region-polite");
  if (!el) return;
  el.setAttribute("aria-live", off ? "off" : "polite");
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

interface Props {
  channel: string;
  allChannels: string[];
  initialHistory: BusMessage[];
  initialSince: string;
}

const COALESCE_WINDOW_MS = 2000;
const COALESCE_MIN = 3;
const DEBOUNCE_MS = 1500;
const MAX_ANNOUNCE_LEN = 200;
const AT_BOTTOM_THRESHOLD = 50;

export default function ChannelView({ channel, allChannels, initialHistory, initialSince }: Props) {
  const [messages, setMessages] = useState<BusMessage[]>(initialHistory);
  const [pauseAnnouncements, setPauseAnnouncements] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [postError, setPostError] = useState("");
  const [posting, setPosting] = useState(false);

  const logRef = useRef<HTMLOListElement | null>(null);
  const newCountBtnRef = useRef<HTMLButtonElement | null>(null);
  const announceQueueRef = useRef<BusMessage[]>([]);
  const lastAnnounceAtRef = useRef(0);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const formId = useId();

  // ----- SSE subscription -----
  useEffect(() => {
    const url = `/api/bus-tail?channel=${encodeURIComponent(channel)}&since=${encodeURIComponent(initialSince)}`;
    const es = new EventSource(url);
    es.addEventListener("message", (ev) => {
      try {
        const m = JSON.parse((ev as MessageEvent).data) as BusMessage;
        setMessages((prev) => {
          // Dedupe (initial fetch + SSE replay overlap)
          if (prev.some((p) => p.ts === m.ts && p.from === m.from)) return prev;
          return [...prev, m];
        });
        announceQueueRef.current.push(m);
        scheduleAnnouncement();
        if (!isAtBottomRef.current) {
          setUnread((c) => c + 1);
        } else {
          // Defer scroll until DOM has updated
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
      } catch {
        // ignore malformed
      }
    });
    es.addEventListener("error", () => {
      // EventSource auto-reconnects; nothing to do
    });
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, initialSince]);

  // Keep an isAtBottom ref so closures in SSE handler see the latest value
  const isAtBottomRef = useRef(isAtBottom);
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  // ----- Announcements (throttled + coalesced + paused) -----
  function scheduleAnnouncement() {
    if (pauseAnnouncements) {
      announceQueueRef.current = [];
      return;
    }
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    announceTimerRef.current = setTimeout(() => {
      const since = Date.now() - lastAnnounceAtRef.current;
      if (since < DEBOUNCE_MS) return;
      const queue = announceQueueRef.current;
      if (queue.length === 0) return;
      let text: string;
      const recent = queue.filter(
        (m) => Date.now() - new Date(m.ts).getTime() < COALESCE_WINDOW_MS + DEBOUNCE_MS,
      );
      if (recent.length >= COALESCE_MIN) {
        const latest = recent[recent.length - 1];
        text = `${recent.length} new messages in ${channel}, latest from ${latest.from}.`;
      } else {
        const m = queue[queue.length - 1];
        const body = m.body.length > MAX_ANNOUNCE_LEN ? `${m.body.slice(0, MAX_ANNOUNCE_LEN)}…` : m.body;
        text = `${m.from} in ${channel}: ${body}`;
      }
      setPoliteText(text);
      lastAnnounceAtRef.current = Date.now();
      announceQueueRef.current = [];
    }, DEBOUNCE_MS);
  }

  // ----- Scroll position tracking -----
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - AT_BOTTOM_THRESHOLD;
      setIsAtBottom(atBottom);
      if (atBottom) setUnread(0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to bottom on first render
  useEffect(() => {
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollToBottom(behavior: "auto" | "smooth") {
    const el = logRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : behavior });
  }

  // ----- Pause announcements toggle -----
  useEffect(() => {
    setPoliteOff(pauseAnnouncements);
    return () => setPoliteOff(false);
  }, [pauseAnnouncements]);

  // ----- Post message form -----
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPostError("");
    setPosting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("body") ?? "").trim();
    if (!body) {
      setPostError("Message cannot be empty.");
      setPosting(false);
      return;
    }
    try {
      const res = await fetch("/api/bus-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, from: "user", type: "note", body }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      form.reset();
      const ta = form.querySelector("textarea");
      if (ta instanceof HTMLTextAreaElement) ta.focus();
      setPoliteText("Message sent.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send";
      setPostError(`Failed to post: ${msg}`);
      // Assertive announcement
      const a = document.getElementById("live-region-assertive");
      if (a) {
        a.textContent = "";
        requestAnimationFrame(() => {
          a.textContent = `Failed to post: ${msg}`;
        });
      }
    } finally {
      setPosting(false);
    }
  }

  const channelDomain = (ch: string): string => {
    if (ch === "content") return "content";
    if (ch === "projects" || ch.startsWith("proj-")) return "projects";
    if (ch === "research") return "research";
    return "meta";
  };

  const domainColor: Record<string, string> = {
    content: "var(--accent-content)",
    projects: "var(--accent-projects)",
    research: "var(--accent-research)",
    meta: "var(--accent-meta)",
  };

  const domain = channelDomain(channel);

  return (
    <div className="cs-channel" style={{ flex: 1, minHeight: 0 }}>
      <aside className="cs-ch-list" aria-label="Channel list">
        <h2 className="sr-only">Channel list</h2>
        <div className="cs-ch-grp">Channels</div>
        {allChannels.filter((ch) => !ch.startsWith("dm-")).map((ch) => (
          <a
            key={ch}
            href={`/channels/${encodeURIComponent(ch)}`}
            aria-current={ch === channel ? "page" : undefined}
            className="cs-ch-item"
            data-active={ch === channel ? "1" : "0"}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <span className="hash">#</span>
            <span className="ellipsis">{ch}</span>
          </a>
        ))}
        {allChannels.some((ch) => ch.startsWith("dm-")) && (
          <>
            <div className="cs-ch-grp">Direct</div>
            {allChannels.filter((ch) => ch.startsWith("dm-")).map((ch) => (
              <a
                key={ch}
                href={`/channels/${encodeURIComponent(ch)}`}
                className="cs-ch-item"
                data-active={ch === channel ? "1" : "0"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="ellipsis">{ch.replace(/^dm-/, "")}</span>
              </a>
            ))}
          </>
        )}
      </aside>

      <div className="cs-ch-main">
        <div className="cs-ch-h">
          <div>
            <h1 id="channel-h" style={{ margin: 0, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, color: domainColor[domain] }}>
              <span style={{ color: "var(--text-3)" }}>#</span>{channel}
            </h1>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              {messages.length} messages · append-only JSONL
            </div>
          </div>
          <div className="row gap-2">
            <span className="cs-pill" data-tone={domain as "content" | "projects" | "research" | "meta"}>
              <span className="dot" />
              {pauseAnnouncements ? "paused" : "live tail"}
            </span>
            <button
              type="button"
              className="cs-icon-btn"
              onClick={() => setPauseAnnouncements((p) => !p)}
              aria-pressed={pauseAnnouncements}
              aria-label={pauseAnnouncements ? "Resume announcements" : "Pause announcements"}
            >
              {pauseAnnouncements ? "▶" : "⏸"}
            </button>
          </div>
        </div>

        <p id="history-instructions" className="sr-only">
          New messages appear at the bottom and are announced. Pause announcements with the
          button above.
        </p>

        <ol
          id="message-log"
          ref={logRef}
          tabIndex={0}
          aria-labelledby="channel-h"
          aria-describedby="history-instructions"
          className="cs-msgs"
          style={{ listStyle: "none", margin: 0, padding: "var(--pad-3) var(--pad-4)" }}
        >
          {messages.length === 0 ? (
            <li style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: 13 }}>No messages yet.</li>
          ) : (
            messages.map((m, i) => {
              const ts = m.ts ?? "";
              const from = m.from ?? "??";
              return (
              <li key={`${ts}-${from}-${i}`} id={`msg-${ts || i}`} className="cs-msg">
                <span className="av" style={{ background: domainColor[channelDomain(channel)] }}>
                  {from.slice(0, 2).toUpperCase()}
                </span>
                <div className="body" style={{ minWidth: 0 }}>
                  <div className="head" style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span id={`msg-${ts || i}-from`} className="name" style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{from}</span>
                    <span className="agent-tag" style={{ font: "500 10.5px var(--font-mono)", color: "var(--text-3)" }}>{m.type}</span>
                    <time id={`msg-${ts || i}-time`} dateTime={ts} className="ts" style={{ fontSize: 11, color: "var(--text-4)" }}>
                      {ts ? `${ts.slice(11, 16)} UTC` : "—"}
                    </time>
                    {m.to && m.to !== "*" && (
                      <span style={{ fontSize: 11, color: "var(--text-4)" }}>→ {m.to}</span>
                    )}
                  </div>
                  <div className="text" style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.body}</div>
                  {m.ref && (
                    <div className="ref" style={{
                      marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 8px", background: "var(--bg-sunken)", border: ".5px solid var(--hairline)",
                      borderRadius: "var(--r-sm)", font: "500 11px var(--font-mono)", color: "var(--text-3)"
                    }}>
                      {m.ref}
                    </div>
                  )}
                </div>
              </li>
              );
            })
          )}
        </ol>

        {!isAtBottom && unread > 0 && (
          <div style={{ padding: "0 var(--pad-4)" }}>
            <button
              ref={newCountBtnRef}
              type="button"
              onClick={() => { scrollToBottom("smooth"); setUnread(0); }}
              className="cs-btn"
              data-variant="primary"
              style={{ fontSize: 12 }}
            >
              {unread} new {unread === 1 ? "message" : "messages"} — jump to latest
            </button>
          </div>
        )}

        <div className="cs-composer">
          <form
            onSubmit={onSubmit}
            aria-label={`Post message to #${channel}`}
            id={formId}
          >
            <div className="cs-composer-input">
              <label htmlFor={`${formId}-body`} className="sr-only">Message</label>
              <textarea
                id={`${formId}-body`}
                name="body"
                required
                placeholder={`Message #${channel}…`}
                aria-describedby={`${formId}-help`}
                aria-invalid={postError ? true : undefined}
                style={{
                  border: 0, outline: 0, resize: "none", background: "transparent",
                  fontSize: 13, lineHeight: 1.5, minHeight: 28, fontFamily: "var(--font-ui)", width: "100%"
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <div className="cs-composer-row" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ flex: 1 }} />
                <span className="muted" style={{ fontSize: 11 }}>
                  <kbd className="cs-kbd">⌘</kbd> <kbd className="cs-kbd">↵</kbd> to send
                </span>
                <button type="submit" disabled={posting} className="cs-btn" data-variant="primary" style={{ height: 26 }}>
                  {posting ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
            <p id={`${formId}-help`} className="sr-only">
              Posts as user with type note.
            </p>
            {postError && (
              <p id={`${formId}-error`} role="alert" style={{ fontSize: 12, color: "var(--accent-system)", marginTop: 4 }}>
                {postError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
