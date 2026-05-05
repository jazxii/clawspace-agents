---
platform: instagram
status: ready
date: 2026-05-14
slug: dialog-jaws-reel
format: reel
topic: "Live AT demo concept — <dialog> vs. div[role=dialog] announced differently in JAWS"
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
calendar_slot: "Week 2 Thu — Instagram reel concept"
hashtags:
  - "#accessibility"
  - "#a11y"
  - "#webdev"
  - "#wcag"
  - "#screenreader"
  - "#jaws"
  - "#ariapatterns"
  - "#nativehtml"
  - "#dialogelement"
  - "#accessibilitytesting"
  - "#frontenddevelopment"
  - "#inclusivedesign"
  - "#wcag22"
  - "#focusmanagement"
  - "#htmldialog"
image_prompt: "Dark navy cover frame with bold white headline split across two lines: 'Same modal.' and 'JAWS hears them differently.' A faint code diff of <dialog> vs <div role=dialog> blurred in the background. High contrast, monospace aesthetic, no people."
humanized: true
humanized_at: "2026-05-05T00:00:00Z"
---

## Reel Concept — 30–35 seconds

**Format**: Screen-capture-style demo with visualized AT announcements (text captions showing what JAWS announces, not raw audio). Sequential clips, not side-by-side (easier to read on mobile).

---

### Shot 1 — Cover frame (0–4s)

**Visual**: Dark navy card. Bold white text:

> "Same modal. Two implementations. JAWS hears them differently."

Behind the text: blurred code showing `<div role="dialog">` on left, `<dialog>` on right.

**On-screen text**: Same as above (no voiceover needed — let text carry).

---

### Shot 2 — Implementation A: div[role=dialog] (4–14s)

**Visual**: Code editor pane. `<div role="dialog" aria-modal="true">` visible with a hand-rolled focus trap script below it. Trigger button clicked.

**AT announcement caption strip** (bottom of frame, styled like a subtitle bar):

> "dialog  dialog  (repeated)  dialog  [page title]  OK button"

**On-screen annotation**: "Redundant announcement. JAWS reads the dialog role twice from the wrapper + inner element."

**Voiceover line** (optional, text only): "The hand-rolled version. JAWS stumbles on the double role announcement."

---

### Shot 3 — Implementation B: native dialog (14–23s)

**Visual**: Code editor pane. `<dialog>` with `showModal()` call. Same trigger button clicked.

**AT announcement caption strip**:

> "dialog  [title]  [first focusable element]"

**On-screen annotation**: "Clean. One announcement. Focus lands where it should."

**Voiceover line** (optional, text only): "Native dialog. JAWS gets what it expects."

---

### Shot 4 — Three diff points (23–31s)

**Visual**: Side-by-side annotation graphic. Three labeled rows:

| Issue | div[role=dialog] | native dialog |
|---|---|---|
| Title announcement | Redundant | Clean |
| Close cue | Missing | Automatic |
| Focus return | Manual | Built-in |

Each row appears sequentially with a brief pause.

**On-screen text**: "Three places JAWS diverges. All three fix upstream."

---

### Shot 5 — Close (31–35s)

**Visual**: Dark navy card. White text:

> "Native `<dialog>` is the default. Save this for your next code review."

Small save-icon animation at bottom right.

**On-screen text**: Same as above.

---

## Caption

Same modal. Two implementations. JAWS hears them differently.

The `div[role="dialog"]` with a hand-rolled focus trap makes JAWS repeat the dialog role announcement. No built-in close cue. Focus return is on you to script.

The native `<dialog>` with `showModal()` fixes all three. One announcement. Focus lands on the first interactive element. It returns to the trigger on close. No custom code.

It's not random. ARIA tells assistive technology what something is, but not how to behave. Native elements carry the behavior. That's the whole difference.

If your team is still building `div[role="dialog"]` from scratch, especially from AI-generated code, this is the one swap worth making.

Tested in JAWS lately?
