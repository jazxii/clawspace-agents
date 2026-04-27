#!/usr/bin/env node
// web-research-mcp — citation-capturing wrapper around fetch + DuckDuckGo HTML search.
// Every fetch is appended to research/<slug>/_citations.jsonl so notes can reference without re-fetching.
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
const RESEARCH_DIR = path.join(PROJECT_ROOT, "research", "domains");
const SLUG_RE = /^[a-z][a-z0-9\-]{0,40}$/;

function safeDomainPath(slug) {
  if (!SLUG_RE.test(slug)) throw new Error(`invalid domain slug: ${slug}`);
  const p = path.join(RESEARCH_DIR, slug);
  if (!existsSync(p)) throw new Error(`research domain not scaffolded: ${slug}`);
  return p;
}

async function appendCitation(slug, entry) {
  const p = path.join(safeDomainPath(slug), "_citations.jsonl");
  await fs.appendFile(p, JSON.stringify(entry) + "\n", "utf8");
}

function stripHtml(html) {
  return html
    .replace(/<script[^]*?<\/script>/gi, "")
    .replace(/<style[^]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : "(no title)";
}

async function fetchUrl(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "clawspace-web-research-mcp/0.1" },
    });
    const status = res.status;
    const ct = res.headers.get("content-type") || "";
    const body = await res.text();
    return { status, contentType: ct, body, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

const server = new Server(
  { name: "web-research-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "web_search",
      description:
        "DuckDuckGo HTML search (no API key required). Returns up to N results: {title, url, snippet}. Logs each result URL to the domain's citation ledger.",
      inputSchema: {
        type: "object",
        required: ["query", "domain_slug"],
        properties: {
          query: { type: "string" },
          domain_slug: { type: "string", description: "Research domain to attribute the search to (for citation ledger)." },
          max: { type: "integer", default: 8, minimum: 1, maximum: 20 },
        },
      },
    },
    {
      name: "web_fetch",
      description:
        "Fetch a URL, return cleaned text + title + status. Always logs to the domain's citation ledger so the note can cite without re-fetching. Returns up to `max_chars` of cleaned text.",
      inputSchema: {
        type: "object",
        required: ["url", "domain_slug"],
        properties: {
          url: { type: "string" },
          domain_slug: { type: "string" },
          max_chars: { type: "integer", default: 6000, minimum: 500, maximum: 30000 },
        },
      },
    },
    {
      name: "list_citations",
      description: "List the citation ledger for a research domain (most recent last). Returns parsed JSONL.",
      inputSchema: {
        type: "object",
        required: ["domain_slug"],
        properties: {
          domain_slug: { type: "string" },
          max: { type: "integer", default: 50, minimum: 1, maximum: 500 },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === "web_search") {
      const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(args.query)}`;
      const r = await fetchUrl(url);
      // Extract result blocks. DuckDuckGo HTML structure: <a class="result__a" href="..."> ... </a> + <a class="result__snippet">
      const results = [];
      const linkRe = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      const snipRe = /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
      const links = [...r.body.matchAll(linkRe)].map((m) => ({ url: decodeURIComponent(m[1].replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, "").replace(/&.*$/, "")), title: stripHtml(m[2]) }));
      const snips = [...r.body.matchAll(snipRe)].map((m) => stripHtml(m[1]));
      for (let i = 0; i < Math.min(links.length, args.max ?? 8); i++) {
        results.push({ title: links[i].title, url: links[i].url, snippet: snips[i] || "" });
      }
      // Log search to citation ledger
      await appendCitation(args.domain_slug, {
        ts: new Date().toISOString(),
        kind: "search",
        query: args.query,
        result_count: results.length,
      });
      return { content: [{ type: "text", text: JSON.stringify({ query: args.query, results }, null, 2) }] };
    }

    if (name === "web_fetch") {
      const r = await fetchUrl(args.url);
      const isHtml = (r.contentType || "").toLowerCase().includes("html");
      const title = isHtml ? extractTitle(r.body) : "(non-html)";
      const text = isHtml ? stripHtml(r.body) : r.body;
      const truncated = text.slice(0, args.max_chars ?? 6000);
      await appendCitation(args.domain_slug, {
        ts: new Date().toISOString(),
        kind: "fetch",
        url: args.url,
        final_url: r.finalUrl,
        title,
        status: r.status,
        excerpt: truncated.slice(0, 280),
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { url: args.url, final_url: r.finalUrl, status: r.status, title, text: truncated, truncated: text.length > truncated.length },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "list_citations") {
      const p = path.join(safeDomainPath(args.domain_slug), "_citations.jsonl");
      if (!existsSync(p)) return { content: [{ type: "text", text: JSON.stringify({ entries: [] }, null, 2) }] };
      const txt = await fs.readFile(p, "utf8");
      const entries = txt.split("\n").filter(Boolean).map((l) => {
        try { return JSON.parse(l); } catch { return { _parse_error: true, raw: l }; }
      });
      const tail = entries.slice(-(args.max ?? 50));
      return { content: [{ type: "text", text: JSON.stringify({ count: tail.length, entries: tail }, null, 2) }] };
    }

    throw new Error(`unknown tool: ${name}`);
  } catch (err) {
    return { isError: true, content: [{ type: "text", text: `web-research-mcp error: ${err.message}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
