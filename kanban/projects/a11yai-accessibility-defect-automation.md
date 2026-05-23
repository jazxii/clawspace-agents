# Kanban — a11yai-accessibility-defect-automation

Columns: Backlog | In Progress | Review | Done. Use `/kanban-move` to advance cards. Card line format: `- [card-N] Title — metadata`.

Last synced from ROADMAP.md: 2026-05-14

## Backlog

- [card-12] Phase 12: Feedback Self-Training + Polish — feedback aggregation service, confidence threshold auto-adjust, scheduled audits via Scheduler Worker (cron), MCP server stubs, UI accessibility dogfood pass, docs update — V2 Week 15-16

- [card-13] V3 Phase 13: Cross-Stage Data Backbone — 3 fingerprint mechanisms (webFingerprint, componentFingerprint, fingerprintAlgoVersion per ADR-064), mandatory tags (atContext, grain, findingNature), normalization rule set tested on 200 pairs, AST component-key extraction (ts-morph), Neo4j provenance edges (DETECTED_AT_STAGE, ORIGINATED_FROM, RELATES_TO_DOC_FINDING), new Prisma models (IntegrationWebhook, DesignSpec, GitCommit), ingestion API + dedupe service — V3 Local Track, Weeks 17-19

- [card-14] V3 Phase 14a: Developer-Time Gate + Audit Receipt — 3-zone enforcement (Zone 1: VS Code ext, Zone 2: server-side branch-protection gate, Zone 3: master CI verifier), diff-scoped audit (Storybook/component/impacted-routes/full-page fallback), baseline-aware fingerprint diff (new/regressed only), P0-P3 tier taxonomy, signed SARIF 2.1.0 Audit Receipt, override governance (P0: no override, P1: A11y co-sign, P2: justification+quota), receipt naming contract ("Pre-Merge Audit Receipt", never "Compliance Certificate"), 200-PR backtest at ≥95% correct, P95 latency ≤90s (Storybook scope) — V3 Local Track, Weeks 18-20

- [card-15] V3 Phase 19a: Document Audit — DOCX + PDF/UA — ~50 rules lifted from accessibility-agents (license review week 1), SARIF output, new audit:scan-doc BullMQ queue, src/workers/document-scanner/, violations to existing AuditViolation table (source='document-audit'), Safeway retail-PDF use case — V3 Local Track

- [card-16] V3 Phase 20a: MCP Foundation (in-tree only) — services/mcpClient.ts, in-tree MCP servers (A11yNexus internal, Neo4j read-only, VPAT/SARIF), short-lived per-client/per-tool JWT auth (ADR-060), Figma/GitHub/accessibility-agents MCP deferred to Cloud Track — V3 Local Track

- [card-17] V3 Phase 21: Model Router (observation mode) — services/modelRouter.ts chokepoint, aiTasks.ts taxonomy, ModelInvocation row per AI call, single GPT-4o behind it (no routing decisions yet per ADR-059), 100% of existing AI callsites migrated through router, 30+ days telemetry collection — V3 Local Track, Weeks 39-41

- [card-18] V3 Phase 15a: Auto-Fix Bot (proposal mode) — fixer worker reads CONFIRMED violations, generates fix proposals via existing AI Worker, writes to "Proposed Fixes" panel in A11y Engineer console, no GitHub touch (ADR-058) — V3 Local Track

- [card-19] V3 Phase 17a: Leadership Dashboard Skeleton — /app/leadership over AuditViolation aggregations, cross-stage view in A11y Engineer console, shift-left effectiveness KPI (starts at 0%, grows as Cloud Track activates), Designer dashboard waits on Figma data (Phase 17b) — V3 Local Track

- [card-20] V3 POC #2: Governance Read View — /app/admin/governance (ADMIN/LEAD only), cost-per-audit, model-mix bar, task-mix from ModelInvocation, drift/eval panels stubbed pending second model — V3 Local Track, 4 weeks

- [card-21] V3 Phase 14: GitHub App + PR Bot — GitHub App scaffold, pull_request webhook listener, POST /api/cicd/scan on PR open/sync, inline PR comments + check run, baseline diff vs main, only CONFIRMED findings posted, receipt consumer (skips re-audit if Phase 14a receipt valid) — Cloud Track, gate: GitHub App approval + preview-deployment URL

