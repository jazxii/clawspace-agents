---
platform: x
status: ready
date: 2026-05-14
slug: dialog-jaws-take
format: standalone
slot: morning
research_ref: research/domains/accessibility-ai/notes/2026-05-04-weekly-themes.md
hashtags: []
humanized: true
humanized_at: "2026-05-05T00:00:00Z"
---

Native `<dialog>` behaved fine in NVDA and VoiceOver. JAWS read "link, dialog" on open. The problem wasn't JAWS. The trigger was an `<a role="button">`. If you're patching an `<a>` with role="button", the fix is just a `<button>`.
