import { listBusChannels, readBusChannel } from "@/lib/fs-adapter";
import { Icon } from "../_components/Icon";
import Link from "next/link";

export const metadata = { title: "Channels — Clawspace" };
export const dynamic = "force-dynamic";

const channelDomain = (ch: string): "content" | "projects" | "research" | "meta" => {
  if (ch === "content") return "content";
  if (ch === "projects" || ch.startsWith("proj-")) return "projects";
  if (ch === "research") return "research";
  return "meta";
};

export default async function ChannelsIndex() {
  const channels = await listBusChannels();

  // Get unread counts (last 50 messages per channel)
  const channelInfo = await Promise.all(
    channels.map(async (ch) => {
      const msgs = await readBusChannel(ch, { limit: 5 });
      return { id: ch, msgs: msgs.length, domain: channelDomain(ch), kind: ch.startsWith("dm-") ? "dm" as const : "channel" as const };
    }),
  );

  const builtinChannels = channelInfo.filter((c) => c.kind === "channel");
  const dmChannels = channelInfo.filter((c) => c.kind === "dm");

  return (
    <div className="cs-page-inner" style={{ height: "100%", display: "flex", flexDirection: "column", maxWidth: "none" }}>
      <div className="cs-page-title">
        <div>
          <h1>Channels</h1>
          <p>The bus — append-only JSONL, agents read deltas via offsets</p>
        </div>
      </div>

      <div className="cs-channel" style={{ flex: 1, minHeight: 0 }}>
        <aside className="cs-ch-list">
          <div className="cs-ch-grp">Channels</div>
          {builtinChannels.map((c) => (
            <Link
              key={c.id}
              href={`/channels/${encodeURIComponent(c.id)}`}
              className="cs-ch-item"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="hash">#</span>
              <span className="ellipsis">{c.id}</span>
              {c.msgs > 0 && (
                <span className="badge" style={{ background: `var(--accent-${c.domain})` }}>
                  {c.msgs}
                </span>
              )}
            </Link>
          ))}
          {dmChannels.length > 0 && (
            <>
              <div className="cs-ch-grp">Direct</div>
              {dmChannels.map((c) => (
                <Link
                  key={c.id}
                  href={`/channels/${encodeURIComponent(c.id)}`}
                  className="cs-ch-item"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Icon name="at" size={11} />
                  <span className="ellipsis">{c.id.replace(/^dm-/, "")}</span>
                </Link>
              ))}
            </>
          )}
        </aside>

        <div className="cs-ch-main">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: 14 }}>
            Select a channel to view messages
          </div>
        </div>
      </div>
    </div>
  );
}
