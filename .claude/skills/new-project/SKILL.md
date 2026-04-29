---
name: new-project
description: Scaffold a new dev project in the workforce. Creates PRD, Kanban, project bus channel, and an empty Graphify index directory. Use when the user says "new project <name>", "add a project", or "/new-project <slug>". Optionally accepts `--from-research <domain>` to seed the PRD's Goal section from a research idea.
---

# New project

Scaffold a project in `~/Documents/clawspace-agents/` with all the artifacts the project domain needs to function.

## Inputs

- `slug` (required) — kebab-case identifier, matches `^[a-z][a-z0-9\-]{0,40}$`
- `name` (optional) — human-readable name (defaults to titleized slug)
- `repo_path` (optional) — absolute path to the project's source repo (recorded in PRD; `dev-researcher` will graphify it on first run)
- `docs_path` (optional) — absolute or relative path to a folder or file containing project documentation (e.g., a docs/ directory or README.md)
- `--from-research <domain>` (optional) — seeds the PRD Goal from `research/domains/<domain>/ideas-feed.md`'s top idea


## Procedure

1. Validate the slug. Refuse if it doesn't match `^[a-z][a-z0-9\-]{0,40}$`.
2. Check for collisions. If any of these exist, abort and tell the user:
   - `prds/projects/<slug>.md`
   - `kanban/projects/<slug>.md`
3. If `docs_path` is provided:
   - Recursively read all markdown/text files in the given path (including subfolders like docs/).
   - Extract project purpose, specifications, and forbidden actions from the docs.
   - Use extracted content to fill in the PRD sections (Goal, Specifications, Forbidden actions). If a section is missing, fall back to the template.
   - Attribute extracted content with a comment: "Auto-populated from <docs_path>/<filename>".
4. Create files in this exact order:
   **a. `prds/projects/<slug>.md`** — as above, but with extracted content if available.
   **b. `kanban/projects/<slug>.md`** — as before.
   **c. `graphify-indexes/<slug>/.gitkeep`** — as before.
5. Bus seed — as before.
6. Update `MEMORY.md` — as before.
7. Tell the user the next step: "Review and edit `prds/projects/<slug>.md` to finalize Goal/Specs/Forbidden, then run `scrum-master` to break down the first goal into cards."

## Forbidden

- Never create files outside the four locations listed above.
- Never auto-populate Goal/Specs/Forbidden with placeholder text beyond the template — only use content from docs or the template.
- Never run `/graphify` on the user's source repo from this skill (project-domain-lead handles that on first dev-researcher invocation, with user awareness).
- Never overwrite an existing project. Abort on collision.
