import {
  listKanbanBoards,
  readLatestAcrossChannels,
  listProposals,
  readTodaysLog,
  listResearchDigests,
  readContentQueue,
} from "@/lib/fs-adapter";
import { Icon } from "./_components/Icon";
import { Pill } from "./_components/Pill";
import { StatTile } from "./_components/StatTile";
import Link from "next/link";

export const metadata = { title: "Dashboard — Clawspace" };
export const dynamic = "force-dynamic";

function inferDomainFromCh(ch: string): "content" | "projects" | "research" | "meta" {
  if (!ch) return "meta";
  if (ch === "content") return "content";
  if (ch === "projects" || ch.startsWith("proj-")) return "projects";
  if (ch === "research") return "research";
  return "meta";
}

export default async function Dashboard() {
  const [boards, headlines, proposals, todaysLog, digests, queue] = await Promise.all([
    listKanbanBoards(),
    readLatestAcrossChannels(8),
    listProposals(),
    readTodaysLog(),
    listResearchDigests(),
    readContentQueue(),
  ]);

  const pendingProposals = proposals.filter((p) => !p.frontmatter.applied);
  const latestDigest = digests[0];
  const projectBoards = boards.filter((b) => b.kind === "project");
  const contentBoards = boards.filter((b) => b.kind === "content");
  const readyCount = queue.filter((q) => q.status.toLowerCase() === "ready").length;
  const draftingCount = queue.filter((q) => q.status.toLowerCase() === "drafting").length;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>{greeting}, Jazxii.</h1>
          <p>{dateStr} · {headlines.length} messages today · {pendingProposals.length} proposals pending</p>
        </div>
        <div className="row gap-2">
          <Link href="/agents" className="cs-btn">
            <Icon name="play" size={13} />Run health check
          </Link>
          <Link href="/kanban" className="cs-btn" data-variant="primary">
            <Icon name="plus" size={13} />New project
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--pad-3)", marginBottom: "var(--pad-4)" }}>
        <StatTile tint="content" label="Content queue" value={String(queue.length)} delta={`${readyCount} ready · ${draftingCount} drafting`} icon="queue" spark={[3, 4, 5, 5, 6, 7, 7, 8, 7]} />
        <StatTile tint="projects" label="Open boards" value={String(projectBoards.length)} delta={`${contentBoards.length} content boards`} icon="kanban" spark={[8, 9, 10, 9, 11, 12, 11, 12, 12]} />
        <StatTile tint="research" label="Digests" value={String(digests.length)} delta={latestDigest ? `latest: ${latestDigest.week}` : "none yet"} deltaDir="up" icon="graph" spark={[60, 65, 68, 71, 76, 79, 82, 84, 84]} />
        <StatTile tint="meta" label="Proposals" value={String(proposals.length)} delta={`${pendingProposals.length} pending`} icon="coin" spark={[28, 32, 40, 46, 52, 58, 60, 62, 64]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--pad-4)" }}>
        {/* Left column */}
        <div className="col gap-4">
          {todaysLog && (
            <div className="cs-card">
              <div className="cs-card-h">
                <h3><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-projects)", display: "inline-block" }} />Today&apos;s log</h3>
                <Link href="/logs" className="cs-btn" data-variant="ghost">View full log<Icon name="arrow-right" size={12} /></Link>
              </div>
              <div className="cs-card-body">
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>
                  {todaysLog.body.slice(0, 300)}{todaysLog.body.length > 300 && "…"}
                </div>
              </div>
            </div>
          )}

          <div className="cs-card">
            <div className="cs-card-h">
              <h3><Icon name="chat" size={14} />Bus headlines</h3>
              <Link href="/channels" className="cs-btn" data-variant="ghost">Open channels<Icon name="arrow-right" size={12} /></Link>
            </div>
            <div className="cs-card-list">
              {headlines.length === 0 ? (
                <div className="cs-card-body" style={{ color: "var(--text-3)", fontSize: 13 }}>No messages yet.</div>
              ) : (
                headlines.slice(0, 4).map((m, i) => (
                  <div key={`${m.ts}-${i}`} className="cs-card-body" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "flex-start" }}>
                    <Pill tone={inferDomainFromCh(m.ch)} dot>{m.from}</Pill>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{m.body.slice(0, 160)}</div>
                    <span className="muted tnum" style={{ fontSize: 11 }}>{m.ts.slice(11, 16)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="cs-card">
            <div className="cs-card-h">
              <h3><Icon name="activity" size={14} />Scheduled agents</h3>
              <span className="meta">launchd · auto</span>
            </div>
            <div className="cs-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {([
                { t: "15:00", a: "kanban-secretary", d: "projects" as const, tag: "every 15m" },
                { t: "16:00", a: "trend-spotter", d: "research" as const, tag: "Wed 16:00" },
                { t: "18:00", a: "daily-project-supervisor", d: "projects" as const, tag: "EOD digest" },
                { t: "18:00", a: "daily-content-supervisor", d: "content" as const, tag: "EOD digest" },
                { t: "18:00", a: "daily-research-supervisor", d: "research" as const, tag: "EOD digest" },
              ]).map((s, i) => (
                <div key={i} className="row" style={{ gap: 14 }}>
                  <span className="tnum mono" style={{ fontSize: 12, color: "var(--text-3)", width: 40 }}>{s.t}</span>
                  <Pill tone={s.d} dot>{s.a}</Pill>
                  <span className="muted" style={{ fontSize: 12 }}>{s.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col gap-4">
          <div className="cs-card">
            <div className="cs-card-h">
              <h3><Icon name="coin" size={14} />Token budget</h3>
              <Link href="/cost" className="cs-btn" data-variant="ghost">Details<Icon name="arrow-right" size={12} /></Link>
            </div>
            <div className="cs-card-body">
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.02em" }}>—</span>
                <span className="muted">/ budget</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "var(--bg-sunken)", marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: "0%", height: "100%", background: "linear-gradient(90deg, var(--accent-meta), var(--accent-content) 70%, var(--accent-system))" }} />
              </div>
              <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>Cost data available on the Cost page</div>
            </div>
          </div>

          {pendingProposals.length > 0 && (
            <div className="cs-card">
              <div className="cs-card-h">
                <h3><Icon name="palette" size={14} />Weekly proposal</h3>
                <Pill tone="meta" dot>awaiting review</Pill>
              </div>
              <div className="cs-card-body">
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>
                  <b>{pendingProposals[0].week}</b> — {pendingProposals.length} proposal{pendingProposals.length > 1 ? "s" : ""} pending review.
                </div>
                <div className="row" style={{ marginTop: 12 }}>
                  <Link href="/proposals" className="cs-btn" data-variant="primary">Review<Icon name="arrow-right" size={12} /></Link>
                </div>
              </div>
            </div>
          )}

          <div className="cs-card">
            <div className="cs-card-h">
              <h3><Icon name="notion" size={14} />Notion sync</h3>
            </div>
            <div className="cs-card-body">
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>{queue.length} items in content queue</div>
              <div className="row" style={{ marginTop: 10 }}>
                <Link href="/notion" className="cs-btn" data-variant="ghost">View all</Link>
              </div>
            </div>
          </div>

          {latestDigest && (
            <div className="cs-card">
              <div className="cs-card-h">
                <h3><Icon name="digest" size={14} />{latestDigest.week} digest</h3>
                <span className="meta">research</span>
              </div>
              <div className="cs-card-body" style={{ fontFamily: "var(--font-serif)", fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55 }}>
                {latestDigest.body.slice(0, 200)}…
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
