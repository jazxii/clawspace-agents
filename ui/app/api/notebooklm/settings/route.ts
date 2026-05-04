import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const mode = process.env.CLAWSPACE_NOTEBOOKLM_MODE === "auto" ? "auto" : "manual";
  return NextResponse.json({
    connected: true,
    mode,
    hasAuth: mode === "auto",
  });
}
