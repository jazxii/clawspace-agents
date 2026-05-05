---
platform: linkedin
status: drafting
date: 2026-05-07
slug: cognitive-checklist
format: framework
research_ref: research/domains/accessibility-ai/notes/2026-05-02-cognitive-load-neurodiversity.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#cognitiveaccessibility", "#inclusivedesign"]
image_prompt: "Minimalist checklist card on dark slate background. Title 'Cognitive Accessibility Checklist' in clean sans-serif at top. Below, seven checkbox items with checkmarks in bright cyan: 'Consistent Help (3.2.6)', 'No Redundant Entry (3.3.7)', 'Accessible Auth (3.3.8)', 'Plain Language', 'Visible Progress', 'No Timers', 'Forgiving Input'. Simple line-based design, no illustrations, no people, technical aesthetic."
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

Most dev teams skip cognitive accessibility because there's no automated check.

Here's the checklist I use in design reviews.

**WCAG 2.2 floor (these are required):**

3.2.6 Consistent Help — if you have a contact link, FAQ, or chat widget, it appears in the same spot on every page.

3.3.7 Redundant Entry — don't re-ask for info the user already gave you in the same session. Autofill it or offer "use previous."

3.3.8 Accessible Authentication — at least one auth method doesn't require solving a puzzle or memorizing a code. Passkeys, paste-able OTPs, password managers all qualify.

**Beyond WCAG (COGA design objectives):**

Plain language — error messages in grade 8 reading level. "Invalid email format" is better than "The value provided does not conform to RFC 5322."

Visible state and progress — if it's a multi-step process, show where the user is. Working memory costs add up fast.

No artificial time pressure — countdown timers on checkout ("your cart expires in 4:59") spike cortisol for ADHD and anxiety. Just don't.

Forgiving input — accept "4169031234" and "416-903-1234" and "(416) 903-1234" in a phone field. Make the computer do the formatting work.

Help in multiple formats — some people read docs, some watch videos, some need to talk to a human. Offer all three.

**The test:**
Can a user complete the task while distracted, tired, or running their second language through a mental translator?

If no, it's not just a cognitive accessibility failure. It's a UX quality issue.

What cognitive accessibility checks do you run before shipping?
