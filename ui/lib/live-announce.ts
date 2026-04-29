/**
 * liveAnnounce — single-coordinator implementation per ACCESSIBILITY-BRIEF-V2 §4.
 *
 * Every component announces through this module instead of writing to its own
 * aria-live region. Two global regions exist (#live-region-polite and
 * #live-region-assertive). The coordinator implements:
 *
 *  - Priority queue with categories (assertive-error preempts everything)
 *  - 1.5s coalescing per low-priority category (latest wins)
 *  - 1s overall rate ceiling (assertive-error bypasses)
 *  - Quiet zone while Cmd-K is open (suppresses notification + data-update)
 *  - User-pause flag (drops all but assertive-error). WCAG 2.2.2.
 *
 * The coordinator is intentionally small: ~150 LOC, no deps. Imported by
 * client components only (the regions are mounted in <body> by the root layout).
 */

export type LiveCategory =
  | "assertive-error"
  | "route-change"
  | "drag"
  | "form-feedback"
  | "notification"
  | "data-update"
  | "count-tick";

interface Item {
  category: LiveCategory;
  text: string;
  ts: number;
}

const COALESCE_WINDOW_MS = 1500;
const RATE_CEILING_MS = 1000;

class LiveAnnouncer {
  private polite: HTMLElement | null = null;
  private assertive: HTMLElement | null = null;
  private queue: Item[] = [];
  private lastFlushAt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private paused = false;
  private quietZone = false;

  private regions() {
    if (typeof document === "undefined") return;
    if (!this.polite) this.polite = document.getElementById("live-region-polite");
    if (!this.assertive) this.assertive = document.getElementById("live-region-assertive");
  }

  /** WCAG 2.2.2 — user pause. */
  setPaused(p: boolean) { this.paused = p; }
  /** Cmd-K open: drop notification + data-update. */
  setQuietZone(q: boolean) { this.quietZone = q; }

  polite_(text: string, category: LiveCategory = "data-update") {
    this.enqueue({ category, text, ts: Date.now() });
  }

  assertive_(text: string) {
    // Bypass queue + rate ceiling.
    this.regions();
    if (this.assertive) {
      this.assertive.textContent = "";
      requestAnimationFrame(() => {
        if (this.assertive) this.assertive.textContent = text;
      });
    }
  }

  private enqueue(item: Item) {
    if (this.paused && item.category !== "assertive-error") return;
    if (this.quietZone && (item.category === "notification" || item.category === "data-update")) return;
    if (item.category === "assertive-error") {
      // Preempts: clear queue and announce immediately on assertive region.
      this.queue = [];
      this.assertive_(item.text);
      return;
    }
    // Coalesce: drop earlier items in the same category within window.
    this.queue = this.queue.filter(
      (q) => q.category !== item.category || item.ts - q.ts > COALESCE_WINDOW_MS,
    );
    this.queue.push(item);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.timer) return;
    const now = Date.now();
    const sinceLast = now - this.lastFlushAt;
    const wait = Math.max(50, RATE_CEILING_MS - sinceLast);
    this.timer = setTimeout(() => this.flush(), wait);
  }

  private flush() {
    this.timer = null;
    this.regions();
    if (!this.polite || this.queue.length === 0) return;
    // Pick the latest item by category priority order.
    const order: LiveCategory[] = [
      "route-change",
      "form-feedback",
      "drag",
      "notification",
      "data-update",
      "count-tick",
    ];
    let chosen: Item | undefined;
    for (const c of order) {
      const item = [...this.queue].reverse().find((q) => q.category === c);
      if (item) { chosen = item; break; }
    }
    if (!chosen) return;
    this.queue = [];
    this.lastFlushAt = Date.now();
    const text = chosen.text;
    this.polite.textContent = "";
    requestAnimationFrame(() => {
      if (this.polite) this.polite.textContent = text;
    });
  }
}

const singleton = typeof window !== "undefined" ? new LiveAnnouncer() : null;

export const liveAnnounce = {
  polite: (text: string, category: LiveCategory = "data-update") =>
    singleton?.polite_(text, category),
  assertive: (text: string) => singleton?.assertive_(text),
  setPaused: (p: boolean) => singleton?.setPaused(p),
  setQuietZone: (q: boolean) => singleton?.setQuietZone(q),
};
