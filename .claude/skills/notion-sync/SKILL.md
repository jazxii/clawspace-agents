---
name: notion-sync
description: Push the local content queue to the Notion content database, or pull conflict notices back. Use when the user says "sync to Notion", "push content to Notion", or "check Notion for edits". Delegates to the notion-publisher agent.
---

# Notion sync

Run a Notion mirror cycle on demand. Wraps the `notion-publisher` agent.

## When to use

- User says "sync to Notion", "push content", "mirror the queue", "check Notion".
- Recovering from a Notion-side conflict.

## Modes

- **push** (default) — local md → Notion
- **pull** — surface Notion-side edits back to bus/content as conflict notices

## Procedure

1. Verify `CLAWSPACE_NOTION_DB_CONTENT` is set in `.claude/settings.local.json`. If not, tell the user to populate the template and stop.
2. Verify the Notion MCP server is registered (check `.claude/settings.local.json` for `mcpServers.notion`).
3. Spawn `notion-publisher` via the Agent tool with the chosen mode.
4. Wait for its bus message. Surface the summary to the user.

## Forbidden

- Never bypass `notion-publisher` and call Notion MCP tools directly from this skill.
- Never run pull mode in a loop — once per call.
