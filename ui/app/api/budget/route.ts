import { NextResponse } from "next/server";

/**
 * GET /api/budget — returns the 5h rolling token estimate for the budget pill.
 *
 * Phase B ships a stub. Phase D3 will compute this from `audit/mutations.jsonl`
 * + the scheduled-task logs, broken down by model (opus/sonnet/haiku).
 */

export interface BudgetSnapshot {
  used: number;
  cap: number;
  pct: number;       // 0-100
  resetsAt: string;  // ISO-8601
  perModel: { opus: number; sonnet: number; haiku: number };
}

export async function GET(): Promise<NextResponse<BudgetSnapshot>> {
  // Stub: matches the design's marketing screenshot until Phase D3 wires real data.
  const cap = 120_000;
  const used = 64_200;
  const resets = new Date();
  resets.setHours(19, 30, 0, 0);

  return NextResponse.json({
    used,
    cap,
    pct: Math.round((used / cap) * 100),
    resetsAt: resets.toISOString(),
    perModel: { opus: 21_400, sonnet: 38_600, haiku: 4_200 },
  });
}
