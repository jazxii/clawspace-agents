#!/usr/bin/env node
/**
 * Agent Watcher — watches bus/*.jsonl for type=task messages and logs them.
 * In a full implementation this would spawn Claude agents; for now it watches
 * and logs to bus/meta via stdout.
 *
 * Usage: node .claude/mcp/agent-watcher.mjs
 */

import { watch, readFileSync, appendFileSync, existsSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.CLAWSPACE_ROOT || join(__dirname, "..", "..");
const BUS_DIR = join(ROOT, "bus");
const META_LOG = join(BUS_DIR, "meta.jsonl");
const OFFSETS_DIR = join(BUS_DIR, "offsets");

// Track file sizes so we only read new lines
const fileSizes = {};

function readNewLines(filePath) {
  const prev = fileSizes[filePath] || 0;
  const content = readFileSync(filePath, "utf-8");
  fileSizes[filePath] = content.length;
  if (prev >= content.length) return [];
  const newContent = content.slice(prev);
  return newContent
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    })
    .filter(Boolean);
}

const activeAgents = new Set();

function handleMessage(msg, channel) {
  if (msg.type !== "task") return;
  const target = msg.to;
  if (!target || target === "*") return;
  if (activeAgents.has(target)) {
    console.log(`[watcher] Skipping ${target} — already active`);
    return;
  }

  activeAgents.add(target);
  console.log(`[watcher] Task for ${target} on #${channel}: ${(msg.body || "").slice(0, 100)}`);

  // Log dispatch to meta
  const entry = {
    ts: new Date().toISOString(),
    from: "agent-watcher",
    to: target,
    type: "status",
    body: `Dispatching ${target} for task: ${(msg.body || "").slice(0, 120)}`,
    channel: "meta",
  };
  try {
    appendFileSync(META_LOG, JSON.stringify(entry) + "\n");
  } catch (e) {
    console.error("[watcher] Failed to log to meta:", e.message);
  }

  // In a full implementation, this would spawn:
  //   claude --agent .claude/agents/${target}.md --task "${msg.body}"
  // For now, mark done after a delay
  setTimeout(() => {
    activeAgents.delete(target);
    console.log(`[watcher] ${target} completed (stub)`);
  }, 5000);
}

// Initial scan
if (existsSync(BUS_DIR)) {
  const files = readFileSync(BUS_DIR, { withFileTypes: true }) || [];
  // Seed offsets to current file sizes (don't replay history)
  const { readdirSync } = await import("fs");
  for (const f of readdirSync(BUS_DIR)) {
    if (f.endsWith(".jsonl")) {
      const fp = join(BUS_DIR, f);
      try {
        fileSizes[fp] = readFileSync(fp, "utf-8").length;
      } catch {}
    }
  }
}

console.log(`[watcher] Watching ${BUS_DIR} for task messages…`);

watch(BUS_DIR, (eventType, filename) => {
  if (!filename || !filename.endsWith(".jsonl")) return;
  const filePath = join(BUS_DIR, filename);
  const channel = basename(filename, ".jsonl");
  try {
    const newMsgs = readNewLines(filePath);
    for (const msg of newMsgs) {
      handleMessage(msg, channel);
    }
  } catch (e) {
    // file may have been deleted
  }
});

// Keep alive
process.on("SIGINT", () => {
  console.log("[watcher] Shutting down");
  process.exit(0);
});
