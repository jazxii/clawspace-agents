# Clawspace — Personal AI Workforce

A **local-first, hierarchical multi-agent system** that manages three domains — Personal Brand Content, Dev Projects, and Research — through 33 specialized Claude agents, an append-only message bus, and a real-time Next.js dashboard.

Built to run entirely on your machine under Claude Pro 5-hour token windows. Markdown is the source of truth. Notion is a mirror. Nothing auto-posts.

---

## Architecture

```
                    ┌──────────────────┐
                    │  master-overseer │  Tier 4 — daily health, weekly evolution
                    └────────┬─────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                  ▼
   ┌───────────────┐ ┌───────────────┐ ┌────────────────┐
   │ daily-content  │ │ daily-project │ │ daily-research │  Tier 3 — supervisors
   │  supervisor    │ │  supervisor   │ │  supervisor    │
   └───────┬───────┘ └───────┬───────┘ └───────┬────────┘
           ▼                 ▼                  ▼
   ┌───────────────┐ ┌───────────────┐ ┌────────────────┐
   │content-domain │ │project-domain │ │research-domain │  Tier 2 — leads
   │     lead      │ │     lead      │ │     lead       │
   └───────┬───────┘ └───────┬───────┘ └───────┬────────┘
           ▼                 ▼                  ▼
   12 content workers  5 dev workers     6 research workers  Tier 1 — specialists
```

**33 agents** communicate via an append-only JSONL **bus** (`bus/*.jsonl`), managed by the `bus-mcp` server. Each agent reads `MEMORY.md`, posts a "started" message, does its work, and posts "done" with a summary.

## Domains

| Domain | Lead | Workers | Bus Channel |
|---|---|---|---|
| **Content** (LinkedIn / IG / X) | `content-domain-lead` | `linkedin-writer`, `instagram-writer`, `x-writer`, `hook-crafter`, `hashtag-strategist`, `image-prompt-writer`, `content-calendar-planner`, `engagement-analyzer`, `notion-publisher`, `notion-db-manager`, `humanizer`, `content-repurposer` | `bus/content.jsonl` |
| **Dev Projects** | `project-domain-lead` | `scrum-master`, `prd-keeper`, `kanban-secretary`, `dev-researcher`, `scaling-ideator` | `bus/projects.jsonl` |
| **Research** | `research-domain-lead` | `domain-researcher`, `notebooklm-bridge`, `source-curator`, `trend-spotter`, `weekly-digest-composer`, `newsletter-writer` | `bus/research.jsonl` |
| **Cross-domain** | `research-to-content-orchestrator` | — | `bus/research-to-content.jsonl` |
| **Meta** | `master-overseer` | `self-evolution-proposer`, `proposal-applier` | `bus/meta.jsonl` |

## Key Pipeline

