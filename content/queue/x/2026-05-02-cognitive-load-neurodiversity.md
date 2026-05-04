---
type: post
platform: x
status: ready
format: thread
tweets: 8
topic: "Cognitive load and Neurodiversity: How it affects Accessibility"
research_domain: accessibility-ai
research_refs:
  - research/domains/accessibility-ai/notes/2026-05-02-cognitive-load-neurodiversity.md
created: 2026-05-02
humanized: true
humanized_against: research/domains/_writing-signature/profile.md
hashtags: |
  #a11y #Accessibility
notion_page_id: 3530ee97-23c8-819d-9ba0-f0970983dc45
notion_last_synced: "2026-05-02T00:00:00.000Z"
---

## 1/8

Most accessibility audits I see still skip cognitive load entirely.

Contrast: checked.
Alt text: checked.
Cognitive load: almost never.

Roughly 1 in 5 people are neurodivergent. This is the largest group your product is failing.

Thread.

## 2/8

WCAG 2.2 finally added three cognitive Success Criteria in 2023:

- 3.2.6 Consistent Help
- 3.3.7 Redundant Entry
- 3.3.8 Accessible Authentication

These are the new floor. Most teams haven't shipped them yet.

## 3/8

3.3.8 is the one that bites hardest.

It says: at least one auth path must not require a cognitive function test.

Captcha that asks you to read distorted text? Fails it.
OTP you can't paste? Fails it.
Passkeys, WebAuthn, paste-able codes? Pass.

## 4/8

3.3.7, Redundant Entry, sounds simple until you actually walk a checkout flow.

Email at signup. Email again at confirmation. Email again at "verify it's you". Email again at receipt.

For an ADHD or working-memory-affected user, every re-entry is friction tax.

## 5/8

ADHD-friendly design in three lines:

- Save-as-you-go on every form
- No artificial countdown timers
- Predictable navigation, no surprise modals

These also help every user on a flaky connection. Curb-cut effect.

## 6/8

Autism-friendly design in three lines:

- Honor prefers-reduced-motion
- Literal copy, skip the idioms
- Don't move features between sessions

Predictability over novelty. Always.

## 7/8

Dyslexia-friendly typography is mostly about spacing, not font:

- Line-height 1.5+
- Line length 45–75ch
- Left-aligned, not justified
- Reading mode where possible

Font wars are a distraction. Spacing is the real lever.

## 8/8

The takeaway:

Cognitive accessibility is not a niche. It's the part of the iceberg you've been steering past.

Pick one of the three WCAG 2.2 cognitive SCs. Ship it this sprint.

#a11y #Accessibility
