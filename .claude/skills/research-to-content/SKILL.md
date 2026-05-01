---
name: research-to-content
description: "Run the full research-to-content pipeline: Topic → Research → NotebookLM → Content Generation → Humanization → Notion. Use when the user says 'research and create content about <topic>', or invokes `/research-to-content <topic>`."
---

# Research-to-Content Pipeline

Run the full pipeline from topic to staged, humanized content across all platforms.

## When to use

- User says "research and create content about <topic>"
- User says "make content from research on <topic>"
- User invokes `/research-to-content <topic>`

## Syntax

```
/research-to-content <topic> [--platforms linkedin,instagram,x,newsletter] [--depth quick|standard|deep] [--domain <slug>]
```

**Defaults**: all platforms, standard depth, auto-resolve domain.

## Procedure

1. Parse the topic and optional flags from the user's input.
2. Validate:
   - Topic is non-empty.
   - Platforms (if specified) are valid: `linkedin`, `instagram`, `x`, `newsletter`.
   - Depth (if specified) is one of: `quick`, `standard`, `deep`.
3. Spawn the `research-to-content-orchestrator` agent via the Agent tool with:
   - `topic`: the parsed topic
   - `platforms`: parsed or default `["linkedin", "instagram", "x", "newsletter"]`
   - `depth`: parsed or default `"standard"`
   - `domain`: parsed or omit for auto-resolve
4. Subscribe to `bus/research-to-content` to surface progress updates to the user as they arrive.
5. When the orchestrator posts its `done` message, surface the final summary:
   - Domain used/created
   - Number of content pieces staged (by platform)
   - File paths of all staged content
   - Humanization status
   - Notion sync status

## Example

```
User: /research-to-content AI-powered accessibility auditing tools --depth deep --platforms linkedin,x

Pipeline:
  ✓ Domain resolved: ai-accessibility-auditing
  ✓ Research complete (deep): 20 items from 10 sources
  ✓ NotebookLM: 10 prompts queried (auto mode)
  ✓ Content staged:
    - content/queue/linkedin/2026-05-01-ai-accessibility-auditing.md (humanized ✓)
    - content/queue/x/2026-05-01-ai-accessibility-auditing.md (humanized ✓)
  ✓ Notion sync: 2 pages created
```

## Forbidden

- Never bypass the orchestrator — always delegate the full pipeline to it.
- Never write content directly from this skill.
- Never run the pipeline without a topic.
