---
name: apply-proposal
description: Apply a weekly self-evolution proposal selectively. Invoke as `/apply-proposal week-NN` or `/apply-proposal 2026-W17 --select 1,3`. Surfaces a pre-flight plan to the user, waits for confirmation, then runs the proposal-applier agent. Logs each applied diff to audit/mutations.jsonl for rollback.
---

# Apply proposal

Selectively apply diffs from a self-evolution proposal under explicit user control.

## When to use

- User says: `/apply-proposal week-17`, `apply this week's proposal`, `apply diffs 1 and 3 from week 17`.

## Inputs

- `week` (required) — ISO week (e.g., `2026-W17` or short form `week-17`).
- `--select <list>` (optional) — comma-separated diff numbers. Default: all.

## Procedure

1. Resolve the proposal path: `proposals/week-NN-improvements.md`. If absent, abort and tell the user no such proposal exists.
2. Read the proposal frontmatter. If `applied: true`, abort — already applied. (Use `/rollback-proposal` if needed.)
3. Spawn `proposal-applier` via the Agent tool in **dry-run** mode first (the agent does its pre-flight without writing). Pass `confirmed: false`.
4. Read the agent's bus message — it lists each diff with PASS/BLOCKED status and reasons.
5. Surface the plan to the user verbatim. Ask: "Apply these N diffs? (yes / no / select <new list>)"
6. If user confirms with `yes`:
   - Re-spawn `proposal-applier` with `confirmed: true` and the same `selection`.
   - Wait for its `type: "done"` bus message.
   - Surface the final summary (applied / skipped / blocked).
7. If user says `no`, do nothing further. The proposal stays `applied: false`.
8. If user provides a new `<list>`, restart at step 3 with the narrowed selection.

## Forbidden

- Never bypass the user checkpoint.
- Never call `proposal-applier` with `confirmed: true` without an explicit user `yes`.
- Never apply to a proposal where `applied: true` (the applier will refuse anyway, but we double-check here).
- Never edit the proposal file content from this skill (the applier touches frontmatter only, after success).
