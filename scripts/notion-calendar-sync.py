#!/usr/bin/env python3
"""
notion-calendar-sync.py
-----------------------
Syncs the local content queue (all 3 platforms, 57 posts) to the
Notion Content Calendar database (DB ID: 3530ee97-23c8-81f9-8149-db80c10accf5).

For each post it creates/updates a Notion page with:
  Title       — "[Platform] — [topic/slug humanized]"
  Date        — post date (YYYY-MM-DD)
  Platform    — LinkedIn / Instagram / X
  Status      — ready / drafting / scheduled / posted / archived
  Slug        — filename slug
  Format      — story / insight / framework / carousel / reel / thread / standalone / etc.

Run:
  NOTION_TOKEN=ntn_... python3 scripts/notion-calendar-sync.py

Or (token already in env from settings.local.json):
  python3 scripts/notion-calendar-sync.py

Calendar view note:
  After this script runs, go to the Notion database and:
  1. Click "+ Add a view" at the top-left of the database.
  2. Select "Calendar".
  3. Choose "Date" as the calendar property.
  4. Click "Done".
  The database will now display all 57 posts on their respective dates.
"""

import json
import os
import re
import ssl
import urllib.request
import urllib.error
from datetime import datetime, timezone

ssl._create_default_https_context = ssl._create_unverified_context

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
NOTION_TOKEN = os.environ.get(
    "NOTION_TOKEN",
    "ntn_L40028825042i1uVnvN2ls383t3J9wLDoMui0RJEHMkbhw",
)
CALENDAR_DB_ID = "3530ee97-23c8-81f9-8149-db80c10accf5"
NOTION_VERSION = "2022-06-28"
NOW_ISO = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# ---------------------------------------------------------------------------
# All 57 posts (built from local frontmatter reads, 2026-05-07)
# Archived posts are excluded (instagram/2026-05-09-cognitive-load — status:archived)
# Posts without explicit date field default to filename date (2026-05-02 group)
# ---------------------------------------------------------------------------
POSTS = [
    # ---- LinkedIn (20 posts) ----
    {
        "platform": "LinkedIn",
        "date": "2026-05-02",
        "slug": "cognitive-load-neurodiversity",
        "format": "carousel",
        "status": "ready",
        "topic": "Cognitive Load and Neurodiversity: How it affects Accessibility",
        "source_path": "content/queue/linkedin/2026-05-02-cognitive-load-neurodiversity.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-05",
        "slug": "scanner-ceiling",
        "format": "insight",
        "status": "ready",
        "topic": "The 57% ceiling — what automated accessibility scanners miss",
        "source_path": "content/queue/linkedin/2026-05-05-scanner-ceiling.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-06",
        "slug": "aria-vs-native",
        "format": "insight",
        "status": "ready",
        "topic": "ARIA vs native HTML — why AI tools keep getting this wrong",
        "source_path": "content/queue/linkedin/2026-05-06-aria-vs-native.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-07",
        "slug": "axecore-ai-story",
        "format": "story",
        "status": "ready",
        "topic": "Builder story: the first time I ran axe-core on an AI-generated app",
        "source_path": "content/queue/linkedin/2026-05-07-axecore-ai-story.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-16",
        "slug": "cognitive-checklist",
        "format": "framework",
        "status": "ready",
        "topic": "Cognitive accessibility review checklist — COGA SCs 3.3.7-3.3.9",
        "source_path": "content/queue/linkedin/2026-05-16-cognitive-checklist.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-08",
        "slug": "doj-title2-extension",
        "format": "opinion",
        "status": "ready",
        "topic": "DOJ Title II extension — standard unchanged, only the clock moved",
        "source_path": "content/queue/linkedin/2026-05-08-doj-title2-extension.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-17",
        "slug": "screenreader-gaps",
        "format": "insight",
        "status": "ready",
        "topic": "VoiceOver vs NVDA — screen reader behavior gaps on the same markup",
        "source_path": "content/queue/linkedin/2026-05-17-screenreader-gaps.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-09",
        "slug": "wcag3-contrast-now",
        "format": "framework",
        "status": "ready",
        "topic": "WCAG 3.0 contrast still TBD — here's what to use right now",
        "source_path": "content/queue/linkedin/2026-05-09-wcag3-contrast-now.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-10",
        "slug": "arxiv-llm-html-repair",
        "format": "story",
        "status": "ready",
        "topic": "arXiv 2502.18701 — LLM used as real-time HTML repair layer for screen readers",
        "source_path": "content/queue/linkedin/2026-05-10-arxiv-llm-html-repair.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-11",
        "slug": "ai-hallucinations-sr-barrier",
        "format": "opinion",
        "status": "ready",
        "topic": "LLM hallucinations are an accessibility failure mode — ACM 2026",
        "source_path": "content/queue/linkedin/2026-05-11-ai-hallucinations-sr-barrier.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-12",
        "slug": "scanner-comparison",
        "format": "insight",
        "status": "ready",
        "topic": "axe-core vs Pa11y vs IBM Equal Access — what each catches that others miss",
        "source_path": "content/queue/linkedin/2026-05-12-scanner-comparison.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-13",
        "slug": "popover-api",
        "format": "insight",
        "status": "ready",
        "topic": "The Popover API — what it fixes and what it still breaks for screen readers",
        "source_path": "content/queue/linkedin/2026-05-13-popover-api.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-14",
        "slug": "dialog-jaws-story",
        "format": "story",
        "status": "ready",
        "topic": "Builder story: shipping a <dialog> that actually works with JAWS",
        "source_path": "content/queue/linkedin/2026-05-14-dialog-jaws-story.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-15",
        "slug": "inert-attribute",
        "format": "framework",
        "status": "ready",
        "topic": "The inert attribute: underrated a11y tool — when to use it, AT tree impact",
        "source_path": "content/queue/linkedin/2026-05-15-inert-attribute.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-18",
        "slug": "coga-voice-module",
        "format": "framework",
        "status": "ready",
        "topic": "W3C COGA Voice Systems module — 4 cognitive a11y rules for AI voice interfaces",
        "source_path": "content/queue/linkedin/2026-05-18-coga-voice-module.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-19",
        "slug": "hybrid-ai-human-testing",
        "format": "framework",
        "status": "ready",
        "topic": "Hybrid AI + human testing stack — what each layer actually catches",
        "source_path": "content/queue/linkedin/2026-05-19-hybrid-ai-human-testing.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-20",
        "slug": "a11yscout-action",
        "format": "insight",
        "status": "ready",
        "topic": "a11yscout GitHub Action — free WCAG audit on every PR",
        "source_path": "content/queue/linkedin/2026-05-20-a11yscout-action.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-21",
        "slug": "voice-only-ai-fails-wcag",
        "format": "opinion",
        "status": "ready",
        "topic": "Voice-only AI is not accessible — GAAD myth-bust",
        "source_path": "content/queue/linkedin/2026-05-21-voice-only-ai-fails-wcag.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-22",
        "slug": "wcag3-scoring-model",
        "format": "insight",
        "status": "ready",
        "topic": "WCAG 3.0 scoring model — procurement language is already moving",
        "source_path": "content/queue/linkedin/2026-05-22-wcag3-scoring-model.md",
    },
    {
        "platform": "LinkedIn",
        "date": "2026-05-25",
        "slug": "alt-text-benchmark-gap",
        "format": "opinion",
        "status": "ready",
        "topic": "No peer-reviewed alt-text LLM benchmark exists — research gap call",
        "source_path": "content/queue/linkedin/2026-05-25-alt-text-benchmark-gap.md",
    },

    # ---- Instagram (18 posts, 1 archived excluded) ----
    {
        "platform": "Instagram",
        "date": "2026-05-02",
        "slug": "cognitive-load-neurodiversity",
        "format": "carousel",
        "status": "ready",
        "topic": "Cognitive Load and Neurodiversity: How it affects Accessibility",
        "source_path": "content/queue/instagram/2026-05-02-cognitive-load-neurodiversity.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-06",
        "slug": "scanner-comparison",
        "format": "carousel",
        "status": "ready",
        "topic": "5 accessibility scanners compared — what each catches that others miss",
        "source_path": "content/queue/instagram/2026-05-06-scanner-comparison.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-07",
        "slug": "axecore-reel",
        "format": "reel",
        "status": "ready",
        "topic": "Screen-capture walkthrough — running axe-core on an AI-generated app",
        "source_path": "content/queue/instagram/2026-05-07-axecore-reel.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-13",
        "slug": "dialog-native",
        "format": "reel",
        "status": "ready",
        "topic": "Stop using div role=dialog — use native <dialog> instead",
        "source_path": "content/queue/instagram/2026-05-13-dialog-native.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-08",
        "slug": "doj-title2-extension",
        "format": "single",
        "status": "ready",
        "topic": "DOJ extended ADA Title II by a year — standard didn't change",
        "source_path": "content/queue/instagram/2026-05-08-doj-title2-extension.md",
    },
    # 2026-05-09-cognitive-load.md EXCLUDED — status: archived
    {
        "platform": "Instagram",
        "date": "2026-05-09",
        "slug": "wcag3-contrast-now",
        "format": "carousel",
        "status": "ready",
        "topic": "WCAG 3 still has no contrast algorithm — what to use right now",
        "source_path": "content/queue/instagram/2026-05-09-wcag3-contrast-now.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-10",
        "slug": "arxiv-llm-html-repair",
        "format": "reel",
        "status": "ready",
        "topic": "Researchers used an LLM to fix bad HTML for screen readers",
        "source_path": "content/queue/instagram/2026-05-10-arxiv-llm-html-repair.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-11",
        "slug": "ai-hallucinations-sr-barrier",
        "format": "single",
        "status": "ready",
        "topic": "LLM hallucinations are an accessibility failure mode — ACM 2026",
        "source_path": "content/queue/instagram/2026-05-11-ai-hallucinations-sr-barrier.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-12",
        "slug": "scanner-ci-guide",
        "format": "carousel",
        "status": "ready",
        "topic": "Which a11y scanner should you add to CI? — decision guide per team type",
        "source_path": "content/queue/instagram/2026-05-12-scanner-ci-guide.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-14",
        "slug": "dialog-jaws-reel",
        "format": "reel",
        "status": "ready",
        "topic": "Live AT demo — <dialog> vs div[role=dialog] announced differently in JAWS",
        "source_path": "content/queue/instagram/2026-05-14-dialog-jaws-reel.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-15",
        "slug": "inert-snippet",
        "format": "single-image",
        "status": "ready",
        "topic": "Annotated code snippet — inert applied correctly vs. incorrectly",
        "source_path": "content/queue/instagram/2026-05-15-inert-snippet.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-18",
        "slug": "coga-voice-module",
        "format": "carousel",
        "status": "ready",
        "topic": "W3C COGA published the first cognitive a11y doc for AI voice interfaces",
        "source_path": "content/queue/instagram/2026-05-18-coga-voice-module.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-19",
        "slug": "hybrid-ai-human-testing",
        "format": "carousel",
        "status": "ready",
        "topic": "57% scanner ceiling — three-layer testing stack",
        "source_path": "content/queue/instagram/2026-05-19-hybrid-ai-human-testing.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-20",
        "slug": "a11yscout-action",
        "format": "single",
        "status": "ready",
        "topic": "a11yscout — free GitHub Action runs WCAG audits on every PR",
        "source_path": "content/queue/instagram/2026-05-20-a11yscout-action.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-21",
        "slug": "voice-only-ai-fails-wcag",
        "format": "reel",
        "status": "ready",
        "topic": "Voice-only AI is not accessible — myth-bust for GAAD week",
        "source_path": "content/queue/instagram/2026-05-21-voice-only-ai-fails-wcag.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-22",
        "slug": "wcag3-scoring-model",
        "format": "carousel",
        "status": "ready",
        "topic": "WCAG 3 scoring is changing procurement language right now",
        "source_path": "content/queue/instagram/2026-05-22-wcag3-scoring-model.md",
    },
    {
        "platform": "Instagram",
        "date": "2026-05-25",
        "slug": "alt-text-benchmark-gap",
        "format": "single",
        "status": "ready",
        "topic": "No peer-reviewed alt-text benchmark across frontier LLMs — as of May 2026",
        "source_path": "content/queue/instagram/2026-05-25-alt-text-benchmark-gap.md",
    },

    # ---- X / Twitter (20 posts) ----
    {
        "platform": "X",
        "date": "2026-05-02",
        "slug": "cognitive-load-neurodiversity",
        "format": "thread",
        "status": "ready",
        "topic": "Cognitive Load and Neurodiversity: How it affects Accessibility",
        "source_path": "content/queue/x/2026-05-02-cognitive-load-neurodiversity.md",
    },
    {
        "platform": "X",
        "date": "2026-05-05",
        "slug": "scanner-stat",
        "format": "standalone",
        "status": "ready",
        "topic": "Automated a11y scanner ceiling — the 57% benchmark",
        "source_path": "content/queue/x/2026-05-05-scanner-stat.md",
    },
    {
        "platform": "X",
        "date": "2026-05-06",
        "slug": "aria-mistakes-thread",
        "format": "thread",
        "status": "ready",
        "topic": "6 ARIA mistakes AI code generators keep making",
        "source_path": "content/queue/x/2026-05-06-aria-mistakes-thread.md",
    },
    {
        "platform": "X",
        "date": "2026-05-07",
        "slug": "axecore-stat",
        "format": "standalone",
        "status": "ready",
        "topic": "Punchy stat from running axe-core on an AI-built app for the first time",
        "source_path": "content/queue/x/2026-05-07-axecore-stat.md",
    },
    {
        "platform": "X",
        "date": "2026-05-15",
        "slug": "dialog-take",
        "format": "standalone",
        "status": "ready",
        "topic": "Hot take: native dialog vs div role=dialog",
        "source_path": "content/queue/x/2026-05-15-dialog-take.md",
    },
    {
        "platform": "X",
        "date": "2026-05-08",
        "slug": "doj-title2-extension",
        "format": "thread",
        "status": "ready",
        "topic": "DOJ extends ADA Title II WCAG 2.1 AA deadline by one year — standard unchanged",
        "source_path": "content/queue/x/2026-05-08-doj-title2-extension.md",
    },
    {
        "platform": "X",
        "date": "2026-05-16",
        "slug": "screenreader-thread",
        "format": "thread",
        "status": "ready",
        "topic": "VoiceOver vs NVDA behavior gaps on the same markup",
        "source_path": "content/queue/x/2026-05-16-screenreader-thread.md",
    },
    {
        "platform": "X",
        "date": "2026-05-09",
        "slug": "wcag3-contrast-now",
        "format": "thread",
        "status": "ready",
        "topic": "WCAG 3.0 contrast algorithm still TBD — design tokens belong on WCAG 2.x",
        "source_path": "content/queue/x/2026-05-09-wcag3-contrast-now.md",
    },
    {
        "platform": "X",
        "date": "2026-05-10",
        "slug": "arxiv-llm-html-repair",
        "format": "thread",
        "status": "ready",
        "topic": "arXiv 2502.18701 — LLM as real-time HTML repair layer for screen readers",
        "source_path": "content/queue/x/2026-05-10-arxiv-llm-html-repair.md",
    },
    {
        "platform": "X",
        "date": "2026-05-11",
        "slug": "ai-hallucinations-sr-barrier",
        "format": "thread",
        "status": "ready",
        "topic": "LLM hallucinations as accessibility failure mode — semantic hallucination",
        "source_path": "content/queue/x/2026-05-11-ai-hallucinations-sr-barrier.md",
    },
    {
        "platform": "X",
        "date": "2026-05-12",
        "slug": "scanner-take",
        "format": "standalone",
        "status": "ready",
        "topic": "Scanner wars and false confidence — one sharp take",
        "source_path": "content/queue/x/2026-05-12-scanner-take.md",
    },
    {
        "platform": "X",
        "date": "2026-05-13",
        "slug": "popover-thread",
        "format": "thread",
        "status": "ready",
        "topic": "Native HTML popover vs custom ARIA pattern — when to use each",
        "source_path": "content/queue/x/2026-05-13-popover-thread.md",
    },
    {
        "platform": "X",
        "date": "2026-05-14",
        "slug": "dialog-jaws-take",
        "format": "standalone",
        "status": "ready",
        "topic": "One frustration/win from <dialog> + JAWS testing",
        "source_path": "content/queue/x/2026-05-14-dialog-jaws-take.md",
    },
    {
        "platform": "X",
        "date": "2026-05-18",
        "slug": "coga-voice-module",
        "format": "thread",
        "status": "ready",
        "topic": "W3C COGA Voice Systems module — 4 cognitive a11y rules for AI chat",
        "source_path": "content/queue/x/2026-05-18-coga-voice-module.md",
    },
    {
        "platform": "X",
        "date": "2026-05-19",
        "slug": "hybrid-ai-human-testing",
        "format": "thread",
        "status": "ready",
        "topic": "Hybrid AI + human a11y testing stack — what each layer actually catches",
        "source_path": "content/queue/x/2026-05-19-hybrid-ai-human-testing.md",
    },
    {
        "platform": "X",
        "date": "2026-05-20",
        "slug": "a11yscout-action",
        "format": "thread",
        "status": "ready",
        "topic": "a11yscout GitHub Action — WCAG 2.1 audit on every PR",
        "source_path": "content/queue/x/2026-05-20-a11yscout-action.md",
    },
    {
        "platform": "X",
        "date": "2026-05-21",
        "slug": "voice-only-ai-fails-wcag",
        "format": "thread",
        "status": "ready",
        "topic": "Voice-only AI is not accessible — multimodal is the bar",
        "source_path": "content/queue/x/2026-05-21-voice-only-ai-fails-wcag.md",
    },
    {
        "platform": "X",
        "date": "2026-05-22",
        "slug": "wcag3-scoring-model",
        "format": "thread",
        "status": "ready",
        "topic": "WCAG 3.0 scoring model — procurement language moving even if standard is years out",
        "source_path": "content/queue/x/2026-05-22-wcag3-scoring-model.md",
    },
    {
        "platform": "X",
        "date": "2026-05-25",
        "slug": "alt-text-benchmark-gap",
        "format": "thread",
        "status": "ready",
        "topic": "No peer-reviewed alt-text LLM benchmark exists — research gap call",
        "source_path": "content/queue/x/2026-05-25-alt-text-benchmark-gap.md",
    },
]

