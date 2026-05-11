---
platform: linkedin
status: ready
date: 2026-05-25
slug: alt-text-benchmark-gap
format: opinion
calendar_slot: "Reactive — alt-text LLM benchmark research gap"
research_ref: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
hashtags: ["#accessibility", "#a11y", "#llm", "#alttext", "#research"]
image_prompt: "A blank academic-style benchmark table with column headers 'GPT-4o', 'Claude', 'Gemini', and rows for 'decorative', 'informative', 'complex'. All cells empty with question marks. Clean academic paper aesthetic, accessible monochrome with one orange accent, no people."
humanized: true
humanized_at: "2026-05-07T10:00:00Z"
---

There is no peer-reviewed benchmark comparing GPT-4o, Claude, and Gemini on alt-text quality. As of May 2026, I cannot find one. I have looked.

This is strange. We have benchmarks for everything else. MMLU. GPQA. SWE-bench. WritingBench. The major LLM eval ecosystem covers reasoning, coding, math, writing, and an expanding list of niche tasks. Image description for accessibility is not one of them.

ASSETS, the ACM SIGACCESS conference, would be the natural venue. The 2025 proceedings do not have it either.

Why this gap matters.

Frontier LLMs are now the default alt-text generator for millions of images per day. Slack. Notion. Microsoft Office. Apple Photos. Every CMS with an "AI alt text" toggle. The model behind that toggle is making a quality decision that affects the experience of every blind and low-vision user on the platform.

Without a benchmark, the comparison is anecdote. "Claude seems better at decorative." "GPT-4o is more verbose." "Gemini hallucinates landmarks." All probably true. None measurable.

What the benchmark needs to look like.

A standardised image corpus. Photographs, diagrams, charts, screenshots, decorative graphics, complex infographics. A few hundred images, balanced across categories.

Multiple human raters. Ideally a mix of sighted experts and blind end users. Inter-rater agreement reported.

Per-category scoring. "Decorative correctly identified as decorative." "Informative description matches the image's role in context." "Charts described with the right level of data summary." "Screenshots with text content captured."

Failure mode tagging. Hallucination. Over-description. Missing context. Wrong tone. Inappropriate for the role of the image on the page.

Open data. Open methodology. Reproducible.

I have started sketching the harness in my own notes. If anyone is already working on this, I would much rather collaborate than duplicate. ASSETS 2026 deadline is later this year. The window is open.

Is anyone running this benchmark? Or is the field really this quiet on it?

Source: research/domains/accessibility-ai/notes/2026-05-07-fresh-signal.md
