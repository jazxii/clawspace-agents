import { listResearchDigests } from "@/lib/fs-adapter";
import { Icon } from "../../_components/Icon";
import { Pill } from "../../_components/Pill";
import Link from "next/link";

export const metadata = { title: "Research digests — Clawspace" };
export const dynamic = "force-dynamic";

export default async function ResearchDigests() {
  const digests = await listResearchDigests();
  return (
    <div className="cs-page-inner" style={{ maxWidth: 1200 }}>
      <div className="cs-page-title">
        <div>
          <h1>Research digests</h1>
          <p>Weekly compilations by weekly-digest-composer · {digests.length} total</p>
        </div>
        <div className="row gap-2">
          <button className="cs-btn">
            <Icon name="mail" size={13} />Stage newsletter
          </button>
        </div>
      </div>

      {digests.length === 0 ? (
        <div className="cs-card">
          <div className="cs-card-body" style={{ color: "var(--text-3)" }}>
            No digests yet. <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>weekly-digest-composer</code> writes one each Friday at 16:00.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--pad-3)" }}>
          {digests.map((d) => (
            <Link
              key={d.week}
              href={`/research/digests/${encodeURIComponent(d.week)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="cs-card" style={{ cursor: "pointer" }}>
                <div className="cs-card-h">
                  <h3><Icon name="digest" size={14} />{d.week}</h3>
                  <Pill tone="research" dot>digest</Pill>
                </div>
                {(d.frontmatter.window || d.body) ? (
                  <div className="cs-card-body" style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                    {d.frontmatter.window ? (
                      <span className="muted" style={{ fontSize: 12 }}>Window: {String(d.frontmatter.window)} · </span>
                    ) : null}
                    {d.body ? `${d.body.slice(0, 150)}…` : ""}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
