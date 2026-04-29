# V3 Extended Plan — Shift-Left + MCP Mesh + Multi-Model Governance

> Date: 2026-04-26
> Status: Planning — supersedes both `VERSION 3 - Shift-Left Architecture Extension.md` and `VERSION_4_MCP_AND_MULTI_MODEL_GOVERNANCE.md`. Those two docs remain as historical artifacts; this document is the source of truth going forward.
> Companion docs: `ARCHITECTURE_V2_DEFINITIVE.md`, `INTELLIGENT_AUDITOR_ARCHITECTURE.md`, `DECISIONS.md` (ADR-045 … ADR-056).

---

## 1. The unified vision

A11yNexus today (V1+V2) is a working post-hoc auditor: 89% WCAG coverage, GraphRAG synthesis, cross-source FP verification (ADR-044), 13 per-SC agents in design, intelligent auditor with `llm-generated` checks. **It is invoked manually, by one persona, after the code is built.**

V3 Extended turns A11yNexus into the **central nervous system of accessibility across the SDLC**, on a **model-governed, MCP-orchestrated control plane**:

- **Shift-left** — find issues at design time (Figma), dev time (IDE), review time (GitHub PR), CI/CD time, and production time, with one violation entity flowing across all stages.
- **MCP mesh** — every external capability (Figma, Playwright, GitHub, document scanners, Neo4j, accessibility-agents) lives behind an MCP boundary, not bespoke clients.
- **Multi-model governance** — foundational LLMs for reasoning, SLMs for high-volume narrow tasks, deterministic shortcuts where possible, all behind a single policy-driven `modelRouter`.

The unifying claim: **A11yNexus is a control plane. Tools (MCP servers) and models (LLMs/SLMs) are interchangeable peripherals chosen per task by policy — never wired in by hand. Auditing happens at every stage, not just one.**

---

## 2. What we're building, in one diagram

```
   DESIGN          DEV            REVIEW          CI/CD         PRODUCTION
   ──────          ───            ──────          ─────         ──────────
   Figma           IDE            GitHub PR       Pipeline      Scheduled
   Plugin          Agents         Bot             Scan          Scans
     │              │               │              │              │
     │              │               │              │              │
     ▼              ▼               ▼              ▼              ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │             MCP Helper Mesh (Figma · Playwright · GitHub ·        │
   │             Document · Neo4j · accessibility-agents · VPAT/SARIF)│
   └──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │                       A11yNexus Control Plane                    │
   │                                                                  │
   │  Cross-stage data backbone (violationFingerprint dedup)          │
   │  Model Router + Governance (foundational + SLM + deterministic)  │
   │  Existing AI Worker, Scanner Worker, Intelligent Auditor V2      │
   │  Neo4j WCAG + historical bug graph · Postgres · BullMQ · Redis   │
   └──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │  PERSONA DASHBOARDS                                              │
   │  Designer  · Developer (in-PR)  · A11y Engineer  · Lead/PM       │
   └──────────────────────────────────────────────────────────────────┘
```

---

## 3. The three architectural pillars

### Pillar 1 — Shift-left integration surfaces

Each SDLC stage gets a thin integration that pushes violations into the same backbone:

| Stage | Surface | Data plane |
|---|---|---|
| Design | Figma plugin (iframe) — reads frames, calls existing image-audit/vision pipeline, writes ADA notes back as Figma annotations | `DesignSpec` row keyed by `figma:fileId:nodeId` |
| Dev | accessibility-agents framework agents in Claude Code / Copilot / Claude Desktop | Ephemeral (no central data) — optional anonymized telemetry |
| Review | GitHub App + PR bot — webhook on `pull_request`, dispatches scan against preview deployment, posts check run + inline comments | `AuditRun` with `trigger = pr`, baseline diff vs `main` |
| CI/CD | `POST /api/cicd/scan` — same dispatch, different trigger; SARIF 2.1.0 → GitHub Code Scanning | `AuditRun` with `trigger = cicd`, branch baselines |
| Prod | Scheduler Worker (Phase 12.5) extended for scheduled crawls of top-N URLs | `AuditRun` with `trigger = scheduled` |

