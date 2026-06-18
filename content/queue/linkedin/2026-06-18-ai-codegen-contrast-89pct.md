---
platform: linkedin
status: ready
date: 2026-06-18
target_date: 2026-06-18
slug: ai-codegen-contrast-89pct
format: short
persona: contrarian-analyst
topic_lane: 1
strategic_purpose: portfolio
anchor:
  type: study
  value: "Microsoft A11y LLM Eval report - color-contrast = 532 failures = 89.1% of all WCAG failures across 8 frontier models, no-instructions control prompt"
char_count: 1542
word_count: 265
research_ref: https://microsoft.github.io/a11y-llm-eval-report/index.html
hashtags: ["#DigitalAccessibility"]
image_prompt: "Editorial illustration, flat color blocks, no text. Subject: a single dominant low-contrast grey-on-grey text block looming over a small cluster of other faint UI fragments, conveying that one failure type swamps all others. Composition: top-down flat layout, strong negative space, one large shape and many tiny ones to show scale imbalance. Style: clean editorial vector, muted palette with one accent. Mood: analytical, slightly unsettling. Constraints: no text overlays, no watermarks, no people's faces, no logos."
links_in_comment: "https://microsoft.github.io/a11y-llm-eval-report/index.html"
# WARNING: links in first comment are also penalised by LinkedIn algorithm as of early 2026.
# Use links_in_comment only when the CTA is essential. Place it manually after publishing.
save_prompt: ""
closing_question: "For the Digital Accessibility (A11y) leads reading this: are you measuring your AI codegen on the criteria a scanner can catch, or on the ones a human still has to?"
humanized: true
humanized_at: "2026-06-18T09:00:00Z"
---

"AI will fix accessibility." I keep hearing it, and the data keeps disagreeing.

I was reading the Microsoft Accessibility (A11y) Large Language Model (LLM) Eval report this week, mid-way through an audit decision on Bug Craft AI, and one number stopped me. Across 8 frontier models, under a plain control prompt with no accessibility instructions, color-contrast accounted for 532 failures. That is 89.1% of every Web Content Accessibility Guidelines (WCAG) failure the harness caught.

One criterion. Almost nine in ten failures.

Here is the part most people will skip. The report says it plainly: "100% here does not equal WCAG conformant." The benchmark is a curated axe-core subset, 32 test cases, 160 samples per model. It catches what an automated scanner can catch, and that is exactly the point.

So the honest read is not "models are bad at contrast." It is two harder things.

When you do not ask an LLM for accessibility, you do not get it. Accessibility is not a default the model reaches for; it is something you have to specify, every time.

And when the failure does show up, it is overwhelmingly the one thing a scanner already flags. The judgment-heavy criteria, the ones a human auditor lives in, are not even in frame here. A clean run on this harness tells you nothing about those.

The generator is failing, not the scanner. We keep auditing the output and trusting the source.

For the A11y leads reading this: are you measuring your AI codegen on the criteria a scanner can catch, or on the ones a human still has to?
