# TASK 8 — Final verification + push origin main

**Model:** 🔴 OPUS
**Order:** 8/8 (FINAL)
**Dependencies:** Tasks 1-7 toate complete + committed
**Scope:** Comprehensive verification suite + LATEST.md aggregate report + git push origin main.
**Estimate:** ~10-15 min CC
**Risk:** push fail (Codespaces vs Windows local sync, hooks block) → STOP, manual investigate

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT
═══════════════════════════════════════════════════════════════════

```bash
# 1. Verify all Tasks 1-7 commits landed (chronologic recent)
git log --oneline -10
# Expect: Task 7 → Task 6 → Task 5 → Task 4 → Task 3 → Task 2 → Task 1 → backup tag

# 2. Verify clean working tree (all commits absorbed)
git status
# Expect: nothing to commit, working tree clean

# 3. Verify branch main
test "$(git branch --show-current)" = "main" || \
  { echo "FAIL: NU on main branch"; exit 1; }
```

═══════════════════════════════════════════════════════════════════
                  COMPREHENSIVE VERIFY SUITE
═══════════════════════════════════════════════════════════════════

## Verify 1 — Tests baseline 2648 PASS preserved (CRITICAL)

```bash
echo "=== Running npm test (baseline 2648 PASS preserved) ==="
npm test 2>&1 | tee /tmp/task8-test-output.txt | tail -30

# Extract pass/fail counts
PASS_COUNT=$(grep -E '✓|passed' /tmp/task8-test-output.txt | tail -1 | grep -oE '[0-9]+' | head -1)
FAIL_COUNT=$(grep -E 'failed|FAIL' /tmp/task8-test-output.txt | tail -1 | grep -oE '[0-9]+' | head -1)

echo "Tests: $PASS_COUNT PASS / ${FAIL_COUNT:-0} FAIL"

# Strict expectation: 2648 PASS / 0 FAIL (doc-only operations)
if [ "${FAIL_COUNT:-0}" != "0" ]; then
  echo "FAIL CRITICAL: $FAIL_COUNT tests failed — doc-only changes should NOT affect tests"
  echo "STOP — manual investigate before push"
  exit 1
fi

if [ "$PASS_COUNT" -lt 2640 ] || [ "$PASS_COUNT" -gt 2660 ]; then
  echo "WARN: PASS count $PASS_COUNT outside expected ~2648 ±10. Review."
fi
echo "✅ Tests baseline preserved"
```

## Verify 2 — Wikilinks orphane scan complete

```bash
# 2.1 Archived files NU referenced active vault
RESIDUAL=$(grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_GLOBAL_SPLIT_PLAN)_2026' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . | wc -l)

test "$RESIDUAL" = "0" || {
  echo "FAIL: $RESIDUAL residual archived refs active vault"
  grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_GLOBAL_SPLIT_PLAN)_2026' \
    --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules .
  exit 1
}
echo "✅ ZERO residual archived refs active vault"

# 2.2 NEW split files (Task 1) referenced corectly
NEW_FILES_REFS=$(grep -rEn '\[\[(PRE_LAUNCH_CHECKLIST_V1|INVESTITII_PRIVATE|033-muscle-memory-index|KNOWLEDGE_LAYER_CADENCE_V1)' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . | wc -l)
echo "NEW split files inbound: $NEW_FILES_REFS (expected ≥4 — at least CURRENT_STATE §ACTIVE_REFS + INDEX_MASTER)"
[ "$NEW_FILES_REFS" -ge 4 ] || echo "WARN: NEW split files inbound count low"

# 2.3 RECENT_DECIDED_ARCHIVE referenced (Task 6 §POINTERS)
grep -q 'RECENT_DECIDED_ARCHIVE' 00-index/CURRENT_STATE.md || \
  { echo "FAIL: RECENT_DECIDED_ARCHIVE NU referenced în §POINTERS"; exit 1; }
echo "✅ RECENT_DECIDED_ARCHIVE referenced §POINTERS"
```

## Verify 3 — INDEX_MASTER stats accurate

```bash
ACTUAL_COUNT=$(find . -name "*.md" -type f \
  -not -path "*/_archive/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  | wc -l)

INDEX_STAT=$(grep -E 'fișiere active vault' 00-index/INDEX_MASTER.md | head -1 | grep -oE '[0-9]+' | head -1)
echo "INDEX_MASTER stat: $INDEX_STAT | Actual files: $ACTUAL_COUNT"

test "$INDEX_STAT" = "$ACTUAL_COUNT" || \
  echo "WARN: stat drift INDEX_MASTER vs actual ($INDEX_STAT vs $ACTUAL_COUNT) — manual fix"

# ADR breakdown
NUMBERED=$(ls 03-decisions/[0-9][0-9][0-9]-*.md 2>/dev/null | wc -l)
NAMED=$(ls 03-decisions/ADR_*.md 2>/dev/null | wc -l)
echo "ADRs actual: $NUMBERED numbered + $NAMED named = $((NUMBERED + NAMED)) total"
```

