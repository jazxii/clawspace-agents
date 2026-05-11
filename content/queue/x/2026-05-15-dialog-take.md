---
platform: x
status: ready
date: 2026-05-15
slug: dialog-take
format: standalone
slot: morning
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
topic: Hot take on native dialog vs div role=dialog
hashtags: []
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

`<dialog>` with `showModal()` gives you focus trapping, inert background, and `aria-modal="true"` for free.

`<div role="dialog">` gives you a div with an attribute and 200 lines of script you'll maintain forever.

This isn't a tradeoff. It's a no-brainer.
