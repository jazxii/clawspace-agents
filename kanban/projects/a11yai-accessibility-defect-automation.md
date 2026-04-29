# Kanban — a11yai-accessibility-defect-automation

<!-- counts: backlog=0 | in-progress=0 | review=0 | done=0 | updated=2026-04-29 -->

## Backlog

# V3 Extended Plan (Planned)
- Shift-left integration: Figma plugin, IDE agents, GitHub PR bot, CI/CD SARIF gates, production scheduled scans
- MCP Helper Mesh: Figma, Playwright, GitHub, document scanners, Neo4j, accessibility-agents, VPAT/SARIF
- Multi-model governance: Foundational LLMs, SLMs, deterministic shortcuts, policy-driven modelRouter
- Persona dashboards: Designer, Developer (in-PR), A11y Engineer, Lead/PM

# Roadmap (Upcoming)
- Set up PostgreSQL (local Docker or Homebrew) + add `DATABASE_URL` to `.env`
- Set up Redis (local Docker or Homebrew) + add `REDIS_URL` to `.env`
- Run `npm run db:migrate` to create tables
- Run `npm run db:seed` to create admin user
- Verify all processes start: `npm run dev` (4 concurrent processes)

## In Progress

# V2 — Phase 0 Remaining: Local Infra
- Local infra setup (PostgreSQL, Redis, migrations, admin user)

## Review

# V2 — Review/Testing
- Verify all processes start and communicate (API, scanner, AI, scheduler)
- Confirm audit results persist and are queryable

## Done

# V1 — Phases 1-4
- Core React UI with Dashboard, Defects, Audit, Content Audit views
- Neo4j integration for WCAG graph + historical defects
- Playwright + axe-core automated scanning
- AI chat assistant with graph RAG context
- Dual AI provider support (Gemini, OpenAI → Azure OpenAI primary) + Ollama (local)
- Similar defect matching service (entity extraction + weighted JSONL scoring + Neo4j 5-hop traversal)
- JSONL export pipeline (`scripts/exportJsonl.ts` → `data/historical_defects.jsonl`)
- GraphRAG LLM synthesis engine (`synthesizeGraphRAGAnalysis()` in similarDefectService)
- Redesigned HistoricalDefectsPanel with component analyses, RAG context, traversal reasoning
- Enhanced defect report prompts with full GraphRAG context injection
- Content Audit: HTML mode (paste HTML → axe-core scan) and Image mode (screenshot → AI identification)
- Auto-generated AI defect reports in Content Audit (useEffect auto-trigger + progress bar)
- JSONL auto-loading at server startup + `/api/audit/export-jsonl` endpoint
- Branding: Renamed A11yAI → A11yNexus across all user-facing UI
- UI fix: MarkdownRenderer color inheritance (color-agnostic, inherits from parent)
- Neo4j migration: Local Docker → Aura Cloud (zero-install onboarding)
- Comprehensive README rewrite + Documentation suite
- V2 Architecture plan finalized — Option B+ (Event-Driven Modular) approved
