/**
 * Round-trip-safe Kanban markdown serializer.
 *
 * The parser in fs-adapter.ts is intentionally lossy — it captures cards
 * (`- [card-id] Title — meta`) and acceptance lines but ignores everything
 * else (free-form bullet points, headings, prose) inside a column.
 *
 * To write back without corrupting the file we use a SPLICE strategy:
 *   - keep the original text intact
 *   - locate each `## ColumnName` heading
 *   - rewrite ONLY the contiguous "card region" within each column (lines
 *     that match a card or its acceptance criteria)
 *   - leave non-card lines (free-form prose, sub-headings, decorative
 *     bullets) untouched
 *
 * If a column has no cards in either old or new state, the column body
 * is preserved byte-for-byte. If a column gains cards from an empty body,
 * cards are inserted after the column heading + any leading blank line.
 *
 * Counts comment (`<!-- counts: backlog=N | drafting=N | ... -->`) is
 * regenerated when present and updated with the new column counts.
 */

import type { KanbanBoard, KanbanCard, KanbanColumn } from "./fs-adapter";

const CARD_LINE_RE = /^-\s+\[card-[a-z0-9\-]+\]\s+/;
const AC_LINE_RE = /^\s{2,}-\s+Acceptance:\s+/i;

export function serializeCard(c: KanbanCard): string[] {
  const meta = c.meta?.trim();
  const head = `- [${c.id}] ${c.title.trim()}${meta ? ` — ${meta}` : ""}`;
  const acs = c.acceptance.map((a) => `  - Acceptance: ${a.trim()}`);
  return [head, ...acs];
}

export function serializeKanbanBoard(originalText: string, board: KanbanBoard): string {
  const lines = originalText.split(/\r?\n/);
  const out: string[] = [];

  // Index column headings: line index of each `## Name`
  const colStarts: { lineIdx: number; name: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+?)\s*$/);
    if (m) colStarts.push({ lineIdx: i, name: m[1] });
  }

  // Build a lookup: column name → KanbanColumn (case + whitespace tolerant)
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const byName = new Map<string, KanbanColumn>();
  for (const c of board.columns) byName.set(norm(c.name), c);

  let i = 0;
  while (i < lines.length) {
    // Counts comment: regenerate
    if (/^<!--\s*counts:.*-->\s*$/.test(lines[i])) {
      out.push(buildCountsLine(board));
      i++;
      continue;
    }

    const colMatch = lines[i].match(/^##\s+(.+?)\s*$/);
    if (!colMatch) {
      out.push(lines[i]);
      i++;
      continue;
    }

    // Found a column heading. Push the heading itself.
    out.push(lines[i]);
    const colName = colMatch[1];
    const col = byName.get(norm(colName));

    // Find this column's body range: lines (i+1) up to (next column heading or EOF)
    const startBody = i + 1;
    let endBody = lines.length;
    for (const cs of colStarts) {
      if (cs.lineIdx > i) {
        endBody = cs.lineIdx;
        break;
      }
    }

    // Within body, locate the contiguous "card region": [firstCardOrAC ... lastCardOrAC]
    let firstCardLine = -1;
    let lastCardLine = -1;
    for (let j = startBody; j < endBody; j++) {
      if (CARD_LINE_RE.test(lines[j]) || AC_LINE_RE.test(lines[j])) {
        if (firstCardLine === -1) firstCardLine = j;
        lastCardLine = j;
      }
    }

    if (!col || col.cards.length === 0) {
      // No cards in updated state — emit body verbatim (preserves free-form
      // content). If the original had cards but the update removed them all,
      // we still keep the body intact except cards are stripped.
      if (firstCardLine === -1) {
        // No cards in original either — emit verbatim
        for (let j = startBody; j < endBody; j++) out.push(lines[j]);
      } else {
        // Strip just the card region; keep the rest
        for (let j = startBody; j < endBody; j++) {
          if (j >= firstCardLine && j <= lastCardLine) continue;
          // collapse double-blank lines from the strip
          if (out[out.length - 1] === "" && lines[j] === "") continue;
          out.push(lines[j]);
        }
      }
      i = endBody;
      continue;
    }

    // Column has cards in updated state. Build the card block.
    const cardBlock: string[] = [];
    col.cards.forEach((c, idx) => {
      cardBlock.push(...serializeCard(c));
      if (idx < col.cards.length - 1) cardBlock.push(""); // blank line between cards
    });

    if (firstCardLine === -1) {
      // No card region in original. Insert after a single leading blank line
      // so we get `## Foo\n\n- [card-1] …`. Skip any leading blanks first.
      let k = startBody;
      while (k < endBody && lines[k].trim() === "") {
        out.push(lines[k]);
        k++;
      }
      if (out[out.length - 1] !== "") out.push("");
      out.push(...cardBlock);
      // Emit any trailing non-card content
      if (k < endBody) {
        if (cardBlock.length > 0) out.push("");
        for (; k < endBody; k++) out.push(lines[k]);
      }
    } else {
      // Replace the card region in place. Preserve before-region and after-region content.
      for (let j = startBody; j < firstCardLine; j++) out.push(lines[j]);
      out.push(...cardBlock);
      for (let j = lastCardLine + 1; j < endBody; j++) out.push(lines[j]);
    }

    i = endBody;
  }

  // Trailing newline normalize: ensure exactly one final \n
  let result = out.join("\n");
  if (!result.endsWith("\n")) result += "\n";
  return result;
}

function buildCountsLine(board: KanbanBoard): string {
  const today = new Date().toISOString().slice(0, 10);
  const parts = board.columns.map((c) => `${c.name.toLowerCase().replace(/\s+/g, "-")}=${c.cards.length}`);
  return `<!-- counts: ${parts.join(" | ")} | updated=${today} -->`;
}

/** True iff parser produced a structured board (≥1 card across all columns). */
export function boardIsStructured(board: KanbanBoard): boolean {
  return board.columns.some((c) => c.cards.length > 0);
}

/** True iff the original markdown body of every column is "clean" (only cards / ACs / blanks). */
export function originalIsCleanForWriteBack(originalText: string): boolean {
  const lines = originalText.split(/\r?\n/);
  let inColumn = false;
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      inColumn = true;
      continue;
    }
    if (!inColumn) continue;
    if (line.trim() === "") continue;
    if (CARD_LINE_RE.test(line)) continue;
    if (AC_LINE_RE.test(line)) continue;
    if (/^<!--/.test(line)) continue;
    return false;
  }
  return true;
}
