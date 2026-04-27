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
- `--from-research <domain>` (optional) — seeds the PRD Goal from `research/domains/<domain>/ideas-feed.md`'s top idea

## Procedure

1. Validate the slug. Refuse if it doesn't match `^[a-z][a-z0-9\-]{0,40}$`.
2. Check for collisions. If any of these exist, abort and tell the user:
   - `prds/projects/<slug>.md`
   - `kanban/projects/<slug>.md`
3. Create files in this exact order:

   **a. `prds/projects/<slug>.md`** — copy from `prds/projects/_template.md`. Replace `<project-name>` with `name`. If `repo_path` provided, add a `## Repository` section with the path. If `--from-research`, read the top idea from `research/domains/<domain>/ideas-feed.md` and paste it under `## Goal` (preserve attribution: "Sourced from research/domains/<domain>/ideas-feed.md").

   **b. `kanban/projects/<slug>.md`**:

   ```markdown
   # Kanban — <slug>

   <!-- counts: backlog=0 | in-progress=0 | review=0 | done=0 | updated=YYYY-MM-DD -->

   ## Backlog

   ## In Progress

   ## Review

   ## Done
   ```

   **c. `graphify-indexes/<slug>/.gitkeep`** — empty directory marker; `dev-researcher` will populate via `/graphify` when the project is first investigated.

4. Bus seed:

   ```
   bus_post(
     channel="proj-<slug>",
     from="user",
     type="note",
     body="Project '<name>' scaffolded. PRD: prds/projects/<slug>.md",
     ref="prds/projects/<slug>.md"
   )
   bus_post(
     channel="projects",
     from="user",
     type="status",
     body="New project: <name> (<slug>)",
     ref="prds/projects/<slug>.md"
   )
   ```

5. Update `MEMORY.md` — add `- [<name>](prds/projects/<slug>.md)` under "PRDs > Dev projects" if not already there.
6. Tell the user the next step: "Edit `prds/projects/<slug>.md` to fill in Goal/Specs/Forbidden, then run `scrum-master` to break down the first goal into cards."

## Forbidden

- Never create files outside the four locations listed above.
- Never auto-populate Goal/Specs/Forbidden with placeholder text beyond the template — the user's intent matters.
- Never run `/graphify` on the user's source repo from this skill (project-domain-lead handles that on first dev-researcher invocation, with user awareness).
- Never overwrite an existing project. Abort on collision.
