---
name: new-research-domain
description: Scaffold a new research domain in `research/domains/<slug>/`. Creates PRD, sources.md, notebooklm-prompts.md, ideas-feed.md, and an empty notes/ directory. Use when the user says "new research domain <slug>", "add a research area", or `/new-research-domain <slug>`.
---

# New research domain

Scaffold a research domain. The research workforce will then begin pulling signal for it on the next Monday cycle.

## Inputs

- `slug` (required) — kebab-case, matches `^[a-z][a-z0-9\-]{0,40}$`
- `name` (optional) — human-readable name (defaults to titleized slug)
- `notebook_id` (optional) — NotebookLM notebook id to associate with this domain

## Procedure

1. Validate slug. Refuse on collision (`research/domains/<slug>/PRD.md` exists).
2. Create directory: `research/domains/<slug>/notes/`.
3. Write `research/domains/<slug>/PRD.md`:

```markdown
# Research Domain — <name>

## Goal
One paragraph: why we're tracking this domain, what success looks like.

## Scope
- In scope: ...
- Out of scope: ...

## Key questions (the Open Threads we're chasing)
- ...

## Sources of record
See `sources.md`.

## NotebookLM
- notebook_id: <id or "TBD — set once notebook created in NotebookLM">

## Forbidden actions
- Never include items in notes without a URL citation.
- Never auto-promote findings to content/dev — surface via bus.
- Never delete items from `ideas-feed.md` (only mark `[promoted YYYY-MM-DD]`).

## Active KRs (this week)
- [ ] Initial sources curated
- [ ] First domain-researcher run completes
- [ ] First NotebookLM prompt staged
```

4. Write `research/domains/<slug>/sources.md`:

```markdown
# Sources — <name>

Curator: source-curator (weekly).

## Tier 1 (always check)
<!-- format: - [Source name](url) — type: rss|blog|paper-feed|podcast|person, last-cited: YYYY-MM-DD, signal: high -->

## Tier 2 (occasional)

## Tier 3 (probational)

## Archived (don't fetch)
```

5. Write `research/domains/<slug>/notebooklm-prompts.md`:

```markdown
# NotebookLM prompts — <name>

One question per line. notebooklm-bridge picks the top N unanswered, queries the notebook, and appends `  [answered YYYY-MM-DD]` after the line on success.

<!-- example:
What does the latest WCAG 2.2 guidance say about focus appearance? [answered 2026-04-30]
-->
```

6. Write `research/domains/<slug>/ideas-feed.md`:

```markdown
# Ideas feed — <name>

Bullets surface here when domain-researcher or trend-spotter spots a project-worthy idea. Promote to a dev project via `/new-project --from-research <slug>`.

<!-- format: - YYYY-MM-DD: <title>. Rationale: ... Refs: <note paths>. [promoted YYYY-MM-DD] -->
```

7. Bus seed:

```
bus_post(channel="research", from="user", type="status",
  body="New research domain: <name> (<slug>)",
  ref="research/domains/<slug>/PRD.md")
```

8. Update `MEMORY.md` — add `- [<name>](research/domains/<slug>/PRD.md)` under "PRDs > Research domains".
9. Tell the user the next step: "Edit `PRD.md`, then add Tier 1 sources to `sources.md`. The next Monday domain-researcher run will pick up the domain."

## Forbidden

- Never create files outside `research/domains/<slug>/`.
- Never overwrite an existing domain. Abort on collision.
- Never auto-populate Tier 1 sources — the user picks the seed list.