**Auto-fix bot** (`src/workers/fixer/`) is a reuse layer, not a new engine — it consumes only `CONFIRMED` violations (ADR-044), invokes the existing AI Worker per-SC agents to generate fixes, opens a PR, runs tests + re-scan on preview, then merges (auto-merge tier) or waits for review (suggest-only tier) or just comments (comment-only tier). See ADR-047.

### Pillar 2 — MCP Helper Mesh

Every external capability is reached through an MCP server. Three categories:

| Category | MCP server | Owner | Purpose |
|---|---|---|---|
| **Authoring** | Figma MCP | A11yNexus (in-tree) | Read frames, write ADA annotations, persist `DesignSpec` |
| **Authoring** | Playwright MCP | OSS / wrapped | Page navigation, DOM extraction, screenshots — gradually replaces direct Playwright calls in workers |
| **Authoring** | Document MCP | A11yNexus (in-tree) | DOCX/XLSX/PPTX/PDF parsing + Matterhorn rules (lifted from `accessibility-agents`) |
| **Knowledge** | Neo4j read MCP | A11yNexus (in-tree) | Read-only WCAG + historical-defect graph queries; replaces ad-hoc `neo4jService` calls |
| **Knowledge** | A11yNexus MCP | A11yNexus (in-tree) | Internal audit history, violation lookup, fingerprint dedupe — exposed to IDE agents and external clients |
| **Specialist** | accessibility-agents MCP | OSS sidecar | 24 a11y scanning tools used as second-opinion verifier on borderline (70–85 confidence) findings |
| **Delivery** | GitHub MCP | OSS / wrapped | PR comments, check runs, auto-fix PR creation — replaces Octokit-direct calls |
| **Delivery** | VPAT/SARIF MCP | A11yNexus (in-tree) | Compliance-report generation (VPAT 2.5, SARIF 2.1.0) on demand from any client |

**Why MCP rather than bespoke clients:** one tool-discovery surface, one permission model per client, the same servers consumable by Claude Desktop, Claude Code, and the AI Worker. New tools mount instead of merge. See ADR-051.

### Pillar 3 — Multi-Model Governance Layer (`modelRouter`)

A new `services/modelRouter.ts` sits in front of `aiProvider.ts` and resolves **(taskType, context, clientPolicy) → ModelHandle**, where ModelHandle wraps:

- **Foundational LLMs** — GPT-4o, Claude Sonnet 4.6, Gemini 2.5 Flash (cloud).
- **SLMs / specialist models** — distilled fine-tunes for FP verification, classification, embeddings, NER (Ollama / vLLM / Azure fine-tunes).
- **Deterministic resolvers** — heuristic shortcuts that bypass models (e.g., "is this img decorative" via attribute check before any model call).

**Task taxonomy** (initial; lives in `src/shared/constants/aiTasks.ts`):

| Task | Tier | Default model | Why |
|---|---|---|---|
| `vision.componentId` | Foundational | GPT-4o vision | Multimodal, low volume |
| `code.autoFix` | Foundational | Claude Sonnet | Best code reasoning |
| `audit.intelligentEval` | Foundational | GPT-4o | Complex JS check generation |
| `audit.fpVerification` | SLM | Distilled classifier | High volume, narrow task |
| `audit.severityClassify` | SLM | Distilled 4-label classifier | Deterministic-ish |
| `defect.reportWriting` | Foundational | GPT-4o | User-facing prose |
| `defect.summaryShort` | SLM | Phi-3 / Llama-3.1-8B | Short outputs, cheap |
| `graph.synthesis` | Foundational | Claude Sonnet / GPT-4o | Reasoning over graph |
| `embeddings.violation` | SLM | bge-small / OpenAI 3-small | Vector similarity |
| `entity.extraction` | SLM | Gliner-small | NER on bug text |
| `chat.assistant` | Foundational | GPT-4o | User-facing |

See ADR-052, ADR-053.

---