```
/research-to-content <topic>
    → domain-researcher (Exa + Tavily + web search)
    → notebooklm-bridge (notebook creation + prompts)
    → writers (linkedin + instagram + x, parallel)
    → humanizer (applies writing signature)
    → hashtag-strategist + image-prompt-writer
    → notion-publisher (mirrors to Notion)
```

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **Claude Code CLI** ([install](https://claude.com/claude-code))
- macOS (tested), Linux (should work)

### Setup

```bash
git clone <repo-url> clawspace-agents
cd clawspace-agents
./bootstrap.sh
```

The bootstrap script will:
1. Verify `claude` CLI and Node.js 18+
2. Install UI dependencies (`cd ui && npm install`)
3. Install bus-mcp dependencies
4. Print a next-steps checklist

### Configure secrets

Edit `.claude/settings.local.json` with your API keys:

```jsonc
{
  "env": {
    "NOTION_TOKEN": "ntn_...",           // Notion integration token
    "EXA_API_KEY": "...",                // Exa semantic search
    "TAVILY_API_KEY": "tvly-...",        // Tavily research search
    "FIRECRAWL_API_KEY": "...",          // Firecrawl deep scraping (optional)
    "BRAVE_API_KEY": "...",              // Brave Search (optional)
    "PERPLEXITY_API_KEY": "...",         // Perplexity AI (optional)
    "REDDIT_CLIENT_ID": "...",           // Reddit monitoring (optional)
    "REDDIT_CLIENT_SECRET": "..."        // Reddit monitoring (optional)
  }
}
```

### Run the dashboard

```bash
cd ui
npm run dev          # → http://localhost:3001
```

Or with the agent watcher (watches bus for task messages):

```bash
npm run dev:full     # UI + agent-watcher side-by-side
```

### Run agents

```bash
claude                                # Start Claude Code
# Then use skills:
/research-to-content accessibility    # Full pipeline
/new-project my-app                   # Scaffold a dev project
/new-research-domain quantum-ml       # Scaffold a research domain
```

---

## Filesystem Layout

```
clawspace-agents/
├── .claude/
│   ├── agents/              # 33 agent definitions (YAML frontmatter + instructions)
│   ├── mcp/
│   │   ├── bus-mcp/         # Bus MCP server (append-only JSONL)
│   │   ├── web-research-mcp/# Citation-capturing web search
│   │   └── agent-watcher.mjs# Watches bus for task messages, dispatches agents
│   └── skills/              # 11 slash-command skills
├── bus/                     # Append-only JSONL channels (agent communication)
│   ├── all-hands.jsonl
│   ├── content.jsonl
│   ├── projects.jsonl
│   ├── research.jsonl
│   ├── meta.jsonl
│   └── offsets/             # Per-agent read cursors
├── kanban/                  # Markdown Kanban boards
│   ├── content-linkedin.md
│   ├── content-instagram.md
│   ├── content-x.md
│   └── projects/            # Per-project boards
├── prds/                    # Product requirement docs
│   ├── personal-brand.md
│   ├── content-linkedin.md
│   └── projects/            # Per-project PRDs
├── content/
│   ├── queue/               # Staged posts (drafting → ready → posted)
│   └── calendar/            # Monthly content calendars
├── research/
│   ├── domains/             # Per-domain: PRD, sources, notes, prompts
│   ├── weekly-digests/      # Weekly research summaries
│   └── newsletters/         # Draft → archive pipeline
├── proposals/               # Weekly self-evolution proposals
├── audit/                   # Applied proposal log (for rollback)
├── logs/daily/              # Daily reasoning logs
├── graphify-out/            # Knowledge graph outputs
├── ui/                      # Next.js 15 dashboard (see below)
├── bootstrap.sh             # One-command setup
├── CLAUDE.md                # Agent operating instructions
└── MEMORY.md                # Hot-cached pointer index
```

## Web Dashboard

The `ui/` directory contains a **Next.js 15** App Router dashboard that reads the workspace filesystem directly via React Server Components.

### Pages

| Route | Description |
|---|---|
| `/` | Dashboard — domain health, recent activity, agent counts |
| `/agents` | All 33 agents with tier/domain filtering |
| `/channels` | Sectioned channel index (Public / Team / Pipeline / DMs) |
| `/channels/[ch]` | Real-time channel view with SSE live-tail + team sidebar |
| `/kanban/[board]` | Drag-and-drop Kanban with write-back to markdown |
| `/queue` | Content queue across all platforms |
| `/notion` | 6-tab Notion sync dashboard |
| `/notebooklm` | NotebookLM domain manager with prompt tracking |
| `/logs` | Daily reasoning logs |
| `/proposals/[week]` | Diff viewer for self-evolution proposals |
| `/research/digests/[week]` | Weekly research digests |
| `/activity` | Cross-domain activity feed |
| `/cost` | Token usage tracking |
| `/graph` | Knowledge graph viewer |
| `/audit` | Mutation audit trail |

### Design System

- **CSS classes**: `cs-*` utility prefix (card, pill, btn, channel, msg, etc.)
- **5 domain accents**: content (orange `#ff9f0a`), projects (blue `#0a84ff`), research (violet `#bf5af2`), meta (green `#30d158`), system (red `#ff3b30`)
- **Dark mode default** with theme toggle (light/dark)
- **Density settings**: comfortable / compact
- **Accessibility**: WCAG 2.2 AA floor, `eslint-plugin-jsx-a11y`, Playwright + axe-core tests
- **Tweaks panel**: live theme/density/radius/font adjustments

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Theme | next-themes |
| DnD | @dnd-kit |
| Components | Radix UI primitives |
| Command palette | cmdk |
| Markdown | react-markdown + remark-gfm |
| Testing | Playwright + @axe-core/playwright |

## MCP Servers

| Server | Type | Purpose |
|---|---|---|
| `bus-mcp` | Local | Agent message bus (post, subscribe, list, dm, channels) |
| `web-research-mcp` | Local | Citation-capturing web fetch/search |
| `@notionhq/notion-mcp-server` | External | Notion API (22 tools) |
| `exa-mcp-server` | External | Semantic/neural web search |
| `tavily-mcp` | External | Research-optimized AI search |
| `firecrawl-mcp` | External | Deep scraping + JS rendering |
| `@anthropic/brave-search-mcp` | External | Privacy-first web search |
| `youtube-transcript-mcp` | External | Video transcript extraction |
| `arxiv-mcp-server` | External | Academic paper search |
| `perplexity-mcp` | External | AI research summaries |
| `reddit-mcp-server` | External | Subreddit monitoring |

## Skills (Slash Commands)

| Command | Description |
|---|---|
| `/research-to-content <topic>` | Full pipeline: research → NotebookLM → content → humanize → Notion |
| `/new-project <name>` | Scaffold PRD, Kanban, bus channel, Graphify index |
| `/new-research-domain <name>` | Scaffold research domain with PRD, sources, prompts |
| `/graphify` | Build knowledge graph from any input |
| `/kanban-move` | Move a card between Kanban columns |
| `/notion-sync` | Push content queue to Notion |
| `/notion-setup` | One-time creation of 6 Notion databases |
| `/apply-proposal week-NN` | Review + selectively apply self-evolution diffs |
| `/rollback-proposal week-NN` | Reverse applied diffs |
| `/newsletter-publish` | Move newsletter draft to archive |
| `/post-to-bus` | Append message to a bus channel |

## Self-Evolution

Every Friday, the `master-overseer` kicks off a weekly evolution cycle:

1. `weekly-digest-composer` summarizes the week's research
2. `newsletter-writer` drafts a newsletter
3. `self-evolution-proposer` analyzes what worked, what dragged, and proposes diffs
4. Proposal is staged to `proposals/week-NN-improvements.md`
5. User reviews with `/apply-proposal week-NN --select 1,3`
6. `proposal-applier` applies selected diffs, logs to `audit/mutations.jsonl`
7. Rollback available via `/rollback-proposal week-NN`

## Safety Guardrails

- **No auto-posting**: Content is staged to `content/queue/`, never published directly
- **No auto-sending**: Newsletters are staged to `research/newsletters/drafts/`
- **No auto-evolution**: Proposals require explicit `/apply-proposal` from the user
- **Audit trail**: Every applied mutation logged to `audit/mutations.jsonl` for rollback
- **Markdown is truth**: Notion is always the mirror, never the fork
- **Bus protocol**: Agents never write to bus files directly — always through `bus.post`
- **Token budget**: Daily target ≤105k tokens, agents split tasks if exceeding 30k

## Development

```bash
# Run UI in development
cd ui && npm run dev

# Build for production
cd ui && npm run build

# Run accessibility tests
cd ui && npm run test:a11y

# Lint
cd ui && npm run lint
```

## VS Code Tasks

The `.vscode/tasks.json` provides:

- **UI Dev Server** — `npm run dev` on port 3001
- **Agent Watcher** — monitors bus for task messages
- **Dev Full Stack** — both in parallel
- **Daily Sweep** — trigger daily supervisors
- **Weekly Evolution** — trigger master-overseer evolution cycle

---

**License**: Private  
**Runtime**: Claude Pro (Anthropic) with Claude Code CLI
