---
week: 2026-W23
window: 2026-05-04..2026-06-02
status: applied
applied: true
applied_at: 2026-06-09T07:32:23Z
applied_by: proposal-applier
applied_diffs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
skipped_diffs: []
blocked_diffs: []
generated_at: 2026-06-03T09:00:00Z
note: First proposal in the repo (no prior audit/mutations). Cumulative review of the full daily-log history rather than a single Mon–Sun window — covers 14 logged days across May 4 → June 2. Diffs 7–14 (conversational down-tier delegation, propagated across every orchestrator) were added on user request and intentionally exceed the proposer's 7-diff soft cap.
---

# Self-Evolution Proposal — Week 2026-W23

Cumulative first-run review. No prior proposals exist and `audit/mutations.jsonl` is empty, so instead of a single week window this reads the entire daily-log record (`logs/daily/2026-05-04.md` → `2026-06-02.md`, 14 files) and proposes the smallest set of durable fixes for the issues that recur across many days rather than one-off blips.

## What worked

- **Tier-3 supervisor cadence held on nearly every logged day.** `daily-content-supervisor` and `daily-research-supervisor` posted morning sweeps across the whole window (`logs/daily/2026-05-04.md` through `2026-06-02.md`). The 09:00 / 09:20 backbone is autonomous and reliable.
- **The pre-publish quality gate is dependable.** The 2026-05-05 PRD gate review passed all 11 Week-1 drafts and promoted them Drafting→Ready with zero failures (`logs/daily/2026-05-05.md`, "Result: 11/11 passed").
- **Queue exhaustion self-recovered.** The 2026-05-28 zero-eligible-pool event (`logs/daily/2026-05-28.md`) was relieved overnight by `content-domain-lead` staging five fresh LinkedIn drafts dated 2026-05-29 (`logs/daily/2026-05-29.md`, "QUEUE EXHAUSTION RELIEVED").
- **NotebookLM prompt backlog drained without intervention.** 13 pending prompts (2026-05-24) fell to 3 then 0 as `notebooklm-bridge` processed them silently (`logs/daily/2026-05-25.md`, `2026-06-02.md`, "All NotebookLM prompts answered").
- **Project velocity on A11yAI.** From 0 cards / 2 blockers on 2026-05-04 (`logs/daily/2026-05-04.md`) to 10 cards in Done by 2026-05-23 (`logs/daily/2026-05-23.md`), Sprint 1 sequencing held.

## What dragged