## 4. The keystone: cross-stage data backbone

This is what makes the shift-left architecture worth more than the sum of its stages.

- **`violationFingerprint: String`** column on `AuditViolation` — stable hash of `(WCAG SC, normalized selector, accessible name, parent context)`. Two violations with the same fingerprint across stages link to one entity. See ADR-045.
- **Neo4j additions:**
  - `(Violation)-[:DETECTED_AT_STAGE]->(SDLCStage {name})` — design / dev / pr / cicd / prod
  - `(Violation)-[:OCCURRED_IN]->(AuditRun)`
  - `(Violation)-[:LINKED_FIX]->(GitCommit)`
  - `(Violation)-[:ORIGINATED_FROM]->(DesignSpec)`
- **New Prisma models:** `IntegrationWebhook`, `DesignSpec`, `GitCommit`, `DocumentAudit`, `ModelInvocation`, `ModelEvalRun`, `McpServer`.

**KPI unlock:** "How long did this violation live before fix?" "What % of production violations were caught earlier in the pipeline?" → the **shift-left effectiveness KPI**, longitudinally.

---

## 5. Governance — five concrete enforcement points

The governance layer is not a slogan. Each enforces a contract.

### 5.1 Policy

`Client.configJson.modelRouting` schema:

```jsonc
{
  "modelRouting": {
    "allowedProviders": ["azure_openai", "ollama_local"],
    "deniedModels": ["gemini-*"],
    "tierOverrides": { "audit.fpVerification": "slm" },
    "monthlyCostCapUSD": 2500,
    "perTaskCeiling": { "graph.synthesis": { "maxTokens": 8000 } },
    "fallbackChain": {
      "audit.intelligentEval": ["gpt-4o", "claude-sonnet-4-6", "gpt-4o-mini"]
    }
  }
}
```

Misconfig fails closed (cheapest legal option, never crashes the pipeline).

### 5.2 Guardrails

- **Pre-call:** payload-size vs context-window, PII scan via SLM classifier before sending to external providers, schema check on tool inputs.
- **Post-call:** JSON-schema validation on structured tasks; on schema fail, retry once on a stronger model and log a `routerEscalation` event.
- **Hallucination guards on graph synthesis:** synthesized claims must cite a Neo4j node ID; uncited claims dropped or flagged.
- **Auto-fix bot:** gated by `CONFIRMED` only + re-scan verification.

### 5.3 Eval & drift

- **Golden set** — 200 hand-labeled findings in `data/eval/`; runs on every model swap or prompt change; precision/recall/F1 published to the Governance Dashboard.
- **Shadow mode** — new SLMs run in parallel for N days; promotion requires within-tolerance agreement on the golden set.
- **Drift alarms** — rolling 7-day classification distribution per task; >2σ deviation pages on-call.

### 5.4 Cost & efficiency telemetry

`ModelInvocation` rows roll up into:
- $/audit, $/violation, $/auto-fix-PR.
- Token-saved attribution per route.
- Cache hit rate per task.

Surfaced in the **Governance Dashboard** at `/app/admin/governance` (ADMIN/LEAD only). See ADR-054.

### 5.5 Caching, batching, human-in-the-loop

- **Semantic prompt cache** (Redis + embedding similarity) for repeated FP verification and short summaries.
- **Batch boundary** — `modelRouter.submitBatched(taskType, payload)` flushes every 250 ms or 32 items.
- **Provider-side prompt caching** — Anthropic + Azure prompt caching used for the static portion of intelligent-auditor system prompts.
- **`NEEDS_REVIEW` queue** is the policy escape valve — anything the router can't satisfy with confidence ≥ floor lands here. Reviewer disposition becomes labeled training data for the next SLM iteration (closes the loop with V2's Phase 12 self-training).

---

## 6. Phased rollout — Phases 13–24, weeks 17–48

Sits **after** existing V2 Phases 11–12. One unified plan; no V3/V4 split.

### Group A — Foundation (Phases 13–18, weeks 17–32): the shift-left loop

