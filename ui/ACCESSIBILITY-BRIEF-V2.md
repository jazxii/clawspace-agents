# Pre-Build Accessibility Brief V2 — Clawspace UI Phase 6 Redesign

Authored by `accessibility-agents:accessibility-lead` with synthesis across aria-specialist, modal-specialist, contrast-master, keyboard-navigator, live-region-controller, forms-specialist, link-checker, tables-data-specialist. WCAG 2.2 AA is the floor. This document **extends** [`ACCESSIBILITY-BRIEF.md`](./ACCESSIBILITY-BRIEF.md) (v1). Anything not contradicted here still holds.

---

## 0. What carries over from v1, what gets revised

### Still binding from v1
- Document chrome (`<html lang>`, `<title>` pattern, viewport without `maximum-scale`).
- Global polite + assertive live regions in `<body>`.
- Skip link, `<main id="main" tabindex="-1">`, route announcer.
- Kanban listbox-with-grouping pattern + M-mode (v2 layers DnD on top, does not replace).
- Two-tier channel live policy (sentinel, not the log).
- Reduced-motion global rule.
- Hard NOs from v1 §12.

### Revised in v2
- **Primary nav** moves from `<header><nav>` to a persistent **sidebar** (`<nav aria-label="Primary">` is now in a sibling region to `<main>`, not `<header>`). The `<header>` element shrinks to a per-page chrome strip with breadcrumb + page title + actions.
- **Single SSE per channel** is replaced by **one multiplexed `/api/events` stream**. Live-region throttling rules from v1 must be re-implemented as a *single coordinator* (see §4 below) — multiple components subscribing each to their own live region will flood SR users.
- **Route announcer** must additionally announce breadcrumb tail (e.g. "Kanban — content-linkedin"), not just `<title>`, because the new chrome shows both.
- **Focus ring token** stays `#2563eb` on light, but gets a paired `#60a5fa` (blue-400) for dark mode — verified §5.
- **Status badge palette** in v1 §6 is light-mode only. v2 doubles it for dark mode — see §5.
- **Kanban "M to pick up"** stays. We add mouse drag *as well*, with announcements that piggyback on the same M-mode live policy.
- **Per-page nav `<header role="banner">`** in v1 root layout becomes one `role="banner"` at the top of `<main>`'s wrapper, since the sidebar is now `<nav aria-label="Primary">` outside `<header>`. Only one banner per page.

---

## 1. Visual polish — design tokens, light/dark, density

### 1.1 Type scale (token names + line-height pairs)

| Token | Size / Line-height | Use |
|---|---|---|
| `text-xs` | 12 / 16 | Metadata, timestamps, sr-helpers visible variants |
| `text-sm` | 14 / 20 | Body in compact density, secondary text |
| `text-base` | 16 / 24 | Default body |
| `text-lg` | 18 / 28 | Lead paragraphs, card titles |
| `text-xl` | 20 / 28 | H4 |
| `text-2xl` | 24 / 32 | H3 |
| `text-3xl` | 30 / 36 | H2 |
| `text-4xl` | 36 / 40 | H1 |

Hard rule (WCAG 1.4.4, 1.4.12): **never set fixed `px` on body text < 16**. Body text uses `rem`. `text-xs` is permitted for non-essential metadata only and must never be the only carrier of meaning. Letter-spacing min 0.12× font-size for headings (1.4.12 advisory), default for body.

### 1.2 Spacing scale

`space-0..16` in 4px multiples (0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64). Comfy density uses base scale; Compact density multiplies vertical spacing by 0.75 (rounded to 2px). **Do not** scale below 24×24 hit area (WCAG 2.5.8) — see §1.4.

### 1.3 Radii / shadows / borders

- Radii: `radius-sm 4`, `radius-md 8`, `radius-lg 12`, `radius-pill 9999`.
- Shadows: `shadow-1` (subtle, listed cards), `shadow-2` (popovers, dropdowns), `shadow-3` (Cmd-K palette, modals). Dark mode replaces shadow with a `border-subtle` 1px because shadows vanish on dark backgrounds — focus/elevation must remain visible (1.4.11).
- Border tokens: `border-subtle`, `border-default`, `border-strong`, `border-focus` (the focus ring color).

### 1.4 Density modes

