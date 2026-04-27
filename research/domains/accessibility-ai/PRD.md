# Research Domain — Accessibility AI

## Goal

Build durable, citable understanding of how AI is being applied to web/mobile/document accessibility — both as accessibility tooling (screen readers, alt-text generators, audit automation) and as accessibility risk (LLM-generated UI that violates WCAG). Outputs feed the user's content (LinkedIn / Instagram / X) and dev project ideation.

## Scope

**In scope**
- LLM-generated alt text quality and evaluation
- AI-driven a11y audit / linting / scanner advances (axe-core, Pa11y, accessibility-insights, IBM Equal Access, etc.)
- WCAG 2.2 + emerging WCAG 3.0 in light of AI-generated content
- Screen reader UX research, NVDA/JAWS/VoiceOver behavior changes
- AI-built UIs (v0, Bolt, Lovable, Claude Artifacts, etc.) and the a11y debt they create
- COGA / cognitive accessibility intersected with LLM affordances
- ARIA evolution + new patterns (popover API, dialog element, etc.)
- Tooling that bridges design tokens → accessibility (Style Dictionary contrast checks, focus-ring tokens)

**Out of scope**
- General LLM benchmark news without an a11y angle
- Vendor product launches with no published a11y data
- Court rulings unless they cite WCAG directly

## Key questions (Open Threads we're chasing)

- How well do current frontier LLMs generate alt text vs. human raters?
- Which automated scanners are gaining ground vs. axe-core for AI-generated UI?
- What WCAG criteria are most often violated by AI-built apps?
- Are there reproducible patterns where AI improves screen reader UX?

## Sources of record

See `sources.md`.

## NotebookLM

- notebook_id: TBD — set once notebook created in NotebookLM and the auth is wired

## Forbidden actions

- Never include items in notes without a URL citation.
- Never auto-promote findings to content/dev — surface via bus.
- Never delete items from `ideas-feed.md` (only mark `[promoted YYYY-MM-DD]`).
- Never cite items from primary-sources behind a paywall without a publicly readable abstract or mirror.

## Active KRs (this week)

- [ ] Tier 1 sources curated to ≥ 8 entries
- [ ] First domain-researcher run completes
- [ ] First NotebookLM prompt staged
- [ ] First content prompt promoted to `bus/content.jsonl`
