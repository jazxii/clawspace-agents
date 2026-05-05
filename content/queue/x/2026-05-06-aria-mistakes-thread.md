---
platform: x
status: drafting
date: 2026-05-06
slug: aria-mistakes-thread
format: thread
slot: afternoon
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
topic: 6 ARIA mistakes AI code generators keep making
hashtags: ["#a11y", "#aria"]
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

## 1

6 ARIA mistakes I keep seeing in AI-generated code.

Each one passes automated checks. Each one confuses screen readers.

## 2

Mistake 1: `<div role="dialog">` without `aria-modal="true"`

The background stays interactive. Keyboard users tab into elements that look disabled.

Fix: use `<dialog>` with `showModal()`. It's native. It's Baseline.

## 3

Mistake 2: `<div role="button">` instead of `<button>`

You lose native keyboard support. Now you're writing Enter/Space handlers by hand.

Fix: just use `<button>`. If it acts like a button, it is a button.

## 4

Mistake 3: `aria-label` on a `<div>` with no role

VoiceOver announces it. NVDA ignores it. Per spec, NVDA is correct.

Fix: add a role or use visible text. ARIA doesn't create semantics out of nothing.

## 5

Mistake 4: `aria-hidden="true"` on background content without `inert`

The content is hidden from screen readers but still keyboard-focusable.

Fix: use the `inert` attribute. It's the correct semantic and behavioral solution.

## 6

Mistake 5: `role="navigation"` on a `<div>` when `<nav>` exists

Redundant. Adds parsing cost for assistive tech.

Fix: use `<nav>`. Native HTML elements already have roles.

## 7

Mistake 6: `aria-expanded` managed manually when `<details>` would handle it natively

State sync bugs. Fails WCAG 4.1.2 Name, Role, Value.

Fix: `<details>` and `<summary>` manage `aria-expanded` automatically. Use them.

## 8

First rule of ARIA: don't use ARIA.

If a native HTML element does what you need, use it.

AI tools are teaching us what happens when we ignore that rule.