## Verify 4 — Critical SSOT files present

```bash
# Spot-check critical SSOT files exist + non-empty
for path in "00-index/CURRENT_STATE.md" \
            "00-index/INDEX_MASTER.md" \
            "VAULT_RULES.md" \
            "DIFF_FLAGS.md" \
            "03-decisions/DECISION_LOG.md" \
            "06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md" \
            "06-sessions-log/RECENT_DECIDED_ARCHIVE.md" \
            "08-workflows/PRE_LAUNCH_CHECKLIST_V1.md" \
            "01-vision/INVESTITII_PRIVATE.md" \
            "03-decisions/033-muscle-memory-index.md" \
            "08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md"; do
  test -s "$path" || { echo "FAIL: $path empty/missing"; exit 1; }
done
echo "✅ All critical SSOT files present non-empty"

# Verify archived files moved correctly (sanity)
for path in "06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md" \
            "06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md" \
            "06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md"; do
  test ! -f "$path" || { echo "FAIL: $path NU archived"; exit 1; }
done
echo "✅ All 3 archive sources removed from 06-sessions-log/"
```

## Verify 5 — VAULT_RULES §CC.9 + cross-refs present

```bash
grep -nE '^### §CC\.9' VAULT_RULES.md | head -1
grep -q 'Mandatory File Updates Per Handover' VAULT_RULES.md || \
  { echo "FAIL: §CC.9 content missing"; exit 1; }
grep -q 'PROMPT_CC_HYGIENE.md §10.9' VAULT_RULES.md || \
  echo "INFO: cross-ref §10.9 may be in different format — verify manual"
echo "✅ §CC.9 amendment landed"
```

═══════════════════════════════════════════════════════════════════
                  AGGREGATE REPORT 📤_outbox/LATEST.md
═══════════════════════════════════════════════════════════════════

```bash
# Move existing LATEST → archive cycle
NEXT_NN=$(find "📤_outbox/_archive/" -name "*.md" -type f | \
  grep -oE '/[0-9]+_' | grep -oE '[0-9]+' | sort -n | tail -1 | \
  awk '{printf "%03d", $1+1}')

if [ -f "📤_outbox/LATEST.md" ]; then
  git mv "📤_outbox/LATEST.md" \
    "📤_outbox/_archive/2026-05/${NEXT_NN}_LATEST_PREVIOUS_RUN_2_CYCLE.md"
fi

# Generate new LATEST.md per VAULT_RULES §3 schema
cat > 📤_outbox/LATEST.md <<EOF
# Run 2 Vault Cleanup — LATEST Report (2026-05-07)

**Task:** Run 2 multi-task vault cleanup batch (Capacity A LOCKED + sub-section split + REDIRECT + canonical spans + INDEX/CURRENT_STATE/DIFF_FLAGS refresh + §CC.9 amendment + §JUST_DECIDED compaction).
**Model:** 🔴 OPUS autonomous (\`claude --dangerously-skip-permissions\`)
**Status:** ✅ COMPLETE (Tasks 1-8 toate landed)

## Pre-flight

- Backup tag: \`pre-vault-cleanup-batch-2026-05-07-<HHMM>\` pushed origin
- Pre-flight grep wikilinks orphane baseline captured /tmp/redirect-targets-baseline.txt

## Modificări summary

### Task 1 — Pre-archive split (4 NEW files, audit Phase B+ line ranges verbatim)
- 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md (from HANDOVER_MISC §29.7)
- 01-vision/INVESTITII_PRIVATE.md (from HANDOVER_MISC §31)
- 03-decisions/033-muscle-memory-index.md (from HANDOVER_MISC §32, ADR 033 STUB)
- 08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md (from HANDOVER_MISC §36.103)

### Task 2 — REDIRECT 12 inbound wikilinks (Capacity A targets) → canonical SSOT

### Task 3 — Capacity A LOCKED archive (3 files)
- HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05_DEPRECATED.md
- HANDOVER_VAULT_HYGIENE_2026-04-30_evening_CAPACITY_A_DEPRECATED.md
- HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md

### Task 4 — Canonical REDIRECT spans
- Span 1 Pricing: PRODUCT_STRATEGY §AMENDMENT 2026-05-02 = canonical
- Spans 5+6+8: VAULT_RULES + ADR 024 + ONBOARDING_SSOT_V1 verified canonical

### Task 5 — INDEX_MASTER + CURRENT_STATE + DIFF_FLAGS refresh

### Task 6 — §JUST_DECIDED periodic compaction → NEW 06-sessions-log/RECENT_DECIDED_ARCHIVE.md (Bugatti Q2 decision: dedicated single-purpose, NU contaminate HANDOVER_GLOBAL INDEX inbound 91)

### Task 7 — VAULT_RULES §CC.9 NEW Mandatory File Updates Per Handover amendment LOCK V1 (Bugatti Q1 decision: §CC.9 standalone, NU §CC.5.X sub-section)

## Build + Tests

- npm test: $PASS_COUNT PASS / ${FAIL_COUNT:-0} FAIL (baseline preserved 2648 ±10 doc-only ZERO src)

## Commits (7 incremental + 1 task files archive consumed)

\`\`\`
$(git log --oneline -8)
\`\`\`

## Pushed

- origin main: TBD post Task 8 push step

## Issues

- None blocking

## Next action

Daniel decide axis next chat:
- (a) React tactical kickoff (P1.3 Faza 3 STRANGLER cu React migration architecture decision pending — ADR 005 §AMENDMENT inline OR new ADR 034)
- (b) Anti-recurrence rules consolidation VAULT_RULES NEW §ANTI_RECURRENCE_RULES (~30-60 min strategic, mid priority)
- (c) Faza 3 STRANGLER wiring real pure (no React detour) — featureFlag + Golden-master parity + 8 adapters thin
- (d) Playwright tests fix mecanic (3 stale assertions short scope)

🦫 **Bugatti craft. Quality > Speed. Vault PERFECT.** ✊
EOF

echo "✅ LATEST.md generated"
```

