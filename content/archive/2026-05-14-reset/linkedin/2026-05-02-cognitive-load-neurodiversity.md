---
type: post
platform: linkedin
status: archived
topic: "Cognitive load and Neurodiversity: How it affects Accessibility"
research_domain: accessibility-ai
research_refs:
  - research/domains/accessibility-ai/notes/2026-05-02-cognitive-load-neurodiversity.md
created: 2026-05-02
humanized: true
humanized_against: research/domains/_writing-signature/profile.md
hashtags: ["#cognitiveaccessibility", "#a11y", "#wcag22", "#neurodiversity", "#inclusivedesign"]
image_prompt: "Clean split-screen: left side shows a cluttered, small-font form with unlabelled fields and a blinking captcha puzzle; right side shows the same form redesigned with generous spacing, clear labels, large touch targets, and a paste-able OTP field. Warm neutral background, no people, accessibility-first aesthetic, subtle green checkmark on the right panel."
notion_page_id: 3530ee97-23c8-812a-a605-e7c249584585
notion_last_synced: "2026-05-02T00:00:00.000Z"
archived_at: 2026-05-14T09:51:57Z
---

Most accessibility audits I review still skip the cognitive layer entirely.

Contrast ratios? Checked. Alt text? Checked. Focus rings? Usually.

Cognitive load? Almost never.

That's a problem. Roughly 1 in 5 people are neurodivergent. ADHD, autism, dyslexia, dyscalculia. Add the much bigger group of people in temporarily high-load states (tired, stressed, parenting, second language) and you're looking at the largest under-served accessibility population in your product.

WCAG 2.2 finally added three cognitive criteria in 2023:

- 3.2.6 Consistent Help. Your help mechanisms appear in the same relative order on every page.
- 3.3.7 Redundant Entry. Don't ask for info the user already gave you in the same flow.
- 3.3.8 Accessible Authentication. At least one auth path that doesn't require a cognitive function test. No captcha puzzles, no string memorization, no transcribing OTPs you can't paste.

That's the floor. The ceiling is W3C's COGA guidance: reduce visual noise, make state visible, never rely on memory, support adaptation.

Three concrete things you can ship this sprint:

1. Audit one critical flow for re-entry. Pre-fill anything the user has already typed. (3.3.7)
2. Switch your auth to support passkeys or paste-able OTPs. (3.3.8)
3. Run your top 10 product strings through a plain-language pass. Target reading age 9. Most teams I work with cut their average sentence length by 30% on the first pass.

The curb-cut effect is real here. Save-as-you-go helps ADHD users with task interruption. It also helps everyone with a flaky train Wi-Fi connection. Plain language helps cognitive accessibility. It also helps every tired user at 4pm.

Cognitive accessibility isn't a niche. It's the part of the iceberg you've been steering past.

What's the one cognitive a11y change your team could ship this sprint?

#Accessibility #Neurodiversity #UXDesign #WCAG #InclusiveDesign #CognitiveAccessibility
