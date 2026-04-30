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
        return JSON.parse(l) as BusMessage;
      } catch {
        return null;
      }
    })
    .filter((m): m is BusMessage => !!m);
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
