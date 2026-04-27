---
name: rollback-proposal
description: Rollback a previously applied self-evolution proposal by reversing each diff in audit/mutations.jsonl in last-applied-first order. Invoke as `/rollback-proposal week-NN` or `/rollback-proposal --diff <n>` to revert a single diff. Surfaces a pre-flight plan before any write, requires user confirmation.
---

# Rollback proposal

Reverse a previously applied proposal — selectively or in full — using the audit log.

## When to use

- User says: `/rollback-proposal week-17`, `revert week 17 changes`, `undo diff 3 from week 17`.
- Something has clearly regressed since an apply, and you want to bisect.

## Inputs

- `week` (required) — ISO week of the proposal to roll back.
- `--diff <n>` (optional) — single diff number to revert. Default: all applied diffs from that week, in last-applied-first order.

## Procedure

1. Read `audit/mutations.jsonl`. Filter to entries where `week == <week>`. If no entries, abort — nothing to roll back for that week.
2. Read `proposals/week-NN-improvements.md`. Verify `applied: true`.
3. For each audit entry in scope, in **reverse-chronological order**:
   - Look up the proposal's diff by `diff_n`.
   - Construct the inverse hunk (swap `-` and `+` lines).
   - Verify `git apply --check` passes. If line drift has occurred since apply (a later edit touched the same lines), mark as `BLOCKED — manual intervention required`.
   - Verify the file's current SHA-256 matches `sha_after` from the audit entry. If not, the file has been modified since — mark as `DRIFT — manual review`.
4. Surface plan to the user:

```
Rollback plan for week YYYY-WNN:
1. <title> (file: <path>) — REVERTABLE
2. <title> (file: <path>) — DRIFT (file modified since apply)
3. <title> (file: <path>) — BLOCKED (line drift)
Proceed with the N revertable items? (yes / no / select <list>)
```

5. On `yes`:
   - Apply the inverse hunks one-by-one.
   - Append a NEW audit entry per rollback (don't mutate existing entries):

```json
{"ts":"<ISO>","week":"YYYY-WNN","diff_n":N,"action":"rollback","file":"<path>","sha_before":"...","sha_after":"...","applied_by":"rollback-proposal"}
```

6. Update the proposal frontmatter — add `rolled_back_at`, set `applied: false` IF every applied diff was reverted; otherwise add `partially_rolled_back_diffs: [...]`.
7. Post: `bus_post(channel="meta", from="rollback-proposal", type="done", body="Rolled back <a> of <n> diffs from week YYYY-WNN. Drift/blocked: <count>", ref="audit/mutations.jsonl")`.

## Forbidden

- Never edit existing entries in `audit/mutations.jsonl`. Only append new rollback entries.
- Never roll back a diff whose file SHA has drifted without explicit user override (`--force`, which the user must type).
- Never roll back gated paths (matches the same gated list as `proposal-applier`).
- Never proceed past the user-confirmation step without a `yes`.
