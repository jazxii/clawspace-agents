---
name: linkedin-research
description: Pull verified research signal from LinkedIn posts by key domain figures and cross-verify against authoritative sources. Use when the user says "check LinkedIn for news", "pull LinkedIn updates", "get latest from LinkedIn", or "/linkedin-research <domain>". Defaults to accessibility-ai domain.
---

# LinkedIn Research Pull

Pull credible signal from LinkedIn posts and verified sources for a research domain. Every finding is cross-verified against at least one Tier 1 authoritative source before being written to notes.

## When to use

- User says "check LinkedIn for news", "pull LinkedIn updates", "research from LinkedIn"
- User invokes `/linkedin-research` (optionally with a domain slug)
- Weekly or on-demand enrichment run between full `domain-researcher` cycles

## Inputs

- `domain` (optional) — research domain slug, default: `accessibility-ai`
- `topics` (optional) — comma-separated focus keywords to override defaults

## Procedure

1. **Read domain context** — read `research/domains/<domain>/sources.md` to get the LinkedIn watch list (Tier 1 LinkedIn section) and `research/domains/<domain>/PRD.md` for key questions.

2. **Search LinkedIn signal** — use `mcp__exa__search` or `mcp__tavily__search` with `site:linkedin.com` filters for each person/org on the watch list AND for topic keywords. Target posts from the last 14 days. Queries:
   - `site:linkedin.com/posts "<key person name>" accessibility AI`
   - `site:linkedin.com/posts WCAG accessibility "AI-generated"`
   - `site:linkedin.com/pulse accessibility AI 2026`
   For each hit: extract claim, author, date, URL.

3. **Cross-verify every claim** — for each LinkedIn finding, verify the underlying claim against at least one Tier 1 authoritative source (W3C, Deque, TPGI, arXiv, CSUN proceedings, official vendor blog). Unverified claims are flagged `[unverified]` and NOT included in the main findings. They go to an "Unverified signals" section at the bottom of the note.

4. **Write research note** — output to `research/domains/<domain>/notes/YYYY-MM-DD-linkedin-signal.md` using the standard note format:
   - H2 per finding with: claim, verified source URL, LinkedIn source URL, author/org, date
   - `## Unverified signals` section at bottom for promising-but-unverified items
   - `## New ideas` section for dev/content ideas surfaced

5. **Update supporting files**:
   - Append any new NotebookLM prompts to `research/domains/<domain>/notebooklm-prompts.md` (mark `[staged]`)
   - Append new dev/content ideas to `research/domains/<domain>/ideas-feed.md`

6. **Post bus summary** — post done message to `bus/research.jsonl` via `bus.post` with count of verified findings, unverified signals, and new ideas. If `bus.post` is unavailable, document the message in the response.

## LinkedIn watch list (accessibility-ai domain defaults)

These people/orgs consistently produce verifiable signal. Read their recent posts first before broad keyword searches.

**Practitioners / researchers:**
- Adrian Roselli (`adrianroselli`) — WCAG, browser a11y, AI UI failures
- Léonie Watson (`tink`) — screen readers, ARIA, standards
- Steve Faulkner — WCAG co-editor, HTML spec
- Sarah Higley (`codingchaos`) — Microsoft, cognitive a11y
- Scott O'Hara (`scottaohara`) — native HTML, ARIA
- Sina Bahram — AI + disability intersection
- Marcy Sutton — a11y tooling, testing
- Heydon Pickering — inclusive design, ARIA
- Eric Bailey (`ericwbailey`) — a11y culture, color/contrast

**Orgs:**
- Deque Systems — axe-core releases, WCAG guidance
- TPGi — screen reader compatibility research
- AbilityNet — UK disability + tech
- WebAIM — surveys, screen reader stats
- W3C WAI — official WCAG/COGA updates
- Microsoft Accessibility — Windows, AI features
- Apple Accessibility — iOS, macOS, VoiceOver
- Google Accessibility — Android, Chrome

## Cross-verification sources

| Claim type | Verify against |
|---|---|
| WCAG / standards update | w3.org/WAI/news or w3.org/TR/wcag* |
| Tool release / update | GitHub releases page or official blog |
| Research finding | arXiv, ACM DL, or ASSETS proceedings |
| Screen reader behavior | TPGi blog, Léonie Watson's tink.uk, or WebAIM SR survey |
| Browser/platform update | MDN, Chrome status, WebKit blog |
| Legal / regulatory | Federal Register, official gov site |
| Stats / benchmarks | Deque published reports, WebAIM Million |

## Note format

```markdown
# LinkedIn Signal — <domain> — YYYY-MM-DD

> Pulled from LinkedIn + cross-verified. Unverified items are at the bottom.

## 1. [Finding title]

**Claim:** One sentence summary.
**Verified source:** [Source name](url) — what it says.
**LinkedIn source:** [Author/Org on LinkedIn](url) — posted YYYY-MM-DD.
**Why it matters:** One sentence relevance to the domain's key questions.

---

## Unverified signals

> These appeared on LinkedIn but could not be cross-verified against a Tier 1 source within this run. Flag for manual follow-up.

- [Author] claimed X — source: [LinkedIn URL] — needs verification against: [suggested source]

## New ideas

- [Idea title]: one-line description
```

## Forbidden

- Never include a finding as verified without a Tier 1 source URL.
- Never search LinkedIn by scraping — use Exa or Tavily `site:` search only.
- Never post to LinkedIn — read-only signal pull.
- Never write to `bus/*.jsonl` directly — use `bus.post` tool.
