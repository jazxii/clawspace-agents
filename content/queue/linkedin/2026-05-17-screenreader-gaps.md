---
platform: linkedin
status: ready
date: 2026-05-17
slug: screenreader-gaps
format: insight
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#screenreader", "#wcag", "#testing"]
image_prompt: "Split-screen comparison on dark background. Left panel: macOS window showing VoiceOver output with Apple logo, announcing list semantics correctly. Right panel: Windows interface showing NVDA output with NVDA logo, treating same markup as generic div. Centered between them: HTML snippet '<ul style=\"list-style: none\">' with a warning icon. Clean technical layout, terminal-style text output, no photographs, no faces."
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

Same markup. Different screen readers. Completely different user experience.

I test with VoiceOver on Mac because it's convenient. Then I spin up a Windows VM and run NVDA.

Half the time, I find behavior gaps that break the interface.

Here are the 5 most common divergences that catch developers off guard:

**1. List semantics with `list-style: none`**
Safari + VoiceOver strips the list role from `<ul>` elements when you remove the bullets.
NVDA + Firefox keeps it.
Fix: add `role="list"` manually or use `list-style-type: "\200B"` in CSS.

**2. `aria-label` on a `<div>` with no role**
VoiceOver announces the label. NVDA ignores it. Per spec, NVDA is correct.
Fix: only use `aria-label` on elements with semantic roles.

**3. Focus behavior on `<dialog>` close**
VoiceOver returns focus to the trigger element. JAWS sometimes doesn't.
Fix: explicitly manage focus with `.focus()` on close, don't rely on browser defaults.

**4. Button vs link semantics**
VoiceOver announces "button" and "link" distinctly. NVDA adds context ("clickable" for links).
User expectation: buttons do things, links go places. If you use `<a role="button">`, you're sending mixed signals.

**5. Live region politeness levels**
`aria-live="polite"` on NVDA waits for the user to stop interacting. VoiceOver interrupts sooner.
Fix: test both. If timing matters, use `role="status"` or `role="alert"` for consistency.

**The takeaway:**
Testing only in VoiceOver (or only in NVDA) gives you half the picture. Behavior gaps are real and they break user trust.

Minimum viable test matrix: NVDA + Firefox on Windows, VoiceOver + Safari on Mac.

What screen reader gap has surprised you most?
