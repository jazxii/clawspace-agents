---
platform: linkedin
status: ready
date: 2026-06-25
slug: eaa-first-court-ruling-misread
format: authority
persona: contrarian-analyst
topic_lane: 1
strategic_purpose: portfolio
mood: balanced
anchor:
  type: observation
  value: "Tribunal judiciaire de Lille, 2026-05-05 — first EU court ruling under a national EAA transposition. Auchan E-Commerce (€144M revenue 2024) won on a jurisdictional revenue threshold (France's €250M Loi 2005-102 read as applying over the EAA's €2M microenterprise threshold), NOT on accessibility. Court called the site's accessibility 'fairly low' with strong/major failures across 13 of 19 audited sections. Claimants apiDV + Droit Pluriel appealed to the Cour d'appel de Douai 2026-05-07; appeal pending as of June 2026."
research_ref: research/domains/accessibility-ai/notes/2026-06-18-fresh-signal.md
hashtags: ["#DigitalAccessibility"]
image_prompt: "Dark navy background, sans-serif white text. Centered headline in quotes: 'Auchan wins'. Below it, struck through faintly, the word 'accessibility'. Beneath that, a clean two-line stat block in thin orange: '13 of 19 audited sections: strong or major WCAG failures' and 'Dismissed on a €250M revenue threshold, not on access'. Small footer: 'Tribunal judiciaire de Lille, May 2026. Appeal pending, Cour d'appel de Douai.' Practitioner aesthetic, no stock imagery, no logos."
links_in_comment: "https://www.deque.com/blog/frances-major-court-decision-supporting-digital-accessibility-under-the-eaa/ , https://silktide.com/blog/eaa-auchan-court-ruling/"
save_prompt: "Save this if your team ships into the EU and someone has already said the threshold protects you."
closing_question: "If you run a Non-Functional Testing (NFT) team shipping AI-generated UIs into the EU, is your accessibility evidence built to survive an audit, or just to clear a revenue threshold?"
humanized: true
humanized_at: "2026-06-25T07:55:00Z"
controversial_topic_angles: [5, 12]
char_count: 1929
word_count: 320
---

The first EU court ruling under the European Accessibility Act (EAA) landed last month, and the headline reading is wrong.

I went looking for the actual judgment after two accessibility blogs I trust read the same ruling in opposite directions. Silktide framed it as "do not read this as good news." Deque framed it as a decision supporting digital accessibility. Same court, same date, two reputable voices pointing different ways. So I pulled the facts.

On 2026-05-05 the Tribunal judiciaire de Lille ruled on a case French disability associations brought against Auchan after it missed the EAA deadline. Auchan won. The win is being passed around as proof that you can ship an inaccessible site and walk.

That is not what happened. The court dismissed on a jurisdictional revenue threshold. France's 2005 domestic law sets a €250M floor. The EAA transposition sets a €2M microenterprise floor. The court read them as overlapping and applied the higher number. Auchan E-Commerce, at €144M in 2024, fell below it. Case dismissed on reach, not on merit.

On the merits the court was blunt. It described the site's accessibility as "fairly low," with strong or major failures across 13 of the 19 audited sections. A court documented major Web Content Accessibility Guidelines (WCAG) failures and then declined to act because one French law was too small to apply.

So the real question is not "did Auchan win." It is what your team is optimising for. "We passed on a threshold" is not "we are accessible." Those are two different targets, and only one of them survives an audit.

The €250M-versus-€2M overlap is unresolved. The claimants appealed to the Cour d'appel de Douai two days later, and that appeal will set EAA reach across the EU.

If you run a Non-Functional Testing (NFT) team shipping AI-generated UIs into the EU, is your accessibility evidence built to survive an audit, or just to clear a revenue threshold?

#DigitalAccessibility
