"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { KanbanBoard, KanbanCard } from "@/lib/fs-adapter";

/**
 * Kanban view — implements ACCESSIBILITY-BRIEF §2 in full.
 *
 * Pattern: WAI-ARIA listbox-with-grouping. One <ul role="listbox"> per column.
 * Each listbox is a tab stop. aria-activedescendant moves the visual selection
 * without moving DOM focus.
 *
 * Key bindings (idle):
 *   ↑/↓        : move active option within column
 *   Home/End   : first / last
 *   Enter/Space: open card detail dialog
 *   M          : enter move mode (announces "Picked up {title}")
 *
 * Key bindings (move mode):
 *   ↑/↓        : reorder within column
 *   ←/→        : move card to adjacent column
 *   Enter/Space: drop (announce final position)
 *   Escape     : cancel (announce "Move cancelled")
 *
 * Drop is local-only in v1 — it does NOT persist back to the markdown file.
 * Persistence requires a route handler that calls the kanban-move skill;
 * that's deferred until Phase 7 wiring once the bus-side flow is exercised.
 */

function announce(text: string) {
  const polite = document.getElementById("live-region-polite");
  if (!polite) return;
  polite.textContent = "";
  requestAnimationFrame(() => {
    polite.textContent = text;
  });
}

interface ColumnState {
  name: string;
  cards: KanbanCard[];
}

