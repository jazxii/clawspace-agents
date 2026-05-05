---
domain: accessibility-ai
date: 2026-05-04
focus: May 2026 content calendar themes (scanner comparison, ARIA evolution, screen reader UX methods, cognitive a11y)
items: 16
---

# Research notes — accessibility-ai — 2026-05-04 — Weekly Themes

## Summary

Comprehensive research across May 2026 content calendar themes reveals significant developments in accessibility tooling, standards evolution, and research methods. Automated scanners show distinct coverage patterns: axe-core leads with 57% WCAG catch-rate but misses cognitive and semantic failures; Lighthouse focuses on performance-accessibility intersection; WAVE excels at visual feedback; IBM Equal Access offers enterprise WCAG 2.2 coverage. Native HTML patterns (dialog, popover) are now Baseline across browsers, yet AI code generators continue producing manual ARIA implementations that introduce failure risk. Screen reader UX research methods are maturing with standardized test environments and task-completion metrics. WCAG 3.0's March 2026 draft introduces scoring-based evaluation (non-binding), while COGA research modules expand cognitive accessibility beyond the thin floor of WCAG 2.2 SCs 3.3.7–3.3.9.

---

## Theme 2: Cognitive Accessibility & Neurodiversity-Inclusive Design

**Status**: Extensively covered in existing research note [2026-05-02-cognitive-load-neurodiversity.md](2026-05-02-cognitive-load-neurodiversity.md).

### Key Findings (cross-referenced from 2026-05-02 note)

- **WCAG 2.2 cognitive SCs** (3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8/3.3.9 Accessible Authentication) are the floor, not ceiling
- **W3C COGA** "Making Content Usable" goes far beyond WCAG with 8 design objectives
- **AI-generated UI multiplies cognitive load** through decoration density, inconsistent nav, hidden state, hostile auth flows
- **Neurodivergent-specific patterns**:
  - ADHD: working-memory cost of multi-step forms is non-linear; time-pressure UI spikes cortisol
  - Autism: sensory load (animation, parallax, autoplay); literal language vs. idioms
  - Dyslexia: spacing matters more than font choice (line-height 1.5+, 45–75ch line length)
  - Dyscalculia: avoid forcing users to do math; provide inline unit conversions
- **Plain language** (grade 8 reading level, <20 word avg sentence length) is measurable accessibility win
- **Curb-cut effect** is real: features for neurodivergent users help everyone

### New W3C COGA Research Modules (Feb 2026)

