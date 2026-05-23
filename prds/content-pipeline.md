# PRD — Daily Content Pipeline

**Owner:** content domain
**Status:** active (replaces ad-hoc daily drafting)
**Created:** 2026-05-15

## Goal

Run a deterministic daily flow that turns fresh research signal and current
controversial news into staged, persona-varied content drafts for today
(target date `T`) and tomorrow (`T+1`). No more than 4 drafts per run.

The output is always **stage-only**. Publishing stays manual.

## Architecture

```
09:00 daily — daily-content-supervisor
                ↓ (spawns)
              daily-content-pipeline  ──┐
                ↓ (spawns)              │
              topic-scout               │
                ↓ (writes)              │
              content/topics-radar/T.md │
                ↓ (read by pipeline)    │
              [Strategic selection]     │
                ↓ (spawns in parallel)  │
              linkedin-writer  x-writer  instagram-writer
                ↓ (each chains)         │
              hashtag-strategist + image-prompt-writer + humanizer
                ↓ (writes)              │
              content/queue/<platform>/<file>.md (status: ready)
                                         │
              content/daily-runs/T.md  ←─┘
              + Notion sync
              + bus/content digest
```

## Inputs

- `research/domains/accessibility-ai/notes/*.md` — last 7 days of research notes.
- `research/cross-domain-themes/*.md` — trend-spotter output (if present).
- `/linkedin-research` skill — fresh industry signal from LinkedIn.
- WebSearch — controversy/news fallback when local signal is thin.
- `research/domains/_writing-signature/profile.md` — persona system + topic
  lanes + controversial-topic angles + mix ratio.
- `content/queue/**` — currently staged posts (dedup).
- `content/daily-runs/` — last 7 days of runs (mix-ratio history).
- `logs/daily/` — recent reasoning logs.

## Outputs (per run)

1. `content/topics-radar/YYYY-MM-DD.md` — scored candidate list.
2. `content/daily-runs/YYYY-MM-DD.md` — what got picked, what got rejected,
   the reasoning trail.
3. 1–4 drafts under `content/queue/<platform>/YYYY-MM-DD-<slug>.md` with
   `status: ready`.
4. Notion mirror updated via `scripts/notion-queue-sync.py`.
5. One `bus/content` digest message summarising the run.

## Selection rules (in priority order)

1. **Dedup.** Skip topics with a slug already in `content/queue/` or in the
   last 14 days of `content/daily-runs/`.
2. **Anchor required.** Every selected topic must have at least one valid
   anchor: a named build (Bug Craft AI), a study (author + year + venue), a
   hard number, or a first-hand observation. Topics without an anchor are
   rejected with a reason.
3. **Topic lane match.** Each selected topic must map cleanly to one of the
   three lanes from `profile.md`. Drop topics that drift outside.
4. **Mix-ratio rebalancing.** Rolling 10-post target: 6 personal-expertise
   (researcher-news / contrarian-analyst / forensic-investigator), 2
   practitioner-builder with Bug Craft AI anchor, 1 cross-discipline-bridge,
   1 practitioner-contributor. If the last 7 days skewed contrarian, the
   pipeline favours other personas this run.
5. **Mood override.** When invoked as `/daily-content --mood <X>`, bias the
   persona pick toward that mood. See "Moods" below.
6. **Cadence guard.** Maximum **1 LinkedIn post per day** (algorithm rule).
   X threads and Instagram carousels can run alongside.
7. **Total cap.** Maximum 4 drafts per run across all platforms (2 for `T`,
   2 for `T+1`). Quality > volume.

## Event-driven posts (out-of-band)

The `event-announcer` persona (Persona H) is **not selected by the
pipeline from research signal**. Events come from the user, not from the
topic radar. Use one of:

- Pass an event trigger explicitly to the pipeline:
  `/daily-content --event "AccessU 2026 Simplifying Mobile A11y workshop, 2026-05-11, https://..."`.
- Spawn `linkedin-writer` directly with `persona: event-announcer` and the
  event details in the brief.
