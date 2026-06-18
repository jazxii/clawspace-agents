// Capture high-res screenshots of the running Clawspace UI for the Remotion video.
// Usage: node scripts/shoot.mjs   (UI dev server must be running on :5000)
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "shots");
const BASE = process.env.BASE_URL || "http://localhost:5000";

// route -> { name, theme, fullPage?, wait? }
const ROUTES = [
  { path: "/", name: "dashboard" },
  { path: "/kanban", name: "kanban-index" },
  { path: "/kanban/a11yai-accessibility-defect-automation", name: "kanban-board" },
  { path: "/channels", name: "channels" },
  { path: "/channels/all-hands", name: "channel" },
  { path: "/activity", name: "activity" },
  { path: "/cost", name: "cost" },
  { path: "/graph", name: "graph" },
  { path: "/queue", name: "queue" },
  { path: "/agents", name: "agents" },
  { path: "/proposals", name: "proposals" },
  { path: "/logs", name: "logs" },
];

const VW = 1600;
const VH = 1000;

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: VW, height: VH },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  // Force dark theme + reduced motion so the capture is crisp + stable.
  await page.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark");
    } catch {}
    document.documentElement.setAttribute("data-theme", "dark");
  });

  for (const r of ROUTES) {
    const url = BASE + r.path;
    try {
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 12000 });
      } catch {
        // SSE / live-tail routes never reach networkidle — fall back.
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      }
      await page.emulateMedia({ colorScheme: "dark" });
      await page.evaluate(() =>
        document.documentElement.setAttribute("data-theme", "dark"),
      );
      await page.waitForTimeout(700);
      const file = join(OUT, `${r.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log("captured", r.name);
    } catch (e) {
      console.error("FAILED", r.name, e.message);
    }
  }
  await browser.close();
}

run();
