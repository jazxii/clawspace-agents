---
platform: x
status: ready
date: 2026-05-23
slug: webaccessbench-19-model-teardown
format: thread
slot: morning
persona: forensic-investigator
topic_lane: 1
strategic_purpose: portfolio
mood: controversial
anchor:
  type: benchmark
  value: "WebAccessBench (Feb 2026, conesible.de/wab): 19 LLMs evaluated on digital accessibility across three guidance conditions (Unguided, Little, Expert). Companion: arXiv 2509.18965 PDF accessibility benchmark, GPT-4-Turbo led at 0.85 overall, all models failed on 'Not Present' and 'Cannot Tell' alt-text quality labels."
research_ref: research/domains/accessibility-ai/notes/2026-05-23.md
hashtags: []
links_in_comment: "https://conesible.de/wab/whitepaper_webaccessbench.pdf"
humanized: true
humanized_at: "2026-05-23T13:18:00Z"
controversial_topic_angles: [4]
tweet_count: 7
---

## 1

read WebAccessBench this week. feb 2026, 19 LLMs evaluated on digital accessibility reliability. first peer-reviewed cross-model accessibility benchmark i have seen. six things in the methodology that should change how teams talk about "AI alt-text."

## 2

three guidance conditions: Unguided, Little, Expert. all 19 models improve from Unguided to Little on average error count. 18 of 19 improve from Unguided to Expert. one model regressed under Expert guidance, which is the more interesting data point.

## 3

the regression matters. it means there exists at least one model where adding more accessibility context made the output less compliant. that is the opposite of how the "more guidance is always better" narrative reads.

## 4

companion paper arXiv 2509.18965 evaluates PDF accessibility across seven criteria. GPT-4-Turbo led at 0.85 overall accuracy. nobody crossed 0.9. the published ceiling on AI accessibility evaluation right now is 0.85.

## 5

the specific failure mode in the PDF benchmark is "Not Present" and "Cannot Tell" labels on alt-text quality. models confidently labelled missing alt-text as present, and unclear cases as decisive. both failure modes feed assistive-tech surfaces directly.

## 6

the takeaway for anyone shipping AI alt-text into production. the benchmark exists now. "good enough" is measurable, not a vibe. 0.85 is the published anchor. if your harness has not been run against WebAccessBench or 2509.18965, you do not have a number to defend.

## 7

if you have run your own alt-text generator against either benchmark, which model topped your run, and where did it break on "Cannot Tell"?
