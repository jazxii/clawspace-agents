# NotebookLM prompts — Accessibility AI

One question per line. `notebooklm-bridge` picks the top N unanswered, queries the notebook, and appends `  [answered YYYY-MM-DD]` after the line on success.

Example format (uncomment to use):
<!--
What does the latest WCAG 2.2 guidance say about focus appearance? [answered 2026-04-30]
-->

How well do GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro compare on alt-text quality across the WebAIM image-corpus benchmark?  [staged for manual 2026-05-04]
What WCAG success criteria are most frequently violated in v0 / Bolt / Lovable-generated React apps?  [staged for manual 2026-05-04]
Are there published studies on screen reader users' preferences for AI-generated vs. human-authored alt text?  [staged for manual 2026-05-04]
What specific ARIA patterns from APG 1.3 are most often misused by LLM-generated component code?  [staged for manual 2026-05-04]
How does cognitive load (per COGA) shift when LLM-driven UIs use dynamic layout vs. static templates?  [staged for manual 2026-05-04]

# Staged 2026-05-02 — Cognitive load and Neurodiversity x Accessibility
What does WCAG 2.2 SC 3.3.8 (Accessible Authentication, Minimum) explicitly require, and which auth patterns satisfy it without relying on cognitive function tests?  [staged for manual 2026-05-04]
What concrete practices from W3C COGA "Making Content Usable" are most often missing in AI-generated UIs (v0, Bolt, Lovable)?  [staged for manual 2026-05-04]
Which research studies in 2024–2025 measured cognitive load reduction from plain-language rewrites in product UI strings?  [staged for manual 2026-05-04]
What are the most cited UX patterns for ADHD-friendly form design (re-entry, autosave, progress indication)?  [staged for manual 2026-05-04]
How do dyslexia-friendly typography recommendations (line-height, line-length, font choice) hold up under recent empirical scrutiny?  [staged for manual 2026-05-04]

# Staged 2026-05-04 — Alt-text benchmarks, ARIA/popover evolution, scanner advances, WCAG 3.0 contrast
What evaluation rubric would be most valid for comparing LLM-generated alt text — BLEU/ROUGE, human preference rating, or task-completion by screen reader users? Which accessibility researchers are working on this?  [staged 2026-05-04]
Does the Popover API's native ARIA handling (aria-expanded, aria-popup, aria-controls) apply in all Baseline browsers including Safari 17+ and Firefox 125+? Are there known edge cases where the native handling fails and manual ARIA is still needed?  [staged 2026-05-04]
If WCAG 3.0's scoring model replaces binary pass/fail, how do AI-generated UI tools need to change their output — do they score themselves or generate self-documented deviation rationale?  [staged 2026-05-04]
