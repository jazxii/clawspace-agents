---
name: post-to-bus
description: Append a message to a Clawspace bus channel. Use when the user (or an agent) wants to post a status, task, alert, or note to a Slack-like agent channel. Channels are append-only JSONL files in bus/. Always go through this skill — never write to bus/*.jsonl directly.
---

# Post to bus

Append one message to a bus channel via the `bus-mcp` server's `bus_post` tool.

## When to use

- The user says "post to <channel>", "tell <agent> X", "broadcast Y", or any phrasing that implies inter-agent comms.
- An agent finishes a unit of work and needs to announce completion or hand off.

## Required inputs

- `channel` — one of `all-hands`, `content`, `projects`, `research`, `meta`, `proj-<slug>`, or `dm-<a>-<b>`.
- `from` — the posting agent's id (e.g. `scrum-master:graphify`). For human-initiated posts, use `user`.
- `type` — one of: `task`, `status`, `question`, `answer`, `alert`, `note`, `done`.
- `body` — the message body (markdown ok, keep under ~500 tokens).

## Optional

- `to` — recipient agent id. Omit or use `*` for broadcast.
- `ref` — path or URL pointing to artifacts (e.g., `kanban/projects/foo.md#card-7`).

## Procedure

1. Confirm channel name matches `^[a-z0-9][a-z0-9_\-]{0,63}$`.
2. Call the `bus_post` tool from the `bus-mcp` MCP server with the assembled payload.
3. Confirm success to the caller with the channel and timestamp.

## Example

User: "Tell the content team that the April calendar is ready."

```
bus_post(
  channel="content",
  from="user",
  to="content-domain-lead",
  type="note",
  body="April calendar is ready for review.",
  ref="content/calendar/2026-04.md"
)
```

## Forbidden

- Never write to `bus/*.jsonl` with Edit or Write tools. Always go through `bus_post`.
- Never post on behalf of another agent without their consent (use your own `from` id).
