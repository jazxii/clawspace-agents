---
platform: instagram
status: drafting
date: 2026-05-09
slug: cognitive-load-checklist
format: carousel
topic: "Cognitive accessibility checklist — WCAG 2.2 + COGA in practice"
research_ref: research/domains/accessibility-ai/notes/2026-05-02-cognitive-load-neurodiversity.md
hashtags: ["#accessibility", "#a11y", "#wcag", "#cognitiveaccessibility", "#neurodivergent", "#adhd", "#inclusivedesign", "#ux", "#webdesign", "#frontend", "#webdev", "#usability", "#developer", "#dyslexia", "#autism"]
image_prompts: [
  "Dark background with large centered text '15-20%' in bright cyan, subtitle 'of people are neurodivergent' below in white. Around the percentage, small abstract icons representing ADHD, autism, dyslexia (no people, just symbolic shapes). Clean infographic style, high contrast.",
  "Side-by-side webpage mockups on dark background: Left shows three pages with 'Help' link in different positions (scattered, inconsistent). Right shows three pages with 'Help' link in same top-right corner across all (consistent). Visual annotations: X on left, checkmark on right.",
  "Multi-step form mockup on dark background. Step 1 shows email field filled. Step 4 shows same email field auto-filled with small label 'Already provided in step 1'. Annotation arrow pointing to auto-fill. Clean UI design, no people, focus on the form pattern.",
  "Authentication screen comparison: Left side shows distorted CAPTCHA with red X overlay. Right side shows passkey/fingerprint icon with green checkmark. Dark background, high contrast. Text labels: 'Cognitive test ❌' vs 'Passkey ✓'. Technical, minimal design.",
  "Split-screen showing two error messages on dark terminal-style background: Top (complex): 'An error occurred while processing your request to the authentication service endpoint.' Bottom (plain): 'We couldn't log you in. Check your password.' Readability score annotations: 'Grade 12' vs 'Grade 6'. Monospace font.",
  "UI state progression diagram on dark background: 'Loading...' → 'Success ✓' → visible for 3+ seconds. Timer indicator showing duration. Clean timeline visualization. Annotation: 'Visible ≥3 sec'. Developer aesthetic, minimal illustration.",
  "Timer UI mockup on dark background showing countdown '4:59 remaining' with prominent 'Disable timer' toggle button below. Toggle in 'off' position. Visual annotation: 'User control required'. Clean interface design, high contrast, no people.",
  "Code snippet on dark editor background showing CSS media query: '@media (prefers-reduced-motion: reduce) { * { animation: none; } }'. Syntax highlighting in muted colors. Small annotation: 'Respect user preferences'. Terminal aesthetic.",
  "Two UI mockups side by side on dark background: Left shows feature moving position between visits (dotted outline showing old position, X marker). Right shows feature in consistent position across sessions (checkmark). Labels: 'Unpredictable ❌' vs 'Predictable ✓'.",
  "Grid layout of nine checkmark badges on dark background, each representing a cognitive accessibility criterion: 'Consistent Help', 'No Redundant Entry', 'Accessible Auth', 'Plain Language', 'Visible State', 'No Timers', 'Reduced Motion', 'Predictable UI', 'Curb-cut Effect'. Clean badge design, cyan and white color scheme."
]
humanized: true
humanized_at: "2026-05-04T19:30:00Z"
---

# Cognitive accessibility checklist

**Hook**: Most accessibility audits skip the cognitive layer. Here's your checklist.

---

## Slide 1: Why this matters

**Headline**: 15–20% of people are neurodivergent

**Body**: ADHD, autism, dyslexia, dyscalculia, and more. Add temporary high cognitive load (fatigue, stress, second language) and you're talking about most users at some point. WCAG 2.2 added 3 cognitive SCs. Here's how to test them.

**Visual**: "15-20%" large text with icons representing different neurodivergent conditions

---

## Slide 2: Consistent help (WCAG 3.2.6)

**Headline**: Help links in the same place every time

**Body**: If you have contact info, chat, or FAQ links on multiple pages, they must appear in the same relative order. Don't make users hunt for help.

**Check**: Open 3 pages. Is the help link in the same spot?

**Visual**: Three page mockups with help link highlighted in same position vs. scattered

---