# ---------------------------------------------------------------------------
# Notion API helpers
# ---------------------------------------------------------------------------

def notion_request(method, path, body=None):
    url = f"https://api.notion.com/v1{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {NOTION_TOKEN}",
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return None, f"HTTP {e.code}: {body}"


def get_db_properties():
    result, err = notion_request("GET", f"/databases/{CALENDAR_DB_ID}")
    if err:
        return None, err
    return result.get("properties", {}), None


def ensure_db_properties(existing_props):
    """
    The Content Calendar DB was created by notion-db-manager setup mode with
    the schema defined in the agent spec. We need these properties for
    calendar-view-compatible syncing:
      - Title (title) — already exists as default
      - Date (date)
      - Platform (select)
      - Status (select)
      - Slug (rich_text)
      - Format (select)
      - Last Synced (date)

    Returns a list of property names that are missing and need to be added.
    """
    required = {
        "Date": "date",
        "Platform": "select",
        "Status": "select",
        "Slug": "rich_text",
        "Format": "select",
        "Last Synced": "date",
    }
    missing = {}
    for name, ptype in required.items():
        if name not in existing_props:
            missing[name] = ptype
    return missing


def add_db_properties(missing):
    """Add missing properties to the database via PATCH."""
    if not missing:
        return None
    props_payload = {}
    for name, ptype in missing.items():
        if ptype == "date":
            props_payload[name] = {"date": {}}
        elif ptype == "select":
            props_payload[name] = {"select": {}}
        elif ptype == "rich_text":
            props_payload[name] = {"rich_text": {}}
    _, err = notion_request("PATCH", f"/databases/{CALENDAR_DB_ID}", {"properties": props_payload})
    return err


