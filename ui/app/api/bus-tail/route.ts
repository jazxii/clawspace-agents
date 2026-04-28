import { NextRequest } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { existsSync, statSync } from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");

/**
 * SSE endpoint that tails a bus channel's JSONL file.
 * Connects, sends any messages newer than `since` (query param), then polls
 * for new appends every 1.5s. Closes when client disconnects.
 *
 * Polling (rather than chokidar) keeps the dependency surface minimal and
 * works correctly when the file is rewritten as a whole (some editors do).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const channel = url.searchParams.get("channel") ?? "";
  const since = url.searchParams.get("since") ?? "";
  if (!/^[a-z0-9][a-z0-9_\-]{0,63}$/.test(channel)) {
    return new Response("invalid channel", { status: 400 });
  }
  const file = path.join(PROJECT_ROOT, "bus", `${channel}.jsonl`);

  const encoder = new TextEncoder();
  let lastSize = 0;
  let lastSentTs = since;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );

      // Initial state
      if (!existsSync(file)) {
        send("error", { message: "channel file does not exist yet" });
      } else {
        try {
          const txt = await fs.readFile(file, "utf8");
          lastSize = txt.length;
          const msgs = txt
            .split("\n")
            .filter(Boolean)
            .map((l) => {
              try {
                return JSON.parse(l);
              } catch {
                return null;
              }
            })
            .filter((m: any): m is { ts: string } => m && typeof m.ts === "string");
          const fresh = since ? msgs.filter((m) => m.ts > since) : msgs.slice(-50);
          for (const m of fresh) {
            send("message", m);
            lastSentTs = (m as any).ts;
          }
          send("ready", { ts: new Date().toISOString() });
        } catch (e) {
          send("error", { message: String(e) });
        }
      }

      // Poll loop
      const interval = setInterval(async () => {
        try {
          if (!existsSync(file)) return;
          const stat = statSync(file);
          if (stat.size === lastSize) return;
          const txt = await fs.readFile(file, "utf8");
          lastSize = stat.size;
          const msgs = txt
            .split("\n")
            .filter(Boolean)
            .map((l) => {
              try {
                return JSON.parse(l);
              } catch {
                return null;
              }
            })
            .filter((m: any): m is { ts: string } => m && typeof m.ts === "string");
          for (const m of msgs) {
            if ((m as any).ts > lastSentTs) {
              send("message", m);
              lastSentTs = (m as any).ts;
            }
          }
        } catch {
          // swallow — next tick will retry
        }
      }, 1500);

      const abort = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
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
