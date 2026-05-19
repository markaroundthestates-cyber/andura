# TASK 2 — REDIRECT inbound wikilinks Capacity A targets

**Model:** 🔴 OPUS
**Order:** 2/8
**Dependencies:** Task 1 complete (4 new split files exist + committed pentru REDIRECT target use)
**Scope:** REDIRECT ALL inbound `[[HANDOVER_MISC|HANDOVER_VAULT_HYGIENE]]_2026-04-30_evening` wikilinks în active vault → canonical SSOT targets, ÎNAINTE Task 3 archive (anti-break-wikilinks).
**Estimate:** ~30-60 min CC (per match edit + verify)
**Risk:** REDIRECT silent error → broken information flow next chat startup. Mitigation: pre-flight grep + per-source incremental + re-grep verify post.

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT GREP MANDATORY
═══════════════════════════════════════════════════════════════════

```bash
# 1. Capture full inbound list verbatim per file:line
grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE)_2026-04-30_evening' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . > /tmp/redirect-targets-task2.txt

# 2. Display full list pentru audit trail
cat /tmp/redirect-targets-task2.txt
INBOUND_COUNT=$(wc -l < /tmp/redirect-targets-task2.txt)
echo "=== Total inbound matches: $INBOUND_COUNT ==="

# 3. Audit baseline expects 12 (6 HANDOVER_VAULT_HYGIENE + 6 HANDOVER_MISC)
# Variance ±2 acceptable (audit may have ±1-2 grep variance)
# Variance ≥3 → STOP, ESCALATE Daniel
if [ "$INBOUND_COUNT" -lt 9 ] || [ "$INBOUND_COUNT" -gt 16 ]; then
  echo "FAIL: Inbound count $INBOUND_COUNT diverges ≥3 vs audit expected 12"
  echo "Audit possibly stale OR grep pattern incomplete. STOP for Daniel review."
  exit 1
fi
echo "✅ Inbound count $INBOUND_COUNT within tolerance vs audit 12"

# 4. Verify per-source files exist + clean tree
for FILE in $(cut -d: -f1 /tmp/redirect-targets-task2.txt | sort -u); do
  test -f "$FILE" || { echo "FAIL: source $FILE missing"; exit 1; }
done
echo "✅ All source files exist"
```

═══════════════════════════════════════════════════════════════════
                  REDIRECT MAPPING TABLE (lookup logic)
═══════════════════════════════════════════════════════════════════

**Per-match REDIRECT logic — apply în ordine specificity (most-specific first):**

### Mapping HANDOVER_VAULT_HYGIENE_2026-04-30_evening

| Pattern matched | Replace with |
|---|---|
| `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]] §41` | `[[VAULT_RULES]] §VAULT_HYGIENE_PASS` |
| `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening\|...]] §41` (display alias) | preserve display alias + replace target: `[[VAULT_RULES\|<original_alias>]] §VAULT_HYGIENE_PASS` |
| `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]] §47` | `[[VAULT_RULES]] §HANDOVER_PROTOCOL step 9 amendment` |
| `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]] §48` | `[[../DIFF_FLAGS]]` (canonical DIFF_FLAGS root) |
| `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]] §49` | `[[DECISION_LOG]] (entries 2026-05-04 evening late)` |
| `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]]` (no §) | `[[VAULT_RULES]] §VAULT_HYGIENE_PASS + [[INDEX_MASTER]] VAULT CLEANUP HISTORY` |

### Mapping HANDOVER_MISC_2026-04-30_evening

| Pattern matched | Replace with |
|---|---|
| `[[HANDOVER_MISC_2026-04-30_evening]] §3` (pricing) | `[[PRODUCT_STRATEGY_SPEC_v1]] §AMENDMENT 2026-05-02` |
| `[[HANDOVER_MISC_2026-04-30_evening]] §26` (templates) | `[[ONBOARDING_SSOT_V1]] §1 + [[024-goal-driven-program-templates]]` |
| `[[HANDOVER_MISC_2026-04-30_evening]] §29` (safety nutrition) | `[[PRODUCT_STRATEGY_SPEC_v1]] §AMENDMENT 2026-05-02 + [[022-bayesian-nutrition-inference]]` |
| `[[HANDOVER_MISC_2026-04-30_evening]] §29.7` | `[[PRE_LAUNCH_CHECKLIST_V1]]` (NEW Task 1 split) |
| `[[HANDOVER_MISC_2026-04-30_evening]] §31` | `[[INVESTITII_PRIVATE]]` (NEW Task 1 split) |
| `[[HANDOVER_MISC_2026-04-30_evening]] §32` | `[[033-muscle-memory-index]]` (NEW Task 1 split) |
| `[[HANDOVER_MISC_2026-04-30_evening]] §36.50` | `[[PRODUCT_STRATEGY_SPEC_v1]] §AMENDMENT 2026-05-02` |
| `[[HANDOVER_MISC_2026-04-30_evening]] §36.103` | `[[KNOWLEDGE_LAYER_CADENCE_V1]]` (NEW Task 1 split) |
| `[[HANDOVER_MISC_2026-04-30_evening]] §36.99` through `§36.107` (cluster) | `[[026-offline-coaching-decision-tree-exhaustive]] §9.X canonical` |
| `[[HANDOVER_MISC_2026-04-30_evening]]` (no §) | `[[026-offline-coaching-decision-tree-exhaustive]] §9.X canonical + [[DECISION_LOG]]` |

