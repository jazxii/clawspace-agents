import { listBusChannels, readBusChannel, getChannelTeam } from "@/lib/fs-adapter";
import { Icon } from "../_components/Icon";
import Link from "next/link";

export const metadata = { title: "Channels — Clawspace" };
export const dynamic = "force-dynamic";

type Section = { label: string; icon: string; channels: ChannelRow[] };
type ChannelRow = {
  id: string;
  domain: string;
  msgCount: number;
  lastPreview: string;
  agentCount: number;
  type: "public" | "team" | "pipeline" | "dm";
};

export default async function ChannelsIndex() {
  const channels = await listBusChannels();

  const rows: ChannelRow[] = await Promise.all(
    channels.map(async (ch) => {
      const msgs = await readBusChannel(ch, { limit: 3 });
      const team = await getChannelTeam(ch);
      const last = msgs[msgs.length - 1];
      const preview = last ? `${last.from}: ${last.body?.slice(0, 80) || ""}` : "";
      return {
        id: ch,
        domain: team.domain,
        msgCount: msgs.length,
        lastPreview: preview,
        agentCount: team.agents.length,
        type: team.type,
      };
    }),
  );

  const sections: Section[] = [
    { label: "Public", icon: "globe", channels: rows.filter((r) => r.type === "public") },
    { label: "Team", icon: "users", channels: rows.filter((r) => r.type === "team") },
    { label: "Pipeline", icon: "sparkles", channels: rows.filter((r) => r.type === "pipeline") },
    { label: "Projects", icon: "folder", channels: rows.filter((r) => r.id.startsWith("proj-")) },
    { label: "Direct Messages", icon: "at", channels: rows.filter((r) => r.type === "dm") },
  ].filter((s) => s.channels.length > 0);

  return (
    <div className="cs-page-inner">
      <div className="cs-page-title">
        <div>
          <h1>Channels</h1>
          <p>{channels.length} channels — append-only JSONL bus</p>
        </div>
      </div>

      {sections.map((s) => (
        <div key={s.label} style={{ marginBottom: "var(--pad-4)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em",
            fontWeight: 600, color: "var(--text-3)", padding: "var(--pad-2) 0",
          }}>
            <Icon name={s.icon as "globe"} size={12} />
            {s.label}
            <span style={{ color: "var(--text-4)", fontWeight: 400, fontSize: 11 }}>({s.channels.length})</span>
          </div>
          <div className="cs-card">
            {s.channels.map((c, i) => (
              <Link
                key={c.id}
                href={`/channels/${encodeURIComponent(c.id)}`}
                className="cs-channel-card"
                style={i > 0 ? { borderTop: ".5px solid var(--hairline)" } : undefined}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: `var(--accent-${c.domain})`,
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "var(--font-mono)", minWidth: 140 }}>
                  #{c.id}
                </span>
                <span className="preview" style={{ flex: 1 }}>
                  {c.lastPreview || "No messages yet"}
                </span>
                {c.agentCount > 0 && (
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                    {c.agentCount} agents
                  </span>
                )}
                {c.msgCount > 0 && (
                  <span style={{
                    fontSize: 10, padding: "0 5px", height: 14,
                    display: "inline-flex", alignItems: "center",
                    borderRadius: 999, background: `var(--accent-${c.domain})`,
                    color: "white", fontWeight: 600,
                  }}>
                    {c.msgCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
