---
platform: linkedin
status: archived
date: 2026-05-12
slug: vibe-fixing-counter-movement
format: framework
calendar_slot: "Week 2 Tue — vibe fixing as a practice"
research_ref: research/domains/accessibility-ai/notes/2026-05-08-linkedin-signal.md
hashtags: ["#vibefixing", "#a11y", "#wcag", "#axedevtools", "#aiaccessibility"]
image_prompt: "Split-panel illustration on dark navy background. Left panel labeled 'Vibe coding' shows a chaotic stream of code with red WCAG violation markers scattered through it. Right panel labeled 'Vibe fixing' shows the same code cleaned up, with a green check on each previously red marker, an axe-core sidebar visible. Clean technical aesthetic, monospace labels, no people, accessible high-contrast palette."
humanized: true
humanized_at: "2026-05-08T00:00:00Z"
archived_at: 2026-05-14T09:51:57Z
---

The accessibility community has a new term, and it is a good one. Vibe fixing.

Deque coined it this month as a direct counter to "vibe coding," the habit of shipping AI-generated code without checking it for quality, security, or accessibility. Sarah Mercier put it on LinkedIn with concrete examples. The framing is sharp: if AI is writing most of the code now, the accessibility field cannot just point at the output and complain. It has to use the same tools to fix what AI breaks.

Vibe fixing is exactly what it sounds like. You let an AI tool generate the UI. Then you point a second AI loop at the result, axe DevTools or another scanner in the loop, and prompt it to remediate. Deque is wiring this directly into axe DevTools workflows so the fix loop runs in the same context the original code was generated in.

The cultural shift underneath this is what gets me. For two years the accessibility conversation around AI has been mostly defensive. Bad alt text. ARIA hallucinations. Custom widgets that no screen reader can parse. Vibe fixing changes the posture. AI is not just the source of the problem, it is also the surface for the fix. The tools that scaled the failure can scale the repair.

It will not solve everything. The 31% automated coverage ceiling on WCAG criteria still applies, so vibe fixing handles the mechanical issues, not the cognitive or judgment ones. But for the long tail of color contrast failures, missing labels, and ARIA misuse, it is the most practical idea I have come across this year.

Are you running an accessibility loop on your AI-generated code yet, or still catching it at review?

Source: research/domains/accessibility-ai/notes/2026-05-08-linkedin-signal.md
