# TASK 4 — Canonical REDIRECT spans verification (Phase C.1)

**Model:** 🔴 OPUS
**Order:** 4/8
**Dependencies:** Task 3 complete (Capacity A archived; PRODUCT_STRATEGY §AMENDMENT 2026-05-02 inherits canonical pricing post HANDOVER_MISC §36.50 archive)
**Scope:** Verify canonical SSOT inheritance post-archive + REDIRECT remaining cross-refs (MOAT_STRATEGY line 113 + INDEX_MASTER NAVIGARE Pricing entry).
**Estimate:** ~10-15 min CC
**Risk:** stale references la archived sections → silent broken navigation. Mitigation: per-span verify canonical + grep stale ref.

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT
═══════════════════════════════════════════════════════════════════

```bash
# Verify Task 3 archived (sanity)
test ! -f "06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md" || \
  { echo "FAIL: HANDOVER_MISC NU archived (Task 3 incomplete)"; exit 1; }

# Verify canonical sources exist
test -f "01-vision/PRODUCT_STRATEGY_SPEC_v1.md" || { echo "FAIL: PRODUCT_STRATEGY missing"; exit 1; }
test -f "01-vision/MOAT_STRATEGY.md" || { echo "FAIL: MOAT_STRATEGY missing"; exit 1; }
test -f "00-index/INDEX_MASTER.md" || { echo "FAIL: INDEX_MASTER missing"; exit 1; }
test -f "01-vision/ONBOARDING_SSOT_V1.md" || { echo "FAIL: ONBOARDING_SSOT_V1 missing"; exit 1; }
test -f "03-decisions/024-goal-driven-program-templates.md" || { echo "FAIL: ADR 024 missing"; exit 1; }
test -f "VAULT_RULES.md" || { echo "FAIL: VAULT_RULES missing"; exit 1; }

# Verify canonical content present
grep -q '§AMENDMENT 2026-05-02' 01-vision/PRODUCT_STRATEGY_SPEC_v1.md || \
  echo "WARN: §AMENDMENT 2026-05-02 marker NU găsit în PRODUCT_STRATEGY (review post)"
grep -q '§VAULT_HYGIENE_PASS' VAULT_RULES.md || \
  { echo "FAIL: VAULT_RULES NU conține §VAULT_HYGIENE_PASS canonical"; exit 1; }
echo "✅ Pre-flight clean — canonical sources confirmed"
```

═══════════════════════════════════════════════════════════════════
                  EXECUTION (per-span verification + REDIRECT)
═══════════════════════════════════════════════════════════════════

## Span 1 — Pricing (PRODUCT_STRATEGY §AMENDMENT 2026-05-02 = NEW CANONICAL post-archive)

```bash
# 1.1 Verify PRODUCT_STRATEGY_SPEC_v1 §AMENDMENT 2026-05-02 contains pricing canonical
grep -n -A 3 '§AMENDMENT 2026-05-02' 01-vision/PRODUCT_STRATEGY_SPEC_v1.md | head -20
grep -n 'Founding €39\|Standard €59\|Elite €79' 01-vision/PRODUCT_STRATEGY_SPEC_v1.md

# 1.2 REDIRECT MOAT_STRATEGY line 113
# Pre-flight: locate current pricing line în MOAT_STRATEGY
grep -n 'Andura Standard €59\|€65/an\|§36.50' 01-vision/MOAT_STRATEGY.md

# Use Edit tool (str_replace) per match found.
# Pattern original (audit Phase C.1 Span 1 + line 113 strikethrough):
#   "Andura Standard €59/an" cu DEPRECATED 2026-05-02 Chat D ref §36.50
# Replace cu:
#   "Andura Standard €59/an (canonical: PRODUCT_STRATEGY_SPEC_v1 §AMENDMENT 2026-05-02 — Founding €39 cap 50 + Standard €59 + Elite €79 V1.1)"

# 1.3 INDEX_MASTER NAVIGARE Pricing entry REDIRECT
# Current entry (line ~38 per audit Phase B+):
#   "Pricing locked Founding €39 + Standard €59 + Elite €79 (V1.1) → [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.50 + [[PRODUCT_STRATEGY_SPEC_v1]] §1.3 (DEPRECATED, see §AMENDMENT)"
# Replace target:
#   "Pricing locked Founding €39 + Standard €59 + Elite €79 (V1.1) → [[PRODUCT_STRATEGY_SPEC_v1]] §AMENDMENT 2026-05-02 (canonical post Capacity A archive 2026-05-07)"

grep -n 'Pricing locked' 00-index/INDEX_MASTER.md
# Apply Edit tool per match found

echo "✅ Span 1 Pricing — canonical confirmed + 2 REDIRECT applied"
```

