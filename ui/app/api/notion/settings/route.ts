import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const SETTINGS_FILE = path.join(PROJECT_ROOT, ".notion-sync.json");

export interface NotionSettings {
  connected: boolean;
  integrationToken?: string;
  contentDbId?: string;
  researchDbId?: string;
  lastSyncAt?: string;
  workspaceName?: string;
}

async function readSettings(): Promise<NotionSettings> {
  if (!existsSync(SETTINGS_FILE)) {
    return { connected: false };
  }
  try {
    const txt = await fs.readFile(SETTINGS_FILE, "utf8");
    return JSON.parse(txt) as NotionSettings;
  } catch {
    return { connected: false };
  }
}

export async function GET() {
  const settings = await readSettings();
  // Never expose the full token to the client
  return NextResponse.json({
    connected: settings.connected,
    contentDbId: settings.contentDbId ?? "",
    researchDbId: settings.researchDbId ?? "",
    lastSyncAt: settings.lastSyncAt ?? "",
    workspaceName: settings.workspaceName ?? "",
    hasToken: !!settings.integrationToken,
  });
}

export async function POST(req: NextRequest) {
  let body: { integrationToken?: string; contentDbId?: string; researchDbId?: string; workspaceName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { integrationToken, contentDbId, researchDbId, workspaceName } = body;

  if (!integrationToken || typeof integrationToken !== "string" || !integrationToken.startsWith("ntn_")) {
    return NextResponse.json({ error: "Invalid Notion integration token. Must start with ntn_" }, { status: 400 });
  }

  if (!contentDbId || typeof contentDbId !== "string") {
    return NextResponse.json({ error: "Content database ID is required" }, { status: 400 });
  }

  const settings: NotionSettings = {
    connected: true,
    integrationToken,
    contentDbId,
    researchDbId: researchDbId || "",
    workspaceName: workspaceName || "My Workspace",
    lastSyncAt: "",
  };

  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");

  return NextResponse.json({
    connected: true,
    contentDbId: settings.contentDbId,
    researchDbId: settings.researchDbId,
    workspaceName: settings.workspaceName,
    hasToken: true,
  });
}

export async function DELETE() {
  if (existsSync(SETTINGS_FILE)) {
    await fs.unlink(SETTINGS_FILE);
  }
  return NextResponse.json({ connected: false });
}
