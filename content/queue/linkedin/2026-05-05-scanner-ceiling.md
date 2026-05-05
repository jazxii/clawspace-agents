---
platform: linkedin
status: ready
date: 2026-05-05
slug: scanner-ceiling
format: insight
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#automatedtesting", "#screenreader"]
image_prompt: "Technical infographic on dark navy background showing a large '57%' in bright cyan with the subtitle 'Automated WCAG Detection Ceiling'. Below, arrange logos of axe-core, Lighthouse, WAVE, and Pa11y scanners in a horizontal row. Clean, minimal design with developer aesthetic — sharp edges, monospace labels. No gradient overlays, no stock imagery, no people."
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

Axe-core finds 57% of WCAG issues automatically. That's the published benchmark from Deque.

The other 43%? You need humans.

Here's what every automated scanner misses:

**Semantic ARIA misuse**
`aria-modal="true"` on a div that isn't actually a modal. Parses correctly. Screen readers get confused anyway.

**Cognitive load violations**
Multi-step forms that re-ask for information (WCAG 3.3.7 Redundant Entry). Time-limited OTPs with no paste option (3.3.8 Accessible Authentication). No scanner flags these.

**Plain language failures**
"An unexpected error occurred while processing your request." Pure jargon. Scanners check contrast and heading order. They don't catch hostile copy.

**Color meaning without text**
"Red items are required." Passes contrast checks. Fails 1.4.1 Use of Color. The scanner sees green, not context.

**Dynamic state changes**
Loading spinners, success toasts, error alerts that animate and disappear. If you're not announcing them with live regions, users miss critical feedback.

I've seen teams ship with Lighthouse scores of 100 and still fail manual audits on half these patterns.

The 57% ceiling is real. Automated tools catch the mechanical stuff. But accessibility that actually works? That takes judgment.

What's the hardest-to-catch failure you've seen slip past automated scanners?
