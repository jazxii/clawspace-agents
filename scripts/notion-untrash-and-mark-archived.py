#!/usr/bin/env python3
"""
notion-untrash-and-mark-archived.py
-----------------------------------
Companion to archive-content-reset.py.

Iterates over lockfile entries that point into content/archive/2026-05-14-reset/
or research/newsletters/reset-2026-05-14/. For each Notion page, sends a single
PATCH with:
    archived = false        (pull out of Notion trash if currently trashed)
    Status   = "archived"   (set the select value)

Run after archive-content-reset.py if any Notion pages errored with
"Can't edit block that is archived".
"""
import json, ssl, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

ssl._create_default_https_context = ssl._create_unverified_context

TOKEN    = "ntn_L40028825042i1uVnvN2ls383t3J9wLDoMui0RJEHMkbhw"
BASE     = Path(__file__).parent.parent
LOCKFILE = BASE / "content" / "notion-mirror.lock"
NOW      = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

ARCHIVE_PREFIXES = (
    "content/archive/2026-05-14-reset/",
    "research/newsletters/reset-2026-05-14/",
)

def patch(page_id):
    url  = f"https://api.notion.com/v1/pages/{page_id}"
    body = json.dumps({
        "archived": False,
        "properties": {
            "Status":      {"select": {"name": "archived"}},
            "Last Synced": {"date":   {"start": NOW}},
        }
    }).encode()
    req = urllib.request.Request(url, data=body, method="PATCH", headers={
        "Authorization":  f"Bearer {TOKEN}",
        "Notion-Version": "2022-06-28",
        "Content-Type":   "application/json",
    })
    try:
        with urllib.request.urlopen(req) as r:
            r.read()
        return None
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read().decode()[:200]}"
    except Exception as e:
        return f"{type(e).__name__}: {e}"

lock = json.loads(LOCKFILE.read_text(encoding="utf-8"))

targets = [(k, v) for k, v in lock.items()
           if any(k.startswith(p) for p in ARCHIVE_PREFIXES) and v.get("page_id")]

print(f"Notion untrash + Status=archived — {NOW}")
print(f"Pages to patch: {len(targets)}")
print()

ok = errs = 0
for i, (rel, entry) in enumerate(targets, 1):
    err = patch(entry["page_id"])
    if err:
        errs += 1
        print(f"  [{i:02d}] ERR     {rel}  ({err})")
    else:
        ok += 1
        entry["status"]      = "archived"
        entry["last_synced"] = NOW
        print(f"  [{i:02d}] patched {rel}")

LOCKFILE.write_text(json.dumps(lock, indent=2) + "\n", encoding="utf-8")

print()
print("=" * 60)
print(f"DONE  patched: {ok}   errors: {errs}")
