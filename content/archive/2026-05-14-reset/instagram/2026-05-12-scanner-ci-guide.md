---
platform: instagram
status: archived
date: 2026-05-12
slug: scanner-ci-guide
format: carousel
topic: "Which a11y scanner should you add to CI? — decision guide per team type"
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
calendar_slot: "Week 2 Tue — Instagram carousel"
hashtags:
  - "#accessibility"
  - "#a11y"
  - "#webdev"
  - "#wcag"
  - "#axecore"
  - "#lighthouseci"
  - "#devtools"
  - "#continuousintegration"
  - "#accessibilitytesting"
  - "#wcag22"
  - "#screenreader"
  - "#inclusivedesign"
  - "#frontenddevelopment"
  - "#devsecops"
  - "#equalaccess"
image_prompts:
  - "Dark navy slide, bold white headline text reads 'Which a11y scanner belongs in your CI?' centered, with a faint branching decision tree diagram as background texture. No people."
  - "Dark navy slide, large '57%' in high-contrast yellow as dominant visual, subtitle text beneath. Monospace font, minimalist. No people."
  - "Dark navy slide, Lighthouse logo mark stylized in flat vector. Headline text prominent. Small rocket icon. Clean, no people."
  - "Dark navy slide, split into two sections labeled 'axe DevTools' and 'Pa11y' with a '+' between them. Monospace code snippet partially visible in background. No people."
  - "Dark navy slide, bold headline text, IBM Equal Access toolkit logo stylized flat vector, subtle enterprise/compliance badge icon in corner. No people."
  - "Dark navy slide, WAVE browser-extension UI illustrated as a flat wireframe with colorful inline annotation icons overlaid on a mock webpage. No people."
  - "Dark navy slide, bold text centered, a dotted ceiling line labeled '57%' with scanner tool names listed below it. High contrast. No people."
  - "Dark navy slide, four scanner logos (Lighthouse, axe, Pa11y, NVDA/VoiceOver icons) stacked in a vertical pipeline diagram with arrows between each. No people."
  - "Dark navy slide, bold CTA question text centered in white, a small comment-bubble icon below. Warm amber accent line at bottom. No people."
humanized: true
humanized_at: "2026-05-05T00:00:00Z"
archived_at: 2026-05-14T09:51:57Z
---

## Slide 1

**Headline**: Which a11y scanner belongs in your CI?

It depends on your team. Not on which tool has the biggest marketing page.

A quick decision guide.

---

## Slide 2

**Headline**: First, the hard ceiling.

Every major scanner's automated catch-rate is bounded by axe-core's published benchmark: 57% of WCAG issues.

Any tool claiming higher needs to publish reproducible data.

---

## Slide 3

**Headline**: Solo dev or early-stage startup?

Use Lighthouse CI.

Zero config. Ships with Chrome DevTools. Runs in GitHub Actions with two lines of YAML.

Good enough for a Friday-afternoon a11y check before you ship.

---

## Slide 4

**Headline**: Mid-size product team?

axe DevTools for guided component tests. Pa11y for batch URL coverage in your pipeline.

Each covers what the other misses.

---

## Slide 5

**Headline**: Enterprise, finance, gov, healthcare?

IBM Equal Access.

It covers WCAG 2.2 including cognitive SCs (3.3.7, 3.3.8), integrates with Jenkins and GitHub Actions, and produces audit-ready reports.

That matters when accessibility is a contract requirement.

---

## Slide 6

**Headline**: Onboarding designers or content authors?

Start with WAVE.

In-page visual annotations make "missing alt text" tangible. Reports are for engineers. WAVE shows the problem in context.

---

## Slide 7

**Headline**: Reality check.

Every scanner on this list caps around 57% automated coverage.

Semantic ARIA misuse, cognitive load failures, plain language problems — those need a human with a keyboard and a screen reader.

---

## Slide 8

**Headline**: The complete stack.

Lighthouse for daily scans.
axe DevTools for deep component tests.
Pa11y for batch CI coverage.
Manual NVDA + VoiceOver passes before major releases.

No single tool. Layers.

---

## Slide 9

**Headline**: What's in your CI today?

Drop the gaps in the comments.

---

## Caption

Pick your scanner based on your team, not the feature list.

Every major scanner hits the same ceiling: 57% automated WCAG coverage. That's the axe-core benchmark. The rest needs a human.

Solo or startup: Lighthouse CI. Mid-size team: axe DevTools plus Pa11y. Enterprise or regulated: IBM Equal Access. Onboarding non-engineers: start with WAVE.

None of them do it all. The full picture is layers, not one tool.

Swipe through, then tell me: what's already in your pipeline, and what's missing?
