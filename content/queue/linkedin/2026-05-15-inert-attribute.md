---
platform: linkedin
status: ready
date: 2026-05-15
slug: inert-attribute
format: framework
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#html", "#webdev"]
image_prompt: "Vertical numbered framework card on dark background: five rules listed in white monospace text. Rule 2 and Rule 4 highlighted in amber to signal 'common mistake'. A small keyboard icon beside Rule 5 ('Press Tab'). At the top, two code pills side by side: 'aria-hidden=true' crossed out in red, 'inert' checkmarked in green. Clean technical infographic style, high-contrast, no decorative imagery."
---

`inert` has been Baseline since 2023. Most teams still ship `aria-hidden="true"` on modal backgrounds. Those two attributes are not the same thing.

Here's a five-rule framework for when to use `inert`, and why the AI-generated default is wrong.

Rule 1: Use `inert` on any container whose contents should be unreachable while something else holds focus. Open modal: background content gets `inert`. Off-canvas menu slides in: the page behind it gets `inert`. Accordion panel collapses: add `inert` if you don't want it tabbable while closed.

Rule 2: `aria-hidden="true"` alone is a keyboard trap in reverse. It hides the background from AT. Keyboard users can still Tab into every button and link behind the modal. That's a WCAG 2.4.3 Focus Order failure. Scanners won't flag it. Users will find it.

Rule 3: If you use `<dialog>` with `showModal()`, the browser applies the inert-equivalent behavior for you automatically. You don't have to think about it. This is the single best reason to prefer native `<dialog>` over a hand-rolled implementation.

Rule 4: AI code generators get this wrong almost universally. The scaffolds from v0, Bolt, and Lovable typically apply `aria-hidden="true"` to the page body when the modal opens. Background content disappears from AT. Focus does not stay inside. Keyboard users escape the modal on their first Tab press.

Rule 5: Test it yourself in 30 seconds. Open your modal. Press Tab repeatedly. If focus ever reaches a button or link behind the modal, you have `aria-hidden`. Not `inert`.

The fix is one attribute on the right container. The diagnosis is one keyboard test.

Open your modal. Press Tab. Where does focus go?

Source: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
