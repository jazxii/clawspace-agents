# Audit log

`mutations.jsonl` is the append-only ledger of every self-evolution change applied via `/apply-proposal`, plus every reversal via `/rollback-proposal`. Format: one JSON object per line.

## Apply entry

```json
{"ts":"2026-04-30T17:42:00Z","week":"2026-W17","diff_n":1,"title":"Tighten linkedin-writer voice rule on hooks","file":".claude/agents/linkedin-writer.md","type":"agent-prompt-tune","sha_before":"abc...","sha_after":"def...","applied_by":"proposal-applier","reversibility":"trivial"}
```

## Rollback entry

```json
{"ts":"2026-05-02T10:15:00Z","week":"2026-W17","diff_n":1,"action":"rollback","file":".claude/agents/linkedin-writer.md","sha_before":"def...","sha_after":"abc...","applied_by":"rollback-proposal"}
```

## Hard rules

- The file `mutations.jsonl` is **gitignored** (machine-local). Each machine maintains its own audit. This is intentional: rollback uses local file SHAs, not remote git history.
- Only `proposal-applier` and `rollback-proposal` write to it. Manual edits void the rollback contract.
- Existing lines are never mutated. Rollbacks are new entries with `action: "rollback"`.

This README itself is committed; `mutations.jsonl` is not.
