# PRD — <project-name>

Template. Copy to `prds/projects/<slug>.md` and fill in. The `/new-project` skill (Phase 3) does this automatically.

## Goal

One paragraph: what this project is, who benefits, why now.

## Specifications (success criteria)

Concrete, measurable. Examples:
- v1 ships behind a feature flag with X endpoint behavior
- p95 latency under N ms
- README + example notebook published
- 3 external users complete the onboarding flow without help

## Forbidden actions

Hard constraints the workforce must never violate. Examples:
- Never push to `main` without a passing CI check
- Never modify the database schema without an explicit migration PR
- Never commit secrets or example credentials
- Never auto-merge dependabot PRs touching auth or crypto code

## Open questions

Things needing the user's call before we proceed.

## Active KRs (this week)

- [ ] ...

## Kanban

`kanban/projects/<slug>.md` — managed by `kanban-secretary`, updated by `scrum-master`.

## Bus channel

`bus/proj-<slug>.jsonl` — created on first post.

## Graphify index

`graphify-indexes/<slug>/` — re-indexed weekly by `dev-researcher` or on-demand.
