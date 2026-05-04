# PRD — A11yAI: Accessibility Defect Automation

## Goal

A11yAI is a developer-facing CLI and CI tool that detects, categorizes, and reports accessibility defects in web UI codebases — with an AI critique layer that goes beyond what automated scanners (axe-core, Pa11y) can find. It targets React/Next.js apps (the dominant stack in the Clawspace ecosystem and in the AI-generated UI space), maps every defect to a specific WCAG 2.2 success criterion with remediation guidance, and outputs structured reports in Markdown and JSON. The AI layer uses an LLM to perform semantic critique that scanners miss: ARIA misuse that parses correctly but confuses screen readers, cognitive load violations (WCAG 2.2 SCs 3.3.7–3.3.9), and plain-language failures in UI copy. The primary use case is dogfooding on the Clawspace `ui/` Next.js app, with a secondary goal of open-sourcing after v0.2. Timing is driven by the `accessibility-ai` research domain surfacing a consistent gap: AI-generated UI code has high defect rates that existing scanners undercount.

**Research anchors:** `research/domains/accessibility-ai/notes/2026-05-02-cognitive-load-neurodiversity.md` (COGA SCs), `research/domains/accessibility-ai/ideas-feed.md` (items 1 and 2).

## Specifications (success criteria)

### v0.1 — Local scan (MVP)
- [ ] CLI command `a11yai scan <url|path>` runs axe-core against a URL or built Next.js output
- [ ] Static AST layer via `eslint-plugin-jsx-a11y` catches label, role, and alt-text defects at the source level
- [ ] LLM critique layer (Claude API) reviews component-level JSX for ARIA misuse and COGA SC violations not detectable by the rule-based layers
- [ ] All defects mapped to WCAG 2.2 SC identifiers (e.g. `1.1.1`, `3.3.8`) with a short remediation note
- [ ] Output: Markdown report + JSON report with `{ sc, severity, element, location, note }` schema
- [ ] Self-scan: `a11yai scan http://localhost:3001` runs clean on the Clawspace `ui/` app (≤5 unfixed defects at severity `moderate` or above) — this is the v0.1 acceptance gate
- [ ] README with install + usage example published

### v0.2 — CI integration
- [ ] GitHub Actions workflow file published (`a11yai-check.yml`) with configurable severity threshold
- [ ] PR comment reporter: posts a Markdown defect table as a PR comment on new defects vs. baseline
- [ ] Baseline file (`a11yai-baseline.json`) so pre-existing defects don't block PRs — only regressions fail CI
- [ ] Content-hash cache for LLM critique responses (avoid re-paying LLM cost on unchanged components)
- [ ] Docs: "Adding A11yAI to your React/Next.js CI" guide

### v0.3 — Defect tracker
- [ ] Persistent defect store (SQLite or JSON file) with first-seen / last-seen / resolved timestamps
- [ ] `a11yai diff` command: show new defects since last scan
- [ ] `a11yai report --format html` generates an accessible HTML dashboard of open defects

## Forbidden actions

- Never commit LLM API keys or any credentials to the repository
- Never auto-fix source code — A11yAI is a reporting tool, not an auto-remediator
- Never mark a defect as resolved without re-running the scan that originally detected it
- Never bypass the content-hash cache by force-re-querying the LLM on unchanged components (token cost discipline)
- Never modify the baseline file without an explicit user command (`a11yai baseline update`)
- Never suppress a WCAG 2.2 AA violation silently — failing checks must appear in the report even if below the CI severity threshold
- Never use `any` types in the TypeScript report schema — the `{ sc, severity, element, location, note }` shape is the contract
- Never merge a PR that adds a new scan layer without a corresponding unit test covering at least 3 SC failure cases

## Open questions

1. **LLM provider strategy:** Claude API (Anthropic SDK) is the default. Should we support an `--llm openai` flag for users without Anthropic access, or keep it Claude-only for v0.x?
2. **Scan scope for AI-generated UIs:** Should `a11yai scan` accept a Bolt/v0 export ZIP as input (in addition to URLs and local paths)?
3. **Plain-language linter bundling:** The ideas-feed plain-language linter concept is a natural sub-tool. Should it ship as `a11yai lint-copy` in v0.1, or as a separate package?
4. **Cognitive a11y checklist bundling:** Similarly, the cognitive a11y checklist (ideas-feed item 1) could ship as `a11yai check-cognitive`. Same question — bundle or separate?
5. **Naming:** "A11yAI" is working title. Before open-source launch, check for npm namespace conflicts and GitHub repo name availability.
6. **Pricing / OSS model:** v0.1 self-hosted, API-key-required for LLM layer. Should v0.2 CI mode offer a cloud-hosted option with a usage tier?
7. **Framework breadth:** Start with React/Next.js only. Add Vue/Nuxt in v0.2 or v0.3?
8. **Report output for the `ui/` dogfood:** Should A11yAI's own report on the Clawspace UI be published as a public accessibility statement?

## Active KRs (this week — week of 2026-05-04)

- [ ] PRD authored and committed (this file) ✓
- [ ] Kanban created with first sprint backlog (5 cards)
- [ ] Repository scaffolded: TypeScript, ESLint, axe-core dependency wired
- [ ] `eslint-plugin-jsx-a11y` integrated and producing output on the `ui/` codebase
- [ ] First LLM critique layer spike: send one JSX component to Claude API, parse response into `{ sc, severity, element, location, note }` schema

## Kanban

`kanban/projects/a11yai-accessibility-defect-automation.md` — managed by `kanban-secretary`, updated by `scrum-master`.

## Bus channel

`bus/proj-a11yai-accessibility-defect-automation.jsonl` — created on first post.

## Graphify index

`graphify-indexes/a11yai-accessibility-defect-automation/` — re-indexed weekly by `dev-researcher` or on-demand.