| Phase | Weeks | Deliverable |
|---|---|---|
| **13: Cross-stage data backbone** | 17–18 | `violationFingerprint` column, ingestion API, dedupe service, SDLCStage Neo4j schema, new Prisma models (`IntegrationWebhook`, `DesignSpec`, `GitCommit`) |
| **14: GitHub App + PR bot** | 19–21 | App scaffold, `pull_request` webhook, scan-on-PR flow, check run, inline comments, baseline diff vs `main` |
| **15: Auto-fix bot** | 22–24 | Three-tier confidence policy (auto-merge / suggest-only / comment-only), reuses AI Worker per-SC agents + FP verification, fix-PR with re-scan verification |
| **16: CI/CD service + SARIF + baselines** | 25–27 | `/api/cicd/scan` endpoint, SARIF 2.1.0 export, branch baselines, regression gates |
| **17: Persona dashboards** | 28–30 | Designer + Leadership pages, Developer feedback polish (in-PR), cross-stage view added to A11y Engineer console |
| **18: Multi-LLM routing v0** | 31–32 | `routeForTask()` precursor in `aiProvider.ts`, per-client model config in `Client.configJson`, cost dashboards, scheduled production scans |

### Group B — Scale-up (Phases 19–24, weeks 33–48): MCP mesh, document audits, full governance

| Phase | Weeks | Deliverable |
|---|---|---|
| **19: Document Audit Module** | 33–35 | DOCX/XLSX/PPTX (46 rules) + PDF/UA via Matterhorn (56 rules), lifted from `accessibility-agents`; new `audit:scan-doc` queue + `src/workers/document-scanner/`; `DocumentAudit` model; violations write to existing `AuditViolation` table (ADR-056) |
| **20: MCP Helper Mesh foundation** | 36–38 | `services/mcpClient.ts`; in-tree MCP servers (Figma, Document, A11yNexus, VPAT/SARIF, Neo4j read); migrate Figma plugin (V2 Phase 11) and chat assistant onto MCP; accessibility-agents MCP wired as sidecar |
| **21: Model Router + task taxonomy** | 39–41 | `services/modelRouter.ts` chokepoint (supersedes Phase 18 `routeForTask`), `aiTasks.ts`, policy resolver, `ModelInvocation` logging on every AI call site (observation phase — no behavior change yet) |
| **22: SLM tier + first migrations** | 42–44 | Distilled FP-verification SLM trained on V2 feedback corpus; deploy via Ollama or Azure fine-tune; route `audit.fpVerification` and `defect.summaryShort` to SLM behind shadow-mode flag → cutover after eval-set parity. Target ≥ 30% $/audit reduction |
| **23: Governance Dashboard + guardrails + eval harness** | 45–46 | `/app/admin/governance`; golden set runner (`scripts/evalRouter.ts`); drift alarms; semantic prompt cache; per-client cost ceilings (soft-fail downgrade); VPAT 2.5 / ACR generation MCP exposed end to end |
| **24: Specialist verifier + production hardening** | 47–48 | accessibility-agents MCP second-opinion verification on borderline (70–85) findings; promotion of SLMs out of shadow mode; chaos-tests for MCP server outages (router fallback chains validated); doc + dogfood pass |

Total V1+V2+V3-Extended footprint: ~48 weeks (≈ 12 months) end to end.

### POC #1 — Shift-Left Loop (8–10 weeks, runs alongside Phases 13–17)

Target: one Safeway PR through every stage, demonstrable for leadership.
1. Stand up minimal data backbone + fingerprinting (2 wks)
2. GitHub App triggers scan on PR webhook; 3 inline comments posted (3 wks)
3. Auto-fix bot opens follow-up PR for one trivial finding, e.g. decorative `alt=""` (1 wk)
4. Baseline shows "+3 violations vs main" → block-merge gate
5. Nightly prod scan confirms regression gone post-merge
6. Leadership dashboard skeleton shows the round-trip (2 wks)

Demo time: < 10 minutes from PR open to auto-fix merged. Each persona sees their slice. See ADR-050.

