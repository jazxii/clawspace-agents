---
name: daily-content
description: Run the daily content pipeline — discover topics from research + LinkedIn + web, select per persona system + portfolio strategy, stage up to 4 drafts across today and tomorrow. Use when the user says "run daily content", "today's drafts", "daily run", or invokes `/daily-content`. Optional args — date, `--mood <balanced|controversial|research|builder|community>`, `--cap <N>`.
---

# Daily content pipeline

Trigger the deterministic daily content flow. Delegates to the
`daily-content-pipeline` agent. Stage-only — never publishes.

## When to use

- User says "run daily content", "today's drafts", "daily run", "stage
  tomorrow's posts", "controversy run", or invokes `/daily-content` directly.
- Manual top-up between the automated 09:00 runs.

## When NOT to use

- For a single ad-hoc post on a specific topic — use the content-domain-lead
  agent or invoke a writer directly.
- For monthly calendar planning — that lives in content-calendar-planner.
- For Notion-only sync — use `/notion-sync` instead.

## Args

| Arg | Default | Notes |
|---|---|---|
| `<date>` (positional) | today's date | `YYYY-MM-DD`. Used as `T`. `T+1` is always staged for the day after. |
| `--mood <X>` | `balanced` | `balanced \| controversial \| research \| builder \| community`. Biases persona selection. |
| `--cap <N>` | `4` | Max drafts this run, 1–6. Hard cap at 6. |

Examples:

- `/daily-content` — today, balanced mood, cap 4
- `/daily-content --mood controversial` — push contrarian-analyst topics
- `/daily-content 2026-05-16 --mood research --cap 2` — stage 2 drafts for 5/16, research mood

## Procedure

1. **Parse args.** Default `date` = today; `mood` = `balanced`; `cap` = 4
   (clamp to [1, 6]).
2. **Pre-flight checks:**
   - Confirm `prds/content-pipeline.md` exists. If not, tell the user
     "Pipeline PRD missing; run setup" and stop.
   - Confirm `research/domains/_writing-signature/profile.md` exists. If
     not, stop with an error.
   - Confirm `content/queue/{linkedin,instagram,x}/` directories exist
     (create empty if missing).
3. **Spawn `daily-content-pipeline`** via the `Agent` tool with the parsed
   args. Inline the args in the prompt so the agent sees them clearly:
   ```
   target_date: <date>
   mood: <mood>
   cap: <cap>
   ```
4. **Stream progress.** The pipeline posts status messages to `bus/content`
   as each step completes (topic-scout done → selection done → writers
   spawned → humanizer pass → Notion sync → digest). Surface them to the
   user.
5. **On completion**, summarise:
   - Number of drafts staged for `T` and `T+1`
   - Personas used
   - Files created (paths)
   - Notion sync result
   - Link to `content/daily-runs/<date>.md` for the full reasoning trail
6. **On error**, surface the bus alert messages verbatim — the pipeline
   handles partial failures gracefully (some drafts fail gate, others
   stage), so the user always gets a clear picture.

## What the pipeline does (one-paragraph summary for context)

The `daily-content-pipeline` agent reads the last 7 days of research notes
under `research/domains/accessibility-ai/notes/`, the LinkedIn industry
signal from the `/linkedin-research` skill, and (if needed) a WebSearch
fallback. It scores candidate topics for controversy, recency, topic lane,
and required anchor (named build / paper / number / first-hand). It applies
the persona mix ratio from `research/domains/_writing-signature/profile.md`
to pick 1–4 topics across today and tomorrow, assigning a persona, platform,
format, and tone to each. It spawns the platform writers in parallel
(linkedin-writer / x-writer / instagram-writer), each of which chains
through humanizer + hashtag-strategist + image-prompt-writer. It verifies
the 10-question pre-publish gate, runs `scripts/notion-queue-sync.py`,
writes `content/daily-runs/<date>.md` with the full reasoning trail, and
posts a digest to `bus/content`.

## Forbidden

- Do NOT call the writers directly from this skill. The pipeline is the
  single dispatcher.
- Do NOT publish to LinkedIn / X / Instagram. Stage-only.
- Do NOT raise the cap above 6.
- Do NOT skip the pre-flight checks — a missing profile or PRD breaks the
  pipeline silently.
