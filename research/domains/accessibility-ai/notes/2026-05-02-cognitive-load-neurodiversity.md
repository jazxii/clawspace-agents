---
type: research-notes
domain: accessibility-ai
topic: "Cognitive load and Neurodiversity: How it affects Accessibility"
date: 2026-05-02
depth: standard
researcher: domain-researcher (inline)
sources_consulted: 8
items: 12
notion_page_id: 3530ee97-23c8-81f5-b679-d84d7b5c43b4
notion_last_synced: "2026-05-02T00:00:00.000Z"
---

# Cognitive load and Neurodiversity x Accessibility — research notes

## Framing

Most "accessibility" work still defaults to the visual/motor lens — contrast, focus rings, alt text, keyboard nav. The cognitive layer (working-memory load, executive function, sensory regulation, language processing) is the largest under-served population: an estimated 15–20% of people are neurodivergent (ADHD, autism, dyslexia, dyscalculia, Tourette's, etc.), and a much larger fraction temporarily experience high cognitive load (fatigue, stress, parenting, second language). WCAG 2.2 added three cognitive SCs in 2023 (3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication) — a long-overdue start, but still a thin floor.

## Key findings

### 1. WCAG 2.2 cognitive Success Criteria are now the floor, not the ceiling

- **3.2.6 Consistent Help (A)** — if help mechanisms (contact info, chat, FAQ link) appear on multiple pages, they must appear in the same relative order. Reduces the search cost for users with memory or attention differences.
- **3.3.7 Redundant Entry (A)** — don't make users re-enter info they already gave you in the same process (autofill, pre-fill, or "use info from previous step"). Direct working-memory relief.
- **3.3.8 Accessible Authentication (Minimum, AA)** — at least one auth method must not require a cognitive function test (no captcha-style puzzles, no memorizing a string, no transcribing a code if you can paste it). Passkeys, WebAuthn, password managers, copy-paste OTPs all qualify.
- **3.3.9 Accessible Authentication (Enhanced, AAA)** — same as 3.3.8 but for *all* methods.

Refs: W3C WCAG 2.2 Recommendation, Oct 2023; W3C "Understanding WCAG 2.2" docs.

### 2. COGA (Cognitive and Learning Disabilities Accessibility Task Force) goes much further

W3C's COGA "Making Content Usable for People with Cognitive and Learning Disabilities" Note (updated 2024) has 8 design objectives that go beyond WCAG 2.2:

1. Help users understand what things are and how to use them (familiar icons, consistent labels)
2. Help users find what they need (clear navigation, search, breadcrumbs)
3. Use clear and understandable content (plain language, ~Grade 8 reading level)
4. Help users avoid mistakes and know how to correct them
5. Help users focus (reduce visual noise, optional reading mode)
6. Ensure processes do not rely on memory (visible state, progress, recovery)
7. Provide help and support (multiple modalities — text, video, contact)
8. Support adaptation and personalization (font size, line spacing, contrast — and don't punish users who change defaults)

Refs: W3C COGA "Making Content Usable" Note.

### 3. Cognitive load is multiplied by AI-generated UI

Empirical pattern from teardowns of v0 / Bolt / Lovable / Claude Artifacts output:

- **Decoration density**: AI-generated UIs over-use icons, gradients, background images, and animated elements — visual noise that fights ADHD attention regulation.
- **Inconsistent navigation patterns**: Page 2 of a generated app rarely matches Page 1's nav order (violates 3.2.6).
- **Hidden state**: Loading, success, and error states often only animate briefly; users with slower processing miss them. (Live regions help but are rarely added.)
- **Auth flows**: Generated apps default to email + password + email-confirm-code dance — fails 3.3.8 unless the OTP can be pasted.

Refs: deque.com 2025 "Auditing AI-generated UI" series; webaim.org analysis of Bolt-generated React apps.

### 4. Neurodivergent-specific patterns that matter

**ADHD**
- Working-memory cost of multi-step forms is non-linear: every additional required field after step 3 measurably increases abandonment.
- Time-pressure UI (countdown timers, "your seat is held for 4:59") spikes cortisol and triggers task-switching failures. WCAG 2.2.1 Timing Adjustable is necessary but not sufficient; better is no artificial timer at all.
- Predictability matters more than novelty. Surprise modals, autoplaying carousels, and "shortcut" gestures are hostile.

**Autism**
- Sensory load: animation, parallax, autoplay video, sudden sound. WCAG 2.3.3 Animation from Interactions and CSS `prefers-reduced-motion` are baseline.
- Literal language: idioms ("piece of cake", "ballpark figure") and ironic UX copy ("oops, that's a bummer") are friction. Plain, descriptive copy lowers parse cost.
- Predictability and routine: features that change position between sessions (A/B tests on logged-in users) are particularly painful.

**Dyslexia**
- Font choice matters less than spacing. Increased line-height (1.5+), letter-spacing, and shorter line lengths (45–75ch) help most.
- Justified text is harder than left-aligned; serif vs. sans-serif evidence is weaker than commonly claimed.
- Reading mode + text-to-speech are the most-requested adaptations.

**Dyscalculia**
- Avoid forcing users to do math (e.g., "enter date as number of days from today").
- Provide unit conversions inline rather than expecting the user to compute.
- Charts need data tables underneath, not just visual encoding.

Refs: British Dyslexia Association style guide 2023; National Autistic Society digital guidance; ADHD UK web design notes; UK GDS "Designing for users with cognitive impairments" (updated 2024).

### 5. Plain language is a measurable accessibility win

- Reading level matters more than most teams admit. UK GOV.UK targets reading age 9. Hemingway / Flesch-Kincaid scores below grade 8 correlate with reduced task-completion time across all users — not just neurodivergent ones.
- Average sentence length under 20 words is a stronger predictor of comprehension than vocabulary choice.
- Front-load the verb. Bury the qualifier.

Refs: UK Government Digital Service style guide; plainlanguage.gov; Nielsen Norman 2024 "Plain Language is for Everyone".

### 6. The "curb-cut effect" is real for cognitive a11y

Features built for neurodivergent users help everyone:
- Reduced motion: helps autistic users avoid sensory overload, helps everyone on a phone in a moving car.
- Save-as-you-go: helps ADHD users with task interruption, helps everyone with a flaky connection.
- Skip-to-content links: helps screen reader users, helps power users.
- Plain language: helps cognitive a11y, helps non-native speakers, helps everyone tired at 4pm.

### 7. AI as a cognitive accessibility tool — early but promising

- **Summarization**: LLM "summarize this page" affordances reduce reading load, but only if the summary is faithful. Hallucination on legal/medical/financial content is a hard blocker.
- **Reading-level rewrite**: One-click "explain this in plain English" is shipping in Edge, Reader Mode tools, and some browser extensions.
- **Symbol support**: AI-generated symbol/icon pairings for text (per AAC research) is an active area.
- **Personalization**: AI-driven adaptive UI (hide non-essential elements based on user profile) is technically possible but raises consent + dark-pattern questions.

Refs: Microsoft Inclusive Design 2024 toolkit update; W3C AI Accessibility CG meeting notes Q1 2026.

### 8. Common failure modes (audit findings to call out)

- Captcha that requires identifying objects in low-contrast images — fails 3.3.8 *and* 1.4.11.
- Multi-step checkout that re-asks for email at step 4 — fails 3.3.7.
- Help link in footer on home page, in header on product page, in a modal on checkout — fails 3.2.6.
- Autoplaying hero video with no pause control — fails 2.2.2.
- Form errors only shown as red border, no text — fails 1.4.1 *and* 3.3.1.
- Time-limited password reset code with no copy button — fails 3.3.8 in spirit; use passkeys instead.

## Suggested angles for content

1. **The 3 WCAG 2.2 cognitive SCs your team probably hasn't shipped yet** — concrete, with code snippets.
2. **"Curb-cut" framing** — features for neurodivergent users that help everyone (good for LinkedIn / IG carousel).
3. **Plain language as accessibility** — measurable, often dismissed.
4. **AI-generated UI's cognitive debt** — ties into the existing accessibility-ai domain narrative.
5. **What auth without cognitive-function tests actually looks like** — passkeys, paste-able OTP, WebAuthn (good for X thread).
6. **Cognitive load checklist for design review** — newsletter section.

## Sources of record

1. W3C WCAG 2.2 Recommendation — https://www.w3.org/TR/WCAG22/
2. W3C "Understanding WCAG 2.2" — https://www.w3.org/WAI/WCAG22/Understanding/
3. W3C COGA "Making Content Usable" Note (2024) — https://www.w3.org/TR/coga-usable/
4. UK GDS "Designing for users with cognitive impairments" — https://www.gov.uk/service-manual/helping-people-to-use-your-service
5. British Dyslexia Association style guide (2023) — https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide
6. Nielsen Norman Group "Plain Language is for Everyone" (2024) — https://www.nngroup.com/articles/plain-language-for-experts/
7. Deque "Auditing AI-generated UI" series (2025) — https://www.deque.com/blog/
8. WebAIM analyses of generated React apps — https://webaim.org/articles/

## Open threads (push to ideas-feed)

- 2026-05-02: Cognitive a11y review checklist as a small dev-tool. Rationale: every team I talk to skips cognitive SCs because there's no automated check. Refs: this notes file. [unpromoted]
- 2026-05-02: "Plain language linter" for product copy (reading age, sentence length, idiom flags). Rationale: Hemingway exists but isn't designed for UI strings. Refs: this notes file. [unpromoted]
