import { notFound } from "next/navigation";
import { listBusChannels, readBusChannel, getChannelTeam } from "@/lib/fs-adapter";
import ChannelView from "./_components/ChannelView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }) {
  const { channel } = await params;
  return { title: `#${channel} — Clawspace` };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channel: string }>;
}) {
  const { channel } = await params;
  if (!/^[a-z0-9][a-z0-9_\-]{0,63}$/.test(channel)) notFound();
  const [allChannels, history, team] = await Promise.all([
    listBusChannels(),
    readBusChannel(channel, { limit: 100 }),
    getChannelTeam(channel),
  ]);

  return (
    <div className="cs-page-inner" style={{ height: "100%", display: "flex", flexDirection: "column", maxWidth: "none" }}>
      <div className="cs-page-title">
        <div>
          <h1>Channels</h1>
          <p>The bus — append-only JSONL, agents read deltas via offsets</p>
        </div>
      </div>
      <ChannelView
        channel={channel}
        allChannels={allChannels}
        initialHistory={history}
        initialSince={history[history.length - 1]?.ts ?? ""}
        teamAgents={team.agents}
        channelDomainName={team.domain}
      />
    </div>
  );
}
