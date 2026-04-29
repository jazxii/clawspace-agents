---
name: kanban-move
description: Move a Kanban card between columns in a kanban/*.md or kanban/projects/<slug>.md file. Use when an agent or user wants to advance a card (Backlog → Drafting → Ready → Posted, or Backlog → In Progress → Review → Done). Posts a note to the relevant bus channel after the move.
---

# Kanban move

Move a card between columns in a Clawspace Kanban markdown file, then post a note to the bus.

## Kanban file format


**IMPORTANT:** All Kanban cards must use the `- [card-...]` format (e.g., `- [card-001] Title — meta`) for correct parsing and UI display. Plain list items will be ignored by the parser/UI.

Each board is a single markdown file with H2 headings as columns and bullet items as cards:

```markdown
# Kanban — content-linkedin

## Backlog
- [card-001] Draft post on accessibility AI tooling — added 2026-04-27

## Drafting
- [card-002] Carousel: 5 a11y testing patterns — assigned linkedin-writer

## Ready

## Posted
```

Each card line: `- [<id>] <title> — <metadata>`. Card IDs are unique within the board.

## Required inputs

- `board` — relative path from project root (e.g., `kanban/content-linkedin.md` or `kanban/projects/graphify.md`).
- `card_id` — exact id (e.g., `card-002`).
- `to_column` — target column name as it appears in the file (e.g., `Ready`).

## Optional

- `note` — extra metadata to append to the card line (e.g., "by linkedin-writer 2026-04-27").
- `bus_channel` — channel to post the move to (default: derive from board path — `content` for content-*, `projects` for projects/*).

## Procedure

1. Read the board file. Locate the line matching `^- \[<card_id>\]`.
2. Verify the `to_column` H2 heading exists. If not, error.
3. Remove the card line from its current section. Append it (with optional note) to the target section.
4. Edit the file via the Edit tool with both the removal and the addition (one Edit per change).
5. Call `bus_post` on the chosen channel with `type: "status"`, body summarizing the move, and `ref: <board>#<card_id>`.

## Forbidden

- Never reorder cards beyond the move itself.
- Never alter card titles or IDs.
- Never delete cards (Posted/Done is the terminal column — leave them there for archive).

## Errors

- Card id not found: return error with the list of card IDs on the board.
- Target column missing: return error with the list of columns present.
