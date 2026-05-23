---
platform: linkedin
status: archived
date: 2026-05-09
slug: wcag3-contrast-now
format: framework
calendar_slot: "Reactive — WCAG 3.0 contrast status"
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#designsystems", "#contrast"]
image_prompt: "A split design comparison: left side shows clean tokenized color swatches labeled '4.5:1' and '3:1' on a clean grid, right side shows a faded 'APCA' label crossed out lightly with a question mark next to '2030?'. Minimal flat illustration, accessible blue and amber palette, no people."
humanized: true
humanized_at: "2026-05-07T10:00:00Z"
archived_at: 2026-05-14T09:51:57Z
---

WCAG 3.0 still does not have a contrast algorithm. The April 2026 editor's draft says it is "yet to be determined." Multiple W3C contributors now place final publication no earlier than 2030.

If your design system has been quietly using APCA ratios for token validation, this is your nudge.

APCA was removed from the WCAG 3 working draft in mid-2023. It has not returned. It remains a useful research tool. It is not, and may never be, the compliance standard.

Here is the framework I am using for design tokens in 2026.

For body text and UI labels, validate against WCAG 2.x: 4.5:1 minimum for normal text, 3:1 for large text. Non-text UI components like focus rings, input borders, and icons need 3:1 against their background.

For tooling, run a contrast check on every token pair at build time. Style Dictionary plus a small validator script catches drift before it ships.

For brand and marketing surfaces where APCA reads more accurately, use it as a secondary check. Never the primary one. If a swatch passes APCA but fails WCAG 2.x 4.5:1, treat it as a fail.

For AI design tools that auto-generate palettes, audit the focus-ring token first. That is the one I see fail most often. v0 and Lovable both default to subtle focus rings that score under 2:1 on light backgrounds.

WCAG 3 will land eventually. Probably with something different from both APCA and the 4.5:1 model. Building for it today is premature optimization.

Build for the standard that actually applies.

What is your team using to validate contrast on design tokens right now?

Source: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