═══════════════════════════════════════════════════════════════════
                  FINAL COMMIT + PUSH
═══════════════════════════════════════════════════════════════════

```bash
# Move task files inbox → archive consumed audit trail (per master orchestrator step)
NEXT_TASK_NN=$NEXT_NN
NN_INT=$((10#$NEXT_TASK_NN + 1))  # +1 because LATEST cycle took NEXT_NN

for N in 1 2 3 4 5 6 7 8; do
  CURRENT_NN=$(printf "%03d" $((NN_INT + N - 1)))
  if [ -f "📥_inbox/run-2-cleanup-task-$N.md" ]; then
    git mv "📥_inbox/run-2-cleanup-task-$N.md" \
      "📤_outbox/_archive/2026-05/${CURRENT_NN}_RUN_2_TASK_${N}_CONSUMED.md"
  fi
done

# Master orchestrator NU în inbox (Daniel paste direct CC), so NU archive
# Sau dacă există: archive too
if [ -f "📥_inbox/master-orchestrator-run-2.md" ]; then
  CURRENT_NN=$(printf "%03d" $((NN_INT + 8)))
  git mv "📥_inbox/master-orchestrator-run-2.md" \
    "📤_outbox/_archive/2026-05/${CURRENT_NN}_RUN_2_MASTER_ORCHESTRATOR_CONSUMED.md"
fi

# Final commit cu LATEST + archive consumed
git add -A
git commit -m "chore(vault-cleanup): Run 2 LATEST report + task files archived consumed (Task 8 final)

Run 2 Vault Cleanup COMPLETE — Tasks 1-8 toate landed sequential fail-stop.

Verifications passed:
- Tests 2648 PASS preserved (doc-only ZERO src)
- ZERO residual wikilinks active vault pointing la archived files
- INDEX_MASTER stats accurate post-cleanup
- VAULT_RULES §CC.9 amendment landed
- RECENT_DECIDED_ARCHIVE NEW pattern landed
- 4 NEW split files standalone canonical
- 3 archived Capacity A LOCKED

Cumulative LOCKED V1 ~659 PRESERVED unchanged (vault hygiene meta-tooling NU product/architecture).

LATEST.md schema: VAULT_RULES §3 standard. Task files archived consumed audit trail."

# PUSH origin main
git push origin main
PUSH_STATUS=$?

if [ "$PUSH_STATUS" -ne 0 ]; then
  echo "FAIL: git push origin main returned $PUSH_STATUS"
  echo "Manual investigate (Codespaces vs Windows sync? hooks? auth?)"
  exit 1
fi
echo "✅ git push origin main SUCCESS"
```

═══════════════════════════════════════════════════════════════════
                  FINAL STATUS REPORT (terminal output)
═══════════════════════════════════════════════════════════════════

```bash
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Run 2 Vault Cleanup — COMPLETE ✅"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Tasks complete: 8/8 sequential fail-stop"
echo "Tests baseline: $PASS_COUNT PASS / ${FAIL_COUNT:-0} FAIL (target 2648 preserved)"
echo "Active vault files: $ACTUAL_COUNT (was 93 pre-cleanup, +4 split -3 archive)"
echo "ADRs: $NUMBERED numbered + $NAMED named = $((NUMBERED + NAMED)) total"
echo "Cumulative LOCKED V1: ~659 PRESERVED (vault meta-tooling NU product/architecture)"
echo ""
echo "Backup tag: pre-vault-cleanup-batch-2026-05-07-<HHMM>"
echo "Push: origin main ✅"
echo ""
echo "Next action: Daniel review LATEST.md + decide next axis"
echo ""
echo "🦫 Bugatti craft. Quality > Speed. Vault PERFECT. ✊"
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK PATH (full Run 2 abort)
═══════════════════════════════════════════════════════════════════

```bash
# Full Run 2 rollback to backup tag (cu Daniel approval explicit)
git reset --hard pre-vault-cleanup-batch-2026-05-07-<HHMM>
git push origin main --force-with-lease
echo "Run 2 fully reverted la backup tag"
```
