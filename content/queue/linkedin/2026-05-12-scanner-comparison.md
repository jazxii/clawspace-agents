---
platform: linkedin
status: ready
date: 2026-05-12
slug: scanner-comparison
format: insight
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#wcag", "#a11y", "#axecore", "#devtools"]
image_prompt: "Split panel diagram: three columns labeled axe-core, Pa11y, and IBM Equal Access, each showing a percentage bar and a short list of what the scanner catches. Below all three columns, a shared red zone labeled 'What all scanners miss' with three items: semantic ARIA misuse, color-only meaning, and dynamic content without live regions. Clean dark background, monospace font for code references, accessible color palette with high-contrast text."
humanized: true
humanized_at: "2026-05-05T00:00:00Z"
---

Three accessibility scanners. Three different strengths. None of them catch the thing that breaks AI-generated UI most.

Here's how axe-core, Pa11y, and IBM Equal Access actually differ, and why the choice matters when your codebase has AI-generated code in it.

axe-core catches 57% of WCAG issues automatically. That's the published ceiling from Deque's own benchmarks. Best automated catch-rate available. Pa11y wraps axe-core (or HTML_CodeSniffer) in a CLI you can drop into any GitHub Actions workflow. Same coverage, no GUI layer. If your team wants axe-core in CI without paying for DevTools, Pa11y is the answer.

IBM Equal Access is the one that actually checks cognitive SCs where automatable. WCAG 3.3.7, 3.3.8, 3.3.9. If you're in a regulated industry where WCAG 2.2 AA is a contract requirement, Equal Access is the serious enterprise pick.

But here's what all three miss:

Semantic ARIA misuse. `aria-modal="true"` on a `<div>` that isn't actually a modal passes every scanner. Screen readers get confused anyway. That's a WCAG 4.1.2 failure no rule engine catches.

Color used as the only visual cue for meaning. "Red fields are required" passes contrast checks. Fails 1.4.1. Clean green CI.

Dynamic content that appears and disappears without a live region. No scanner catches a loading state that announces nothing to AT users.

That's the 43% automated tooling cannot reach. The gap doesn't shrink by switching scanners. It shrinks by pairing scanner output with manual AT testing.

What's running in your CI right now, and what's the worst miss you've seen from a green build?

Source: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
