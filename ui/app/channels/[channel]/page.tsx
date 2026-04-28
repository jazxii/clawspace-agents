import { notFound } from "next/navigation";
import { listBusChannels, readBusChannel } from "@/lib/fs-adapter";
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
  const [allChannels, history] = await Promise.all([
    listBusChannels(),
    readBusChannel(channel, { limit: 100 }),
  ]);

  return (
    <ChannelView
      channel={channel}
      allChannels={allChannels}
      initialHistory={history}
      initialSince={history[history.length - 1]?.ts ?? ""}
    />
  );
}
