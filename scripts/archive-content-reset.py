#!/usr/bin/env python3
"""
archive-content-reset.py
------------------------
One-shot reset: archive all content/queue/**/*.md and research/newsletters/drafts/*.md.

For each file:
  1. Rewrites the frontmatter `status:` line to `status: archived` (in place).
  2. Moves the file to the reset archive folder, preserving subfolder structure.
  3. If the original path is tracked in content/notion-mirror.lock, PATCHes the
     Notion page Status select to "archived" and rewrites the lockfile entry to
     point at the new archive path.

Idempotent within a single run: works off the file listing taken at start.
Notion failures are logged but do not abort the move.

Run from project root:
    python3 scripts/archive-content-reset.py
"""
import json, re, ssl, shutil, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

ssl._create_default_https_context = ssl._create_unverified_context

TOKEN = "ntn_L40028825042i1uVnvN2ls383t3J9wLDoMui0RJEHMkbhw"
BASE  = Path(__file__).parent.parent
NOW   = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

QUEUE_SRC   = BASE / "content" / "queue"
QUEUE_DEST  = BASE / "content" / "archive" / "2026-05-14-reset"
NL_SRC      = BASE / "research" / "newsletters" / "drafts"
NL_DEST     = BASE / "research" / "newsletters" / "reset-2026-05-14"
LOCKFILE    = BASE / "content" / "notion-mirror.lock"

# ── helpers ──────────────────────────────────────────────────────────────────

def notion_patch_status(page_id, status="archived"):
    url = f"https://api.notion.com/v1/pages/{page_id}"
    body = json.dumps({
        "properties": {
            "Status":      {"select": {"name": status}},
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

def rewrite_status_archived(text):
    """Rewrite frontmatter status: line to 'archived'. Insert if missing."""
    m = re.match(r"^---\n(.*?)\n---\n?(.*)", text, re.DOTALL)
    if not m:
        # No frontmatter — prepend one
        return f"---\nstatus: archived\narchived_at: {NOW}\n---\n\n{text}"
    fm, body = m.group(1), m.group(2)
    if re.search(r"^status:\s*.*$", fm, re.MULTILINE):
        fm = re.sub(r"^status:\s*.*$", "status: archived", fm, count=1, flags=re.MULTILINE)
    else:
        fm += "\nstatus: archived"
    if not re.search(r"^archived_at:\s*", fm, re.MULTILINE):
        fm += f"\narchived_at: {NOW}"
    return f"---\n{fm}\n---\n{body}"

# ── load lockfile ────────────────────────────────────────────────────────────

if LOCKFILE.exists():
    lock = json.loads(LOCKFILE.read_text(encoding="utf-8"))
else:
    lock = {}

# ── collect files ────────────────────────────────────────────────────────────

jobs = []  # (src_path, dest_path, rel_src, rel_dest)

for platform in ("linkedin", "instagram", "x"):
    src_dir = QUEUE_SRC / platform
    if not src_dir.exists():
        continue
    for f in sorted(src_dir.glob("*.md")):
        dest = QUEUE_DEST / platform / f.name
        jobs.append((f, dest,
                     str(f.relative_to(BASE)),
                     str(dest.relative_to(BASE))))

for f in sorted(NL_SRC.glob("*.md")):
    dest = NL_DEST / f.name
    jobs.append((f, dest,
                 str(f.relative_to(BASE)),
                 str(dest.relative_to(BASE))))

print(f"Content reset — {NOW}")
print(f"Files to archive: {len(jobs)}")
print()

# ── execute ──────────────────────────────────────────────────────────────────

moved = patched = notion_errors = 0
lock_updates = 0

for i, (src, dest, rel_src, rel_dest) in enumerate(jobs, 1):
    # Rewrite frontmatter
    text = src.read_text(encoding="utf-8")
    new_text = rewrite_status_archived(text)

    # Ensure dest dir + write new content there
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(new_text, encoding="utf-8")
    src.unlink()
    moved += 1

    # Notion patch + lockfile rewrite
    entry = lock.get(rel_src)
    if entry:
        page_id = entry.get("page_id")
        if page_id:
            err = notion_patch_status(page_id, "archived")
            if err:
                notion_errors += 1
                print(f"  [{i:02d}] moved + Notion ERR  {rel_dest}  ({err})")
            else:
                patched += 1
                print(f"  [{i:02d}] moved + archived    {rel_dest}")
        # Rewrite lockfile entry under the new path
        entry["last_synced"] = NOW
        entry["status"] = "archived"
        lock[rel_dest] = entry
        del lock[rel_src]
        lock_updates += 1
    else:
        print(f"  [{i:02d}] moved (no-notion)    {rel_dest}")

# ── save lockfile ────────────────────────────────────────────────────────────

LOCKFILE.write_text(json.dumps(lock, indent=2) + "\n", encoding="utf-8")

print()
print("=" * 60)
print(f"ARCHIVE COMPLETE")
print(f"  Files moved        : {moved}")
print(f"  Notion patched     : {patched}")
print(f"  Notion errors      : {notion_errors}")
print(f"  Lockfile rewrites  : {lock_updates}")
