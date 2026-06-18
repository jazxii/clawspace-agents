---
platform: x
status: ready
date: 2026-06-18
target_date: 2026-06-18
slug: llm-audit-hallucination-70pct
format: thread
slot: morning
persona: forensic-investigator
topic_lane: 1
strategic_purpose: portfolio
mood: controversial
anchor:
  type: study
  value: "Delnevo et al. empirical study (preprints.org; Tabular Accessibility Dataset lineage, MDPI Data 2025-09). GPT-4o mini flagged 512 WCAG 2.2 AA violations on Vue table components: 69.9% hallucinations, 20.1% fully correct, 34% overall accuracy. o3-mini: 79% accuracy, F1 0.85 on hallucination detection. Gemini 2.0 Flash in between."
char_count: 1737
research_ref: https://www.mdpi.com/2306-5729/10/9/149
hashtags: []
links_in_comment: "https://www.mdpi.com/2306-5729/10/9/149"
image_prompt: ""
humanized: true
humanized_at: "2026-06-18T07:20:00Z"
controversial_topic_angles: [4, 10]
tweet_count: 7
---

## 1

spent the weekend reading the Delnevo et al. accessibility-auditing study to pick a model for a Bug Craft AI audit pass. one number stopped me. an LLM flagged 512 Web Content Accessibility Guidelines (WCAG) violations on a set of table components. most were not real.

## 2

setup first. the study ran frontier models against Vue table components and scored every flagged WCAG 2.2 AA violation as correct, partially correct, or hallucinated. the question was simple. when an AI says it found an accessibility bug, how often is the bug actually there.

## 3

finding one. GPT-4o mini flagged those 512 violations and 69.9% were hallucinations. only 20.1% were fully correct. overall accuracy landed at 34%. as an auditor, that is two out of three findings sending you to chase a bug that does not exist.

## 4

finding two. o3-mini ran the same task at 79% accuracy, with an F1 of 0.85 on hallucination detection. same prompt, same components, same standard. the only variable that moved was the model, and the signal-to-noise ratio flipped completely.

## 5

finding three. Gemini 2.0 Flash sat between the two. so this is not one bad model against one good one. it is a spread wide enough that your choice of model decides whether the audit output is signal or a pile of false positives.

## 6

the unexpected part. people treat hallucination as a content problem, something you tidy up after. in an accessibility audit it is a failure mode. a hallucinated violation feeds a fix that ships to an assistive-tech surface, or it buries the one real bug under sixty fake ones.

## 7

if you are running LLM-driven accessibility checks in a Non-Functional Testing (NFT) pipeline, are you scoring your model's hallucination rate before you trust its findings, or reading every flag as real?
