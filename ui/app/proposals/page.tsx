import { listProposals } from "@/lib/fs-adapter";
import StatusBadge from "../_components/StatusBadge";
import Breadcrumbs from "../_components/Breadcrumbs";

export const metadata = { title: "Proposals — Clawspace" };
export const dynamic = "force-dynamic";

export default async function ProposalsIndex() {
  const proposals = await listProposals();
  return (
    <>
      <header className="page-chrome">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Proposals" }]} />
        <h1 className="text-2xl font-semibold">Self-evolution proposals</h1>
      </header>
      {proposals.length === 0 ? (
        <p className="text-slate-700">
          No proposals yet. <code>self-evolution-proposer</code> writes one weekly on Friday at
          17:00.
        </p>
      ) : (
        <ul role="list" className="space-y-3">
          {proposals.map((p) => {
            const applied = p.frontmatter.applied === true;
            return (
              <li key={p.week}>
                <article aria-labelledby={`prop-${p.week}-h`} className="rounded border border-slate-200 p-4">
                  <h2 id={`prop-${p.week}-h`} className="font-semibold mb-1">
                    <a className="text-blue-700 underline" href={`/proposals/${p.week}`}>
                      {p.week}
                    </a>
                  </h2>
                  <dl className="text-sm space-y-1">
                    <div className="flex gap-2">
                      <dt className="font-medium">Status:</dt>
                      <dd>
                        <StatusBadge tone={applied ? "done" : "warning"}>
                          {applied ? "Applied" : "Pending review"}
                        </StatusBadge>
                      </dd>
                    </div>
                    {p.frontmatter.window ? (
                      <div className="flex gap-2">
                        <dt className="font-medium">Window:</dt>
                        <dd>{String(p.frontmatter.window)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
