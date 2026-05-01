---
name: notion-setup
description: "One-time setup: creates all 6 Notion databases for the Clawspace workspace (Content Queue, Research Digests, Content Calendar, Source Library, Newsletter Archive, Ideas Board). Run once after configuring the Notion MCP server."
---

# Notion Setup

Create the 6 Notion databases that mirror the local Clawspace workspace.

## When to use

- User says "set up Notion", "create Notion databases", "initialize Notion"
- User invokes `/notion-setup`
- First-time Notion integration configuration

## Prerequisites

Before running, verify:
1. `.claude/settings.local.json` exists (copied from template).
2. `NOTION_TOKEN` is set in the Notion MCP server config.
3. The Notion MCP server is reachable (test with a `search` call).

If any prerequisite fails, tell the user what's missing and stop.

## Procedure

1. Check prerequisites above.
2. Spawn the `notion-db-manager` agent with `mode: setup`.
3. Wait for the agent's bus message confirming setup.
4. Read the generated `.notion-sync.json` to get all 6 database IDs.
5. Instruct the user to update `.claude/settings.local.json` env vars with the database IDs:
   - `CLAWSPACE_NOTION_DB_CONTENT` = Content Queue DB ID
   - `CLAWSPACE_NOTION_DB_RESEARCH` = Research Digests DB ID
   - `CLAWSPACE_NOTION_DB_CALENDAR` = Content Calendar DB ID
   - `CLAWSPACE_NOTION_DB_SOURCES` = Source Library DB ID
   - `CLAWSPACE_NOTION_DB_NEWSLETTER` = Newsletter Archive DB ID
   - `CLAWSPACE_NOTION_DB_IDEAS` = Ideas Board DB ID
6. Surface the summary to the user with links to each database.

## Idempotency

If `.notion-sync.json` already exists with all 6 DB IDs, report that setup is already complete and show the existing IDs. Do NOT recreate databases.

## Forbidden

- Never run setup more than once (check `.notion-sync.json` first).
- Never store the `NOTION_TOKEN` in any file.
- Never create databases outside the user's Notion workspace.
