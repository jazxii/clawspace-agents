---
platform: instagram
status: ready
date: 2026-05-09
slug: wcag3-contrast-now
format: carousel
slides: 8
topic: "WCAG 3 still has no contrast algorithm. What to use right now."
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
research_domain: accessibility-ai
humanized: true
humanized_at: "2026-05-07T10:30:00Z"
humanized_against: research/domains/_writing-signature/profile.md
hashtags_in_first_comment: true
hashtags: ["#accessibility", "#a11y", "#wcag", "#designsystems", "#contrast", "#designtokens", "#uxdesign", "#frontend", "#designops", "#apca", "#colortheory", "#inclusivedesign", "#webdev"]
image_prompts: see slide blocks below
---

# WCAG 3 contrast — what to use right now

**Format**: 8-slide carousel. Each slide is one rule for design tokens in 2026.

---

## Caption (front-loaded)

WCAG 3 still has no contrast algorithm. April 2026 draft says "to be determined."

Final publication is now placed at 2030 at the earliest.

If your design system has been quietly using APCA, swipe.

I am running this framework on every token audit in 2026. It is not glamorous. It is what actually ships.

Save this for your next design system review.

[hashtags in first comment]

---

## Slide 1: Cover

**Headline:** WCAG 3 contrast?
**Subhead:** Still TBD. Probably 2030.
**Visual cue:** Big "TBD" stamp over a faded WCAG 3 banner. Clean editorial layout.
**Image prompt:** "Editorial poster style. Large bold 'TBD' stamp in red ink, slightly off-angle, layered over a faded gray banner reading 'WCAG 3.0 — Contrast Algorithm'. Cream background, single accent in red. No people. Accessible high contrast."

---

## Slide 2: The status

**Headline:** Where the spec actually is

**Body:**
April 2026 editor's draft says contrast is yet to be determined.
APCA was removed from the working draft in mid-2023.
W3C contributors now place final WCAG 3 at 2030 at the earliest.
**Image prompt:** "A timeline running left to right. Left point labeled '2023 — APCA removed'. Middle point labeled '2026 — TBD'. Right point labeled '2030 — earliest'. Minimal flat illustration, soft blue and amber palette, no people, accessible contrast."

---

## Slide 3: Body text

**Headline:** Body and labels

**Body:**
Validate against WCAG 2.x.
4.5:1 minimum for normal text.
3:1 for large text.
Anything else fails.
**Image prompt:** "A clean text sample on a card showing two contrast ratios side by side. Left card '4.5:1 PASS' in green. Right card '3.2:1 FAIL' in red. Sans-serif type, neutral gray surface, accessible palette."

---

## Slide 4: UI components

**Headline:** Focus rings, borders, icons

**Body:**
Non-text UI needs 3:1 against its background.
Focus rings.
Input borders.
Icon buttons.
This is the one AI tools fail most often.
**Image prompt:** "An input field with a clearly visible blue focus ring at 3:1 contrast against a light gray background. Beside it, the same input with a barely visible focus ring labeled '1.8:1 fail'. Minimal flat illustration, accessible palette."

---

## Slide 5: APCA

**Headline:** APCA stays a research tool

**Body:**
Useful for brand and marketing checks.
Never the primary one.
If a swatch passes APCA but fails 4.5:1, it fails. Period.
**Image prompt:** "Two color swatch chips side by side. Left swatch labeled 'APCA pass'. Right swatch labeled 'WCAG 4.5:1 fail'. A small red 'fail' tag on top of both, indicating the combined verdict is fail. Clean lab-test aesthetic, accessible palette, no people."

---

## Slide 6: Tooling

**Headline:** Validate at build time

**Body:**
Run a contrast check on every token pair.
Style Dictionary plus a validator script catches drift before it ships.
This is a one-afternoon setup. Do it once, ship it forever.
**Image prompt:** "A terminal window mockup showing a successful build output: green 'PASS' lines for token pairs, one red 'FAIL' line highlighted. Monospace type, dark mode, accessible color palette, no people."

---

## Slide 7: AI design tools

**Headline:** Audit the focus ring first

**Body:**
v0 and Lovable default to subtle focus rings.
Most score under 2:1 on light backgrounds.
Check this before you check anything else they generate.
**Image prompt:** "Three browser cards stacked, each labeled 'AI generated UI'. The focus ring on each is highlighted with a magnifying glass and a small red 'audit me' tag. Minimal flat illustration, accessible navy and amber palette, no people."

---

## Slide 8: The takeaway

**Headline:** Build for the standard that applies

**Body:**
WCAG 3 will land. Probably with something different from both APCA and 4.5:1.
Building for it today is premature optimization.
4.5:1 and 3:1 are the floor right now. Use them.

What is your team using to validate contrast on tokens?

**Image prompt:** "A wall poster style. Large bold quote 'Build for the standard that applies'. Below it, two small badges: '4.5:1 text' and '3:1 UI'. Cream background, single deep blue accent, no people, accessible contrast."

---

## First-comment hashtags

#accessibility #a11y #wcag #designsystems #contrast #designtokens #uxdesign #frontend #designops #apca #colortheory #inclusivedesign #webdev
