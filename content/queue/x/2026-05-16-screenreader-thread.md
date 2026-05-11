---
platform: x
status: ready
date: 2026-05-16
slug: screenreader-thread
format: thread
slot: afternoon
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
topic: VoiceOver vs NVDA behavior gaps on the same markup
hashtags: []
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

## 1

Same markup. Different screen reader UX.

VoiceOver and NVDA don't always agree on what to announce. Here are 5 gaps that catch developers off guard.

## 2

Gap 1: `<ul>` with `list-style: none`

Safari + VoiceOver strips the list role. NVDA + Firefox preserves it.

Workaround: add `role="list"` manually or use `list-style-type: "\200B"` in CSS.

## 3

Gap 2: `aria-label` on a `<div>` with no role

VoiceOver announces the label. NVDA ignores it.

Per spec, NVDA is correct. ARIA labels need a role to be valid.

## 4

Gap 3: `<button>` with `aria-labelledby` pointing to hidden text

VoiceOver reads the hidden text. NVDA may skip it depending on how it's hidden.

Fix: use `aria-label` or make the text visually-hidden (not `display: none`).

## 5

Gap 4: Focus order in modals

VoiceOver moves focus to the first focusable element on modal open. NVDA sometimes announces the modal container first, then moves focus.

Fix: Explicitly set focus to the close button or first interactive element.

## 6

The spec doesn't define everything. Browser + AT combinations fill in the gaps differently.

Test with both. Or accept that "works in VoiceOver" doesn't mean "works everywhere."
