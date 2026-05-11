---
platform: instagram
status: ready
date: 2026-05-19
slug: hybrid-ai-human-testing
format: carousel
slides: 7
topic: "57% scanner ceiling. Three-layer testing stack."
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
research_domain: accessibility-ai
humanized: true
humanized_at: "2026-05-07T10:30:00Z"
humanized_against: research/domains/_writing-signature/profile.md
hashtags_in_first_comment: true
hashtags: ["#accessibility", "#a11y", "#testing", "#axecore", "#wcag", "#qa", "#cicd", "#frontend", "#webdev", "#assistivetech", "#inclusivedesign", "#a11ytesting", "#deque"]
image_prompts: see slide blocks below
---

# Hybrid testing — three layers, three failure modes

**Format**: 7-slide carousel. Cover, the ceiling, three layers, the practical setup, the takeaway.

---

## Caption (front-loaded)

The 57% scanner ceiling killed the "all-green report = accessible" claim.

What replaced it in 2026 is hybrid testing. Three layers. Each catches a different failure mode.

Swipe for what each one actually catches and where most teams quietly stop.

Save this for your next QA planning session.

[hashtags in first comment]

---

## Slide 1: Cover

**Headline:** Hybrid testing
**Subhead:** Three layers. Three failure modes.
**Visual cue:** Three stacked horizontal bars, each filling more of a coverage meter.
**Image prompt:** "Three stacked horizontal bars on a clean grid. Each bar fills more of the row than the one below. Top bar nearly full. Labels next to each bar are blank for now. Clean infographic style, accessible blue and green palette, no people."

---

## Slide 2: The ceiling

**Headline:** 57%

**Body:**
That is the share of WCAG issues axe-core catches.
Deque has published this number against real audit data for years.
"All green" means nothing if you stop here.
**Image prompt:** "Large bold number '57%' centered on a clean card. Below it, in smaller text, 'Deque axe-core coverage'. A small green progress bar fills 57% of the way across the bottom. Minimal flat infographic, accessible palette, no people."

---

## Slide 3: Layer one — scanners

**Headline:** 1. Static rule-based scanners

**Body:**
axe-core. Pa11y. IBM Equal Access.
Catches color contrast. Missing alt. ARIA misuse. Label associations.
Cheap, fast, deterministic. Cover this in CI.
**Image prompt:** "A terminal window mockup running an axe-core scan. Output shows green PASS lines and a few red FAIL lines. Monospace type, dark mode, accessible color palette, no people."

---

## Slide 4: Layer two — AI agents

**Headline:** 2. AI behavioral agents

**Body:**
Test-Lab.ai and similar 2026 tools combine axe with a model that drives the keyboard.
Catches focus traps. Broken keyboard nav. Bad focus order. Some dynamic-content issues.
Cost more per run. Reproducibility is improving but not perfect.
**Image prompt:** "An animated cursor and keyboard icon hovering over a UI mockup. The cursor has clicked into a modal and shown a focus trap warning in red. Minimal flat illustration, accessible blue and orange palette, no people."

---

## Slide 5: Layer three — humans

**Headline:** 3. Human expert + AT user testing

**Body:**
The only layer that catches judgment calls.
Information structure. Cognitive issues. Custom components. Edge-case flows.
Six categories Impelsys cataloged in 2026 live here.
**Image prompt:** "A clipboard with a checklist of six items, four checked, two flagged with a question mark. Beside it, a small headphones icon labeled 'AT user'. Minimal flat illustration, accessible green and amber palette, no people."

---

## Slide 6: The setup

**Headline:** A practical stack

**Body:**
axe-core in CI on every PR.
AI agent suite in pre-release smoke tests.
Human a11y review on every major feature, plus a quarterly AT user session.
This is what works. Not what is cheap.
**Image prompt:** "Three vertical columns on a clean grid, each labeled with one stage of a release: 'PR', 'pre-release', 'feature + quarterly'. A small icon at the top of each column matches the layer (terminal, robot, person with headphones). Clean infographic, accessible palette, no people."

---

## Slide 7: The takeaway

**Headline:** Where do you stop?

**Body:**
Skipping layer one is reckless.
Stopping there is the 57% ceiling.
Skipping layer three is where most teams quietly end up.

Which layer is your team currently stopping on?

**Image prompt:** "A bold pull-quote card. 'Skipping layer one is reckless. Stopping at it is the 57% ceiling.' Centered on a cream background with one orange accent. Editorial layout, accessible contrast, no people."

---

## First-comment hashtags

#accessibility #a11y #testing #axecore #wcag #qa #cicd #frontend #webdev #assistivetech #inclusivedesign #a11ytesting #deque
