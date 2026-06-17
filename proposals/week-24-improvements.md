---
week: 2026-W24
window: 2026-06-09..2026-06-15
status: applied
applied: true
applied_at: 2026-06-17T09:00:00Z
applied_by: proposal-applier
applied_diffs: [1, 2, 3, 4, 5, 6, 7, 8]
skipped_diffs: []
blocked_diffs: []
generated_at: 2026-06-17T09:00:00Z
note: Follow-on to week-23. Closes the receiving end of the conversation protocol — the Tier-1 workers — so a delegation reads as a full two-sided thread. Intentionally exceeds the proposer's 7-diff soft cap; added on user request.
depends_on: week-23
---

# Self-Evolution Proposal — Week 2026-W24

Week-23 made every **orchestrator** (overseer, leads, supervisors, pipeline) delegate down-tier and open hand-offs as directed `task` messages. But the **Tier-1 workers** still close their runs with a broadcast `done` to `*` — so a delegation currently reads as "lead asks X (directed) … X announces to the whole room (broadcast)." This batch fixes the worker side: a spawned worker replies **directed to the delegator** that spawned it — accept with `status`, ask with `question`, finish with `done` — so the bus thread reads top-to-bottom as one back-and-forth, like a coworker replying to the person who asked.

## What worked

- Week-23 applied cleanly (14/14, `audit/mutations.jsonl`) and the orchestrator side now opens directed `task` hand-offs (`CLAUDE.md` conversation protocol; `content/project/research-domain-lead`, supervisors, pipeline).
- The bus tool already supports everything needed — `to:` plus the seven `type`s — so this is prompt-only, no infra change (`mcp__bus-mcp__bus_post`).

## What dragged

- **Worker replies are still broadcast monologues.** Every Tier-1 agent's Bus Protocol hardcodes `type:"done"` with no `to:` (e.g. `linkedin-writer.md`, `scrum-master.md`, `domain-researcher.md` — all identical), so the reply isn't threaded to the lead who asked.
- **Children don't know who to reply to.** The spawn brief carries `topic, persona, format, …` but not the `delegator` id, so even a willing worker can't address its reply.
- **The week-23 protocol isn't loaded in scheduled runs.** The scheduled supervisor SKILLs (`~/Documents/Claude/Scheduled/*/SKILL.md`) read `MEMORY.md` but not `CLAUDE.md`, so the conversation protocol never reaches a scheduled run. (Tracked as an operational fix outside this diff set — see "Out-of-scope".)

## Proposed diffs

### 1. Require a `delegator` field in every spawn brief

- **File**: `CLAUDE.md`
- **Type**: doc-update
- **Reversibility**: trivial

```diff
@@ ### Down-tier delegation (every run delegates its own work) @@
 When an agent's run requires work that belongs to the tier directly below it, it MUST spawn that lower-tier agent **as part of its own run** (via the `Agent` tool) rather than only logging an observation or leaving an escalation for "later". An agent delegates **only to the tier immediately below it** — Tier 4 → Tier 3, Tier 3 → Tier 2, Tier 2 → Tier 1 — never skipping a tier. The spawning agent waits for the delegate's result and folds it into its own `done`.
+
+Every spawn brief MUST include a `delegator: "<your-agent-id>"` field naming the agent doing the spawning. The delegate uses it as the `to:` on its accept / question / done replies so the exchange threads back to whoever asked. The matching slug also goes in `ref` so the whole task reads as one thread.
```

- **Rationale**: A worker can only reply directed if it's told who to reply to. One field in the brief makes every downstream reply threadable.
- **Risk**: None — additive convention; a missing `delegator` simply falls back to broadcast (diff 2 handles that).

### 2. Keystone: "Replying to your delegator" contract for spawned agents

- **File**: `CLAUDE.md`
- **Type**: doc-update
- **Reversibility**: trivial

```diff
@@ ### Conversation protocol (delegation is a dialogue, not a broadcast dump) @@
 Keep each message short and human — one ask or one update per message — so a reader can follow the thread top-to-bottom as a conversation. Broadcast (`to: "*"`) is reserved for end-of-run digests, not for the back-and-forth of getting work done.
+
+### Replying to your delegator (for any spawned agent)
+
+If you were spawned by another agent (your brief carries a `delegator`), your Bus Protocol messages are **replies**, not announcements — direct them `to:` that delegator:
+
+- **Accept** → `type: "status"`, `to: <delegator>`: one line on what you're about to do ("On it — drafting the Thu axe-core story off the 05-04 themes note.").
+- **Blocking question** → `type: "question"`, `to: <delegator>`: ask, then wait for the `answer` before proceeding.
+- **Progress** → `type: "status"`, `to: <delegator>`: only on long jobs, every ~5 actions.
+- **Done** → `type: "done"`, `to: <delegator>`, with your artifact `ref`.
+- **Error/blocker** → `type: "alert"`, `to: <delegator>` (cross-post `all-hands` only if it's red).
+
+Use broadcast (`to: "*"`) **only** when you were not spawned by another agent (a standalone/user-initiated run). This overrides the broadcast defaults still written in individual agents' "Bus Protocol" blocks.
```

