---
platform: linkedin
status: drafting
date: 2026-05-10
slug: openai-aria-hidden-on-itself
format: insight
calendar_slot: "Reactive — Adrian Roselli OpenAI ARIA audit"
research_ref: research/domains/accessibility-ai/notes/2026-05-08-linkedin-signal.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#ariahidden", "#screenreader"]
image_prompt: "A code editor on dark background showing an HTML snippet with `aria-hidden=\"true\"` highlighted in red on a visibly rendered button element. Above the editor, a browser preview shows the same button clearly visible to sighted users. A small annotation arrow connects the two with the label 'invisible to screen readers, visible to everyone else'. Monospace, developer aesthetic, no people, accessible color palette."
humanized: true
humanized_at: "2026-05-08T00:00:00Z"
---

The company whose AI tool millions of developers use to generate UI code cannot get ARIA right on its own homepage.

Adrian Roselli published a teardown of openai.com this week. Two patterns stood out.

First: `aria-hidden="true"` on content that is visually rendered and interactive. Screen readers silently drop the element from the accessibility tree — it's on screen, but it doesn't exist to assistive tech. That's the most foundational ARIA mistake you can make. It violates WCAG 4.1.2 by stripping name and role from a focusable control.

Second: ARIA roles chosen for SEO, not semantics. Roselli flagged elements where the role selection looks like it was made to help search indexing or content extraction, not to communicate meaning to assistive tech. ARIA-as-SEO is a failure category worth tracking on its own. It's exactly the kind of pattern an LLM can produce, because ARIA tokens look semantic and search-relevant at the same time.

Here's why this goes beyond one site. OpenAI ships the SDKs and models that a large share of the dev community uses to generate frontend code. If their production site treats `aria-hidden` as safe to slap on visible content and uses ARIA for SEO, those are the patterns baked into the training signal their models are now reproducing in other people's codebases.

The takeaway isn't "OpenAI is bad at accessibility." It's that no one is exempt from basic ARIA hygiene. The size of your AI lab doesn't protect your users from the 2x error multiplier WebAIM published.

Have you found ARIA misuse on a site you'd expect to know better?
