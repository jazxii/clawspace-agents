import { listProposals } from "@/lib/fs-adapter";
import { Pill } from "../_components/Pill";
import Link from "next/link";

export const metadata = { title: "Proposals — Clawspace" };
export const dynamic = "force-dynamic";

export default async function ProposalsIndex() {
  const proposals = await listProposals();
  const pending = proposals.filter((p) => !p.frontmatter.applied);

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Proposals</h1>
          <p>Self-evolution loop · {proposals.length} total · {pending.length} pending</p>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="cs-card">
          <div className="cs-card-body" style={{ color: "var(--text-3)" }}>
            No proposals yet. <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>self-evolution-proposer</code> writes one weekly on Friday at 17:00.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--pad-3)" }}>
          {proposals.map((p) => {
            const isApplied = p.frontmatter.applied === true;
            return (
              <Link key={p.week} href={`/proposals/${p.week}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="cs-card" style={{ cursor: "pointer" }}>
                  <div className="cs-card-h">
                    <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{p.week}</h3>
                    <Pill tone={isApplied ? "meta" : "alert"} dot>
                      {isApplied ? "Applied" : "Pending review"}
                    </Pill>
                  </div>
                  {p.frontmatter.window && (
                    <div className="cs-card-body" style={{ fontSize: 12, color: "var(--text-3)" }}>
                      Window: {String(p.frontmatter.window)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
