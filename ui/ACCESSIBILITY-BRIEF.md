# Pre-Build Accessibility Brief — Clawspace UI (Phase 6)

Authored by `accessibility-agents:accessibility-lead` with input from aria-specialist, keyboard-navigator, live-region-controller, modal-specialist, forms-specialist, contrast-master, tables-data-specialist, link-checker. WCAG 2.2 AA is the floor. This document is the source-of-truth for Phase 6 implementation — every UI file in `ui/` must conform.

---

## 0. Global foundations (apply to every page)

### Document chrome
```html
<html lang="en">  <!-- WCAG 3.1.1 -->
  <head>
    <title>{Page Title} — Clawspace</title>  <!-- WCAG 2.4.2 -->
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <!-- NO maximum-scale, NO user-scalable=no — WCAG 1.4.4 -->
  </head>
```

### Root layout structure (`app/layout.tsx`)
```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>  <!-- WCAG 2.4.1 -->
  <header role="banner">
    <nav aria-label="Primary">
      <!-- Site nav: Dashboard, Kanban, Channels, Proposals, Research -->
    </nav>
  </header>
  <main id="main" tabindex="-1">
    {children}
  </main>
  <div id="live-region-polite" aria-live="polite" aria-atomic="false" class="sr-only"></div>
  <div id="live-region-assertive" aria-live="assertive" aria-atomic="false" role="alert" class="sr-only"></div>
</body>
```

The skip link must become visible on focus (not `display:none` — use `position:absolute; top:-40px` then `top:0` on `:focus`).

### Route change focus management (App Router)
Next.js does NOT move focus on client-side navigation. Implement a `<RouteAnnouncer>` client component:
1. On `usePathname()` change, move focus to `<main>` via `ref.focus()`.
2. Push the new page title into `#live-region-polite` so SR users hear "Kanban — LinkedIn" announced. (WCAG 2.4.3, 4.1.3)

### Tailwind base
- Define focus ring tokens once: `ring-2 ring-offset-2 ring-blue-600` — verify the pair against page background hits 3:1 (WCAG 2.4.11, 1.4.11).
- Never `outline: none` without a replacement ring (WCAG 2.4.7).
- Set `:focus-visible` styles, not `:focus`, for keyboard-only indication.

---

## 1. Dashboard (`/`)

### Semantic structure
```html
<main id="main" tabindex="-1">
  <h1>Today — {YYYY-MM-DD}</h1>

  <section aria-labelledby="domains-heading">
    <h2 id="domains-heading">Domain snapshots</h2>
    <ul role="list">
      <li><article aria-labelledby="content-h"><h3 id="content-h">Content</h3>…</article></li>
      <li><article aria-labelledby="projects-h"><h3 id="projects-h">Projects</h3>…</article></li>
      <li><article aria-labelledby="research-h"><h3 id="research-h">Research</h3>…</article></li>
      <li><article aria-labelledby="meta-h"><h3 id="meta-h">Meta health</h3>…</article></li>
    </ul>
  </section>

  <section aria-labelledby="bus-heading">
    <h2 id="bus-heading">Latest bus activity</h2>
    <ol>…last 5–10 headlines, each a link to /channels/{ch}#{ts}…</ol>
  </section>

  <section aria-labelledby="log-heading">
    <h2 id="log-heading">Today's reasoning log</h2>
    <a href="/logs/{date}">View full log</a>
  </section>

  <section aria-labelledby="proposals-heading" aria-describedby="proposals-count">
    <h2 id="proposals-heading">Pending proposals</h2>
    <p id="proposals-count">{n} proposals awaiting review</p>
    <a href="/proposals" class="cta">Review proposals</a>
  </section>
</main>
```

### Status indicators
Health badges (green/yellow/red) MUST include text or icon + text — never color alone (WCAG 1.4.1):
```html
<span class="badge badge--ok"><svg aria-hidden="true">…</svg> Healthy</span>
```

---

## 2. Kanban view (`/kanban/[board]`)

