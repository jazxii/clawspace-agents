# NotebookLM onboarding staging — accessibility-ai — 2026-05-05

**Mode**: Tier 3 — manual staging (MCP tools absent, Bash unavailable)
**Prepared by**: notebooklm-bridge
**Date**: 2026-05-05

---

## Part 1 — Create the Notebook

In NotebookLM (https://notebooklm.google.com):

1. Click **New notebook**.
2. Set the title to: `Accessibility AI — Research Domain`
3. Copy the notebook ID from the URL (format: `https://notebooklm.google.com/notebook/<notebook_id>`) and paste it into `research/domains/accessibility-ai/PRD.md` under the `notebook_id:` field.

---

## Part 2 — Add Tier 1 Sources

Add these 6 sources to the notebook (use **Add source → Website**):

1. https://www.w3.org/WAI/news/
2. https://adrianroselli.com/
3. https://www.sarasoueidan.com/blog/
4. https://www.smashingmagazine.com/category/accessibility/
5. https://www.deque.com/blog/
6. https://www.tpgi.com/blog/

---

## Part 3 — Run These 13 Prompts

Paste each prompt into the notebook's query box. Paste the responses into:
`research/domains/accessibility-ai/notes/2026-05-05-notebooklm.md`

Then return here and confirm so the notebooklm-bridge can mark them `[answered 2026-05-05]`.

---

### Prompt 1
How well do GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro compare on alt-text quality across the WebAIM image-corpus benchmark?

### Prompt 2
What WCAG success criteria are most frequently violated in v0 / Bolt / Lovable-generated React apps?

### Prompt 3
Are there published studies on screen reader users' preferences for AI-generated vs. human-authored alt text?

### Prompt 4
What specific ARIA patterns from APG 1.3 are most often misused by LLM-generated component code?

### Prompt 5
How does cognitive load (per COGA) shift when LLM-driven UIs use dynamic layout vs. static templates?

### Prompt 6
What does WCAG 2.2 SC 3.3.8 (Accessible Authentication, Minimum) explicitly require, and which auth patterns satisfy it without relying on cognitive function tests?

### Prompt 7
What concrete practices from W3C COGA "Making Content Usable" are most often missing in AI-generated UIs (v0, Bolt, Lovable)?

### Prompt 8
Which research studies in 2024–2025 measured cognitive load reduction from plain-language rewrites in product UI strings?

### Prompt 9
What are the most cited UX patterns for ADHD-friendly form design (re-entry, autosave, progress indication)?

### Prompt 10
How do dyslexia-friendly typography recommendations (line-height, line-length, font choice) hold up under recent empirical scrutiny?

### Prompt 11
What evaluation rubric would be most valid for comparing LLM-generated alt text — BLEU/ROUGE, human preference rating, or task-completion by screen reader users? Which accessibility researchers are working on this?

### Prompt 12
Does the Popover API's native ARIA handling (aria-expanded, aria-popup, aria-controls) apply in all Baseline browsers including Safari 17+ and Firefox 125+? Are there known edge cases where the native handling fails and manual ARIA is still needed?

### Prompt 13
If WCAG 3.0's scoring model replaces binary pass/fail, how do AI-generated UI tools need to change their output — do they score themselves or generate self-documented deviation rationale?

---

## After Running Prompts

Confirm to the notebooklm-bridge agent (or re-invoke it) with the notebook ID and the response file path. The bridge will then:
- Mark each prompt `[answered 2026-05-05]` in `notebooklm-prompts.md`
- Post a done message to `bus/research.jsonl`
