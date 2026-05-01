import { listAgents } from "@/lib/fs-adapter";
import AgentsClient from "./AgentsClient";

export const metadata = { title: "Agents — Clawspace" };
export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await listAgents();
  return <AgentsClient agents={agents} />;
}