- [card-22] V3 Phase 15b: Auto-Fix (suggest + auto-merge) — hard gate per ADR-058: ≥30 days of 15a data + ≥95% per-rule correctness, promotion per-rule not aggregate, auto-merge limited to 3-5 safest rules at launch — Cloud Track, gate: Phase 14 live + 15a data

- [card-23] V3 Phase 17b: Figma Plugin + Designer Dashboard — Figma plugin ships ADA notes (V2 Phase 11 baseline), Figma MCP joins mesh, Designer dashboard (/app/designer: components without ADA notes, defect-prone components, design-system score) — Cloud Track, gate: Figma plugin install permission

- [card-24] V3 Phase 16: CI/CD Service + SARIF + Baselines — /api/cicd/scan endpoint, SARIF 2.1.0 export → GitHub Code Scanning, per-branch baseline storage, configurable regression gates, receipt verifier on master (Zone 3), critical flow crawl (cart, checkout, search, account) — Cloud Track, gate: customer CI/CD pipeline access

- [card-25] V3 Phase 18: Multi-LLM Routing — extend aiProvider.ts with routeForTask(), per-client model config in Client.configJson, cost dashboards, scheduled production scans — Cloud Track, gate: second LLM (Claude/Gemini) cloud access

- [card-26] V3 Phase 22: SLM Tier + First Migrations — QLoRA FP-verification SLM on V2 feedback corpus, shadow-mode → golden-set parity gate, route audit.fpVerification + defect.summaryShort to SLM, severity classification + embeddings (bge-small) + NER (Gliner-small) SLMs, target ≥30% $/audit reduction — Cloud Track, gate: GPU capacity + ≥5k labelled feedback rows

- [card-27] V3 Phase 23: Governance Dashboard + Guardrails + Eval Harness — /app/admin/governance (cost, drift, eval, invocation explorer), golden set runner, drift alarms, PII scan, hallucination guards, semantic prompt cache (Redis + embedding), per-client cost ceilings, VPAT 2.5/ACR generation MCP — Cloud Track, gate: Phases 21 + 18/22 telemetry

- [card-28] V3 Phase 24: Specialist Verifier + Production Hardening — accessibility-agents MCP second-opinion on borderline (70-85 confidence) findings, confidence boost ×1.2 on agreement, NEEDS_REVIEW on disagreement, chaos tests for MCP outages, docs refresh, governance dashboard dogfood pass — Cloud Track

## In Progress

- [card-11] Phase 11: Figma ADA Notes Generator — /app/figma page (upload screenshot or connect Figma), fix image audit (currently broken), ADA notes generator (per-component SR announcement, keyboard, ARIA, focus order), training data loader (data/ada_notes_training/), export as PDF/Markdown — V2 Week 14

## Review

## Done

- [card-1] V1 Complete — Core React UI (Dashboard, Defects, Audit, Content Audit), Neo4j WCAG graph + historical defects, Playwright + axe-core scanning, AI chat with GraphRAG, dual AI provider (Gemini, Azure OpenAI primary) + Ollama, similar defect matching (entity extraction + weighted JSONL + Neo4j 5-hop), JSONL export pipeline, HistoricalDefectsPanel, Content Audit HTML+Image modes, auto-generated AI defect reports, JSONL auto-loading, A11yNexus branding, Neo4j Aura Cloud migration, V2 Architecture plan approved

- [card-2] V2 Phase 0: Infrastructure Setup — src/ monorepo (26 new files), 7 domain-split type files, WCAG mappings + 13 agents + RBAC constants, Prisma 6 + ioredis + BullMQ + Socket.io + Pino + React Router + Zustand + TanStack Query + Recharts, Prisma schema (10 models, 4 enums), custom JWT auth (register/login/refresh/logout), package.json scripts (dev:api, dev:scanner, dev:ai, db:*), tsconfig + vite path aliases + WS proxy, seed script

- [card-3] V2 Phases 1–3: React Router + Auth + API Refactor — React Router v7 (PublicLayout + AppLayout + route guards), LandingPage + LoginPage, Zustand stores (authStore, auditStore, uiStore), API client with auto-refresh, auditServer.ts (846 lines) decomposed into 9 modules (similar-defect, content-audit, export, dashboard, chat, defect, admin), 8 frontend API modules, TypeScript clean

- [card-4] V2 Phases 4–6: Scanner + AI Worker + Audit Result UX — playwrightEngine (retry/redirect/resource-blocking/consent-banner), axeCoreRunner, screenshotService (±200px contextual crop + red outline), domExtractor (3-level ancestor HTML + 20 CSS props + ARIA), scannerWorker orchestrator, WebSocket progress events, AuditResultPage (4 main tabs, classification sub-tabs, violation cards with screenshots/code/AI reports/similar defects, feedback buttons, progressive rendering, export MD/PDF)

