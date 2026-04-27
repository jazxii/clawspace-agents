---
name: newsletter-publish
description: Promote a completed newsletter draft from `research/newsletters/drafts/` to `research/newsletters/archive/` after the user has manually published it. STAGE-ONLY pipeline — this skill never sends to Substack/Beehiiv/LinkedIn. It moves the file and logs the publication.
---

# Newsletter publish (post-send bookkeeping)

After the user manually publishes a newsletter on their platform of choice, run this to record the publication and archive the draft.

## When to use

- User says: "I published the newsletter", "mark week 17 newsletter as sent", "/newsletter-publish 2026-W17".

## Inputs

- `week` (required) — ISO week (e.g., `2026-W17`).
- `platform` (required) — `substack | beehiiv | linkedin-newsletter | other`.
- `url` (optional) — link to the published edition.

## Procedure

1. Verify `research/newsletters/drafts/<week>.md` exists. If not, abort.
2. Read its frontmatter. Update:
   - `status: draft` → `status: published`
   - Add `published_on: YYYY-MM-DD`
   - Add `published_platform: <platform>`
   - Add `published_url: <url>` (if provided)
3. Move file: `research/newsletters/drafts/<week>.md` → `research/newsletters/archive/<week>.md`.
4. `bus_post(channel="research", from="user", type="done", body="Newsletter <week> published on <platform>", ref="research/newsletters/archive/<week>.md")`.
5. `bus_post(channel="content", from="user", to="content-domain-lead", type="status", body="Newsletter <week> shipped", ref="research/newsletters/archive/<week>.md")`.

## Forbidden

- Never auto-send to any platform. The user publishes manually; this skill is bookkeeping only.
- Never overwrite a file in `archive/`. If a same-week file exists there, abort with a conflict error.
- Never modify drafts that have `status: published` without an explicit user override.
