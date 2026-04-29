# Clawspace UI v3 — Design + Implementation Plan

**Status:** In progress · drafted 2026-04-30
**Owner:** jassimmohammed2910@gmail.com
**Branch strategy:** one PR per phase, off `main`

## Phase progress

| Phase | Status | Branch | PR |
|---|---|---|---|
| A — Design system swap | ✅ **Shipped** 2026-04-30 | `feat/ui-v3-phase-a-design-system` | [#7](https://github.com/jazxii/clawspace-agents/pull/7) |
| B — Layout + nav + Cmd-K | ⏳ Pending | `feat/ui-v3-phase-b-layout-nav` | — |
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

## 3. Phase B — Layout + nav + Cmd-K

**Goal:** Replace sidebar layout with the design's top-nav tabs + breadcrumb subbar + traffic lights + budget pill + avatar. Migrate Cmd-K palette.

**Branch:** `feat/ui-v3-phase-b-layout-nav`

**Files to add/modify:**

| File | Action |
|---|---|
| `ui/app/_components/TopNav.tsx` | **NEW** — port `shell.jsx::TopNav`. Routes from a static `ROUTES` const (13 routes). Tabs reflect `usePathname()` for active state. Badges read from a server-fetched count map. Mobile (<720px): horizontal scroll. |
| `ui/app/_components/SubBar.tsx` | **NEW** — port `shell.jsx::SubBar`. Crumbs derived from pathname; per-page actions slot via `<Slot/>` pattern. |
| `ui/app/_components/CommandPalette.tsx` | **REPLACE** with the design palette (grouped, fuzzy filter, ⌘K, ESC, ↑↓, ⏎). Items: Navigate (13 routes), Agents (8 quick-runs → bus stage), Actions (apply-proposal, sync-notion, compose-newsletter), Settings (toggle theme, open Tweaks). |
| `ui/app/_components/Sidebar.tsx` | **DELETE** (or keep as `[data-sidebar="rail"]` collapse — see design's `[data-sidebar="rail"] .cs-rail-full { display: none }` rule). |
| `ui/app/layout.tsx` | Restructure: `cs-app` grid (`auto auto 1fr`) → `<TopNav/> <SubBar/> <main className="cs-page">…</main>`. Keep skip link, live regions, RouteAnnouncer. |
| `ui/lib/route-meta.ts` | **NEW** — single source of route id → name → icon → domain → href. Used by TopNav, SubBar, CommandPalette, dashboard "stat tile click-throughs". |
| `ui/app/api/budget/route.ts` | **NEW** — `GET` returns 5h rolling token estimate (parse `audit/mutations.jsonl` + scheduled-task logs); used by budget pill. Stub returning a fixed value is fine for MVP. |

**Acceptance:**
- All 13 routes show in nav (some routes will be 404 until later phases — that's fine; nav still renders).
- ⌘K opens palette with grouped items; ESC closes; ↑↓⏎ work; click-outside dismisses.
- Mobile: nav scrolls horizontally, search collapses to icon, budget pill hides.
- `aria-current="page"` on active tab; `<nav role="tablist">` removed in favor of `<nav>` + `<a>` (it's nav, not tabs — design conflated them).
- Skip link still focusable; route announcer still fires.

**Estimated diff:** ~700 LOC additive, ~250 LOC removed (sidebar code).

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
