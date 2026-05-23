#!/usr/bin/env python3
"""
archive-calendar-reset.py
-------------------------
Companion to archive-content-reset.py. Archives the monthly calendar files
AND marks every row in the Notion Content Calendar DB as Status=archived.

Local:
  Moves content/calendar/*.md  →  content/archive/2026-05-14-reset/calendar/

Notion (Calendar DB 3530ee97-23c8-81f9-8149-db80c10accf5):
  For every page, PATCH with archived=false + Status=archived. Pages already in
  trash are pulled back so Status is visible.

Run from project root:
    python3 scripts/archive-calendar-reset.py
"""
import json, ssl, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

ssl._create_default_https_context = ssl._create_unverified_context

TOKEN          = "ntn_L40028825042i1uVnvN2ls383t3J9wLDoMui0RJEHMkbhw"
CALENDAR_DB_ID = "3530ee97-23c8-81f9-8149-db80c10accf5"
BASE           = Path(__file__).parent.parent
NOW            = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

SRC  = BASE / "content" / "calendar"
DEST = BASE / "content" / "archive" / "2026-05-14-reset" / "calendar"

def notion(method, path, body=None):
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

# ── move local files ─────────────────────────────────────────────────────────

DEST.mkdir(parents=True, exist_ok=True)
moved = 0
for f in sorted(SRC.glob("*.md")):
    target = DEST / f.name
    target.write_text(f.read_text(encoding="utf-8"), encoding="utf-8")
    f.unlink()
    print(f"  moved  {f.relative_to(BASE)}  →  {target.relative_to(BASE)}")
    moved += 1

print(f"\nLocal calendar files moved: {moved}\n")

# ── query Notion calendar DB ─────────────────────────────────────────────────

print(f"Querying Notion Calendar DB {CALENDAR_DB_ID} (including archived) ...")

# Notion query results include trashed pages only if explicitly filtered with
# in_trash: true (new API) — older API uses archived: true. Try both to be safe.
pages_by_id = {}

# 1) regular (non-trashed) pages
cursor = None
while True:
    body = {"page_size": 100}
    if cursor:
        body["start_cursor"] = cursor
    res, err = notion("POST", f"/databases/{CALENDAR_DB_ID}/query", body)
    if err:
        print(f"  query error: {err}")
        break
    for p in res.get("results", []):
        pages_by_id[p["id"]] = p
    if not res.get("has_more"):
        break
    cursor = res.get("next_cursor")

print(f"  Visible pages: {len(pages_by_id)}")

# 2) trashed pages — same query with filter on Notion's in_trash, falls back gracefully
cursor = None
trashed_count = 0
while True:
    body = {"page_size": 100, "archived": True}
    if cursor:
        body["start_cursor"] = cursor
    res, err = notion("POST", f"/databases/{CALENDAR_DB_ID}/query", body)
    if err:
        # API doesn't support this filter — that's fine, skip
        break
    for p in res.get("results", []):
        if p["id"] not in pages_by_id:
            pages_by_id[p["id"]] = p
            trashed_count += 1
    if not res.get("has_more"):
        break
    cursor = res.get("next_cursor")

if trashed_count:
    print(f"  Additional trashed pages: {trashed_count}")

print(f"  Total pages to patch: {len(pages_by_id)}\n")

# ── patch each page ──────────────────────────────────────────────────────────

ok = errs = 0
for i, (pid, page) in enumerate(pages_by_id.items(), 1):
    title_prop = page.get("properties", {}).get("Title", {}) or page.get("properties", {}).get("Name", {})
    title_arr  = title_prop.get("title", []) if title_prop else []
    title      = title_arr[0]["text"]["content"] if title_arr else pid[:8]
    _, err = notion("PATCH", f"/pages/{pid}", {
        "archived": False,
        "properties": {
            "Status":      {"select": {"name": "archived"}},
            "Last Synced": {"date":   {"start": NOW}},
        }
    })
    if err:
        # Retry without Last Synced in case that prop doesn't exist on calendar DB
        _, err2 = notion("PATCH", f"/pages/{pid}", {
            "archived": False,
            "properties": {"Status": {"select": {"name": "archived"}}}
        })
        if err2:
            errs += 1
            print(f"  [{i:03d}] ERR     {title[:60]}  ({err2[:120]})")
            continue
    ok += 1
    print(f"  [{i:03d}] patched {title[:60]}")

print()
print("=" * 60)
print(f"DONE  files moved: {moved}   notion patched: {ok}   errors: {errs}")