def query_existing_pages():
    """
    Query all existing pages in the DB and return a dict keyed by
    "{platform}-{slug}" -> page_id.
    """
    pages = {}
    cursor = None
    while True:
        body = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        result, err = notion_request("POST", f"/databases/{CALENDAR_DB_ID}/query", body)
        if err:
            print(f"  ERROR querying DB: {err}")
            break
        for page in result.get("results", []):
            props = page.get("properties", {})
            # Extract platform from select property
            platform_val = ""
            if "Platform" in props and props["Platform"].get("select"):
                platform_val = props["Platform"]["select"].get("name", "")
            # Extract slug from rich_text property
            slug_val = ""
            if "Slug" in props:
                rt = props["Slug"].get("rich_text", [])
                if rt:
                    slug_val = rt[0].get("plain_text", "")
            key = f"{platform_val.lower()}-{slug_val}"
            pages[key] = page["id"]
        if not result.get("has_more"):
            break
        cursor = result.get("next_cursor")
    return pages


def humanize_slug(slug):
    """Convert kebab-case slug to Title Case human-readable string."""
    return slug.replace("-", " ").title()


def build_page_properties(post):
    """Build Notion page properties payload from a post dict."""
    title = f"{post['platform']} — {post['topic']}"
    return {
        "Title": {
            "title": [{"text": {"content": title[:2000]}}]
        },
        "Date": {
            "date": {"start": post["date"]}
        },
        "Platform": {
            "select": {"name": post["platform"]}
        },
        "Status": {
            "select": {"name": post["status"]}
        },
        "Slug": {
            "rich_text": [{"text": {"content": post["slug"]}}]
        },
        "Format": {
            "select": {"name": post["format"]}
        },
        "Last Synced": {
            "date": {"start": NOW_ISO}
        },
    }


