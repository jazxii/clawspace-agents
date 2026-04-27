#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.CLAWSPACE_ROOT
  ? path.resolve(process.env.CLAWSPACE_ROOT)
  : path.resolve(__dirname, "..", "..", "..");
const BUS_DIR = path.join(PROJECT_ROOT, "bus");
const OFFSETS_DIR = path.join(BUS_DIR, "offsets");

const CHANNEL_RE = /^[a-z0-9][a-z0-9_\-]{0,63}$/;
const AGENT_RE = /^[a-z0-9][a-z0-9_\-:]{0,63}$/;

function safeChannelPath(channel) {
  if (!CHANNEL_RE.test(channel)) {
    throw new Error(`invalid channel name: ${channel}`);
  }
  return path.join(BUS_DIR, `${channel}.jsonl`);
}

function safeOffsetPath(agentId, channel) {
  if (!AGENT_RE.test(agentId)) {
    throw new Error(`invalid agent id: ${agentId}`);
  }
  return path.join(OFFSETS_DIR, `${agentId}__${channel}.json`);
}

async function ensureDirs() {
  await fs.mkdir(BUS_DIR, { recursive: true });
  await fs.mkdir(OFFSETS_DIR, { recursive: true });
}

async function appendLine(file, obj) {
  const line = JSON.stringify(obj) + "\n";
  await fs.appendFile(file, line, { encoding: "utf8" });
}

async function readLinesFrom(file, byteOffset) {
  if (!existsSync(file)) return { lines: [], newOffset: 0 };
  const stat = await fs.stat(file);
  if (byteOffset >= stat.size) return { lines: [], newOffset: stat.size };
  const fd = await fs.open(file, "r");
  try {
    const buf = Buffer.alloc(stat.size - byteOffset);
    await fd.read(buf, 0, buf.length, byteOffset);
    const text = buf.toString("utf8");
    const lines = text
      .split("\n")
      .filter((l) => l.length > 0)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return { _parse_error: true, raw: l };
        }
      });
    return { lines, newOffset: stat.size };
  } finally {
    await fd.close();
  }
}

async function readOffset(agentId, channel) {
  const f = safeOffsetPath(agentId, channel);
  if (!existsSync(f)) return 0;
  try {
    const txt = await fs.readFile(f, "utf8");
    return JSON.parse(txt).offset ?? 0;
  } catch {
    return 0;
  }
}

async function writeOffset(agentId, channel, offset) {
  const f = safeOffsetPath(agentId, channel);
  await fs.writeFile(f, JSON.stringify({ offset, ts: new Date().toISOString() }) + "\n");
}

