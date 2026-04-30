import { notFound } from "next/navigation";
import { readKanbanRaw } from "@/lib/fs-adapter";
import { originalIsCleanForWriteBack } from "@/lib/kanban-serialize";
import KanbanBoardView from "./_components/KanbanBoardView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  return { title: `Kanban — ${board} — Clawspace` };
}

export default async function KanbanBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { board } = await params;
  const { kind } = await searchParams;
  const isProject = kind === "project";
  const result = await readKanbanRaw(board, isProject ? "project" : "content");
  if (!result) notFound();

  const writeBackEnabled = originalIsCleanForWriteBack(result.rawText);
  return (
    <KanbanBoardView
      board={result.board}
      mtimeMs={result.mtimeMs}
      kind={isProject ? "project" : "content"}
      writeBackEnabled={writeBackEnabled}
      formatNote={
        writeBackEnabled
          ? undefined
          : "This board contains free-form content (non-card lines). Editing is disabled to prevent corruption — convert to the canonical card format to enable write-back."
      }
    />
  );
}
