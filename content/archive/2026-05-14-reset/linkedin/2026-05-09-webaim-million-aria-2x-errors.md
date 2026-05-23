---
platform: linkedin
status: archived
date: 2026-05-09
slug: webaim-million-aria-2x-errors
format: insight
calendar_slot: "Reactive — WebAIM 2026 Million Report"
research_ref: research/domains/accessibility-ai/notes/2026-05-08-linkedin-signal.md
hashtags: ["#accessibility", "#a11y", "#aria", "#wcag", "#aicoding"]
image_prompt: "A data visualization on a dark navy background showing a large '95.9%' in bright cyan, with a smaller '56,000,000 errors' subtitle below in muted white. To the right, two stacked horizontal bars labeled 'no ARIA' and 'with ARIA', the second bar twice as long and tinted red. Clean monospace labels, sharp edges, developer aesthetic, no people, accessible color palette."
humanized: true
humanized_at: "2026-05-08T00:00:00Z"
archived_at: 2026-05-14T09:51:57Z
---

95.9% of the top 1 million home pages still fail WCAG. That's from the WebAIM 2026 Million Report, out this month.

56 million distinct errors across 1 million pages. ARIA adoption is up 18.5% year over year. Pages using ARIA average 2x more accessibility errors than pages without it.

Read that twice.

ARIA was supposed to make complex widgets accessible. When teams reach for it, the failure rate doubles.

Why is it getting worse? The accessibility community on LinkedIn keeps landing on the same answer: AI coding tools. Every major model in 2026 is fluent at generating ARIA roles, states, and properties. They drop `role="button"` on divs. They add `aria-label` to elements that already have visible text. They reach for `aria-hidden="true"` on content that should be readable. The patterns look correct because they were everywhere in training data.

Adrian Roselli, Eric Bailey, and Marcy Sutton have all picked up the 2x figure this week. WebAIM isn't framing it as an AI problem outright, but the trend line is hard to ignore. ARIA usage and ARIA-related errors are climbing together.

The boring fix still works. Use semantic HTML first. `<button>` before `<div role="button">`. Native `<dialog>` before custom `aria-modal` patterns. Test with a real screen reader before you ship.

What are you seeing in your own AI-generated code: more ARIA, or less?

Source: research/domains/accessibility-ai/notes/2026-05-08-linkedin-signal.md
