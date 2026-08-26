#!/usr/bin/env bash
# PreToolUse(Bash): this repo merges through PRs. Block the commands that would
# quietly undo that, and block staging a real .env.
#
# Any internal failure exits 0 without a verdict. A broken guard must never be
# able to wedge a session.
set -uo pipefail

command -v jq >/dev/null 2>&1 || exit 0
cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[[ -z "$cmd" ]] && exit 0

# exit 2 plus stderr feeds the reason back to the agent
deny() { echo "BLOCKED: $1" >&2; exit 2; }

if grep -Eq 'git[[:space:]]+push([[:space:]]|$)' <<<"$cmd"; then
  if grep -Eq '(--force|--force-with-lease|[[:space:]]-f)([[:space:]]|$)' <<<"$cmd" \
     && grep -Eq '\b(main|HEAD:main)\b' <<<"$cmd"; then
    deny "force-push to main. Open a PR instead."
  fi
  # Plain push to main, with or without flags like -u. The initial scaffold push
  # is the only legitimate one, and it already happened.
  if grep -Eq 'git[[:space:]]+push([[:space:]]+-[^[:space:]]+)*[[:space:]]+origin[[:space:]]+main([[:space:]]|$)' <<<"$cmd"; then
    deny "direct push to main. Branch and open a PR (see AGENTS.md)."
  fi
fi

if grep -Eq 'git[[:space:]]+add\b' <<<"$cmd" \
   && grep -Eq '(^|[[:space:]])\.env([[:space:]]|$)' <<<"$cmd"; then
  deny ".env holds live keys and is gitignored. Update .env.example instead."
fi

exit 0
