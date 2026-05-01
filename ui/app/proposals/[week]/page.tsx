import { notFound } from "next/navigation";
import { extractDiffs, readProposal } from "@/lib/fs-adapter";
import { Icon } from "@/app/_components/Icon";
import { Pill } from "@/app/_components/Pill";
import ProposalReviewForm from "./_components/ProposalReviewForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  return { title: `${week} proposal — Clawspace` };
}

export default async function ProposalDetail({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const proposal = await readProposal(week);
  if (!proposal) notFound();
  const diffs = extractDiffs(proposal.body);

  const workedMatch = proposal.body.match(/##\s*What worked\s*\n([\s\S]*?)(?=\n##\s|$)/);
  const draggedMatch = proposal.body.match(/##\s*What dragged\s*\n([\s\S]*?)(?=\n##\s|$)/);

  const workedItems = workedMatch
    ? workedMatch[1].trim().split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2))
    : [];
  const draggedItems = draggedMatch
    ? draggedMatch[1].trim().split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2))
    : [];

  return (
    <div className="cs-page-inner" style={{ maxWidth: 1300 }}>
      <div className="cs-page-title">
        <div>
          <h1>Proposal · {proposal.week}</h1>
          <p>Self-evolution loop · {proposal.frontmatter.applied ? "applied" : "awaiting review"}</p>
        </div>
        <div className="row gap-2">
          <Link href="/proposals" className="cs-btn">
            <Icon name="x" size={13} />Back
          </Link>
          {!proposal.frontmatter.applied && (
            <button className="cs-btn" data-variant="primary">
              <Icon name="check" size={13} />Apply
            </button>
          )}
        </div>
      </div>

      {/* What worked / What dragged */}
      {(workedItems.length > 0 || draggedItems.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--pad-4)", marginBottom: "var(--pad-4)" }}>
          {workedItems.length > 0 && (
            <div className="cs-card">
              <div className="cs-card-h">
                <h3 style={{ color: "var(--accent-meta)" }}><Icon name="check" size={14} />What worked</h3>
              </div>
              <div className="cs-card-body">
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 13.5 }}>
                  {workedItems.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          )}
          {draggedItems.length > 0 && (
            <div className="cs-card">
              <div className="cs-card-h">
                <h3 style={{ color: "var(--accent-system)" }}><Icon name="flag" size={14} />What dragged</h3>
              </div>
              <div className="cs-card-body">
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 13.5 }}>
                  {draggedItems.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diffs */}
      {diffs.length > 0 && (
        <div className="cs-card">
          <div className="cs-card-h">
            <h3>Proposed diffs</h3>
            <span className="muted tnum">{diffs.length}</span>
          </div>
          <div className="cs-card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {diffs.map((d) => (
              <div key={d.n}>
                <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{d.file || d.title}</span>
                  {d.risk && (
                    <Pill tone={d.risk === "low" ? "meta" : d.risk === "med" ? "content" : "alert"} dot>
                      risk: {d.risk}
                    </Pill>
                  )}
                </div>
                {d.rationale && (
                  <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 10 }}>
                    <b>Rationale.</b> {d.rationale}
                  </div>
                )}
                {d.diff && (
                  <div className="cs-diff">
                    {d.diff.split("\n").map((line, j) => {
                      const kind = line.startsWith("+") ? "add" : line.startsWith("-") ? "del" : line.startsWith("@@") ? "hunk" : "";
                      return (
                        <div key={j} className={`line ${kind}`}>
                          <span className="ln">{kind === "hunk" ? "" : j + 1}</span>
                          <span className="txt">{line}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ProposalReviewForm
        week={proposal.week}
        diffs={diffs}
        applied={proposal.frontmatter.applied === true}
      />
    </div>
  );
}
