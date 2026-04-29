import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const CHANNEL_RE = /^[a-z0-9][a-z0-9_\-]{0,63}$/;
const TYPE_OK = new Set(["task", "status", "question", "answer", "alert", "note", "done"]);

/**
 * Local-only POST endpoint that appends a message to a bus channel.
 * Mirrors the bus-mcp `bus_post` tool so the UI form can post directly.
 *
 * No auth — this is a localhost-only dev server. The Next.js dev server binds
 * to localhost by default; do NOT expose this route publicly without adding
 * authentication first.
 */
interface PostBody {
  channel?: string;
  from?: string;
  to?: string;
  type?: string;
  body?: string;
  ref?: string;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const { channel, from, to, type, body: text, ref } = body ?? {};
  if (!channel || !CHANNEL_RE.test(channel)) {
    return NextResponse.json({ error: "invalid channel" }, { status: 400 });
  }
  if (!from || typeof from !== "string") {
    return NextResponse.json({ error: "invalid from" }, { status: 400 });
  }
  if (!type || !TYPE_OK.has(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  if (!text || typeof text !== "string" || text.length > 4000) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const file = path.join(PROJECT_ROOT, "bus", `${channel}.jsonl`);
  const msg = {
    ts: new Date().toISOString(),
    ch: channel,
    from,
    to: to ?? "*",
    type,
    body: text,
    ...(ref ? { ref } : {}),
  };
  await fs.appendFile(file, JSON.stringify(msg) + "\n", "utf8");
  return NextResponse.json({ ok: true, ts: msg.ts });
}