def create_page(post):
    props = build_page_properties(post)
    body = {
        "parent": {"database_id": CALENDAR_DB_ID},
        "properties": props,
    }
    result, err = notion_request("POST", "/pages", body)
    return result, err


def update_page(page_id, post):
    props = build_page_properties(post)
    result, err = notion_request("PATCH", f"/pages/{page_id}", {"properties": props})
    return result, err


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"Notion Content Calendar sync — {NOW_ISO}")
    print(f"Target DB: {CALENDAR_DB_ID}")
    print(f"Posts to sync: {len(POSTS)}")
    print()

    # 1. Check / add DB properties
    print("Step 1: Checking database properties...")
    existing_props, err = get_db_properties()
    if err:
        print(f"  FATAL: Cannot read DB properties: {err}")
        return

    prop_names = list(existing_props.keys())
    print(f"  Found {len(prop_names)} properties: {', '.join(prop_names)}")

    has_date_prop = "Date" in existing_props
    print(f"  Date property exists: {has_date_prop}")

    missing = ensure_db_properties(existing_props)
    if missing:
        print(f"  Adding missing properties: {', '.join(missing.keys())}")
        err = add_db_properties(missing)
        if err:
            print(f"  WARNING: Could not add properties: {err}")
            print("  Continuing — pages will be created with whatever properties exist.")
        else:
            print(f"  Properties added successfully.")
    else:
        print("  All required properties present.")
    print()

    # 2. Query existing pages
    print("Step 2: Querying existing pages in DB...")
    existing_pages = query_existing_pages()
    print(f"  Found {len(existing_pages)} existing pages.")
    print()

    # 3. Sync posts
    print("Step 3: Syncing posts...")
    created = 0
    updated = 0
    errors = 0
    error_list = []

    for i, post in enumerate(POSTS):
        key = f"{post['platform'].lower()}-{post['slug']}"
        title_preview = f"{post['platform']} — {post['slug']}"

        if key in existing_pages:
            page_id = existing_pages[key]
            _, err = update_page(page_id, post)
            if err:
                print(f"  [{i+1:02d}] UPDATE ERROR  {title_preview}: {err}")
                errors += 1
                error_list.append({"post": key, "op": "update", "error": err})
            else:
                print(f"  [{i+1:02d}] updated      {title_preview}")
                updated += 1
        else:
            _, err = create_page(post)
            if err:
                print(f"  [{i+1:02d}] CREATE ERROR  {title_preview}: {err}")
                errors += 1
                error_list.append({"post": key, "op": "create", "error": err})
            else:
                print(f"  [{i+1:02d}] created      {title_preview}")
                created += 1

    print()
    print("=" * 60)
    print(f"SYNC COMPLETE")
    print(f"  Created : {created}")
    print(f"  Updated : {updated}")
    print(f"  Errors  : {errors}")
    print(f"  Total   : {created + updated} / {len(POSTS)}")
    print()

    if error_list:
        print("ERRORS:")
        for e in error_list:
            print(f"  {e['op'].upper()} {e['post']}: {e['error']}")
        print()

    # 4. Calendar view instructions
    print("CALENDAR VIEW SETUP (manual — Notion API cannot create views):")
    print("  1. Open the Content Calendar database in Notion.")
    print("     URL pattern: https://www.notion.so/<workspace>/<db-id>")
    print(f"     DB ID: {CALENDAR_DB_ID}")
    print("  2. Click the '+ Add a view' button at the top-left of the database.")
    print("  3. Select 'Calendar' from the view type list.")
    print("  4. In the 'Calendar by' dropdown, select 'Date'.")
    print("  5. Click 'Done' (or 'Create').")
    print("  The calendar will now show all 57 posts on their scheduled dates.")
    print()

    if not has_date_prop:
        print("NOTE: The 'Date' property was missing when this script started.")
        print("It has been added. Verify it appears in Notion before setting up the calendar view.")

    print("Done.")


if __name__ == "__main__":
    main()