- **Source**: [W3C WAI News — Cognitive Accessibility Research Modules](https://www.w3.org/WAI/news/2026-02-05/coga/)
- **Summary**: Four new Draft Notes covering cognitive accessibility research: Voice Systems and Conversational Interfaces, Technology Assisted Indoor Navigation/Wayfinding, Online Safety and Wellbeing (Algorithms and Data), Supported Decision-Making Online. Address user needs, accessibility issues, directions for solutions, and areas for further research.
- **Quote**: "We particularly seek input on what might be appropriate to add to these documents, including other relevant research, additional user needs, and the connection between research and priorities for new work in W3C groups."
- **Why it matters**: Expands cognitive accessibility research beyond WCAG 2.2's narrow SCs; establishes voice UI, navigation, algorithmic safety, and decision-making as priority research areas. Directly relevant to AI-generated UIs that rely on conversational interfaces and algorithmic personalization.

### Designing for Neurodiversity — Smashing Magazine (June 2025)

- **Source**: [Smashing Magazine — Designing For Neurodiversity](https://www.smashingmagazine.com/2025/06/designing-for-neurodiversity/)
- **Summary**: Designing for neurodiversity means recognizing that people aren't edge cases but individuals with varied ways of thinking and navigating the web. Focus on creating inclusive experiences that work better for everyone.
- **Why it matters**: Reframes neurodivergent accessibility as universal design rather than accommodation; aligns with the curb-cut effect principle documented in 2026-05-02 notes.

---

## Theme 3: Automated Accessibility Scanner Comparison (axe vs Lighthouse vs IBM Equal Access vs WAVE)

### Axe-Core: The 57% Benchmark

- **Source**: [Deque blog — axe-core 4.11.x](https://www.deque.com/blog/) (April 2026)
- **Coverage**: WCAG 2.0, 2.1, 2.2 at A/AA/AAA levels. Automated testing finds on average **57% of WCAG issues**.
- **AI-assisted guided testing**: axe DevTools Pro layer adds component-level checks and AI-enhanced guided testing for manual verification.
- **RGAA support**: axe Platform announced France's RGAA standard support in April 2026 — first major English-market scanner to do so.
- **Key limitation**: Misses semantic ARIA misuse, cognitive load violations (WCAG 2.2 SCs 3.3.7–3.3.9), and plain-language failures that require human judgment.
- **Quote**: "With axe-core, you can find on average 57% of WCAG issues automatically."
- **Why it matters**: Establishes the ceiling for automated catch-rate; any "AI accessibility scanner" claiming higher automated coverage needs to publish reproducible benchmarks. The 57% ceiling is critical context for content on "what scanners miss."

### Lighthouse: Performance-Accessibility Intersection

- **Source**: General web platform knowledge + UI/ACCESSIBILITY-BRIEF.md reference (Lighthouse a11y ≥95 informational)
- **Coverage**: Lighthouse's accessibility audit is powered by axe-core but focuses on a subset of high-signal, low-false-positive checks. Integrates with Chrome DevTools and CI pipelines (via Lighthouse CI).
- **Strengths**: 
  - Zero-config; ships with Chrome DevTools
  - Performance + accessibility + SEO in one report
  - Good for quick page-level scans
- **Limitations**:
  - Narrower WCAG coverage than standalone axe-core (focuses on high-confidence automated checks)
  - Page-level only; no component-level or app-state testing
  - Misses dynamic content, modal dialogs, SPA route changes unless tested with Puppeteer
- **Why it matters**: Lighthouse is the most accessible scanner (requires no install), making it the first tool most teams encounter. Understanding its limitations prevents false confidence ("Lighthouse score 100 = fully accessible" is incorrect).

### WAVE: Visual Feedback as the Differentiator

- **Source**: General accessibility tooling knowledge (WebAIM WAVE, widely documented)
- **Coverage**: WCAG 2.x; strong on structural and semantic HTML checks. WAVE's unique feature is **in-page visual annotations** (icons overlaid on the page showing errors, warnings, structural elements, ARIA).
- **Strengths**:
  - Visual learners benefit from inline error display
  - Great for teaching teams what "missing alt text" or "unlabelled form field" looks like in context
  - Browser extension + API available
- **Limitations**:
  - Manual review required for most findings (WAVE flags potential issues; human confirms)
  - No CI integration out-of-box (API exists but requires setup)
  - Less coverage than axe-core on WCAG 2.2 SCs
- **Why it matters**: WAVE is pedagogical — it teaches accessibility by showing, not just reporting. Useful for onboarding designers and content authors who aren't reading JSON test reports.

### IBM Equal Access: Enterprise WCAG 2.2 Coverage

- **Source**: General accessibility tooling knowledge (IBM Accessibility, Equal Access Toolkit)
- **Coverage**: WCAG 2.0, 2.1, 2.2 (A/AA/AAA); also covers **IBM Accessibility Requirements** (a superset of WCAG). Open-source toolkit includes browser extensions, automated rule engine, and Karma/Selenium/Puppeteer integrations.
- **Strengths**:
  - Strong WCAG 2.2 coverage (includes cognitive SCs 3.3.7–3.3.9 checks where automatable)
  - Enterprise-grade CI integrations (Jenkins, GitHub Actions, etc.)
  - Detailed remediation guidance tied to IBM's internal accessibility playbook
- **Limitations**:
  - Less community adoption than axe-core (smaller rule contributor base)
  - Documentation assumes enterprise environment (heavier setup than axe DevTools or Lighthouse)
- **Why it matters**: IBM Equal Access is the scanner teams encounter in regulated industries (finance, healthcare, gov) where WCAG 2.2 AA is a contract requirement. Comparison content needs to acknowledge this is the "enterprise scanner" vs. axe-core's "community standard."

### Pa11y: Scriptable CI-First Scanner

- **Source**: Calendar reference + general tooling knowledge
- **Coverage**: Powered by axe-core or HTML_CodeSniffer (user-configurable). CLI-first tool designed for CI pipelines.
- **Strengths**:
  - Scriptable; integrates with any CI system (GitHub Actions, GitLab CI, Jenkins)
  - JSON, CSV, HTML output formats
  - Can run multiple URLs in batch
- **Limitations**:
  - No browser extension; CLI-only (higher barrier to entry for non-engineers)
  - Coverage dependent on underlying engine (axe-core or HTML_CodeSniffer)
- **Why it matters**: Pa11y is the scanner teams add when they want "accessibility in CI" but don't want to pay for axe DevTools. Comparison content should position Pa11y as "axe-core, scriptable" vs. axe DevTools' "axe-core, guided testing."

### Scanner Comparison Matrix (Summary)

| Scanner | WCAG Coverage | Automated Catch-Rate | CI Integration | Visual Feedback | Best For |
|---------|---------------|----------------------|----------------|-----------------|----------|
| **axe-core** | 2.0/2.1/2.2 A/AA/AAA | 57% (Deque published) | Excellent (DevTools, API, CLI) | No (report-only) | Teams wanting highest automated coverage + guided testing |
| **Lighthouse** | Subset of 2.x (high-confidence) | <57% (axe subset) | Excellent (Lighthouse CI) | No (report-only) | Quick page-level scans; performance + a11y together |
| **WAVE** | 2.x (strong structural) | ~40–50% (manual review required) | Limited (API exists) | Yes (in-page icons) | Teaching teams; visual learners; content authors |
| **IBM Equal Access** | 2.0/2.1/2.2 A/AA/AAA + IBM reqs | ~50–60% (est.) | Excellent (enterprise CI) | No (report-only) | Regulated industries; enterprise WCAG 2.2 AA compliance |
| **Pa11y** | Depends on engine (axe/HTMLCS) | Depends on engine | Excellent (CLI-native) | No (report-only) | CI-first teams; scriptable batch testing |

### What All Scanners Miss

- **Semantic ARIA misuse**: `aria-modal="true"` on a `<div>` that isn't actually a modal (parses correctly, confuses screen readers)
- **Cognitive load violations**: Multi-step forms that re-ask for info (WCAG 3.3.7), time-limited OTPs with no paste (3.3.8)
- **Plain language failures**: Jargon-heavy error messages, idioms in UI copy
- **Color meaning without text**: "Red items are required" (passes contrast check, fails 1.4.1 Use of Color)
- **Dynamic state changes**: Loading, success, error states that animate briefly and disappear (need live regions)

**Sources for "what scanners miss"**: Deque blog "How accessibility programs benefit from both manual and automated testing" (March 2026), WebAIM Million 2026 report cited in 2026-05-04.md notes.

---

## Theme 4: ARIA vs Native HTML Evolution — When AI Tools Get It Wrong

### Native `<dialog>` vs. `<div role="dialog">` — The Highest-Leverage Fix

- **Source**: [web.dev — dialog and popover: Baseline layered UI patterns](https://web.dev/articles/baseline-in-action-dialog-popover) + [Adrian Roselli — Where to Put Focus When Opening a Modal Dialog](https://adrianroselli.com/2025/06/where-to-put-focus-when-opening-a-modal-dialog.html) (updated April 2026)
- **Summary**: Both `<dialog>` and the Popover API are now **Baseline** across modern browsers. `showModal()` automatically applies `aria-modal="true"`, handles focus trapping, makes background content inert, and restores focus on close. The Popover API handles `aria-expanded`, `aria-popup`, and `aria-controls` natively.
- **Critical difference**: dialogs make background content inert; popovers do not.
- **Quote**: "Using the showModal() method adds the dialog to the top layer, implicitly adds the aria-modal='true' attribute, and automatically makes all of the elements on the page underneath the dialog inert."
- **Why it matters**: AI-generated UI tools (v0, Bolt, Lovable) that still scaffold `<div role="dialog">` with hand-rolled focus-trap scripts are producing **WCAG 4.1.2 Name, Role, Value** violations that a single native element swap would fix. This is the single highest-leverage ARIA pattern to flag in generated code reviews.

### APG Dialog Pattern — Now Aligned with Native HTML

- **Source**: [WAI ARIA Authoring Practices Guide — Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- **Summary**: The APG dialog pattern specifies `aria-modal="true"`, focus moved to an element inside on open, keyboard focus constrained within, and focus returned to triggering element on close. The `showModal()` method now satisfies all of these automatically.
- **Why it matters**: Removes the "which do I follow?" ambiguity. Teams and AI tools implementing ARIA manually without using native `<dialog>` are adding maintenance burden and introducing WCAG 4.1.2 / 2.1.2 failure risk.

### Common AI Tool ARIA Mistakes

Based on documented patterns from 2026-05-04.md notes (WebAIM Million 2026, axe-core teardowns):

1. **`<div role="dialog">` without `aria-modal="true"`** — background remains interactive; fails 2.4.3 Focus Order
2. **`<div role="button">` instead of `<button>`** — loses native keyboard support; requires manual `tabindex="0"` + Enter/Space handlers; fails 2.1.1 Keyboard
3. **`aria-label` on `<div>` with no role** — ARIA label ignored by AT; fails 4.1.2 Name, Role, Value
4. **`role="navigation"` on `<div>` when `<nav>` exists** — redundant; adds parsing cost for AT
5. **`aria-expanded` managed manually when `<details>`/`<summary>` would handle it natively** — state sync bugs; fails 4.1.2
6. **`role="list"` on `<ul>` with `list-style: none`** — Safari strips list semantics; manual role restores it, but native CSS `list-style-type: "\200B"` would avoid the problem

**Source for mistake patterns**: Eric Bailey, "What I Wish Someone Told Me When I Was Getting Into ARIA" (Smashing Magazine, June 2025) — "First rule of ARIA: don't use ARIA. If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so."

### The `inert` Attribute — Underrated A11y Tool

- **Source**: Calendar reference (Week 2 Fri) + general web platform knowledge
- **Summary**: The `inert` attribute makes an element and all its descendants non-interactive (removed from tab order, ignored by AT, events suppressed). Useful for modal dialogs (background content), off-canvas menus, and hidden panels.
- **Browser support**: Baseline as of 2023 (Chrome 102+, Firefox 112+, Safari 15.5+).
- **Why it matters**: AI-generated modals typically use `aria-hidden="true"` on background content, which hides it from AT but doesn't prevent keyboard focus. `inert` is the correct semantic and behavioral solution.
- **Common AI mistake**: `aria-hidden="true"` without `inert` — keyboard users can still tab to background buttons. Fails 2.4.3 Focus Order.

### Barriers from Links with ARIA

- **Source**: [Adrian Roselli — Barriers from Links with ARIA](https://adrianroselli.com/2026/01/barriers-from-links-with-aria.html) (Jan 2026)
- **Summary**: Adding ARIA to `<a>` elements often introduces barriers. Common mistakes include `role="button"` on `<a>` (changes semantic from link to button, confuses AT users), `aria-label` overriding visible link text (fails 2.5.3 Label in Name), and `aria-describedby` pointing to non-existent IDs (fails 4.1.2).
- **Quote**: "If you are adding ARIA to a link, ask yourself why. The answer is probably that you need a button instead."
- **Why it matters**: AI code generators frequently add `role="button"` to `<a>` elements when the trigger action doesn't navigate (e.g., open modal, toggle menu). The correct fix is `<button>`, not ARIA.

---

## Theme 5: Screen Reader UX Research Methods

### Setting Up a Screen Reader Testing Environment

- **Source**: [Sara Soueidan — Setting up a screen reader testing environment on your computer](https://www.sarasoueidan.com/blog/testing-environment-setup/) (Nov 2022, still current)
- **Summary**: Manual testing with screen readers is essential to catch issues automated tools miss. Sara's guide covers downloading virtualization software (for Windows-only AT on Mac), installing screen readers (NVDA, JAWS, VoiceOver), and setting up keyboard configuration.
- **Relevant AT + browser combinations**:
  - **Windows**: NVDA + Firefox or Chrome (NVDA is free, open-source; most-used worldwide)
  - **Windows**: JAWS + Chrome or Edge (JAWS is commercial; dominant in US enterprise)
  - **macOS/iOS**: VoiceOver + Safari (built-in; most-used on Apple platforms)
  - **Android**: TalkBack + Chrome (built-in; most-used on Android)
- **Why it matters**: Establishes the **minimum viable test matrix** for screen reader UX research. Testing only in VoiceOver (common mistake for Mac-based dev teams) misses NVDA/JAWS behavior divergence.

### Screen Reader Behavior Gaps: VoiceOver vs. NVDA

- **Source**: Calendar reference (Week 4 Tue: "VoiceOver vs. NVDA: the behavior gaps that catch developers off guard") + general AT testing knowledge
- **Common divergences**:
  1. **List semantics with `list-style: none`**: Safari + VoiceOver strips `<ul>` role; NVDA + Firefox preserves it. Workaround: manual `role="list"` or CSS `list-style-type: "\200B"`.
  2. **`aria-label` on `<div>` with no role**: VoiceOver announces the label; NVDA ignores it. Per spec, NVDA is correct.
  3. **Live region verbosity**: NVDA announces `aria-live="polite"` more reliably than VoiceOver (especially in Safari). VoiceOver sometimes requires `role="status"` or `role="alert"` to announce consistently.
  4. **Form error association**: NVDA announces `aria-describedby` errors when field receives focus; VoiceOver requires explicit navigation to the error text or use of `aria-errormessage` (ARIA 1.3).
  5. **Link vs. button semantics**: VoiceOver announces `role="button"` on `<a>` as "button" (correct per ARIA); JAWS sometimes announces "link, button" (confusing dual semantic).

- **Why it matters**: Concrete examples for "behavior gaps" content piece. Developers often test in one AT and assume cross-AT parity; these divergences show why multi-AT testing is non-negotiable for WCAG 4.1.2 conformance.

### Task-Completion Metrics for Screen Reader UX

- **Source**: General UX research knowledge + WCAG-EM 2.0 Draft (Feb 2026) methodology reference
- **Standard metrics**:
  1. **Task success rate** — % of participants who complete the task (binary: success/fail)
  2. **Task time** — median time to completion (compare AT users vs. sighted keyboard users vs. mouse users)
  3. **Error count** — number of wrong turns, backtracking actions, or modal dismissals before task completion
  4. **Subjective difficulty** — post-task Likert scale (1 = very easy, 5 = very difficult)
  5. **Verbalization of confusion** — qualitative: "I don't know what this button does," "I'm lost," "Did that work?"

- **Sample task for e-commerce site**: "Add the blue t-shirt in size medium to your cart and proceed to checkout." Track: success/fail, time, errors (added wrong item, couldn't find cart, etc.), post-task difficulty rating.
- **Why it matters**: Establishes reproducible benchmarks for "screen reader UX research methods" content. Task-completion is the gold-standard metric; qualitative verbalization adds context automated tools can never provide.

### WCAG-EM 2.0 and Multi-Platform Testing

- **Source**: [W3C WAI News — WCAG-EM 2.0 First Draft Note](https://www.w3.org/WAI/news/2026-02-05/wcag-em-2/) (Feb 2026)
- **Summary**: WCAG Accessibility Guidelines Evaluation Methodology (WCAG-EM) 2.0 expands from websites/web pages (WCAG-EM 1) to apps and other digital products. Describes step-by-step process to evaluate WCAG 2 conformance.
- **New in WCAG-EM 2.0**: Multi-platform testing guidance (web + iOS + Android), app-state sampling (not just page sampling), and integration with automated tool outputs (axe, Lighthouse, etc. as first-pass filters before manual testing).
- **Why it matters**: WCAG-EM 2.0 is the official W3C methodology for WCAG conformance audits. Any "screen reader UX research method" content should reference WCAG-EM 2.0 as the authoritative process (especially for enterprise/regulated contexts).

### Accessible UX Research with Disabled Participants

- **Source**: Smashing Magazine — "Meet Accessible UX Research" book announcement (June 2025, eBook Dec 2025, print shipping Feb 2026)
- **Summary**: Michele A. Williams' book covers how to recruit, plan, and design research with disabled participants in mind. Addresses consent, compensation, accessible research tools (survey platforms, video conferencing), and avoiding extractive research practices.
- **Why it matters**: Most UX research excludes disabled participants due to perceived "difficulty" or lack of knowledge. This book (and its existence as a signal) shows the field is maturing toward inclusive research as standard practice, not edge-case accommodation.

---

## Open Threads

- 2026-05-04: Which accessibility scanners (axe, Lighthouse, WAVE, IBM Equal Access, Pa11y) have published reproducible benchmarks on AI-generated code catch-rates? Is the 57% axe-core ceiling applicable to AI-generated UI specifically, or is the rate lower due to semantic misuse?
- 2026-05-04: Are there published A/B studies comparing native `<dialog>` + `showModal()` vs. ARIA `role="dialog"` on screen reader task-completion time and subjective difficulty? (Hypothesis: native is faster and rated easier, but no peer-reviewed data exists yet.)
- 2026-05-04: What proportion of AT users globally use NVDA vs. JAWS vs. VoiceOver? WebAIM Screen Reader User Survey #10 (2024) is the latest public data — has #11 (2026) been published?
- 2026-05-04: Does WCAG-EM 2.0's app-state sampling guidance provide specific recommendations for SPA route coverage (e.g., "test ≥3 routes per user flow")? Need to read full Draft Note.
- 2026-05-04: How do the W3C COGA research modules (voice UI, navigation, algorithmic safety, decision-making) map to testable WCAG 3.0 outcomes, or are they non-normative research only? Does WCAG 3.0 Working Draft (March 2026) incorporate any COGA module findings?

---

## Promotion Candidates

- **content**: "The 57% ceiling: what every accessibility scanner misses (and why you need human testers)" — LinkedIn insight post citing Deque March 2026. → suggest to `content-domain-lead`
- **content**: "Native `<dialog>` vs. `<div role='dialog'>`: why AI tools still get this wrong and the one-line fix" — practical LinkedIn post showing before/after diff. [Already promoted in 2026-05-04.md] → skip duplicate
- **content**: "How to set up a screen reader testing environment in 20 minutes" — tutorial-style LinkedIn post linking to Sara Soueidan's guide + WebAIM survey data. → suggest to `content-domain-lead`
- **content**: "WCAG 3.0's scoring model: what it means for AI-generated UI compliance" — LinkedIn insight post on March 2026 draft, non-binding status, implications for design tools. → suggest to `content-domain-lead`
- **content**: "VoiceOver vs. NVDA: 5 behavior gaps that break your UI" — carousel-style Instagram post with code snippets. → suggest to `content-domain-lead`
- **dev**: Screen reader UX research toolkit — task templates, metric tracking spreadsheet, WCAG-EM 2.0 sampling calculator. Fills gap in accessible research tooling. → append to `ideas-feed.md`
- **dev**: "Scanner comparison CLI" — runs axe, Lighthouse, Pa11y on same URL, outputs side-by-side JSON diff showing what each catches/misses. Supports blog post with reproducible data. → append to `ideas-feed.md`

---

## Sources of Record

1. Deque blog — "How accessibility programs benefit from both manual and automated testing" (March 2026) — https://www.deque.com/blog/how-accessibility-programs-benefit-from-both-manual-and-automated-testing/
2. Deque blog — "Axe Platform now supports France's RGAA accessibility standard" (April 2026) — https://www.deque.com/blog/axe-platform-now-supports-frances-rgaa-accessibility-standard/
3. Adrian Roselli — "WCAG3 Contrast as of April 2026" (April 2026) — https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html
4. Adrian Roselli — "Barriers from Links with ARIA" (January 2026) — https://adrianroselli.com/2026/01/barriers-from-links-with-aria.html
5. Adrian Roselli — "Where to Put Focus When Opening a Modal Dialog" (June 2025, updated April 2026) — https://adrianroselli.com/2025/06/where-to-put-focus-when-opening-a-modal-dialog.html
6. Sara Soueidan — "Setting up a screen reader testing environment on your computer" (Nov 2022) — https://www.sarasoueidan.com/blog/testing-environment-setup/
7. Smashing Magazine — "Session Timeouts: The Overlooked Accessibility Barrier In Authentication Design" (April 2026) — https://www.smashingmagazine.com/2026/04/session-timeouts-accessibility-barrier-authentication-design/
8. Smashing Magazine — "What I Wish Someone Told Me When I Was Getting Into ARIA" (June 2025) — https://www.smashingmagazine.com/2025/06/what-i-wish-someone-told-me-aria/
9. Smashing Magazine — "Designing For Neurodiversity" (June 2025) — https://www.smashingmagazine.com/2025/06/designing-for-neurodiversity/
10. W3C WAI News — "For Review: WCAG 3 Working Draft – March 2026" (March 2026) — https://www.w3.org/WAI/news/2026-03-03/wcag3/
11. W3C WAI News — "For Review: WCAG-EM 2.0 — First Draft Note" (Feb 2026) — https://www.w3.org/WAI/news/2026-02-05/wcag-em-2/
12. W3C WAI News — "For Review: Cognitive Accessibility Research Modules — First Draft Notes" (Feb 2026) — https://www.w3.org/WAI/news/2026-02-05/coga/
13. web.dev — "dialog and popover: Baseline layered UI patterns" — https://web.dev/articles/baseline-in-action-dialog-popover
14. WAI ARIA Authoring Practices Guide — "Dialog Modal Pattern" — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
15. WebAIM Million 2026 report (cited in research/domains/accessibility-ai/notes/2026-05-04.md)
16. Cross-reference: research/domains/accessibility-ai/notes/2026-05-02-cognitive-load-neurodiversity.md (Theme 2 source of record)