- [card-5] V2 Phases 7–8: Audit History Dashboard + Admin Console — AuditHistoryPage (paginated, URL filter, impact pills), trend charts (Recharts LineChart, 5 lines, time range selector), regression detection (latest vs previous per URL), comparison view (2-run diff), re-run button; Admin: UserManagementPage, ClientManagementPage, SystemConfigPage (4 config sections), DevOpsDashboardPage, FeedbackReviewPage, admin.routes.ts (12 endpoints), TypeScript clean

- [card-6] Phase 9: Custom Rule Engine — Rule CRUD API (/api/admin/rules), CustomRulesPage visual rule builder, customAuditor.ts in Scanner Worker (17 check types: aria-required-attr, aria-valid-values, focus-visible, keyboard-accessible, label-association, heading-order, alt-text, color-contrast, llm-generated + 8 more), __name polyfill fix, ancestor-aware FP reduction (ancestorHasAttr + ancestorProvidesName), MAX_ELEMENTS=200 + MAX_NODES_PER_VIOLATION=10 caps, verified: 67 rules → 26 total violations (was 6)

- [card-7] Phase 9B: Dashboard Redesign + Deep AI Analysis — IntelligenceDashboard rewrite (9 graph stats + top 5 WCAG, period selector, split layout), Defect Ticket Metrics left panel, Story Ticket Metrics right panel, deepAnalysis.routes.ts (6 GraphRAG queries, 7-hop Neo4j traversals), AI-synthesized summary (exec summary, historical pattern, remediation, risk, confidence score), similar stories + ticket status metrics, 3-5 AI-generated unique test scenarios, SimilarDefectsSection "Run Deep AI Analysis" button, deep analysis persistence (DB cache + page mount load), auto-run deep analysis in aiWorker.ts, manual defect entry (one-liner notes → Playwright DOM extract → AI full report → auto deep analysis)

- [card-8] Phase 9C: Page Context Analyzer — pageContextAnalyzer.ts (Playwright MCP, full DOM tree + a11y tree, 15 component types, DOM naming patterns, landmark + heading structure, tab focus order 30 elements, per-component state probing hover/click/Enter/Escape), PageAnalysis Prisma model, pageAnalyzer.routes.ts (5 endpoints), AI rule suggestion generator (5-15 client-specific suggestions), PageAnalyzerPage (6-tab detail view, rule accept/reject), BullMQ queues (page-analyze + page-generate-rules), Markdown report auto-generation, sidebar integration

- [card-9] Runtime Fixes Apr 2026 + Phase 9D: Data Quality — Neo4j deep analysis query fix (AFFECTS_FEATURE, PART_OF, RELATES_TO|DEFECT_OF replacing nonexistent relationships, 0→28 stories on WCAG 4.1.2), full-page scroll in audit scanner (lazy-load coverage, 15s→39s scan), JSONL ESM fix (require→import, 0→real scores), tsx watch reliability (--no-cache + --include globs); 9D: JSONL regeneration (2044 Bug nodes, 4088 entries, scores 60-73 up from 19-30), GraphRAG synthesis display fix, contextual violation headings (displayTitle), Intelligent Auditor V2 design (ADR-035), DOM Context Extractor, WCAG Intelligence Layer (88 criteria + techniques + test rules in single Cypher), scanner integration steps 2b+2c

- [card-10] Phases 10–10B: Intelligent Auditor V2 — intelligentAuditor.ts (~830 LOC): determineAuditScope (relevance heuristics, depth config), generateEvaluationBatch (batched LLM calls), executeCheck (page.evaluate new Function), verifyFindings (LLM FP filter); scanner integration (step 4c, source:'intelligent-auditor'); ScanConfig options (enableIntelligentAuditor, depth, minConfidence, enableFPVerification); confidence scoring 0-100; 5 pre-built checks (2.5.8 Target Size, 1.4.10 Reflow, 2.4.7 Focus Visible, 1.4.12 Text Spacing, 2.4.11 Focus Not Obscured); llm-generated checkType handler; Smart Rule Generation V2 (14 checkTypes + llm-generated); historical pattern validation (Neo4j bug data confidence adjustment); target 31→78/88 criteria (89% WCAG coverage)
