import { NextRequest, NextResponse } from "next/server";
import {
  readKanbanRaw,
  writeKanbanRaw,
  busAppend,
  type KanbanBoard,
  type KanbanCard,
  type KanbanKind,
} from "@/lib/fs-adapter";
import {
  serializeKanbanBoard,
  originalIsCleanForWriteBack,
} from "@/lib/kanban-serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET    /api/kanban/<slug>?kind=content|project   → returns board JSON + mtime
 * POST   /api/kanban/<slug>?kind=…                  → applies a mutation op
 *
 * Mutations:
 *   { op: "move",   cardId, toColumn, toIndex }
 *   { op: "add",    column, title, meta?, acceptance? }
 *   { op: "edit",   cardId, title?, meta?, acceptance? }
 *   { op: "delete", cardId }
 *
 * On success: writes the new markdown atomically, posts a `kanban-update`
 * message to the relevant bus channel (proj-<slug> for projects, content
 * for content boards), returns { board, mtimeMs }.
 *
 * On conflict (file changed under us — `ECONFLICT`): returns 409 with
 * latest server state; client re-applies + retries optimistically.
 *
 * Hard rules (UI v3 §7.7):
 *  - never shell-execs
 *  - writes only inside PROJECT_ROOT (fs-adapter's safeJoin enforces)
 *  - bus.post via in-process append, no MCP roundtrip
 */

const SLUG_RE = /^[a-z0-9][a-z0-9_\-]{0,40}$/;

function kindFrom(req: NextRequest): KanbanKind {
  const k = req.nextUrl.searchParams.get("kind");
  return k === "project" ? "project" : "content";
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!SLUG_RE.test(slug)) return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  const kind = kindFrom(req);
  const r = await readKanbanRaw(slug, kind);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ board: r.board, mtimeMs: r.mtimeMs, kind });
}

interface MutationBody {
  op?: "move" | "add" | "edit" | "delete";
  expectedMtimeMs?: number;
  // op-specific
  cardId?: string;
  column?: string;
  toColumn?: string;
  toIndex?: number;
  title?: string;
  meta?: string;
  acceptance?: string[];
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!SLUG_RE.test(slug)) return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  const kind = kindFrom(req);

  let body: MutationBody;
  try {
    body = (await req.json()) as MutationBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const r = await readKanbanRaw(slug, kind);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Refuse write-back on free-form boards (would clobber non-card content).
  if (!originalIsCleanForWriteBack(r.rawText)) {
    return NextResponse.json(
      { error: "board contains free-form content; write-back disabled", code: "EFORMAT" },
      { status: 409 },
    );
  }

  // Mtime check
  if (body.expectedMtimeMs != null && Math.abs(r.mtimeMs - body.expectedMtimeMs) > 1) {
    return NextResponse.json(
      { error: "conflict: file changed under us", code: "ECONFLICT", board: r.board, mtimeMs: r.mtimeMs },
      { status: 409 },
    );
  }

  let updated: KanbanBoard;
  let busBody: string;
  let cardForBus: KanbanCard | undefined;

  try {
    switch (body.op) {
      case "move": {
        const { cardId, toColumn, toIndex } = body;
        if (!cardId || !toColumn) throw badInput("cardId + toColumn required");
        const found = findCard(r.board, cardId);
        if (!found) throw badInput("card not found");
        const targetCol = r.board.columns.find((c) => c.name === toColumn);
        if (!targetCol) throw badInput(`column ${toColumn} not found`);

        // Remove from source
        found.column.cards.splice(found.cardIndex, 1);
        // Insert into target at index (clamp)
        const insertAt = clamp(toIndex ?? targetCol.cards.length, 0, targetCol.cards.length);
        targetCol.cards.splice(insertAt, 0, found.card);

        updated = r.board;
        cardForBus = found.card;
        busBody = `Card moved: ‘${found.card.title}’ ${found.column.name} → ${toColumn}`;
        break;
      }
      case "add": {
        const { column, title, meta, acceptance } = body;
        if (!column || !title?.trim()) throw badInput("column + title required");
        const targetCol = r.board.columns.find((c) => c.name === column);
        if (!targetCol) throw badInput(`column ${column} not found`);
        const newCard: KanbanCard = {
          id: nextCardId(r.board),
          title: title.trim(),
          meta: meta?.trim() ?? "",
          acceptance: (acceptance ?? []).map((a) => a.trim()).filter(Boolean),
        };
        targetCol.cards.push(newCard);
        updated = r.board;
        cardForBus = newCard;
        busBody = `New card: ‘${newCard.title}’ in ${column}`;
        break;
      }
      case "edit": {
        const { cardId, title, meta, acceptance } = body;
        if (!cardId) throw badInput("cardId required");
        const found = findCard(r.board, cardId);
        if (!found) throw badInput("card not found");
        if (typeof title === "string" && title.trim()) found.card.title = title.trim();
        if (typeof meta === "string") found.card.meta = meta.trim();
        if (Array.isArray(acceptance)) {
          found.card.acceptance = acceptance.map((a) => String(a).trim()).filter(Boolean);
        }
        updated = r.board;
        cardForBus = found.card;
        busBody = `Card edited: ‘${found.card.title}’`;
        break;
      }
      case "delete": {
        const { cardId } = body;
        if (!cardId) throw badInput("cardId required");
        const found = findCard(r.board, cardId);
        if (!found) throw badInput("card not found");
        found.column.cards.splice(found.cardIndex, 1);
        updated = r.board;
        cardForBus = found.card;
        busBody = `Card deleted: ‘${found.card.title}’ from ${found.column.name}`;
        break;
      }
      default:
        return NextResponse.json({ error: "unknown op" }, { status: 400 });
    }
  } catch (e) {
    if (e instanceof BadInput) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }

  const newText = serializeKanbanBoard(r.rawText, updated);
  let stat;
  try {
    stat = await writeKanbanRaw(slug, kind, newText, r.mtimeMs);
  } catch (e: unknown) {
    if (e instanceof Error && (e as Error & { code?: string }).code === "ECONFLICT") {
      const fresh = await readKanbanRaw(slug, kind);
      return NextResponse.json(
        { error: "conflict", code: "ECONFLICT", board: fresh?.board, mtimeMs: fresh?.mtimeMs },
        { status: 409 },
      );
    }
    throw e;
  }

  // Post bus message — projects → proj-<slug>, content → content
  const channel = kind === "project" ? `proj-${slug}` : "content";
  await busAppend({
    channel,
    from: "web-ui",
    type: "note",
    body: busBody,
    ref: cardForBus
      ? `${kind === "project" ? "kanban/projects" : "kanban"}/${slug}.md#${cardForBus.id}`
      : undefined,
  });

  return NextResponse.json({ board: updated, mtimeMs: stat.mtimeMs });
}

// helpers

class BadInput extends Error {}
function badInput(m: string) {
  return new BadInput(m);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function findCard(board: KanbanBoard, cardId: string) {
  for (const column of board.columns) {
    const i = column.cards.findIndex((c) => c.id === cardId);
    if (i >= 0) return { column, cardIndex: i, card: column.cards[i] };
  }
  return null;
}

function nextCardId(board: KanbanBoard): string {
  let max = 0;
  for (const c of board.columns)
    for (const card of c.cards) {
      const m = card.id.match(/^card-(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    }
  return `card-${max + 1}`;
}
