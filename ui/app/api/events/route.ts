import { NextRequest } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { existsSync, statSync } from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BusMsg { ts: string; ch?: string; from?: string; to?: string; type?: string; body?: string; ref?: string }

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const BUS_DIR = path.join(PROJECT_ROOT, "bus");
const CHANNEL_RE = /^[a-z0-9][a-z0-9_\-]{0,63}$/;

/**
 * Multiplexed bus events SSE — ACCESSIBILITY-BRIEF-V2 revision in §16.
 *
 * Replaces v1's per-channel /api/bus-tail. Subscribes to one or more channels
 * passed via ?channels=ch1,ch2 (or empty/all for everything) plus an optional
 * &since=ISO cursor.
 *
 * Each event carries the originating channel in `m.ch`. Client store fans out
 * updates to dashboard, channel views, notification center, etc.
 *
 * Polling-based (not chokidar) for the same reasons as v1: minimal deps,
 * survives editor atomic-rewrite.
 *
 * Backward compat: v1 /api/bus-tail still works for existing callers; this
 * route is additive.
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requestedChannels = (url.searchParams.get("channels") ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const since = url.searchParams.get("since") ?? "";

  // If empty list, subscribe to everything we find at connect time.
  // (We do NOT auto-discover newly-created channels mid-stream in v2;
  // a reconnect is cheap.)
  let channels: string[] = requestedChannels;
  if (channels.length === 0) {
    if (existsSync(BUS_DIR)) {
      const entries = await fs.readdir(BUS_DIR);
      channels = entries
        .filter((f) => f.endsWith(".jsonl"))
        .map((f) => f.replace(/\.jsonl$/, ""));
    }
  }
  // Validate
  channels = channels.filter((c) => CHANNEL_RE.test(c));
  if (channels.length === 0) {
    return new Response("no valid channels", { status: 400 });
  }

  const sizes = new Map<string, number>();
  const lastTs = new Map<string, string>(channels.map((c) => [c, since]));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );

      // Initial: replay 50 most recent across each channel from `since`.
      for (const ch of channels) {
        const file = path.join(BUS_DIR, `${ch}.jsonl`);
        if (!existsSync(file)) continue;
        try {
          const txt = await fs.readFile(file, "utf8");
          sizes.set(ch, txt.length);
          const msgs = txt
            .split("\n")
            .filter(Boolean)
            .map((l) => {
              try { return JSON.parse(l); } catch { return null; }
            })
            .filter((m: unknown): m is BusMsg => !!m && typeof (m as BusMsg).ts === "string");
          const fresh = since ? msgs.filter((m) => m.ts > since) : msgs.slice(-50);
          for (const m of fresh) {
            send("message", m);
            lastTs.set(ch, m.ts);
          }
        } catch {
          // ignore
        }
      }
      send("ready", { ts: new Date().toISOString(), channels });

      const interval = setInterval(async () => {
        for (const ch of channels) {
          const file = path.join(BUS_DIR, `${ch}.jsonl`);
          if (!existsSync(file)) continue;
          try {
            const stat = statSync(file);
            const prev = sizes.get(ch) ?? 0;
            if (stat.size === prev) continue;
            const txt = await fs.readFile(file, "utf8");
            sizes.set(ch, stat.size);
            const msgs = txt
              .split("\n")
              .filter(Boolean)
              .map((l) => { try { return JSON.parse(l); } catch { return null; } })
              .filter((m: unknown): m is BusMsg => !!m && typeof (m as BusMsg).ts === "string");
            const cursor = lastTs.get(ch) ?? "";
            for (const m of msgs) {
              if (m.ts > cursor) {
                send("message", m);
                lastTs.set(ch, m.ts);
              }
            }
          } catch {
            // swallow
          }
        }
      }, 1500);

      const abort = () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      };
      req.signal.addEventListener("abort", abort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