### CURRENT_STATE.md §ACTIVE_REFS specific (lines 1737-1752 per audit Phase D Batch 2)

```bash
# Pre-flight: confirm line range still valid
sed -n '1737,1752p' 00-index/CURRENT_STATE.md > /tmp/active-refs-section.txt
grep -E 'HANDOVER_(MISC|VAULT_HYGIENE)' /tmp/active-refs-section.txt
```

REPLACE entries în §ACTIVE_REFS:
- `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]] §41-§49` → `[[VAULT_RULES]] §VAULT_HYGIENE_PASS + §HANDOVER_PROTOCOL step 9 amendment`
- `[[HANDOVER_MISC_2026-04-30_evening]] §36.99-§36.107` → `[[026-offline-coaching-decision-tree-exhaustive]] §9.X canonical (post-pipeline §42.10 V1 closure)`
- ADD: `[[PRE_LAUNCH_CHECKLIST_V1]] + [[INVESTITII_PRIVATE]] + [[033-muscle-memory-index]] + [[KNOWLEDGE_LAYER_CADENCE_V1]]` (new split files Task 1)

═══════════════════════════════════════════════════════════════════
                  EXECUTION (per-source iterate)
═══════════════════════════════════════════════════════════════════

```bash
# Iterate per source file, apply REDIRECT mapping
for FILE in $(cut -d: -f1 /tmp/redirect-targets-task2.txt | sort -u); do
  echo "=== Processing: $FILE ==="
  # Display matches în file pre-edit
  grep -nE '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE)_2026' "$FILE"

  # Apply REDIRECT mapping per pattern (use sed/Edit tool careful)
  # CC autonomous decides per-match correct REDIRECT target per mapping table above
  # Use Edit tool (str_replace) per match — exact string match mandatory

  # Post-edit verify: re-grep this file expects 0 matches
  grep -nE '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE)_2026' "$FILE" && \
    { echo "FAIL: residual matches în $FILE"; exit 1; }
  echo "✅ $FILE redirected clean"
done
```

**Edge case ambiguous match:** dacă wikilink se referă la §X NU în mapping table above → ESCALATE: log în /tmp/task2-ambiguous.txt + STOP (Daniel review pattern adăugare). Common fallback: §36.X cluster generic → ADR 026 §9.X canonical.

═══════════════════════════════════════════════════════════════════
                  VERIFY POST (CRITICAL)
═══════════════════════════════════════════════════════════════════

```bash
# 1. Final grep returns 0 matches în active vault
grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE)_2026-04-30_evening' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . > /tmp/redirect-final-check.txt

FINAL_COUNT=$(wc -l < /tmp/redirect-final-check.txt)
test "$FINAL_COUNT" = "0" || {
  echo "FAIL: $FINAL_COUNT residual matches active vault:"
  cat /tmp/redirect-final-check.txt
  exit 1
}
echo "✅ Zero residual inbound matches active vault — Task 2 complete"

# 2. NEW split files (Task 1) referenced in §ACTIVE_REFS NEW entries
grep -E '\[\[(PRE_LAUNCH_CHECKLIST_V1|INVESTITII_PRIVATE|033-muscle-memory-index|KNOWLEDGE_LAYER_CADENCE_V1)' \
  00-index/CURRENT_STATE.md
echo "✅ NEW split files cross-referenced în CURRENT_STATE §ACTIVE_REFS"

# 3. Archive folder NOT touched (sanity check)
test "$(grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE)_2026' \
  '📤_outbox/_archive/' 2>/dev/null | wc -l)" -gt 0 || \
  echo "INFO: archive references NU modified (preserve audit trail correct)"
```

═══════════════════════════════════════════════════════════════════
                  COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add -A
git commit -m "feat(vault-cleanup): REDIRECT inbound wikilinks Capacity A targets (Task 2)

Pre-archive REDIRECT $INBOUND_COUNT inbound wikilinks pentru HANDOVER_VAULT_HYGIENE
+ HANDOVER_MISC → canonical SSOT targets (VAULT_RULES, ADR 026 §9.X, PRODUCT_STRATEGY
§AMENDMENT 2026-05-02, ONBOARDING_SSOT_V1, ADR 022/024, NEW Task 1 split files).

Verify post: 0 residual matches active vault confirmed.

Anti-break-wikilinks pre-Task 3 archive Capacity A.
Cross-refs: audit-vault-2026-05-07.md Phase D Batch 2 + Phase C.1 spans 1+5+6+8."
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK
═══════════════════════════════════════════════════════════════════

```bash
git reset --hard HEAD^  # revert Task 2 commit
echo "Task 2 reverted — REDIRECT changes rolled back"
# Re-run Task 2 with corrected mapping table after Daniel review
```
