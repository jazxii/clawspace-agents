import Link from "next/link";
import { listKanbanBoards, readKanbanRaw } from "@/lib/fs-adapter";
import { originalIsCleanForWriteBack } from "@/lib/kanban-serialize";

export const metadata = { title: "Kanban — Clawspace" };
export const dynamic = "force-dynamic";

export default async function KanbanIndex() {
  const boards = await listKanbanBoards();

  const summaries = await Promise.all(
    boards.map(async (b) => {
      try {
        const r = await readKanbanRaw(b.slug, b.kind);
        if (!r) return null;
        const writeBack = originalIsCleanForWriteBack(r.rawText);
        const counts = r.board.columns.map((c) => ({ name: c.name, count: c.cards.length }));
        const total = counts.reduce((s, c) => s + c.count, 0);
        return { ...b, counts, total, writeBack };
      } catch {
        return null;
      }
    }),
  );

  const valid = summaries.filter((x): x is NonNullable<typeof x> => !!x);
  const content = valid.filter((b) => b.kind === "content");
  const projects = valid.filter((b) => b.kind === "project");

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Kanban boards</h1>
          <p>{valid.length} boards · drag-drop + keyboard · md is the source of truth</p>
        </div>
      </div>

      {content.length > 0 && (
        <Section heading="Content" boards={content} />
      )}
      {projects.length > 0 && (
        <Section heading="Projects" boards={projects} />
      )}
      {valid.length === 0 && (
        <p className="muted">
          No boards yet. Use <code>/new-project &lt;slug&gt;</code> from Claude Code to scaffold one.
        </p>
      )}
    </div>
  );
}

interface BoardSummary {
  slug: string;
  kind: "content" | "project";
  counts: { name: string; count: number }[];
  total: number;
  writeBack: boolean;
}

function Section({ heading, boards }: { heading: string; boards: BoardSummary[] }) {
  return (
    <section style={{ marginBottom: "var(--pad-5)" }} aria-labelledby={`sec-${heading}`}>
      <h2
        id={`sec-${heading}`}
        style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", margin: "0 0 var(--pad-2)" }}
      >
        {heading}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--pad-3)",
        }}
      >
        {boards.map((b) => {
          const href = b.kind === "project"
            ? `/kanban/${encodeURIComponent(b.slug)}?kind=project`
            : `/kanban/${encodeURIComponent(b.slug)}`;
          return (
            <Link key={b.slug} href={href} className="cs-card" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div className="cs-card-h">
                <h3>{b.slug}</h3>
                <span className="muted tnum" style={{ fontSize: 11 }}>{b.total} cards</span>
              </div>
              <div className="cs-card-body" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {b.counts.map((c) => (
                  <div key={c.name} className="row" style={{ justifyContent: "space-between", fontSize: 12 }}>
                    <span className="muted">{c.name}</span>
                    <b className="tnum">{c.count}</b>
                  </div>
                ))}
                {!b.writeBack && (
                  <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                    Read-only (free-form content)
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
