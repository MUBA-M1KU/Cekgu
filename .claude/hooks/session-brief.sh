#!/usr/bin/env bash
# SessionStart: one line of orientation. Exits 0 on any internal failure.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[[ -d "${root:-}" ]] || exit 0
cd "$root" || exit 0

# 2026-09-05 23:59 MYT. Hardcoded: `date -d` is GNU-only and fails on macOS.
left=$(( (1788623940 - $(date +%s)) / 86400 ))
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

echo "MUBA/GonkaRouter | branch=$branch | uncommitted=$dirty | ${left}d to submission"
echo "TODOs live in GitHub Issues (gh issue list). Rules and judging: docs/brief.md."
