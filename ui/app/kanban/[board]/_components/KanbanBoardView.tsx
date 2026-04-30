"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { KanbanBoard, KanbanCard, KanbanColumn } from "@/lib/fs-adapter";
import { Icon } from "@/app/_components/Icon";

/**
 * Phase C — Kanban v3.
 *
 * Source of truth = kanban/**.md. The server route /api/kanban/<slug>
 * round-trips card mutations into the file via the lossless serializer.
 * Optimistic UI: state changes immediately on drop / save; on 4xx/5xx
 * we revert and surface a polite-region announcement.
 *
 * Cross-tab sync via /api/kanban/<slug>/stream (chokidar SSE). When the
 * file changes on disk we GET fresh state and merge.
 *
 * Keyboard parity: dnd-kit's KeyboardSensor handles Tab/Space/arrows
 * out of the box. The card itself is a button, so Enter/Space opens
 * the detail dialog when not in drag mode.
 */

const COL_TINT: Record<string, string> = {
  Backlog:       "var(--text-4)",
  Drafting:      "var(--accent-content)",
  "In Review":   "var(--accent-projects)",
  "In Progress": "var(--accent-projects)",
  Review:        "var(--accent-projects)",
  Ready:         "var(--accent-research)",
  Posted:        "var(--accent-meta)",
  Done:          "var(--accent-meta)",
};

interface Props {
  board: KanbanBoard;
  mtimeMs: number;
  kind: "content" | "project";
  writeBackEnabled: boolean;
  formatNote?: string;
}

function announce(text: string) {
  const polite = document.getElementById("live-region-polite");
  if (!polite) return;
  polite.textContent = "";
  requestAnimationFrame(() => { polite.textContent = text; });
}

