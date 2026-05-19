#!/bin/bash
# Track 7 §7.10 — milestone finalize helper.
# Creates tag + dry-run verification. NU pushes (Daniel manual conscious act).
#
# Usage: bash scripts/track-7-finalize.sh
# Output: tag created locally, ready pentru `git push origin <tag>` Daniel manual.

set -euo pipefail

DATE=$(date +%Y-%m-%d)
TAG="track-7-automated-testing-landed-${DATE}"
BASELINE_TAG="pre-track-7-automated-testing-2026-05-19"

echo "════════════════════════════════════════════════════════════════"
echo "Track 7 §7.10 Finalize — Milestone tag creation"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Pre-checks
if ! git rev-parse "$BASELINE_TAG" >/dev/null 2>&1; then
  echo "ERROR: Baseline tag $BASELINE_TAG NOT found. Track 7 setup incomplete."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "WARN: Working tree has uncommitted changes. Recommend commit before tagging."
  echo "$(git status --short)"
  read -p "Proceed anyway? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "ERROR: Tag $TAG already exists. Use different date OR delete existing first:"
  echo "  git tag -d $TAG"
  exit 1
fi

# Summary stats since baseline
COMMITS_SINCE_BASELINE=$(git rev-list --count "${BASELINE_TAG}..HEAD")
FILES_CHANGED=$(git diff --name-only "${BASELINE_TAG}..HEAD" | wc -l)
INSERTIONS_DELETIONS=$(git diff --shortstat "${BASELINE_TAG}..HEAD" || echo "diff unavailable")

echo "📊 Summary since baseline tag $BASELINE_TAG:"
echo "  • Commits:          $COMMITS_SINCE_BASELINE"
echo "  • Files changed:    $FILES_CHANGED"
echo "  • Diff stat:        $INSERTIONS_DELETIONS"
echo ""

# Create annotated tag
git tag -a "$TAG" -m "Track 7 Automated Testing 3-tier defense LANDED.

10/10 phases LANDED:
  §7.1 Vitest persona fixtures + fast-check invariants + golden master
  §7.2 Playwright E2E React 4-tab + auth setup + Magic Link + axe-core
  §7.3 Visual regression toHaveScreenshot + Lighthouse CI 12+
  §7.4 Bundle budget + code health gates (size-limit + depcheck + madge + jscpd + license-checker)
  §7.5 Coach voice scenarios skeleton (@langwatch DEFERRED rationale)
  §7.6 deploy.yml + ci.yml + track-7-nightly augment (Stryker + Stagehand)
  §7.7 Checkly synthetic prod config + critical paths skeleton
  §7.8 Stagehand persona exploration nightly template
  §7.9 Vanilla legacy E2E cleanup (20 obsolete files deleted)
  §7.10 Production readiness + Daniel manual smoke PASS

Stats since $BASELINE_TAG:
  Commits: $COMMITS_SINCE_BASELINE
  Files changed: $FILES_CHANGED
  $INSERTIONS_DELETIONS

Per DECISIONS.md §D032 + 08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md."

echo "✅ Tag created locally: $TAG"
echo ""
echo "Next steps (Daniel manual conscious act):"
echo "  1. Verify tag: git show $TAG"
echo "  2. Push tag + main: git push origin main && git push origin $TAG"
echo "  3. Update DECISIONS.md §D032 status LOCKED V1 → LANDED $DATE"
echo "  4. Archive 📤_outbox/LATEST.md → _archive/LATEST-track-7-automated-testing-${DATE}.md"
echo ""
echo "🦫 Track 7 Automated Testing finalize ready. Daniel push when verify clean."
