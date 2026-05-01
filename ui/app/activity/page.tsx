import { readActivity } from "@/lib/fs-adapter";
import ActivityClient from "./ActivityClient";

export const metadata = { title: "Activity — Clawspace" };
export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const items = await readActivity();
  return <ActivityClient items={items} />;
}
