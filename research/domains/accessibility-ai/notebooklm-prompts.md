# NotebookLM prompts — Accessibility AI

One question per line. `notebooklm-bridge` picks the top N unanswered, queries the notebook, and appends `  [answered YYYY-MM-DD]` after the line on success.

Example format (uncomment to use):
<!--
What does the latest WCAG 2.2 guidance say about focus appearance? [answered 2026-04-30]
-->

How well do GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro compare on alt-text quality across the WebAIM image-corpus benchmark?
What WCAG success criteria are most frequently violated in v0 / Bolt / Lovable-generated React apps?
Are there published studies on screen reader users' preferences for AI-generated vs. human-authored alt text?
What specific ARIA patterns from APG 1.3 are most often misused by LLM-generated component code?
How does cognitive load (per COGA) shift when LLM-driven UIs use dynamic layout vs. static templates?
