---
platform: linkedin
status: ready
date: 2026-05-29
slug: dynamic-workflows-a11y-audit
persona: a11y-ai-engineer
voice: hungry-learner
topic_lane: 1
strategic_purpose: portfolio
mood: curious-enthusiast
anchor:
  type: feature_release
  value: "Claude Opus 4.8 Dynamic Workflows (research preview, May 28, 2026): JavaScript orchestration scripts Claude writes for a task. Subagents run in parallel attacking from independent angles; other agents try to refute findings; run iterates until answers converge; results verified before returning. Up to 16 concurrent agents, 1,000 total per run. Plan state lives in script variables, not the model's context."
hashtags: ["#AIEngineering", "#A11y"]
links_in_comment: "https://techcrunch.com/2026/05/28/anthropic-releases-opus-4-8-with-new-dynamic-workflow-tool/"
closing_question: "Convergence-based auditing or single-pass linting: which would you trust more on AI-generated UIs?"
humanized: true
humanized_at: "2026-05-29T15:10:00Z"
char_count: 1140
---

Opus 4.8 can now run up to 1,000 subagents that argue with each other until they agree. I read that line and immediately wanted to aim them at a WCAG audit.

Here is how the new Dynamic Workflows run. Claude writes an orchestration script, launches parallel subagents to attack a problem from independent angles, then sends other agents to refute them. It keeps iterating until the answers converge, and verifies before anything reaches you.

Now picture that on a WCAG 2.2 audit. One agent checks focus order. Another challenges its conclusion. A third verifies against the actual success criterion. Disagreements get resolved instead of averaged, so you end up with a finding that survived an argument rather than one model's first guess.

This is the kind of thing I'll happily lose a weekend to. I want to wire it into my Bug Craft AI pipeline and watch what it catches. Single-pass linting finds the obvious violations. Convergence might finally surface the contested ones: the keyboard traps and reading-order bugs a single pass talks itself out of.

Convergence-based auditing or single-pass linting: which would you trust more on AI-generated UIs?

#AIEngineering #A11y
