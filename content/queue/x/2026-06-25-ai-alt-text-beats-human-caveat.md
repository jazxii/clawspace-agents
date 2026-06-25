---
platform: x
status: ready
date: 2026-06-25
slug: ai-alt-text-beats-human-caveat
format: thread
slot: morning
persona: researcher-news
topic_lane: 1
strategic_purpose: portfolio
anchor:
  type: study
  value: "arXiv 2602.08937 (2026-02-10) — 11 HCI experts rated AI-assisted alt text superior to human-only (accuracy U=2670 p=0.016; clarity U=2856.5 p=0.001); ETH heritage-collections counterweight: VLMs operationally viable but epistemically fragile"
research_ref: research/domains/accessibility-ai/notes/2026-06-18-fresh-signal.md
hashtags: []
links_in_comment: https://arxiv.org/pdf/2602.08937
humanized: true
humanized_at: "2026-06-25T07:55:00Z"
controversial_topic_angles: [4]
tweet_count: 7
---

## 1

I went looking for ammo. While scoping the alt-text layer for Bug Craft AI, I wanted the study that says AI-written alt text is still bad, so I could justify keeping a human in the loop. I found the opposite, and it changed my plan.

## 2

arXiv 2602.08937, posted Feb 2026. 11 HCI experts blind-rated alt text for research figures: human-only (written by disability service pros) vs AI-assisted. The AI-assisted text won. Not tied. Won.

## 3

The numbers, since I know you'll ask. Accuracy: U=2670, p=0.016. Clarity: U=2856.5, p=0.001. Experts dinged the human-only text for thin detail and for skipping how figure elements relate. Even with minor AI slips, the assisted version read better.

## 4

This reverses the line I'd been quoting for two years. AudioEye's 2024 framing was "most AI alt text is wrong." On expert ratings for complex figures, that's no longer the story. The good-enough bar got cleared while I wasn't looking.

## 5

So I started porting alt-text gen into the pipeline. Then I hit the ETH heritage study. Four Vision-Language Models (VLMs) on archival images: no quality gap, but recurring errors. Factual misrecognition. Selective omission. Reproducing harmful historical terms, uncritically.

## 6

Their verdict is the line I can't stop thinking about: VLMs are "operationally viable but epistemically fragile." Fluent, well-rated, and confidently wrong in ways a blind user can't catch. The alt text IS the image to them. A clean hallucination ships as truth.

## 7

So the bar moved, but not how the headline says. AI-assisted alt text now beats human-only on quality. The open problem isn't quality anymore, it's catching the confident wrong ones. If you ship VLM alt text, what's your catch layer for a hallucination no sighted reviewer flags?