### The reorder pattern decision

**Use the WAI-ARIA Listbox-with-grouping pattern, NOT the grid pattern, NOT native drag-and-drop.**

Multiple `role="listbox"` regions, one per column, with arrow-key navigation within and a "lift / drop" mode for cross-column moves. This is what Atlassian, Trello, and the WAI-ARIA Authoring Practices reorderable-listbox example all converge on.

### Markup
```html
<main id="main" tabindex="-1">
  <h1>Kanban — {board name}</h1>

  <p id="kanban-instructions" class="sr-only">
    Use arrow keys to move between cards. Press Space or Enter to pick up a card.
    Use left and right arrow keys to move between columns when a card is picked up.
    Press Space or Enter again to drop. Press Escape to cancel.
  </p>

  <div class="board" role="group" aria-label="{Board} board" aria-describedby="kanban-instructions">
    <section aria-labelledby="col-backlog">
      <h2 id="col-backlog">Backlog <span aria-label="3 cards">(3)</span></h2>
      <ul role="listbox" aria-labelledby="col-backlog" aria-activedescendant="card-001" tabindex="0">
        <li role="option" id="card-001" aria-selected="true" aria-grabbed="false">
          <span class="card-title">Draft Q2 LinkedIn series</span>
          <span class="card-meta">card-001 · 3 ACs</span>
        </li>
        …
      </ul>
    </section>
    <!-- Repeat for Drafting / Ready / Posted -->
  </div>
</main>
```

### Key bindings (exact)

| Key | Action |
|-----|--------|
| Tab | Move between columns (each listbox is one tab stop) |
| ArrowDown / ArrowUp | Move active card within column |
| Home / End | First / last card in column |
| Enter or Space | Open card detail dialog (idle mode) |
| **M** | "Move mode" — pick up card. Announce: "Picked up {title}." |
| ArrowLeft / ArrowRight (in move mode) | Move card to adjacent column |
| ArrowDown / ArrowUp (in move mode) | Reorder within column |
| Enter or Space (in move mode) | Drop. Announce: "{title} moved to {column}, position {n} of {m}." |
| Escape (in move mode) | Cancel. Announce: "Move cancelled." |

(WCAG 2.1.4 Character Key Shortcuts: M is scoped to listbox focus only.)

### Drag-and-drop (optional progressive enhancement)
If/when added, use `@dnd-kit/core` (best a11y story). Avoid `react-beautiful-dnd` (unmaintained) and HTML5 DnD (poor a11y).

### Cross-column move announcement
On drop completion, push to `#live-region-polite`:
> "card-001 moved from Backlog to Drafting, position 2 of 4."

### Note
Kanban is NOT a table. Do not use `<table>` + `role="grid"`. Hierarchical (column → cards), not tabular.

---

## 3. Channels view (`/channels/[channel]`)

### Semantic structure
```html
<div class="channels-layout">
  <aside aria-label="Channels">
    <h2 class="sr-only">Channel list</h2>
    <nav aria-label="Channels">
      <ul role="list">
        <li><a href="/channels/all-hands" aria-current="page">all-hands <span aria-label="2 unread">(2)</span></a></li>
        …
      </ul>
    </nav>
  </aside>

  <main id="main" tabindex="-1" aria-labelledby="channel-h">
    <header>
      <h1 id="channel-h"># {channel-name}</h1>
      <p class="channel-topic">{description}</p>
    </header>

    <section aria-labelledby="history-h" aria-describedby="history-instructions">
      <h2 id="history-h" class="sr-only">Message history</h2>
      <p id="history-instructions" class="sr-only">
        New messages appear at the bottom and are announced. Press {key} to pause announcements.
      </p>
      <ol class="messages" id="message-log">
        <li id="msg-{ts}">
          <article aria-labelledby="msg-{ts}-from" aria-describedby="msg-{ts}-time">
            <span id="msg-{ts}-from">{from}</span>
            <time id="msg-{ts}-time" datetime="{iso}">{relative}</time>
            <div class="msg-body">{body}</div>
          </article>
        </li>
      </ol>
    </section>

    <form aria-label="Post message">
      <label for="msg-input">Message</label>
      <textarea id="msg-input" name="body" required aria-describedby="msg-help"></textarea>
      <p id="msg-help">Enter to send, Shift+Enter for newline.</p>
      <button type="submit">Send</button>
    </form>
  </main>
</div>
```

