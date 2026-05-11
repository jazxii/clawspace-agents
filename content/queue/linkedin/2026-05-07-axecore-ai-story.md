---
platform: linkedin
status: ready
date: 2026-05-07
slug: axecore-ai-story
format: story
calendar_slot: "Week 1 Thu — LinkedIn builder story"
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: ["#accessibility", "#a11y", "#axecore", "#aibuilders", "#wcag"]
image_prompt: "A laptop screen showing an axe-core terminal report with a long red list of WCAG violations, sticky notes on the bezel reading 'AI generated this in 4 minutes' and 'a11y debt: 23 issues'. Warm desk-lamp light, dark navy background, monospace text aesthetic, no people, accessible color palette."
humanized: true
humanized_at: "2026-05-07T08:00:00Z"
---

Four minutes to generate the UI. Twenty-three axe-core violations on first scan.

I had been telling product teams to run automated scans on AI-generated code for months. Last week I finally did it on a build of my own. A small dashboard. Four prompts to a coding agent. Looked clean in the browser.

Then I ran axe-core.

Twenty-three violations. Six color-contrast failures on muted secondary text. Four buttons with no accessible name, just an icon and a `title` attribute. Three `<div role="button">` blocks that the agent had wrapped around clickable cards instead of using a real `<button>`. Two modals built as `<div role="dialog">` with hand-rolled focus traps when `<dialog>` and `showModal()` would have done it for free. Form inputs with placeholder-as-label. A skipped heading level. The list kept going.

None of it was malicious. The AI wasn't being lazy. It was producing the patterns it had seen most often in training data, which is the patterns the web has the most of. The web is not very accessible. So the average is the average.

The part that stuck with me: axe-core caught 23 issues, and Deque's own data says it catches about 57% of WCAG issues automatically. So the real number was probably closer to 40. The cognitive accessibility failures, the plain-language gaps in error copy, the link text that read "click here" twice on the same screen, none of that showed up in the report. I had to read for those myself.

What I took away. AI codegen does not introduce new accessibility failure modes. It scales the existing ones. A team shipping a feature a week now ships a feature a day, with the same per-feature defect rate. Without an axe-core gate in CI, that compounds fast.

Running the scan took 30 seconds. Fixing the top six issues took an hour. The remaining ones became a backlog ticket.

Run the scanner on the next thing your AI tool builds. What did the report show you that the preview did not?

Source: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
