# NotebookLM prompts — Accessibility AI

One question per line. `notebooklm-bridge` picks the top N unanswered, queries the notebook, and appends `  [answered YYYY-MM-DD]` after the line on success.

Example format (uncomment to use):
<!--
What does the latest WCAG 2.2 guidance say about focus appearance? [answered 2026-04-30]
-->

How well do GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro compare on alt-text quality across the WebAIM image-corpus benchmark?  [answered 2026-05-07]
What WCAG success criteria are most frequently violated in v0 / Bolt / Lovable-generated React apps?  [answered 2026-05-07]
Are there published studies on screen reader users' preferences for AI-generated vs. human-authored alt text?  [answered 2026-05-07]
What specific ARIA patterns from APG 1.3 are most often misused by LLM-generated component code?  [answered 2026-05-07]
How does cognitive load (per COGA) shift when LLM-driven UIs use dynamic layout vs. static templates?  [answered 2026-05-07]

# Staged 2026-05-02 — Cognitive load and Neurodiversity x Accessibility
What does WCAG 2.2 SC 3.3.8 (Accessible Authentication, Minimum) explicitly require, and which auth patterns satisfy it without relying on cognitive function tests?  [answered 2026-05-07]
What concrete practices from W3C COGA "Making Content Usable" are most often missing in AI-generated UIs (v0, Bolt, Lovable)?  [answered 2026-05-07]
Which research studies in 2024–2025 measured cognitive load reduction from plain-language rewrites in product UI strings?  [answered 2026-05-07]
What are the most cited UX patterns for ADHD-friendly form design (re-entry, autosave, progress indication)?  [answered 2026-05-07]
How do dyslexia-friendly typography recommendations (line-height, line-length, font choice) hold up under recent empirical scrutiny?  [answered 2026-05-07]

# Staged 2026-05-04 — Alt-text benchmarks, ARIA/popover evolution, scanner advances, WCAG 3.0 contrast
What evaluation rubric would be most valid for comparing LLM-generated alt text — BLEU/ROUGE, human preference rating, or task-completion by screen reader users? Which accessibility researchers are working on this?  [answered 2026-05-07]
Does the Popover API's native ARIA handling (aria-expanded, aria-popup, aria-controls) apply in all Baseline browsers including Safari 17+ and Firefox 125+? Are there known edge cases where the native handling fails and manual ARIA is still needed?  [answered 2026-05-07]
If WCAG 3.0's scoring model replaces binary pass/fail, how do AI-generated UI tools need to change their output — do they score themselves or generate self-documented deviation rationale?  [answered 2026-05-07]

# Staged 2026-05-07 — COGA voice modules, ADA Title II extension, hybrid testing, screen reader + LLM
What specific cognitive accessibility requirements does the W3C COGA Voice Systems and Conversational Interfaces research module identify for AI chatbot and voice UI design? Are there failure modes unique to LLM-generated conversational responses?  [answered 2026-05-23]
How does the DOJ ADA Title II one-year extension affect enforcement posture — are active complaints being paused, or does the extension only apply to the initial compliance clock?  [answered 2026-05-23]
Does the a11yscout GitHub Action catch the same violation categories as axe DevTools, or does it expose a different rule subset? What is its false-positive rate compared to axe-core 4.11.x?  [answered 2026-05-23]

# Staged 2026-05-08 — EAA enforcement, WCAG 3.0 privacy outcome, overlay compliance, arXiv 2601.06616
The ACM Web for All 2026 paper on LLM-generated code perpetuating accessibility barriers is paywalled — what barrier categories and intervention points does it identify? Is a preprint available?  [answered 2026-05-23]
WCAG 3.0's new "disability information privacy" outcome prevents disclosure of disability data to third-party algorithms — does this create a direct conflict with accessibility overlay tools that transmit user preference data to external servers? Which overlay vendors would be affected?  [answered 2026-05-23]
The arXiv 2601.06616 SysML v2 traceability approach for LLM-generated accessible interfaces — has this been implemented in any open-source tool or GitHub repository, or is it a prototype-only proof of concept?  [answered 2026-05-23]
With EAA enforcement active since June 2025, are any US-based AI UI generators (v0, Bolt, Lovable, Claude Artifacts) publishing EN 301 549 conformance reports or actively working toward documented compliance?  [answered 2026-05-23]

# Staged 2026-05-08 — LinkedIn signal findings
The Deque Axe MCP Server exposes axe-core as an MCP tool for inline AI coding assistant use — what is its rule coverage vs. axe-core CLI, and does it support WCAG 2.2 SCs introduced in axe-core 4.11.x?  [answered 2026-05-23]
OpenAI.com was documented using aria-hidden on visible content and ARIA roles for SEO manipulation — are there other major AI vendor sites (Anthropic, Google DeepMind, Microsoft Copilot) that show the same ARIA misuse patterns? What tooling could automate this check?  [answered 2026-05-23]
The "vibe fixing" counter-practice coined by Deque — what is the evidence base for AI-assisted remediation workflows being faster or more reliable than manual axe-core review? Are there controlled comparisons?  [answered 2026-05-23]

# Staged 2026-05-23 — Fresh signal open threads (broad sweep follow-ups)
The WCAG 3.0 March 2026 174-outcome WD's "disability information privacy" clause — what is the verbatim outcome text, and does it specifically name third-party algorithmic processing of disability indicators? Which overlay vendors would be in scope?  [answered 2026-05-28]
Are any HHS-funded healthcare entities publicly stating they will miss the May 11, 2026 web accessibility deadline (which the DOJ IFR did NOT extend)? Any disclosed remediation roadmaps that admit slippage?  [answered 2026-05-28]
WebAccessBench's 19-model digital accessibility evaluation (Feb 2026) — which specific models had the steepest "Unguided → Expert" deltas, and which models were the worst absolute performers regardless of guidance level?  [answered 2026-05-28]