- **Rationale**: One shared rule flips every Tier-1 worker from announce-to-the-room to reply-to-the-asker, and explicitly supersedes the per-agent broadcast defaults so the behavior is unambiguous.
- **Risk**: Slightly more directed traffic; the end-of-run broadcast digests from leads/supervisors still give the dashboard its at-a-glance view.

### 3–8. Update the Tier-1 worker Bus Protocol blocks (directed replies)

Each of these applies the identical pattern to the worker's three-line block. Shown once for `linkedin-writer`; diffs 4–8 are the same change in `instagram-writer.md`, `x-writer.md`, `humanizer.md`, `scrum-master.md`, and `domain-researcher.md` (substitute the agent name and its channel — `content` for the writers + humanizer, `projects` for scrum-master, `research` for domain-researcher).

- **Files**: `.claude/agents/{linkedin-writer,instagram-writer,x-writer,humanizer,scrum-master,domain-researcher}.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ## Bus Protocol  (linkedin-writer) @@
-1. On start: `bus_post(channel="content", from="linkedin-writer", type="status", body="Started: <brief task description>")`
-2. On completion: `bus_post(channel="content", from="linkedin-writer", type="done", body="<summary of work done>", ref="<output file path>")`
-3. On error: `bus_post(channel="content", from="linkedin-writer", type="alert", body="Error: <what failed>")`
+1. On accept: reply to whoever spawned you — `bus_post(channel="content", from="linkedin-writer", to="<delegator from brief>", type="status", body="On it — <one line>")`. If no `delegator` (standalone run), use `to="*"`.
+2. On a blocking question: `bus_post(channel="content", from="linkedin-writer", to="<delegator>", type="question", body="<decision needed>")`, then wait for the `answer`.
+3. On completion: `bus_post(channel="content", from="linkedin-writer", to="<delegator>", type="done", body="<summary of work done>", ref="<output file path>")` (use `to="*"` only for a standalone run).
+4. On error: `bus_post(channel="content", from="linkedin-writer", to="<delegator>", type="alert", body="Error: <what failed>")`.
```

- **Rationale**: The worker's own block is what it follows most literally; updating it (in addition to the keystone) makes the directed reply the default behavior, not an inferred one.
- **Risk**: None functional — same work, same outputs; only the bus addressing changes.

## Out-of-scope follow-ups

These are operational (not repo diffs) and are the things that actually make the conversation real in **scheduled** runs — recommend doing them alongside applying this proposal:

- **Sync the scheduled SKILLs to the updated agents + load `CLAUDE.md`.** The `~/Documents/Claude/Scheduled/*/SKILL.md` runners are standalone copies that have drifted from `.claude/agents/*.md` and don't read `CLAUDE.md`. Until they're regenerated (and step 1 of each reads `CLAUDE.md`), neither week-23 nor week-24 affects a scheduled run.
- **Guarantee Tier-1 spawnability in the scheduled runtime.** The logs repeatedly show "writer subagents not spawnable this scheduled runtime." Add a fallback to each orchestrator: if the named subagent type can't be spawned, spawn a generic agent with the contents of `.claude/agents/<name>.md` + the brief injected. Removes the silent no-dispatch.
- **Re-enable the dark schedules.** `daily-project-supervisor`, `daily-project-supervisor-eod`, `daily-content-supervisor-eod`, `daily-research-supervisor-eod` are disabled (last run 2026-05-24) — that's the cadence gap the overseer kept flagging.
- **Propagate the directed-reply block to the remaining Tier-1 workers** once 3–8 are approved: `hashtag-strategist`, `image-prompt-writer`, `hook-crafter`, `topic-scout`, `notebooklm-bridge`, `source-curator`, `trend-spotter`, `scaling-ideator`, `prd-keeper`, `dev-researcher`, `kanban-secretary`, `notion-publisher`, `notion-db-manager`, `weekly-digest-composer`, `newsletter-writer`, `engagement-analyzer`, `content-repurposer`. Same mechanical pattern as diff 3.
