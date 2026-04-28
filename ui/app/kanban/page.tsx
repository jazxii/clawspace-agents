import { listKanbanBoards } from "@/lib/fs-adapter";

export const metadata = { title: "Kanban — Clawspace" };
export const dynamic = "force-dynamic";

export default async function KanbanIndex() {
  const boards = await listKanbanBoards();
  const content = boards.filter((b) => b.kind === "content");
  const projects = boards.filter((b) => b.kind === "project");

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Kanban boards</h1>

      <section aria-labelledby="content-boards" className="mb-8">
        <h2 id="content-boards" className="text-lg font-semibold mb-3">
          Content
        </h2>
        {content.length === 0 ? (
          <p className="text-slate-700">No content boards.</p>
        ) : (
          <ul role="list" className="space-y-2">
            {content.map((b) => (
              <li key={b.slug}>
                <a
                  href={`/kanban/${encodeURIComponent(b.slug)}`}
                  className="block rounded border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <span className="font-medium">{b.slug}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="project-boards">
        <h2 id="project-boards" className="text-lg font-semibold mb-3">
          Projects
        </h2>
        {projects.length === 0 ? (
          <p className="text-slate-700">
            No project boards. Use <code>/new-project &lt;slug&gt;</code> from Claude Code to
            scaffold one.
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {projects.map((b) => (
              <li key={b.slug}>
                <a
                  href={`/kanban/${encodeURIComponent(b.slug)}?kind=project`}
                  className="block rounded border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <span className="font-medium">{b.slug}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
