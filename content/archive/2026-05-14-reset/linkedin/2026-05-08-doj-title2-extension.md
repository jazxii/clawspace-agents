---
platform: linkedin
status: archived
date: 2026-05-08
slug: doj-title2-extension
format: opinion
calendar_slot: "Reactive — DOJ Title II Interim Final Rule"
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
hashtags: ["#accessibility", "#a11y", "#ada", "#wcag", "#govtech"]
image_prompt: "A wall calendar with 'April 26, 2027' circled in red marker, a small post-it underneath reading 'WCAG 2.1 AA — same standard, more time'. Warm office light, muted blue background, no people, accessible color palette with strong contrast."
humanized: true
humanized_at: "2026-05-07T10:00:00Z"
archived_at: 2026-05-14T09:51:57Z
---

The DOJ extended the ADA Title II deadline by a year. The standard did not change.

On April 20, 2026, the Department of Justice issued an Interim Final Rule. State and local governments with populations of 50,000 or more now have until April 26, 2027 to meet WCAG 2.1 AA. Smaller jurisdictions get until 2028.

I have seen four threads this week treating this like a reprieve. It is not.

The rule did not soften the technical standard. WCAG 2.1 AA still applies. The clock just moved.

Here is what the extension actually changes for teams using v0, Bolt, Lovable, or Claude Artifacts to build government-facing UIs.

You have 12 more months before private lawsuits and DOJ administrative complaints become live exposure. You do not have 12 more months before users on screen readers, switch devices, or magnification tools start filing complaints. They already are.

What does not change. The compliance gap on AI-generated UI is the same as it was last week. axe-core still catches around 57% of WCAG issues. The cognitive accessibility failures, the focus order bugs, the keyboard traps in custom components still need human testing.

What I would do with the extra year. Build the testing infrastructure now while the deadline pressure is lower. Add an automated scanner to CI on day one. Schedule a quarterly manual audit with screen reader and keyboard testing. Document the conformance trajectory in something close to a VPAT, even if you are not procuring.

The teams that treat the extension as breathing room will use it. The teams that treat it as a snooze button will be in the same position in April 2027 they were in this April.

Which one is your team?

Source: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
