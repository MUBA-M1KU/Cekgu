#!/usr/bin/env bash
# SessionStart: orient a fresh session, or a teammate, in two lines.
#
# Any internal failure exits 0 without output. A broken guard must never be able
# to wedge a session.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[[ -z "$root" || ! -d "$root" ]] && exit 0
cd "$root" || exit 0

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

# Days until the Devfolio submission deadline, 5 Sept 2026 23:59 MYT.
# Hardcoded as an epoch on purpose: `date -d` is GNU-only and fails on the BSD
# date that ships with macOS, which silently produced a negative count.
deadline=1788623940
left=$(( (deadline - $(date +%s)) / 86400 ))

echo "MUBA/GonkaRouter | branch=${branch:-?} | uncommitted=${dirty:-0} | ${left}d to submission"
echo "TODOs live in GitHub Issues (gh issue list). Rules and judging: docs/brief.md."
exit 0
