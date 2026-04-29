# Memory Index — Clawspace Workforce

Hot-cached pointer index. Always read first. Never duplicate raw content here — link out.

## Active state

- **Today's reasoning log**: `logs/daily/` (latest file)
- **This week's digest**: `logs/weekly/` (latest)
- **This week's research digest**: `research/weekly-digests/` (latest)
- **Current month's calendar**: `content/calendar/2026-04.md`
- **Open self-evolution proposals**: `proposals/` (any unapplied)
- **Notion sync state**: `content/notion-mirror.lock` (gitignored, machine-local)

## PRDs

- Personal brand (master): [prds/personal-brand.md](prds/personal-brand.md)
- LinkedIn: [prds/content-linkedin.md](prds/content-linkedin.md)
- Instagram: [prds/content-instagram.md](prds/content-instagram.md)
- X: [prds/content-x.md](prds/content-x.md)
- Dev projects: `prds/projects/<slug>.md`
  - [A11yAI Accessibility Defect Automation](prds/projects/a11yai-accessibility-defect-automation.md)
- Research domains:
  - [Accessibility AI](research/domains/accessibility-ai/PRD.md)

## Kanbans

- Content LinkedIn: [kanban/content-linkedin.md](kanban/content-linkedin.md)
- Content Instagram: [kanban/content-instagram.md](kanban/content-instagram.md)
- Content X: [kanban/content-x.md](kanban/content-x.md)
- Per-project: `kanban/projects/<slug>.md`

## Bus channels

- `bus/all-hands.jsonl` — cross-domain announcements
- `bus/content.jsonl` — content domain traffic
- `bus/projects.jsonl` — dev domain traffic
- `bus/research.jsonl` — research domain traffic
- `bus/meta.jsonl` — master-overseer + self-evolution
- `bus/proj-<slug>.jsonl` — per-project channels (created on demand)

## Skills (in-project)

- `/graphify` — knowledge graph from any input
- `/new-project` — scaffold a dev project
- `/new-research-domain` — scaffold a research domain
- `/apply-proposal` — review + apply weekly self-evolution diffs
- `/rollback-proposal` — reverse applied diffs from a week's proposal
- `/kanban-move` — move a card between columns
- `/post-to-bus` — append to a bus channel
- `/notion-sync` — push content queue to Notion
- `/newsletter-publish` — stage newsletter

## Agents (`.claude/agents/`)

**Tier 4**: `master-overseer`
**Tier 3**: `daily-content-supervisor`, `daily-project-supervisor`, `daily-research-supervisor`
**Tier 2**: `content-domain-lead`, `project-domain-lead`, `research-domain-lead`
**Tier 1 content**: `linkedin-writer`, `instagram-writer`, `x-writer`, `hook-crafter`, `hashtag-strategist`, `image-prompt-writer`, `content-calendar-planner`, `engagement-analyzer`, `notion-publisher`
**Tier 1 dev**: `scrum-master`, `prd-keeper`, `kanban-secretary`, `dev-researcher`, `scaling-ideator`
**Tier 1 research**: `domain-researcher`, `notebooklm-bridge`, `source-curator`, `trend-spotter`, `weekly-digest-composer`, `newsletter-writer`
**Self-evolution**: `self-evolution-proposer`, `proposal-applier`

## Web UI

- Next.js 15 dashboard at [ui/](ui/) — runs on `localhost:3001` via `cd ui && npm run dev`
- Reads markdown + JSONL directly from project filesystem via React Server Components
- Routes: `/` (dashboard), `/kanban/[board]`, `/channels/[channel]`, `/proposals/[week]`, `/research/digests/[week]`
- Built against [ui/ACCESSIBILITY-BRIEF.md](ui/ACCESSIBILITY-BRIEF.md) — WCAG 2.2 AA floor
- Playwright + axe-core sweep: `cd ui && npm run test:a11y`

## MCP servers

- `bus-mcp` (local, in `.claude/mcp/bus-mcp/`) — `bus.post`, `bus.subscribe`, `bus.list`, `bus.dm`
- `notion-mcp` (external) — Notion DB read/write
- `notebooklm-mcp-server` (external) — NotebookLM queries
- `web-research-mcp` (local) — citation-capturing web fetch/search