- **HHS queue↔kanban discrepancy open 6+ consecutive days.** `content/queue/linkedin/2026-05-15-hhs-deadline-extension-honest-version.md` reads `status: ready` while its kanban card sits in Posted. First flagged 2026-05-23, still open 2026-06-02 — appears in every sweep in between (`logs/daily/2026-05-23.md` … `2026-06-02.md`). No agent reconciles a user-confirmed Posted move back to the queue file.
- **Rotation rule too aggressive for queue size.** On 2026-05-28 the "last-3-run" publish-eligibility rotation locked out all 10 ready posts at once, producing the first zero-eligible-pool exhaustion since the 05-14 reset (`logs/daily/2026-05-28.md`, "rotation rule is too aggressive for current queue size"). Self-flagged as an evolution candidate two days running.
- **Calendar absent since the 05-14 reset.** `content/calendar/2026-05.md` and `2026-06.md` never regenerated; every content sweep from 05-23 onward runs "no planned slots" (`logs/daily/2026-05-23.md` … `2026-06-02.md`). Calendar gap flagged as an open escalation "since 2026-05-15."
- **Research signal functionally stale for 9 days, escalated 4 days in a row.** The content-anchored research watermark stuck at 2026-05-23 through 06-01 even while file-mtime notes-age stayed under the 14d trigger, so no escalation fired (`logs/daily/2026-05-30.md`, `2026-05-31.md`, `2026-06-01.md`). The content supervisor re-escalated manually on four consecutive days before it resolved 06-02.
- **Subagents + bus-mcp not spawnable in scheduled runtime.** Repeated on 2026-05-29 / 05-31 / 06-01: `daily-content-pipeline` and writer subagents could not be spawned and bus-mcp tools were not exposed; supervisors fell back to ad-hoc inline runs (`logs/daily/2026-05-29.md` "Run-environment limitations", `2026-06-01.md` "Runtime note"). The behavior works but is improvised every time, not codified.
- **Frontmatter schema drift.** The five 2026-05-29 LinkedIn posts use `persona: a11y-ai-engineer` + `voice` while older posts use `persona` + `format` + `mood`; flagged as a risk that the gate may key off the older fields (`logs/daily/2026-05-29.md`).
- **Supervisor cadence miss + missing day.** `daily-project-supervisor` was absent 2026-05-27 (last seen 05-24); master-overseer flagged RED but bus-mcp was disconnected so the all-hands cross-post never delivered (`logs/daily/2026-05-27.md`). No daily log exists for 2026-05-06 (`logs/daily/2026-05-07.md` notes the missed sweep).
- **The bus is monologue, not conversation; delegation is invisible.** Every message in `bus/content.jsonl`, `bus/projects.jsonl`, and `bus/meta.jsonl` is a broadcast (`to: "*"`) one-shot `status`/`done` dump. There are no directed `task` → `status` → `done` exchanges between a delegator and a delegate, so who-asked-whom-to-do-what is never legible as a thread. Worse, the upper tiers don't actually delegate down during their own run: `master-overseer` daily-health only *reads* the supervisors' logs and stops if they're absent (`bus/meta.jsonl`, 2026-05-28 / 05-29 / 06-02 all "supervisors have not run yet"), instead of spawning them and working the problem. Work that needs doing gets "escalated" as a note for later rather than handed off in-run.

## Proposed diffs

### 1. Auto-scaffold the calendar when missing

- **File**: `.claude/agents/daily-content-supervisor.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ### Morning sweep (09:00) @@
 1. `bus_subscribe(channel="content", agent_id="daily-content-supervisor")` — see overnight activity.
-2. Identify today's calendar slots per platform (calendar may be empty post-reset; that's fine).
+2. Identify today's calendar slots per platform. If `content/calendar/<current-month>.md`
+   is **absent** (post-reset state), spawn `content-calendar-planner` via the `Agent` tool
+   for the current month, then continue without blocking the sweep on it — log the
+   regeneration and proceed with whatever slots already exist.
 3. Cross-check queue: count `status: ready` and `status: drafting` per platform.
```

- **Rationale**: The calendar has been missing for 10+ days with only a passive "that's fine" note; the planner already exists and is cheap to spawn. This closes the standing "calendar gap" escalation automatically.
- **Risk**: One extra agent spawn on the first sweep of a month / after a reset; negligible token cost, non-blocking by design.

### 2. Reconcile terminal-column moves back to the queue file

- **File**: `.claude/agents/kanban-secretary.md`
- **Type**: agent-prompt-tune
- **Reversibility**: medium

```diff
@@ 6. **Orphan scan (safety net)** @@
    - This ensures any content created by the pipeline that missed Kanban updates gets caught within 15 minutes.

+6b. **Posted-drift reconciliation (terminal-column sync)**: for each card the user has
+   moved into the `Posted` (content) or `Done` (projects) terminal column, open the
+   referenced queue file and, if its frontmatter `status:` is not already `posted`, set it
+   to `posted`. This is the ONLY case where the secretary writes a queue file, and it only
+   ever mirrors a user-confirmed terminal move — never the reverse. Log each reconciliation.
+   (Closes the recurring queue↔kanban drift, e.g. the HHS card open 6+ days since 2026-05-23.)
+
 7. Silent unless something changed. If changes happened: `bus_post(channel="all-hands", from="kanban-secretary", type="status", body="<n> moves across <k> boards")`.
```

