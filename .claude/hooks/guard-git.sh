#!/usr/bin/env bash
# PreToolUse(Bash): this repo merges through PRs. Exits 0 on any internal failure.
# Matches the command substring, so an `rtk`-prefixed command is caught too.
set -uo pipefail

command -v jq >/dev/null 2>&1 || exit 0
cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[[ -n "$cmd" ]] || exit 0

# exit 2 plus stderr feeds the reason back to the agent
deny() { echo "BLOCKED: $1" >&2; exit 2; }

has() { grep -Eq "$1" <<<"$cmd"; }

if has 'gh[[:space:]]+pr[[:space:]]+merge([[:space:]]|$)'; then
  if has '(^|[[:space:]])(--admin|--auto|--merge|--rebase)(=[^[:space:]]*)?([[:space:]]|$)|(^|[[:space:]])(-m|-r)([[:space:]]|$)'; then
    deny "PR merges must not bypass checks, queue for later, or use a non-squash strategy."
  fi
  if ! has '(^|[[:space:]])(--squash|-s)([[:space:]]|$)'; then
    deny "PR merges must use --squash."
  fi
  if ! has '(^|[[:space:]])(--delete-branch|-d)([[:space:]]|$)'; then
    deny "PR merges must delete the merged feature branch."
  fi
  if ! has '(^|[[:space:]])--match-head-commit(=|[[:space:]])[0-9a-fA-F]{40}([[:space:]]|$)'; then
    deny "PR merges must pin the verified 40-character head SHA with --match-head-commit."
  fi
fi

if has 'git([[:space:]]+[^[:space:]]+)*[[:space:]]+push([[:space:]]|$)'; then
  if has '(^|[[:space:]])(--force|--force-with-lease)(=[^[:space:]]*)?([[:space:]]|$)|(^|[[:space:]])-[[:alnum:]]*f[[:alnum:]]*([[:space:]]|$)'; then
    deny "force-pushes are forbidden. Push a new commit through a PR instead."
  fi
  if has '(^|[[:space:]])\+?[^[:space:]]*:((refs/heads/)?main)([^[:alnum:]_.-]|$)'; then
    deny "direct push to main. Branch and open a PR (see AGENTS.md)."
  fi
  if has '(^|[[:space:]])(--delete|-d)([[:space:]][^[:space:]]+)*[[:space:]]+((refs/heads/)?main)([[:space:]]|$)'; then
    deny "deleting main is forbidden."
  fi
  if has '(^|[[:space:]])((refs/heads/)?main)([[:space:]]|$)'; then
    deny "direct push to main. Branch and open a PR (see AGENTS.md)."
  fi
  current_branch=$(git branch --show-current 2>/dev/null || true)
  if [[ "$current_branch" == "main" ]]; then
    deny "pushing from main is forbidden. Branch and open a PR (see AGENTS.md)."
  fi
fi

if has 'gh[[:space:]]+api([[:space:]]|$)'; then
  api_mutation=false
  if has '(^|[[:space:]])(-X|--method)(=|[[:space:]])(POST|PUT|PATCH|DELETE)([[:space:]]|$)'; then
    api_mutation=true
  elif has '(^|[[:space:]])(-f|-F|--field|--raw-field|--input)(=|[[:space:]])'; then
    api_mutation=true
  fi

  if [[ "$api_mutation" == true ]] && has 'git/refs?/(heads/)?main([^[:alnum:]_.-]|$)'; then
    deny "mutating the main ref through the GitHub API is forbidden."
  fi
  if [[ "$api_mutation" == true ]] && has 'pulls/[0-9]+/merge([^[:alnum:]_.-]|$)'; then
    deny "merge pull requests with the verified gh pr merge command from AGENTS.md."
  fi
  if [[ "$api_mutation" == true ]] && has '/merges([^[:alnum:]_.-]|$)' && has 'base(=|[[:space:]]+)main([^[:alnum:]_.-]|$)'; then
    deny "creating a merge commit on main through the GitHub API is forbidden."
  fi
  if has '(mergePullRequest|updateRef|deleteRef|createCommitOnBranch)[[:space:]]*\('; then
    deny "GraphQL mutations cannot bypass the repository merge and main-branch policy."
  fi
fi

has 'git[[:space:]]+add\b' && has '(^|[[:space:]])\.env([[:space:]]|$)' \
  && deny ".env holds live keys and is gitignored. Update .env.example instead."

exit 0
