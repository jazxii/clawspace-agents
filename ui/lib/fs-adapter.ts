import "server-only";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Filesystem adapter for the Clawspace workforce. Server-only — never imported
 * by client components. Reads markdown and JSONL from the parent project root
 * (one level up from `ui/`).
 */

export const PROJECT_ROOT = path.resolve(process.cwd(), "..");

const within = (p: string) => path.resolve(PROJECT_ROOT, p);
function safeJoin(base: string, rel: string): string {
  const full = path.resolve(base, rel);
  if (!full.startsWith(base + path.sep) && full !== base) {
    throw new Error(`path escapes project root: ${rel}`);
  }
  return full;
}

// ---------- Bus channels ----------

export interface BusMessage {
  ts: string;
  ch: string;
  from: string;
  to?: string;
  type: string;
  body: string;
  ref?: string;
}

export async function listBusChannels(): Promise<string[]> {
  const dir = within("bus");
  if (!existsSync(dir)) return [];
  const entries = await fs.readdir(dir);
  return entries.filter((e) => e.endsWith(".jsonl")).map((e) => e.replace(/\.jsonl$/, "")).sort();
}

export async function readBusChannel(channel: string, opts?: { limit?: number; sinceTs?: string }): Promise<BusMessage[]> {
  if (!/^[a-z0-9][a-z0-9_\-]{0,63}$/.test(channel)) throw new Error("invalid channel");
  const file = safeJoin(within("bus"), `${channel}.jsonl`);
  if (!existsSync(file)) return [];
  const txt = await fs.readFile(file, "utf8");
  const all = txt
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        const raw = JSON.parse(l);
        if (raw.timestamp && !raw.ts) raw.ts = raw.timestamp;
        return raw as BusMessage;
      } catch {
        return null;
      }
    })
    .filter((m): m is BusMessage => !!m && typeof m.ts === "string");
  const filtered = opts?.sinceTs ? all.filter((m) => m.ts > opts.sinceTs!) : all;
  return opts?.limit ? filtered.slice(-opts.limit) : filtered;
}

export async function readLatestAcrossChannels(limit = 10): Promise<BusMessage[]> {
  const channels = await listBusChannels();
  const all: BusMessage[] = [];
  for (const ch of channels) {
    const msgs = await readBusChannel(ch, { limit: 20 });
    all.push(...msgs);
  }
  return all
    .filter((m) => typeof m.ts === "string")
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, limit);
}

// ---------- Kanban boards ----------

export interface KanbanCard {
  id: string;
  title: string;
  meta: string;
  acceptance: string[];
}
export interface KanbanColumn {
  name: string;
  cards: KanbanCard[];
}
export interface KanbanBoard {
  slug: string;
  path: string;
  columns: KanbanColumn[];
  countsLine?: string;
}

