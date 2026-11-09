#!/bin/sh
# Checks the retro note at .factory/decisions/command-problem.md.
cd "$(dirname "$0")/.." || exit 1
f=.factory/decisions/command-problem.md
fail() { echo "FAIL: $1"; exit 1; }

[ -f "$f" ] || fail "$f does not exist"

first=$(head -n 1 "$f")
case "$first" in
  "# "?*) ;;
  *) fail "first line must be a markdown heading, got: $first" ;;
esac

text='Retro: The task was lost to a broken test command (`node --test test/`) that no stage fixed. Green retried it unchanged and then escalated, and a person took over. A test command that errors on a missing module should be recognised as a command problem and changed, not retried. (2 episodes, 1 fact, 1 proposal for the Improver)'
grep -qxF "$text" "$f" || fail "retro text not present verbatim as a single line"

git ls-files --error-unmatch "$f" >/dev/null 2>&1 || fail "$f is not committed (tracked)"
[ -z "$(git status --porcelain -- "$f")" ] || fail "$f has uncommitted changes"
git log --oneline -- "$f" | grep -q . || fail "$f not in git log"

echo PASS
