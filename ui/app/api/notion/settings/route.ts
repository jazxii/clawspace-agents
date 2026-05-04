import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const SETTINGS_FILE = path.join(PROJECT_ROOT, ".notion-sync.json");

export async function GET() {
  if (!existsSync(SETTINGS_FILE)) {
    return NextResponse.json({ connected: false, dbs: {} });
  }
  try {
    const txt = await fs.readFile(SETTINGS_FILE, "utf8");
    const data = JSON.parse(txt);
    return NextResponse.json({
      connected: true,
      dbs: {
        content_queue: data.content_queue,
        research_digests: data.research_digests,
        content_calendar: data.content_calendar,
        source_library: data.source_library,
        newsletter_archive: data.newsletter_archive,
        ideas_board: data.ideas_board,
      },
      setup_at: data.setup_at,
    });
  } catch {
    return NextResponse.json({ connected: false, dbs: {} });
  }
}
