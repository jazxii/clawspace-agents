# Clawspace UI (v3)

Local Next.js 15 dashboard for the Clawspace personal workforce. Reads markdown and JSONL files from the parent project root via React Server Components — no API server, no DB.

## Setup

```bash
cd ui
npm install
npm run dev   # serves on http://localhost:3001
```

## Routes

| Path | Purpose |
|---|---|
| `/` | Dashboard — stat tiles, today's log, bus headlines, scheduled agents, token budget, proposals, Notion sync, research seed |
| `/kanban` | List of all Kanban boards with column counts and read-only badges |
| `/kanban/[board]` | Full board with DnD + keyboard drag, inline edit, add/delete cards, write-back to md |
| `/channels` | Channel index with v3 split layout (sidebar + main placeholder) |
| `/channels/[channel]` | Slack-like channel view with live SSE tail and throttled polite-region announcements |
| `/activity` | Activity timeline — domain-filtered table of agent actions across all bus channels |
| `/cost` | Token cost breakdown — per-domain stat tiles + per-agent proportional bars |
| `/logs` | Daily reasoning logs — date sidebar + markdown article viewer |
| `/graph` | Graphify knowledge graph — interactive SVG with node hover + detail sidebar |
| `/queue` | Content queue — tab-filtered card grid (linkedin/instagram/x/newsletter) |
| `/audit` | Audit log — table of `audit/mutations.jsonl` entries with action pills |
| `/agents` | Agent registry — tier-grouped grid (T4→T1) with domain filters |
| `/notion` | Notion sync status — table with conflict indicators + sync-now button |
| `/proposals` | List of weekly self-evolution proposals with status pills |
| `/proposals/[week]` | Diff viewer with what-worked/dragged cards, hunks, risk pills, review form |
| `/proposals/[week]/confirm` | Confirmation screen with the exact CLI command to run (no auto-apply) |
| `/research/digests` | List of weekly research digests with body previews |
| `/research/digests/[week]` | Single digest, markdown rendered with heading downshift |

## API routes

| Path | Method | Purpose |
|---|---|---|
| `/api/bus-tail?channel=…&since=…` | GET (SSE) | Server-Sent Events stream tailing a channel JSONL |
| `/api/bus-post` | POST | Append a message to a channel (mirrors `bus-mcp` `bus_post`) |
| `/api/budget` | GET | Token budget snapshot (used/cap/pct/resetsAt/perModel) |
| `/api/actions/[verb]` | POST | Stage an action to the bus with idempotency (12-verb allowlist) |
| `/api/kanban/[slug]` | GET/POST | Read board state or apply move/add/edit/delete ops with mtime conflict detection |
| `/api/kanban/[slug]/stream` | GET (SSE) | Per-board chokidar file-watch SSE for cross-tab sync |
| `/api/logs/[date]` | GET | Read a specific daily log markdown by date |
| `/api/events` | GET (SSE) | General event stream |

## Accessibility

Built against [`ACCESSIBILITY-BRIEF.md`](./ACCESSIBILITY-BRIEF.md) — pre-build guidance from `accessibility-agents:accessibility-lead` covering WCAG 2.2 AA in full. Highlights:

- One `<h1>` per route; skip link; `<main id="main" tabindex="-1">` focus on route change.
- Two global live-region sentinels (polite + assertive) in root layout.
- Kanban uses **listbox-with-grouping** (not a grid, not native DnD). Tab between columns, ↑/↓ to navigate, M to pick up, ←/→ in move mode, Esc to cancel.
- Channels use a **two-tier live-region policy**: the message list itself is NOT live; a separate sentinel gets coalesced + debounced announcements; auto-scroll is suspended when the user scrolls up; pause-announcements toggle silences the polite region (WCAG 2.2.2).
- Proposals form uses fieldset+legend, `aria-describedby` for rationale/risk/reversibility, validation focuses the first checkbox and announces assertively.
- Reduced-motion media query disables animations.
- Status badges always carry icon + text (never color alone, WCAG 1.4.1).
- Focus rings: 2px ring + 2px offset, blue-600, audited 3:1 against page bg (WCAG 1.4.11, 2.4.11, 2.4.13).

## Testing

### Automated
```bash
npx playwright install --with-deps   # one-time
npm run test:a11y
```

`tests/a11y.spec.ts` runs `@axe-core/playwright` against every route at WCAG 2.0/2.1/2.2 AA tags. Zero violations is the gate.

### Manual (per ACCESSIBILITY-BRIEF §9)

Test each view with NVDA + Firefox (Windows) and VoiceOver + Safari (macOS). The brief's §9 has the per-view checklist.

## Persistence

Kanban is fully bidirectional (Phase C) — drag-and-drop and inline edits write back to `.md` files atomically with mtime conflict detection. Bus messages are posted via `/api/bus-post`.

The proposal review form **does not auto-apply**. It surfaces the exact CLI command for the user to run in Claude Code, where `proposal-applier` enforces the dry-run + user-confirmation contract.
