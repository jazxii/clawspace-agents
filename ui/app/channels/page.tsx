import { listBusChannels } from "@/lib/fs-adapter";
import Breadcrumbs from "../_components/Breadcrumbs";

export const metadata = { title: "Channels — Clawspace" };
export const dynamic = "force-dynamic";

export default async function ChannelsIndex() {
  const channels = await listBusChannels();
  return (
    <>
      <header className="page-chrome">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Channels" }]} />
        <h1 className="text-2xl font-semibold">Channels</h1>
      </header>
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
