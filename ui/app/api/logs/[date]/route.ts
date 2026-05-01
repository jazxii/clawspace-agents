import { readDailyLog } from "@/lib/fs-adapter";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }
  const log = await readDailyLog(date);
  if (!log) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(log);
}
