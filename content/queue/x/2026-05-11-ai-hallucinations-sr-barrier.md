---
platform: x
status: ready
date: 2026-05-11
slug: ai-hallucinations-sr-barrier
format: thread
tweets: 7
slot: morning
topic: "LLM hallucinations as accessibility failure mode — semantic hallucination"
research_domain: accessibility-ai
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
humanized: true
humanized_at: "2026-05-07T11:00:00Z"
humanized_against: research/domains/_writing-signature/profile.md
source_linkedin: content/queue/linkedin/2026-05-11-ai-hallucinations-sr-barrier.md
---

## 1/7

A 2026 ACM paper just confirmed it: LLM hallucinations are not only an accuracy problem.

They are an accessibility failure mode.

The paper compares them directly to overlay scripts that disrupt screen readers.

## 2/7

Classic WCAG violations are coding errors. Missing alt. Bad contrast. A button with no label.

Detectable. Fixable. Well documented.

Hallucinated labels are different.

## 3/7

The component is technically labeled. The button has a name.

The name describes a function the component does not perform.

A screen reader user clicks "Submit order." It is actually a disclaimer paragraph. axe-core passes. The user is misled.

## 4/7

This is not a 4.1.2 violation.

It is closer to 1.3.1 plus 3.3.1 plus a trust failure that does not yet have a WCAG number.

## 5/7

Three places I have started watching for it:

LLM-rewritten error messages that summarize the wrong cause.
AI tooltips on dynamic UIs that drift from what the button does.
Auto-generated ARIA labels on icon buttons that name the wrong action.

## 6/7

Detection is hard.

Automated scanners can tell that a label exists. They cannot tell that it is wrong.

This sits in the same testing zone as cognitive a11y. Human review. AT user testing. Real task flows.

## 7/7

If you ship LLM-generated UI, axe-core and Lighthouse will not catch this category.

You need a manual review step that checks whether generated copy matches what the components actually do.

I am calling it semantic hallucination. Better names welcome.