### POC #2 — Governance Mid-Flight Slice (4 weeks, runs during Phases 19–24)

Target: prove "we can swap the engine while it's running."
1. `modelRouter` in observation mode — log every call, no routing change (Wk 1)
2. Mount Figma MCP + accessibility-agents MCP sidecar; route one borderline-finding flow through specialist verifier (Wk 2)
3. Train tiny FP-verification SLM on existing feedback rows; shadow-mode it (Wk 3)
4. Ship Governance Dashboard read-only view: cost per audit, model mix, shadow agreement % (Wk 4)

---

## 7. Component map (where code lives)

| Component | Path | Notes |
|---|---|---|
| Cross-stage backbone | `prisma/schema.prisma` (`violationFingerprint`, `IntegrationWebhook`, `DesignSpec`, `GitCommit`) | + Neo4j schema migration script |
| Figma plugin | `src/figma-plugin/` + `src/server/modules/figma/` | Reuses image-audit pipeline |
| GitHub App | `src/server/modules/github/` + new GitHub App registration | `pull_request` webhook handler |
| Auto-fix worker | `src/workers/fixer/` | Reuses AI Worker per-SC agents |
| CI/CD service | `src/server/modules/cicd/` | `POST /api/cicd/scan`, SARIF export |
| Persona dashboards | `src/app/pages/designer/`, `src/app/pages/leadership/` | Reuse `IntelligenceDashboard.tsx` chart components |
| Document audit | `src/workers/document-scanner/`, `src/server/modules/document-audit/` | DOCX/XLSX/PPTX/PDF |
| MCP servers (in-tree) | `src/mcp-servers/{figma,document,a11ynexus,vpat-sarif,neo4j-readonly}/` | FastMCP / TS SDK |
| MCP client | `services/mcpClient.ts` | One client, all callers |
| Model router | `services/modelRouter.ts` | Wraps `aiProvider.ts` |
| Task taxonomy | `src/shared/constants/aiTasks.ts` | Default tier mapping |
| Policy resolver | `services/modelPolicy.ts` | `Client.configJson.modelRouting` |
| Eval harness | `scripts/evalRouter.ts` + `data/eval/` | Golden set runner |
| Governance dashboard | `src/app/pages/admin/governance/` | Cost, drift, eval, invocation explorer |
| Specialist verifier hook | `services/specialistVerifier.ts` | Calls accessibility-agents MCP on borderline findings |
| New BullMQ queues | `src/server/infra/queue.ts` | `figma-analyze`, `github-pr-scan`, `cicd-scan`, `fix-generate`, `audit-scan-doc` |
| New routes | `src/app/router.tsx` | `/app/designer`, `/app/leadership`, `/app/admin/governance`, `/app/integrations/{github,figma}` |

---

## 8. Data model additions (Prisma)

```prisma
model ModelInvocation {
  id            String   @id @default(cuid())
  clientId      String
  taskType      String           // e.g. "audit.fpVerification"
  modelId       String
  tier          ModelTier        // FOUNDATIONAL | SLM | DETERMINISTIC
  promptTokens  Int
  outputTokens  Int
  costUsd       Decimal  @db.Decimal(10, 6)
  latencyMs     Int
  cacheHit      Boolean  @default(false)
  schemaValid   Boolean  @default(true)
  escalated     Boolean  @default(false)
  auditRunId    String?
  violationId   String?
  createdAt     DateTime @default(now())
  @@index([clientId, taskType, createdAt])
}

model ModelEvalRun {
  id          String   @id @default(cuid())
  modelId     String
  taskType    String
  goldenSet   String           // version tag
  precision   Float
  recall      Float
  f1          Float
  driftSigma  Float?
  createdAt   DateTime @default(now())
}

model McpServer {
  id          String   @id @default(cuid())
  name        String   @unique
  endpoint    String
  scope       String           // "internal" | "sidecar" | "external"
  configJson  Json
  enabled     Boolean  @default(true)
}

model DesignSpec { /* keyed by figma:fileId:nodeId, ADA notes JSON */ }
model GitCommit  { /* sha, repo, prNumber, linkedViolations */ }
model IntegrationWebhook { /* generic external-source ingestion */ }
model DocumentAudit { /* file blob ref, mimeType, parent AuditRun */ }

enum ModelTier { FOUNDATIONAL SLM DETERMINISTIC }
```