const server = new Server(
  { name: "bus-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "bus_post",
      description:
        "Append a message to a bus channel. Atomic, no locks. Channel auto-created on first post. Use this instead of writing to bus/*.jsonl directly.",
      inputSchema: {
        type: "object",
        required: ["channel", "from", "type", "body"],
        properties: {
          channel: { type: "string", description: "Channel slug, e.g. 'content', 'projects', 'meta'." },
          from: { type: "string", description: "Agent id, e.g. 'scrum-master:graphify'." },
          to: { type: "string", description: "Recipient agent id, optional. Use '*' or omit for broadcast." },
          type: {
            type: "string",
            enum: ["task", "status", "question", "answer", "alert", "note", "done"],
          },
          body: { type: "string", description: "Message body (markdown ok)." },
          ref: { type: "string", description: "Optional reference path or URL pointing to artifacts." },
        },
      },
    },
    {
      name: "bus_subscribe",
      description:
        "Read NEW messages on a channel since this agent's last read. Advances the agent's offset on success. Use this for delta-only catch-up; never re-read the full channel.",
      inputSchema: {
        type: "object",
        required: ["channel", "agent_id"],
        properties: {
          channel: { type: "string" },
          agent_id: { type: "string" },
          max: { type: "integer", default: 50, minimum: 1, maximum: 500 },
          peek: {
            type: "boolean",
            default: false,
            description: "If true, do not advance the offset.",
          },
        },
      },
    },
    {
      name: "bus_list",
      description:
        "Search a channel without affecting offsets. Filter by sender, recipient, type, or substring. Returns up to `max` matching messages (most recent last).",
      inputSchema: {
        type: "object",
        required: ["channel"],
        properties: {
          channel: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
          type: { type: "string" },
          contains: { type: "string" },
          since: { type: "string", description: "ISO timestamp lower bound." },
          max: { type: "integer", default: 50, minimum: 1, maximum: 500 },
        },
      },
    },
    {
      name: "bus_dm",
      description:
        "Send a direct message between two agents. Sugar for posting to channel 'dm-<a>-<b>' (lex-sorted) so both sides converge on the same file.",
      inputSchema: {
        type: "object",
        required: ["from", "to", "body"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          body: { type: "string" },
          ref: { type: "string" },
        },
      },
    },
    {
      name: "bus_channels",
      description: "List all known channels (one per .jsonl in bus/).",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  await ensureDirs();
  const { name, arguments: args } = req.params;
  try {
    if (name === "bus_post") {
      const file = safeChannelPath(args.channel);
      const msg = {
        ts: new Date().toISOString(),
        ch: args.channel,
        from: args.from,
        to: args.to ?? "*",
        type: args.type,
        body: args.body,
        ref: args.ref,
      };
      await appendLine(file, msg);
      return {
        content: [
          { type: "text", text: `posted to ${args.channel} at ${msg.ts}` },
        ],
      };
    }

    if (name === "bus_subscribe") {
      const file = safeChannelPath(args.channel);
      const offset = await readOffset(args.agent_id, args.channel);
      const { lines, newOffset } = await readLinesFrom(file, offset);
      const max = args.max ?? 50;
      const slice = lines.slice(0, max);
      if (!args.peek) {
        // Advance offset only over consumed lines, not the entire file delta.
        // Recompute the byte length of consumed lines.
        const consumedText =
          slice.map((l) => JSON.stringify(l)).join("\n") + (slice.length ? "\n" : "");
        const consumedBytes = Buffer.byteLength(consumedText, "utf8");
        await writeOffset(
          args.agent_id,
          args.channel,
          slice.length === lines.length ? newOffset : offset + consumedBytes
        );
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                channel: args.channel,
                agent_id: args.agent_id,
                count: slice.length,
                more: slice.length < lines.length,
                messages: slice,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "bus_list") {
      const file = safeChannelPath(args.channel);
      const { lines } = await readLinesFrom(file, 0);
      const sinceTs = args.since ? new Date(args.since).getTime() : 0;
      const filtered = lines.filter((m) => {
        if (m._parse_error) return false;
        if (args.from && m.from !== args.from) return false;
        if (args.to && m.to !== args.to && m.to !== "*") return false;
        if (args.type && m.type !== args.type) return false;
        if (args.contains && !(m.body || "").toLowerCase().includes(args.contains.toLowerCase()))
          return false;
        if (sinceTs && new Date(m.ts).getTime() < sinceTs) return false;
        return true;
      });
      const max = args.max ?? 50;
      const tail = filtered.slice(-max);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { channel: args.channel, total_match: filtered.length, returned: tail.length, messages: tail },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "bus_dm") {
      const [a, b] = [args.from, args.to].sort();
      const channel = `dm-${a}-${b}`.toLowerCase().replace(/[^a-z0-9_\-]/g, "-").slice(0, 64);
      const file = safeChannelPath(channel);
      const msg = {
        ts: new Date().toISOString(),
        ch: channel,
        from: args.from,
        to: args.to,
        type: "note",
        body: args.body,
        ref: args.ref,
      };
      await appendLine(file, msg);
      return { content: [{ type: "text", text: `dm posted to ${channel}` }] };
    }

    if (name === "bus_channels") {
      const entries = existsSync(BUS_DIR) ? await fs.readdir(BUS_DIR) : [];
      const channels = entries
        .filter((f) => f.endsWith(".jsonl"))
        .map((f) => f.replace(/\.jsonl$/, ""));
      return { content: [{ type: "text", text: JSON.stringify({ channels }, null, 2) }] };
    }

    throw new Error(`unknown tool: ${name}`);
  } catch (err) {
    return {
      isError: true,
      content: [{ type: "text", text: `bus-mcp error: ${err.message}` }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
