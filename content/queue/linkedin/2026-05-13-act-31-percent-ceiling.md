---
platform: linkedin
status: drafting
date: 2026-05-13
slug: act-31-percent-ceiling
format: insight
calendar_slot: "Week 2 Wed — automated WCAG coverage ceiling"
research_ref: research/domains/accessibility-ai/notes/2026-05-08-linkedin-signal.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#automatedtesting"]
image_prompt: "A horizontal progress bar on a dark navy background filled to 31% in cyan, the remaining 69% in muted gray. Above the bar, a large label reads 'Automated WCAG coverage'. Below, a small caption reads 'W3C ACT Task Force, 2026'. To the right, a stamp graphic in red text says 'AI compliance: capped here'. Clean, technical, monospace labels, accessible high-contrast palette, no people."
humanized: true
humanized_at: "2026-05-08T00:00:00Z"
---

Any AI tool that markets "automated WCAG compliance" is, at best, covering 31% of the spec. That's not a hot take. It's the W3C's own number.

The W3C ACT (Accessibility Conformance Testing) Task Force formally maps which WCAG success criteria can be verified by automated rules. Current count: 31% of SCs have ACT-compliant automated test coverage. The other 69% require manual or semi-automated review. Adrian Roselli has been citing this on LinkedIn this week as the hard ceiling on what scanners can guarantee. He's right.

This is the number every product team needs on the wall before they evaluate the next AI accessibility vendor.

When a tool claims it can bring a website to "WCAG 2.1 AA compliance" automatically, here's what that actually means. It can run roughly a third of the success criteria with high confidence. The other two thirds are out of scope for any pure automation. That includes almost all the cognitive criteria, focus management edge cases, plain language requirements, and meaningful semantics. No prompt changes that. The underlying SCs are not deterministically testable.

This isn't a critique of axe-core or Lighthouse or Pa11y. They're honest about what they detect. It's a critique of marketing that takes the 31% and rebrands it as 100%.

If you're buying or building accessibility tooling right now, the right question isn't "does it claim WCAG compliance." It's "which 31% does it actually verify, and what's your manual plan for the other 69."

Where does your team's manual coverage stop?

Source: research/domains/accessibility-ai/notes/2026-05-08-linkedin-signal.md
