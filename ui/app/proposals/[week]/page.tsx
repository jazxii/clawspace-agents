import { notFound } from "next/navigation";
import { extractDiffs, readProposal } from "@/lib/fs-adapter";
import ProposalReviewForm from "./_components/ProposalReviewForm";

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

  // Try to extract "What worked" / "What dragged" sections from the body.
  const workedMatch = proposal.body.match(/##\s*What worked\s*\n([\s\S]*?)(?=\n##\s|$)/);
  const draggedMatch = proposal.body.match(/##\s*What dragged\s*\n([\s\S]*?)(?=\n##\s|$)/);

  return (
    <>
      <header className="page-chrome">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/proposals">Proposals</a></li>
            <li><span aria-current="page">{proposal.week}</span></li>
          </ol>
        </nav>
        <h1 className="text-2xl font-semibold">{proposal.week} proposal review</h1>
        <p className="text-sm text-secondary">
          Status: {proposal.frontmatter.applied ? "Applied" : "Pending review"}
          {proposal.frontmatter.window ? ` · Window: ${String(proposal.frontmatter.window)}` : ""}
        </p>
      </header>

      <section aria-labelledby="retro-h" className="mb-8">
        <h2 id="retro-h" className="text-lg font-semibold mb-3">
          Retrospective
        </h2>
        {workedMatch && (
          <>
            <h3 className="font-semibold mt-3 mb-1">What worked</h3>
            <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded border border-slate-200">
              {workedMatch[1].trim()}
            </pre>
          </>
        )}
        {draggedMatch && (
          <>
            <h3 className="font-semibold mt-3 mb-1">What dragged</h3>
            <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded border border-slate-200">
              {draggedMatch[1].trim()}
            </pre>
          </>
        )}
      </section>

      <ProposalReviewForm
        week={proposal.week}
        diffs={diffs}
        applied={proposal.frontmatter.applied === true}
      />
    </>
  );
}
