# PRD — a11yai-accessibility-defect-automation

<!-- Auto-populated from /Users/nft_sharedservices/Documents/a11yai-accessibility-defect-automation/docs/CONTEXT.md and ARCHITECTURE.md -->

## Goal

A11yNexus is an enterprise-grade accessibility intelligence platform built by NFT Shared Services (Accessibility Engineering). It automates WCAG defect detection, documentation, and analysis using AI and a Neo4j WCAG Knowledge Graph. The platform reduces manual defect documentation from 20–30 min to under 1 min per defect (~95% faster) and prevents re-discovery of known issues via a historical bug graph. [Auto-populated from CONTEXT.md]

## Specifications (success criteria)

- Modular monolith architecture (Option B+): API server (Express) separated from heavy Playwright/LLM execution via Redis + BullMQ job queues
- Real-time UI updates via Socket.io WebSockets
- Persistent audit history and multi-tenant client support
- Automated WCAG auditing (axe-core + custom rules + Intelligent Auditor V2 with LLM-generated checks)
- Neo4j Aura Cloud for WCAG Knowledge Graph
- PostgreSQL 16 (via Prisma ORM) for users, clients, audit runs, violations, feedback, rules
- Azure OpenAI GPT-4o (primary), Google Gemini (backup), Ollama (local)
- Playwright + axe-core automated scanning
- GraphRAG LLM synthesis engine
- JSONL export pipeline for historical defects
- Shift-left SDLC integration (planned): Figma plugin, IDE agents, GitHub App, CI/CD SARIF gates, production scheduled scans
- MCP Helper Mesh and Multi-Model Governance Layer (planned)
[Auto-populated from ARCHITECTURE.md, ROADMAP.md, ARCHITECTURE_V2_DEFINITIVE.md]

## Forbidden actions

- Never push to `main` without a passing CI check
- Never modify the database schema without an explicit migration PR
- Never commit secrets or example credentials
- Never auto-merge dependabot PRs touching auth or crypto code

## Open questions

- [ ] ...

## Active KRs (this week)

- [ ] ...

## Kanban

`kanban/projects/a11yai-accessibility-defect-automation.md` — managed by `kanban-secretary`, updated by `scrum-master`.

## Bus channel

`bus/proj-a11yai-accessibility-defect-automation.jsonl` — created on first post.
