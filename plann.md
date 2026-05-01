Plan: Centralized Pipeline + UI Upgrades + Agent Runner
User decisions:

Hybrid agent runner (VS Code tasks + file watcher)
Notion UI: metadata/queue for pending syncs (no live preview)
Channels: team-based chat UX — All-hands=public, domain channels=team chats with all agents visible and interacting
Agents page filter broken — all show as "meta" because no tier/domain in frontmatter
STEP 1: Fix agent frontmatter (ALL 33 agents missing tier+domain)
Add after model: line in every .claude/agents/*.md:

Agent	tier	domain
master-overseer	4	meta
self-evolution-proposer	4	meta
proposal-applier	4	meta
daily-content-supervisor	3	content
daily-project-supervisor	3	projects
daily-research-supervisor	3	research
content-domain-lead	2	content
project-domain-lead	2	projects
research-domain-lead	2	research
research-to-content-orchestrator	2	research
linkedin-writer	1	content
instagram-writer	1	content
x-writer	1	content
hook-crafter	1	content
hashtag-strategist	1	content
image-prompt-writer	1	content
content-calendar-planner	1	content
engagement-analyzer	1	content
notion-publisher	1	content
notion-db-manager	1	content
humanizer	1	content
content-repurposer	1	content
scrum-master	1	projects
prd-keeper	1	projects
kanban-secretary	1	projects
dev-researcher	1	projects
scaling-ideator	1	projects
domain-researcher	1	research
notebooklm-bridge	1	research
source-curator	1	research
trend-spotter	1	research
weekly-digest-composer	1	research
newsletter-writer	1	research
Also update FALLBACK_AGENTS in ui/lib/fs-adapter.ts to add 4 new agents.

STEP 2: Pipeline bus logging
Update these agents to post started/done bus messages:

research-to-content-orchestrator: generate pipeline_id, post at each of 9 steps
humanizer: post started/done to bus/content
linkedin-writer, instagram-writer, x-writer: post "started" before writing
notion-db-manager: post per-DB status during sync
STEP 3: Notion UI rewrite (6 DBs)
Files: ui/app/notion/NotionClient.tsx, ui/lib/fs-adapter.ts, ui/app/notion/page.tsx

New readNotionSyncState():

Read .notion-sync.json for 6 DB IDs
Read content/queue/**/*.md for pending content items
Read bus/content.jsonl for conflict messages
Return: { dbs: NotionDBInfo[], pendingItems: QueueItem[], conflicts: ConflictItem[] }
New NotionClient:

Auto-detect connection from .notion-sync.json (no manual token form)
6-tab view: Content Queue | Digests | Calendar | Sources | Newsletter | Ideas
Each tab: pending items count, last sync, "Sync DB" button
Global "Full sync" button → posts to bus targeting notion-db-manager
Pending queue table: items not yet synced with status/platform/date
STEP 4: Channels UX overhaul
Files: ui/app/channels/page.tsx, ui/app/channels/[channel]/_components/ChannelView.tsx

Channel index redesign:

All-hands: public group icon, "Public" badge
content/projects/research/meta: team chat icons with domain color
research-to-content/humanizer: pipeline channels with pipeline icon
dm-*: DM conversations
Active agent count per channel, last message preview + timestamp
ChannelView enhancements:

"Team members" sidebar: all agents in that domain with tier badges
Agent avatars with domain color dots
Messages show full agent identity (tier badge + domain color)
"Invoke agent" button: pick from team, post task message
Pipeline messages get special rendering (step progress)
STEP 5: Hybrid agent runner
.vscode/tasks.json:

Individual per-agent tasks
"Run Pipeline" compound task
"Dev + Agents" compound task
.claude/mcp/agent-watcher.mjs:

chokidar watches bus/*.jsonl for new lines
On type=task with to=, spawn claude agent
Track running, prevent duplicates, log to bus/meta
ui/package.json:

"dev:full": "concurrently "next dev -p 3001" "node ../.claude/mcp/agent-watcher.mjs""


Enhance the Channels view properly where All-hands shows like a Public group with all chats and other channels are team based chats between Agents of specific domain with Tier 1 to Tier 4 level agents available. I need proper UX flows here and need humanized based chat between every agents. Not just some. All the agents when invoked have to come available and chat accordingly in helping out the process inside a Team or on All-hands channel accordingly. 

Also the agents page filter tab is wrongly implemented. like all are meta and not content,project based filtered when clicked