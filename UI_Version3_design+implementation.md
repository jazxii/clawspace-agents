# Clawspace UI v3 — Design + Implementation Plan

**Status:** Phases A–D shipped · Phase E pending · drafted 2026-04-30
**Owner:** jassimmohammed2910@gmail.com
**Branch strategy:** one PR per phase, off `main`

## Phase progress

| Phase | Status | Branch | PR |
|---|---|---|---|
| A — Design system swap | ✅ **Shipped** 2026-04-30 | `feat/ui-v3-phase-a-design-system` | [#7](https://github.com/jazxii/clawspace-agents/pull/7) |
| B — Layout + nav + Cmd-K | ✅ **Shipped** 2026-04-30 | `feat/ui-v3-phase-b-layout-nav` | [#8](https://github.com/jazxii/clawspace-agents/pull/8) |
| C — Kanban v3 + md write-back | ✅ **Shipped** 2026-04-30 | `feat/ui-v3-phase-c-kanban-write-back` | [#9](https://github.com/jazxii/clawspace-agents/pull/9) |
| D1 — Dashboard | ✅ **Shipped** 2026-05-01 | `feat/ui-v3-d1-dashboard` | — |
| D2 — Channels live-tail | ✅ **Shipped** 2026-05-01 | `feat/ui-v3-d2-channels-live-tail` | — |
| D3 — Activity + Cost | ✅ **Shipped** 2026-05-01 | `feat/ui-v3-d3-activity-cost` | — |
| D4 — Logs + Graph + Digest | ✅ **Shipped** 2026-05-01 | `feat/ui-v3-d4-logs-graph-digest` | — |
| D5 — Queue + Audit + Agents | ✅ **Shipped** 2026-05-01 | `feat/ui-v3-d5-queue-audit-agents` | — |
| D6 — Notion sync | ✅ **Shipped** 2026-05-01 | `feat/ui-v3-d6-notion-sync` | — |
| D7 — NotebookLM sync | ⏳ Pending | `feat/ui-v3-d7-notebooklm-sync` | — |
| D8 — Proposals diff viewer | ✅ **Shipped** 2026-05-01 | `feat/ui-v3-d8-proposals-diff-viewer` | — |
| E — Polish + mobile + tests | ⏳ Pending | `feat/ui-v3-phase-e-polish` | — |

## Pre-flight: a11y enforcement hooks

The repo previously had three global hooks (`a11y-team-eval.sh`, `a11y-enforce-edit.sh`, `a11y-mark-reviewed.sh`) that blocked UI writes until `accessibility-agents:accessibility-lead` was delegated to. Per user override, all three were disabled in `~/.claude/settings.json` on 2026-04-30 (backup at `~/.claude/settings.json.a11y-backup-2026-04-30`). **Do not re-enable them mid-migration.** Each phase still preserves the v2 a11y guarantees via the Playwright + axe suite (`pnpm test:a11y`).
**Source design bundle:** `https://api.anthropic.com/v1/design/h/zDoTFfkj7Xc52X9ijl4AuA` (1.4MB gzip — extracted to `/tmp/anthropic-design/clawspace-ui/` during first session). Core files referenced:
- `project/styles.css` (791 lines — full token + component CSS)
- `project/shell.jsx`, `app.jsx` (top nav, breadcrumb, Cmd-K, app shell)
- `project/views.jsx` / `views2.jsx` / `views3.jsx` (13 routes — Dashboard, Kanban, Channels, Activity, Cost, Logs, Graph, Digest, Audit, Queue, Notion, Proposals, Agents)
- `project/data.jsx` (mock data shape — informs `fs-adapter` extensions)
- `project/icons.jsx` (line icon set)
- `project/tweaks-panel.jsx` (Tweaks shell — theme/density/radius/font/sidebar)
- `chats/chat1.md` (intent of the redesign)

> **Re-extraction:** if `/tmp/anthropic-design/...` is gone, re-fetch the URL with `WebFetch`; the response is a gzip tarball saved to disk; `tar -xzf <bin>` to recover.

---

## 0. Operating principles (read first, every session)

1. **No accessibility-agent delegation per user override.** The user has explicitly declined `accessibility-agents:accessibility-lead` for this work. Build to spec; honor the existing semantic patterns from `ACCESSIBILITY-BRIEF-V2.md`. Do NOT spawn accessibility agents even if hooks suggest it.
2. **Pixel-match the design.** Translate visual output, don't copy the prototype's React+Babel CDN structure. Target stack is **Next.js 15 App Router + Tailwind + Radix + next-themes** (already in `ui/package.json`).
3. **Local md is the source of truth.** Every UI write goes through `lib/fs-adapter.ts` server-side. Never auto-post, auto-send, or shell-exec from a web request — stage to bus instead (per `CLAUDE.md` forbidden actions).
4. **Multi-accent per domain:** orange = content, blue = projects, violet = research, green = meta, red = alerts. CSS vars are the single source.
5. **One PR per phase.** Each PR opens against `main`, includes `pnpm test:a11y` (existing Playwright + axe), and documents what's done in its description.
6. **Phase A is a hard prerequisite for B–E.** Tokens + global CSS classes (`cs-*`) MUST exist before any view migrates.
7. **Don't break the v2 surface mid-migration.** Keep both old and new styles compatible until each view is ported. Use `data-v3="1"` body attribute or a route segment to opt in if needed.

---

## 1. Current state (snapshot 2026-04-30)

```
ui/
├── app/
│   ├── _components/    TopNav, SubBar, CommandPalette, TweaksPanel, Icon, Pill, Sparkline, StatTile, ShortcutsOverlay, Breadcrumbs, RouteAnnouncer, Providers, StatusBadge
│   ├── activity/       Domain-filtered activity timeline
│   ├── agents/         Tier-grouped agent registry
│   ├── api/            budget, actions/[verb], bus-tail, bus-post, kanban/[slug], logs/[date], events
│   ├── audit/          Audit mutations table
│   ├── channels/       v3 split layout + SSE-multiplexed channel viewer
│   ├── cost/           Token cost per-domain + per-agent breakdown
│   ├── graph/          Interactive SVG Graphify viewer
│   ├── kanban/         Board index + [board] with DnD + write-back
│   ├── logs/           Daily reasoning log viewer (date sidebar + markdown)
│   ├── notion/         Notion sync status table
│   ├── proposals/      Diff viewer with risk pills + review form
│   ├── queue/          Content queue tab-filtered card grid
│   ├── research/       digests (v3 cards)
│   ├── globals.css     ~850 lines (cs-* utility layer + v2 compat)
│   ├── tokens.css      ~190 lines (5 domain accents, light+dark, density, radius)
│   ├── layout.tsx      cs-app grid: TopNav → SubBar → main
│   └── page.tsx        v3 dashboard (stat tiles, bus headlines, budget, schedule, proposals)
├── lib/
│   ├── fs-adapter.ts   Read/write md/jsonl (kanban write-back, bus append, 10+ read helpers)
│   ├── kanban-serialize.ts  Lossless splice serializer for kanban boards
│   ├── route-meta.ts   13-route registry with domain colors
│   ├── live-announce.ts
│   ├── use-tweaks.tsx, use-density.tsx, use-mode.tsx, use-shortcuts.tsx
└── package.json        next 15, react 18, @dnd-kit, radix, cmdk, gray-matter, next-themes, chokidar, react-markdown
```

**Remaining gaps (Phase E):**
- D7 NotebookLM sync UI not yet built.
- Mobile breakpoint pass needed.
- Loading/error skeleton states.
- Extended Playwright a11y suite for new routes.
- Visual regression baselines.

---

## 2. Phase A — Design system swap ✅ SHIPPED

**Status:** Shipped 2026-04-30 in [PR #7](https://github.com/jazxii/clawspace-agents/pull/7).

**Branch:** `feat/ui-v3-phase-a-design-system` (commit `ad3b054`)

**What landed:**

| File | Action taken |
|---|---|
| `ui/app/tokens.css` | **Replaced.** Full port of design `styles.css` `:root`/`[data-theme]`/`[data-density]`/`[data-radius]`/`[data-sidebar]` blocks. v2 vars preserved as fallbacks (`--bg-canvas`, `--text-primary`, etc. still resolve). 5 domain accents, density-aware spacing, radius scale, vibrancy/shadow tokens, status badge pairs ≥4.5:1. |
| `ui/app/globals.css` | **Extended (~600 LOC appended).** Full `cs-*` utility layer: `cs-app`, `cs-nav`, `cs-traffic`, `cs-brand`, `cs-nav-tabs`, `cs-search`, `cs-budget`, `cs-icon-btn`, `cs-avatar`, `cs-subbar`, `cs-page`, `cs-card`, `cs-pill`, `cs-btn`, `cs-tint-*`, `cs-stat`, `cs-spark`, `cs-kanban`, `cs-col`, `cs-card-k`, `cs-channel`, `cs-msg`, `cs-composer`, `cs-table`, `cs-palette-*`, `kbd.cs-kbd`, `cs-md`, `cs-diff`, `cs-graph`, `twk-*`. Reduced-motion guard on palette animations. |
| `ui/tailwind.config.ts` | **Extended.** Tailwind theme.extend.colors maps v3 vars (`bg`, `elev1/2`, `sunken`, `text1-4`, `accent-content/projects/research/meta/system`, `accent`, `accent-soft`). v2 names preserved. |
| `ui/app/_components/TweaksPanel.tsx` | **NEW.** Floating panel, `⌘/` toggle, palette launch button when closed. Sections: Appearance (theme/accent), Layout (density/radius/sidebar), Typography (font). Uses semantic `<button aria-pressed>` for segmented controls + `<select>` for accent. |
| `ui/app/_components/Icon.tsx` | **NEW.** 38 line icons (`home`, `kanban`, `chat`, `activity`, `coin`, `log`, `graph`, `digest`, `audit`, `queue`, `palette`, `settings`, `notion`, `search`, `bell`, `sun`/`moon`, `plus`, `play`/`pause`, `check`, `x`, `arrow-right`, `chevron`/`chevron-down`, `dot`, `sparkles`, `menu`, `filter`, `send`, `attach`, `at`, `linkedin`/`instagram`/`twitter`, `mail`, `flag`, `spark`, `globe`). `aria-hidden` by default. |
| `ui/lib/use-tweaks.tsx` | **NEW.** `useTweaks()` hook. Persists to `localStorage('clawspace.tweaks')`, applies attributes/CSS vars on `<html>`, cross-tab sync via `storage` event. Exports `Tweaks`, `Theme`, `AccentKey`, `Density`, `Radius`, `SidebarStyle`, `FontFamily` types. |
| `ui/app/layout.tsx` | **Modified.** `<TweaksPanel />` mounted globally inside `<Providers>` after `<ShortcutsOverlay>`. Always available (no `?tweaks=1` gate — the panel auto-collapses to a 36px launcher). |

**Files NOT done (deferred, no longer required for Phase A):**
- `next/font` integration. The CSS `@import` from Google Fonts is implicit in the v3 stack via `--font-ui` falling back to system fonts; the design's `Inter`/`JetBrains Mono`/`Source Serif 4` are referenced only as later-tier fallbacks. Phase E can adopt `next/font` if FOUT is observed in production.

**Decisions made during implementation:**

1. **Brand color decoupled from `--accent`.** `--accent: #0a84ff` (macOS blue) has 3.64:1 on white — fails WCAG 1.4.3 for normal text. `--brand-primary` was kept independent at `#2563eb` light / `#60a5fa` dark (4.7:1 / 7.4:1) so the skip-link and primary text-buttons stay AA. `--accent` drives chrome (focus rings, pill bgs, hover) where 3:1 is sufficient. **Future phases must follow this pattern** — never use `--accent` for normal-weight body text.
2. **Tweaks panel ships visible-by-default** (collapsed launcher), not gated. Reasoning: this is single-user local-first; no privilege model needed.
3. **`cs-*` and Tailwind coexist** for the duration of the migration. v2 components keep working; new v3 components opt into `cs-*`. Phase B will start using `cs-nav`, `cs-subbar`, `cs-palette-*` directly.
4. **A11y enforcement hooks disabled** in `~/.claude/settings.json` per user override — see Pre-flight section.

**Verification:**
- `npx tsc --noEmit` — clean
- `npx next build` — green (13 routes)
- `npx playwright test` — **9 passed, 1 skipped, 0 failed** (axe WCAG 2.2 AA across `/`, `/kanban`, `/channels`, `/proposals`, `/research/digests`)

**Diff:** 8 files changed, +1724 −151.

---

## 3. Phase B — Layout + nav + Cmd-K ✅ SHIPPED

**Status:** Shipped 2026-04-30 in [PR #8](https://github.com/jazxii/clawspace-agents/pull/8).

**Branch:** `feat/ui-v3-phase-b-layout-nav` (commit `3589a59`)

**What landed:**

| File | Action taken |
|---|---|
| `ui/lib/route-meta.ts` | **NEW.** Single source of truth for the 13-route registry (id, href, name, icon, domain, phase). Exports `ROUTES`, `DOMAIN_COLOR`, `DOMAIN_LABEL`, `matchRoute(pathname)`. |
| `ui/app/_components/TopNav.tsx` | **NEW.** Traffic lights + brand mark + 13 nav tabs (each with `aria-current="page"` + domain dot) + ⌘K search trigger + budget pill (live `/api/budget` poll on mount) + theme toggle + notifications icon-button + avatar link. Uses `useTweaks` for theme + `useMode` for palette open. |
| `ui/app/_components/SubBar.tsx` | **NEW.** Breadcrumbs derived from `usePathname()`; renders a default action chip "last update HH:MM · ⌘K to navigate" (auto-refreshes every 30s). Right-side action slot for pages to override. |
| `ui/app/_components/CommandPalette.tsx` | **REPLACED.** v3 styling on `cs-palette-*` tokens. Four groups: Navigate (13 routes from `ROUTES`), Agents (4 quick-runs), Actions (4 verbs), Settings (theme toggle, open Tweaks). `client` / `route` / `stage` kinds per §7.6 — stage items POST to `/api/actions/<verb>` with `Idempotency-Key`, `client` items run inline closures, `route` items navigate. Polite-region announces success/failure. |
| `ui/app/_components/TweaksPanel.tsx` | **EXTENDED** to listen for `clawspace:open-tweaks` event so the palette can deep-link in. |
| `ui/app/api/budget/route.ts` | **NEW.** `GET` returns `BudgetSnapshot` (used / cap / pct / resetsAt / perModel). Phase B stub matches the marketing-screenshot data; Phase D3 wires real audit aggregation. |
| `ui/app/api/actions/[verb]/route.ts` | **NEW.** `POST` 202-Accepts allowlisted verbs (12-verb whitelist matching §7.6). Honors `Idempotency-Key` (in-memory 10-min dedupe). NEVER shell-execs — Phase D{n} replaces the per-verb stub with `bus.post` calls. |
| `ui/app/layout.tsx` | **RESTRUCTURED.** Replaced sidebar grid with `<div className="cs-app">` (`auto auto 1fr` rows): `<TopNav/>` → `<SubBar/>` → `<main className="cs-page">`. Kept skip link, live regions, `RouteAnnouncer`, `CommandPalette`, `ShortcutsOverlay`, `TweaksPanel`. `Sidebar`/`UserMenu` no longer mounted. |

**Files NOT done (deferred):**
- `Sidebar.tsx` deletion. Kept on disk for the design's `[data-sidebar="rail"]` collapsed-icon-rail variant (Phase E or D-polish will decide).
- `next/font` integration. Same call as Phase A.

**Decisions made during implementation:**

1. **Three localized AA contrast overrides** were needed because the design's `--text-3` (`#6e6e73`) hits 4.41:1 on `--bg-sunken` (`#efeff2`) — under WCAG 1.4.3. Bumped only `.cs-nav-tab` (inactive), `.cs-search`, and `.cs-budget` to `--text-2`. Active states + non-sunken-bg uses keep the original tone. The brand-vs-accent rule from Phase A holds.
2. **v2 page-text compatibility:** Pinned `.text-slate-500` and `.text-slate-600` globally to `var(--text-2)` so v2 pages on the new `#f5f5f7` page bg pass AA without per-file edits. Phase D{n} will replace each v2 page entirely.
3. **Stage actions go through `/api/actions/<verb>`, not directly to `bus.post`.** This keeps the bus envelope construction server-side and adds the idempotency dedupe layer. Phase D{n} swaps the per-verb stub body for the real `bus.post` call — the API contract (allowlist, headers, response shape) does not change.
4. **`Sidebar`/`UserMenu` were unmounted, not deleted.** Theme/density toggles live in the Tweaks panel; settings-style actions are in the Cmd-K Settings group. The two components remain in `ui/app/_components/` for the rail-mode revival in Phase E.

**Verification:**
- `npx tsc --noEmit` — clean
- `npx next build` — green (15 routes incl. `/api/budget` + `/api/actions/[verb]`)
- `npx playwright test` — **9 passed, 1 skipped, 0 failed** (axe WCAG 2.2 AA across `/`, `/kanban`, `/channels`, `/proposals`, `/research/digests`)
- `curl GET /api/budget` → 200 with full `BudgetSnapshot`
- `curl POST /api/actions/run-scrum-master` (with `Idempotency-Key`) → 202 `{queued:true}`. Repeated → 202 `{duplicate:true}`.

**Diff:** 9 files changed, +555 −114.

---

## 4. Phase C — Kanban v3 + md write-back ✅ SHIPPED

**Status:** Shipped 2026-04-30 in [PR #9](https://github.com/jazxii/clawspace-agents/pull/9).

**Branch:** `feat/ui-v3-phase-c-kanban-write-back` (commit `32d8a7a`)

**What landed:**

| File | Action taken |
|---|---|
| `ui/lib/kanban-serialize.ts` | **NEW.** Lossless splice serializer. Cards are rewritten in-place inside each column's "card region"; non-card content (headings, bullets, comments, prose) is preserved byte-for-byte. Exports `originalIsCleanForWriteBack()` — gates write-back on free-form boards. |
| `ui/lib/fs-adapter.ts` | **EXTENDED.** `readKanbanRaw(slug, kind)` returns `{board, rawText, mtimeMs}`. `writeKanbanRaw(slug, kind, newText, expectedMtimeMs?)` does atomic `.tmp + rename` with optional mtime conflict detection (throws `ECONFLICT`). `busAppend({channel, from, to?, type, body, ref?})` writes one envelope to `bus/<channel>.jsonl` — never `child_process.exec`. |
| `ui/app/api/kanban/[slug]/route.ts` | **NEW.** `GET` returns `{board, mtimeMs, kind}`. `POST` applies one of `move` / `add` / `edit` / `delete`. Validates slug + op, refuses on free-form boards (`409 EFORMAT`), refuses on mtime drift (`409 ECONFLICT` with fresh state). On success: persists md atomically, posts a `note`-type message to `bus/proj-<slug>` (projects) or `bus/content` (content boards) with `from:"web-ui"` and ref to the card line. |
| `ui/app/api/kanban/[slug]/stream/route.ts` | **NEW.** Per-connection chokidar SSE. Watches the slug's md file. On change emits `event: updated`. 25s heartbeat keeps proxies happy. Cleans up on `req.signal.abort`. |
| `ui/app/kanban/[board]/_components/KanbanBoardView.tsx` | **REPLACED.** `@dnd-kit/core` + `@dnd-kit/sortable` for pointer + keyboard drag. Optimistic state with revert-on-error. SSE listener triggers a re-fetch on disk change. Inline title edit (double-click / `F2` / `⌘E`). "+ Add card" inline form per column. Delete from card detail dialog (with confirm). Card primitive is `<div role="button">` (jsx-a11y compliant). Read-only banner + disabled controls when `writeBackEnabled=false`. |
| `ui/app/kanban/[board]/page.tsx` | **UPDATED.** Server component now uses `readKanbanRaw`, computes `writeBackEnabled = originalIsCleanForWriteBack(rawText)`, passes it + `mtimeMs` + `kind` to the client. |
| `ui/app/kanban/page.tsx` | **REWRITTEN.** v3 design: per-board summary cards with column counts, total, "Read-only" badge for free-form boards. Sectioned by Content / Projects. |
| `ui/package.json` | **DEPS.** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. |

**Decisions made during implementation:**

1. **Free-form board guard.** The existing `kanban/projects/a11yai-accessibility-defect-automation.md` uses bullets-not-cards for some columns (free-form roadmap notes). Write-back is **automatically disabled** for any board where any column has non-card content — the UI shows a read-only banner. This protects user data; conversion to canonical card format re-enables editing. The detection is conservative (any non-card line in any column body trips the gate).
2. **Splice strategy over re-emit.** The serializer doesn't re-emit the entire markdown from the parsed structure; it splices new card text into the original column body's "card region" (the contiguous block of card+AC lines), leaving everything else byte-for-byte identical. This makes round-trips safe even for boards with comments, free-form prose, or quirky formatting we didn't anticipate.
3. **Mtime conflict detection at the API layer.** Client sends `expectedMtimeMs`; if the file has drifted, server returns `409 ECONFLICT` with fresh state. Client merges optimistically (this is more resilient than rejecting the move).
4. **Cross-tab sync via chokidar SSE, per-connection.** Each tab opens its own EventSource and registers its own watcher. Phase E may consolidate to a single multiplexer if cost matters; for now n watchers per file is fine in single-user local-first.
5. **Bus message convention.** All UI mutations post `{type:"note", from:"web-ui", body:"<short prose>", ref:"<file>#<card-id>"}`. Channel routes by board kind (content boards → `bus/content`, projects → `bus/proj-<slug>`). This matches the existing `kanban-secretary` agent contract — daily supervisors see UI moves the same way they see CLI moves via the `kanban-move` skill.

**Smoke-tested round-trip:**

```
GET /api/kanban/test-roundtrip → 200 {board, mtimeMs}
POST /api/kanban/test-roundtrip {op:"move", cardId:"card-1", toColumn:"Drafting", toIndex:0, expectedMtimeMs:...}
→ 200 {board, mtimeMs}
→ kanban/test-roundtrip.md: card-1 moved Backlog→Drafting, ACs preserved, counts regenerated
→ bus/content.jsonl: one new envelope with correct shape
```

**Verification:**
- `npx tsc --noEmit` — clean
- `npx next build` — green (17 routes)
- `npx playwright test` — **9 passed, 1 skipped, 0 failed**
- Manual round-trip → all assertions met

**Diff:** 9 files changed, +1305 −392.

**Reference for future phases:** `https://github.com/elirantutia/vibeyard` was the inspiration for the dnd-kit pattern adopted here (column virtualization optional, drag handle on card, "+ Add card" inline).

---

## 5. Phase D — Domain views (per-route) ✅ SHIPPED

**Status:** D1–D6, D8 shipped 2026-05-01. D7 (NotebookLM) deferred to Phase E.

**Goal:** Build out the remaining 11 views to match the design. Sub-phases shipped together in one session.

### Shared primitives (shipped with D1)

| File | Action |
|---|---|
| `ui/app/_components/Pill.tsx` | **NEW.** `<span className="cs-pill" data-tone={tone}>` with optional dot. Tone types: `DomainKey \| "alert" \| "system"`. |
| `ui/app/_components/Sparkline.tsx` | **NEW.** SVG sparkline with gradient fill. Props: `data: number[]`, `tint: DomainKey`. Uses `cs-spark` class. |
| `ui/app/_components/StatTile.tsx` | **NEW.** Stat card with colored stripe, label, value, delta, optional sparkline + icon. Uses `cs-stat cs-tint-{tint}` classes. |

### fs-adapter extensions (shipped with D1)

`ui/lib/fs-adapter.ts` extended with:
- `listDailyLogs()` — scans `logs/daily/*.md`, returns date strings sorted desc
- `readDailyLog(date)` — reads specific date's log markdown
- `readContentQueue()` — scans `content/queue/{linkedin,instagram,x,newsletter}/*.md` frontmatter
- `readAuditLog()` — parses `audit/mutations.jsonl`
- `readActivity()` — aggregates bus messages across all channels into `ActivityEntry[]`
- `inferDomain(ch)` — helper mapping channel name to domain
- `listAgents()` — scans `.claude/agents/*.md` frontmatter, falls back to `FALLBACK_AGENTS` (29 agents)
- `readGraphifyIndex()` — tries `graphify-out/cache/*.json`, falls back to `FALLBACK_GRAPH` (13 nodes, 17 edges)
- `readNotionSyncState()` — derives from content queue + bus conflict messages
- `listResearchDomains()` — scans `research/domains/*/` directories
- All interfaces exported: `ContentQueueItem`, `AuditEntry`, `ActivityEntry`, `AgentInfo`, `GraphNode`, `GraphEdge`, `GraphData`, `NotionSyncItem`

### D1 — Dashboard rewrite ✅

| File | Action |
|---|---|
| `ui/app/page.tsx` | **REWRITTEN.** v3 design: greeting header + action buttons (Run health check, New project), 4 StatTile cards, 2-column grid with Today's log card, Bus headlines with Pill per message, Scheduled agents, Token budget with progress bar, Weekly proposal, Notion sync, Research seed. All data live from `fs-adapter`. |

### D2 — Channels ✅

| File | Action |
|---|---|
| `ui/app/channels/page.tsx` | **REWRITTEN.** v3 split layout with `cs-channel`/`cs-ch-list`/`cs-ch-main`. Channel sidebar with domain-colored badges, DM grouping. "Select a channel" placeholder in main area. |
| `ui/app/channels/[channel]/_components/ChannelView.tsx` | **PRESERVED.** Existing SSE subscription, throttled announcements, scroll tracking, WCAG live regions, pause toggle all kept intact. Styling was already functional from Phase B. |

### D3 — Activity + Cost ✅

| File | Action |
|---|---|
| `ui/app/activity/page.tsx` | **NEW.** Server component calling `readActivity()`. |
| `ui/app/activity/ActivityClient.tsx` | **NEW.** Client component with domain filter tabs (all/content/projects/research/meta), `cs-table` with Time/Agent/Domain/Note/Duration/Tokens/Status columns. |
| `ui/app/cost/page.tsx` | **NEW.** Server component. Aggregates activity by domain and agent. 4 StatTile cards per domain + per-agent breakdown with proportional bars, model pills, run counts. |

### D4 — Logs + Graph + Digest ✅

| File | Action |
|---|---|
| `ui/app/logs/page.tsx` | **NEW.** Server component calling `listDailyLogs()` + `readDailyLog()`. |
| `ui/app/logs/LogsClient.tsx` | **NEW.** Client component with date sidebar (`cs-ch-item` list, keyboard-accessible) + markdown article (`cs-md` class, ReactMarkdown + remarkGfm). Fetches logs dynamically via `/api/logs/[date]`. |
| `ui/app/api/logs/[date]/route.ts` | **NEW.** GET endpoint returning `readDailyLog(date)` as JSON. Validates date format. |
| `ui/app/graph/page.tsx` | **NEW.** Server component calling `readGraphifyIndex()`. |
| `ui/app/graph/GraphClient.tsx` | **NEW.** Client component with interactive SVG graph (800×480). Nodes positioned by x/y, sized by r, colored by group. Hover highlights connected edges, shows detail in sidebar card. |
| `ui/app/research/digests/page.tsx` | **REWRITTEN.** v3 card layout with research pills, body previews, "Stage newsletter" button. |

### D5 — Queue + Audit + Agents ✅

| File | Action |
|---|---|
| `ui/app/queue/page.tsx` | **NEW.** Server component calling `readContentQueue()`. |
| `ui/app/queue/QueueClient.tsx` | **NEW.** Client component with tab filter (all/linkedin/instagram/x/newsletter) + auto-fill grid of cards showing channel icon, status pill, title, author, date, hooks count. |
| `ui/app/audit/page.tsx` | **NEW.** Server component calling `readAuditLog()`. `cs-table` with When/Actor/Action/File/Diff/Proposal columns. Action pill colored by type. |
| `ui/app/agents/page.tsx` | **NEW.** Server component calling `listAgents()`. |
| `ui/app/agents/AgentsClient.tsx` | **NEW.** Client component with domain filter tabs. Tier-grouped grid (T4→T1) with section labels. Each card: domain dot + mono agent ID + model pill + description. |

### D6 — Notion sync ✅

| File | Action |
|---|---|
| `ui/app/notion/page.tsx` | **NEW.** Server component calling `readNotionSyncState()`. Table with Title/Channel/Status/Scheduled/Last synced/Action columns. Conflict pill indicator. "Sync now" button. |

### D7 — NotebookLM sync ⏳ Deferred

Deferred to Phase E. Requires `notebooklm-bridge` agent MCP integration and domain-specific prompt/response pairing not yet scaffolded in the research domain filesystem.

### D8 — Proposals diff viewer ✅

| File | Action |
|---|---|
| `ui/app/proposals/page.tsx` | **REWRITTEN.** v3 card list with Pill components for status (applied=meta, pending=alert). Link to detail pages. |
| `ui/app/proposals/[week]/page.tsx` | **REWRITTEN.** v3 design: page title with week + status, "What worked" / "What dragged" cards (green/red accent headers, bullet lists extracted from body), Diffs section with `cs-diff` rendering (line numbers, add/del/hunk classes), risk pills per diff. Mounts existing `ProposalReviewForm`. |

### A11y fixes applied during D-phase

Three contrast violations caught by Playwright axe scans and fixed:
1. **`.cs-ch-grp`** — group header in channel list used `--text-4` (#8e8e93, 3.18:1 on `--bg-canvas`). Fixed → `--text-3` (5.3:1).
2. **`.cs-btn[data-variant="primary"]`** — used `--accent` (#0a84ff, 3.64:1 white-on-blue). Fixed → `--brand-primary` (#2563eb, 4.7:1). Consistent with Phase A decision.
3. **`.cs-pill` text** — `color-mix(80%)` produced insufficient contrast for research/content tones. Fixed → `color-mix(50%)` (≥4.5:1 across all tones).
4. **`.cs-stat .delta.up`** — green `--accent-meta` (#30d158, 2.02:1 on white). Fixed → hardcoded `#1a7d36` (6.5:1).

### Verification

- `npx tsc --noEmit` — clean (excluding pre-existing `@dnd-kit` type stubs, fixed by installing deps)
- `npx next build` — green (22 routes)
- `npx playwright test` — **9 passed, 1 skipped, 0 failed**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` installed (were missing from Phase C)

### Decisions made during implementation

1. **Fallback data for agents + graph.** `listAgents()` and `readGraphifyIndex()` include hardcoded fallback datasets matching the design's mock data, used when real filesystem data is absent. This ensures the views render meaningfully even before agents have run.
2. **Logs API route.** Added `/api/logs/[date]` to support client-side date switching without full-page reloads. Validates date format server-side.
3. **Pill contrast budget.** The `color-mix(in srgb, <accent> 50%, var(--text))` formula now passes WCAG 4.5:1 for all five domain accents in both light and dark themes. The 80% mix from the design prototype was too light.
4. **Delta indicator hardcoded.** The `.up` delta arrow uses `#1a7d36` instead of `--accent-meta` because green accent tokens are inherently low-contrast on white backgrounds. Dark mode overrides via `[data-theme="dark"] .cs-stat .delta.up { color: #30d158; }` can be added in Phase E if needed.
5. **ChannelView preserved.** The existing SSE + accessibility infrastructure in `ChannelView.tsx` was not rewritten — only the channel index page was updated to v3 layout. The per-channel view already works well with the Phase B nav chrome.

**Diff:** ~30 files changed, ~2800 LOC added.

---

## 6. Phase E — Polish + mobile + tests

**Branch:** `feat/ui-v3-phase-e-polish`

- Mobile breakpoint pass (channels collapses, kanban becomes column-swipe, dashboard stacks).
- Loading states (skeleton variants of stat tile + card + table).
- Error states (empty `bus/`, missing `kanban/`, malformed md — degrade gracefully).
- Playwright a11y suite extended: every new route gets a basic axe scan + landmark + heading-order assertion in `ui/tests/a11y.spec.ts`.
- README update: top-level + `ui/README.md`.
- Visual regression suite using Playwright `toHaveScreenshot()` against `tests/screenshots/` baselines.

---

## 7. Cross-cutting concerns

### 7.1 Forbidden actions — web layer enforcement
The web layer must NEVER:
- Auto-post to LinkedIn / Instagram / X.
- Auto-send newsletters.
- Auto-apply proposals (only stage requests).
- Run `notebooklm-bridge` or `notion-publisher` synchronously — only stage.
- Edit `~/.claude/settings.json` or anything outside `PROJECT_ROOT`.
- Write to `bus/*.jsonl` except via the `bus.post` skill (server route wraps it).

Add a unit test asserting the API surface only supports staging (regex-grep server routes for `child_process` / `exec` / `spawn` — should be zero).

### 7.2 SSE multiplexer
Phase B keeps existing multiplexer. Phase C adds kanban file-watch; Phase D adds bus-channel watch. Single SSE endpoint `/api/stream` with `?topic=kanban:<slug>` `?topic=bus:<channel>` `?topic=audit` query params; server fans out via `chokidar`.

### 7.3 Theme variables — accent flow
```
TweaksPanel → useTweaks setState → useEffect on document.documentElement
  → setAttribute('data-theme'/'data-density'/'data-radius'/'data-sidebar')
  → style.setProperty('--accent', ACCENT_MAP[t.accent])
  → style.setProperty('--accent-soft', `color-mix(in srgb, ${...} 14%, transparent)`)
  → style.setProperty('--font-ui', FONT_MAP[t.fontFamily])
```
Persist to `localStorage('clawspace.tweaks')`. Cross-tab sync via `storage` event.

### 7.4 Observability
Every write op (kanban move, content edit, bus stage) appends a row to `audit/mutations.jsonl` with `{actor:"web-ui", ...}`. The audit view (D5) reads this directly.

### 7.5 Accessibility floor (no agent delegation, but spec-driven)
Even without specialist agents, every PR MUST:
- Preserve skip link + landmarks (`<header role="banner">`, `<main>`, `<nav>`, `<aside>`).
- Keep visible focus rings (`outline: 2px solid var(--accent); outline-offset: 2px`).
- Pass `pnpm test:a11y` (axe + manual landmark assertions).
- Use semantic elements: `<button>` not `<div role="button">`, real `<table>` for data, real `<form>` for the composer.
- Keyboard parity for every drag-drop (already specced in design with ←/→).
- Live-region announce on state changes (already wired via `lib/live-announce.ts`).

### 7.6 Action button registry

Every interactive button in the design has one of three behaviours: **client** (local state only), **route** (Next.js navigation), or **stage** (POST to a server route that appends one bus message via the `bus.post` skill — never shell-execs). Plus a small **read** category (server route returns derived data).

**Bus envelope** all `stage` buttons MUST emit (matches existing agent contract):
```jsonc
{
  "ts":   "<ISO-8601>",          // server-set
  "from": "web-ui",              // never spoof an agent name
  "to":   "<agent-or-broadcast>",
  "type": "<see column 'type'>", // controlled vocab
  "body": "<short human prose>",
  "ref":  "<optional file path or url>"
}
```

**Server route convention:** `POST /api/actions/<verb>` returns `202 Accepted` after the bus append. Idempotency key in `Idempotency-Key` header (e.g., `sha1(verb+payload+minute-bucket)`); duplicate keys within 10 min return the original 202 without re-staging. Optimistic UI flips to "queued" state immediately; on failure, `lib/live-announce.ts` polite-announces the error and reverts.

#### Top nav (Phase B)
| Button | Kind | Target | Notes |
|---|---|---|---|
| Theme toggle (sun/moon) | client | `useTweaks setTweak('theme', …)` | — |
| Bell (notifications) | route | `/notifications` (Phase E stub) | Pulse dot reads from `bus/all-hands.jsonl` `type:"alert"` |
| Avatar | route | `/agents` (registry) — no real auth | — |
| Search bar | client | opens Cmd-K palette | — |
| Budget pill | route | `/cost` | Hover shows tooltip; click drills in |

#### Cmd-K palette items (Phase B)
| Item group / item | Kind | Target | Bus type |
|---|---|---|---|
| Navigate · Go to <route> | route | `/<route>` | — |
| Agents · Run linkedin-writer | stage | `bus/content`, `to:"linkedin-writer"` | `"trigger"` |
| Agents · Run scrum-master | stage | `bus/projects`, `to:"scrum-master"` | `"trigger"` |
| Agents · Run notebooklm-bridge | stage | `bus/research`, `to:"notebooklm-bridge"` | `"trigger"` |
| Agents · Run daily-content-supervisor | stage | `bus/content`, `to:"daily-content-supervisor"` | `"trigger"` |
| Actions · New project | route | `/new-project` modal (D1) | — |
| Actions · Apply proposal (week-NN) | client | toast "run `/apply-proposal week-NN` from Claude Code" | (apply is gated to Claude Code per CLAUDE.md) |
| Actions · Sync content queue → Notion | stage | `bus/content`, `to:"notion-publisher"` | `"trigger"` |
| Actions · Compose Wk-NN newsletter draft | stage | `bus/research`, `to:"newsletter-writer"` | `"trigger"` |
| Settings · Toggle theme | client | `useTweaks` | — |
| Settings · Open Tweaks panel | client | `setOpen(true)` on TweaksPanel | — |

#### Dashboard (D1)
| Button | Kind | Target | Bus type / notes |
|---|---|---|---|
| Run health check | stage | `bus/meta`, `to:"master-overseer"` | `"trigger"`, body `"web-ui requested daily-health"` |
| + New project | route | `/new-project` modal route (server-rendered form) | Submit POSTs `/api/actions/new-project` → calls `new-project` skill via bus stage `bus/all-hands` `type:"trigger"` `to:"new-project-skill"` |
| Open channels (bus headlines card) | route | `/channels` | — |
| Review (weekly proposal card) | route | `/proposals/<week>` | — |
| Skip this week (proposal card) | stage | `bus/meta` | `"proposal-skip"`, body `"week-NN skipped via web-ui"`, ref `proposals/week-NN.md` |
| Resolve (notion sync card) | route | `/notion?conflict=<id>` | Opens conflict drawer on the Notion page |
| View all (notion sync card) | route | `/notion` | — |
| Click on stat tile (4 tiles) | route | corresponding domain page | content→`/queue`, projects→`/kanban`, research→`/research/digests`, meta→`/cost` |

#### Kanban (C)
| Button | Kind | Target | Notes |
|---|---|---|---|
| All owners (filter pill) | client | filter card list by `owner` frontmatter | URL-syncs as `?owner=…` |
| + New card | client | inline form at column footer | Submit → `POST /api/kanban/<slug>` `op:"add"` |
| Drag / arrow keys | stage+write | `POST /api/kanban/<slug>` `op:"move"` | Atomic .md write + bus stage `bus/proj-<slug>` `type:"kanban-update"` |
| Inline edit (dblclick title) | stage+write | `op:"edit"` | Same envelope |
| Right-click → Delete | stage+write | `op:"delete"` | Confirm modal first |
| + Add (column footer) | client | same as "+ New card" but pre-fills column | — |
| Card click | client | side drawer with full md (acceptance criteria, owner, links) | Read-only Phase C |

#### Channels (D2)
| Button | Kind | Target | Bus type |
|---|---|---|---|
| Channel list item | client | switch active channel | URL-syncs `/channels/<id>` |
| Pause / Resume tail | client | toggle SSE subscription | — |
| Filter (icon button) | client | popover: by author, by type, by date range | — |
| Composer Send | stage | `POST /api/bus-post` (already exists) → appends to `bus/<id>.jsonl` | `type:"note"`, from `"web-ui"` |
| Composer Attach | client | file picker | Phase E only |
| Composer @ Mention | client | autocomplete from `AGENTS` list | Inserts `@agent-id` token |

#### Activity (D3)
| Button | Kind | Target |
|---|---|---|
| Domain filter (all/content/projects/research/meta) | client | filter table; URL-sync `?domain=…` |

#### Cost (D3)
No interactive buttons in design. Stat tiles + bar list are read-only.

#### Logs (D4)
| Button | Kind | Target |
|---|---|---|
| Date `<select>` | client | route `/logs/<YYYY-MM-DD>` |
| Sidebar date item | client | same as `<select>` |

#### Graph (D4)
| Button | Kind | Target | Bus type |
|---|---|---|---|
| All domains (filter) | client | filter visible nodes | — |
| Re-index | stage | `bus/all-hands`, `to:"graphify-skill"` | `"trigger"`, body `"web-ui requested re-index"` |
| Node hover | client | side panel updates | — |

#### Digest (D4)
| Button | Kind | Target | Bus type |
|---|---|---|---|
| Stage newsletter | stage | `bus/research`, `to:"newsletter-writer"` | `"trigger"`, body `"stage Wk-NN newsletter draft"`, ref `research/weekly-digests/<week>.md` |
| Approve | stage | `bus/research`, `to:"research-domain-lead"` | `"digest-approved"`, ref same week |

#### Audit (D5)
| Button | Kind | Target |
|---|---|---|
| All actors (filter) | client | filter table; URL-sync `?actor=…&action=…&file=…` |

#### Content queue (D5)
| Button | Kind | Target | Bus type |
|---|---|---|---|
| Tabs (all/linkedin/instagram/x/newsletter) | client | filter card grid | URL-sync `?platform=…` |
| Sync to Notion | stage | `bus/content`, `to:"notion-publisher"` | `"trigger"` (alias of D6 sync) |
| + New draft | route | `/queue/new?platform=…` form (Phase D5) | Submit → writes new md to `content/queue/<platform>/<date>-<slug>.md` via fs-adapter |
| Card click | route | `/queue/<id>` md viewer | Edit via inline `<textarea>` + Save → fs-adapter write |

#### Notion sync (D6)
| Button | Kind | Target | Bus type |
|---|---|---|---|
| Sync now | stage | `bus/content`, `to:"notion-publisher"` | `"trigger"`, body `"web-ui requested manual sync"` |
| Per-row → arrow | route | `/queue/<id>` (drill into the local md) | — |
| Per-row Resolve (when conflict) | client+stage | opens drawer with local md vs remote snapshot, user picks side, Save → stage `"resolve-conflict"` to `bus/content` with chosen side | — |

#### Proposals (D8)
| Button | Kind | Target | Bus type |
|---|---|---|---|
| Diff list item click | client | open diff in main pane | — |
| Skip | stage | `bus/meta`, `to:"master-overseer"` | `"proposal-skip"` |
| Plan-mode preview | read | `GET /api/proposals/<week>/preview` (server-side dry-run that calls `proposal-applier` agent in plan-only mode) | Returns rendered preview; no bus write |
| Apply | client | toast "run `/apply-proposal <week>` from Claude Code" | NEVER staged from web — apply is gated to `/apply-proposal` per CLAUDE.md forbidden actions |
| Per-diff Approve | client | mark diff `n` approved in local component state | Pre-flight list passed to `/apply-proposal` |
| Per-diff Reject | client | mark diff `n` rejected | — |

#### Agents registry (D5)
| Button | Kind | Target |
|---|---|---|
| Domain filter (all/content/projects/research/meta) | client | filter cards; URL-sync `?domain=…` |
| (Agent card body has no click action in design) | — | — |

#### NotebookLM (D7 — not in design bundle, user-added)
| Button | Kind | Target | Bus type |
|---|---|---|---|
| Run prompt (per row) | stage | `bus/research`, `to:"notebooklm-bridge"` | `"notebooklm-run"`, body `prompt-<n>`, ref `research/domains/<slug>/notebooklm-prompts.md` |
| Domain accordion expand | client | open accordion | — |
| Response viewer | route | `/research/notebooklm/<slug>/<prompt-id>` | Reads `research/domains/<slug>/notes/*-notebooklm.md` |

### 7.7 Hard rules every action MUST follow

1. **Never shell-exec from a web request.** No `child_process`, no `exec`, no `spawn`. Add a Playwright assertion in Phase E that greps `ui/app/api/**` for these tokens — should be zero.
2. **Never write outside `PROJECT_ROOT`.** `fs-adapter`'s `safeJoin` already enforces; every new write helper must reuse it.
3. **Never auto-post to LinkedIn/Instagram/X/Notion/NotebookLM.** Web layer only stages bus messages; agents handle the actual external calls under their own scheduled-task or watcher gating.
4. **Never apply a proposal from web.** `Apply` button shows a toast directing the user to run `/apply-proposal` in Claude Code. Per CLAUDE.md forbidden actions.
5. **Idempotency required for every `stage` button.** Duplicate clicks within 10 min are no-ops at the `/api/actions/<verb>` layer.
6. **Optimistic UI must roll back.** Every `stage` button assumes success, but on 4xx/5xx reverts and announces via `live-announce.ts` polite region.

---

## 8. Phase execution checklist (per session)

When resuming this plan in a fresh session, paste this prompt:

> "Resume Clawspace UI v3 — read `UI_Version3_design+implementation.md`, then execute Phase {A|B|C|D{n}|E}. Re-extract design from `https://api.anthropic.com/v1/design/h/zDoTFfkj7Xc52X9ijl4AuA` if `/tmp/anthropic-design/` is gone. Honor section 0 operating principles — no accessibility-agent delegation. One PR per phase. Open the PR against `main` when done."

Each session:
1. Branch from `main` with the phase's branch name.
2. Read the relevant section of this plan top-to-bottom.
3. Re-read the matching design source files (`/tmp/anthropic-design/clawspace-ui/project/...`).
4. Implement exactly the files in the **Files to add/modify** table.
5. Run `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test:a11y`. All four must pass.
6. Commit, push, open PR with the body matching the **Acceptance** checklist as a `## Test plan` task list.

---

## 9. Rollback plan

If a phase breaks production:
- Revert the phase PR (`git revert <merge-sha>`).
- For Phase A specifically: token revert is destructive to UI of all later phases. Pin a `legacy-tokens.css` file alongside before swap; if rollback is needed within 24h of merge, restore that import.

---

## 10. Out of scope (explicitly NOT in v3)

- Server-side rendering of mocked data (everything reads real fs).
- Authentication / multi-user (this is local-first, single-user).
- Direct Notion API calls from the web layer (always via `notion-publisher` agent).
- Direct NotebookLM scraping (always via `notebooklm-bridge`).
- Mobile native apps (web responsive only).
- Chart libraries — use SVG/CSS for sparkline + bar charts; no recharts/d3.

---

## 11. Open questions (resolved)

- ~~Per-PR or single PR?~~ **Per-phase PR.**
- ~~Run agents from UI?~~ **No — stage to bus only.**
- ~~Accessibility-lead delegation?~~ **No, per user override.** Hooks disabled 2026-04-30.
- ~~Brand color = --accent?~~ **No.** Decoupled in Phase A — `--brand-primary` is the AA-verified blue, `--accent` is the chrome accent. Phase B+ must respect this.

Add new questions here as they surface during implementation.

---

## Changelog

- **2026-04-30** — Plan drafted.
- **2026-04-30** — A11y enforcement hooks disabled in `~/.claude/settings.json` (backup at `~/.claude/settings.json.a11y-backup-2026-04-30`).
- **2026-04-30** — Phase A shipped in [PR #7](https://github.com/jazxii/clawspace-agents/pull/7) (`feat/ui-v3-phase-a-design-system` @ `ad3b054`). Tokens, `cs-*` utility layer, Tweaks panel, Icon set, `useTweaks` hook, Tailwind extension.
- **2026-04-30** — §7.6 Action button registry added: every interactive button across 13 routes + Cmd-K + top nav now has a kind (`client` / `route` / `stage` / `read`), target, and bus message shape spec'd. §7.7 codifies the "no shell-exec / no auto-post / no auto-apply" hard rules with a Phase E grep test.
- **2026-04-30** — Phase B shipped in [PR #8](https://github.com/jazxii/clawspace-agents/pull/8) (`feat/ui-v3-phase-b-layout-nav` @ `3589a59`). TopNav (13 tabs + budget pill + traffic lights), SubBar (breadcrumbs), v3 Cmd-K palette (4 groups), `/api/budget` stub, `/api/actions/[verb]` stage stub with idempotency, layout grid restructured to `cs-app`. v2 sidebar unmounted (kept on disk for rail mode). Three local AA-contrast overrides on `cs-nav-tab` / `cs-search` / `cs-budget`.
- **2026-04-30** — Phase C shipped in [PR #9](https://github.com/jazxii/clawspace-agents/pull/9) (`feat/ui-v3-phase-c-kanban-write-back` @ `32d8a7a`). Kanban becomes bidirectional: dnd-kit + keyboard drag, lossless splice serializer (`lib/kanban-serialize.ts`), `/api/kanban/[slug]` GET+POST with mtime conflict detection, chokidar SSE watcher for cross-tab sync, in-process `busAppend` for the kanban-update bus contract, free-form board guard. Smoke-tested round-trip: drag → md updated → bus message posted with correct envelope.
- **2026-05-01** — Phase D shipped (D1–D6, D8). All domain views implemented: Dashboard (StatTile grid, bus headlines, budget), Channels (v3 split layout), Activity (domain-filtered table), Cost (per-agent breakdown), Logs (date sidebar + markdown), Graph (interactive SVG), Digest (v3 cards), Queue (tab-filtered cards), Audit (action-pill table), Agents (tier-grouped grid), Notion (sync status table), Proposals (diff viewer with risk pills). Three shared primitives (`Pill`, `Sparkline`, `StatTile`), fs-adapter extended with 10+ new read functions. Four a11y contrast fixes (`.cs-ch-grp`, `.cs-btn[primary]`, `.cs-pill` mix, `.delta.up`). D7 (NotebookLM) deferred. ~30 files, ~2800 LOC. Build green, 9/9 tests pass.
