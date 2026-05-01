---
type: newsletter
status: draft
format: standalone
topic: "Cognitive load and Neurodiversity: How it affects Accessibility"
research_domain: accessibility-ai
research_refs:
  - research/domains/accessibility-ai/notes/2026-05-02-cognitive-load-neurodiversity.md
created: 2026-05-02
humanized: true
humanized_against: research/domains/_writing-signature/profile.md
estimated_read_minutes: 5
notion_page_id: 3530ee97-23c8-8142-8571-eb10e07af32a
notion_last_synced: "2026-05-02T00:00:00.000Z"
---

# The accessibility layer most teams skip

Subject line options:
1. The accessibility layer most teams skip
2. WCAG 2.2 added three criteria. Did your team ship them?
3. Cognitive load is an accessibility problem

---

I spent last week reviewing four production audits. All from teams that take accessibility seriously. All running automated tools. All shipping fixes against findings.

All four reports had the same shape: contrast, alt text, focus order, ARIA roles. Solid work.

Not one of them mentioned cognitive load.

That's the gap I want to talk about.

## The under-served population

Roughly 15 to 20% of people are neurodivergent. ADHD, autism, dyslexia, dyscalculia, Tourette's, and the long tail beyond. That's a lower bound. Add the much larger group in temporarily high-load states. Tired, stressed, parenting a toddler, learning the language, recovering from a migraine. The cognitive accessibility audience is the biggest one your product has.

It's also the one most a11y tooling can't see. Axe-core can flag a missing `alt`. It can't tell you that your checkout asks for the same email four times.

## What WCAG 2.2 actually requires now

The 2023 update added three cognitive Success Criteria. They are the new legal and ethical floor in most jurisdictions. Most teams I work with haven't shipped them yet.

**3.2.6 Consistent Help (Level A).** If you offer help mechanisms (contact link, chat widget, FAQ pointer) on more than one page, they appear in the same relative order. The user shouldn't have to re-learn where help lives.

**3.3.7 Redundant Entry (Level A).** Within the same process, don't ask for information the user has already provided. Pre-fill it. Carry it forward. Reference it.

**3.3.8 Accessible Authentication, Minimum (Level AA).** At least one method of authentication must not require a cognitive function test. Translation: no captcha puzzles, no requiring users to memorize and re-type a code they can't paste, no "transcribe these characters from this image". Passkeys, WebAuthn, password-manager autofill, and paste-able one-time codes all qualify.

These are not aspirational. They are the bar.

## The W3C COGA ceiling

Beyond WCAG 2.2, W3C's COGA Task Force published a much richer guide called "Making Content Usable for People with Cognitive and Learning Disabilities" (updated 2024). It has eight design objectives. The shortest version:

1. Make things obvious.
2. Make navigation findable.
3. Use plain language.
4. Help users avoid and recover from mistakes.
5. Reduce distraction.
6. Don't rely on memory.
7. Provide help in multiple formats.
8. Allow personalization without punishing it.

If you only do one, do number 6: don't rely on memory. Show state. Save progress. Make every step recoverable.

## What this looks like in code

A small change set that addresses most of the above:

- **Forms**: Add `autocomplete` attributes. Save draft state on `input` events. Show saved/saving status in a polite live region.
- **Auth**: Switch to passkeys where possible. Where you still send OTPs, make them paste-able. Drop the captcha or replace it with WebAuthn.
- **Navigation**: Lift help links into a consistent slot in the header. Same place, every page.
- **Copy**: Run product strings through Hemingway. Target reading age 9. Cut idioms. Front-load the verb.
- **Motion**: Wrap any transform/animation in a `@media (prefers-reduced-motion: no-preference)` block. Default off, opt-in on.

None of this requires a redesign. It's mostly small, surgical work.

## The curb-cut effect, with receipts

Every cognitive accessibility feature I just listed has a non-disabled secondary audience. Save-as-you-go helps ADHD users *and* everyone with bad train Wi-Fi. Plain language helps cognitive a11y *and* every non-native speaker *and* every tired person at 4pm. Predictable navigation helps autistic users *and* everyone navigating your product on a phone in one hand.

This is the cleanest "do good, ship better product" overlap I know.

## What I'm watching

- The W3C AI Accessibility CG published Q1 2026 meeting notes on AI-driven adaptive UIs. Promising, and a consent minefield.
- Edge and Reader Mode tools are quietly rolling out one-click "explain this in plain English" for arbitrary pages. The summarization fidelity is getting close to usable.
- COGA is drafting WCAG 3.0 contributions that would explicitly score cognitive load. Worth tracking.

## One thing to do this week

Pick one critical flow in your product. Walk it as a user with no working memory. No recall, no carry-over, no patience for the second captcha.

Note every place the product asks you to remember something it should already know. Fix the top three.

That's the work.

***

Reply and tell me which flow you walked. I'll feature the best teardown in the next issue.