export async function listKanbanBoards(): Promise<{ slug: string; path: string; kind: "content" | "project" }[]> {
  const out: { slug: string; path: string; kind: "content" | "project" }[] = [];
  const kanbanDir = within("kanban");
  if (!existsSync(kanbanDir)) return out;
  const top = await fs.readdir(kanbanDir);
  for (const f of top) {
    if (f.endsWith(".md")) {
      out.push({ slug: f.replace(/\.md$/, ""), path: `kanban/${f}`, kind: "content" });
    }
  }
  const projDir = path.join(kanbanDir, "projects");
  if (existsSync(projDir)) {
    const projs = await fs.readdir(projDir);
    for (const f of projs) {
      if (f.endsWith(".md") && !f.startsWith("_")) {
        out.push({ slug: f.replace(/\.md$/, ""), path: `kanban/projects/${f}`, kind: "project" });
      }
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function readKanbanBoard(slug: string, kind: "content" | "project"): Promise<KanbanBoard | null> {
  if (!/^[a-z0-9][a-z0-9_\-]{0,40}$/.test(slug)) throw new Error("invalid slug");
  const rel = kind === "content" ? `kanban/${slug}.md` : `kanban/projects/${slug}.md`;
  const file = safeJoin(PROJECT_ROOT, rel);
  if (!existsSync(file)) return null;
  const txt = await fs.readFile(file, "utf8");
  return parseKanbanMarkdown(slug, rel, txt);
}

export function parseKanbanMarkdown(slug: string, p: string, txt: string): KanbanBoard {
  const lines = txt.split(/\r?\n/);
  const board: KanbanBoard = { slug, path: p, columns: [] };
  let currentCol: KanbanColumn | null = null;
  let currentCard: KanbanCard | null = null;
  for (const line of lines) {
    const countsMatch = line.match(/^<!--\s*counts:.*-->\s*$/);
    if (countsMatch) board.countsLine = line;
    const colMatch = line.match(/^##\s+(.+?)\s*$/);
    if (colMatch) {
      currentCol = { name: colMatch[1], cards: [] };
      board.columns.push(currentCol);
      currentCard = null;
      continue;
    }
    if (!currentCol) continue;
    const cardMatch = line.match(/^-\s+\[(card-[a-z0-9\-]+)\]\s+(.+?)(?:\s+—\s+(.*))?$/);
    if (cardMatch) {
      currentCard = { id: cardMatch[1], title: cardMatch[2].trim(), meta: cardMatch[3] ?? "", acceptance: [] };
      currentCol.cards.push(currentCard);
      continue;
    }
    const acMatch = line.match(/^\s{2,}-\s+Acceptance:\s+(.+)$/i);
    if (acMatch && currentCard) currentCard.acceptance.push(acMatch[1].trim());
  }
  return board;
}

// ---------- Kanban write-back ----------

export type KanbanKind = "content" | "project";

export interface KanbanReadResult {
  board: KanbanBoard;
  rawText: string;
  mtimeMs: number;
}

export async function readKanbanRaw(slug: string, kind: KanbanKind): Promise<KanbanReadResult | null> {
  if (!/^[a-z0-9][a-z0-9_\-]{0,40}$/.test(slug)) throw new Error("invalid slug");
  const rel = kind === "content" ? `kanban/${slug}.md` : `kanban/projects/${slug}.md`;
  const file = safeJoin(PROJECT_ROOT, rel);
  if (!existsSync(file)) return null;
  const [rawText, stat] = await Promise.all([fs.readFile(file, "utf8"), fs.stat(file)]);
  return {
    board: parseKanbanMarkdown(slug, rel, rawText),
    rawText,
    mtimeMs: stat.mtimeMs,
  };
}

/**
 * Atomic write: stages to `<file>.tmp.<random>` then renames. If `expectedMtimeMs`
 * is provided, throws if the file's mtime drifted (concurrent edit detected).
 */
export async function writeKanbanRaw(
  slug: string,
  kind: KanbanKind,
  newText: string,
  expectedMtimeMs?: number,
): Promise<{ mtimeMs: number }> {
  if (!/^[a-z0-9][a-z0-9_\-]{0,40}$/.test(slug)) throw new Error("invalid slug");
  const rel = kind === "content" ? `kanban/${slug}.md` : `kanban/projects/${slug}.md`;
  const file = safeJoin(PROJECT_ROOT, rel);
  if (!existsSync(file)) throw new Error("board not found");

  if (expectedMtimeMs != null) {
    const stat = await fs.stat(file);
    if (Math.abs(stat.mtimeMs - expectedMtimeMs) > 1) {
      const err = new Error("conflict: file changed under us");
      (err as Error & { code: string }).code = "ECONFLICT";
      throw err;
    }
  }

  const tmp = `${file}.tmp.${process.pid}.${Math.random().toString(36).slice(2, 10)}`;
  await fs.writeFile(tmp, newText, "utf8");
  await fs.rename(tmp, file);
  const stat = await fs.stat(file);
  return { mtimeMs: stat.mtimeMs };
}

// ---------- Bus append ----------

const BUS_CHANNEL_RE = /^[a-z0-9][a-z0-9_\-]{0,63}$/;

export interface BusPostInput {
  channel: string;
  from: string;
  to?: string;
  type: string;
  body: string;
  ref?: string;
}

/**
 * Append one message to a bus channel. Mirrors the bus.post skill but
 * runs in-process from the Next.js API layer. NEVER shell-execs.
 */
export async function busAppend(msg: BusPostInput): Promise<void> {
  if (!BUS_CHANNEL_RE.test(msg.channel)) throw new Error("invalid channel");
  const dir = within("bus");
  if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });
  const file = safeJoin(dir, `${msg.channel}.jsonl`);
  const envelope = {
    ts: new Date().toISOString(),
    from: msg.from,
    ...(msg.to ? { to: msg.to } : {}),
    type: msg.type,
    body: msg.body,
    ...(msg.ref ? { ref: msg.ref } : {}),
  };
  await fs.appendFile(file, JSON.stringify(envelope) + "\n", "utf8");
}

// ---------- Proposals ----------

export interface ProposalFrontmatter {
  week?: string;
  window?: string;
  status?: string;
  applied?: boolean;
  generated_at?: string;
  applied_at?: string;
  applied_diffs?: number[];
  [k: string]: unknown;
}
export interface Proposal {
  week: string;
  path: string;
  frontmatter: ProposalFrontmatter;
  body: string;
}

export async function listProposals(): Promise<Proposal[]> {
  const dir = within("proposals");
  if (!existsSync(dir)) return [];
  const files = (await fs.readdir(dir)).filter((f) => f.startsWith("week-") && f.endsWith(".md"));
  const out: Proposal[] = [];
  for (const f of files) {
    const txt = await fs.readFile(path.join(dir, f), "utf8");
    const parsed = matter(txt);
    out.push({
      week: f.replace(/\.md$/, ""),
      path: `proposals/${f}`,
      frontmatter: parsed.data as ProposalFrontmatter,
      body: parsed.content,
    });
  }
  return out.sort((a, b) => b.week.localeCompare(a.week));
}

export async function readProposal(week: string): Promise<Proposal | null> {
  if (!/^week-[a-z0-9\-]+$/i.test(week) && !/^[0-9]{4}-W[0-9]{2}$/.test(week)) throw new Error("invalid week");
  const file = safeJoin(within("proposals"), `${week}.md`);
  if (!existsSync(file)) return null;
  const txt = await fs.readFile(file, "utf8");
  const parsed = matter(txt);
  return { week, path: `proposals/${week}.md`, frontmatter: parsed.data as ProposalFrontmatter, body: parsed.content };
}

// Parse diff blocks from a proposal body. Each `### N. Title` block with a fenced ```diff is one diff.
export interface ProposalDiff {
  n: number;
  title: string;
  file?: string;
  type?: string;
  reversibility?: string;
  diff: string;
  rationale?: string;
  risk?: string;
}

export function extractDiffs(body: string): ProposalDiff[] {
  const diffs: ProposalDiff[] = [];
  const sections = body.split(/^###\s+/m).slice(1);
  for (const s of sections) {
    const titleMatch = s.match(/^(\d+)\.\s+(.+?)\s*$/m);
    if (!titleMatch) continue;
    const n = Number(titleMatch[1]);
    const title = titleMatch[2].trim();
    const fileMatch = s.match(/^-\s+\*\*File\*\*:\s+`([^`]+)`/m);
    const typeMatch = s.match(/^-\s+\*\*Type\*\*:\s+(.+)$/m);
    const revMatch = s.match(/^-\s+\*\*Reversibility\*\*:\s+(.+)$/m);
    const diffMatch = s.match(/```diff\n([\s\S]*?)\n```/);
    const ratMatch = s.match(/^-\s+\*\*Rationale\*\*:\s+([\s\S]+?)(?=\n- \*\*|$)/m);
    const riskMatch = s.match(/^-\s+\*\*Risk\*\*:\s+([\s\S]+?)(?=\n- \*\*|$)/m);
    diffs.push({
      n,
      title,
      file: fileMatch?.[1],
      type: typeMatch?.[1].trim(),
      reversibility: revMatch?.[1].trim(),
      diff: diffMatch?.[1] ?? "",
      rationale: ratMatch?.[1].trim(),
      risk: riskMatch?.[1].trim(),
    });
  }
  return diffs;
}

// ---------- Research digests ----------

export interface ResearchDigest {
  week: string;
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export async function listResearchDigests(): Promise<ResearchDigest[]> {
  const dir = within("research/weekly-digests");
  if (!existsSync(dir)) return [];
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  const out: ResearchDigest[] = [];
  for (const f of files) {
    const txt = await fs.readFile(path.join(dir, f), "utf8");
    const parsed = matter(txt);
    out.push({
      week: f.replace(/\.md$/, ""),
      path: `research/weekly-digests/${f}`,
      frontmatter: parsed.data,
      body: parsed.content,
    });
  }
  return out.sort((a, b) => b.week.localeCompare(a.week));
}

export async function readResearchDigest(week: string): Promise<ResearchDigest | null> {
  if (!/^[0-9]{4}-W[0-9]{2}$/.test(week)) return null;
  const file = safeJoin(within("research/weekly-digests"), `${week}.md`);
  if (!existsSync(file)) return null;
  const txt = await fs.readFile(file, "utf8");
  const parsed = matter(txt);
  return { week, path: `research/weekly-digests/${week}.md`, frontmatter: parsed.data, body: parsed.content };
}

// ---------- Daily logs ----------

export async function readTodaysLog(): Promise<{ date: string; body: string } | null> {
  const today = new Date().toISOString().slice(0, 10);
  const file = safeJoin(within("logs/daily"), `${today}.md`);
  if (!existsSync(file)) return null;
  const body = await fs.readFile(file, "utf8");
  return { date: today, body };
}

export async function listDailyLogs(): Promise<string[]> {
  const dir = within("logs/daily");
  if (!existsSync(dir)) return [];
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  return files.map((f) => f.replace(/\.md$/, "")).sort().reverse();
}

export async function readDailyLog(date: string): Promise<{ date: string; body: string } | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const file = safeJoin(within("logs/daily"), `${date}.md`);
  if (!existsSync(file)) return null;
  const body = await fs.readFile(file, "utf8");
  return { date, body };
}

// ---------- Content queue ----------

export interface ContentQueueItem {
  id: string;
  channel: string;
  title: string;
  status: string;
  date: string;
  author: string;
  hooks: number;
  path: string;
}

export async function readContentQueue(): Promise<ContentQueueItem[]> {
  const out: ContentQueueItem[] = [];
  const platforms = ["linkedin", "instagram", "x", "newsletter"];
  for (const platform of platforms) {
    const dir = within(`content/queue/${platform}`);
    if (!existsSync(dir)) continue;
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const txt = await fs.readFile(path.join(dir, f), "utf8");
      const parsed = matter(txt);
      const fm = parsed.data;
      const channelName = platform === "x" ? "X" : platform.charAt(0).toUpperCase() + platform.slice(1);
      out.push({
        id: f.replace(/\.md$/, ""),
        channel: channelName,
        title: (fm.title as string) || f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/-/g, " "),
        status: (fm.status as string) || "Backlog",
        date: String((fm.scheduled as string) || (fm.date as string) || "—"),
        author: (fm.author as string) || `${platform}-writer`,
        hooks: Array.isArray(fm.hooks) ? fm.hooks.length : typeof fm.hooks === "number" ? fm.hooks : 0,
        path: `content/queue/${platform}/${f}`,
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

// ---------- Audit log ----------

export interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  file: string;
  lines: string;
  prop: string;
}

export async function readAuditLog(): Promise<AuditEntry[]> {
  const file = within("audit/mutations.jsonl");
  if (!existsSync(file)) return [];
  const txt = await fs.readFile(file, "utf8");
  return txt
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        const raw = JSON.parse(l);
        return {
          ts: raw.ts || raw.timestamp || "",
          actor: raw.actor || raw.agent || "unknown",
          action: raw.action || "apply",
          file: raw.file || raw.path || "",
          lines: raw.lines || raw.diff_lines || "",
          prop: raw.prop || raw.proposal || raw.week || "",
        } as AuditEntry;
      } catch {
        return null;
      }
    })
    .filter((e): e is AuditEntry => !!e)
    .reverse();
}

// ---------- Activity (from bus) ----------

export interface ActivityEntry {
  t: string;
  agent: string;
  domain: string;
  dur: number;
  tokens: number;
  status: string;
  note: string;
}

export async function readActivity(): Promise<ActivityEntry[]> {
  const channels = await listBusChannels();
  const all: BusMessage[] = [];
  for (const ch of channels) {
    const msgs = await readBusChannel(ch, { limit: 50 });
    all.push(...msgs);
  }
  return all
    .filter((m) => typeof m.ts === "string")
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 50)
    .map((m) => {
      const domain = inferDomain(m.ch);
      return {
        t: m.ts.slice(11, 16),
        agent: m.from,
        domain,
        dur: 0,
        tokens: 0,
        status: "ok",
        note: m.body.slice(0, 200),
      };
    });
}

function inferDomain(ch: string): string {
  if (!ch) return "meta";
  if (ch === "content" || ch.startsWith("dm-")) return "content";
  if (ch === "projects" || ch.startsWith("proj-")) return "projects";
  if (ch === "research") return "research";
  return "meta";
}

// ---------- Agents registry ----------

export interface AgentInfo {
  id: string;
  tier: number;
  domain: string;
  model: string;
  desc: string;
}

export async function listAgents(): Promise<AgentInfo[]> {
  // Try scanning .claude/agents/*.md for frontmatter
  const agentsDir = within(".claude/agents");
  if (existsSync(agentsDir)) {
    const files = (await fs.readdir(agentsDir)).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
    if (files.length > 0) {
      const out: AgentInfo[] = [];
      for (const f of files) {
        const txt = await fs.readFile(path.join(agentsDir, f), "utf8");
        const parsed = matter(txt);
        const fm = parsed.data;
        out.push({
          id: f.replace(/\.md$/, ""),
          tier: typeof fm.tier === "number" ? fm.tier : 1,
          domain: (fm.domain as string) || "meta",
          model: (fm.model as string) || "sonnet",
          desc: (fm.description as string) || (fm.desc as string) || parsed.content.slice(0, 120).trim(),
        });
      }
      return out.sort((a, b) => b.tier - a.tier || a.id.localeCompare(b.id));
    }
  }
  // Fallback: hardcoded agent list matching design data.jsx
  return FALLBACK_AGENTS;
}

const FALLBACK_AGENTS: AgentInfo[] = [
  { id: "master-overseer", tier: 4, domain: "meta", model: "opus", desc: "Daily health + weekly evolution kickoff" },
  { id: "self-evolution-proposer", tier: 4, domain: "meta", model: "opus", desc: "Friday weekly self-evolution proposal" },
  { id: "proposal-applier", tier: 4, domain: "meta", model: "sonnet", desc: "Plan-mode preview + apply diffs" },
  { id: "daily-content-supervisor", tier: 3, domain: "content", model: "sonnet", desc: "Reviews queue + calendar; flags gaps" },
  { id: "daily-project-supervisor", tier: 3, domain: "projects", model: "sonnet", desc: "Reads project Kanbans; posts standup" },
  { id: "daily-research-supervisor", tier: 3, domain: "research", model: "sonnet", desc: "Flags stale domains; weekly digest" },
  { id: "content-domain-lead", tier: 2, domain: "content", model: "opus", desc: "Routes content work across LI/IG/X" },
  { id: "project-domain-lead", tier: 2, domain: "projects", model: "opus", desc: "Coordinates dev projects" },
  { id: "research-domain-lead", tier: 2, domain: "research", model: "opus", desc: "Owns research domains end-to-end" },
  { id: "linkedin-writer", tier: 1, domain: "content", model: "sonnet", desc: "Drafts LinkedIn posts (longform voice)" },
  { id: "instagram-writer", tier: 1, domain: "content", model: "sonnet", desc: "Drafts IG captions + image briefs" },
  { id: "x-writer", tier: 1, domain: "content", model: "sonnet", desc: "Drafts X threads + replies" },
  { id: "hook-crafter", tier: 1, domain: "content", model: "sonnet", desc: "Generates 5-hook variants per draft" },
  { id: "hashtag-strategist", tier: 1, domain: "content", model: "haiku", desc: "Trending tags + cluster ranking" },
  { id: "image-prompt-writer", tier: 1, domain: "content", model: "sonnet", desc: "Image briefs for IG/LI banners" },
  { id: "content-calendar-planner", tier: 1, domain: "content", model: "sonnet", desc: "Monthly cadence calendar" },
  { id: "engagement-analyzer", tier: 1, domain: "content", model: "sonnet", desc: "Reads metrics; surfaces what worked" },
  { id: "notion-publisher", tier: 1, domain: "content", model: "haiku", desc: "Mirrors queue → Notion DB" },
  { id: "scrum-master", tier: 1, domain: "projects", model: "opus", desc: "Breaks goals → tickets; schedules sprints" },
  { id: "prd-keeper", tier: 1, domain: "projects", model: "sonnet", desc: "Maintains PRDs + open questions" },
  { id: "kanban-secretary", tier: 1, domain: "projects", model: "haiku", desc: "Updates Kanban headers; light cadence" },
  { id: "dev-researcher", tier: 1, domain: "projects", model: "sonnet", desc: "Per-task technical research" },
  { id: "scaling-ideator", tier: 1, domain: "projects", model: "opus", desc: "Weekly scaling-move proposals" },
  { id: "domain-researcher", tier: 1, domain: "research", model: "sonnet", desc: "Pulls fresh sources per domain" },
  { id: "notebooklm-bridge", tier: 1, domain: "research", model: "sonnet", desc: "Runs staged NotebookLM queries" },
  { id: "source-curator", tier: 1, domain: "research", model: "haiku", desc: "Dedupes + reranks sources.md" },
  { id: "trend-spotter", tier: 1, domain: "research", model: "sonnet", desc: "Cross-domain theme detection" },
  { id: "weekly-digest-composer", tier: 1, domain: "research", model: "opus", desc: "Friday weekly digest" },
  { id: "newsletter-writer", tier: 1, domain: "research", model: "opus", desc: "Polishes digest → newsletter" },
  { id: "humanizer", tier: 1, domain: "content", model: "sonnet", desc: "Rewrites AI drafts to match writing signature" },
  { id: "research-to-content-orchestrator", tier: 2, domain: "research", model: "opus", desc: "Full pipeline: research → content → humanize → Notion" },
  { id: "notion-db-manager", tier: 1, domain: "content", model: "sonnet", desc: "Manages 6 Notion databases" },
  { id: "content-repurposer", tier: 1, domain: "content", model: "sonnet", desc: "Adapts one insight across platforms" },
];

// ---------- Channel team helpers ----------

export interface ChannelTeam {
  agents: AgentInfo[];
  domain: string;
  type: "public" | "team" | "pipeline" | "dm";
}

let cachedAgents: AgentInfo[] | null = null;

async function getCachedAgents(): Promise<AgentInfo[]> {
  if (!cachedAgents) cachedAgents = await listAgents();
  return cachedAgents;
}

export async function getChannelTeam(channel: string): Promise<ChannelTeam> {
  const agents = await getCachedAgents();
  if (channel === "all-hands") return { agents, domain: "meta", type: "public" };
  if (channel === "content") return { agents: agents.filter((a) => a.domain === "content"), domain: "content", type: "team" };
  if (channel === "projects" || channel.startsWith("proj-")) return { agents: agents.filter((a) => a.domain === "projects"), domain: "projects", type: "team" };
  if (channel === "research") return { agents: agents.filter((a) => a.domain === "research"), domain: "research", type: "team" };
  if (channel === "meta") return { agents: agents.filter((a) => a.domain === "meta"), domain: "meta", type: "team" };
  if (channel === "research-to-content" || channel === "humanizer") {
    return { agents: agents.filter((a) => a.domain === "content" || a.domain === "research"), domain: "research", type: "pipeline" };
  }
  if (channel.startsWith("dm-")) return { agents: [], domain: "meta", type: "dm" };
  return { agents, domain: "meta", type: "team" };
}

export async function inferAgentMeta(agentName: string): Promise<{ tier: number; domain: string; model: string } | null> {
  const agents = await getCachedAgents();
  const a = agents.find((x) => x.id === agentName);
  if (!a) return null;
  return { tier: a.tier, domain: a.domain, model: a.model };
}

// ---------- Graphify index ----------

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  group: string;
}

export type GraphEdge = [string, string];

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function readGraphifyIndex(): Promise<GraphData> {
  // Try reading from graphify-out cache
  const cacheDir = within("graphify-out/cache");
  if (existsSync(cacheDir)) {
    const files = (await fs.readdir(cacheDir)).filter((f) => f.endsWith(".json"));
    if (files.length > 0) {
      // Try to extract graph structure from cache files
      const nodes: GraphNode[] = [];
      const edgeSet = new Set<string>();
      for (const f of files.slice(0, 20)) {
        try {
          const txt = await fs.readFile(path.join(cacheDir, f), "utf8");
          const data = JSON.parse(txt);
          if (data.nodes && Array.isArray(data.nodes)) {
            for (const n of data.nodes) {
              if (n.id && !nodes.find((x) => x.id === n.id)) {
                nodes.push({
                  id: n.id,
                  x: n.x ?? Math.random(),
                  y: n.y ?? Math.random(),
                  r: n.r ?? 16,
                  label: n.label || n.id,
                  group: n.group || n.domain || "meta",
                });
              }
            }
          }
          if (data.edges && Array.isArray(data.edges)) {
            for (const e of data.edges) {
              const key = Array.isArray(e) ? `${e[0]}:${e[1]}` : `${e.source}:${e.target}`;
              edgeSet.add(key);
            }
          }
        } catch { /* skip corrupt files */ }
      }
      if (nodes.length > 0) {
        return { nodes, edges: [...edgeSet].map((k) => k.split(":") as GraphEdge) };
      }
    }
  }
  // Fallback: synthetic graph matching design
  return FALLBACK_GRAPH;
}

const FALLBACK_GRAPH: GraphData = {
  nodes: [
    { id: "PRD", x: 0.5, y: 0.5, r: 28, label: "PRD", group: "core" },
    { id: "KANBAN", x: 0.28, y: 0.34, r: 22, label: "Kanban", group: "core" },
    { id: "BUS", x: 0.72, y: 0.34, r: 22, label: "Bus", group: "core" },
    { id: "AGENTS", x: 0.5, y: 0.8, r: 22, label: "Agents", group: "core" },
    { id: "a-content", x: 0.18, y: 0.7, r: 14, label: "content", group: "content" },
    { id: "a-projects", x: 0.4, y: 0.95, r: 14, label: "projects", group: "projects" },
    { id: "a-research", x: 0.62, y: 0.95, r: 14, label: "research", group: "research" },
    { id: "a-meta", x: 0.84, y: 0.7, r: 14, label: "meta", group: "meta" },
    { id: "NOTION", x: 0.12, y: 0.18, r: 16, label: "Notion", group: "content" },
    { id: "NLM", x: 0.88, y: 0.18, r: 16, label: "NotebookLM", group: "research" },
    { id: "WEB", x: 0.5, y: 0.12, r: 14, label: "web-research", group: "research" },
    { id: "AUDIT", x: 0.12, y: 0.85, r: 12, label: "audit", group: "meta" },
    { id: "PROP", x: 0.88, y: 0.85, r: 12, label: "proposals", group: "meta" },
  ],
  edges: [
    ["PRD", "KANBAN"], ["PRD", "BUS"], ["PRD", "AGENTS"], ["KANBAN", "BUS"],
    ["AGENTS", "a-content"], ["AGENTS", "a-projects"], ["AGENTS", "a-research"], ["AGENTS", "a-meta"],
    ["a-content", "NOTION"], ["a-research", "NLM"], ["a-research", "WEB"],
    ["a-meta", "AUDIT"], ["a-meta", "PROP"], ["BUS", "a-content"], ["BUS", "a-projects"],
    ["BUS", "a-research"], ["BUS", "a-meta"],
  ],
};

// ---------- Notion sync state ----------

export interface NotionConfig {
  content_queue: string;
  research_digests: string;
  content_calendar: string;
  source_library: string;
  newsletter_archive: string;
  ideas_board: string;
  setup_at: string;
}

export interface NotionDBView {
  key: string;
  label: string;
  dbId: string;
  pendingCount: number;
  totalCount: number;
  items: NotionSyncItem[];
}

export interface NotionFullState {
  config: NotionConfig | null;
  dbs: NotionDBView[];
  pendingTotal: number;
  conflicts: number;
}

export interface NotionSyncItem {
  id: string;
  title: string;
  channel: string;
  status: string;
  scheduled: string;
  lastSynced: string;
  conflict: boolean;
  notionPageId?: string;
}

export async function readNotionConfig(): Promise<NotionConfig | null> {
  const configPath = within(".notion-sync.json");
  if (!existsSync(configPath)) return null;
  try {
    const txt = await fs.readFile(configPath, "utf8");
    return JSON.parse(txt) as NotionConfig;
  } catch {
    return null;
  }
}

export async function readNotionFullState(): Promise<NotionFullState> {
  const config = await readNotionConfig();
  if (!config) return { config: null, dbs: [], pendingTotal: 0, conflicts: 0 };

  const busContent = await readBusChannel("content", { limit: 50 }).catch(() => [] as BusMessage[]);
  const conflictTitles = new Set<string>();
  for (const m of busContent) {
    if (m.from === "notion-publisher" && (m.type === "conflict" || m.body.toLowerCase().includes("conflict"))) {
      const match = m.body.match(/(\S+-\d{4}-\d{2}-\d{2}\S*)/);
      if (match) conflictTitles.add(match[1]);
    }
  }

  const dbDefs: { key: string; label: string; dbId: string }[] = [
    { key: "content_queue", label: "Content Queue", dbId: config.content_queue },
    { key: "research_digests", label: "Research Digests", dbId: config.research_digests },
    { key: "content_calendar", label: "Content Calendar", dbId: config.content_calendar },
    { key: "source_library", label: "Source Library", dbId: config.source_library },
    { key: "newsletter_archive", label: "Newsletter Archive", dbId: config.newsletter_archive },
    { key: "ideas_board", label: "Ideas Board", dbId: config.ideas_board },
  ];

  const dbs: NotionDBView[] = [];

  // Content Queue — from content/queue/**/*.md
  const queue = await readContentQueue();
  const queueItems: NotionSyncItem[] = queue.map((q, i) => ({
    id: `cq-${i}`,
    title: q.title,
    channel: q.channel,
    status: q.status,
    scheduled: q.date,
    lastSynced: "—",
    conflict: conflictTitles.has(q.id),
    notionPageId: (q as unknown as Record<string, unknown>).notion_page_id as string | undefined,
  }));
  const cqPending = queueItems.filter((i) => !i.notionPageId).length;
  dbs.push({ ...dbDefs[0], pendingCount: cqPending, totalCount: queueItems.length, items: queueItems });

  // Research Digests — from research/weekly-digests/*.md
  const digestItems = await scanMarkdownDir("research/weekly-digests", "research");
  dbs.push({ ...dbDefs[1], pendingCount: digestItems.filter((i) => !i.notionPageId).length, totalCount: digestItems.length, items: digestItems });

  // Content Calendar — from content/calendar/*.md
  const calItems = await scanMarkdownDir("content/calendar", "content");
  dbs.push({ ...dbDefs[2], pendingCount: calItems.filter((i) => !i.notionPageId).length, totalCount: calItems.length, items: calItems });

  // Source Library — count from sources.md files
  const sourceItems = await scanSourceFiles();
  dbs.push({ ...dbDefs[3], pendingCount: sourceItems.length, totalCount: sourceItems.length, items: sourceItems });

  // Newsletter Archive — from research/newsletters/**/*.md
  const nlItems = await scanNewsletterFiles();
  dbs.push({ ...dbDefs[4], pendingCount: nlItems.filter((i) => !i.notionPageId).length, totalCount: nlItems.length, items: nlItems });

  // Ideas Board — count from ideas-feed.md files
  const ideaItems = await scanIdeasFiles();
  dbs.push({ ...dbDefs[5], pendingCount: ideaItems.length, totalCount: ideaItems.length, items: ideaItems });

  const pendingTotal = dbs.reduce((n, d) => n + d.pendingCount, 0);
  const conflicts = queueItems.filter((i) => i.conflict).length;

  return { config, dbs, pendingTotal, conflicts };
}

async function scanMarkdownDir(relDir: string, channel: string): Promise<NotionSyncItem[]> {
  const dir = within(relDir);
  if (!existsSync(dir)) return [];
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  const items: NotionSyncItem[] = [];
  for (const f of files) {
    const txt = await fs.readFile(path.join(dir, f), "utf8");
    const parsed = matter(txt);
    items.push({
      id: f.replace(/\.md$/, ""),
      title: (parsed.data.title as string) || f.replace(/\.md$/, ""),
      channel,
      status: (parsed.data.status as string) || "—",
      scheduled: (parsed.data.date as string) || "—",
      lastSynced: "—",
      conflict: false,
      notionPageId: parsed.data.notion_page_id as string | undefined,
    });
  }
  return items;
}

async function scanSourceFiles(): Promise<NotionSyncItem[]> {
  const domains = await listResearchDomains();
  const items: NotionSyncItem[] = [];
  for (const d of domains) {
    if (d.startsWith("_")) continue;
    const sourcesPath = within(`research/domains/${d}/sources.md`);
    if (existsSync(sourcesPath)) {
      items.push({
        id: `src-${d}`, title: `${d} sources`, channel: "research",
        status: "active", scheduled: "—", lastSynced: "—", conflict: false,
      });
    }
  }
  return items;
}

async function scanNewsletterFiles(): Promise<NotionSyncItem[]> {
  const items: NotionSyncItem[] = [];
  for (const sub of ["drafts", "archive"]) {
    const dir = within(`research/newsletters/${sub}`);
    if (!existsSync(dir)) continue;
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const txt = await fs.readFile(path.join(dir, f), "utf8");
      const parsed = matter(txt);
      items.push({
        id: `nl-${sub}-${f.replace(/\.md$/, "")}`,
        title: (parsed.data.title as string) || f.replace(/\.md$/, ""),
        channel: "research", status: sub === "drafts" ? "draft" : "published",
        scheduled: "—", lastSynced: "—", conflict: false,
        notionPageId: parsed.data.notion_page_id as string | undefined,
      });
    }
  }
  return items;
}

async function scanIdeasFiles(): Promise<NotionSyncItem[]> {
  const domains = await listResearchDomains();
  const items: NotionSyncItem[] = [];
  for (const d of domains) {
    if (d.startsWith("_")) continue;
    const ideasPath = within(`research/domains/${d}/ideas-feed.md`);
    if (existsSync(ideasPath)) {
      items.push({
        id: `idea-${d}`, title: `${d} ideas`, channel: "research",
        status: "active", scheduled: "—", lastSynced: "—", conflict: false,
      });
    }
  }
  return items;
}

export async function readNotionSyncState(): Promise<NotionSyncItem[]> {
  const queue = await readContentQueue();
  // Check bus for conflict messages from notion-publisher
  const busContent = await readBusChannel("content", { limit: 50 }).catch(() => [] as BusMessage[]);
  const conflictTitles = new Set<string>();
  for (const m of busContent) {
    if (m.from === "notion-publisher" && (m.type === "conflict" || m.body.toLowerCase().includes("conflict"))) {
      // Try to extract the conflicting item
      const match = m.body.match(/(\S+-\d{4}-\d{2}-\d{2}\S*)/);
      if (match) conflictTitles.add(match[1]);
    }
  }
  return queue.map((q, i) => ({
    id: `n${i}`,
    title: q.title,
    channel: q.channel,
    status: q.status,
    scheduled: q.date,
    lastSynced: "—",
    conflict: conflictTitles.has(q.id),
  }));
}

// ---------- Research domains ----------

export async function listResearchDomains(): Promise<string[]> {
  const dir = within("research/domains");
  if (!existsSync(dir)) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

// ---------- NotebookLM sync ----------

export interface NotebookLMPrompt {
  domain: string;
  index: number;
  text: string;
  answered: boolean;
  answeredDate?: string;
}

export interface NotebookLMDomainData {
  domain: string;
  prompts: NotebookLMPrompt[];
  sourceCount: number;
  noteCount: number;
  notebookId?: string;
}

export async function readNotebookLMData(): Promise<NotebookLMDomainData[]> {
  const domains = await listResearchDomains();
  const results: NotebookLMDomainData[] = [];

  for (const domain of domains) {
    if (domain.startsWith("_")) continue; // skip _writing-signature etc.
    const domainDir = within(`research/domains/${domain}`);
    const promptsFile = path.join(domainDir, "notebooklm-prompts.md");
    const sourcesFile = path.join(domainDir, "sources.md");
    const notesDir = path.join(domainDir, "notes");
    const prdFile = path.join(domainDir, "PRD.md");

    // Read notebook_id from PRD frontmatter
    let notebookId: string | undefined;
    if (existsSync(prdFile)) {
      try {
        const prdTxt = await fs.readFile(prdFile, "utf8");
        const prdParsed = matter(prdTxt);
        notebookId = prdParsed.data.notebook_id as string | undefined;
      } catch { /* ignore */ }
    }

    const prompts: NotebookLMPrompt[] = [];

    if (existsSync(promptsFile)) {
      const txt = await fs.readFile(promptsFile, "utf8");
      const lines = txt.split("\n");
      let idx = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip headings, comments, blank lines
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("<!--") || trimmed.startsWith("-->") || trimmed.startsWith("Example format")) continue;
        // Check if answered
        const answeredMatch = trimmed.match(/\[answered\s+(\d{4}-\d{2}-\d{2})\]/);
        const text = trimmed.replace(/\s*\[answered\s+\d{4}-\d{2}-\d{2}\]/, "").replace(/^-\s*/, "");
        if (!text) continue;
        prompts.push({
          domain,
          index: idx++,
          text,
          answered: !!answeredMatch,
          answeredDate: answeredMatch?.[1],
        });
      }
    }

    // Count sources
    let sourceCount = 0;
    if (existsSync(sourcesFile)) {
      const txt = await fs.readFile(sourcesFile, "utf8");
      sourceCount = (txt.match(/^- \[/gm) || []).length;
    }

    // Count notes
    let noteCount = 0;
    if (existsSync(notesDir)) {
      try {
        const entries = await fs.readdir(notesDir);
        noteCount = entries.filter((e) => e.endsWith(".md")).length;
      } catch { /* empty */ }
    }

    results.push({ domain, prompts, sourceCount, noteCount, notebookId });
  }

  return results;
}
