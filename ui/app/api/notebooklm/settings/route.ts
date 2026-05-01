import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const SETTINGS_FILE = path.join(PROJECT_ROOT, ".notebooklm-sync.json");

export interface NotebookLMSettings {
  connected: boolean;
  mode: "auto" | "manual";
  authToken?: string;
  projectUrl?: string;
  lastRunAt?: string;
}

async function readSettings(): Promise<NotebookLMSettings> {
  if (!existsSync(SETTINGS_FILE)) {
    return { connected: false, mode: "manual" };
  }
  try {
    const txt = await fs.readFile(SETTINGS_FILE, "utf8");
    return JSON.parse(txt) as NotebookLMSettings;
  } catch {
    return { connected: false, mode: "manual" };
  }
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({
    connected: settings.connected,
    mode: settings.mode,
    projectUrl: settings.projectUrl ?? "",
    lastRunAt: settings.lastRunAt ?? "",
    hasAuth: !!settings.authToken,
  });
}

export async function POST(req: NextRequest) {
  let body: { mode?: string; authToken?: string; projectUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { mode, authToken, projectUrl } = body;

  if (mode !== "auto" && mode !== "manual") {
    return NextResponse.json({ error: "mode must be 'auto' or 'manual'" }, { status: 400 });
  }

  const settings: NotebookLMSettings = {
    connected: true,
    mode: mode as "auto" | "manual",
    authToken: authToken || "",
    projectUrl: projectUrl || "",
    lastRunAt: "",
  };

  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");

  return NextResponse.json({
    connected: true,
    mode: settings.mode,
    projectUrl: settings.projectUrl,
    hasAuth: !!settings.authToken,
  });
}

export async function DELETE() {
  if (existsSync(SETTINGS_FILE)) {
    await fs.unlink(SETTINGS_FILE);
  }
  return NextResponse.json({ connected: false, mode: "manual" });
}
