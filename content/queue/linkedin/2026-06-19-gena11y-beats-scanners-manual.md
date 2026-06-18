---
platform: linkedin
status: ready
date: 2026-06-19
target_date: 2026-06-19
slug: gena11y-beats-scanners-manual
format: short
persona: researcher-news
topic_lane: 1
strategic_purpose: portfolio
anchor:
  type: study
  value: "GenA11y, He, Huq & Malek, Proc. ACM Softw. Eng. (FSE) 2025, UC Irvine SEAL - 37 WCAG success criteria at 94.5% precision / 87.61% recall, ~8 more violation types than existing tools"
char_count: 1541
word_count: 265
research_ref: https://seal.ics.uci.edu/publications/2025_FSE_GenA11y.pdf
hashtags: ["#DigitalAccessibility"]
image_prompt: "Editorial illustration, flat color blocks, no text. Subject: a coverage bar or layered band split into a solid 'automated' lower section and a larger newly-filled 'manual judgment' upper section, showing coverage extending past the old ceiling. Composition: vertical stacked bands, clean geometric, generous negative space. Style: clean editorial vector, muted analytical palette with one accent for the newly covered layer. Mood: clarifying, forward. Constraints: no text overlays, no watermarks, no people's faces, no logos."
links_in_comment: "https://seal.ics.uci.edu/publications/2025_FSE_GenA11y.pdf"
# WARNING: links in first comment are also penalised by LinkedIn algorithm as of early 2026.
# Use links_in_comment only when the CTA is essential. Place it manually after publishing.
save_prompt: ""
closing_question: "For the Non-Functional Testing (NFT) and Digital Accessibility (A11y) engineers reading this: where in your pipeline does a scanner hand off to a human today, and would you trust a Large Language Model (LLM) checker to narrow that gap?"
humanized: true
humanized_at: "2026-06-18T09:00:00Z"
---

The "scanners cap at around 57%" line has been my mental ceiling for years. A paper I read this week argues it does not have to be.

GenA11y, by He, Huq and Malek, in Proc. ACM Softw. Eng. (Foundations of Software Engineering, FSE) 2025 out of the UC Irvine SEAL group. It is a Large Language Model (LLM) based Web Content Accessibility Guidelines (WCAG) checker, and the numbers are the most concrete counter I have seen to that ceiling.

37 WCAG success criteria. 94.5% precision. 87.61% recall. On average it detects 8 more violation types than existing tools.

Here is the part that matters to me. Those extra types are not more of the same contrast-and-alt-text checks scanners already do. They land on the judgment-heavy manual criteria, the ones an axe-core or Pa11y run cannot reach because they need reasoning, not pattern matching.

I read it mid-stride on Bug Craft AI, where the open question has always been how much of the manual layer an LLM-grounded approach can actually defend without hallucinating requirements. GenA11y is the first result that makes me think the answer is "more than the 57% story allows."

So the framing shifts. The interesting claim is no longer "LLMs can match scanners." It is "LLMs can push coverage into the layer scanners were never going to touch."

That does not retire human auditors. It moves where they spend their attention.

For the NFT and A11y engineers reading this: where in your pipeline does a scanner hand off to a human today, and would you trust an LLM checker to narrow that gap?
