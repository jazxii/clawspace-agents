import json
import os
import re
import urllib.request
from datetime import datetime
from pathlib import Path

NOTION_TOKEN = "ntn_Z400288250487yCeDD6EiIqa02E9VfplizsPrqlrEUP6TR"
API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

with open('.notion-sync.json') as f:
    dbs = json.load(f)
CONTENT_DB = dbs['content_queue']

lock_path = 'content/notion-mirror.lock'
lock = json.load(open(lock_path)) if os.path.exists(lock_path) else {}

queue_files = []
for platform in ['linkedin', 'instagram', 'x']:
    for filepath in Path('.').glob(f'content/queue/{platform}/*.md'):
        queue_files.append(str(filepath))

print('=== Notion Sync Report (Push Mode) ===')
print(f'Started: {datetime.utcnow().isoformat()}Z')
print(f'Files found: {len(queue_files)}')
print()

created, skipped, errors = [], [], []

def parse_fm(fp):
    content = open(fp).read()
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not m:
        return {}, ''
    fm_text, body = m.groups()
    fm = {}
    for line in fm_text.split('\n'):
        if ':' in line and not line.startswith(' '):
            k, v = line.split(':', 1)
            fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm, body.strip()

for fp in sorted(queue_files):
    try:
        fm, body = parse_fm(fp)
        if fm.get('notion_page_id'):
            skipped.append(fp)
            continue
        
        platform = fm.get('platform', 'unknown').capitalize()
        status = fm.get('status', 'drafting').capitalize()
        created_date = fm.get('created', datetime.now().strftime('%Y-%m-%d'))
        humanized = fm.get('humanized', 'false') == 'true'
        hook = body[:200].replace('\n', ' ').strip()
        hashtags_raw = fm.get('hashtags', fm.get('hashtags_block', ''))
        hashtags = [h.strip().strip('#') for h in re.findall(r'#(\w+)', hashtags_raw)][:10]
        title = f'{Path(fp).stem} ({platform})'
        
        payload = {
            'parent': {'database_id': CONTENT_DB},
            'properties': {
                'Title': {'title': [{'text': {'content': title[:100]}}]},
                'Channel': {'select': {'name': platform}},
                'Status': {'select': {'name': status}},
                'Humanized': {'checkbox': humanized},
                'Hook': {'rich_text': [{'text': {'content': hook}}]},
                'Body': {'rich_text': [{'text': {'content': body[:2000]}}]},
                'Hashtags': {'multi_select': [{'name': t} for t in hashtags if t]},
                'Scheduled Date': {'date': {'start': created_date}},
                'Source Path': {'url': f'file://{os.path.abspath(fp)}'},
                'Last Synced': {'date': {'start': datetime.utcnow().isoformat() + 'Z'}}
            }
        }
        
        req = urllib.request.Request(
            f'{API_BASE}/pages',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {NOTION_TOKEN}',
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json'
            }
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                page_id = result['id']
                created.append(fp)
                print(f'✓ Created: {fp} → {page_id}')
                lock[fp] = {
                    'page_id': page_id,
                    'last_synced': datetime.utcnow().isoformat() + 'Z',
                    'db': 'CLAWSPACE_NOTION_DB_CONTENT',
                    'channel': platform
                }
        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode('utf-8')
            try:
                err_json = json.loads(err_body)
                err = err_json.get('message', 'Unknown')
            except:
                err = 'Unknown error'
            errors.append(f'{fp}: {err}')
            print(f'✗ Failed: {fp} - {err}')
    except Exception as e:
        errors.append(f'{fp}: {str(e)}')
        print(f'✗ Error: {fp} - {str(e)}')

with open(lock_path, 'w') as f:
    json.dump(lock, f, indent=2)

print()
print('=== Summary ===')
print(f'Created: {len(created)}')
print(f'Skipped (already synced): {len(skipped)}')
print(f'Errors: {len(errors)}')
print(f'Completed: {datetime.utcnow().isoformat()}Z')
