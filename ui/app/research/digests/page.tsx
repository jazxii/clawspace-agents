import { listResearchDigests } from "@/lib/fs-adapter";

export const metadata = { title: "Research digests — Clawspace" };
export const dynamic = "force-dynamic";

export default async function ResearchDigests() {
  const digests = await listResearchDigests();
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Research digests</h1>
      {digests.length === 0 ? (
        <p className="text-slate-700">
          No digests yet. <code>weekly-digest-composer</code> writes one each Friday at 16:00.
        </p>
      ) : (
        <ul role="list" className="space-y-2">
          {digests.map((d) => (
            <li key={d.week}>
              <a
                href={`/research/digests/${encodeURIComponent(d.week)}`}
                className="block rounded border border-slate-200 p-3 hover:bg-slate-50"
              >
                {/* Link text is the digest week — never "Read more" (WCAG 2.4.4) */}
                <span className="font-medium">{d.week}</span>
                {d.frontmatter.window ? (
                  <span className="ml-2 text-sm text-slate-600">
                    ({String(d.frontmatter.window)})
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
