#!/usr/bin/env python3
"""
notion-queue-sync.py
--------------------
Syncs content/queue/**/*.md to the Notion Content Queue database.
Skips archived posts. Creates new pages; updates if title already exists.

TITLE CONVENTION (do not change):
  All pages use "{Platform} — {slug}" as title, e.g.:
    "LinkedIn — 2026-05-08-doj-title2-extension"
    "Instagram — 2026-05-07-axecore-reel"
    "X — 2026-05-09-wcag3-contrast-now"
  The platform prefix is the deduplication key. Without it, all 3 platform
  versions of the same topic collapse into a single Notion page.

HASHTAG CONVENTION:
  - LinkedIn / Instagram: multi_select with tag names (leading # stripped).
  - X: always send {"multi_select": []} to clear any stale values — the X PRD
    forbids hashtags and old syncs may have left stale tags in Notion.
  The Hashtags key is ALWAYS included in the payload (never skipped on update).

SSL NOTE:
  Uses ssl._create_unverified_context to bypass macOS Python 3.14 cert issues.
  Acceptable for a local tool hitting a known API endpoint over HTTPS.
"""
import json, os, re, ssl, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

ssl._create_default_https_context = ssl._create_unverified_context

TOKEN  = "ntn_L40028825042i1uVnvN2ls383t3J9wLDoMui0RJEHMkbhw"
DB_ID  = "3530ee97-23c8-81cc-9845-e6ec21fb4194"
BASE   = Path(__file__).parent.parent
QUEUE  = BASE / "content" / "queue"
NOW    = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

PLATFORMS = {"linkedin": "LinkedIn", "instagram": "Instagram", "x": "X"}

# ── helpers ──────────────────────────────────────────────────────────────────

def notion_request(method, path, body=None):
    url  = f"https://api.notion.com/v1{path}"
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization":  f"Bearer {TOKEN}",
        "Notion-Version": "2022-06-28",
        "Content-Type":   "application/json",
    })
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}: {e.read().decode()[:200]}"

def parse_file(path):
    """Return (frontmatter_dict, body_str)."""
    text = path.read_text(encoding="utf-8")
    fm, body = {}, text
    m = re.match(r"^---\n(.*?)\n---\n?(.*)", text, re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            kv = re.match(r'^(\w[\w_-]*):\s*(.*)', line)
            if kv:
                fm[kv.group(1)] = kv.group(2).strip().strip('"')
        body = m.group(2).strip()
    return fm, body

def first_line(body):
    for line in body.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line[:200]
    return ""

def rich(text):
    return [{"type": "text", "text": {"content": str(text)[:2000]}}]

def build_page(slug, platform, fm, body, source_path):
    date_val = fm.get("date", "")
    scheduled = {"start": str(date_val)} if date_val else None

    # Parse hashtags — stored as JSON array string or plain string
    raw_tags = fm.get("hashtags", "")
    tag_list = []
    if raw_tags:
        if raw_tags.startswith("["):
            try:
                tag_list = json.loads(raw_tags)
            except Exception:
                tag_list = [t.strip().strip('"') for t in raw_tags.strip("[]").split(",") if t.strip()]
        else:
            tag_list = [t.strip() for t in raw_tags.split() if t.strip()]
    tag_list = [t.lstrip("#") for t in tag_list if t]  # strip leading # for multi_select

    img = fm.get("image_prompt", fm.get("image_prompts", ""))
    humanized = str(fm.get("humanized", "false")).lower() == "true"
    hook = first_line(body)

    props = {
        "Title":       {"title": rich(f"{platform} — {slug}")},
        "Channel":     {"select": {"name": platform}},
        "Status":      {"select": {"name": fm.get("status", "ready")}},
        "Humanized":   {"checkbox": humanized},
        "Last Synced": {"date": {"start": NOW}},
    }
    if scheduled:
        props["Scheduled Date"] = {"date": scheduled}
    # Always send Hashtags (even empty) so stale Notion values are cleared on update
    props["Hashtags"] = {"multi_select": [{"name": t[:100]} for t in tag_list[:10]]}
    if img:
        props["Image Prompt"] = {"rich_text": rich(str(img)[:2000])}
    if hook:
        props["Hook"] = {"rich_text": rich(hook)}
    if body:
        props["Body"] = {"rich_text": rich(body[:2000])}

    return {"parent": {"database_id": DB_ID}, "properties": props}

# ── collect files ────────────────────────────────────────────────────────────

posts = []
for folder, label in PLATFORMS.items():
    for f in sorted((QUEUE / folder).glob("*.md")):
        fm, body = parse_file(f)
        if fm.get("status") == "archived":
            continue
        slug = f.stem
        rel  = str(f.relative_to(BASE))
        posts.append((slug, label, fm, body, rel))

print(f"Notion Content Queue sync — {NOW}")
print(f"Target DB : {DB_ID}")
print(f"Posts to sync: {len(posts)}")

# ── check existing pages ──────────────────────────────────────────────────────

print("\nStep 1: Querying existing pages...")
existing = {}  # "{Platform} — {slug}" → page_id
cursor = None
while True:
    body_q = {"page_size": 100}
    if cursor:
        body_q["start_cursor"] = cursor
    result, err = notion_request("POST", f"/databases/{DB_ID}/query", body_q)
    if err:
        print(f"  Warning: could not query existing pages: {err}")
        break
    for page in result.get("results", []):
        title_prop = page.get("properties", {}).get("Title", {})
        titles = title_prop.get("title", [])
        if titles:
            t = titles[0].get("text", {}).get("content", "")
            if t:
                existing[t] = page["id"]
    if not result.get("has_more"):
        break
    cursor = result.get("next_cursor")

print(f"  Found {len(existing)} existing pages.")

# ── sync ─────────────────────────────────────────────────────────────────────

print("\nStep 2: Syncing posts...")
created = updated = errors = 0

for i, (slug, platform, fm, body, rel) in enumerate(posts, 1):
    page = build_page(slug, platform, fm, body, rel)
    title_key = f"{platform} — {slug}"
    if title_key in existing:
        page_id = existing[title_key]
        result, err = notion_request("PATCH", f"/pages/{page_id}", {
            "properties": page["properties"]
        })
        status = "updated"
        updated += 1
    else:
        result, err = notion_request("POST", "/pages", page)
        status = "created"
        created += 1

    if err:
        print(f"  [{i:02d}] ERROR        {platform} — {slug}: {err}")
        errors += 1
        if status == "created":
            created -= 1
        else:
            updated -= 1
    else:
        print(f"  [{i:02d}] {status:<12} {platform} — {slug}")

print(f"\n{'='*60}")
print(f"SYNC COMPLETE")
print(f"  Created : {created}")
print(f"  Updated : {updated}")
print(f"  Errors  : {errors}")
print(f"  Total   : {created+updated} / {len(posts)}")