- Ask `content-domain-lead` to draft a single event post.

The pipeline will never invent an event. If `--event` is passed, the
pipeline allocates one of the 4 slots to an `event-announcer` draft and
drafts the rest normally from research signal.

## Moods

`--mood` is an optional bias on persona selection. Defaults to `balanced`.

| Mood | Persona bias |
|---|---|
| `balanced` (default) | Persona variety across the batch. No single persona twice. |
| `controversial` | Prefer `contrarian-analyst` and `forensic-investigator`. Pulls from `profile.md` → "Controversial topic angles". |
| `research` | Prefer `researcher-news` and `forensic-investigator`. Recent papers + reports. |
| `builder` | Prefer `practitioner-builder` with Bug Craft AI anchor. Soft-marketing days. |
| `community` | Prefer `practitioner-contributor`. Reframing behaviours. |

## Specifications

### topic-scout (Tier 1, new)

Reads fresh signal, writes `content/topics-radar/YYYY-MM-DD.md` with each
candidate carrying: `summary`, `research_refs[]`, `controversy_score` (0–3),
`recency_days`, `topic_lane`, `suggested_persona`, `platforms_fit[]`,
`anchor`, `notes`.

Triggers `domain-researcher` if `accessibility-ai/notes/YYYY-MM-DD.md`
doesn't exist for today. Invokes `/linkedin-research` via Bash for LinkedIn
signal. Uses WebSearch as a fallback when local signal is thin (< 5
candidates).

Posts a single summary to `bus/content` and returns.

### daily-content-pipeline (Tier 2, new)

Reads `content/topics-radar/YYYY-MM-DD.md`. Spawns `topic-scout` first if
the file is missing or older than 6 hours. Applies the selection rules.
Spawns writers in parallel — each writer chains its own humanizer +
hashtag-strategist + image-prompt-writer per its own spec. Waits for all
writers to finish. Verifies the pre-publish gate. Runs Notion sync. Writes
`content/daily-runs/YYYY-MM-DD.md`. Posts digest.

### daily-content-supervisor (Tier 3, updated)

Morning sweep at 09:00 now spawns `daily-content-pipeline` automatically.
Continues to handle stale-draft flags and EOD digest.

### /daily-content (skill)

Manual trigger for ad-hoc runs. Args:
- positional date — `/daily-content 2026-05-15` (default: today)
- `--mood <balanced|controversial|research|builder|community>`
- `--cap <N>` (default 4, max 6)

Spawns `daily-content-pipeline` with the parsed args.

## Forbidden actions

- Do NOT publish anywhere. Output is always `status: ready` in the queue.
- Do NOT exceed the cap (default 4 drafts per run).
- Do NOT post more than 1 LinkedIn per day (algorithm rule).
- Do NOT pick a topic without an anchor (see Selection rule 2).
- Do NOT pick a persona without a defined body arc in `profile.md`.
- Do NOT auto-edit `profile.md`, `MEMORY.md`, or `prds/` from inside the
  pipeline. Propose changes via `bus/content` instead.
- Do NOT skip the humanizer step.
- Do NOT load every research note from the last 30 days. Stay within the
  rolling 7-day window or the token budget will blow.

## Open questions

- Should the pipeline auto-trigger `domain-researcher` more than once per
  day if signal is thin? (Currently: at most once per run.)
- Should `/daily-content` accept a `--persona` override to force a single
  persona for a run? (Currently no — mood is the only bias.)
- Should `T+1` drafts be revisable the following morning when fresh signal
  arrives? (Currently: drafts stay until the user posts or the
  daily-content-supervisor archives them.)

## Active KRs

- [ ] First production run produces ≥ 2 staged drafts with varied personas.
- [ ] Mix ratio over a rolling 10-post window matches `profile.md` target
  (±1 per category).
- [ ] Zero pre-publish-gate failures over 14 days.
- [ ] User posts ≥ 3 of every 4 staged drafts (acceptance proxy).
