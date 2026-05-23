---
platform: instagram
status: archived
date: 2026-05-06
slug: scanner-comparison
format: carousel
topic: "5 accessibility scanners compared — what each catches that others miss"
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#automatedtesting", "#axecore", "#lighthouse", "#webdev", "#frontend", "#developer", "#inclusivedesign", "#webdesign", "#testing", "#devtools", "#ux", "#qualityassurance"]
image_prompts: [
  "Dark navy background with large white '57%' centered, subtitle 'The Ceiling for Automated Accessibility Testing' in smaller gray text below. Minimal, high-contrast, technical poster style. No logos, no illustrations, just typography.",
  "axe DevTools logo centered on dark charcoal background with '57% automated catch-rate' badge in bright cyan below. Clean product card aesthetic. Small annotation '✓ WCAG 2.0/2.1/2.2' in corner. No people, no stock imagery.",
  "Google Lighthouse logo (lighthouse icon) on dark background with Chrome DevTools interface hint — subtle browser chrome frame. Text overlay 'Powered by axe-core (subset)' in small gray font. Developer tool aesthetic, technical and minimal.",
  "WAVE toolbar interface mockup showing colored error icons overlaid on a simplified webpage wireframe. Dark theme, bright error markers (red, yellow icons). Visual feedback concept. No real webpage content, just abstract blocks with annotation icons.",
  "IBM Equal Access logo on dark background with 'WCAG 2.2 AA Compliance' certification badge in gold/yellow. Enterprise aesthetic — professional, authoritative. Small subtitle 'Cognitive SC coverage' below. Clean, corporate design.",
  "Terminal window on dark background showing Pa11y CLI output — green checkmarks, red X marks, JSON-style error logs. Monospace font, command-line aesthetic. Code snippet visible: 'pa11y --runner axe https://example.com'. Pure developer tool vibe.",
  "Split-screen visual: Left side shows automated scanner interface with green checkmark and '✓ Pass'. Right side shows confused user with screen reader (abstract illustration, no face detail) encountering broken experience marked '✗ Fail'. Dark background, high contrast, conceptual diagram style.",
  "Four tool logos arranged in workflow diagram: Lighthouse (quick scan icon) → axe DevTools (deep test icon) → Pa11y (CI pipeline icon) → screen reader icon (manual test). Dark background, arrows connecting each stage, clean flowchart aesthetic. Labels: 'Quick', 'Deep', 'CI', 'Manual'."
]
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
archived_at: 2026-05-14T09:51:57Z
---

# 5 accessibility scanners compared

**Hook**: Not all accessibility scanners catch the same issues. Here's what each does best.

---

## Slide 1: The 57% ceiling

**Headline**: Automated testing finds ~57% of WCAG issues

**Body**: That's the benchmark from axe-core, the most comprehensive scanner. Every other tool is measured against this. If a tool claims higher automated coverage, demand proof.

**Visual**: Large "57%" with annotation: "The ceiling for automated accessibility testing"

---

## Slide 2: axe-core — The standard

**Headline**: axe-core: Highest automated WCAG coverage

**Body**: WCAG 2.0/2.1/2.2 at all levels. Used by Lighthouse under the hood. DevTools extension + API + CLI. Guided testing layer helps with manual checks. Best for: teams wanting maximum automated coverage.

**Visual**: axe DevTools logo + "57% automated catch-rate" badge

---

## Slide 3: Lighthouse — Zero-config quick scan

**Headline**: Lighthouse: Built into Chrome DevTools

**Body**: Accessibility audit powered by axe-core (subset). Zero setup. Performance + a11y + SEO in one report. Narrower coverage than standalone axe. Best for: quick page-level scans.

**Visual**: Lighthouse logo + Chrome DevTools interface screenshot concept

---

## Slide 4: WAVE — Visual feedback

**Headline**: WAVE: See errors on your page

**Body**: In-page visual annotations (icons overlaid on errors). Great for teaching teams what "missing alt text" looks like in context. Manual review required. Best for: visual learners, onboarding designers.

**Visual**: WAVE interface showing error icons overlaid on a webpage mockup

---

## Slide 5: IBM Equal Access — Enterprise WCAG 2.2

**Headline**: IBM Equal Access: Enterprise compliance

**Body**: WCAG 2.2 coverage including cognitive SCs (where automatable). Enterprise CI integrations. Detailed remediation guidance. Best for: regulated industries (finance, healthcare, gov).

**Visual**: IBM Equal Access logo + "WCAG 2.2 AA" certification badge

---

## Slide 6: Pa11y — Scriptable CI-first

**Headline**: Pa11y: Automated testing in your pipeline

**Body**: Powered by axe-core or HTML_CodeSniffer. CLI-native. JSON/CSV/HTML output. Batch-test multiple URLs. No GUI. Best for: CI-first teams, scriptable testing.

**Visual**: Terminal screenshot concept showing Pa11y CLI output

---

## Slide 7: What all scanners miss

**Headline**: What automated tools can't catch

**Body**: Semantic ARIA misuse. Cognitive load violations (multi-step forms re-asking for info). Plain language failures. Color meaning without text. Dynamic state changes (loading → success → error).

**Visual**: Split screen — automated scanner ✓ pass vs. real user ✗ fail

---

## Slide 8: The combo

**Headline**: My testing stack

**Body**: Lighthouse for quick checks. axe DevTools for deep component testing. Pa11y in CI. Manual testing with NVDA + VoiceOver for what scanners miss.

**Visual**: Four tools arranged in a workflow diagram

---

## Caption

Not all accessibility scanners catch the same issues.

axe-core sets the benchmark: 57% automated WCAG catch-rate. That's the ceiling.

Lighthouse is axe under the hood. Zero setup, great for quick scans.

WAVE shows you errors on the page. Best for teaching teams.

IBM Equal Access handles WCAG 2.2 compliance for regulated industries.

Pa11y scripts your CI pipeline.

But here's what none of them catch: semantic ARIA misuse, cognitive load failures, plain language issues, color-only meaning, and fast-changing UI states.

Automated tools are your first line. Manual testing with screen readers is where you catch the rest.

What's your scanner stack?

[hashtags in first comment]

---

## First comment hashtags

#a11y #accessibility #wcag #webdevelopment #frontend #devtools #testing #screenreader #inclusivedesign #ux #webdev #axecore #lighthouse #ci #automation
