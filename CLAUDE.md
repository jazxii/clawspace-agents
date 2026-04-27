# Clawspace — Personal AI Workforce

A hierarchical multi-agent system covering three domains (Personal Brand Content, Dev Projects, Research) with a master overseer and a weekly self-evolution loop. Local-first, portable, runs under Claude Pro 5h token windows.

**Read [MEMORY.md](MEMORY.md) FIRST.** It is the always-cached pointer index. Follow exactly one pointer per task.

## How to operate in this workspace

1. Identify the domain (content / dev / research / meta) from the user's request.
2. If a domain lead agent fits, delegate to it via the `Agent` tool. Never duplicate work a specialist already does.
3. All inter-agent communication goes through the **Slack-bus** (`bus/*.jsonl`). Use the `bus.post` / `bus.subscribe` tools (provided by the `bus-mcp` server) — never write to bus files directly.
4. All persistent state lives in markdown. Local md is the source of truth. Notion is a mirror, not a fork.
5. Token discipline: read `MEMORY.md` first, follow exactly one pointer, prefer Graphify queries over `grep -r`.

## Domains and tier-3 supervisors

| Domain | Lead | Daily supervisor |
|---|---|---|
| Content (LinkedIn / IG / X) | `content-domain-lead` | `daily-content-supervisor` |
| Dev projects | `project-domain-lead` | `daily-project-supervisor` |
| Research | `research-domain-lead` | `daily-research-supervisor` |

Above all three: `master-overseer` (Tier 4) — daily health, weekly self-evolution kickoff.

## Filesystem map

- `bus/*.jsonl` — Slack-like channels (append-only). Channels: `all-hands`, `content`, `projects`, `research`, `meta`, `proj-<slug>`, `dm-<a>-<b>`.
- `kanban/*.md` — boards. Columns: `Backlog | Drafting | Ready | Posted` (content) or `Backlog | In Progress | Review | Done` (projects).
- `prds/*.md` — one PRD per project/platform/research domain. Sections: Goal, Specifications, Forbidden Actions, Open Questions, Active KRs.
- `content/queue/<platform>/YYYY-MM-DD-slug.md` — staged posts. Frontmatter `status: drafting|ready|scheduled|posted`.
- `research/domains/<slug>/` — per-domain PRD, sources, daily notes, NotebookLM prompts, ideas-feed.
- `logs/daily/YYYY-MM-DD.md` — reasoning log for the day.
- `proposals/week-NN-improvements.md` — weekly self-evolution proposals (gated, propose-only).
- `audit/mutations.jsonl` — every applied proposal logged for rollback.

## Forbidden actions (hard limits)

Every agent MUST refuse to:
- Auto-post to LinkedIn / Instagram / X (stage to `content/queue/` only).
- Auto-send newsletters (stage to `research/newsletters/drafts/` only).
- Edit `~/.claude/settings.json` or any file outside this project root.
- Apply self-evolution proposals without an explicit `/apply-proposal` from the user.
- Modify `audit/mutations.jsonl` except via the `proposal-applier` agent.
- Write to `bus/*.jsonl` directly — always go through `bus.post`.

## Agent invocation pattern

Every workforce agent reads `MEMORY.md`, posts a "started" message to `bus/<channel>.jsonl` via `bus.post`, does its work, posts "done" with a summary + ref to outputs, then returns. Long-running agents post progress every ~5 actions.

## Token budget

Daily target: ≤105k tokens (Mon/Fri peak ≤150k). If an agent's working set looks like it will exceed 30k tokens, it MUST split the task and delegate to subagents instead of loading more files.

## Web UI accessibility

The `ui/` Next.js app is user-facing. Any change to UI code MUST first route through `accessibility-agents:accessibility-lead`. Specialist agents to engage: `aria-specialist`, `keyboard-navigator`, `live-region-controller`, `modal-specialist`, `forms-specialist`, `contrast-master`, `tables-data-specialist`. Semantic HTML before ARIA. WCAG 2.2 AA is the floor.