`AuditViolation` gains `violationFingerprint`, `fingerprintAlgoVersion`, `originatedFrom`, `linkedFixCommit`.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| PR bot noise destroys developer trust | Only `CONFIRMED` (ADR-044) findings posted to PRs; `NEEDS_REVIEW` to A11y Engineer triage queue. Calibrate aggressively; start one repo, one team, opt-in. |
| Auto-fix bot breaks something | Every auto-fix PR runs test suite + re-scan on preview to confirm fix held without regressions. Auto-merge limited to safest 3–5 rules at launch (ADR-047). |
| MCP server sprawl creates ops burden | In-tree MCP servers share supervisor + health endpoint; sidecars must declare an SLO; `McpServer` table gates enable/disable per client. |
| SLM regression goes unnoticed | Shadow mode + golden-set gate are *hard* promotion requirements (ADR-053). Drift alarms run hourly. |
| Cost ceiling breaks running audits | Soft-fail: when ceiling hit, router downgrades to SLM/deterministic and emits warning; never aborts. |
| Specialist verifier (accessibility-agents) drifts upstream | Pin version; monthly upgrade PR with golden-set run. |
| Multi-LLM data residency violations | Policy resolver fails closed — any task whose only viable model violates `deniedModels` is routed to deterministic fallback or `NEEDS_REVIEW`. |
| Document audit accuracy unknown for retail PDFs | Phase 19 ships with manual sampling on first 100 Safeway PDFs before broad rollout. |
| Fingerprint algorithm changes invalidate dedup history | Store `fingerprintAlgoVersion` alongside; re-fingerprint job runs per-version. |

---

## 10. KPIs

- **Shift-left effectiveness:** ≥ 60% of production violations caught earlier in pipeline by end of Phase 24.
- **Cost:** ≥ 30% reduction in $/audit by end of Phase 22 (FP-verification SLM cutover).
- **Latency:** Audit P95 unchanged or better despite added MCP hops (target ≤ +5%).
- **Quality:** Golden-set F1 ≥ baseline within 1 pp after every model swap.
- **Governance:** 100% of AI calls logged in `ModelInvocation` (enforced via code-review checklist).
- **Coverage:** Document audits live for DOCX/PDF/XLSX/PPTX; ≥ 95% of Safeway sample PDFs auditable end to end.
- **POC #1 demo:** < 10 min from PR open to auto-fix merged.

---

## 11. Documentation impact (this planning pass)

| File | Action |
|---|---|
| `docs/V3_Extended_Plan.md` | **NEW** — this doc, source of truth. |
| `docs/VERSION 3 - Shift-Left Architecture Extension.md` | **HISTORICAL** — kept for provenance, no further edits. |
| `docs/VERSION_4_MCP_AND_MULTI_MODEL_GOVERNANCE.md` | **HISTORICAL** — kept for provenance, no further edits. |
| `docs/ROADMAP.md` | Unified V3 Extended block (Phases 13–24), POCs, KPIs, risks. |
| `docs/DECISIONS.md` | ADR-045 … ADR-056 appended. |
| `docs/CONTEXT.md` | "Next" section updated to point at unified V3 Extended. |
| `docs/ARCHITECTURE.md` | System summary + tech stack updated to mention shift-left scope, MCP mesh, multi-model governance. |
| `docs/THINKING.md` | Reasoning notes on the unification: why one violation entity across stages; why MCP boundary; why SLM tier; why personas are filtered views. |
| `docs/PITCH_DECK.md` | Future update — replace roadmap slide with unified vision; add POC storyboard. |
| `docs/SESSION_LOG.md` | New entry for 2026-04-26 documenting the V3+V4 unification. |
| `docs/ARCHITECTURE_V2_DEFINITIVE.md` | Future update (when implementation begins) — add Sections 16–23. |
| `docs/ai-custom-auditor.md` | Future update — cost analysis after router data available. |
| `docs/INTELLIGENT_AUDITOR_ARCHITECTURE.md` | Future update — note FP verification migrates from inline GPT-4o to `modelRouter.submit('audit.fpVerification', …)`. |

