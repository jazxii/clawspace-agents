---
platform: x
status: ready
date: 2026-05-20
slug: a11yscout-action
format: thread
tweets: 4
slot: morning
topic: "a11yscout GitHub Action — WCAG 2.1 audit on every PR"
research_domain: accessibility-ai
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
humanized: true
humanized_at: "2026-05-07T11:00:00Z"
humanized_against: research/domains/_writing-signature/profile.md
source_linkedin: content/queue/linkedin/2026-05-20-a11yscout-action.md
---

## 1/4

a11yscout shipped a free GitHub Action on April 24.

Same week the original Title II deadline would have hit.

WCAG 2.1 audit on every PR. axe-core under the hood. Violations posted as PR comments with severity.

## 2/4

The a11y testing gap most teams have was never "we do not have a scanner."

It was "we have a scanner and nobody runs it before merge."

Lighthouse and axe DevTools sit at local-dev or post-deploy. PR-comment is the missing slot.

## 3/4

PR-comment is also where security tooling won.

Dependabot. CodeQL. Snyk. All shifted left into the PR review surface.

Accessibility tooling has been a half-cycle behind. a11yscout is part of the catch-up.

## 4/4

Three things to benchmark before adopting any PR-comment a11y scanner:

Coverage overlap with what you already run.
False-positive rate on a known-clean repo.
Severity mapping vs your merge-blocker labels.

Worth one workflow file.