### Live-region strategy

**Two-tier policy:**

1. **The `<ol id="message-log">` itself is NOT a live region.** Appending children to a live region with thousands of historical entries causes SR floods.
2. **A separate, dedicated `aria-live="polite"` sentinel** (the global `#live-region-polite`) gets the announcement text. Format: `"{from} in {channel}: {first 140 chars of body}"`.
3. **Throttling rules** (client-side):
   - Coalesce: ≥3 messages within 2 seconds → "3 new messages in {channel}, latest from {from}."
   - Debounce: never announce more than once per 1.5 seconds.
   - Max 200 chars per announcement.
   - `polite`, never `assertive` (assertive is for errors only).
4. **"User reading history" case** — track `isAtBottom`. If not at bottom: append message, do NOT scroll, do NOT announce. Show sticky button: `<button aria-live="polite">{n} new messages — jump to latest</button>`.
5. **prefers-reduced-motion**: scroll uses `'auto'` when reduced; `'smooth'` otherwise.
6. **Pause announcements toggle**: visible button sets `aria-live="off"` on the polite sentinel. (WCAG 2.2.2)

### Form
- `<label for>` not placeholder-as-label.
- Send error: announce to `#live-region-assertive`; render inline `role="alert"` near textarea.
- After successful send: clear textarea, return focus, announce "Message sent" politely.

---

## 4. Proposals view (`/proposals`)

### Detail page — proposal review form

```html
<main id="main" tabindex="-1">
  <h1>Week 12 proposal review</h1>

  <section aria-labelledby="retro-h">
    <h2 id="retro-h">Retrospective</h2>
    <h3>What worked</h3>…
    <h3>What dragged</h3>…
  </section>

  <form id="apply-form" aria-labelledby="diffs-h" aria-describedby="form-help">
    <h2 id="diffs-h">Proposed changes</h2>
    <p id="form-help">Select changes to apply, then submit. You'll see a confirmation step before any command runs.</p>

    <fieldset>
      <legend class="sr-only">Diff selections</legend>

      <div class="diff">
        <input type="checkbox" id="diff-1" name="apply" value="diff-1"
               aria-describedby="diff-1-rationale diff-1-risk diff-1-rev">
        <label for="diff-1"><strong>Diff 1:</strong> Update content-domain-lead delegation rule</label>
        <pre><code>{unified diff}</code></pre>
        <dl>
          <dt>Rationale</dt><dd id="diff-1-rationale">…</dd>
          <dt>Risk</dt><dd id="diff-1-risk">Low</dd>
          <dt>Reversibility</dt><dd id="diff-1-rev">Reversible</dd>
        </dl>
      </div>
      <!-- diffs 2–7 -->
    </fieldset>

    <div role="group" aria-labelledby="actions-h">
      <h2 id="actions-h" class="sr-only">Actions</h2>
      <button type="submit">Review selected and continue</button>
      <a href="/proposals">Cancel</a>
    </div>
  </form>
</main>
```

### Validation
- Submit with zero checkboxes: prevent default, focus first checkbox, render `<p role="alert" id="form-error">`, set `aria-describedby` on fieldset.
- `aria-invalid="true"` only after failed submit, not on initial load.

### Confirmation step
Route to `/proposals/[week]/confirm` — full-page focus is more accessible than a modal for confirmation. Shows the exact CLI command in `<pre><code>` with a "Copy command" button.

### Selection count live region
`<p aria-live="polite" id="selection-count">3 of 5 changes selected</p>` next to submit button.

---

## 5. Research digest view (`/research/digests/[week]`)

