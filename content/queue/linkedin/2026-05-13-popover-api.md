---
platform: linkedin
status: ready
date: 2026-05-13
slug: popover-api
format: insight
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#webdev", "#wcag", "#aria"]
image_prompt: "Two side-by-side browser mockups on a dark background. Left panel labeled 'Popover API' shows an open tooltip-style overlay with the page content behind it still fully visible and keyboard-focusable (indicated by focus rings on background elements). Right panel labeled 'dialog + showModal()' shows a modal overlay with the background content grayed out and marked with a lock icon, indicating inert state. Monospace code labels beneath each panel. Clean, high-contrast technical diagram style."
humanized: true
humanized_at: "2026-05-05T00:00:00Z"
---

The Popover API is Baseline. Most teams using it are building modals with it. Those are not the same thing.

Here's the distinction that matters for screen reader users, and where AI-generated code gets this wrong.

The Popover API handles `aria-expanded`, `aria-popup`, and `aria-controls` for you natively. No more manually syncing state in JavaScript. That's a real win.

But popovers do not make background content inert.

`<dialog>` with `showModal()` does. The browser moves the rest of the page out of the tab order and hides it from AT. Popovers don't. When a popover is open, keyboard users can still tab into every button and link behind it.

AI code generators keep producing "modal-like" overlays built on the Popover API. The ARIA is correct. The behavior is wrong. A keyboard user opens the "modal," presses Tab, and ends up navigating the page behind it. That's a WCAG 2.4.3 Focus Order failure. Scanners won't catch it.

Current AT support: NVDA and JAWS announce popover state changes reliably when `aria-expanded` is in play. VoiceOver on Safari can be inconsistent for dynamic state, and sometimes needs a `role="status"` region to announce reliably. Worth testing before you ship.

The rule I use: if the user must complete an action inside the overlay before returning to the page, that's a dialog. Use `<dialog>`. If the overlay is supplemental content they can ignore, a popover is fine.

When did you last check which of your overlays should actually be `<dialog>` vs. `popover`?

Source: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