export default function KanbanBoardView({ board }: { board: KanbanBoard }) {
  const [columns, setColumns] = useState<ColumnState[]>(
    board.columns.map((c) => ({ name: c.name, cards: c.cards })),
  );
  // Active option per column (card id), one per listbox.
  const [active, setActive] = useState<Record<number, string | undefined>>(
    () => Object.fromEntries(columns.map((c, i) => [i, c.cards[0]?.id])),
  );
  // Move mode: { colIdx, cardIdx } if engaged, else null.
  const [moveMode, setMoveMode] = useState<{ col: number; idx: number } | null>(null);
  // Card detail dialog
  const [detail, setDetail] = useState<{ card: KanbanCard; column: string } | null>(null);

  const listboxRefs = useRef<(HTMLUListElement | null)[]>([]);

  const findActive = useCallback(
    (colIdx: number) => {
      const col = columns[colIdx];
      const id = active[colIdx];
      const idx = col.cards.findIndex((c) => c.id === id);
      return { col, idx: idx >= 0 ? idx : 0, id: id ?? col.cards[0]?.id };
    },
    [columns, active],
  );

  const setActiveCard = useCallback(
    (colIdx: number, idx: number) => {
      const card = columns[colIdx].cards[idx];
      if (!card) return;
      setActive((prev) => ({ ...prev, [colIdx]: card.id }));
    },
    [columns],
  );

  // ----- Move mode operations -----
  const enterMoveMode = useCallback(
    (colIdx: number) => {
      const { idx, col } = findActive(colIdx);
      if (col.cards.length === 0) return;
      setMoveMode({ col: colIdx, idx });
      announce(`Picked up ${col.cards[idx].title}. Use arrow keys to move, Enter to drop, Escape to cancel.`);
    },
    [findActive],
  );

  const cancelMoveMode = useCallback(() => {
    setMoveMode(null);
    announce("Move cancelled.");
  }, []);

  const dropMoveMode = useCallback(() => {
    if (!moveMode) return;
    const col = columns[moveMode.col];
    const card = col.cards[moveMode.idx];
    setMoveMode(null);
    announce(
      `${card.title} moved to ${col.name}, position ${moveMode.idx + 1} of ${col.cards.length}.`,
    );
  }, [moveMode, columns]);

  const moveWithinColumn = useCallback(
    (delta: number) => {
      if (!moveMode) return;
      setColumns((prev) => {
        const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
        const col = next[moveMode.col];
        const newIdx = Math.max(0, Math.min(col.cards.length - 1, moveMode.idx + delta));
        if (newIdx === moveMode.idx) return prev;
        const [card] = col.cards.splice(moveMode.idx, 1);
        col.cards.splice(newIdx, 0, card);
        setMoveMode({ col: moveMode.col, idx: newIdx });
        setActive((p) => ({ ...p, [moveMode.col]: card.id }));
        return next;
      });
    },
    [moveMode],
  );

  const moveBetweenColumns = useCallback(
    (delta: 1 | -1) => {
      if (!moveMode) return;
      const targetCol = moveMode.col + delta;
      if (targetCol < 0 || targetCol >= columns.length) return;
      setColumns((prev) => {
        const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
        const [card] = next[moveMode.col].cards.splice(moveMode.idx, 1);
        const newIdx = Math.min(next[targetCol].cards.length, moveMode.idx);
        next[targetCol].cards.splice(newIdx, 0, card);
        setMoveMode({ col: targetCol, idx: newIdx });
        setActive((p) => ({ ...p, [targetCol]: card.id }));
        // Move DOM focus to the target listbox so subsequent key events go there.
        listboxRefs.current[targetCol]?.focus();
        return next;
      });
    },
    [moveMode, columns],
  );

  // ----- Idle navigation -----
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>, colIdx: number) => {
      const col = columns[colIdx];
      if (col.cards.length === 0) return;
      const { idx } = findActive(colIdx);

      // Move mode bindings take precedence
      if (moveMode && moveMode.col === colIdx) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            moveWithinColumn(1);
            return;
          case "ArrowUp":
            e.preventDefault();
            moveWithinColumn(-1);
            return;
          case "ArrowRight":
            e.preventDefault();
            moveBetweenColumns(1);
            return;
          case "ArrowLeft":
            e.preventDefault();
            moveBetweenColumns(-1);
            return;
          case "Enter":
          case " ":
            e.preventDefault();
            dropMoveMode();
            return;
          case "Escape":
            e.preventDefault();
            cancelMoveMode();
            return;
        }
      }

      // Idle bindings
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveCard(colIdx, Math.min(col.cards.length - 1, idx + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveCard(colIdx, Math.max(0, idx - 1));
          break;
        case "Home":
          e.preventDefault();
          setActiveCard(colIdx, 0);
          break;
        case "End":
          e.preventDefault();
          setActiveCard(colIdx, col.cards.length - 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          setDetail({ card: col.cards[idx], column: col.name });
          break;
        case "m":
        case "M":
          e.preventDefault();
          enterMoveMode(colIdx);
          break;
      }
    },
    [
      columns,
      findActive,
      moveMode,
      moveWithinColumn,
      moveBetweenColumns,
      dropMoveMode,
      cancelMoveMode,
      setActiveCard,
      enterMoveMode,
    ],
  );

  // Cancel move mode if user navigates away (focus leaves all listboxes).
  useEffect(() => {
    function onBlur(e: FocusEvent) {
      if (!moveMode) return;
      const next = e.relatedTarget as HTMLElement | null;
      const stillInside = listboxRefs.current.some((r) => r && next && r.contains(next));
      if (!stillInside) cancelMoveMode();
    }
    document.addEventListener("focusout", onBlur, true);
    return () => document.removeEventListener("focusout", onBlur, true);
  }, [moveMode, cancelMoveMode]);

  const instructionsId = useId();

  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Kanban — {board.slug}</h1>
      <p className="sr-only" id={instructionsId}>
        Use arrow keys to move between cards. Press Enter or Space to open card details. Press M
        to pick up a card. While picking up, use arrow keys to move it. Press Enter or Space to
        drop. Press Escape to cancel.
      </p>
      <p className="text-sm text-slate-600 mb-4" aria-hidden="true">
        Tab between columns. ↑/↓ to navigate. Enter to open card. M to pick up. ←/→ to move
        across columns. Esc to cancel.
      </p>

      <div
        role="group"
        aria-label={`${board.slug} board`}
        aria-describedby={instructionsId}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {columns.map((col, colIdx) => {
          const colId = `col-${board.slug}-${colIdx}`;
          const activeId = active[colIdx];
          const isMoveSource = moveMode?.col === colIdx;
          return (
            <section key={col.name} aria-labelledby={colId}>
              <h2 id={colId} className="font-semibold mb-2">
                {col.name}{" "}
                <span aria-label={`${col.cards.length} cards`} className="text-slate-500">
                  ({col.cards.length})
                </span>
              </h2>
              <ul
                ref={(el) => {
                  listboxRefs.current[colIdx] = el;
                }}
                role="listbox"
                aria-labelledby={colId}
                aria-activedescendant={activeId}
                tabIndex={0}
                onKeyDown={(e) => onKeyDown(e, colIdx)}
                className={`min-h-[6rem] rounded border border-slate-200 bg-slate-50 p-2 space-y-2 ${
                  isMoveSource ? "ring-2 ring-blue-600" : ""
                }`}
              >
                {col.cards.length === 0 ? (
                  <li className="text-sm text-slate-500 italic" aria-hidden="true">
                    (empty)
                  </li>
                ) : (
                  col.cards.map((card) => {
                    const isActive = card.id === activeId;
                    const isPicked = isMoveSource && col.cards[moveMode!.idx]?.id === card.id;
                    return (
                      <li
                        key={card.id}
                        id={card.id}
                        role="option"
                        aria-selected={isActive}
                        className={`rounded bg-white p-2 text-sm border ${
                          isActive
                            ? "border-blue-600 ring-2 ring-blue-600"
                            : "border-slate-200"
                        } ${isPicked ? "shadow-md" : ""}`}
                      >
                        <span className="font-medium block">{card.title}</span>
                        <span className="text-xs text-slate-500">
                          {card.id}
                          {card.acceptance.length > 0
                            ? ` · ${card.acceptance.length} ACs`
                            : ""}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Card detail dialog (Radix) */}
      <Dialog.Root open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,32rem)] rounded bg-white p-6 shadow-lg"
            aria-describedby={undefined}
          >
            {detail && (
              <>
                <Dialog.Title className="text-lg font-semibold mb-2">
                  {detail.card.title}
                </Dialog.Title>
                <dl className="text-sm space-y-1">
                  <div className="flex gap-2">
                    <dt className="font-medium">ID:</dt>
                    <dd>{detail.card.id}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium">Column:</dt>
                    <dd>{detail.column}</dd>
                  </div>
                  {detail.card.meta && (
                    <div className="flex gap-2">
                      <dt className="font-medium">Meta:</dt>
                      <dd>{detail.card.meta}</dd>
                    </div>
                  )}
                  {detail.card.acceptance.length > 0 && (
                    <div>
                      <dt className="font-medium">Acceptance criteria:</dt>
                      <dd>
                        <ul role="list" className="list-disc list-inside">
                          {detail.card.acceptance.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </dl>
                <div role="group" aria-label="Card actions" className="mt-4 flex gap-2">
                  <Dialog.Close asChild>
                    <button className="rounded bg-slate-200 px-3 py-1 hover:bg-slate-300">
                      Close
                    </button>
                  </Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
