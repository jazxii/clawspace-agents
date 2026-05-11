---
platform: instagram
status: ready
date: 2026-05-07
slug: axecore-reel
format: reel
topic: "Screen-capture walkthrough — running axe-core on an AI-generated app for the first time"
calendar_slot: "Week 1 Thu — Instagram reel concept"
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags:
  - "#accessibility"
  - "#a11y"
  - "#webdev"
  - "#wcag"
  - "#axecore"
  - "#aibuilders"
  - "#aiux"
  - "#frontenddevelopment"
  - "#inclusivedesign"
  - "#wcag22"
  - "#a11ytesting"
  - "#vibecoding"
  - "#devops"
  - "#a11ydebt"
  - "#cidev"
image_prompt: "Dark navy cover frame, bold white headline split across two lines: 'AI built this app.' and 'axe-core found 23 things.' A blurred terminal pane in the background showing red violation lines. High contrast, monospace aesthetic, no people, no stock-photo feel."
humanized: true
humanized_at: "2026-05-07T08:00:00Z"
---

## Reel Concept — 30–35 seconds

**Format**: Screen-capture walkthrough. Single laptop view, narrator-style on-screen text, no face. Voiceover optional. Captions for every line so it reads on mute.

---

### Shot 1 — Cover frame (0–4s)

**Visual**: Dark navy card. Bold white text:

> "I built an app with AI in 4 minutes. Then I ran axe-core."

Behind the text: blurred screenshot of a clean-looking dashboard UI.

**On-screen text**: same as above.

---

### Shot 2 — The "looks fine" preview (4–9s)

**Visual**: Browser window. Polished dashboard. Mouse hovers over a button, clicks a card, opens a modal. Everything looks smooth.

**On-screen caption**: "Looks fine in the browser."

**Voiceover line** (optional): "Looks fine, right?"

---

### Shot 3 — The terminal moment (9–15s)

**Visual**: Cut to terminal. Type `npx axe core .` (or run from extension). Spinner. Then the report explodes onto the screen — long scroll of red violation lines.

**On-screen caption**: "23 violations. First scan."

**Voiceover line** (optional): "Twenty-three issues. One scan."

---

### Shot 4 — The top 4, one per beat (15–27s)

Each item: 3 seconds. Code snippet on left, plain-language fix on right. Brief pause between.

1. **Color contrast**
   - Code: muted gray text on white background, contrast ratio shown as `3.4:1`
   - Caption: "Secondary text fails 4.5:1. AI default palette."

2. **Icon button, no name**
   - Code: `<button><svg></svg></button>`
   - Caption: "Icon-only button. No accessible name."

3. **div as button**
   - Code: `<div role="button" onClick={...}>`
   - Caption: "div pretending to be a button. Use `<button>`."

4. **div as dialog**
   - Code: `<div role="dialog" aria-modal="true">` with focus-trap script
   - Caption: "Hand-rolled modal. Native `<dialog>` does this for free."

---

### Shot 5 — The 57% reminder (27–32s)

**Visual**: Dark card. White text. Stat in large type:

> "axe-core finds about 57% of WCAG issues."

Smaller line below:

> "The other 43% needs human eyes."

**On-screen text**: same as above.

**Voiceover line** (optional): "Half the issues. The rest you read for yourself."

---

### Shot 6 — Close (32–35s)

**Visual**: Dark navy card. White text:

> "Scan first. Ship second. Save this."

Small bookmark-icon animation in the corner.

**On-screen text**: same as above.

---

## Caption

I built an app with AI in 4 minutes. Then I ran axe-core. 23 violations on the first scan.

The list was familiar. Color contrast on muted secondary text. Icon-only buttons with no accessible name. `<div role="button">` instead of `<button>`. A hand-rolled modal where native `<dialog>` would have handled focus, ARIA, and inert background for free.

None of it was new. AI codegen does not invent new accessibility failures. It produces the patterns it saw most in training data. That is the patterns the web already ships. The average is the average.

axe-core caught 23. Deque's own data says it catches about 57% of WCAG issues. So the real number was higher. The cognitive failures, the link text, the placeholder-as-label, the screen reader behavior, none of that shows up in the report. You read for those.

If you are using AI tools to ship UI, run a scan before you call it done. 30 seconds. Six fixes you can land before lunch.

Save this for the next time you prompt an app into existence.
