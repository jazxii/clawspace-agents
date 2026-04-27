#!/usr/bin/env bash
# Clawspace bootstrap — one command to set up the workforce on a new Mac.
# Usage: ./bootstrap.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
warn() { printf "\033[33m%s\033[0m\n" "$*"; }
ok()   { printf "\033[32m%s\033[0m\n" "$*"; }
err()  { printf "\033[31m%s\033[0m\n" "$*" >&2; }

bold "==> Clawspace bootstrap (root: $ROOT)"

# 1. Verify Claude Code
if ! command -v claude >/dev/null 2>&1; then
  err "claude CLI not found. Install Claude Code from https://claude.com/claude-code, then re-run."
  exit 1
fi
ok "claude CLI found: $(claude --version 2>&1 | head -1)"

# 2. Verify Node 18+
if ! command -v node >/dev/null 2>&1; then
  err "node not found. Install Node 18+ (e.g. via 'brew install node'), then re-run."
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  err "node $NODE_MAJOR is too old. Need 18+."
  exit 1
fi
ok "node $(node -v)"

# 3. Install bus-mcp deps
bold "==> Installing bus-mcp dependencies"
( cd .claude/mcp/bus-mcp && npm install --silent --no-audit --no-fund )
ok "bus-mcp ready"

# 4. settings.local.json scaffold
if [ ! -f .claude/settings.local.json ]; then
  cp .claude/settings.local.json.template .claude/settings.local.json
  warn "Created .claude/settings.local.json from template. EDIT IT to add your secrets:"
  warn "  - Notion integration token"
  warn "  - Notion database IDs (CLAWSPACE_NOTION_DB_CONTENT, CLAWSPACE_NOTION_DB_RESEARCH)"
  warn "  - notebooklm-mcp-server auth (or set CLAWSPACE_NOTEBOOKLM_MODE=manual to skip)"
else
  ok ".claude/settings.local.json already exists (not overwriting)"
fi

# 5. Bus channels — touch baseline files so subscribe works on day 1
bold "==> Initializing bus channels"
mkdir -p bus/offsets
for ch in all-hands content projects research meta; do
  touch "bus/${ch}.jsonl"
done
ok "bus channels: all-hands, content, projects, research, meta"

# 6. Optional: enable accessibility-agents plugin (used for code review delegation)
if claude plugin list 2>/dev/null | grep -q "accessibility-agents"; then
  ok "accessibility-agents plugin already enabled"
else
  warn "accessibility-agents plugin not enabled. Enable it manually with:"
  warn "  claude plugin enable accessibility-agents@community-access"
  warn "(Used by dev workers for code review delegation. Optional but recommended.)"
fi

# 7. Print next-steps checklist
bold "==> Next steps"
cat <<'EOF'
1. Edit .claude/settings.local.json with your Notion + NotebookLM secrets.
2. Run:    claude
   Then:   /standup    (when implemented in Phase 2+)
3. Register scheduled tasks (Phase 5):
            claude scheduled-tasks register
4. To test the bus end-to-end:
            claude  →  ask: "post a test message to the all-hands channel"
EOF
ok "Bootstrap complete."
