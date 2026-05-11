---
name: notion-sync
description: Push the local content queue to the Notion content database, or pull conflict notices back. Use when the user says "sync to Notion", "push content to Notion", or "check Notion for edits". Delegates to the notion-publisher agent.
---

# Notion sync

Run a Notion mirror cycle on demand.

## When to use

- User says "sync to Notion", "push content", "mirror the queue", "check Notion".
- Recovering from a Notion-side conflict.

## Modes

- **push** (default) — local md → Notion
- **pull** — surface Notion-side edits back to bus/content as conflict notices

## Procedure

1. Verify `CLAWSPACE_NOTION_DB_CONTENT` is set in `.claude/settings.local.json`. If not, tell the user to populate the template and stop.
2. Verify the Notion MCP server is registered (check `.claude/settings.local.json` for `mcpServers.notion`).
3. **Primary path:** Run `python3 scripts/notion-queue-sync.py` via Bash. This script bypasses the Notion MCP server (which does not load in agent sub-sessions) and calls the Notion REST API directly using the token from `settings.local.json`.
4. If Bash is blocked, spawn `notion-publisher` via the Agent tool as fallback — but note it will likely fail due to MCP unavailability; document the failure and ask the user to run the script manually.
5. Surface the sync summary (created / updated / errors) to the user.

## Scripts

Two sync scripts live in `scripts/`:

| Script | Target DB | Env var |
|---|---|---|
| `scripts/notion-queue-sync.py` | Content Queue (`CLAWSPACE_NOTION_DB_CONTENT`) | Full post data: body, hook, hashtags, image prompt |
| `scripts/notion-calendar-sync.py` | Content Calendar (`CLAWSPACE_NOTION_DB_CALENDAR`) | Calendar view data: date, platform, format, slug |

Both scripts read the Notion token directly from `settings.local.json` and handle SSL on macOS Python 3.14+ via `ssl._create_unverified_context`.

## Title convention (CRITICAL — do not change)

**Content Queue titles MUST use the format:** `"{Platform} — {slug}"`

Examples:
- `LinkedIn — 2026-05-08-doj-title2-extension`
- `Instagram — 2026-05-07-axecore-reel`
- `X — 2026-05-09-wcag3-contrast-now`

**Why:** The title is the deduplication key. Without the platform prefix, cross-platform posts on the same topic share a slug and the sync script will merge all 3 platform versions into a single Notion page. This happened once (90 pages collapsed to 37); the fix is the `{Platform} — {slug}` format.

**Content Calendar titles use:** `"{Platform} — {topic}"` (human-readable topic, not slug).

## Hashtag convention

| Platform | Rule | Notion `Hashtags` property |
|---|---|---|
| LinkedIn | 3–5 lowercase niche hashtags | `multi_select` with tag names (strip leading `#`) |
| Instagram | 8–15 hashtags, mixed reach | `multi_select` with tag names |
| X | **No hashtags** (X PRD forbids them) | Always send `{"multi_select": []}` to clear any stale values |

The sync script always sends `Hashtags` in the PATCH payload (even as an empty array) so stale values from previous syncs are cleared. Never skip the `Hashtags` key on update.

## Deduplication protocol

Before any sync, verify the Notion DB is clean:

1. Query all pages and count: expected = number of local active (non-archived) queue files.
2. If count > expected, run the audit script or inline Python to detect:
   - **Non-canonical titles**: anything not matching `^{Platform} — YYYY-MM-DD-.+`
   - **Same title duplicates**: multiple pages with identical title
3. Archive duplicates via `PATCH /pages/{id} {"archived": true}`.
4. Re-run the sync script — it will create missing pages cleanly.

## Property schema (Content Queue DB)

| Notion property | Type | Source |
|---|---|---|
| Title | title | `"{Platform} — {slug}"` |
| Channel | select | LinkedIn / Instagram / X |
| Status | select | ready / drafting / scheduled / posted |
| Scheduled Date | date | `date:` frontmatter field |
| Hashtags | multi_select | `hashtags:` frontmatter (parsed from JSON array or space-separated) |
| Image Prompt | rich_text | `image_prompt:` or `image_prompts:` frontmatter |
| Hook | rich_text | First non-empty non-heading line of post body |
| Body | rich_text | Post body text (first 2000 chars) |
| Humanized | checkbox | `humanized: true/false` frontmatter |
| Last Synced | date | Timestamp of sync run |

## Forbidden

- Never write to `bus/*.jsonl` directly — always go through `bus.post`.
- Never store the Notion token in any committed file.
- Never run pull mode in a loop — once per call.
- Never skip the `Hashtags` field on X posts — always send `{"multi_select": []}` to clear stale tags.
- Never use slug-only titles in Content Queue — always prefix with platform.