## Span 5+6 — VAULT_HYGIENE + §47 Alignment Rule (already canonical VAULT_RULES — verify only)

```bash
# 5+6 verify VAULT_RULES §VAULT_HYGIENE_PASS + §HANDOVER_PROTOCOL step 9 amendment exists
grep -n '§VAULT_HYGIENE_PASS\|step 9 amendment' VAULT_RULES.md | head -10
echo "✅ Span 5+6 verified canonical VAULT_RULES (no edit needed)"
```

## Span 8 — Goal-ca-Setting + 8 templates (ADR 024 + ONBOARDING_SSOT_V1 inherit canonical — verify only)

```bash
# 8.1 Verify ADR 024 SPEC READY V1 status preserved
head -30 03-decisions/024-goal-driven-program-templates.md | grep -E 'SPEC READY|V1|🟢'

# 8.2 Verify ONBOARDING_SSOT_V1 §1 contains 5 ecrane consolidated
grep -n '§1\|5 ecrane\|Goal Taxonomy' 01-vision/ONBOARDING_SSOT_V1.md | head -10

echo "✅ Span 8 verified ADR 024 + ONBOARDING_SSOT_V1 inherit canonical"
```

## Optional check — global stale §X references la archived sections

```bash
# Scan for residual references la archived §-section identifiers (text refs NU wikilinks)
# Pattern: free text "HANDOVER_MISC §X" sau "see §36.50" without canonical context
# Audit conservative: log only, NU auto-fix (false positives risk în git history references etc.)
grep -rEn '(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE)[[:space:]]*§' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . > /tmp/stale-text-refs.txt

if [ -s /tmp/stale-text-refs.txt ]; then
  echo "INFO: stale text refs found (review manual non-blocking):"
  cat /tmp/stale-text-refs.txt
fi
```

═══════════════════════════════════════════════════════════════════
                  VERIFY POST
═══════════════════════════════════════════════════════════════════

```bash
# 1. MOAT_STRATEGY line 113 area updated
grep -n 'PRODUCT_STRATEGY_SPEC_v1\|§AMENDMENT 2026-05-02\|Standard €59' 01-vision/MOAT_STRATEGY.md

# 2. INDEX_MASTER NAVIGARE Pricing entry REDIRECT applied
grep -n 'Pricing locked' 00-index/INDEX_MASTER.md
# Expect ref → PRODUCT_STRATEGY §AMENDMENT 2026-05-02 (NU §36.50 archived)

# 3. ZERO active vault wikilinks pointing la archived files
grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_GLOBAL_SPLIT_PLAN)' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  . | wc -l
# Expect: 0
```

═══════════════════════════════════════════════════════════════════
                  COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add -A
git commit -m "feat(vault-cleanup): canonical REDIRECT spans post-Capacity-A (Task 4)

Span 1 (Pricing): PRODUCT_STRATEGY_SPEC_v1 §AMENDMENT 2026-05-02 = canonical post archive HANDOVER_MISC §36.50.
- MOAT_STRATEGY line 113 REDIRECT cross-ref
- INDEX_MASTER NAVIGARE Pricing entry REDIRECT canonical

Span 5+6 (VAULT_HYGIENE + §47): VAULT_RULES §VAULT_HYGIENE_PASS + §HANDOVER_PROTOCOL step 9 amendment confirmed canonical (no edit, verify only).

Span 8 (Goal-ca-Setting + 8 templates): ADR 024 + ONBOARDING_SSOT_V1 §1 confirmed canonical (no edit, verify only).

Cross-refs: audit-vault-2026-05-07.md Phase C.1 Spans 1+5+6+8 + Phase D Batch 5."
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK
═══════════════════════════════════════════════════════════════════

```bash
git reset --hard HEAD^  # revert REDIRECT Span 1 commit
echo "Task 4 reverted — Span 1 REDIRECT rolled back"
```
