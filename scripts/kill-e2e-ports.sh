#!/usr/bin/env bash
# Kill stale processes on ports used by E2E tests
set -e

PORTS=(44374 17813 8789 6304 6307)
LABELS=("Umbraco HTTPS" "Umbraco HTTP" "Cloudflare Worker" "MCP Inspector client" "MCP Inspector proxy")

killed=0
for i in "${!PORTS[@]}"; do
  port=${PORTS[$i]}
  label=${LABELS[$i]}
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Killing $label (port $port): PIDs $pids"
    echo "$pids" | xargs kill -9
    ((killed++))
  fi
done

if [ "$killed" -eq 0 ]; then
  echo "No stale processes found"
else
  echo "Killed $killed process(es)"
fi
