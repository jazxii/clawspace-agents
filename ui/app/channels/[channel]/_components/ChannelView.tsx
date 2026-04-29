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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-6">
      <aside aria-label="Channels" className="md:sticky md:top-4 self-start">
        <h2 className="sr-only">Channel list</h2>
        <nav aria-label="Channels">
          <ul role="list" className="space-y-1 text-sm">
            {allChannels.map((ch) => (
              <li key={ch}>
                <a
                  href={`/channels/${encodeURIComponent(ch)}`}
                  aria-current={ch === channel ? "page" : undefined}
                  className={`block rounded px-2 py-1 ${
                    ch === channel ? "bg-blue-100 font-semibold" : "hover:bg-slate-100"
                  }`}
                >
                  #{ch}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section aria-labelledby="channel-h">
        <header className="page-chrome">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/channels">Channels</a></li>
              <li><span aria-current="page">{channel}</span></li>
            </ol>
          </nav>
          <div className="flex items-center justify-between gap-4">
            <h1 id="channel-h" className="text-2xl font-semibold">
              #{channel}
            </h1>
            <button
              type="button"
              onClick={() => setPauseAnnouncements((p) => !p)}
              aria-pressed={pauseAnnouncements}
              className="btn-secondary text-sm"
            >
              {pauseAnnouncements ? "Resume announcements" : "Pause announcements"}
            </button>
          </div>
        </header>

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
          className="h-[60vh] overflow-y-auto rounded border border-slate-200 bg-slate-50 p-3 space-y-3"
        >
          {messages.length === 0 ? (
            <li className="text-slate-500 italic">No messages yet.</li>
          ) : (
            messages.map((m, i) => (
              <li key={`${m.ts}-${m.from}-${i}`} id={`msg-${m.ts}`}>
                <article
                  aria-labelledby={`msg-${m.ts}-from`}
                  aria-describedby={`msg-${m.ts}-time`}
                  className="rounded bg-white p-2 border border-slate-200"
                >
                  <header className="flex items-baseline gap-2 text-xs text-slate-500">
                    <span id={`msg-${m.ts}-from`} className="font-semibold text-slate-900">
                      {m.from}
                    </span>
                    <time id={`msg-${m.ts}-time`} dateTime={m.ts}>
                      {m.ts.slice(11, 19)} UTC
                    </time>
                    <span>·</span>
                    <span>{m.type}</span>
                    {m.to && m.to !== "*" && (
                      <>
                        <span>→</span>
                        <span>{m.to}</span>
                      </>
                    )}
                  </header>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
                  {m.ref && (
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium">ref:</span> {m.ref}
                    </p>
                  )}
                </article>
              </li>
            ))
          )}
        </ol>

        {!isAtBottom && unread > 0 && (
          <div className="mt-2">
            <button
              ref={newCountBtnRef}
              type="button"
              onClick={() => {
                scrollToBottom("smooth");
                setUnread(0);
              }}
              className="rounded bg-blue-600 px-3 py-1 text-white text-sm hover:bg-blue-700"
            >
              {unread} new {unread === 1 ? "message" : "messages"} — jump to latest
            </button>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          aria-label={`Post message to #${channel}`}
          className="mt-4 space-y-2"
          id={formId}
        >
          <label htmlFor={`${formId}-body`} className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id={`${formId}-body`}
            name="body"
            required
            aria-describedby={`${formId}-help`}
            aria-invalid={postError ? true : undefined}
            className="w-full rounded border border-slate-300 p-2"
            rows={3}
          />
          <p id={`${formId}-help`} className="text-xs text-slate-500">
            Posts as <code>user</code> with type <code>note</code>.
          </p>
          {postError && (
            <p id={`${formId}-error`} role="alert" className="text-sm text-[#7f1d1d]">
              {postError}
            </p>
          )}
          <button
            type="submit"
            disabled={posting}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {posting ? "Sending…" : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
