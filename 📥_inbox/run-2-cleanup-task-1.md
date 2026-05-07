# TASK 1 — Pre-archive split HANDOVER_MISC sub-sections (4 files create) [FIXED 2026-05-07]

**Model:** 🔴 OPUS
**Order:** 1/8
**Dependencies:** none (Pre-flight master complete)
**Scope:** Extract 4 sub-sections cu unique active value din `06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md` ÎNAINTE archive (Task 3) — preserve standalone canonical pre-archive.
**Estimate:** ~10-15 min CC
**Risk:** Line range drift față de audit → fail-stop section header mismatch verify

**FIX 2026-05-07 v2:** Pre-flight regex relaxat `§?` (optional § prefix) + `\b` word boundary pentru drift detection retained. Source HANDOVER_MISC has naming convention drift: legacy sections `## 29.7 / ## 31 / ## 32` (NO § prefix) vs newer `## §36.103` (WITH § prefix). Audit Phase B+ used `§` ca shorthand notation; spec v1 inherited literally — over-specified. Option A relaxation NU touch source content (audit trail preserved).

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT MANDATORY [FIXED v2]
═══════════════════════════════════════════════════════════════════

```bash
SOURCE="06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md"

# 1. Verify source file exists + LOC matches audit
test -f "$SOURCE" || { echo "FAIL: $SOURCE missing"; exit 1; }
LOC=$(wc -l < "$SOURCE")
echo "Source LOC: $LOC (audit expected: 5716)"
[ "$LOC" -ge 5700 ] && [ "$LOC" -le 5750 ] || { echo "FAIL: LOC drift >50 vs audit"; exit 1; }

# 2. Verify section headers at expected line ranges (audit Phase B+ verbatim)
echo "=== Header verification (regex relaxed §? optional + \b boundary) ==="
sed -n '2743p' "$SOURCE"   # Expected: "## 29.7 Pre-Launch..." OR "## §29.7..."
sed -n '2847p' "$SOURCE"   # Expected: "## 31. Investiții..." OR "## §31..."
sed -n '2890p' "$SOURCE"   # Expected: "## 32. Muscle Memory..." OR "## §32..."
sed -n '5589p' "$SOURCE"   # Expected: "## §36.103 Knowledge Layer..."

# 3. STOP dacă vreun header NU matches expected pattern (regex relaxed §? optional + \b boundary)
sed -n '2743p' "$SOURCE" | grep -qE '^## §?29\.7\b' || { echo "FAIL: §29.7 line drift"; exit 1; }
sed -n '2847p' "$SOURCE" | grep -qE '^## §?31\b' || { echo "FAIL: §31 line drift"; exit 1; }
sed -n '2890p' "$SOURCE" | grep -qE '^## §?32\b' || { echo "FAIL: §32 line drift"; exit 1; }
sed -n '5589p' "$SOURCE" | grep -qE '^## §?36\.103\b' || { echo "FAIL: §36.103 line drift"; exit 1; }

echo "✅ All 4 section headers verified at audit line ranges (regex relaxed)"

# 4. Verify destination paths NU exist (anti-overwrite)
for path in "01-vision/INVESTITII_PRIVATE.md" \
            "03-decisions/033-muscle-memory-index.md" \
            "08-workflows/PRE_LAUNCH_CHECKLIST_V1.md" \
            "08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md"; do
  test ! -f "$path" || { echo "FAIL: $path already exists"; exit 1; }
done
echo "✅ All 4 destinations clean"
```

═══════════════════════════════════════════════════════════════════
                  EXECUTION (4 file create sequential)
═══════════════════════════════════════════════════════════════════

## File 1 — `08-workflows/PRE_LAUNCH_CHECKLIST_V1.md` (lines 2743-2818)

```bash
cat > 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md <<'HEADER'
# PRE-LAUNCH CHECKLIST V1 LOCKED

**Status:** ACTIVE_SSOT (operational checklist canonical, pre-Beta active)
**First-source:** `HANDOVER_MISC_2026-04-30_evening.md` §29.7 (lines 2743-2818, archived 2026-05-07 Capacity A) — note: source heading style `## 29.7` legacy convention, content reference §29.7 shorthand
**Date split:** 2026-05-07 (Run 2 vault cleanup Task 1)
**Authority:** AUTHORITATIVE_LOCK (operational pre-Beta launch gate)

