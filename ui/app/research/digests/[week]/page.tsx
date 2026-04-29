import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { listResearchDigests, readResearchDigest } from "@/lib/fs-adapter";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  return { title: `${week} digest — Clawspace` };
}

/**
 * Heading downshift (per ACCESSIBILITY-BRIEF §5):
 * The page already provides <h1>. Markdown's # becomes <h2>, ## becomes <h3>, etc.
 * react-markdown's `components` prop lets us override element names directly.
 */
const headingDownshift: Components = {
  h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  h2: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
  h3: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
  h4: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
  h5: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
  // Ensure code blocks are keyboard-scrollable (per ACCESSIBILITY-BRIEF §5)
  pre: ({ children, ...props }) => (
    <pre tabIndex={0} className="overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100" {...props}>
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <table className="my-3 border-collapse border border-slate-300" {...props}>
      {children}
    </table>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-slate-300 px-2 py-1 bg-slate-100" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-slate-300 px-2 py-1" {...props}>
      {children}
    </td>
  ),
};

export default async function DigestDetail({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const digest = await readResearchDigest(week);
  if (!digest) notFound();
  const all = await listResearchDigests();
  const idx = all.findIndex((d) => d.week === week);
  const prev = idx >= 0 ? all[idx + 1] : undefined;
  const next = idx >= 0 ? all[idx - 1] : undefined;

  return (
    <>
      <header className="page-chrome">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/research/digests">Research</a></li>
            <li><span aria-current="page">{digest.week}</span></li>
          </ol>
        </nav>
        <h1 id="digest-h" className="text-2xl font-semibold">
          Research digest — {digest.week}
        </h1>
        {digest.frontmatter.window ? (
          <p className="text-sm text-secondary">
            <time dateTime={String(digest.frontmatter.window)}>
              {String(digest.frontmatter.window)}
            </time>
          </p>
        ) : null}
      </header>
      <article aria-labelledby="digest-h" className="prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={headingDownshift} skipHtml>
          {digest.body}
        </ReactMarkdown>
      </article>

      <nav aria-label="Digest navigation" className="mt-8 flex justify-between text-sm">
        {prev ? (
          <a className="text-blue-700 underline" href={`/research/digests/${prev.week}`} rel="prev">
            ← Previous: {prev.week}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="text-blue-700 underline" href={`/research/digests/${next.week}`} rel="next">
            Next: {next.week} →
          </a>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}
