# Clawspace Showcase — Remotion video

A ~36 s cinematic product film for the Clawspace personal AI workforce, built with
[Remotion](https://github.com/remotion-dev/remotion).

Every UI scene is the **dashboard rebuilt as live, animated React** — not a
screenshot. Components, classes, colors and data are recreated faithfully from
the real app (`ui/app`), then shot with a **virtual camera** that pushes in,
pans, and tracks across the interface while it animates (numbers count, bars
fill, messages stream, cards drag, graph edges draw).

## Scenes

| # | Scene | Route | The "living" motion + camera |
|---|---|---|---|
| 1 | **Title** | — | Brand mark + five accent dots, tagline |
| 2 | **Dashboard** | `/` | Camera **pushes into "Good morning, Jassim."**, then pans the stat row (values count up, sparklines draw) and glides to the budget bar filling |
| 3 | **Agents** | `/agents` | "33 agents" counts up; tier sections T4→T1 cascade in |
| 4 | **Channels** | `/channels/all-hands` | Real bus messages **stream in** with typing dots; camera racks down the feed; "live tail" pulses |
| 5 | **Kanban** | `/kanban/…defect-automation` | A card **drags Backlog → In Progress → Review → Done**; camera tracks it; column counts update |
| 6 | **Pipeline** | — | `/research-to-content` flow with a travelling spark |
| 7 | **Graphify** | `/graph` | Edges **draw**, nodes pop; camera pulls back to reveal the graph |
| 8 | **Cost** | `/cost` | Per-agent bars **fill**; camera glides down the list |
| 9 | **Proposals** | `/proposals/2026-W24` | Diff **types in** green line-by-line; risk pill |
| 10 | **Merits** | — | Local-first · Markdown · WCAG 2.2 AA · Nothing auto-posts |
| 11 | **Outro** | — | Wordmark + "Markdown in. Momentum out." |

Scene transitions use `slide`, `wipe`, and `fade` from `@remotion/transitions`.

## Architecture

```
src/theme.ts                 design tokens (ported from ui/app/tokens.css) + helpers
src/ui/shell.tsx             AppFrame (TopNav + SubBar chrome) · Camera (virtual dolly) · Vignette
src/ui/widgets.tsx           StatTile, Sparkline, Pill, AgentAvatar, Card, Caption, Cursor, AnimatedNumber
src/scenes/                  Dashboard, Agents, Channels, Kanban, Graph, Cost, Proposals (live UI)
                             + Title, Pipeline, Merits, Outro, Background (graphics interludes)
src/ClawspaceShowcase.tsx    the TransitionSeries timeline
src/Root.tsx                 composition registration (1920×1080, 30fps)
```

### The Camera

`Camera` (in `src/ui/shell.tsx`) operates in the app shell's world coordinates
(`WORLD_W × WORLD_H`). Pass keyframes `{ f, x, y, s }` (frame, focus-x, focus-y,
scale); it interpolates them with cubic in/out easing, adds a subtle handheld
drift, and **clamps to the shell's edges** so a zoom never reveals empty space.
Each scene defines its own camera path (push-in, pan, rack-focus, or a
frame-following tracking shot for the Kanban drag).

## Commands

```bash
npm install
npm run studio        # open Remotion Studio to preview / scrub
npm run render        # render out/clawspace-showcase.mp4 (1920×1080, 30fps)
npm run still         # render a single still frame
```

## Output

`out/clawspace-showcase.mp4` — 1920×1080, 30 fps, ~36 s.
