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

### Down-tier delegation (every run delegates its own work)

When an agent's run requires work that belongs to the tier directly below it, it MUST spawn that lower-tier agent **as part of its own run** (via the `Agent` tool) rather than only logging an observation or leaving an escalation for "later". An agent delegates **only to the tier immediately below it** — Tier 4 → Tier 3, Tier 3 → Tier 2, Tier 2 → Tier 1 — never skipping a tier. The spawning agent waits for the delegate's result and folds it into its own `done`.

Every spawn brief MUST include a `delegator: "<your-agent-id>"` field naming the agent doing the spawning. The delegate uses it as the `to:` on its accept / question / done replies so the exchange threads back to whoever asked. The matching slug also goes in `ref` so the whole task reads as one thread.

### Conversation protocol (delegation is a dialogue, not a broadcast dump)

Delegation and coordination MUST read on the bus like two coworkers talking, not one-shot monologues. Use **directed** messages (`to: "<delegate-id>"`, not `"*"`) and the right message `type`:

- **Delegating** → `type: "task"`, directed `to:` the delegate, body phrased as an actual ask ("Can you draft the Thu axe-core LinkedIn story? Anchor: the first axe-core run on an AI-generated app."). Put a short slug in `ref` so replies thread.
- **Accepting / progress** → the delegate replies `type: "status"`, directed `to:` the delegator ("On it — pulling the 05-04 weekly-themes note, ~1 draft + carousel."). Brief progress every ~5 actions on long jobs.
- **Clarifying** → `type: "question"` / `type: "answer"`, directed, when the delegate needs a decision before proceeding.
- **Backlog talk** → `type: "note"`, directed, to hand off or defer an item explicitly ("Parking the IG reel to tomorrow's run — radar's thin today, flagging so it doesn't get lost.").
- **Issue / blocker** → `type: "alert"`, directed to the delegator AND (if red) cross-posted to `all-hands`, stating the blocker and what's needed to clear it.
- **Completion** → `type: "done"`, directed back to the delegator, with the artifact `ref`.

Keep each message short and human — one ask or one update per message — so a reader can follow the thread top-to-bottom as a conversation. Broadcast (`to: "*"`) is reserved for end-of-run digests, not for the back-and-forth of getting work done.

### Replying to your delegator (for any spawned agent)

If you were spawned by another agent (your brief carries a `delegator`), your Bus Protocol messages are **replies**, not announcements — direct them `to:` that delegator:

- **Accept** → `type: "status"`, `to: <delegator>`: one line on what you're about to do ("On it — drafting the Thu axe-core story off the 05-04 themes note.").
- **Blocking question** → `type: "question"`, `to: <delegator>`: ask, then wait for the `answer` before proceeding.
- **Progress** → `type: "status"`, `to: <delegator>`: only on long jobs, every ~5 actions.
- **Done** → `type: "done"`, `to: <delegator>`, with your artifact `ref`.
- **Error/blocker** → `type: "alert"`, `to: <delegator>` (cross-post `all-hands` only if it's red).

Use broadcast (`to: "*"`) **only** when you were not spawned by another agent (a standalone/user-initiated run). This overrides the broadcast defaults still written in individual agents' "Bus Protocol" blocks.

## Token budget

Daily target: ≤105k tokens (Mon/Fri peak ≤150k). If an agent's working set looks like it will exceed 30k tokens, it MUST split the task and delegate to subagents instead of loading more files.

## Web UI accessibility

The `ui/` Next.js app is user-facing. Any change to UI code MUST first route through `accessibility-agents:accessibility-lead`. Specialist agents to engage: `aria-specialist`, `keyboard-navigator`, `live-region-controller`, `modal-specialist`, `forms-specialist`, `contrast-master`, `tables-data-specialist`. Semantic HTML before ARIA. WCAG 2.2 AA is the floor.
