import { readContentQueue } from "@/lib/fs-adapter";
import QueueClient from "./QueueClient";

export const metadata = { title: "Content Queue — Clawspace" };
export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const items = await readContentQueue();
  return <QueueClient items={items} />;
}
