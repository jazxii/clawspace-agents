# PRD — Personal Brand (master)

Master PRD covering the personal-brand content domain across LinkedIn, Instagram, and X. Per-platform PRDs add detail and live alongside this one.

## Goal

Build a recognizable, valuable personal brand around the user's professional domains (Accessibility AI primary, plus emerging interests) by publishing consistently and authentically across LinkedIn, Instagram, and X — fed by an active research pipeline so every post is grounded in real signal, not noise.

## Specifications (success criteria)

- ≥ 1 LinkedIn post drafted per weekday, staged in `content/queue/linkedin/`.
- ≥ 3 Instagram posts drafted per week (carousel or reel concept), staged in `content/queue/instagram/`.
- ≥ 5 X posts drafted per week (mix of standalone + threads), staged in `content/queue/x/`.
- Every post is mirrored to the Notion content DB within 1 hour of being marked `ready`.
- Every post links back to a research note or experience anchor (no empty hot takes).
- Monthly content calendar drafted by the 1st of each month in `content/calendar/YYYY-MM.md`.

## Forbidden actions

- Never auto-post to any platform. Stage only — the user publishes manually.
- Never fabricate stats, citations, or quotes. If a fact lacks a source in `research/`, it does not go in a post.
- Never overwrite a post once `status: posted`. Edits go to a new file with a new slug.
- Never modify another platform's queue from a single-platform writer (LinkedIn writer cannot touch IG queue).

## Open questions (for next user sync)

- Which voices/influencers should `source-curator` weight highest in research feeds?
- What is the user's preferred posting cadence per platform (e.g., LinkedIn: weekday morning vs. midday)?
- Are there topics/clients that are off-limits for public posts?

## Active KRs (this week)

- [ ] Initial monthly calendar drafted
- [ ] First LinkedIn post staged
- [ ] Notion DB schema validated by `notion-publisher`
- [ ] Engagement-analyzer baseline metric defined
