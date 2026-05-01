import { readNotionSyncState } from "@/lib/fs-adapter";
import NotionClient from "./NotionClient";

export const metadata = { title: "Notion Sync — Clawspace" };
export const dynamic = "force-dynamic";

export default async function NotionPage() {
  const pages = await readNotionSyncState();
  return <NotionClient initialPages={pages} />;
}
