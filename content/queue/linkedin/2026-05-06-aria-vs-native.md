---
platform: linkedin
status: ready
date: 2026-05-06
slug: aria-vs-native
format: insight
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#html", "#aria", "#webdev"]
image_prompt: "Split-screen code comparison on dark charcoal background. Left side: HTML snippet showing '<div role=\"dialog\" aria-modal=\"true\">' with manual focus trap JavaScript below, labeled '❌ Manual ARIA'. Right side: '<dialog>' with '.showModal()' method call, labeled '✓ Native HTML'. Syntax highlighting in muted blues and greens. Terminal-inspired monospace font. Clean separation line between the two panels."
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

Native `<dialog>` has been Baseline across browsers since 2023.

AI code generators are still scaffolding `<div role="dialog">` with hand-rolled focus traps.

Here's what you get free with `<dialog>` and `.showModal()`:

• `aria-modal="true"` applied automatically
• Focus moves to the dialog on open
• Background content becomes inert (not just aria-hidden, actually non-interactive)
• Escape key closes the dialog
• Focus returns to the trigger element on close

The manual ARIA version? You're writing JavaScript for all of that. And you're probably getting at least one wrong.

The most common AI-generated mistake: `aria-hidden="true"` on background content without `inert`. Screen reader users can't see the background. Keyboard users can still tab to it. That's a WCAG 2.4.3 Focus Order violation.

I audited three apps built with v0 last month. All three had modals. All three used `<div role="dialog">`. None of them properly managed background interactivity.

The APG Dialog Modal pattern now explicitly says: if you can use `<dialog>`, use `<dialog>`. The ARIA pattern exists for backwards compatibility, not new code.

Why are AI tools still teaching manual ARIA patterns when the native element does it better?

Probably because their training data has a decade of pre-Baseline Stack Overflow answers.

Have you caught AI-generated code using manual ARIA where native HTML would work?