---

## 13. Capability-Gated Rollout (Local Track / Cloud Track)

> Added 2026-04-26 after the analysis in `~/.claude/plans/analyse-the-new-version-binary-sonnet.md`. ADR-057, ADR-058, ADR-059, ADR-060 codify the contract.

### 13.1 Why this section exists

Sections 1–12 describe the *target* architecture. They assume access to GitHub (App approval), Figma (plugin install), cloud LLM tier (Claude/Gemini), GPU (for SLM QLoRA fine-tuning), and a labelled feedback corpus large enough to distill SLMs. **None of these is available today.** What we have is one Azure GPT-4o deployment, a local Postgres / Neo4j / Redis stack, and the working V2 Intelligent Auditor.

Rather than slip phases against blocked access, we split V3 Extended into two parallel tracks. Same architecture, sequenced honestly.

### 13.2 Local Track — ships now on existing infrastructure

| Phase (Local) | Source phase | What changes from §6 | Gate |
|---|---|---|---|
| **13** | 13 (full) | Ships as written. Existing scanner is the only source; stage tags `web-prod` / `web-pr-sim`. | None |
| **19a** | 19 (subset) | DOCX + PDF/UA only. PPTX + XLSX moved to 19b. License review of `accessibility-agents` rule extraction is week-1 work. | None |
| **20a** | 20 (subset) | In-tree MCP servers only: **A11yNexus internal**, **Neo4j read-only**, **VPAT/SARIF**. Figma MCP, GitHub MCP, accessibility-agents MCP deferred. JWT-scoped per-client auth (ADR-060) is non-negotiable for the in-tree A11yNexus MCP. | None |
| **21 (obs)** | 21 (full) | Router runs in **observation mode** — `ModelInvocation` rows on every call, no routing decisions yet (ADR-059). Single GPT-4o behind it. | None |
| **15a** | 15 (subset) | Fixer worker generates fix proposals via existing AI Worker. Output goes to a "Proposed Fixes" panel in the A11y Engineer console, **not to GitHub** (ADR-058). | None |
| **17a** | 17 (subset) | Leadership dashboard skeleton + cross-stage view in A11y Engineer console. Designer dashboard moves to 17b (needs Figma data). | None |
| **POC #2** | POC #2 | Governance Dashboard read-only view: cost-per-audit, model mix (one bar today), task-mix breakdown. Drift/eval panels stubbed pending second model. | None |

End-state of Local Track: A11yNexus does post-hoc web audits + DOCX/PDF document audits, has unified violation fingerprinting, exposes capability over MCP with proper auth, logs every AI call through the router, surfaces fix proposals for human review, and presents a leadership narrative dashboard. Demonstrable on a laptop.

### 13.3 Cloud Track — activates when each gate opens

| Phase (Cloud) | Source phase | Specific access gate | Notes |
|---|---|---|---|
| **14** | 14 (full) | GitHub App approval + at least one preview-deployment URL | POC #1 demo can run earlier on local Git mirror + simulated webhook payloads; production rollout waits on real GitHub access. |
| **15b** | 15 remainder | Phase 14 live **and** ≥ 30 days of 15a comment-only data showing ≥ 95% per-rule correctness | Hard gate per ADR-058. Auto-merge tier opens per-rule, not in bulk. |
| **17b + Figma plugin** | V2 Phase 11 + 17 remainder | Figma plugin install permission + Figma file access | Figma MCP added to mesh. Designer dashboard lights up. |
| **16** | 16 (full) | Customer CI/CD pipeline access | `/api/cicd/scan`, SARIF, branch baselines, regression gates. Builds on 14. |
| **18** | 18 (full) | Second LLM (Claude / Gemini) cloud access | Activates router decisions for `code.autoFix` (Claude) and `defect.reportWriting` (provider choice). Router has 30+ days of observation telemetry by then. |
| **22** | 22 (full) | GPU capacity for QLoRA **and** ≥ 5k labelled feedback rows | First SLM targets `audit.fpVerification` and `defect.summaryShort`. Shadow-mode + golden-set gate per ADR-053. |
| **23 (full)** | 23 remainder | Phases 21 + 18/22 producing telemetry | Drift alarms, eval harness, prompt cache, cost ceilings. |
| **24** | 24 (full) | OSS sidecar deploy capacity | accessibility-agents MCP as second-opinion verifier on borderline findings. |
| **19b** | 19 remainder | Team bandwidth (no external gate) | XLSX + PPTX scanners. Lifted from `accessibility-agents` after 19a proves the pipeline. |

