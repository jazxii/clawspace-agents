import { notFound } from "next/navigation";
import { readKanbanBoard } from "@/lib/fs-adapter";
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
  const data = await readKanbanBoard(board, isProject ? "project" : "content");
  if (!data) notFound();

  return <KanbanBoardView board={data} />;
}