**Cross-refs:**
- [[../03-decisions/DECISION_LOG]] (entries 2026-05-02 + 2026-05-07 Capacity A LANDED)
- [[../01-vision/PRODUCT_STRATEGY_SPEC_v1]] §AMENDMENT 2026-05-02 (Founding €39 + Standard €59 + Elite €79 V1.1 + Distribution Strategy V1)
- [[../01-vision/PRIVACY_POLICY_V1_BETA]] + [[../01-vision/TERMS_OF_SERVICE_V1_BETA]] (Legal DIY initial drafts)
- [[../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] (Auth Phase 1+2 implementation pre-Beta gate)
- [[../DIFF_FLAGS]] P1-FLAG-SCENARIOS-COVERAGE (PRE-BETA blocker active)

---

HEADER

# Append verbatim content lines 2743-2818
sed -n '2743,2818p' "$SOURCE" >> 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md

# Verify LOC count
EXPECTED_LOC=$((2818 - 2743 + 1))  # 76 LOC content + ~17 header = ~93 total
ACTUAL_LOC=$(wc -l < 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md)
echo "PRE_LAUNCH_CHECKLIST_V1.md: $ACTUAL_LOC LOC (content $EXPECTED_LOC + header)"
[ "$ACTUAL_LOC" -ge 90 ] && [ "$ACTUAL_LOC" -le 100 ] || echo "WARN: LOC outside expected range"
```

## File 2 — `01-vision/INVESTITII_PRIVATE.md` (lines 2847-2889)

```bash
cat > 01-vision/INVESTITII_PRIVATE.md <<'HEADER'
# INVESTIȚII PRIVATE — Andura

**Status:** ACTIVE_SSOT (private business data canonical, precedent DANIEL_COMPLETE_PROFILE)
**First-source:** `HANDOVER_MISC_2026-04-30_evening.md` §31 Investiții LOCKED (lines 2847-2889, archived 2026-05-07 Capacity A) — note: source heading `## 31.` legacy convention
**Date split:** 2026-05-07 (Run 2 vault cleanup Task 1)
**Authority:** AUTHORITATIVE_LOCK (private business reference)

**Cross-refs:**
- [[DANIEL_COMPLETE_PROFILE]] (precedent private data canonical pattern)
- [[../03-decisions/DECISION_LOG]] (entries 2026-05-02+ Investiții LOCKED context)

---

HEADER

sed -n '2847,2889p' "$SOURCE" >> 01-vision/INVESTITII_PRIVATE.md

ACTUAL_LOC=$(wc -l < 01-vision/INVESTITII_PRIVATE.md)
echo "INVESTITII_PRIVATE.md: $ACTUAL_LOC LOC"
```

## File 3 — `03-decisions/033-muscle-memory-index.md` (lines 2890-2932)

```bash
cat > 03-decisions/033-muscle-memory-index.md <<'HEADER'
# ADR 033 — Engine Muscle Memory Index (MMI)

**Status:** 🟡 STUB / SPEC PLACEHOLDER (engine spec future, post-Beta v1.5 candidate)
**First-source:** `HANDOVER_MISC_2026-04-30_evening.md` §32 Muscle Memory Index LOCKED V1 NEW (lines 2890-2932, archived 2026-05-07 Capacity A) — note: source heading `## 32.` legacy convention
**Date created:** 2026-05-07 (Run 2 vault cleanup Task 1, ADR Numbering Additive convention §36.95 — 033 next slot post 032 Deload)
**Numbering convention:** Additive per [[VAULT_RULES]] §3 (NU re-arrange existing 001-032).

**Cross-refs:**
- [[018-engine-extensibility-architecture|ADR 018]] §1 Dimension Registry plug-in additive Open-Closed (MMI = Engine #9 candidate post-Beta)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §9 ENGINE-LEVEL SPECS (pattern §9.X reusable for §9.9 MMI when promoted SPEC)
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after — Convergence Guard "T2 Unlock" (MMI plausibly T2+ feature, gating defer)
- [[../01-vision/ONBOARDING_SSOT_V1]] §9 Anti-Reflex Protection (MMI prompt UX integration touchpoint)

---

## STATUS

**SPEC PLACEHOLDER** — content imported verbatim din HANDOVER_MISC §32 below. Promote la SPEC READY V1 când chat strategic dedicat compile §9.9 ADR 026 pattern (post-Beta v1.5 priority window).

## §1 Source content (verbatim from HANDOVER_MISC §32)

HEADER

sed -n '2890,2932p' "$SOURCE" >> 03-decisions/033-muscle-memory-index.md

ACTUAL_LOC=$(wc -l < 03-decisions/033-muscle-memory-index.md)
echo "033-muscle-memory-index.md: $ACTUAL_LOC LOC"
```

## File 4 — `08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md` (lines 5589-5621)

```bash
cat > 08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md <<'HEADER'
# KNOWLEDGE LAYER UPDATE CADENCE V1 LOCKED

**Status:** ACTIVE_SSOT (active rule canonical, knowledge layer maintenance)
**First-source:** `HANDOVER_MISC_2026-04-30_evening.md` §36.103 Knowledge Layer Update Cadence LOCKED V1 (lines 5589-5621, archived 2026-05-07 Capacity A)
**Date split:** 2026-05-07 (Run 2 vault cleanup Task 1)
**Authority:** AUTHORITATIVE_LOCK (operational rule)

**Cross-refs:**
- [[../02-audit/COACHING_TEXTBOOK_SYNTHESIS]] (knowledge synthesis source)
- [[../03-decisions/026-offline-coaching-decision-tree-exhaustive|ADR 026]] §9 ENGINE-LEVEL SPECS (knowledge integration per engine)
- [[../03-decisions/DECISION_LOG]] (entries 2026-05-02+ Knowledge Layer cadence locked context)

---

HEADER

sed -n '5589,5621p' "$SOURCE" >> 08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md

ACTUAL_LOC=$(wc -l < 08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md)
echo "KNOWLEDGE_LAYER_CADENCE_V1.md: $ACTUAL_LOC LOC"
```

═══════════════════════════════════════════════════════════════════
                  VERIFY POST
═══════════════════════════════════════════════════════════════════

```bash
# 1. All 4 files exist + non-empty
for path in "08-workflows/PRE_LAUNCH_CHECKLIST_V1.md" \
            "01-vision/INVESTITII_PRIVATE.md" \
            "03-decisions/033-muscle-memory-index.md" \
            "08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md"; do
  test -s "$path" || { echo "FAIL: $path empty or missing"; exit 1; }
done
echo "✅ All 4 split files created non-empty"

# 2. Header content matches expected pattern (Status / First-source / Cross-refs)
for path in "08-workflows/PRE_LAUNCH_CHECKLIST_V1.md" \
            "01-vision/INVESTITII_PRIVATE.md" \
            "03-decisions/033-muscle-memory-index.md" \
            "08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md"; do
  grep -q "^\*\*Status:\*\*" "$path" || { echo "FAIL: $path missing Status header"; exit 1; }
  grep -q "^\*\*First-source:\*\*" "$path" || { echo "FAIL: $path missing First-source"; exit 1; }
done
echo "✅ All 4 headers schema-compliant"

# 3. Source HANDOVER_MISC unchanged (atomic check — content extracted, NU modified)
git diff "$SOURCE" | wc -l  # Expect: 0 (sed -n read-only, NU edit)
test "$(git diff $SOURCE | wc -l)" = "0" || { echo "FAIL: source modified unexpectedly"; exit 1; }
echo "✅ Source HANDOVER_MISC untouched (extraction read-only)"
```

═══════════════════════════════════════════════════════════════════
                  COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md \
        01-vision/INVESTITII_PRIVATE.md \
        03-decisions/033-muscle-memory-index.md \
        08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md

git commit -m "feat(vault-cleanup): split HANDOVER_MISC sub-sections to standalone canonical files (Task 1)

- 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md from §29.7 lines 2743-2818
- 01-vision/INVESTITII_PRIVATE.md from §31 lines 2847-2889
- 03-decisions/033-muscle-memory-index.md from §32 lines 2890-2932 (STUB SPEC PLACEHOLDER, ADR 033 additive)
- 08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md from §36.103 lines 5589-5621

Pre-archive Capacity A preservation — 4 unique active value sections preserved standalone canonical
before HANDOVER_MISC archive Task 3. Source HANDOVER_MISC untouched (read-only extraction).

Note: source heading style drift (legacy ## 29.7 / ## 31 / ## 32 NO § prefix vs newer ## §36.103 WITH §)
documented în split file First-source headers. Pre-flight regex relaxed §? + \b boundary v2 fix.

Cross-refs: audit-vault-2026-05-07.md Phase B+ §HANDOVER_MISC table line ranges verbatim."
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK (dacă verify post fail)
═══════════════════════════════════════════════════════════════════

```bash
rm -f 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md \
      01-vision/INVESTITII_PRIVATE.md \
      03-decisions/033-muscle-memory-index.md \
      08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md
echo "Task 1 rollback complete (no commit needed if verify failed pre-commit)"
```
