#!/usr/bin/env bash
#
# Runs the eval test suite (or a filtered subset) with the project's
# .mcp.json temporarily moved out of the way.
#
# Why: the Claude Agent SDK's query() call inside
# @umbraco-cms/mcp-server-sdk's eval harness runs with cwd set to this
# project, so it auto-loads .mcp.json in addition to the one MCP server
# the harness explicitly configures. That ambient copy duplicates every
# tool under a second prefix (and, depending on timing, may also spin up
# this server's own chained CMS tools), which makes eval tool resolution
# nondeterministic. Moving .mcp.json aside for the duration of the run
# removes that ambient config; it's restored afterward no matter how the
# run ends (success, failure, or interrupt).
#
# Safe for concurrent invocations: acquires an exclusive lock (via mkdir,
# which is atomic) before touching .mcp.json, and waits for it if another
# run currently holds it, rather than silently skipping isolation.
#
# Usage:
#   scripts/run-evals-isolated.sh                          # full eval suite
#   scripts/run-evals-isolated.sh --testPathPatterns="theme-read"
#
# Anything after the script name is passed through to `npm run test:evals`,
# which already inserts its own `--` separator — do NOT add a leading `--`
# yourself, or the flag gets forwarded twice and Jest treats
# `--testPathPatterns=...` as a literal (unmatched) positional pattern
# instead of a flag, silently reporting "No tests found."

set -euo pipefail

cd "$(dirname "$0")/.."

MCP_CONFIG=".mcp.json"
MCP_CONFIG_BACKUP=".mcp.json.eval-run-backup"
LOCK_DIR=".mcp.json.eval-run-lock"
LOCK_WAIT_SECS=600

acquire_lock() {
  local waited=0
  while ! mkdir "$LOCK_DIR" 2>/dev/null; do
    if [ "$waited" -eq 0 ]; then
      echo "Another eval run holds the .mcp.json lock — waiting for it to finish..."
    fi
    sleep 2
    waited=$((waited + 2))
    if [ "$waited" -ge "$LOCK_WAIT_SECS" ]; then
      echo "error: timed out after ${LOCK_WAIT_SECS}s waiting for $LOCK_DIR." >&2
      echo "If no other run is actually in progress, remove it by hand: rmdir $LOCK_DIR" >&2
      exit 1
    fi
  done
}

release_lock() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

restore_mcp_config() {
  if [ -f "$MCP_CONFIG_BACKUP" ]; then
    mv "$MCP_CONFIG_BACKUP" "$MCP_CONFIG"
    echo "Restored $MCP_CONFIG."
  fi
  release_lock
}

acquire_lock
trap restore_mcp_config EXIT INT TERM

if [ -f "$MCP_CONFIG_BACKUP" ]; then
  echo "error: $MCP_CONFIG_BACKUP already exists — a previous run may not have" >&2
  echo "restored cleanly. Resolve that by hand before running this script." >&2
  exit 1
fi

if [ -f "$MCP_CONFIG" ]; then
  mv "$MCP_CONFIG" "$MCP_CONFIG_BACKUP"
  echo "Moved $MCP_CONFIG aside for the duration of this run."
else
  echo "No $MCP_CONFIG present — nothing to move aside."
fi

npm run test:evals -- "$@"
