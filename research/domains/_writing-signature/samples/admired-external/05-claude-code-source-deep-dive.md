I spent this morning reading through Claude Code's leaked source code so you don't have to. What I found surprised me!

Anthropic built a full frustration detection system inside Claude Code. Six layers deep. And none of it is documented publicly. Here's what it's actually doing every time you use it:

1. It's scanning your messages for frustration phrases in real time. "Why did you do that." "That's not what I asked." "Try again."

If any of those fire, it logs it.

2. Every single prompt gets an is_negative flag. A separate analytics event fires on every message. If you type anything that sounds frustrated ie "this is broken", "wtf": that flag flips to true.

Anthropic tracks this rate across their entire user base, every day.

3. After your session ends, an LLM reads the full transcript and labels it. Frustrated. Dissatisfied. Satisfied. Happy. Then it goes further, if the session was negative, it categorizes why.

Wrong approach. Misunderstood request. Buggy output. Excessive changes.

4. It tracks how many times you hit ESC lol. Every time you interrupted Claude mid-response, that got counted.

High interruption rate = something is off.

5. It turns your rejections into learning signals.

When you cancel a Claude action, a hint gets injected into context telling Claude to pay attention to your next message and save any corrections to memory.

6. Every 5 turns, it scans for corrections you've given. "No, do X instead." "Always use Y."

A side-channel LLM call picks these up and proposes updates to Claude's behavior automatically.

All of this lives inside Claude Code. It's Anthropic's internal observability stack for their own product.

However, when you deploy an AI Agent in your own product, you get none of it. You get the API. Tokens in, tokens out.

Anthropic knows when Claude Code is frustrating users at scale. They know which failure modes are trending after a model update. They can route bad sessions for human review.

You probably don't know any of that about your own agent. The teams that instrument for frustration catch problems 2-3 weeks before they show up in churn. The teams that don't are reverse-engineering lost users with nothing but logs.

That's exactly what we built Agnost AI for: frustration signals, session satisfaction scoring, friction labeling, across all your agents, without building the infrastructure yourself.
