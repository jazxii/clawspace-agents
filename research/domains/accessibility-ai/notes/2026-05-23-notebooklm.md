---
domain: accessibility-ai
date: 2026-05-23
mode: auto
tier: 1 (MCP — notebooklm batch_query)
notebook_id: 82ca706a-9065-462f-9f1f-b6941b32f6b6
queries: 10
sources_used: 6
---

# NotebookLM responses — accessibility-ai — 2026-05-23

> Tier 1 MCP path used (`mcp__notebooklm__batch` action=query). All 10 pending prompts dispatched in a single batch call. Several answers came back as "not in sources" — these are flagged for source-curator follow-up (new sources need to be added to the notebook before re-querying).

## Q1: W3C COGA Voice Systems and Conversational Interfaces — cognitive accessibility requirements + LLM failure modes

**A:** The W3C has published a first Draft Note for "Cognitive Accessibility Research Modules" (2026-Feb-05), one component of which covers Voice Systems and Conversational Interfaces. The module addresses user needs, accessibility issues, and directions for solutions for people with cognitive and learning disabilities. The grounded sources do NOT enumerate the specific requirements list, nor do they document LLM-unique failure modes — this prompt needs targeted follow-up (add the COGA module URL directly to the notebook).

**Citations:**
- [W3C WAI News — COGA Research Modules First Draft (2026-Feb-05)](https://www.w3.org/WAI/news/)

**Coverage status:** Partial — re-query after source-curator adds `w3.org/TR/coga-conversational-interfaces-research/` to the notebook.

## Q2: DOJ ADA Title II one-year extension — enforcement posture and active complaints

**A:** Deque's April 17, 2026 blog post by Glenda Sims confirms the April 20 compliance-date extension from DOJ but frames it as a prioritization signal ("keep going — this change is about prioritizing full compliance"). Sources do NOT confirm whether active complaints are paused. Independent web-search corroborates the IFR became effective 2026-04-20 and extended State/local (≥50k pop) from 2026-04-24 to 2027-04-26, and (<50k) to 2028-04-26 — but explicitly does NOT suspend Title II's underlying nondiscrimination obligations. HHS's May 11, 2026 healthcare deadline remains in force.

**Citations:**
- [Deque Blog — ADA Title II April 20 Compliance Date Extension (Sims, 2026-04-17)](https://www.deque.com/blog/)
- [Federal Register — Extension of Compliance Dates IFR (2026-04-20)](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web)

## Q3: a11yscout vs axe DevTools — rule coverage and false-positive rate

**A:** Not in notebook sources. Web-search corroboration: a11yscout is built **on top of** axe-core (not a separate engine), wrapping axe-core's rules in a PR-blocking GitHub Action with a Vite plugin for source-mapped error reporting (e.g., `src/components/Button.tsx:12:4`). Documented rules include `button-name` (SC 4.1.2) and `image-alt` (SC 1.1.1). There is no published head-to-head false-positive comparison vs axe DevTools as of 2026-05-23.

**Citations:**
- [Dev|Journal — Automating WCAG 2.1 audits with a11yscout (2026-04-24)](https://earezki.com/ai-news/2026-04-24-audit-wcag-21-accessibility-on-every-pull-request-free-github-action/)

**Coverage status:** Not answered by notebook. Add the a11yscout repo + Dev|Journal post to the notebook.

## Q4: ACM Web for All 2026 — LLM-generated code barriers paper

**A:** Not in notebook sources. Web-search confirms a ResearchGate preprint exists: "When LLM-Generated Code Perpetuates User Interface Accessibility Barriers, How Can We Break the Cycle?" — the paper compares ChatGPT and Claude with accessibility-agnostic vs accessibility-oriented prompts against WCAG 2.1 criteria. Finding: accessibility-oriented prompts increase success counts and reduce violation rates, but persistent barriers remain — particularly in semantic structure.

**Citations:**
- [ACM DL paper](https://dl.acm.org/doi/10.1145/3744257.3744266)
- [ResearchGate preprint](https://www.researchgate.net/publication/396615736_When_LLM-Generated_Code_Perpetuates_User_Interface_Accessibility_Barriers_How_Can_We_Break_the_Cycle)

**Coverage status:** Preprint now confirmed available — add the ResearchGate link to the notebook for full extraction.

## Q5: WCAG 3.0 "disability information privacy" — overlay vendor conflict

**A:** Notebook confirms WCAG 3.0 is rethinking its scoring model (Smashing — Prosmitskiy, May 2025) and notes the March 2026 Working Draft, but does NOT mention a specific "disability information privacy" outcome or overlay vendor conflict. The 174-outcomes draft entered notebook on 2026-05-08 via the broad sweep but the privacy outcome detail was not deeply extracted.

**Citations:**
- [Smashing — WCAG 3.0's Proposed Scoring Model](https://www.smashingmagazine.com/2025/05/wcag-3-proposed-scoring-model/)
- [W3C WCAG 3.0 March 2026 WD](https://www.w3.org/TR/2026/WD-wcag-3.0-20260303/)

**Coverage status:** Partial. Re-prompt: ask the notebook to scan the 174-outcomes draft specifically for the privacy clause.

## Q6: arXiv 2601.06616 SysML v2 traceability — open-source implementation?

**A:** Not in notebook sources. The paper appears in the 2026-05-08 broad-sweep notes but no GitHub or open-source implementation is referenced by the authors as of that capture. Treat as prototype-only proof-of-concept until a repository surfaces.

**Citations:**
- [arXiv:2601.06616](https://arxiv.org/abs/2601.06616)

**Coverage status:** Open thread — schedule a quarterly check for a published implementation.

## Q7: EAA enforcement — US AI UI generator EN 301 549 conformance reports?

**A:** Notebook confirms EAA enforcement began June 28, 2025, with EN 301 549 (WCAG 2.1 AA) as the technical baseline, and that US/Canadian companies serving EU consumers fall under scope. The notebook contains NO evidence that v0, Bolt, Lovable, or Claude Artifacts have published EN 301 549 conformance reports. This is consistent with a broader web check — none of these vendors publish conformance statements on their product pages as of 2026-05-23.

**Citations:**
- [Accessibility.Works — EAA & EN 301 549 Compliance](https://www.accessibility.works/blog/eaa-en301549-compliance-european-accessibility-act/)
- Regional regulatory framework table (notebook source `ee6442c4`)

**Coverage status:** Answered (negative finding — none published).

## Q8: Deque Axe MCP Server — rule coverage vs axe-core CLI + WCAG 2.2 SCs

**A:** Notebook lists the Axe MCP Server in Deque's product blog ("one-click accessibility fixes right in your IDE") but does not enumerate rule coverage. Web-search corroborates: Axe MCP Server is powered by the Axe DevTools engine (so it inherits axe-core's rule set, including 4.11.x WCAG 2.2 SCs for focus appearance 2.4.11/12 and accessible authentication 3.3.8). Now bundled into Axe DevTools for Web at no extra cost; web-only currently, with native mobile planned.

**Citations:**
- [Deque — Axe MCP Server product page](https://www.deque.com/axe/mcp-server/)
- [Deque Blog — Axe DevTools for Web now includes Axe MCP Server](https://www.deque.com/blog/axe-devtools-for-web-now-includes-axe-mcp-server-for-earlier-fixes-and-faster-delivery/)
- [axe-mcp-server-public GitHub](https://github.com/dequelabs/axe-mcp-server-public)

**Coverage status:** Answered (inherits axe-core 4.11.x rule set — includes new WCAG 2.2 SCs).

## Q9: ARIA misuse on AI vendor sites — Anthropic / Google DeepMind / Microsoft Copilot?

**A:** Notebook contains Adrian Roselli's "OpenAI, ARIA, and SEO: Making the Web Worse" (Oct 2025, updated April 2026) but no parallel documentation for Anthropic, Google DeepMind, or Microsoft Copilot sites. This is a documented gap — none of the cited a11y practitioners (Roselli, Bailey, Sutton) have published similar audits for other AI vendor sites.

**Citations:**
- [Adrian Roselli — OpenAI, ARIA, and SEO: Making the Web Worse](https://adrianroselli.com/2025/10/openai-aria-and-seo-making-the-web-worse.html)

**Coverage status:** Negative finding (no published audits for other vendors). Confirms the ideas-feed item "ARIA misuse taxonomy for LLM vendor sites" has open research space.

## Q10: "Vibe fixing" — evidence base for AI-assisted remediation vs manual axe-core

**A:** Not in notebook sources. The Deque "vibe fixing" blog appears in the 2026-05-08 LinkedIn-signal note but no controlled comparison data has been published. Treat as a coined-term campaign without empirical backing yet — the ideas-feed "Vibe fixing prompt template library" could itself produce the first data points.

**Citations:**
- [Deque Blog — vibe fixing post (May 2026)](https://www.deque.com/blog/)

**Coverage status:** Open — no controlled study published. Add to quarterly literature watch.

---

## Source-curator hand-off

The notebook returned "not in sources" for prompts 3, 4, 6, 10 and partial coverage for 1, 5. To unblock follow-up runs, `source-curator` should add the following URLs to notebook `82ca706a-9065-462f-9f1f-b6941b32f6b6`:

1. `https://www.w3.org/TR/coga-conversational-interfaces-research/` (COGA Voice module)
2. `https://earezki.com/ai-news/2026-04-24-audit-wcag-21-accessibility-on-every-pull-request-free-github-action/` (a11yscout)
3. `https://www.researchgate.net/publication/396615736` (Web for All 2026 LLM barriers preprint)
4. `https://github.com/dequelabs/axe-mcp-server-public` (Axe MCP Server source-of-truth)
5. `https://www.deque.com/blog/a-closer-look-at-axe-mcp-server/` (Axe MCP Server deep-dive)
6. `https://arxiv.org/abs/2601.06616` (SysML v2 paper — direct PDF)