### Detail page
```html
<main id="main" tabindex="-1">
  <article aria-labelledby="digest-h">
    <header>
      <h1 id="digest-h">{Digest title}</h1>
      <p><time datetime="2026-W17">Week 17, 2026</time></p>
    </header>
    <!-- react-markdown output, with heading downshift -->
  </article>

  <nav aria-label="Digest navigation">
    <a href="/research/digests/2026-W16" rel="prev">← Previous: Week 16</a>
    <a href="/research/digests/2026-W18" rel="next">Next: Week 18 →</a>
  </nav>
</main>
```

### react-markdown configuration
- Override headings: markdown `#` becomes `<h2>` (page already has H1). Configure `components`: `h1: 'h2', h2: 'h3', h3: 'h4'`.
- Strip raw HTML.
- `remark-gfm` for tables. Tables with ≥4 rows get `aria-label` injected from preceding heading (rehype plugin or manual).
- Code blocks: `<pre>` keyboard-scrollable (`tabindex=0` + visible focus).

### Link text
Digest list link text MUST be the digest title or `"Week NN — {topic}"`, never "Read more" (WCAG 2.4.4).

---

## 6. Color & contrast (verified palette)

### Status badges (each ≥7:1 against white/slate-50)

| State | Text | Background | Ratio |
|---|---|---|---|
| Drafting | `#1e3a8a` blue-900 | `#dbeafe` blue-100 | 9.6:1 |
| Ready | `#14532d` green-900 | `#dcfce7` green-100 | 10.1:1 |
| Posted | `#475569` slate-600 | `#f1f5f9` slate-100 | 7.5:1 |
| In Progress | `#7c2d12` amber-900 | `#fef3c7` amber-100 | 9.8:1 |
| Review | `#581c87` purple-900 | `#f3e8ff` purple-100 | 9.4:1 |
| Done | `#14532d` | `#dcfce7` | 10.1:1 |

Add a leading icon for redundancy with color (WCAG 1.4.1).

### Severity colors

| Severity | Foreground | Background | Icon |
|---|---|---|---|
| Info | `#1e3a8a` | `#dbeafe` | ℹ |
| Warning | `#78350f` | `#fef3c7` | ⚠ |
| Error | `#7f1d1d` red-900 | `#fee2e2` red-100 | ✕ |

### Focus rings
- 2px solid + 2px offset, color `#2563eb` (blue-600) on light bg.
- Verify ≥3:1 against page bg AND element bg (WCAG 1.4.11, 2.4.11, 2.4.13).
- Never `outline: none` without replacement.

---

## 7. Modals / Kanban card detail

**Use Radix UI `Dialog` (or React Aria `Dialog`).** Hand-rolling focus traps is error-prone.

### Required behaviors
- Focus moves into dialog on open.
- Focus returns to triggering element on close.
- Escape closes.
- Tab cycles within dialog only.
- Outside content is `inert` (or `aria-hidden="true"` + `pointer-events:none`).
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to title.

```html
<div role="dialog" aria-modal="true" aria-labelledby="card-detail-h">
  <h2 id="card-detail-h">{card title}</h2>
  <dl>
    <dt>ID</dt><dd>card-001</dd>
    <dt>Column</dt><dd>Backlog</dd>
    <dt>Acceptance criteria</dt>
    <dd><ul role="list">…</ul></dd>
  </dl>
  <div role="group" aria-label="Card actions">
    <button>Move to Drafting</button>
    <button>Edit</button>
    <button>Close</button>
  </div>
</div>
```

---

## 8. Reduced motion (WCAG 2.3.3, 2.2.2)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Apply to: channels auto-scroll, Kanban move animations, toast transitions.

---

## 9. Screen reader testing plan

Per view, before merge:

**Dashboard** — page title announced; H1→H2 hierarchy correct; landmark nav lists banner+main; status badges read text not color.

**Kanban** — listbox name+role+count announced per column; arrow keys move active option with announcement; M picks up; arrow Left/Right in move mode moves between columns; drop announces final position; Escape cancels with announcement; card detail dialog: focus in, Tab stays inside, Escape closes, focus returns.

