---
platform: instagram
status: ready
date: 2026-05-15
slug: inert-snippet
format: single-image
topic: "Annotated code snippet — inert applied correctly vs. incorrectly"
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
calendar_slot: "Week 2 Fri — Instagram single image"
hashtags:
  - "#accessibility"
  - "#a11y"
  - "#webdev"
  - "#wcag"
  - "#htmltips"
  - "#inertattribute"
  - "#ariapatterns"
  - "#focusmanagement"
  - "#accessibilitytesting"
  - "#frontenddevelopment"
  - "#inclusivedesign"
  - "#wcag22"
  - "#keyboardnavigation"
  - "#screenreader"
  - "#codesnippet"
image_prompt: "Dark navy background, split-panel code editor image. Left panel has a red X badge in top corner, showing JavaScript code: document.body.setAttribute('aria-hidden', 'true'). Red annotation label reads: 'Hides from AT — Tab still reaches background buttons. Fails WCAG 2.4.3.' Right panel has a green check badge, showing the modal handler with inert applied to a page wrapper div, modal element outside the wrapper. Green annotation label reads: 'Removed from AT AND tab order. Correct.' Bottom strip in lighter navy shows footnote text: 'Native <dialog>.showModal() does this for you. Rolling your own modal? Do this manually.' Monospace font, high-contrast syntax highlighting, no people, no stock imagery."
humanized: false
---

## Caption

If your modal opens and Tab takes the user behind it, the bug is one attribute away from a fix.

`aria-hidden="true"` on the page body hides content from assistive technology — but it does not remove it from the keyboard tab order. A keyboard user pressing Tab will still reach background buttons and links. That fails WCAG 2.4.3 (Focus Order).

The correct attribute is `inert`. Applied to the page wrapper (with the modal outside it), `inert` removes every descendant from both the AT tree and the tab order simultaneously. One attribute. Two problems solved.

AI-generated modals almost always reach for `aria-hidden` first. It's the more familiar pattern. But familiarity isn't correctness — and this gap is exactly what screen reader testers catch that automated scanners don't.

The one-line test: open your modal, press Tab, watch where focus goes. If it lands somewhere behind the modal, you need `inert`, not `aria-hidden`.

Save this for your next code review.
