# Clawspace UI (Phase 6)

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
| `/` | Dashboard — domain snapshots, latest bus headlines, today's log, pending proposals |
| `/kanban` | List of all Kanban boards |
| `/kanban/[board]` | Single board with accessible reorder pattern (listbox-with-grouping; press M to pick up a card) |
| `/channels` | List of all bus channels |
| `/channels/[channel]` | Slack-like channel view with live SSE tail and throttled polite-region announcements |
| `/proposals` | List of weekly self-evolution proposals |
| `/proposals/[week]` | Review form with one checkbox per diff, full rationale/risk/reversibility |
| `/proposals/[week]/confirm` | Confirmation screen with the exact CLI command to run (no auto-apply) |
| `/research/digests` | List of weekly research digests |
| `/research/digests/[week]` | Single digest, markdown rendered with heading downshift |

## API routes

| Path | Method | Purpose |
|---|---|---|
| `/api/bus-tail?channel=…&since=…` | GET (SSE) | Server-Sent Events stream tailing a channel JSONL |
| `/api/bus-post` | POST | Append a message to a channel (mirrors `bus-mcp` `bus_post`) |

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

## Persistence (NOT yet wired)

The Kanban view's reorder is local-only in v1 — drops do not write back to the markdown file. Persistence requires a route handler that calls the `kanban-move` skill via the `bus-mcp` `bus_post` tool. Deferred until Phase 7 once the bus-side flow is exercised.

The proposal review form **does not auto-apply**. It surfaces the exact CLI command for the user to run in Claude Code, where `proposal-applier` enforces the dry-run + user-confirmation contract.
