import { readAuditLog } from "@/lib/fs-adapter";
import { Icon } from "../_components/Icon";
import { Pill } from "../_components/Pill";

export const metadata = { title: "Audit — Clawspace" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const entries = await readAuditLog();

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Audit log</h1>
          <p>Every applied/rolled-back proposal · append-only · {entries.length} entries</p>
        </div>
        <button className="cs-btn">
          <Icon name="filter" size={13} />All actors
        </button>
      </div>
      <div className="cs-card">
        <table className="cs-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>File</th>
              <th>Diff</th>
              <th>Proposal</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-3)" }}>No audit entries</td></tr>
            ) : (
              entries.map((a, i) => (
                <tr key={i}>
                  <td className="mono muted">{a.ts.replace("T", " ").slice(0, 16)}</td>
                  <td><b>{a.actor}</b></td>
                  <td>
                    <Pill tone={a.action === "rollback" ? "alert" : "meta"} dot>{a.action}</Pill>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{a.file}</td>
                  <td className="mono tnum" style={{ fontSize: 12 }}>{a.lines}</td>
                  <td><Pill tone="meta">{a.prop}</Pill></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
