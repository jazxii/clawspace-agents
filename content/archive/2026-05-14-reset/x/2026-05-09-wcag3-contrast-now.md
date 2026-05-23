---
platform: x
status: archived
date: 2026-05-09
slug: wcag3-contrast-now
format: thread
tweets: 6
slot: morning
topic: "WCAG 3.0 contrast algorithm still TBD — design tokens belong on WCAG 2.x"
research_domain: accessibility-ai
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
humanized: true
humanized_at: "2026-05-07T11:00:00Z"
humanized_against: research/domains/_writing-signature/profile.md
source_linkedin: content/queue/linkedin/2026-05-09-wcag3-contrast-now.md
archived_at: 2026-05-14T09:51:57Z
---

## 1/6

WCAG 3.0 still has no contrast algorithm.

The April 2026 editor's draft says it is "yet to be determined." W3C contributors now place final publication no earlier than 2030.

If your design system has been quietly running APCA, read on.

## 2/6

APCA was removed from the WCAG 3 working draft in mid-2023. It has not returned.

It is a useful research tool. It is not the compliance standard. It may never be.

## 3/6

What I am using for design tokens in 2026:

Body text and UI labels: WCAG 2.x. 4.5:1 normal, 3:1 large.
Non-text UI (focus rings, borders, icons): 3:1 against background.

That is it. Same rules we have had for a decade.

## 4/6

Tooling:

Run a contrast check on every token pair at build time. Style Dictionary plus a small validator script catches drift before it ships. Cheap, fast, deterministic.

## 5/6

The token I see fail most often in AI-generated UI: the focus ring.

v0 and Lovable both default to subtle focus rings that score under 2:1 on light backgrounds.

Audit that one first. It is also the easiest to fix.

## 6/6

WCAG 3 will land. Probably with something different from both APCA and 4.5:1.

Building for it today is premature optimization.

Build for the standard that actually applies.