### 13.4 Architecture invariant

Every Local Track interface is the *same* interface Cloud Track work mounts onto:

- `violationFingerprint` (Phase 13) is the dedup key for any future source — Figma, PR scan, CI/CD, prod scan.
- `mcpClient.ts` (Phase 20a) is the single client through which Figma MCP, GitHub MCP, accessibility-agents MCP plug in later — no parallel client paths.
- `modelRouter` (Phase 21) is the chokepoint through which Claude, Gemini, SLMs, deterministic resolvers all resolve later — `aiProvider.ts` callsites never change again.
- The "Proposed Fixes" log (Phase 15a) is the data source the GitHub App reads when 15b opens — the delivery surface changes, the generation pipeline does not.
- `AuditViolation.source` (Phase 19a, ADR-056) accepts `document-audit`, `figma`, `pr-scan`, `cicd`, `scheduled` without schema change.

**No code path requires cloud or external SaaS to ship.** When a gate opens, the corresponding code path lights up.

### 13.5 POC #1 staging without GitHub access

The original POC #1 (one PR through the full shift-left loop) is the most demonstrable narrative for stakeholders. Rather than wait for GitHub access, stage it locally:

- **Local Git mirror** of a Safeway-shaped sample app under `~/dev/poc1-mirror/`.
- **Simulated webhook payload** — a `scripts/simulateGithubWebhook.ts` that POSTs a synthetic `pull_request.opened` event to the `github` module's webhook handler.
- **Local Vite preview** as the "preview deployment" URL.
- The `github` module's PR comment / check-run code paths run against a local-only "GitHub stub" that records what *would* be posted.

When real GitHub access lands, the only swap is the stub for the real Octokit client. Webhook-handling, fingerprinting, fix-generation, baseline diffing, and Leadership dashboard updates all already work end to end.

### 13.6 What this changes about §6

Section 6's 24-phase sequence is preserved as the *target*. Section 13's tables are the *current operating sequence*. As gates open, Local Track phases extend into their full Cloud Track form (e.g., 19a → 19a+19b, 17a → 17a+17b, 21 obs → 21 obs+18+22). No phase is deleted; sequencing is honest about what is reachable today versus tomorrow.

---

## 14. Why one V3 instead of V3+V4

Three reasons the split was wrong and the unification is right:

1. **The shift-left loop and the MCP/governance layer share the same chokepoints.** The PR bot needs the GitHub MCP. The Figma plugin needs the Figma MCP. The auto-fix bot's quality depends on the model router routing `code.autoFix` to Claude Sonnet. Splitting them across V3 and V4 forced artificial sequencing.

2. **The cross-stage data backbone (Phase 13) and the `ModelInvocation` log (Phase 21) are two halves of the same observability story.** "Where did this violation come from, who fixed it, and what did it cost?" is one question, not two.

3. **One POC tells the whole story.** POC #1 (shift-left loop) plus POC #2 (governance mid-flight slice) demonstrate the same system from two angles. Versioning them separately confused the narrative.

The 24-phase plan is sequenced so each phase unblocks the next; Group A (foundation) ships a working shift-left loop, Group B (scale-up) makes it economical and pluggable. Together they are V3 Extended.
