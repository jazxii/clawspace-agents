# Clawspace UI v3 — Design + Implementation Plan

**Status:** In progress · drafted 2026-04-30
**Owner:** jassimmohammed2910@gmail.com
**Branch strategy:** one PR per phase, off `main`

## Phase progress

| Phase | Status | Branch | PR |
|---|---|---|---|
| A — Design system swap | ✅ **Shipped** 2026-04-30 | `feat/ui-v3-phase-a-design-system` | [#7](https://github.com/jazxii/clawspace-agents/pull/7) |
| B — Layout + nav + Cmd-K | ✅ **Shipped** 2026-04-30 | `feat/ui-v3-phase-b-layout-nav` | [#8](https://github.com/jazxii/clawspace-agents/pull/8) |
| C — Kanban v3 + md write-back | ⏳ Pending | `feat/ui-v3-phase-c-kanban-write-back` | — |
| D1 — Dashboard | ⏳ Pending | `feat/ui-v3-d1-dashboard` | — |
| D2 — Channels live-tail | ⏳ Pending | `feat/ui-v3-d2-channels-live-tail` | — |
| D3 — Activity + Cost | ⏳ Pending | `feat/ui-v3-d3-activity-cost` | — |
| D4 — Logs + Graph + Digest | ⏳ Pending | `feat/ui-v3-d4-logs-graph-digest` | — |
| D5 — Queue + Audit + Agents | ⏳ Pending | `feat/ui-v3-d5-queue-audit-agents` | — |
| D6 — Notion sync | ⏳ Pending | `feat/ui-v3-d6-notion-sync` | — |
| D7 — NotebookLM sync | ⏳ Pending | `feat/ui-v3-d7-notebooklm-sync` | — |
| D8 — Proposals diff viewer | ⏳ Pending | `feat/ui-v3-d8-proposals-diff-viewer` | — |
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
│   ├── _components/    Sidebar, CommandPalette, ShortcutsOverlay, Breadcrumbs, RouteAnnouncer, UserMenu, Providers, StatusBadge
│   ├── api/            (existing API routes)
│   ├── channels/       SSE-multiplexed bus channel viewer
│   ├── kanban/         INDEX-ONLY (page.tsx) + dynamic [board] route
│   ├── proposals/      diff viewer
│   ├── research/       digests
│   ├── globals.css     219 lines (slate palette, brand=blue-600)
│   ├── tokens.css      169 lines (single-accent, light+dark, density)
│   ├── layout.tsx      sidebar + main grid
│   └── page.tsx        dashboard (4-card snapshot)
├── lib/
│   ├── fs-adapter.ts   READ-ONLY md/jsonl reader (no writes)
│   ├── live-announce.ts
│   ├── use-density.tsx, use-mode.tsx, use-shortcuts.tsx
└── package.json        next 15, react 18, radix-dialog/checkbox, cmdk, gray-matter, next-themes, chokidar
```

**Gaps vs design:**
- Single-accent palette → needs five domain accents.
- Sidebar nav → needs top-nav tabs + breadcrumb subbar + traffic-light glyph + budget pill.
- No Tweaks panel.
- Kanban is read-only links → needs full board UI with DnD + keyboard + write-back.
- No views for Activity, Cost, Daily-log, Graph, Digest, Audit, Queue, Notion-sync, Agents-registry.
- No Notion sync controls. No NotebookLM controls.
- `fs-adapter` cannot write.

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

## 4. Phase C — Kanban v3 (vibeyard-inspired) with md write-back

**Goal:** Replace the read-only kanban index with a full per-board UI: drag-drop, keyboard ←/→, inline edit, add/delete card, and **bidirectional sync** to `kanban/**.md`.

**Branch:** `feat/ui-v3-phase-c-kanban-write-back`

**Reference:** `https://github.com/elirantutia/vibeyard` — uses `@dnd-kit/core` + `@dnd-kit/sortable`, column virtualization optional, drag handle on card, "+ Add card" inline. We adopt that pattern.

**Md file shape (existing):**
```markdown
# Kanban — clawspace-ui

<!-- counts: backlog=3 drafting=3 review=2 ready=2 done=2 -->

## Backlog

- [card-k1] Mobile breakpoint pass — channels view — owner: clawspace-ui · tags: mobile,a11y · priority: med · age: 2d
  - Acceptance: 320px reflow, no horizontal scroll
  - Acceptance: focus trap on channel filter

## Drafting
…
```

**Files to add/modify:**

| File | Action |
|---|---|
| `ui/lib/fs-adapter.ts` | **EXTEND** — add `writeKanbanBoard(slug, kind, board)`, `moveKanbanCard(slug, kind, cardId, toColumn, toIndex)`, `addKanbanCard(...)`, `editKanbanCard(...)`, `deleteKanbanCard(...)`. All writes: re-parse → splice → serialize → atomic write (`fs.writeFile` to `.tmp` then `rename`). Update `<!-- counts: ... -->` line on every write. |
| `ui/lib/kanban-serialize.ts` | **NEW** — pure function: `KanbanBoard → markdown string`. Round-trip safe with `parseKanbanMarkdown` (already exists). |
| `ui/app/api/kanban/[slug]/route.ts` | **NEW** — `GET` returns board JSON, `POST` accepts mutation: `{ op: "move" \| "add" \| "edit" \| "delete", ... }`. Server validates → calls fs-adapter → posts to `bus/proj-<slug>.jsonl` via `bus.post` with `kanban-secretary` author convention. Returns updated board. |
| `ui/app/api/kanban/[slug]/stream/route.ts` | **NEW** — SSE stream: chokidar-watches `kanban/projects/<slug>.md`, emits `data: {type:"updated"}` on change. Cross-tab sync. |
| `ui/app/kanban/[board]/page.tsx` | **REPLACE** — server component fetches board via `readKanbanBoard`. Hands off to client component. |
| `ui/app/kanban/[board]/_KanbanBoardClient.tsx` | **NEW** — `@dnd-kit` setup. Uses `useOptimistic` for instant move. Calls `/api/kanban/<slug>` on drop. Subscribes to `/api/kanban/<slug>/stream` for cross-tab. Inline editable card title (double-click → `<input>`, Enter saves, Esc cancels). "+ Add card" footer button per column. Right-click → menu (Delete, Edit metadata, Copy ID). Keyboard: Tab to focus, ←/→ to move column, ↑/↓ to reorder, Enter to edit, Backspace to delete (with confirm). |
| `ui/app/kanban/page.tsx` | Add per-board summary card grid (counts per column, last-modified). Click → `/kanban/<slug>`. |
| `ui/package.json` | `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` |

**Concurrency:**
- Optimistic UI on drag; if server write fails (e.g., file changed under us), revert + toast via `live-announce`.
- Conflict detection: store `mtime` on read; compare on write; if drift → re-read, re-apply, re-emit.

**Bus integration:**
- Every successful mutation posts: `{type:"kanban-update", from:"web-ui", body:"Card 'X' moved Backlog→Drafting", ref:"kanban/projects/<slug>.md#card-id"}`. Matches existing `kanban-secretary` contract so the daily supervisors see UI moves.

**Acceptance:**
- Open `/kanban/clawspace-ui`. Drag card → md file updates within 100ms. Edit `kanban/projects/clawspace-ui.md` in editor → UI reflects in <1s via SSE.
- Keyboard-only flow: tab to a card, ←/→ moves column, ↑/↓ reorders, Enter inline-edits.
- Two browser tabs stay in sync.
- Counts header rewrites correctly: `<!-- counts: backlog=N ... -->`.
- Bus channel `proj-<slug>` receives one message per mutation.

**Estimated diff:** ~1500 LOC additive.

---

## 5. Phase D — Domain views (per-route)

**Goal:** Build out the remaining 11 views to match the design. Sub-phases shippable independently.

**Branches (sub-PRs):**
- `feat/ui-v3-d1-dashboard`
- `feat/ui-v3-d2-channels-live-tail`
- `feat/ui-v3-d3-activity-cost`
- `feat/ui-v3-d4-logs-graph-digest`
- `feat/ui-v3-d5-queue-audit-agents`
- `feat/ui-v3-d6-notion-sync`
- `feat/ui-v3-d7-notebooklm-sync`
- `feat/ui-v3-d8-proposals-diff-viewer`

### D1 — Dashboard rewrite
- Replace `app/page.tsx` with the design dashboard (StatTile grid + standup card + bus headlines + schedule + budget panel + weekly proposal + Notion sync card + research seed).
- All widgets read live data from `fs-adapter` (no mocks). Sparkline data: hourly token rollup from audit log.
- Click-throughs to all 13 routes via `route-meta.ts`.

### D2 — Channels with live-tail SSE
- Migrate `app/channels/[ch]/page.tsx` to the design's split layout: channel list (left, 220px) + message stream (right) + composer.
- Live-tail uses existing SSE multiplexer. Composer **stages to bus** via `POST /api/bus/<channel>` (this already exists; verify forbidden-action gating: web composer can post to `bus/<channel>` only, NOT to `bus/all-hands` directly without a confirmation modal).
- Day grouping, agent-tag pill, ref attachments rendered as code chip.

### D3 — Activity timeline + Cost view
- `/activity`: filter pill (all/content/projects/research/meta) + table (time, agent, domain, note, duration, tokens, status). Source: parse `bus/*.jsonl` for `from:` + `audit/mutations.jsonl` for cost rollup.
- `/cost`: 4 stat tiles per domain + per-agent breakdown bar chart. Source: token estimates from a new `lib/cost-estimator.ts` (model rates × token deltas).

### D4 — Logs + Graph + Digest
- `/logs`: date picker + sidebar of recent days + markdown render (`react-markdown` + `remark-gfm`). Reads `logs/daily/YYYY-MM-DD.md`.
- `/graph`: SVG render of Graphify nodes/edges. Source: `graphify-out/*.json` if present; fallback to a synthetic dataset matching the design's node set.
- `/digest`: latest weekly digest md + sources sidebar. Reads `research/weekly-digests/*.md`.

### D5 — Queue + Audit + Agents
- `/queue`: tab strip (all/li/ig/x/newsletter) + card grid. Reads `content/queue/<platform>/*.md` frontmatter.
- `/audit`: table of `audit/mutations.jsonl` entries. Filter by actor, action (apply/rollback), file glob.
- `/agents`: tier-grouped grid (T4 → T1). Reads `.claude/agents/*.md` frontmatter for description + model.

### D6 — Notion sync UI
- `/notion`: table of `NOTION_PAGES`-shaped data. Read sources:
  - `content/queue/**/*.md` frontmatter (local truth)
  - `notion-publisher` last-sync log file at `bus/content.jsonl` (parsed for `type:"sync"` entries)
  - Conflict markers: `notion-publisher` posts a bus message of `type:"conflict"` when remote diverged
- "Sync now" button: `POST /api/agents/run` with body `{agent:"notion-publisher", mode:"stage"}`. The route **does not exec the agent** — it appends a message to `bus/all-hands.jsonl` of `type:"trigger"` so the scheduled-task or watcher picks it up. (Per user's chosen option in plan: "stage requests to the bus and let scheduled tasks pick them up".)
- Per-row "Resolve conflict" → opens a side drawer with local md vs Notion last-pulled snapshot diff. User picks which side wins → writes resolution back to bus as `type:"resolve-conflict"` for `notion-publisher` to act on.

### D7 — NotebookLM sync UI
- `/research/notebooklm`: per-domain accordion. Each domain shows `notebooklm-prompts.md` queued prompts + responses pulled from `research/domains/<slug>/notes/*.md`.
- "Run prompt" button: stages to `bus/research.jsonl` as `{type:"notebooklm-run", prompt:"...", domain:"..."}`. The `notebooklm-bridge` agent (already exists) consumes these via its scheduled hook.
- Inline response viewer (markdown) once `notebooklm-bridge` writes back.
- Source-cited badges per response.

### D8 — Proposals diff viewer
- Replace `/proposals/page.tsx` with the design's two-pane: list of diffs (sidebar) + main diff viewer with hunks (add/del/ctx lines) + Approve/Reject/Skip buttons + "Plan-mode preview" that calls `/api/proposals/[week]/preview` (dry-run).
- Apply button: stages a `bus/meta.jsonl` request for `proposal-applier` agent (NEVER auto-applies — the user must run `/apply-proposal week-NN` from Claude Code).

**Acceptance per sub-phase:**
- View renders pixel-close to design at 1280px, 1024px, 720px, 375px breakpoints.
- All data is real (no mocks left in production).
- All buttons that "do" something stage to bus, never shell-exec.

**Estimated diff:** ~3500 LOC across 8 sub-PRs.

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
