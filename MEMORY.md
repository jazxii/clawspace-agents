# Memory Index — Clawspace Workforce

Hot-cached pointer index. Always read first. Never duplicate raw content here — link out.

## Active state

- **Today's reasoning log**: `logs/daily/` (latest file)
- **This week's digest**: `logs/weekly/` (latest)
- **This week's research digest**: `research/weekly-digests/` (latest)
- **Current month's calendar**: `content/calendar/2026-05.md`
- **Open self-evolution proposals**: `proposals/` (any unapplied)
- **Notion sync state**: `.notion-sync.json` (DB IDs, gitignored)
- **Notion mirror lock**: `content/notion-mirror.lock` (gitignored, machine-local)
- **Writing signature**: `research/domains/_writing-signature/profile.md`

## PRDs

- Personal brand (master): [prds/personal-brand.md](prds/personal-brand.md)
- LinkedIn: [prds/content-linkedin.md](prds/content-linkedin.md)
- Instagram: [prds/content-instagram.md](prds/content-instagram.md)
- X: [prds/content-x.md](prds/content-x.md)
- Dev projects: `prds/projects/<slug>.md`
  - [A11yAI Accessibility Defect Automation](prds/projects/a11yai-accessibility-defect-automation.md)
- Research domains:
  - [Accessibility AI](research/domains/accessibility-ai/PRD.md)
  - Writing signature (humanizer profile): `research/domains/_writing-signature/profile.md`

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
- `bus/research-to-content.jsonl` — pipeline orchestration
- `bus/humanizer.jsonl` — humanization requests/results
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
- `/notion-setup` — one-time creation of 6 Notion databases
- `/research-to-content` — full pipeline: topic → research → NotebookLM → content → humanize → Notion
- `/newsletter-publish` — stage newsletter

## Agents (`.claude/agents/`)

**Tier 4**: `master-overseer`
**Tier 3**: `daily-content-supervisor`, `daily-project-supervisor`, `daily-research-supervisor`
**Tier 2**: `content-domain-lead`, `project-domain-lead`, `research-domain-lead`
**Tier 1 content**: `linkedin-writer`, `instagram-writer`, `x-writer`, `hook-crafter`, `hashtag-strategist`, `image-prompt-writer`, `content-calendar-planner`, `engagement-analyzer`, `notion-publisher`, `notion-db-manager`, `humanizer`, `content-repurposer`
**Tier 1 dev**: `scrum-master`, `prd-keeper`, `kanban-secretary`, `dev-researcher`, `scaling-ideator`
**Tier 1 research**: `domain-researcher`, `notebooklm-bridge`, `source-curator`, `trend-spotter`, `weekly-digest-composer`, `newsletter-writer`
**Tier 2 orchestrators**: `research-to-content-orchestrator`
**Self-evolution**: `self-evolution-proposer`, `proposal-applier`

## Web UI

- Next.js 15 v3 dashboard at [ui/](ui/) — runs on `localhost:3001` via `cd ui && npm run dev`
- Reads markdown + JSONL directly from project filesystem via React Server Components
- Design system: `cs-*` utility classes, 5 domain accents (orange/blue/violet/green/red), Tweaks panel for theme/density/radius/font
- Routes: `/` (dashboard), `/kanban/[board]` (DnD write-back), `/channels/[channel]` (SSE live-tail), `/activity`, `/cost`, `/logs`, `/graph`, `/queue`, `/audit`, `/agents`, `/notion`, `/proposals/[week]` (diff viewer), `/research/digests/[week]`
- Built against [ui/ACCESSIBILITY-BRIEF.md](ui/ACCESSIBILITY-BRIEF.md) — WCAG 2.2 AA floor
- Playwright + axe-core sweep: `cd ui && npm run test:a11y`
- Implementation plan: [UI_Version3_design+implementation.md](UI_Version3_design+implementation.md) — Phases A–D shipped, E pending

## MCP servers

- `bus-mcp` (local, in `.claude/mcp/bus-mcp/`) — `bus.post`, `bus.subscribe`, `bus.list`, `bus.dm`
- `notion` (external, `@notionhq/notion-mcp-server` v2.3.0) — 22 Notion tools, `NOTION_TOKEN` auth
- `notebooklm` (external, `notebooklm-mcp-cli`) — 35 NotebookLM tools, 3-tier fallback: MCP → CLI → manual
- `web-research-mcp` (local) — citation-capturing web fetch/search
- `exa` (external, `exa-mcp-server`) — semantic/neural web search, `EXA_API_KEY`
- `firecrawl` (external, `firecrawl-mcp`) — deep web scraping + JS-rendered pages, `FIRECRAWL_API_KEY`
- `tavily` (external, `tavily-mcp`) — research-optimized AI-ranked search, `TAVILY_API_KEY`
- `brave-search` (external, `@anthropic/brave-search-mcp`) — privacy-first web search, `BRAVE_API_KEY`
- `youtube-transcript` (external, `youtube-transcript-mcp`) — video transcript extraction, no key
- `arxiv` (external, `arxiv-mcp-server`) — academic paper search/download, no key
- `perplexity` (external, `perplexity-mcp`) — AI research summaries with citations, `PERPLEXITY_API_KEY`
- `reddit` (external, `reddit-mcp-server`) — subreddit monitoring + discussion trends, `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET`

## Notion databases (6)

DB IDs stored in `.notion-sync.json` after `/notion-setup`. Env vars in `settings.local.json`.
- Content Queue (`CLAWSPACE_NOTION_DB_CONTENT`) — mirrors `content/queue/**/*.md`
- Research Digests (`CLAWSPACE_NOTION_DB_RESEARCH`) — mirrors `research/weekly-digests/*.md`
- Content Calendar (`CLAWSPACE_NOTION_DB_CALENDAR`) — mirrors `content/calendar/*.md`
- Source Library (`CLAWSPACE_NOTION_DB_SOURCES`) — mirrors `research/domains/*/sources.md`
- Newsletter Archive (`CLAWSPACE_NOTION_DB_NEWSLETTER`) — mirrors `research/newsletters/archive/*.md`
- Ideas Board (`CLAWSPACE_NOTION_DB_IDEAS`) — mirrors `research/domains/*/ideas-feed.md`

## Pipeline

`/research-to-content <topic>` → `research-to-content-orchestrator` → domain-researcher → notebooklm-bridge → writers (parallel) → humanizer → hashtag-strategist + image-prompt-writer → notion-publisher
