import { readGraphifyIndex } from "@/lib/fs-adapter";
import GraphClient from "./GraphClient";

export const metadata = { title: "Graphify — Clawspace" };
export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const { nodes, edges } = await readGraphifyIndex();
  return <GraphClient nodes={nodes} edges={edges} />;
}
