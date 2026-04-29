import { notFound } from "next/navigation";
import { readProposal } from "@/lib/fs-adapter";
import CopyCommand from "./_components/CopyCommand";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  return { title: `Confirm ${week} apply — Clawspace` };
}

export default async function ConfirmApply({
  params,
  searchParams,
}: {
  params: Promise<{ week: string }>;
  searchParams: Promise<{ select?: string }>;
}) {
  const { week } = await params;
  const { select } = await searchParams;
  const proposal = await readProposal(week);
  if (!proposal) notFound();
  const cleanSelect = (select ?? "").replace(/[^0-9,]/g, "");
  const cmd = cleanSelect
    ? `/apply-proposal ${week} --select ${cleanSelect}`
    : `/apply-proposal ${week}`;

  return (
    <>
      <header className="page-chrome">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/proposals">Proposals</a></li>
            <li><a href={`/proposals/${week}`}>{week}</a></li>
            <li><span aria-current="page">Confirm</span></li>
          </ol>
        </nav>
        <h1 className="text-2xl font-semibold">Confirm apply</h1>
      </header>
      <p className="text-secondary mb-6">
        This UI does not run the apply for you. Run the command below from your Claude Code
        session. The <code>proposal-applier</code> agent will dry-run first, surface every
        diff, and wait for your <code>yes</code> before any write.
      </p>

      <section aria-labelledby="cmd-h" className="mb-6">
        <h2 id="cmd-h" className="text-lg font-semibold mb-3">
          Command to run
        </h2>
        <CopyCommand command={cmd} />
      </section>

      <section aria-labelledby="next-h">
        <h2 id="next-h" className="text-lg font-semibold mb-3">
          Next
        </h2>
        <ul role="list" className="list-disc list-inside text-sm space-y-1">
          <li>Open Claude Code in this workspace.</li>
          <li>Paste the command. Review the dry-run plan.</li>
          <li>
            Confirm with <code>yes</code> when prompted; the applier writes one entry per
            applied diff to <code>audit/mutations.jsonl</code>.
          </li>
          <li>
            To revert, run <code>/rollback-proposal {week}</code>.
          </li>
        </ul>
        <p className="mt-4">
          <a className="text-blue-700 underline" href={`/proposals/${week}`}>
            ← Back to review
          </a>
        </p>
      </section>
    </>
  );
}
