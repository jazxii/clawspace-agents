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
    <>
      <style>{`.cs-page { overflow: hidden; display: flex; flex-direction: column; } .cs-page > .cs-page-inner { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }`}</style>
      <div className="cs-page-inner" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", maxWidth: "none", overflow: "hidden" }}>
        <div className="cs-page-title" style={{ flexShrink: 0 }}>
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
    </>
  );
}
