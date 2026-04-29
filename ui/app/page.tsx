import {
  listKanbanBoards,
  readLatestAcrossChannels,
  listProposals,
  readTodaysLog,
  listResearchDigests,
} from "@/lib/fs-adapter";
import StatusBadge from "./_components/StatusBadge";

export const metadata = { title: "Dashboard — Clawspace" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [boards, headlines, proposals, todaysLog, digests] = await Promise.all([
    listKanbanBoards(),
    readLatestAcrossChannels(8),
    listProposals(),
    readTodaysLog(),
    listResearchDigests(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const pendingProposals = proposals.filter((p) => !p.frontmatter.applied);
  const latestDigest = digests[0];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Today — {today}</h1>

      <section aria-labelledby="domains-heading" className="mb-8">
        <h2 id="domains-heading" className="text-lg font-semibold mb-3">
          Domain snapshots
        </h2>
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <li>
            <article aria-labelledby="content-h" className="rounded border border-slate-200 p-4">
              <h3 id="content-h" className="font-semibold">
                Content
              </h3>
              <p className="text-sm text-slate-700 mt-1">
                {boards.filter((b) => b.kind === "content").length} boards
              </p>
              <p className="mt-2">
                <a className="text-blue-700 underline" href="/kanban">
                  View Kanban
                </a>
              </p>
            </article>
          </li>
          <li>
            <article aria-labelledby="projects-h" className="rounded border border-slate-200 p-4">
              <h3 id="projects-h" className="font-semibold">
                Projects
              </h3>
              <p className="text-sm text-slate-700 mt-1">
                {boards.filter((b) => b.kind === "project").length} active
              </p>
              <p className="mt-2">
                <a className="text-blue-700 underline" href="/kanban">
                  View boards
                </a>
              </p>
            </article>
          </li>
          <li>
            <article aria-labelledby="research-h" className="rounded border border-slate-200 p-4">
              <h3 id="research-h" className="font-semibold">
                Research
              </h3>
              <p className="text-sm text-slate-700 mt-1">
                {digests.length} weekly digests
              </p>
              <p className="mt-2">
                <a className="text-blue-700 underline" href="/research/digests">
                  Browse digests
                </a>
              </p>
            </article>
          </li>
          <li>
            <article aria-labelledby="meta-h" className="rounded border border-slate-200 p-4">
              <h3 id="meta-h" className="font-semibold">
                Meta health
              </h3>
              <p className="text-sm text-slate-700 mt-1">
                <StatusBadge tone={pendingProposals.length > 0 ? "warning" : "info"}>
                  {pendingProposals.length > 0
                    ? `${pendingProposals.length} pending review`
                    : "Up to date"}
                </StatusBadge>
              </p>
              <p className="mt-2">
                <a className="text-blue-700 underline" href="/proposals">
                  Open proposals
                </a>
              </p>
            </article>
          </li>
        </ul>
      </section>

      <section aria-labelledby="bus-heading" className="mb-8">
        <h2 id="bus-heading" className="text-lg font-semibold mb-3">
          Latest bus activity
        </h2>
        {headlines.length === 0 ? (
          <p className="text-slate-700">No messages yet.</p>
        ) : (
          <ol className="space-y-2">
            {headlines.map((m) => (
              <li key={`${m.ts}-${m.from}`}>
                <a
                  href={`/channels/${m.ch}`}
                  className="block rounded border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <span className="text-xs text-slate-500">
                    <time dateTime={m.ts}>{m.ts.slice(11, 19)} UTC</time> · #{m.ch} ·{" "}
                    {m.from} · {m.type}
                  </span>
                  <span className="block mt-1">{m.body.slice(0, 200)}</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="log-heading" className="mb-8">
        <h2 id="log-heading" className="text-lg font-semibold mb-3">
          Today's reasoning log
        </h2>
        {todaysLog ? (
          <p>
            <a className="text-blue-700 underline" href={`/logs/${todaysLog.date}`}>
              View {todaysLog.date} log
            </a>
          </p>
        ) : (
          <p className="text-slate-700">No log yet for {today}.</p>
        )}
      </section>

      <section aria-labelledby="proposals-heading" aria-describedby="proposals-count">
        <h2 id="proposals-heading" className="text-lg font-semibold mb-3">
          Pending proposals
        </h2>
        <p id="proposals-count" className="text-slate-700 mb-2">
          {pendingProposals.length} {pendingProposals.length === 1 ? "proposal" : "proposals"}{" "}
          awaiting review
        </p>
        {pendingProposals.length > 0 && (
          <p>
            <a
              href="/proposals"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Review proposals
            </a>
          </p>
        )}
        {latestDigest && (
          <p className="mt-3 text-sm text-slate-600">
            Latest research digest:{" "}
            <a
              className="text-blue-700 underline"
              href={`/research/digests/${latestDigest.week}`}
            >
              {latestDigest.week}
            </a>
          </p>
        )}
      </section>
    </>
  );
}
