import { listBusChannels } from "@/lib/fs-adapter";

export const metadata = { title: "Channels — Clawspace" };
export const dynamic = "force-dynamic";

export default async function ChannelsIndex() {
  const channels = await listBusChannels();
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Channels</h1>
      {channels.length === 0 ? (
        <p>No channels yet.</p>
      ) : (
        <nav aria-label="Channels">
          <ul role="list" className="space-y-2">
            {channels.map((ch) => (
              <li key={ch}>
                <a
                  href={`/channels/${encodeURIComponent(ch)}`}
                  className="block rounded border border-slate-200 p-3 hover:bg-slate-50"
                >
                  #{ch}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
