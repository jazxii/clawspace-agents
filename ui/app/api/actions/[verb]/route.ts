import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/actions/<verb> — stage-only action endpoint.
 *
 * Phase B ships a stub that 202-Accepts and logs. Phase D{n} wires each
 * verb to a `bus.post` call per UI_v3 plan §7.6. NEVER shell-execs; the
 * agents pick up staged messages on their own scheduled-task / watcher.
 *
 * Idempotency-Key header dedupes within 10 minutes (in-memory cache —
 * acceptable for a local-first single-user app; persisted dedupe is
 * Phase E if needed).
 */

const ALLOWED_VERBS = new Set([
  "run-linkedin-writer",
  "run-scrum-master",
  "run-notebooklm-bridge",
  "run-daily-content-supervisor",
  "sync-content-to-notion",
  "compose-newsletter",
  "run-health-check",
  "graphify-reindex",
  "stage-newsletter",
  "approve-digest",
  "proposal-skip",
  "resolve-notion-conflict",
]);

const seen = new Map<string, { at: number; status: number }>();
const TTL = 10 * 60 * 1000;

function gc() {
  const now = Date.now();
  for (const [k, v] of seen) if (now - v.at > TTL) seen.delete(k);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ verb: string }> },
): Promise<NextResponse> {
  const { verb } = await ctx.params;
  if (!ALLOWED_VERBS.has(verb)) {
    return NextResponse.json({ error: "unknown verb" }, { status: 404 });
  }

  const idem = req.headers.get("idempotency-key");
  if (idem) {
    gc();
    const prior = seen.get(idem);
    if (prior) return NextResponse.json({ duplicate: true }, { status: prior.status });
  }

  // Phase B stub: log only. Phase D{n} replaces this with the bus.post call
  // shape defined in UI_v3 plan §7.6.
  // eslint-disable-next-line no-console
  console.info(`[actions] stub: queued '${verb}'`);

  if (idem) seen.set(idem, { at: Date.now(), status: 202 });
  return NextResponse.json({ queued: true, verb }, { status: 202 });
}