**Channels** — channel switch: H1 announced once; messages at idle: polite announcement; 5+ in 2s: one coalesced; user scrolled up: NO auto-scroll, "N new messages" button reachable; pause toggle silences; form label visible; send errors announce.

**Proposals** — diff checkbox label includes diff number+headline; rationale/risk/reversibility associated via `aria-describedby`; submit-with-zero: error announced + focus moves; selection count updates politely.

**Research digest** — H1 is digest title; markdown starts at H2; tables have captions; code blocks keyboard-scrollable; prev/next nav reachable.

**Automated CI**:
- `axe-core` via `@axe-core/playwright` — zero violations gate.
- `eslint-plugin-jsx-a11y` recommended — zero warnings gate.
- Lighthouse a11y ≥95 (informational).

---

## 10. Load-bearing WCAG 2.2 SC for THIS UI

| SC | Level | Why |
|---|---|---|
| 1.3.1 Info and Relationships | A | Kanban columns, message structure, form labels, diff fieldsets |
| 1.4.3 Contrast (Minimum) | AA | Status badges, severity colors |
| 1.4.10 Reflow | AA | Channels three-pane at 320px |
| 1.4.11 Non-text Contrast | AA | Focus rings, badge boundaries |
| 1.4.13 Content on Hover or Focus | AA | Tooltips dismissable + persistent |
| 2.1.1 Keyboard | A | Every Kanban move, every checkbox reachable |
| 2.1.4 Character Key Shortcuts | A | M-to-pick-up scoped to listbox focus |
| 2.2.2 Pause, Stop, Hide | A | Pause-announcements control |
| 2.4.3 Focus Order | A | Route changes, dialog open/close, drop completion |
| 2.4.7 Focus Visible | AA | All custom focus rings |
| **2.4.11 Focus Not Obscured (Min)** | **AA (NEW 2.2)** | Sticky channel header / "new messages" button must not cover focus |
| 2.4.13 Focus Appearance | AAA (advisory) | 2px ring + offset + 3:1 |
| **2.5.7 Dragging Movements** | **AA (NEW 2.2)** | Mandates keyboard alternative to Kanban DnD |
| **2.5.8 Target Size (Minimum)** | **AA (NEW 2.2)** | All interactive ≥24×24 CSS px |
| 3.3.1 Error Identification | A | Proposal form validation |
| **3.3.7 Redundant Entry** | **A (NEW 2.2)** | Don't make users re-enter through confirmation |
| 4.1.3 Status Messages | AA | Channel announcements, form errors, "command copied", selection count |

**4 are new in WCAG 2.2** — easy to miss because most component libraries pre-date them.

---

## 11. Implementation checklist (TL;DR for first commit)

- [ ] `<html lang="en">`, descriptive `<title>` per route.
- [ ] Skip link in root layout, visible on focus.
- [ ] `<main id="main" tabindex="-1">`; route announcer focuses it on navigation.
- [ ] Two global live regions: polite + assertive.
- [ ] Tailwind `:focus-visible` ring tokens defined and audited for 3:1.
- [ ] Reduced-motion media query global rule.
- [ ] `axe-playwright` + `jsx-a11y` ESLint set up before view code.
- [ ] Radix UI for Dialog (and Checkbox if consistency wanted).
- [ ] `@dnd-kit/core` if/when mouse drag is added — keyboard pattern goes in first.
- [ ] One H1 per route; markdown rendering downshifts headings.
- [ ] Status badges always carry icon + text.

---

## 12. Hard NOs

- **Don't** skin Kanban with `role="grid"`.
- **Don't** put `aria-live` on the message log itself.
- **Don't** auto-scroll when user has scrolled up.
- **Don't** ship a custom modal — use Radix or React Aria.
- **Don't** rely on `aria-grabbed` (deprecated).
- **Don't** use placeholder as the only label.
- **Don't** auto-apply proposals.
