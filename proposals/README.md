# Self-evolution proposals

`self-evolution-proposer` writes one file here per ISO week:

```
proposals/week-NN-improvements.md
```

Each file contains:
- **What worked** — bullets pointing at concrete artifacts from the week
- **What dragged** — bullets with evidence (cadence misses, stale drafts, etc.)
- **Proposed diffs** — 3–7 unified-diff hunks, each with rationale, risk, reversibility
- **Out-of-scope follow-ups** — gated changes the proposer wants to flag

Proposals are **propose-only**. They do nothing until the user runs:

```
/apply-proposal week-NN
```

This invokes the `apply-proposal` skill, which:
1. Spawns `proposal-applier` in dry-run mode (pre-flight only).
2. Surfaces the plan with PASS/BLOCKED status per diff.
3. Waits for explicit user `yes` (or `select <list>`).
4. Re-spawns `proposal-applier` with `confirmed: true`.
5. Applies diffs sequentially, logging each to `audit/mutations.jsonl`.
6. Updates the proposal frontmatter (`applied: true`).

To revert:

```
/rollback-proposal week-NN
```

Reverses each applied diff in last-applied-first order using the audit log's SHA-256 fingerprints. Drift detection is automatic — if a file changed since apply, the user is asked before forcing.

Proposals are committed to git (gitignore covers `audit/mutations.jsonl` only). The proposal history is part of the workforce's memory.
