import { readNotebookLMData } from "@/lib/fs-adapter";
import NotebookLMClient from "./NotebookLMClient";

export const metadata = { title: "NotebookLM — Clawspace" };
export const dynamic = "force-dynamic";

export default async function NotebookLMPage() {
  const domains = await readNotebookLMData();
  const mode = (process.env.CLAWSPACE_NOTEBOOKLM_MODE === "auto" ? "auto" : "manual") as "auto" | "manual";
  return <NotebookLMClient initialDomains={domains} mode={mode} />;
}
