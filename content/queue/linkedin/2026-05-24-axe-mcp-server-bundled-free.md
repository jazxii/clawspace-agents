---
platform: linkedin
status: ready
date: 2026-05-24
slug: axe-mcp-server-bundled-free
format: authority
persona: practitioner-builder
topic_lane: 1
strategic_purpose: portfolio
mood: balanced
anchor:
  type: tool_release
  value: "Deque Axe MCP Server, now bundled into Axe DevTools for Web at no additional cost as of May 2026. Powered by the Axe DevTools engine (axe-core 4.11.x), covering WCAG 2.2 SCs including focus appearance (2.4.11/12) and accessible authentication (3.3.8). Public GitHub: dequelabs/axe-mcp-server-public. Web-only currently; native mobile planned."
research_ref: research/domains/accessibility-ai/notes/2026-05-23.md
hashtags: ["#DigitalAccessibility"]
image_prompt: "Dark navy background, builder aesthetic. Center: a terminal-style card showing an MCP tool call: 'axe.scan(url)' with a compact JSON response listing three WCAG violations by SC number. In the corner, small label: 'axe-core 4.11.x, WCAG 2.2 coverage'. Bottom annotation: 'Production accessibility scanner. Now in your IDE context window.' Monospace font, white on navy, no stock imagery."
links_in_comment: "https://www.deque.com/axe/mcp-server/"
save_prompt: "Save this if you are evaluating in-context accessibility scanning for an AI-generated UI pipeline."
closing_question: "If you have benchmarked in-context MCP-based scanning against axe-core CLI on the same AI-generated UI corpus, what was the false-positive delta?"
humanized: true
humanized_at: "2026-05-24T16:45:00Z"
char_count: 1842
word_count: 271
---

The Axe MCP Server is now bundled into Axe DevTools for Web at no additional cost. That happened quietly in May 2026, and I think it changes one specific calculation for teams running AI-generated UI pipelines.

Some background on what it actually is. The Axe MCP Server is not a new rule engine. It runs on the Axe DevTools engine, which wraps axe-core 4.11.x, so it inherits the full WCAG 2.2 rule set including the newer success criteria: focus appearance (SC 2.4.11 and 2.4.12) and accessible authentication (SC 3.3.8). The public repository is `dequelabs/axe-mcp-server-public`. Web-only for now; native mobile is on the roadmap.

What this changes. Before this bundling, the path to in-context accessibility scanning inside an agent loop was axe-core CLI over a subprocess call, or Pa11y via REST, or a custom wrapper. Those work, but they sit outside the context window. The Model Context Protocol (MCP) Server puts the scanner in the same context window as the code being generated, which means an agent can read a violation, see the relevant WCAG criterion, and attempt remediation without a round-trip.

When building Bug Craft AI, I have been treating axe-core CLI as the baseline scanner in the audit pipeline. The no-cost bundling of the MCP Server means the benchmarking question changes: it is no longer "can we afford the DevTools license for in-context scanning?" It is "what is the false-positive rate of MCP-based in-context scanning vs axe-core CLI baseline on the same AI-generated corpus?"

That is the data I am planning to produce against v0/Bolt/Lovable output this quarter.

Web-only coverage is the real constraint. Teams shipping native mobile AI-generated UIs still need a separate path.

If you have benchmarked in-context MCP-based scanning against axe-core CLI on the same AI-generated UI corpus, what was the false-positive delta?

#DigitalAccessibility
