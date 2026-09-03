#!/usr/bin/env bash
set -euo pipefail

hook=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/guard-git.sh
sha=0123456789abcdef0123456789abcdef01234567
failures=0
feature_repo=$(mktemp -d)
main_repo=$(mktemp -d)

cleanup() {
  rm -rf -- "$feature_repo" "$main_repo"
}

trap cleanup EXIT
git init -q --initial-branch=chore/guard-test "$feature_repo"
git init -q --initial-branch=main "$main_repo"

check_in() {
  local directory=$1
  local name=$2
  local expected=$3
  local command=$4
  local output
  local status

  set +e
  output=$(cd "$directory" && jq -nc --arg command "$command" --arg cwd "$directory" \
    '{cwd: $cwd, tool_input: {command: $command}}' | bash "$hook" 2>&1)
  status=$?
  set -e

  if [[ $status -ne $expected ]]; then
    printf 'FAIL %s: expected %s, got %s\n%s\n' "$name" "$expected" "$status" "$output"
    failures=$((failures + 1))
  else
    printf 'PASS %s\n' "$name"
  fi
}

check() {
  check_in "$feature_repo" "$@"
}

check "verified squash merge" 0 "gh pr merge 12 --squash --delete-branch --match-head-commit $sha"
check "merge missing pinned head" 2 "gh pr merge 12 --squash --delete-branch"
check "admin merge" 2 "gh pr merge 12 --squash --delete-branch --match-head-commit $sha --admin"
check "admin equals merge" 2 "gh pr merge 12 --squash --delete-branch --match-head-commit $sha --admin=true"
check "auto merge" 2 "gh pr merge 12 --squash --delete-branch --match-head-commit $sha --auto"
check "auto equals merge" 2 "gh pr merge 12 --squash --delete-branch --match-head-commit $sha --auto=true"
check "non-squash merge" 2 "gh pr merge 12 --merge --delete-branch --match-head-commit $sha"

check "feature push" 0 "git push -u origin chore/merge-policy"
check "direct main push" 2 "git push origin main"
check "head to main" 2 "git push origin HEAD:main"
check "quoted head to main" 2 "git push origin 'HEAD:main'"
check "alternate remote to main" 2 "git push upstream feature:main"
check "forced refspec to main" 2 "git push origin +HEAD:main"
check "full main ref destination" 2 "git push origin feature:refs/heads/main"
check "delete main refspec" 2 "git push origin :main"
check "delete main flag" 2 "git push origin --delete main"
check "force feature push" 2 "git push origin feature --force"
check "combined force flag" 2 "git push -fu origin feature"
check "rtk wrapped main push" 2 "rtk git push origin HEAD:main"
check "git global option main push" 2 "git -C . push origin HEAD:main"
check_in "$main_repo" "implicit push from main" 2 "git push"

# The branch must be resolved for the directory the command runs in, not for whichever checkout the
# hook process happens to sit in. Both directions, because the permissive one is the dangerous half.
check_in "$main_repo" "feature worktree while the session sits on main" 0 "git -C $feature_repo push -u origin chore/guard-test"
check_in "$feature_repo" "main worktree while the session sits on a branch" 2 "git -C $main_repo push"
check_in "$feature_repo" "cd into a main worktree first" 2 "cd $main_repo && git push"

check "read-only API request" 0 "gh api repos/MUBA-M1KU/dev/pulls/12"
check "API main ref update" 2 "gh api -X PATCH repos/MUBA-M1KU/dev/git/refs/heads/main -f sha=$sha"
check "API direct merge" 2 "gh api -X PUT repos/MUBA-M1KU/dev/pulls/12/merge"
check "quoted API direct merge" 2 "gh api -X PUT 'repos/MUBA-M1KU/dev/pulls/12/merge'"
check "API input direct merge" 2 "gh api repos/MUBA-M1KU/dev/pulls/12/merge --input payload.json"
check "API base-main merge" 2 "gh api -X POST repos/MUBA-M1KU/dev/merges -f base=main -f head=feature"
check "GraphQL merge mutation" 2 "gh api graphql -f query='mutation { mergePullRequest(input: {}) { clientMutationId } }'"

if [[ $failures -ne 0 ]]; then
  printf '%s guard test(s) failed\n' "$failures"
  exit 1
fi

printf 'All guard tests passed\n'