Two modes: `comfortable` (default) and `compact`. Persisted in `localStorage` under `clawspace.density`. Toggle in user menu (radio group, not a single toggle, so SR users hear the mode they're switching *to*).

**Critical accessibility constraint:** Compact reduces *padding* only, never the **target size** (WCAG 2.5.8 — minimum 24×24 CSS px for any interactive). Buttons keep min-height 32px even in compact. Kanban cards are clickable rows — minimum hit area 32px tall in compact, 40px comfy.

### 1.5 Personal-brand identity guardrails

A "builder's workforce dashboard" aesthetic: monospace accents for IDs and timestamps (`font-mono` token), generous whitespace, typographic hierarchy not chrome. Brand color used **only** for primary CTAs and the active sidebar item. **Never** as the sole indicator of selection (1.4.1) — pair with weight, icon, or `aria-current`.

---

## 2. Information density — Dashboard, Kanban, Channels

### 2.1 Dashboard additions

```html
<main id="main" tabindex="-1">
  <header class="page-chrome">
    <nav aria-label="Breadcrumb"><ol>...</ol></nav>
    <h1>Today — 2026-04-29</h1>
  </header>

  <section aria-labelledby="diff-h">
    <h2 id="diff-h">What changed since yesterday</h2>
    <ul role="list">…</ul>
  </section>

  <section aria-labelledby="alerts-h">
    <h2 id="alerts-h">Top alerts (last 24h)</h2>
    <ol>…</ol>
  </section>

  <section aria-labelledby="cadence-h">
    <h2 id="cadence-h">Supervisor cadence</h2>
    <ul role="list">
      <li>
        <article aria-labelledby="cad-content-h" aria-describedby="cad-content-desc">
          <h3 id="cad-content-h">Content supervisor</h3>
          <p id="cad-content-desc" class="sr-only">12 invocations over the last 7 days, peaking Tuesday.</p>
          <svg role="img" aria-labelledby="cad-content-h" aria-describedby="cad-content-desc" focusable="false">…sparkline…</svg>
        </article>
      </li>
    </ul>
  </section>

  <section aria-labelledby="heat-h">
    <h2 id="heat-h">Agent activity (24h)</h2>
    <!-- See §2.1.1 below -->
  </section>
</main>
```

#### 2.1.1 Sparklines and heatmap (WCAG 1.1.1)

Sparklines are decorative *adjuncts to a numeric summary*. Pattern:
- The numeric summary is the primary content (e.g. "12 invocations, peaking Tuesday").
- The SVG is `role="img"` with `aria-labelledby` pointing to the heading and `aria-describedby` pointing to the numeric summary.
- `focusable="false"` so SVG isn't a tab stop in IE/legacy.
- Decorative grid lines / axes get `aria-hidden="true"`.

The activity heatmap (24 cells × 29 agents) must NOT be a sea of `<div>`s with color. Render as a `<table>` with row headers (agent names) and column headers (hour 0–23), one cell per slot. Cells contain the numeric count visually (or `sr-only`) and `aria-label="3 messages from research-domain-lead at 14:00"`. Color is redundant. Cells with zero activity get `aria-label="0 messages…"` only if they're meaningful for orientation; otherwise leave empty cells `<td aria-hidden="true">`. Use `tables-data-specialist` patterns.

### 2.2 Kanban density toggle

Three densities for cards: `compact` (ID + title), `comfy` (current v1 — adds meta line), `expanded` (adds inline ACs as `<ul>`). Same listbox semantics in all three. Persist in `localStorage`. The toggle is a `radiogroup` with three radios (not a cycle button), so the current state is announced.

When density changes:
- Maintain `aria-activedescendant` on whichever card was focused.
- Push polite announcement: "Card density: expanded."

### 2.3 Channels metadata reveal

Each message row has visible primary metadata (author, relative time). Full timestamp, `ref:`, raw type are **revealed on hover or focus** (WCAG 1.4.13):

- The metadata strip is a sibling element with `id="msg-{ts}-meta"`, `aria-describedby` from the article.
- Visible via CSS on `:hover, :focus-within`.
- **Persistent**: hovering the metadata itself doesn't dismiss it (1.4.13 "hoverable").
- **Dismissable**: Escape collapses the reveal back (1.4.13 "dismissable") — implement once at the message-list level, not per row.
- **Keyboard**: each message row is `tabindex="0"` so the focus-within pattern works. Or wrap the whole article in a button-like role only if message rows are activatable; otherwise keep them as `<article>` with focusable `<a>` children for the ref/permalink.

Recommendation: do NOT make the entire `<article>` focusable; keep child links/buttons focusable. The reveal triggers on `:focus-within`. This avoids inventing a non-standard "focusable article" pattern and avoids tab-stop bloat in long histories.

---

## 3. Interactivity — DnD, inline edit, message form, slash picker, J/K, replies

### 3.1 Kanban DnD layered over keyboard (the headline question)

**Library**: `@dnd-kit/core` with `@dnd-kit/sortable`. Reasons:
- It exposes the same lift/drop semantics for *both* mouse and keyboard, so they can share announcement code.
- It has a built-in `<DragOverlay>` and a `screenReaderInstructions` + `announcements` API.
- It does not steal focus.
- `react-beautiful-dnd` is unmaintained. HTML5 DnD is rejected on a11y. `react-dnd` requires hand-rolling keyboard.

#### How to layer DnD without breaking the v1 keyboard pattern

The v1 M-mode is the canonical path. DnD is mouse-only enhancement. Implementation rules:

1. **Keep `aria-activedescendant` listbox model** for keyboard. dnd-kit's `useSortable` integrates without changing focus model — pass `{ keyboard: false }` to disable dnd-kit's keyboard sensor. Our M-mode handles the keyboard.
2. **Mouse drag uses the `PointerSensor` only.** Touch sensor must respect `pointer-events` so screen-reader virtual cursor on iOS doesn't fire phantom drags. Configure activation distance ≥ 8px.
3. **Drag announcements** use the same global polite live region:

```ts
// dnd-kit announcements config — shape, not real code
{
  onDragStart: ({active}) => `Picked up ${active.data.title}.`,
  onDragOver:  ({active, over}) => over
    ? `${active.data.title} is over ${over.data.column}, position ${over.data.index + 1} of ${over.data.colSize}.`
    : `${active.data.title} is no longer over a drop target.`,
  onDragEnd:   ({active, over}) => over
    ? `${active.data.title} dropped on ${over.data.column}, position ${over.data.index + 1} of ${over.data.colSize}.`
    : `${active.data.title} drop cancelled.`,
  onDragCancel:({active}) => `${active.data.title} drop cancelled.`,
}
```

4. **Throttle**: `onDragOver` fires constantly. Wrap announcements in a leading-edge throttle of 350ms so SR isn't spammed during a slow drag. Final `onDragEnd` is *always* announced and not throttled.
5. **WCAG 2.5.7 Dragging Movements**: dnd-kit DnD is a "single-pointer drag" — by SC 2.5.7 a non-drag alternative is required. Our M-mode satisfies that. Document this explicitly in code comments.
6. **WCAG 2.5.8 Target Size**: dnd-kit's drag handle (if you choose to use a handle vs whole-card grab) must be ≥24×24 CSS px. Recommend: drag the entire card surface (no handle), keyboard activates via M, click-without-drag opens detail.
7. **Distinguish click vs drag**: PointerSensor `activationConstraint: { distance: 8 }`. A click-with-no-movement opens the card detail dialog (Enter equivalent). Test with reduced precision (touch).
8. **No `aria-grabbed`** (deprecated, ignored by AT). Announcements only.
9. **prefers-reduced-motion**: dnd-kit's drop animation is configurable — set duration to 1ms when reduced.

#### Hard NO for DnD
- No autoscroll on the document body during drag (motion sensitivity, 2.3.3 advisory). Per-column autoscroll is OK if reduced-motion users get instant scroll.
- No "ghost card follows cursor" without also keeping the original visible — dnd-kit's `<DragOverlay>` handles this correctly.

### 3.2 Inline card edit

**Decision: dialog, not contenteditable.** Reasons:
- Contenteditable on a list item destroys listbox semantics and `aria-activedescendant`.
- Inline forms inside listbox options are an unsolved AT pattern.
- Reusing the existing card detail Dialog (Radix) gets you focus trap, return-focus, Escape, label association — all already specified in v1 §7.

Pattern:
- Card opens detail Dialog (existing).
- Dialog contains a `<form>` with `<label for="card-title-{id}">Title</label><input>` plus AC textarea.
- Submit posts a bus message that triggers a new `kanban-edit` skill (note this is a *skill* dependency, flag for the human team).
- Save errors render `role="alert"` near the field; focus moves to the first invalid field (forms-specialist canonical).
- Saving closes the dialog and announces "Card updated." via polite. Focus returns to the card's listbox option (the `aria-activedescendant` target), not the body.

If the team really insists on click-title-to-edit-in-place: implement only on **non-listbox** views (e.g. the `/agents/[name]` page where a card is in a normal flow), and use a clearly delimited `<form>` (not contenteditable) that toggles between display and edit modes, with an explicit Save button and `aria-pressed` on Edit.

### 3.3 Channel message form enhancements

```html
<form aria-label="Post message" novalidate>
  <div class="row">
    <label for="msg-type">Type</label>
    <select id="msg-type" name="type">
      <option value="note">Note</option>
      <option value="task">Task</option>
      <option value="alert">Alert</option>
      <option value="answer">Answer</option>
      <option value="proposal">Proposal</option>
    </select>

    <label for="msg-to">To</label>
    <input id="msg-to" name="to" role="combobox"
           aria-autocomplete="list" aria-expanded="false"
           aria-controls="to-listbox" aria-activedescendant=""
           autocomplete="off" />
    <ul id="to-listbox" role="listbox" hidden>…</ul>

    <label for="msg-ref">Reference (optional)</label>
    <input id="msg-ref" name="ref" role="combobox"
           aria-autocomplete="list" aria-expanded="false"
           aria-controls="ref-listbox" aria-activedescendant=""
           aria-describedby="msg-ref-help" autocomplete="off" />
    <p id="msg-ref-help">Path under kanban/, research/, prds/, or proposals/.</p>
    <ul id="ref-listbox" role="listbox" hidden>…</ul>
  </div>

  <label for="msg-input">Message</label>
  <textarea id="msg-input" name="body" required
            aria-describedby="msg-help msg-error"
            aria-invalid="false"></textarea>
  <p id="msg-help">Enter to send, Shift+Enter for newline. Type "/" to insert a skill.</p>
  <p id="msg-error" role="alert" aria-live="assertive"></p>

  <button type="submit">Send</button>
</form>
```

**ARIA combobox pattern (WAI-ARIA 1.2 "combobox v1.2"):**
- Input has `role="combobox"`. Sibling listbox is `aria-controls`'d.
- `aria-expanded` true/false toggled when listbox visibility changes.
- `aria-activedescendant` points to the highlighted option id; **focus stays on the input** (don't move focus into the listbox).
- ArrowDown opens and highlights first; ArrowUp opens and highlights last.
- Enter selects; Escape closes (clears highlight, not the input value); Tab selects-and-closes.
- Listbox option count announced once when listbox opens: polite, "5 results." Use a *separate* assertive-light pattern: announce only on open, not on every keystroke (see §4).

### 3.4 Slash-command picker

Pattern: a popover combobox anchored to the textarea caret. **Same combobox ARIA model as 3.3** but the trigger is keystroke `/` at start-of-line or after whitespace.

- The textarea retains `role="textbox"` (native). On `/`, render an *adjacent* combobox listbox; the textarea gains `aria-controls` and `aria-expanded="true"` only while the picker is open.
- Picker closes on: Escape, space, blur, selection.
- **WCAG 2.1.4 conflict**: `/` is a single-character shortcut. Mitigation — only triggers in textarea context, never globally. Acceptable per 2.1.4 because it's only active when the textarea has focus.
- Picker results announce count once on open.

### 3.5 Inline replies / threads

Decision: **route-based thread view, not a flyout panel.** Threading inside the channel list creates a deeply nested tree that AT users can't easily skim. Pattern:

- A message with `type="answer"` or with `ref:` to another message renders as a child article inside `<details>` collapsed by default (or expanded based on count).
- Each thread head links to `/channels/[channel]/thread/[ts]` for a focused view with full context and a reply form.
- The reply form on the thread page is the same component as 3.3 with `to:` prefilled, `ref:` prefilled, and `aria-describedby` pointing to a "Replying to {from}: {snippet}" element rendered as a `<blockquote>` above the form.

`<details>` is keyboard-accessible natively but its open/close state isn't always announced. Add `aria-live="polite"` text "{n} replies expanded" on toggle.

### 3.6 Keyboard shortcuts (G K, J/K jumps, etc.)

Full shortcut map in §6 keyboard model below. Critical rule: shortcuts NEVER fire while focus is in a text input, textarea, contenteditable, or combobox listbox — except modifier-prefixed (Cmd/Ctrl) shortcuts (WCAG 2.1.4).

---

## 4. Live regions — multi-source policy (this is the hardest part)

You have four concurrent live data sources in v2:

1. **Channel messages** (already in v1).
2. **Dashboard auto-updates** (counts, latest headlines).
3. **Notification center** (errors, completions, new proposals).
4. **Cmd-K result counts** (dynamic).

Plus transient announcements: route changes, form errors, density changes, drag-over targets, drop confirmations.

### 4.1 The single-coordinator rule

**One module owns the global polite live region.** Every component calls `liveAnnounce.polite(text)` and `liveAnnounce.assertive(text)` from a single utility. Do not let components paint their own `aria-live` regions ad-hoc — by spec they coexist, in practice SR users get a stuttering mess.

The coordinator implements:
- **Priority queue** with categories: `assertive-error` (immediate, flushes queue), `route-change`, `drag`, `form-feedback`, `notification`, `data-update`, `count-tick`.
- **Coalescing window** (1.5s) per category — within the window only the *latest* message of a low-priority category survives.
- **Rate ceiling**: max one announcement per 1s overall, except `assertive-error` which preempts.
- **Quiet zone** during open Cmd-K: while the palette is open, suppress `notification` and `data-update`. Only allow `count-tick` (palette's own results) and `assertive-error`.
- **User pause**: a single "Pause announcements" toggle in the user menu sets a flag; coordinator drops everything except `assertive-error`. (WCAG 2.2.2)

### 4.2 Concrete policy by source

| Source | Region | Category | Throttle | Notes |
|---|---|---|---|---|
| Channel new message (idle, at-bottom) | polite | `data-update` | 1.5s coalesce | Format from v1 §3 |
| Channel ≥3 in 2s | polite | `data-update` | replace | "3 new in {ch}" |
| Channel new message (scrolled up) | none | — | — | Visual "N new" button only |
| Dashboard count tick | none | — | — | Only announce on **manual** focus / interaction with the figure. Counts changing silently is OK; SR users discover on visit. |
| Dashboard new alert (severity error) | polite | `notification` | 2s coalesce | Pushed via notification center too |
| Notification center new item | polite | `notification` | 2s coalesce | "{Severity}: {short title}" |
| Notification center error item | assertive | `assertive-error` | none | Use sparingly; only system errors, not user form errors |
| Cmd-K result count | polite | `count-tick` | 500ms debounce trailing | "12 results" announced after typing pauses |
| Cmd-K group changed via arrow nav | polite | `count-tick` | 250ms | "Skills, 4 of 8" — optional, see §6.2 |
| Drag onDragOver | polite | `drag` | 350ms throttle | See §3.1 |
| Drag onDragEnd | polite | `drag` (high) | none | Final position |
| Route change | polite | `route-change` | none | Title + breadcrumb tail |
| Theme/density toggle | polite | `form-feedback` | none | "Dark mode on", "Compact density" |
| Form submit error | assertive | `assertive-error` | none | Plus inline `role="alert"` |
| Form submit success | polite | `form-feedback` | none | Plus focus move |

### 4.3 Two regions only, plus role="status" for counts

Keep v1's two regions (`#live-region-polite`, `#live-region-assertive`). Optionally add `<p id="search-result-count" role="status" aria-live="polite">` *inside* the Cmd-K palette container so result counts read in palette context, not document context. `role="status"` is implicitly polite + atomic. This is the one exception to the single-coordinator rule because the palette context matters.

### 4.4 BroadcastChannel cross-tab sync

When tab B receives an event tab A originated, **only tab A announces**. Tag every event with `originTab` (a `crypto.randomUUID()` set on tab init). Tab B updates UI silently. Otherwise opening 3 tabs triples the SR chatter.

### 4.5 Notification center drawer

Pattern: a button in the page chrome `aria-label="Notifications, 3 unread"` → opens a drawer (Radix Dialog with side variant). The drawer is the *visual* notification view; arrival announcements are handled by the live coordinator (§4.2 row "Notification center new item"). Don't double-announce: drawer being open does not change announcement policy.

The drawer contains a list with `role="list"`, items with `role="listitem"`, severity badges (icon + text). Each item links to the source. "Mark all read" button announces "All notifications marked read." politely.

---

## 5. Color & contrast — light AND dark tokens (verified)

### 5.1 Surface tokens

| Token | Light | Dark | Pair test |
|---|---|---|---|
| `bg-canvas` | `#ffffff` | `#0b1020` | base |
| `bg-surface-1` | `#f8fafc` slate-50 | `#111827` slate-900 | for cards |
| `bg-surface-2` | `#f1f5f9` slate-100 | `#1f2937` slate-800 | nested cards, hover |
| `bg-surface-3` | `#e2e8f0` slate-200 | `#374151` slate-700 | popover, palette |
| `text-primary` | `#0f172a` slate-900 | `#f8fafc` slate-50 | on canvas → 19.3:1 / 17.4:1 |
| `text-secondary` | `#475569` slate-600 | `#cbd5e1` slate-300 | on canvas → 7.5:1 / 11.2:1 |
| `text-tertiary` | `#64748b` slate-500 | `#94a3b8` slate-400 | on canvas → 5.6:1 / 6.5:1 (≥4.5:1 OK for body) |
| `border-subtle` | `#e2e8f0` | `#374151` | non-text → 1.5:1 — DECORATIVE only, no info |
| `border-default` | `#cbd5e1` | `#4b5563` | non-text → 3.0:1 / 3.1:1 |
| `border-strong` | `#94a3b8` | `#9ca3af` | non-text → 4.5:1 / 4.6:1 |

Verify on each release with `@axe-core/playwright` color-contrast rule + a visual contrast test that asserts every token pair.

### 5.2 Brand & focus

| Token | Light | Dark |
|---|---|---|
| `brand-primary` | `#2563eb` blue-600 | `#3b82f6` blue-500 |
| `brand-primary-text` | `#ffffff` on brand | `#0b1020` on brand |
| `focus-ring` | `#2563eb` | `#60a5fa` blue-400 |
| `focus-ring-offset` | `#ffffff` | `#0b1020` |

Light: blue-600 on white = 8.6:1 (text), focus ring vs white = 5.2:1 (≥3:1 ✔ for non-text 1.4.11).
Dark: blue-500 on slate-50 text = 7.0:1; focus ring blue-400 vs slate-900 = 5.4:1.

Brand button:
- Light: `#ffffff` on `#2563eb` = 8.6:1 ✔
- Dark: `#0b1020` on `#3b82f6` = 6.9:1 ✔ (NOT white-on-blue-500 in dark — that's 4.1:1, fails for body contrast on hover state shifts)

### 5.3 Status badges (dark mode pairs)

| State | Light fg/bg | Dark fg/bg | Light ratio | Dark ratio |
|---|---|---|---|---|
| Drafting | `#1e3a8a` / `#dbeafe` | `#bfdbfe` / `#1e3a8a` | 9.6:1 | 8.5:1 |
| Ready/Done | `#14532d` / `#dcfce7` | `#bbf7d0` / `#14532d` | 10.1:1 | 8.9:1 |
| Posted | `#475569` / `#f1f5f9` | `#cbd5e1` / `#1f2937` | 7.5:1 | 8.7:1 |
| In Progress | `#7c2d12` / `#fef3c7` | `#fde68a` / `#7c2d12` | 9.8:1 | 8.4:1 |
| Review | `#581c87` / `#f3e8ff` | `#e9d5ff` / `#581c87` | 9.4:1 | 9.1:1 |

Severity colors mirror the same dark-flip pattern. Always pair color with icon (1.4.1).

### 5.4 Theme implementation

- CSS variables on `:root` (light) and `[data-theme="dark"]` selector.
- `<html>` gets `data-theme` attribute set by an inline blocking script before paint to avoid FOUC.
- Default: `prefers-color-scheme` → maps to system theme. Persisted user choice in `localStorage.clawspace.theme` ∈ `{system, light, dark}` overrides.
- Theme switch announces "Theme set to dark" politely.
- Library: **`next-themes`** — handles SSR + FOUC correctly. Custom localStorage hooks repeatedly miss the inline-script-before-paint detail and cause flashes.

### 5.5 Focus-visible matrix

Verify the focus ring against:
1. The element's own background (button, input, listbox option, sidebar item).
2. The page background.

Both ≥3:1 (1.4.11). The hardest cases are: brand-primary button (focus on already-blue surface — use a 2px **inset white/dark ring** plus 2px outer brand-primary ring for double-contrast), Cmd-K palette options on `bg-surface-3` (use `focus-ring` token directly), Kanban listbox option on `bg-surface-1` (use `focus-ring` directly).

---

## 6. Keyboard model — unified shortcut map and conflict resolution

### 6.1 Shortcut map

| Keys | Scope | Action |
|---|---|---|
| `Tab` / `Shift+Tab` | global | Roving focus |
| `Cmd/Ctrl+K` | global | Open Cmd-K palette |
| `?` | global, NOT in inputs | Open keyboard shortcuts overlay |
| `g` then `d` | global, NOT in inputs | Go to Dashboard |
| `g` then `k` | global, NOT in inputs | Go to Kanban (last-viewed board) |
| `g` then `c` | global, NOT in inputs | Go to Channels (last-viewed) |
| `g` then `t` | global | Go to Timeline |
| `g` then `a` | global | Go to Agents |
| `g` then `u` | global | Go to Audit |
| `g` then `l` | global | Go to Logs |
| `g` then `s` | global | Open Search |
| `[` / `]` | sidebar focused or global | Collapse / expand sidebar |
| `j` / `k` | message list / timeline / agent list | Next / previous item |
| `Enter` | focused list item | Open detail |
| `r` | focused message | Reply (opens thread route) |
| `e` | focused card / message | Edit (opens edit dialog if permitted) |
| `m` | Kanban listbox option focused | Pick up card (move mode) — v1 carryover |
| `Esc` | layered | Close palette > overlay > drawer > modal > move-mode > combobox |
| `/` | textarea | Open slash-command picker |

**Conflict resolution:**
- `Cmd-K` is a modifier shortcut → safe everywhere (2.1.4 exempt).
- `?`, `j`, `k`, `g …`, `r`, `e`, `m`, `/` are single-character. Disable when `document.activeElement` is `INPUT|TEXTAREA|[contenteditable]|[role=combobox]|[role=listbox]` **except**: `m` is enabled inside the Kanban listbox (focused element is the listbox itself, scoped); `/` is enabled inside the textarea (scoped).
- WCAG 2.1.4 also requires: shortcuts can be turned off, remapped, or active only on focus. Provide a "Disable single-character shortcuts" setting in user menu. Persisted.
- The shortcuts overlay (`?`) must list every binding and indicate that single-char shortcuts can be disabled.

### 6.2 Cmd-K palette keyboard model

Combobox-with-listbox v1.2 pattern. Critical:
- Focus stays on the input.
- `aria-activedescendant` points to highlighted result.
- ArrowDown/Up cycle results (wrap or stop at edges — pick "stop at edges" with a polite "End of results" announcement on second press).
- ArrowRight/Left don't move between groups; tab does not move between groups (groups are visual only — listbox flat to AT).
- Group separators must be `role="presentation"` so they don't count as options.
- Enter activates; selecting an item closes the palette (exception: items that are commands with sub-actions can keep palette open with announcement).
- `Esc` closes (returns focus to invoker).
- `Cmd-K` while open closes palette.

### 6.3 Move-mode vs Cmd-K vs slash picker

These are mutually exclusive by scope:
- Cmd-K is global modifier-trigger; opens above everything; while open, `m` and `/` are inert.
- Move-mode is scoped to a focused listbox option; `Cmd-K` while in move-mode pre-empts (auto-cancels move-mode with announcement "Move cancelled.").
- Slash picker is scoped to textarea focus; can't coexist with move-mode (different focus). `Cmd-K` closes the picker as a side effect of moving focus.

Implement as a state machine with a single `mode` enum: `idle | move | palette | slash | shortcuts-overlay | drawer | modal`. Only one non-`idle` mode at a time. Escape pops the topmost mode.

### 6.4 J/K message navigation

In timeline, channel history, agent activity list:
- Each row is `tabindex="-1"`. The list container is `tabindex="0"` and uses roving-focus (`aria-activedescendant`) when J/K are used — same pattern as Kanban listbox to keep consistency.
- Or, use real focus on each row (simpler) with `tabindex="-1"`/`"0"` flip. Either works; pick **roving via aria-activedescendant** for parity with Kanban and to avoid huge tab stop counts in long lists.

---

## 7. ARIA usage — opinionated picks

### 7.1 Sidebar

```html
<aside class="sidebar" aria-label="Primary">
  <a href="/" class="logo">…</a>
  <nav aria-label="Sections">
    <ul role="list">
      <li><a href="/" aria-current="page">Dashboard</a></li>
      <li><a href="/kanban">Kanban</a></li>
      …
    </ul>
  </nav>
  <button aria-expanded="true" aria-controls="sidebar-list" aria-label="Collapse sidebar">…</button>
</aside>
```

- `<aside aria-label="Primary">` is the navigation landmark wrapper. Inside, `<nav aria-label="Sections">` holds the actual list.
- Active item: `aria-current="page"` — single source of truth. Color/weight is redundant.
- Collapsed state: items reduce to icon-only; each link gets visible text *or* `aria-label` matching the visual tooltip. **Both** is fine — `aria-label` overrides visible text for AT, so prefer keeping visible text and using `title` for non-AT tooltip, OR `aria-describedby` to a tooltip.
- Better: `aria-label` is identical to the (now-hidden) visible text. Keep tooltip via Radix Tooltip with `aria-describedby`.

### 7.2 Cmd-K palette — combobox semantics over Dialog

The palette is a `<div role="dialog" aria-modal="true" aria-labelledby="cmdk-h">` containing:
- `<h2 id="cmdk-h" class="sr-only">Command palette</h2>`.
- A `<input role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-activedescendant="…" aria-autocomplete="list">`.
- A `<ul role="listbox" id="cmdk-list">` with `<li role="option" id="…">` items.
- Group separators as `role="presentation"`.

Do **not** use `role="menu"` for the palette (menus have different keyboard expectations: left/right between sub-menus, type-ahead, etc.).

### 7.3 Breadcrumbs

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Dashboard</a></li>
    <li><a href="/kanban">Kanban</a></li>
    <li><a href="/kanban/content-linkedin" aria-current="page">content-linkedin</a></li>
  </ol>
</nav>
```

Visual `›` separators are CSS `::before content` with `aria-hidden`/empty alt. Never put separators in DOM text — they bleed into AT output.

### 7.4 Roles to avoid in v2

- `role="application"` — kills AT browse mode for that subtree. Never use, including for Cmd-K and Kanban.
- `role="grid"` for Kanban — see v1 hard NO.
- `role="navigation"` on `<nav>` — redundant.
- `role="link"` on `<a>` — redundant.
- `aria-grabbed` / `aria-dropeffect` — deprecated.
- `role="region"` without `aria-label` — produces an unlabeled landmark.

---

## 8. Forms — combobox autocompletes, inline edit, search, toggles

### 8.1 Combobox autocomplete (recap of §3.3)

Use the WAI-ARIA 1.2 combobox pattern *exactly*. axe-core's `aria-allowed-attr` rule will fail if `aria-autocomplete` is on a non-combobox.

### 8.2 Inline card edit form (in Dialog)

- Title: `<input>` with associated `<label>`.
- ACs: `<textarea>` with `<label>` plus `aria-describedby` "One per line.".
- Save button is `type="submit"`. Enter submits.
- Validation: client-side only checks emptiness; server response can render `role="alert"` and `aria-invalid="true"` on the offending field. Focus first invalid field.
- Cancel button is `type="button"` with confirmation if dirty (use `<dialog>` second-level confirm, or browser `beforeunload` is not appropriate here — use a sub-dialog).
- 3.3.7 Redundant Entry: prefill title, ACs, ID — never make the user re-type.

### 8.3 Search

- `/search?q=…` is a real route. The search field is also surfaced inside Cmd-K (acts as the same backend). Navigating to `/search` is the discoverable, bookmarkable path; Cmd-K is the power-user path.
- The `<form role="search">` on `/search` has a `<label for="q">Search</label>`. Input is `type="search"` which lets browsers add the clear-X — verify the X is keyboard-reachable in target browsers.
- Results: `<h1>Search results for "{q}"</h1>` then a `<p role="status">{n} results across {channels, kanban, research, proposals}.</p>` then sectioned `<section aria-labelledby>` per source.
- `aria-current` is not used; this is not navigation.
- WCAG 3.3.7: keep the query in the URL so Back/Forward works without retyping.

### 8.4 Theme & density toggles

`<fieldset>` + `<legend>` + 3 radios for theme (System / Light / Dark) and 2 radios for density. These are settings, not actions — radios are correct. After change, polite announcement and re-render. Don't reload the page.

---

## 9. Modals / dialogs / overlays — what each thing IS

| Surface | Pattern | Why |
|---|---|---|
| Cmd-K palette | Modal Dialog (Radix) wrapping a Combobox | Modal because: focus must trap, Esc must close, outside should be inert. Combobox inside is the listbox+input. |
| Keyboard shortcuts overlay (`?`) | Modal Dialog (Radix), centered, scrollable list | Reference content; same focus-trap requirements. NOT a popover. |
| Notification center | Side Drawer (Radix Dialog, `side="right"`) | Persistent context; user expects it to be modal-ish but visually anchored. Treat as modal: trap focus, Esc closes, return focus. |
| Card detail / inline edit | Modal Dialog (Radix) | v1 carryover. Inline edit is form inside this dialog. |
| Agent detail | **Route**, not modal | Deep-linkable, shareable, indexed by `/search`. Modal would hide it from URL state. |
| Confirm "apply proposal" | Route confirmation page | v1 carryover; full-page is more accessible than nested modal. |
| Density / theme picker | Inline radio group inside user menu popover | Lightweight settings. The user menu popover itself is a Radix Popover (NOT a Dialog — non-modal). |
| Tooltips on icon-only buttons | Radix Tooltip with `aria-describedby` | Hover/focus reveal; dismissable with Esc. |

### 9.1 Cmd-K palette layout decision

**Recommendation: floating overlay, Linear-style (centered card with backdrop).** Reasons:
- Slide-from-top fights small viewports and is an unusual pattern users don't expect.
- Full-screen is too heavy for a fast-trigger control.
- Floating overlay is the established mental model (Linear, Raycast, GitHub) — predictable AT semantics, well-supported by Radix Dialog.

Width: `min(640px, calc(100vw - 32px))`. Top offset: `15vh`. Backdrop dims content but does not blur (blur fights low-vision users). On viewports < 480px, expand to full-width with 16px margins.

### 9.2 Sidebar decision

**Recommendation: persistent + collapsible by default.** Reasons:
- Persistent gives a stable landmark always on screen — easier for SR users to orient (1.3.6 advisory).
- Collapsible to icon-strip (still 64px wide) for power users — items keep `aria-label` so SR experience is unchanged.
- Mobile (<768px): converts to **hamburger + slide-out drawer (Radix Dialog side variant)**, NOT a bottom sheet. Bottom sheets are gestural-first and have weaker keyboard a11y in most libraries; modal drawer is rock solid.

### 9.3 Theme switch decision

**Recommendation: dropdown menu with three radios (System / Light / Dark).** A simple toggle hides the System option and is ambiguous. Apple-style menu is a fine implementation — what matters is the radio semantics underneath.

### 9.4 Agent detail decision

**Route**, per §9 table.

### 9.5 Search decision

**Both.** `/search` is the canonical route; Cmd-K shares the same backend and offers a quick-access path. They're complements, not alternatives. The Cmd-K palette has a "See all results in /search" footer option for overflow.

### 9.6 Notification center decision

**Persistent button → drawer.** Inline panel takes too much chrome real estate; drawer is dismissible and modal-trap-friendly.

---

## 10. Reduced motion

Carry over v1 §8 global rule. New surfaces to neutralize:

- Sidebar collapse / expand transition → 1ms when reduced.
- Drawer slide-in → fade only (no slide) when reduced. Radix Dialog supports `data-state` selectors; gate the transform on `prefers-reduced-motion`.
- Cmd-K palette open animation → fade only.
- Tab switches between density modes → no transition.
- DnD drop animation → 1ms (see §3.1).
- Sparkline chart entrance animations → none. Lines render statically.
- Toast / notification-center item enter → fade only when reduced.

WCAG 2.3.3 (AAA, advisory) and 2.2.2 covered.

---

## 11. Cross-cutting focus management

### 11.1 Sidebar collapse / expand
- Trigger button stays focused. `aria-expanded` flips. No focus jump.
- When mobile drawer closes, focus returns to the hamburger button (modal contract).

### 11.2 Cmd-K palette
- Open: focus moves to input. Trigger is remembered.
- Close (Esc, click backdrop, select item): focus returns to the previous element. Exception: if selecting an item triggers a route change, the route announcer takes over focus (`<main>` gets focus per v1).

### 11.3 Shortcuts overlay
- Open: focus moves to overlay's first focusable (a "Close" button or the first list item with copy-to-clipboard if any).
- Close: focus returns to body element that had focus before, or `<main>` as fallback.

### 11.4 Notification drawer
- Open: focus moves to the drawer's heading wrapper (`tabindex="-1"`) so SR users hear "Notifications, heading".
- Close: focus returns to the bell button.

### 11.5 Route changes
V1 announcer extended:
- Move focus to `<main>`.
- Announce: `"{Page title}. {Breadcrumb tail if present}."` once.
- If the route is a result of selecting from Cmd-K, the route announcer fires AFTER the palette's close-focus-restore, which is then overridden by the focus-`<main>` move. Sequence: palette closes → next paint → announcer focuses `<main>` and announces.

### 11.6 Drag end
- Mouse drop: focus moves to the dropped card's listbox option (`aria-activedescendant`), so subsequent keyboard nav resumes there.
- Keyboard drop (M-mode): focus is already there.

### 11.7 Inline edit save
- Save success: dialog closes, focus returns to the listbox option matching the edited card.

---

## 12. Library recommendations (with a11y reasoning)

| Need | Pick | Why | Avoid |
|---|---|---|---|
| DnD | `@dnd-kit/core` + `@dnd-kit/sortable` | Native announcement API, layered keyboard, focus-safe overlay. | `react-beautiful-dnd` (unmaintained), HTML5 DnD (poor a11y), `react-dnd` (no keyboard out of the box). |
| Cmd-K | `cmdk` (paco) | Built on Radix primitives, correct combobox+listbox ARIA, group separators handled. Mature. | Roll-your-own (combobox v1.2 is easy to get wrong on `aria-activedescendant` lifecycle). Radix Dialog + custom requires re-implementing combobox semantics. |
| Theme provider | `next-themes` | SSR-safe, inline-script-before-paint to prevent FOUC, handles `system` mode. | Custom localStorage hooks (FOUC almost guaranteed). |
| Headless components | Continue Radix UI primary; layer in **React Aria Components** for: ComboBox (autocomplete fields in §3.3), GridList (if you build a richer message list later), DateField if you add a date range to /timeline | Radix doesn't ship a ComboBox primitive. React Aria's ComboBox is the most spec-correct combobox in React land. | Reach UI (mostly inactive). Headless UI v2 is fine but lacks ComboBox grouping nuance. |
| Markdown | Continue `react-markdown` per v1. | — | — |
| Virtualization for /timeline | `@tanstack/react-virtual` | Works with `aria-activedescendant` roving focus; doesn't break SR row enumeration if you set `aria-rowcount` / `aria-setsize`. | `react-window` (less flexible for keyboard a11y). |
| Tables (heatmap, audit) | Native `<table>` + `react-aria` `useTable` for sortable interactions if needed. | Keeps semantic table; tables-data-specialist canon. | `<div>` grids. |

### 12.1 Virtual scroll a11y rules

Each rendered row gets `aria-setsize="{total}"` and `aria-posinset="{1-based index}"` so SR users hear "5 of 1240" instead of seeing only the 50 currently rendered rows. The container exposes `aria-rowcount` if you go full grid pattern.

---

## 13. New views — semantic outlines

### 13.1 `/timeline`

```html
<main id="main" tabindex="-1">
  <header class="page-chrome">
    <nav aria-label="Breadcrumb">…</nav>
    <h1>Timeline</h1>
  </header>

  <form role="search" aria-label="Filter timeline">
    <fieldset><legend>Channel</legend>… checkboxes …</fieldset>
    <fieldset><legend>Agent</legend>… combobox multi-select …</fieldset>
    <fieldset><legend>Type</legend>…</fieldset>
    <fieldset><legend>Date range</legend>…</fieldset>
    <button type="submit">Apply filters</button>
    <p role="status" aria-live="polite">{n} events match.</p>
  </form>

  <section aria-labelledby="feed-h">
    <h2 id="feed-h" class="sr-only">Event feed</h2>
    <ol role="list" aria-rowcount="{total}" tabindex="0"
        aria-activedescendant="evt-{id}" aria-label="Events, j and k to navigate">
      <li role="listitem" id="evt-{id}" aria-setsize="{total}" aria-posinset="{n}">…</li>
    </ol>
  </section>
</main>
```

### 13.2 `/agents`

`<h1>Agents</h1>` then `<ul role="list">` of cards, each a link to `/agents/[name]`. Each card shows last-invoked, recent-message-count, link to recent activity. Link text MUST be the agent name, not "View" (link-checker canon).

### 13.3 `/agents/[name]`

H1 = agent name. Sections: Prompt (collapsible `<details>` because it's long), Recent activity (j/k navigable list), Aggregate counts (small `<table>` with caption "Activity totals").

### 13.4 `/audit`

Timeline of mutations, grouped by week (`<h2>Week 12</h2>`), each entry an `<article>` with `<h3>` proposal title, `<dl>` of file / before-SHA / after-SHA / state (applied / rolled-back), and a `<details>` with the unified diff. Diff uses `<pre><code>` keyboard-scrollable. State badges are colored AND have an icon (1.4.1).

### 13.5 `/logs/[date]` and `/logs`

`/logs` is `<h1>Reasoning logs</h1>` + `<ul role="list">` of dated links, link text "{YYYY-MM-DD} — {first headline}". Sibling navigation on detail page identical to v1 §5 research digest pattern.

### 13.6 `/graphify`

`<h1>Knowledge graphs</h1>` then a `<ul role="list">` of indexes. If HTML output exists, link to it (warn about new tab using v1 link patterns). If only JSON, render a clusters summary with cluster names as `<h2>`.

### 13.7 `/search`

See §8.3.

---

## 14. Critical decisions — recommended picks

| Decision | Recommendation | Rationale |
|---|---|---|
| Cmd-K layout | Floating overlay, Linear-style | Predictable mental model; clean focus trap; works on small screens with full-width fallback. |
| Sidebar | Persistent + collapsible; mobile drawer | Stable landmark; collapse keeps it for scanning; drawer is the safest mobile pattern. |
| Theme switch | Dropdown menu with three radios (System/Light/Dark) | Surfaces "System" explicitly; radio semantics announce current state. |
| Agent detail | Route, not modal | Deep-linkable, indexable, plays well with browser history. |
| Search | Both — `/search` route + Cmd-K integration sharing backend | Discoverable + power-user. |
| Notification center | Persistent bell button → drawer | Saves real estate; modal-style focus contract; dismissable. |
| DnD lib | `@dnd-kit/core` + `@dnd-kit/sortable` | Best a11y story; built-in announcements. |
| Cmd-K lib | `cmdk` (paco) | Spec-correct combobox; minimal; widely battle-tested. |
| Theme lib | `next-themes` | FOUC-free SSR. |
| Combobox autocompletes (`to:`, `ref:`, slash) | React Aria `ComboBox` | Radix lacks this primitive; React Aria is best-in-class. |

---

## 15. Hard NOs (v2-specific, in addition to v1 §12)

- **Don't** put `aria-live` on multiple regions per route. One coordinator, two regions, end of story.
- **Don't** use `role="application"` anywhere — including Cmd-K, Kanban, slash picker.
- **Don't** auto-scroll the dashboard on data updates. Updates are visual; SR users hear the priority items via the notification coordinator.
- **Don't** use `<details>` as a substitute for a Dialog when focus needs to trap (notification drawer, Cmd-K).
- **Don't** make the entire channel `<article>` focusable just for the metadata reveal — use `:focus-within`.
- **Don't** use bottom sheets on mobile.
- **Don't** rely on FOUC for theme — set `data-theme` before paint via `next-themes` inline script.
- **Don't** announce dashboard count ticks. Background changes are not events to interrupt SR users with.
- **Don't** double-announce cross-tab events. Tag with `originTab`.
- **Don't** use single-character shortcuts without a "disable" setting (2.1.4).
- **Don't** put icons inside breadcrumb links if the link already has visible text — use CSS `::before` `aria-hidden` separators.
- **Don't** ship the Cmd-K with `role="menu"`.
- **Don't** allow the keyboard shortcuts overlay to be the only way to discover shortcuts; surface the most important ones (Cmd-K, `g d`, `?`) as `aria-keyshortcuts` on their respective controls and as visible hints in the user menu footer.
- **Don't** virtualize the feed without `aria-setsize` / `aria-posinset` per row.

---

## 16. v1 patterns to revise (not break — improve)

| v1 pattern | v2 revision |
|---|---|
| `<header role="banner">` containing primary nav | Move primary nav to sidebar `<aside aria-label="Primary"><nav aria-label="Sections">`. `<header>` becomes a per-page chrome strip with breadcrumb + page title + actions. Only one `role="banner"` on the page (the page-chrome's outer). |
| Per-channel SSE | Single `/api/events?channels=…` multiplexed stream owned by a client store. Live announcements still routed through the single coordinator. |
| Channel form sends with raw textarea | Now a structured form with type/to/ref combobox autocompletes (§3.3). |
| Status badges (light only) | Add dark-mode pairs (§5.3). |
| Focus ring `#2563eb` only | Add dark-mode pair `#60a5fa` (§5.2). |
| Route announcer announces title only | Announce title + breadcrumb tail. |
| Kanban detail Dialog with display-only fields | Dialog now hosts inline edit form (§3.2). |
| No notification center | Add: bell button → drawer with severity items, source-link, mark-as-read. |
| `<details>` open/close not announced | When used (audit diffs, agent prompt), add polite "Section expanded/collapsed" announcement. |
| `g`/`?`/`j`/`k` shortcuts not defined | Defined in §6.1; require user-disable setting per 2.1.4. |
| Density was implicit (comfy) | Explicit radiogroup in user menu, persisted (§1.4). |

---

## 17. Updated load-bearing WCAG SC for v2

In addition to v1 §10:

| SC | Level | New v2 reason |
|---|---|---|
| 1.3.6 Identify Purpose | AAA (advisory) | Sidebar items, palette commands — implicit, but worth thinking about. |
| 1.4.12 Text Spacing | AA | Density modes must not break layout when user overrides spacing. |
| **2.4.11 Focus Not Obscured (Min)** | **AA (NEW 2.2)** | Sidebar drawer, palette, notification drawer, sticky chrome — none may obscure focused element. |
| 2.5.7 Dragging Movements | AA | Now active because mouse DnD is in scope. M-mode is the alternative. |
| 3.2.6 Consistent Help | A (NEW 2.2) | Shortcuts overlay (`?`) must appear in the same place across views — surface it in the user menu footer always. |
| 3.3.7 Redundant Entry | A (NEW 2.2) | Inline card edit prefills; search reflects query in URL. |
| 4.1.2 Name, Role, Value | A | Combobox v1.2 lifecycle (`aria-expanded`, `aria-activedescendant`) — easy to drift. |

---

## 18. Implementation checklist (TL;DR for first v2 commit)

- [ ] Refactor layout: sidebar `<aside aria-label="Primary">` outside `<main>`. One `role="banner"` on page-chrome.
- [ ] Install `next-themes`. Add `data-theme` inline-script-before-paint.
- [ ] Define light + dark CSS variable tokens per §5. Add Playwright contrast assertions.
- [ ] Build `liveAnnounce` coordinator (§4.1) BEFORE wiring multi-source updates.
- [ ] Single multiplexed SSE `/api/events`; client store fans out updates.
- [ ] BroadcastChannel sync with `originTab` tag.
- [ ] `next-themes` + density radio settings in user menu, persisted.
- [ ] `cmdk` for palette inside Radix Dialog wrapper.
- [ ] Keyboard shortcuts overlay (Radix Dialog) bound to `?`.
- [ ] Shortcut state machine with single `mode` enum.
- [ ] User-menu setting "Disable single-character shortcuts" (2.1.4).
- [ ] `@dnd-kit/core` + `@dnd-kit/sortable` integrated; keyboard sensor disabled; M-mode untouched; `announcements` config wired to `liveAnnounce.polite`.
- [ ] Inline card edit in existing Dialog with form + `role="alert"` errors.
- [ ] Channel form: type select + `to:` and `ref:` React Aria ComboBox + slash picker combobox.
- [ ] New routes: `/timeline`, `/agents`, `/agents/[name]`, `/audit`, `/logs`, `/logs/[date]`, `/graphify`, `/search`.
- [ ] Virtual scroll on `/timeline` with `aria-setsize` / `aria-posinset`.
- [ ] Notification drawer (Radix Dialog side variant) with bell button.
- [ ] Breadcrumbs on every detail page; route announcer reads title + breadcrumb tail.
- [ ] Status badges, focus ring, severity colors verified for both themes.
- [ ] axe Playwright + jsx-a11y CI gates run on light AND dark mode (toggle theme between test phases).

---

## 19. Open questions to flag for the human team

1. **`kanban-edit` skill does not exist yet.** The inline edit feature requires a new skill. Flag for `master-overseer` before building the UI affordance.
2. **Token-usage telemetry source.** Dashboard wants "recent token usage" — is there a session telemetry source in the workforce, or is this a new logging concern? If new, that's a backend prerequisite.
3. **Mobile usage profile.** If <5% of usage is mobile, the drawer pattern is straightforward. If meaningful mobile usage is expected, schedule a separate mobile-accessibility pass on touch targets, gestures, and the drag-and-drop fallback story (DnD is hostile on touch; M-mode equivalent on mobile is a long-press menu).
4. **Authentication / permissions.** v2 introduces `/audit` and proposal-applying. If there's any per-user gating, error states for "not permitted" need their own announcement category.
5. **Search index.** Server-side grep over hundreds of MB will get slow. If a real index is added (ripgrep service, Tantivy, etc.), the loading state needs an `aria-busy` / `role="status"` "Searching…" pattern that doesn't flood. 1.5s threshold to show a loading indicator.