## Slide 3: No redundant entry (WCAG 3.3.7)

**Headline**: Don't re-ask for info you already have

**Body**: Multi-step forms that ask for your email on step 1, then again on step 4? That's a WCAG violation. Auto-fill, pre-fill, or let users copy from previous steps.

**Check**: Complete your checkout flow. Do you re-enter anything?

**Visual**: Form showing "Email (already provided in step 1)" with auto-filled value

---

## Slide 4: Accessible auth (WCAG 3.3.8)

**Headline**: At least one auth method without cognitive tests

**Body**: No captcha puzzles. No "memorize this code". No "transcribe this string" if users can paste. Passkeys, WebAuthn, password managers, paste-able OTPs all qualify.

**Check**: Can users sign in without solving a puzzle or memorizing text?

**Visual**: Passkey icon ✓ vs. distorted CAPTCHA text ❌

---

## Slide 5: Plain language (COGA)

**Headline**: Grade 8 reading level for UI copy

**Body**: Error messages, button labels, and help text written in plain language reduce task completion time for everyone. Target ~20 words per sentence max. Front-load the verb.

**Check**: Run your error messages through Hemingway. Grade 8 or lower?

**Visual**: Complex error message vs. plain language version side by side

---

## Slide 6: Visible state (COGA)

**Headline**: Don't hide loading or success states

**Body**: Spinners that disappear after 1 second? Success messages that fade instantly? Users with slower processing miss them. Use live regions. Keep states visible for ≥3 seconds.

**Check**: Slow down your animations. Can you still follow what happened?

**Visual**: Loading → Success state progression with duration indicators

---

## Slide 7: No artificial timers (WCAG 2.2.1+)

**Headline**: Time pressure spikes cognitive load

**Body**: Countdown timers ("your seat held for 4:59") are hostile to ADHD users and trigger task-switching failures. WCAG 2.2.1 says users can extend time. Better: no timer at all.

**Check**: Does your UI have countdown timers? Can users disable or extend them?

**Visual**: Timer UI with "Disable timer" toggle

---

## Slide 8: Reduce motion (WCAG 2.3.3)

**Headline**: Respect prefers-reduced-motion

**Body**: Autoplaying carousels, parallax scrolling, animated page transitions — sensory overload for autistic users. Honor the prefers-reduced-motion CSS media query.

**Check**: Turn on reduced motion in your OS. Do animations stop?

**Visual**: CSS code snippet showing @media (prefers-reduced-motion: reduce)

---

## Slide 9: Predictability over novelty (COGA)

**Headline**: Don't surprise users

**Body**: Surprise modals, features that change position between sessions, "shortcut" gestures — all friction. Predictability matters more than novelty.

**Check**: Does anything move or behave differently on repeat visits?

**Visual**: UI element in consistent position across sessions vs. moving target

---

## Slide 10: The combo

**Headline**: Cognitive a11y is UX quality

**Body**: These aren't compliance checkboxes. They're usability wins. Features built for neurodivergent users help everyone — the curb-cut effect.

**Visual**: Checkmark badges for each criterion arranged in a grid

---

## Caption

Most accessibility audits skip the cognitive layer.

Here's your checklist:

✓ Help links in the same spot on every page (WCAG 3.2.6)
✓ No re-entering info in multi-step forms (3.3.7)
✓ Auth without cognitive tests: passkeys, paste-able codes (3.3.8)
✓ Plain language: grade 8 reading level for error messages (COGA)
✓ Visible loading & success states for ≥3 seconds (COGA)
✓ No countdown timers, or let users disable them (2.2.1)
✓ Honor prefers-reduced-motion (2.3.3)
✓ Predictable UI over surprise features (COGA)

These aren't compliance checkboxes. They're usability wins.

The curb-cut effect in action.

Features for neurodivergent users help everyone:
- Reduced motion helps autistic users → helps everyone on a moving train
- Save-as-you-go helps ADHD users → helps everyone with flaky wifi
- Plain language helps dyslexic users → helps non-native speakers

That's the curb-cut effect.

What's one cognitive a11y pattern you've shipped?

[hashtags in first comment]

---

## First comment hashtags

#a11y #accessibility #wcag #coga #neurodiversity #adhd #autism #dyslexia #inclusivedesign #ux #webdev #frontend #cognition #usability #design