- **Rationale**: The drift has been open every day since 2026-05-23 because nothing mirrors a user's Posted move back to the queue frontmatter. The secretary already runs every 15 min and already edits files mechanically.
- **Risk**: Grants the secretary write access to queue frontmatter (previously board-only). Scoped to a single key (`status`) and a single direction (→ `posted`), so blast radius is small; still worth a review since it crosses the board/queue boundary.

### 3. Content-anchored research-freshness trigger + conversational escalation

- **File**: `.claude/agents/daily-research-supervisor.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ### Morning sweep (09:20) @@
-6. If any domain has notes age ≥ 14d → spawn `research-domain-lead` with a refresh request for that domain only.
+6. If any domain has notes age ≥ 14d → **delegate down a tier as a dialogue**: post a
+   directed `type: "task"` to `research-domain-lead` ("notes for <domain> are <N>d stale —
+   can you refresh?"), spawn it via the `Agent` tool for that domain only, and fold its
+   `type: "done"` reply into the sweep.
+6b. **Content-anchored freshness**: compute the newest *anchor date* — the latest date in a
+    `notes/` H1 or an `ideas-feed.md` entry, not the file mtime. If that anchor date is ≥ 7d
+    old while file-mtime notes-age is still < 14d, post a directed `type: "task"` to
+    `research-domain-lead` for a `source-curator` ingestion run. This catches the
+    "functionally stale" case the content supervisor re-escalated for 4 consecutive days
+    (2026-05-23 → 2026-06-01).
-7. If any domain has pending prompts ≥ 5 → spawn `research-domain-lead` to dispatch `notebooklm-bridge`.
+7. If any domain has pending prompts ≥ 5 → post a directed `type: "task"` to
+   `research-domain-lead` ("<M> NLM prompts pending for <domain> — please dispatch
+   notebooklm-bridge") and spawn it; capture its `type: "done"` reply.
```

- **Rationale**: Two fixes in one region. (a) The mtime-only trigger missed a 9-day functional staleness because a fresh file landed without a fresh anchor date — anchoring on the dated signal catches the gap the content side kept escalating by hand. (b) All three research escalations now run as directed task→done dialogues (the conversation protocol from diff 7), so the research supervisor's hand-offs are legible on the bus instead of silent spawns.
- **Risk**: Could fire a few days earlier than the 14d trigger on slow-research domains; mitigated by gating on the < 14d mtime window so it only fills the blind spot. Conversational framing adds a couple of short directed messages per escalation.

### 4. Make the publish-rotation window scale with queue size

- **File**: `prds/content-pipeline.md`
- **Type**: prd-update
- **Reversibility**: trivial

```diff
@@ ## Selection rules (in priority order) @@
 7. **Total cap.** Maximum 4 drafts per run across all platforms (2 for `T`,
    2 for `T+1`). Quality > volume.
+8. **Adaptive publish-rotation window.** The "recently-recommended" exclusion that gates
+   ready posts from re-selection MUST scale with queue size: exclude the last
+   `max(1, floor(ready_count / 4))` recommended posts, not a fixed last-3. A fixed window
+   cycled an entire 10-post ready queue into exclusion and caused the 2026-05-28
+   zero-eligible-pool exhaustion. Hard floor: never let the exclusion window reduce the
+   eligible pool to zero while ≥ 1 unposted `status: ready` item exists.
```

- **Rationale**: The fixed last-3 rotation directly produced the only content-dark event in the window. Scaling the window to queue size and adding a zero-floor guarantee removes the failure mode without losing the anti-repetition intent.
- **Risk**: Slightly higher chance of recommending a recently-surfaced post on a small queue; bounded by `floor(ready_count/4)` so large queues still rotate widely.

### 5. Codify the inline / degraded-runtime fallback