export default function KanbanBoardView(props: Props) {
  const [board, setBoard] = React.useState<KanbanBoard>(props.board);
  const [mtime, setMtime] = React.useState<number>(props.mtimeMs);
  const [detail, setDetail] = React.useState<{ card: KanbanCard; column: string } | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null); // cardId
  const [adding, setAdding] = React.useState<string | null>(null);   // column name
  const writeBack = props.writeBackEnabled;

  // Cross-tab SSE — refetch on disk change
  React.useEffect(() => {
    if (!writeBack) return;
    const url = `/api/kanban/${props.board.slug}/stream?kind=${props.kind}`;
    const es = new EventSource(url);
    es.addEventListener("updated", async () => {
      try {
        const r = await fetch(`/api/kanban/${props.board.slug}?kind=${props.kind}`);
        if (!r.ok) return;
        const data = (await r.json()) as { board: KanbanBoard; mtimeMs: number };
        setBoard(data.board);
        setMtime(data.mtimeMs);
        announce("Board updated from disk.");
      } catch {
        /* ignore */
      }
    });
    return () => es.close();
  }, [props.board.slug, props.kind, writeBack]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function findContainer(id: string): string | null {
    for (const c of board.columns) {
      if (c.cards.some((card) => card.id === id)) return c.name;
    }
    if (board.columns.some((c) => c.name === id)) return id;
    return null;
  }

  function onDragStart(_e: DragStartEvent) {
    /* dnd-kit handles overlay; no extra state needed in Phase C. */
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeCol = findContainer(activeId);
    const overCol = findContainer(overId);
    if (!activeCol || !overCol || activeCol === overCol) return;

    setBoard((prev) => {
      const next = cloneBoard(prev);
      const src = next.columns.find((c) => c.name === activeCol)!;
      const dst = next.columns.find((c) => c.name === overCol)!;
      const cardIdx = src.cards.findIndex((c) => c.id === activeId);
      if (cardIdx < 0) return prev;
      const [card] = src.cards.splice(cardIdx, 1);
      const overIdx = dst.cards.findIndex((c) => c.id === overId);
      const insertAt = overIdx < 0 ? dst.cards.length : overIdx;
      dst.cards.splice(insertAt, 0, card);
      return next;
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeCol = findContainer(activeId);
    const overCol = findContainer(overId);
    if (!activeCol || !overCol) return;

    if (activeCol === overCol) {
      setBoard((prev) => {
        const next = cloneBoard(prev);
        const col = next.columns.find((c) => c.name === activeCol)!;
        const oldIdx = col.cards.findIndex((c) => c.id === activeId);
        const newIdx = col.cards.findIndex((c) => c.id === overId);
        if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return prev;
        col.cards = arrayMove(col.cards, oldIdx, newIdx);
        return next;
      });
    }

    // Resolve final intent and persist
    const final = (() => {
      // Re-query AFTER state-change settle: read latest snapshot
      // We'll rely on a microtask flush via setBoard callback below.
      return null;
    })();
    void final;

    // Persist using the latest board after React commits
    queueMicrotask(() => {
      setBoard((latest) => {
        const card = findCardById(latest, activeId);
        if (!card) return latest;
        const targetColName = card.column;
        const targetIdx = latest.columns.find((c) => c.name === targetColName)!.cards.findIndex((c) => c.id === activeId);
        void persistMove(activeId, targetColName, targetIdx);
        return latest;
      });
    });
  }

  async function persistMove(cardId: string, toColumn: string, toIndex: number) {
    if (!writeBack) return;
    const before = boardSnapshot();
    try {
      const res = await fetch(`/api/kanban/${props.board.slug}?kind=${props.kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "move", cardId, toColumn, toIndex, expectedMtimeMs: mtime }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { code?: string; board?: KanbanBoard; mtimeMs?: number };
        if (err.code === "ECONFLICT" && err.board && err.mtimeMs) {
          setBoard(err.board); setMtime(err.mtimeMs);
          announce("Server changed — board reloaded from disk.");
          return;
        }
        revertSnapshot(before);
        announce(`Move failed: ${res.status}`);
        return;
      }
      const data = (await res.json()) as { board: KanbanBoard; mtimeMs: number };
      setBoard(data.board); setMtime(data.mtimeMs);
      announce("Card moved.");
    } catch {
      revertSnapshot(before);
      announce("Move failed: network error.");
    }
  }

  function boardSnapshot(): { board: KanbanBoard; mtimeMs: number } {
    return { board: cloneBoard(board), mtimeMs: mtime };
  }
  function revertSnapshot(s: { board: KanbanBoard; mtimeMs: number }) {
    setBoard(s.board); setMtime(s.mtimeMs);
  }

  async function persistAdd(column: string, title: string) {
    if (!title.trim()) return;
    if (!writeBack) {
      announce("Read-only board — add disabled.");
      return;
    }
    const res = await fetch(`/api/kanban/${props.board.slug}?kind=${props.kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "add", column, title, expectedMtimeMs: mtime }),
    });
    if (!res.ok) {
      announce(`Add failed: ${res.status}`);
      return;
    }
    const data = (await res.json()) as { board: KanbanBoard; mtimeMs: number };
    setBoard(data.board); setMtime(data.mtimeMs);
    announce(`Card added to ${column}.`);
  }

  async function persistEdit(cardId: string, title: string) {
    if (!title.trim()) return;
    if (!writeBack) return;
    const res = await fetch(`/api/kanban/${props.board.slug}?kind=${props.kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "edit", cardId, title, expectedMtimeMs: mtime }),
    });
    if (!res.ok) {
      announce(`Edit failed: ${res.status}`);
      return;
    }
    const data = (await res.json()) as { board: KanbanBoard; mtimeMs: number };
    setBoard(data.board); setMtime(data.mtimeMs);
    announce("Card edited.");
  }

  async function persistDelete(cardId: string) {
    if (!writeBack) return;
    const ok = window.confirm("Delete this card?");
    if (!ok) return;
    const res = await fetch(`/api/kanban/${props.board.slug}?kind=${props.kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "delete", cardId, expectedMtimeMs: mtime }),
    });
    if (!res.ok) {
      announce(`Delete failed: ${res.status}`);
      return;
    }
    const data = (await res.json()) as { board: KanbanBoard; mtimeMs: number };
    setBoard(data.board); setMtime(data.mtimeMs);
    setDetail(null);
    announce("Card deleted.");
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="cs-page-title">
        <div>
          <h1>Kanban · {board.slug}</h1>
          <p>
            {countAll(board)} cards
            {writeBack ? " · drag with mouse, or Tab to a card and use Space + arrows" : " · read-only (free-form board)"}
          </p>
          {!writeBack && props.formatNote && (
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {props.formatNote}
            </p>
          )}
        </div>
        <div className="row gap-2">
          <a href="/kanban" className="cs-btn" data-variant="ghost">
            <Icon name="arrow-right" size={12} style={{ transform: "rotate(180deg)" }} />Back
          </a>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="cs-kanban" role="group" aria-label={`${board.slug} board`}>
          {board.columns.map((col) => (
            <ColumnView
              key={col.name}
              column={col}
              writeBack={writeBack}
              addingHere={adding === col.name}
              onStartAdd={() => setAdding(col.name)}
              onCancelAdd={() => setAdding(null)}
              onSubmitAdd={async (title) => {
                await persistAdd(col.name, title);
                setAdding(null);
              }}
              editingId={editing}
              onStartEdit={(id) => setEditing(id)}
              onCancelEdit={() => setEditing(null)}
              onSubmitEdit={async (id, title) => {
                await persistEdit(id, title);
                setEditing(null);
              }}
              onOpen={(card) => setDetail({ card, column: col.name })}
            />
          ))}
        </div>
      </DndContext>

      <Dialog.Root open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="cs-palette-scrim" />
          <Dialog.Content
            className="cs-palette"
            aria-describedby={undefined}
            style={{ maxHeight: "70vh" }}
          >
            <Dialog.Title className="sr-only">Card detail</Dialog.Title>
            {detail && (
              <div style={{ padding: "var(--pad-4) var(--pad-5)" }}>
                <h2 style={{ margin: 0, fontSize: 18, letterSpacing: "-0.01em" }}>{detail.card.title}</h2>
                <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {detail.card.id} · {detail.column}
                </p>
                {detail.card.meta && (
                  <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-2)" }}>{detail.card.meta}</p>
                )}
                {detail.card.acceptance.length > 0 && (
                  <>
                    <h3 style={{ marginTop: 16, fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)" }}>
                      Acceptance criteria
                    </h3>
                    <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                      {detail.card.acceptance.map((a, i) => (
                        <li key={i} style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{a}</li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="row gap-2" style={{ marginTop: 20 }}>
                  <Dialog.Close asChild>
                    <button className="cs-btn">Close</button>
                  </Dialog.Close>
                  {writeBack && (
                    <button
                      type="button"
                      className="cs-btn"
                      data-variant="ghost"
                      onClick={() => detail && persistDelete(detail.card.id)}
                    >
                      <Icon name="x" size={12} />Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ─── Column ─── */

interface ColumnViewProps {
  column: KanbanColumn;
  writeBack: boolean;
  addingHere: boolean;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onSubmitAdd: (title: string) => void | Promise<void>;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSubmitEdit: (id: string, title: string) => void | Promise<void>;
  onOpen: (card: KanbanCard) => void;
}

function ColumnView(p: ColumnViewProps) {
  const cardIds = p.column.cards.map((c) => c.id);
  return (
    <section
      className="cs-col"
      data-over="0"
      aria-labelledby={`col-h-${p.column.name}`}
      style={{ ["--col-tint" as string]: COL_TINT[p.column.name] ?? "var(--text-4)" }}
    >
      <header className="cs-col-h">
        <span className="ttl" id={`col-h-${p.column.name}`}>
          <span className="dot" aria-hidden="true" />
          {p.column.name}
        </span>
        <span className="muted tnum" style={{ fontSize: 11 }}>{p.column.cards.length}</span>
      </header>
      <div className="cs-col-body">
        <SortableContext id={p.column.name} items={cardIds} strategy={verticalListSortingStrategy}>
          {p.column.cards.length === 0 && !p.addingHere && (
            <p className="muted" style={{ fontSize: 12, padding: "var(--pad-2)" }}>(empty)</p>
          )}
          {p.column.cards.map((card) => (
            <CardView
              key={card.id}
              card={card}
              isEditing={p.editingId === card.id}
              writeBack={p.writeBack}
              onOpen={() => p.onOpen(card)}
              onStartEdit={() => p.onStartEdit(card.id)}
              onCancelEdit={p.onCancelEdit}
              onSubmitEdit={(title) => p.onSubmitEdit(card.id, title)}
            />
          ))}
          {p.addingHere ? (
            <InlineForm
              placeholder="New card title"
              onSubmit={p.onSubmitAdd}
              onCancel={p.onCancelAdd}
            />
          ) : (
            p.writeBack && (
              <button
                type="button"
                className="cs-btn"
                data-variant="ghost"
                style={{ justifyContent: "flex-start", height: 28, fontSize: 12 }}
                onClick={p.onStartAdd}
              >
                <Icon name="plus" size={12} />Add
              </button>
            )
          )}
        </SortableContext>
      </div>
    </section>
  );
}

/* ─── Card ─── */

interface CardViewProps {
  card: KanbanCard;
  isEditing: boolean;
  writeBack: boolean;
  onOpen: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: (title: string) => void | Promise<void>;
}

function CardView({ card, isEditing, writeBack, onOpen, onStartEdit, onCancelEdit, onSubmitEdit }: CardViewProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: isEditing || !writeBack,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  if (isEditing) {
    return (
      <div ref={setNodeRef} className="cs-card-k">
        <InlineForm
          initial={card.title}
          placeholder="Card title"
          onSubmit={onSubmitEdit}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="cs-card-k"
      data-dragging={isDragging ? "1" : "0"}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onDoubleClick={() => writeBack && onStartEdit()}
      onClick={(e) => {
        // Single click opens detail when not dragging. dnd-kit suppresses
        // click after drag via activationConstraint distance.
        if (!isDragging) onOpen();
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isDragging) {
          e.preventDefault();
          onOpen();
        }
        if ((e.key === "F2" || (e.key === "e" && (e.metaKey || e.ctrlKey))) && writeBack) {
          e.preventDefault();
          onStartEdit();
        }
      }}
      aria-roledescription="Draggable card"
      aria-label={`${card.title}${card.meta ? `, ${card.meta}` : ""}`}
    >
      <h4>{card.title}</h4>
      {card.meta && <p className="meta" style={{ fontSize: 11, color: "var(--text-3)" }}>{card.meta}</p>}
      {card.acceptance.length > 0 && (
        <p className="meta" style={{ fontSize: 11, color: "var(--text-4)" }}>
          {card.acceptance.length} {card.acceptance.length === 1 ? "AC" : "ACs"}
        </p>
      )}
    </div>
  );
}

/* ─── Inline title form ─── */

function InlineForm({
  initial = "",
  placeholder,
  onSubmit,
  onCancel,
}: {
  initial?: string;
  placeholder: string;
  onSubmit: (v: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = React.useState(initial);
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void onSubmit(v); }}
      style={{ display: "flex", gap: 6 }}
    >
      <input
        ref={ref}
        className="twk-field"
        type="text"
        value={v}
        placeholder={placeholder}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        style={{ flex: 1 }}
      />
      <button type="submit" className="cs-btn" data-variant="primary" style={{ height: 26 }}>
        <Icon name="check" size={12} />
      </button>
      <button type="button" className="cs-btn" data-variant="ghost" onClick={onCancel} style={{ height: 26 }}>
        <Icon name="x" size={12} />
      </button>
    </form>
  );
}

/* ─── helpers ─── */

function cloneBoard(b: KanbanBoard): KanbanBoard {
  return {
    ...b,
    columns: b.columns.map((c) => ({ ...c, cards: c.cards.map((card) => ({ ...card, acceptance: [...card.acceptance] })) })),
  };
}
function countAll(b: KanbanBoard): number {
  return b.columns.reduce((s, c) => s + c.cards.length, 0);
}
function findCardById(
  b: KanbanBoard,
  id: string,
): { card: KanbanCard; column: string } | null {
  for (const col of b.columns) {
    const c = col.cards.find((cc) => cc.id === id);
    if (c) return { card: c, column: col.name };
  }
  return null;
}
