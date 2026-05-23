---
platform: instagram
status: ready
date: 2026-05-16
slug: accessguru-prompting-stack
format: carousel
persona: researcher-news
topic_lane: 1
strategic_purpose: portfolio
mood: research
anchor:
  type: study
  value: "AccessGuru — arXiv 2507.19549, stacked prompting (role-play + contextual + metacognitive) for LLM WCAG detection + remediation"
research_ref: external (arXiv 2507.19549v1)
hashtags_in_first_comment: ["#DigitalAccessibility", "#WebAccessibility", "#A11y"]
image_prompts:
  - "Slide 1: bold 3-word title 'Three prompts, one audit' over a dark navy background with a thin orange underline. Sans-serif, generous spacing, accessibility-first aesthetic."
  - "Slide 2: split layout. Left: label 'Layer 1 — Role-play'. Right: short description of role-play prompting with a small magnifying glass icon."
  - "Slide 3: split layout. Left: label 'Layer 2 — Contextual (the heavy lifter)'. Right: description of contextual prompting with URL / domain / WCAG icon trio."
  - "Slide 4: split layout. Left: label 'Layer 3 — Metacognitive'. Right: description with a small brain-with-thought-bubble icon."
  - "Slide 5: vertical stacked flow diagram showing the three prompts feeding one Selenium audit run, output: corrected HTML."
  - "Slide 6: short bullet list. What the stack catches: WCAG 2.2 Level A + Reflow / Multiple Ways / Device Independence. What it does not: cognitive flow, screen reader UX."
  - "Slide 7: closing question on a clean background — 'Which prompting layer does the most work in your accessibility AI?' with a small comment-bubble icon."
caption_char_count: 647
caption_word_count: 113
humanized: true
humanized_at: "2026-05-15T10:22:00Z"
---

# Caption

Came across AccessGuru this week while comparing prompting techniques for accessibility auditing (arXiv 2507.19549).

The paper does what most LLM-a11y work skips. It stacks three prompting techniques in sequence instead of relying on one.

Role-play. Contextual. Metacognitive. Each layer catches something the previous one missed.

I mapped the stack across seven slides to see how the layers connect.

If you're building any AI-assisted accessibility workflow, the contextual layer does the heaviest lifting. Domain plus URL plus WCAG criterion plus violation category. The specificity is what makes it work.

Source paper in the first comment.

Which prompting layer does the most work in your accessibility AI?

# Slide outlines

## Slide 1 — Hook
Three prompts, one audit.
AccessGuru stacks role-play + contextual + metacognitive for WCAG detection and auto-remediation.

## Slide 2 — Layer 1: Role-play
Tell the model who it is. "You are a WCAG 2.2 auditor."
Sets the evaluation lens. Cheap to add. Useful as a base - weak on its own.

## Slide 3 — Layer 2: Contextual (the heavy lifter)
Add the URL, the domain, the specific WCAG criterion, and the violation category.
More context, better output. This is where the accuracy gap closes.

## Slide 4 — Layer 3: Metacognitive
Ask the model to check its own reasoning before answering.
"What might you be missing?" "Where would a human reviewer disagree?"
This is how you surface the model's own blind spots.

## Slide 5 — The stacked workflow
Role-play → Contextual → Metacognitive → Selenium-driven WCAG check → Corrected HTML.
Three prompts. One auto-correction pass.

## Slide 6 — What it catches, what it misses
Catches: WCAG 2.2 Level A. Selected AA - Reflow, Multiple Ways, Device Independence, Language of Parts, Consistent Navigation.
Misses: cognitive flow, semantic meaning, screen reader UX. Same ceiling every automation tool hits.

## Slide 7 — Closing
Which prompting layer is doing the most work in your accessibility AI?
Source: arXiv 2507.19549. Link in first comment.