- **File**: `.claude/agents/daily-content-pipeline.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ## Failure modes + recovery @@
 | Notion sync errors | Log to daily-runs, continue. User can re-run `notion-sync` skill later. |
 | Mix ratio extremely skewed | Allow this run to be skewed; nudge in the daily-runs "next-run" note. |
+| Writer/pipeline subagents not spawnable (scheduled runtime) | Run discovery → dedup → selection **inline** in the supervisor. If the gate yields candidates that need drafting, write a `needs-writer` flag into the daily-runs log instead of a silent no-dispatch, so the next interactive run picks them up. |
+| `bus-mcp` tools not exposed this run | Drive `bus_post`/`bus_subscribe` via the bus-mcp server's own append/offset code path; never write `bus/*.jsonl` directly. Record the degraded mode in the daily log. |
```

- **Rationale**: This exact fallback was improvised on 2026-05-29, 05-31, and 06-01. Codifying it makes the degraded run deterministic and prevents the silent no-dispatch from hiding real drafting backlog.
- **Risk**: None to normal runs (table rows only apply when the named failure occurs).

### 6. Accept both post frontmatter schemas at the gate

- **File**: `.claude/agents/daily-content-pipeline.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ### Step 6 — Wait + verify @@
 - File exists at `content/queue/<platform>/<target_date>-<slug>.md`.
-- Frontmatter has `status: ready`, `humanized: true`, `persona`,
-  `topic_lane`, `anchor`, `char_count`.
+- Frontmatter has `status: ready`, `humanized: true`, `persona`, `topic_lane`,
+  `anchor`, `char_count`. Accept **either** schema — legacy `persona` + `format` + `mood`
+  OR the newer `persona: a11y-ai-engineer` + `voice` (both live in the queue since
+  2026-05-29). The gate keys off `persona` + `humanized`, present in both.
 - The pre-publish gate from `profile.md` answers yes to all 10 questions.
```

- **Rationale**: 2026-05-29 flagged that the gate might key off fields the newer posts don't carry. Making schema acceptance explicit prevents a silent gate failure on the five already-staged posts and any future ones in the new shape.
- **Risk**: Defers the deeper question of which schema is canonical (see out-of-scope); this only guarantees the gate doesn't reject valid posts in the meantime.

### Conversational down-tier delegation (added per user request, 2026-06-03)

These three diffs intentionally push the count past the proposer's usual 7-diff soft cap because they were requested directly. They are one coherent change: make every tier delegate to the tier directly below it **as part of its own run**, and make all delegation read on the bus like two coworkers talking — delegating, accepting, updating, parking backlog, and raising issues — rather than the current broadcast monologues. Diff 7 is the keystone (governs all agents); diffs 8 and 9 retrofit the pattern at the top (overseer) and at a representative lead (content) to set the example. Propagation to the remaining leads and supervisors is listed under out-of-scope.

### 7. Keystone: down-tier delegation + bus conversation protocol

- **File**: `CLAUDE.md`
- **Type**: doc-update
- **Reversibility**: trivial

```diff
@@ ## Agent invocation pattern @@
 Every workforce agent reads `MEMORY.md`, posts a "started" message to `bus/<channel>.jsonl` via `bus.post`, does its work, posts "done" with a summary + ref to outputs, then returns. Long-running agents post progress every ~5 actions.
+
+### Down-tier delegation (every run delegates its own work)
+
+When an agent's run requires work that belongs to the tier directly below it, it MUST spawn that lower-tier agent **as part of its own run** (via the `Agent` tool) rather than only logging an observation or leaving an escalation for "later". An agent delegates **only to the tier immediately below it** — Tier 4 → Tier 3, Tier 3 → Tier 2, Tier 2 → Tier 1 — never skipping a tier. The spawning agent waits for the delegate's result and folds it into its own `done`.
+
+### Conversation protocol (delegation is a dialogue, not a broadcast dump)
+
+Delegation and coordination MUST read on the bus like two coworkers talking, not one-shot monologues. Use **directed** messages (`to: "<delegate-id>"`, not `"*"`) and the right message `type`:
+
+- **Delegating** → `type: "task"`, directed `to:` the delegate, body phrased as an actual ask ("Can you draft the Thu axe-core LinkedIn story? Anchor: the first axe-core run on an AI-generated app."). Put a short slug in `ref` so replies thread.
+- **Accepting / progress** → the delegate replies `type: "status"`, directed `to:` the delegator ("On it — pulling the 05-04 weekly-themes note, ~1 draft + carousel."). Brief progress every ~5 actions on long jobs.
+- **Clarifying** → `type: "question"` / `type: "answer"`, directed, when the delegate needs a decision before proceeding.
+- **Backlog talk** → `type: "note"`, directed, to hand off or defer an item explicitly ("Parking the IG reel to tomorrow's run — radar's thin today, flagging so it doesn't get lost.").
+- **Issue / blocker** → `type: "alert"`, directed to the delegator AND (if red) cross-posted to `all-hands`, stating the blocker and what's needed to clear it.
+- **Completion** → `type: "done"`, directed back to the delegator, with the artifact `ref`.
+
+Keep each message short and human — one ask or one update per message — so a reader can follow the thread top-to-bottom as a conversation. Broadcast (`to: "*"`) is reserved for end-of-run digests, not for the back-and-forth of getting work done.
```

- **Rationale**: One shared rule fixes both asks at the source: it makes in-run down-tier delegation mandatory and defines the directed `task`/`status`/`question`/`answer`/`note`/`alert`/`done` vocabulary every agent already has access to (the `bus_post` tool already supports `to` and all seven types — they're just unused). Because every agent prompt points at `CLAUDE.md`, this propagates system-wide.
- **Risk**: More bus messages per run (several short ones instead of one dump); bounded by "one ask/update per message" and broadcast-only digests. No behavior change until agents are next invoked.

### 8. Master-overseer delegates down to supervisors during its run

- **File**: `.claude/agents/master-overseer.md`
- **Type**: agent-prompt-tune
- **Reversibility**: medium

```diff
@@ ### Daily health (09:30 weekdays) @@
 1. Read MEMORY.md.
-2. Read today's `logs/daily/YYYY-MM-DD.md` (if absent, the supervisors haven't run yet — note that in the health post and stop).
+2. Read today's `logs/daily/YYYY-MM-DD.md`. If a Tier-3 supervisor has **not** posted today, do not just note it and stop — **delegate down a tier as part of this run**: post a directed `type: "task"` to that supervisor on `bus/meta` ("morning sweep for <date> isn't in yet — can you run it?"), spawn it via the `Agent` tool, and wait for its `done` reply before computing health. Hold the exchange as a dialogue (task → status → done), not a single broadcast. Master-overseer still spawns **only Tier-3 supervisors** (never Tier-1/2 directly), per Forbidden.
```

- **Rationale**: On 2026-05-28, 05-29, and 06-02 the overseer found no supervisor log and simply halted with "supervisors have not run yet" — the health loop became a no-op exactly when intervention was needed. Spawning the missing supervisor in-run (one tier down, as Forbidden already permits) turns a passive read into actual coordination and produces a visible task→done thread.
- **Risk**: The overseer now spends tokens spawning a supervisor on a missed-cadence day (still within the weekly-kickoff budget envelope); it must not loop if a supervisor itself errors — cap at one re-dispatch per supervisor per run.

### 9. Content-domain-lead delegates as a conversation

- **File**: `.claude/agents/content-domain-lead.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ## Operating procedure @@
-5. Spawn workers via the `Agent` tool. Run independent ones in parallel (single message, multiple tool calls).
+5. For each work item, **open the delegation on the bus before spawning**: post a directed `type: "task"` to the worker (`to: "linkedin-writer"`, etc.) phrased as a real ask, with a short slug in `ref` for threading. Then spawn the worker via the `Agent` tool (independent ones in parallel — single message, multiple tool calls). Each worker replies `type: "status"` on accept and `type: "done"` with its file `ref` when finished, directed back to `content-domain-lead`; if a worker raises a `type: "question"`, answer it (`type: "answer"`) before it proceeds. The thread on `bus/content` should read as a back-and-forth, not a single end-of-run dump.
```

- **Rationale**: The domain lead already spawns the right workers but collapses the whole exchange into one closing summary, so the delegation is invisible on the bus. Naming the directed task/reply steps makes the worker dialogue legible and sets the template the other leads copy.
- **Risk**: None functional — same workers, same outputs; only the bus narration changes. The end-of-run summary (step 10) stays as the broadcast digest.

The next five diffs propagate the same pattern across the rest of the orchestrators so the whole system is consistent: the other two domain leads (10, 11), the project and content supervisors (12, 13), and the Tier-2 content pipeline (14). The research supervisor is already covered by diff 3 above, and the overseer by diff 8.

### 10. Project-domain-lead delegates as a conversation

- **File**: `.claude/agents/project-domain-lead.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ## Operating procedure @@
-5. After workers report done, post one summary to `bus/proj-<slug>.jsonl` AND a one-line digest to `bus/projects.jsonl`.
+5. Delegate each work item as a conversation, not a silent spawn: before spawning a worker
+   (step 4), post a directed `type: "task"` to it on `bus/proj-<slug>.jsonl`
+   (`to: "scrum-master"`, `to: "dev-researcher"`, etc.) phrased as a real ask, with a card
+   id / slug in `ref` for threading. Each worker replies `type: "status"` on accept and
+   `type: "done"` with its `ref` when finished, directed back to `project-domain-lead`;
+   handle any `type: "question"` with a directed `type: "answer"` before it proceeds. After
+   workers report done, post one broadcast summary to `bus/proj-<slug>.jsonl` AND a one-line
+   digest to `bus/projects.jsonl`.
```

- **Rationale**: Same gap as the content lead — the right workers are spawned but the exchange is invisible. This makes scrum-master / dev-researcher / prd-keeper hand-offs read as a thread on the project channel.
- **Risk**: None functional. A few more short directed messages per orchestration.

### 11. Research-domain-lead delegates as a conversation

- **File**: `.claude/agents/research-domain-lead.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ## Operating procedure @@
-6. After workers report done, post one summary to `bus/research.jsonl`.
+6. Delegate each work item as a conversation: before spawning a worker (steps 4–5), post a
+   directed `type: "task"` to it on `bus/research.jsonl` (`to: "domain-researcher"`,
+   `to: "notebooklm-bridge"`, `to: "source-curator"`, etc.) phrased as a real ask, with the
+   domain slug / note path in `ref` for threading. Each worker replies `type: "status"` on
+   accept and `type: "done"` with its `ref` when finished, directed back to
+   `research-domain-lead`; answer any `type: "question"` (directed `type: "answer"`) before
+   it proceeds. After workers report done, post one broadcast summary to `bus/research.jsonl`.
+   (This is the same directed task/reply shape already used for the cross-domain content
+   handoff below.)
```

- **Rationale**: The research lead already uses a directed `task` shape for its cross-domain content hand-off (see "Cross-domain handoffs"), so extending it to its own worker dispatch is consistent and low-friction.
- **Risk**: None functional. The newsletter-after-digest ordering and parallel-worker rule are unchanged.

### 12. Daily-project-supervisor delegates down a tier as a dialogue

- **File**: `.claude/agents/daily-project-supervisor.md`
- **Type**: agent-prompt-tune
- **Reversibility**: medium

```diff
@@ ### Standup (09:15) @@
-6. If any project has blockers → spawn `project-domain-lead` for that slug ONLY (one Agent call per blocked project).
+6. If any project has blockers → **delegate down a tier as a dialogue**: post a directed
+   `type: "task"` to `project-domain-lead` on `bus/projects.jsonl` ("card-NN on <slug> is
+   blocked on <reason> — can you take it?"), then spawn it via the `Agent` tool for that slug
+   ONLY (one call per blocked project) and wait for its `type: "done"` reply before closing
+   the standup. One re-dispatch per project per run.
```

- **Rationale**: `daily-project-supervisor` was the supervisor that went dark on 2026-05-27; making its escalation an explicit in-run task→done dialogue both pushes the blocker forward and leaves a legible trail when it does run.
- **Risk**: The supervisor now waits on the lead's reply within its standup window; bounded by the one-re-dispatch-per-project rule it already carries.

### 13. Daily-content-supervisor opens its pipeline run as a task

- **File**: `.claude/agents/daily-content-supervisor.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ### Morning sweep (09:00) @@
-5. **Spawn `daily-content-pipeline`** via the `Agent` tool. Pass:
+5. **Delegate the run to `daily-content-pipeline`** — first post a directed `type: "task"`
+   to it on `bus/content` ("kick off the <today> run — mood balanced, cap 4"), then spawn it
+   via the `Agent` tool. Pass:
```

- **Rationale**: The supervisor already spawns the pipeline and waits for its `done`; naming the opening `task` makes the hand-off a visible exchange rather than an unannounced spawn. (Pairs with diff 1 on the same file, different region.)
- **Risk**: None functional — one extra directed message at the top of the sweep.

### 14. Daily-content-pipeline opens each writer hand-off as a task

- **File**: `.claude/agents/daily-content-pipeline.md`
- **Type**: agent-prompt-tune
- **Reversibility**: trivial

```diff
@@ ### Step 5 — Dispatch writers in parallel @@
-In **one** `Agent` tool message, spawn all writers in parallel. For each
-selected topic, the brief MUST include:
+Open each hand-off on the bus first: post a directed `type: "task"` to each writer
+(`to: "linkedin-writer"`, etc.) with the slug in `ref`, phrased as a real ask. Then, in
+**one** `Agent` tool message, spawn all writers in parallel. Each writer replies
+`type: "status"` on accept and `type: "done"` with its file `ref`, directed back to
+`daily-content-pipeline`. For each selected topic, the brief MUST include:
```

- **Rationale**: The pipeline is where most drafting delegation actually happens, so it's the highest-volume place to make the worker dialogue legible. Completes the chain: supervisor → pipeline → writer all read as directed exchanges. (Third region on this file, alongside diffs 5 and 6.)
- **Risk**: None functional — same parallel spawn, same outputs; adds the directed task line per writer.

## Out-of-scope follow-ups

Things that surfaced but felt too big or too gated for this loop:

- **Master-overseer self-heal for a missing Tier-3 supervisor.** `daily-project-supervisor` went dark 2026-05-27 and master-overseer could only flag it (and the alert didn't deliver). A re-dispatch-on-absence behavior would help, but it changes Tier-4 control flow and deserves a deliberate design rather than a prompt tweak.
- **bus-mcp reliability.** The server was disconnected 2026-05-27 and unexposed on several scheduled runs — root cause is infra/connection, and the fix likely touches `settings.local.json` (gated, per-machine secrets). Flagging only.
- **Canonical post frontmatter schema.** Diff 6 makes the gate tolerant; deciding whether `persona`+`voice` or `persona`+`format`+`mood` is the standard (and migrating the queue) is a `profile.md` / writer-spec change that should be made once, intentionally.
- **Writer topic/date alignment bug.** The Week-1 writers shifted topics one day and left three CRITICAL calendar gaps on 2026-05-07 (`logs/daily/2026-05-07.md`). Worth a writer-spec audit, larger than a single diff.
- **Notion mirror drift on scheduled runs.** Recurring 403 / no-outbound-network sync failures (2026-05-30) and a 2-behind mirror (2026-06-02) are an egress/infra concern, not a prompt fix.
- **Propagate the conversation protocol to the Tier-1 workers.** Diffs 7–14 cover every orchestrator (overseer, three leads, three supervisors, pipeline). The remaining step is the receiving end: the Tier-1 workers (`linkedin-writer`, `instagram-writer`, `x-writer`, `humanizer`, `scrum-master`, `dev-researcher`, `domain-researcher`, `notebooklm-bridge`, `source-curator`, `kanban-secretary`, etc.) should be tuned to *reply* in the same directed `status`/`question`/`done` shape rather than their current broadcast `done` dumps. Mechanical, but a large fan-out of small prompt edits — best done as its own batch once the orchestrator side is approved.
