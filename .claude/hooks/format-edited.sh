#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit): keep the tree lint-clean so `bun run lint`
# never fails on formatting alone during a crunch. Silent, and never blocks.
#
# Any internal failure exits 0 without a verdict.
set -uo pipefail

command -v jq >/dev/null 2>&1 || exit 0
command -v bunx >/dev/null 2>&1 || exit 0

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
[[ -z "$file" || ! -f "$file" ]] && exit 0

case "$file" in
  *.ts|*.js|*.mjs|*.cjs)
    bunx --bun biome check --write --no-errors-on-unmatched "$file" >/dev/null 2>&1
    ;;
esac
exit 0
