---
platform: linkedin
status: archived
date: 2026-05-14
slug: dialog-jaws-story
format: story
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#screenreader", "#dialog", "#wcag"]
image_prompt: "A numbered list graphic on dark background showing three JAWS edge cases with native dialog: '1. Double-announced title: remove aria-labelledby', '2. Silent focus return on Escape: add role=status toast', '3. Link trigger announces link+dialog: use button instead'. Each item has a small before/after code snippet in monospace font. Subtle JAWS logo watermark in corner. High-contrast accessible color palette."
humanized: true
humanized_at: "2026-05-05T00:00:00Z"
archived_at: 2026-05-14T09:51:57Z
---

We swapped `<div role="dialog">` for native `<dialog>`. Felt like a one-line fix. JAWS surfaced three things nobody documents.

Our old setup had a custom focus trap, manual `aria-modal="true"`, and a ref to call `.focus()` on open. It worked in NVDA. It worked in VoiceOver. Nobody had tested it in JAWS.

So we shipped native `<dialog>` with `showModal()`. One element. Zero focus-trap JavaScript. The browser handles inert background, focus management, and ARIA modal semantics automatically. Felt like found money.

Then came the JAWS session.

Issue one: JAWS announced the dialog title twice. The heading inside was also referenced by `aria-labelledby` on the dialog element. The heading gets announced when focus lands inside anyway. The redundant reference created a double-read. Fix: remove the `aria-labelledby`. The heading is enough.

Issue two: Pressing Escape closed the dialog correctly. JAWS did not announce focus returning to the trigger. NVDA does this on its own. JAWS needed a push. We added a `role="status"` region that fires "Dialog closed" on dismiss. Small change, but it made the experience consistent across AT.

Issue three: One dialog opened from an `<a>` tag with `role="button"` on it. JAWS announced "link, dialog" before reading the title. Confusing dual semantic. The fix was upstream: the trigger should have been a `<button>`. Adrian Roselli puts it well: if you're adding ARIA to a link, ask yourself why. The answer is usually that you need a button.

None of these were JAWS bugs. They were signals pointing to markup we should have fixed anyway.

Native `<dialog>` is still the right call. What edge case did your AT testing surface that the spec docs missed?

Source: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
