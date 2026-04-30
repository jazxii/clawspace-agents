import { NextRequest } from "next/server";
import path from "node:path";
import chokidar, { type FSWatcher } from "chokidar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9][a-z0-9_\-]{0,40}$/;
const PROJECT_ROOT = path.resolve(process.cwd(), "..");

/**
 * GET /api/kanban/<slug>/stream?kind=content|project
 *
 * Server-Sent Events stream that emits `{ "type": "updated" }` whenever
 * the board's md file changes on disk. Used for cross-tab sync — both
 * tabs converge on the latest server state without polling.
 *
 * Watcher is per-connection. Closes when the client disconnects.
 */

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!SLUG_RE.test(slug)) return new Response("invalid slug", { status: 400 });
  const kind = req.nextUrl.searchParams.get("kind") === "project" ? "project" : "content";
  const rel = kind === "project" ? `kanban/projects/${slug}.md` : `kanban/${slug}.md`;
  const file = path.resolve(PROJECT_ROOT, rel);

  const encoder = new TextEncoder();
  let watcher: FSWatcher | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: object) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* controller closed */
        }
      };

      send("ready", { file: rel });

      watcher = chokidar.watch(file, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 25 },
      });
      watcher.on("change", () => send("updated", { type: "updated" }));
      watcher.on("error", (err: unknown) =>
        send("error", { message: err instanceof Error ? err.message : String(err) }),
      );

      // Comment line every 25s keeps proxies/CDNs from closing the SSE.
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* controller closed */
        }
      }, 25_000);

      req.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        watcher?.close();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      watcher?.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
      connection: "keep-alive",
    },
  });
}
