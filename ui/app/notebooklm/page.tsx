import { readNotebookLMData } from "@/lib/fs-adapter";
import NotebookLMClient from "./NotebookLMClient";

export const metadata = { title: "NotebookLM Sync — Clawspace" };
export const dynamic = "force-dynamic";

export default async function NotebookLMPage() {
  const domains = await readNotebookLMData();
  return <NotebookLMClient initialDomains={domains} />;
}
