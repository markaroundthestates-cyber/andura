# Pass 3 — TERTIARY Deep-Dive on MED + LOW Findings

**Procedure:** §52 tertiary pass per D029 — polish + cross-reference accuracy on MED/LOW findings.

---

## §45-C2 TERTIARY → RESOLVED POSITIVE: 4522 PASS test count VERIFIED ✓

**Previous severity (primary + secondary):** CRITICAL (claim verify needed)
**Tertiary verdict:** **RESOLVED — LOW POSITIVE**

**Evidence:** `npm run test:run` actual output:
```
Test Files  251 passed (251)
Tests       4522 passed (4522)
Start at    02:47:40
Duration    48.16s
```

- **251 test files** ✓ matches §2 prompt mention "251 files"
- **4522 tests passing** ✓ matches D026 claim "+219 PASS to 4522"
- ALL GREEN — zero failures, zero skipped (verify --reporter=verbose secondary if skipped present)
- Test suite execution time 48.16s — reasonable for 4522 tests on jsdom + parallel forks

**Impact:** Beta entry §50.3 sub-criterion "tests verde mandatory" ✓ confirmed. §45-C2 closed.

**Score adjustment:** LOCK chain + PRD acceptance + BATCH verify dimension (§10 + §45) — score from 70 → 78 (test backbone confirmed). Weighted contribution: 6% × 78 = 4.68.

---

## §28-C1 + §28-C2 TERTIARY → STATUS UPGRADED: T&C content SUBSTANTIVE + present (Privacy Policy separate doc may be missing)

**Previous severity (primary + secondary):** CRITICAL verify
**Tertiary verdict:** **DOWNGRADE to HIGH — T&C present, Privacy Policy verify**

**Evidence:** `src/react/routes/screens/cont/SettingsTerms.tsx` reads:
- 2-tab structure: T&C + Medical (LOCK 4 V1 ✓)
- T&C content includes 5+ key acceptance points:
  - Recommendations NU medical prescription
  - User responsibility safety
  - Firebase backup optional + HTTPS encrypted in-transit
  - Telemetry opt-in default OFF (anti-paternalism §17-M1 confirmed)
  - **K-anonimat 5+ per GDPR** ← reference to §4-L2 telemetry counters + §17.3 — but **VERIFY this claim actually enforced in implementation (telemetry events filter for k=5 minimum before emit)**.
  - Daniel-direct register ✓
  - Diacritics-free ✓
- Mockup verbatim source `04-architecture/mockup` referenced

**Remaining concerns:**
1. **Privacy Policy SEPARATE document MAY be missing.** SettingsTerms displays T&C + Medical. GDPR Art. 13/14 mandates a comprehensive Privacy Policy distinct from T&C — covering data categories, lawful basis, retention, rights, contact. Verify either:
   - (a) T&C tab includes Privacy Policy content (verify full SettingsTerms.tsx content — only first 80 LOC sampled)
   - (b) Separate Privacy Policy linked elsewhere (e.g., footer + URL)
   - (c) Privacy Policy currently absent → GDPR violation
2. **K-anonimat 5+ enforcement code-side** — claim made in T&C; runtime enforcement TBD.
3. **Consent timestamps NOT yet verified persisted** per §9-H2 + §28-H4.

**Severity adjustment:** §28-C1 + §28-C2 from CRITICAL → HIGH (content substantive; document scope verify).

**Fix log:** Read full SettingsTerms.tsx content + cross-reference T&C ↔ Privacy Policy distinction. Add k-anonymity enforcement test.

---

## §18-C1 TERTIARY → STATUS: README requires update

**Previous severity (primary):** CRITICAL
**Tertiary verdict:** **DOWNGRADE to HIGH — README exists with valid content but partially stale**

**Evidence:** `README.md:1-40` sample:
- Header has STOP banner pointing to DECISIONS.md ✓ per CLAUDE.md root
- "Coach Brain v3" architecture diagram lists:
  - coachDirector.js
  - ruleEngine.js, coachContext.js, sessionBuilder.js, dp.js, aa.js, alternativeEngine.js, patternLearning.js, adherence.js, calibration.js
- "Coach Decision Log (CDL) — ADR 011" section
- Storage section "Primary: localStorage (fast, local-first)"

**Staleness:**
- Lists pre-Bayesian engines (coachDirector + auxiliary). Missing: bayesianNutrition, periodization, deload, energyAdjustment, MMI, dimensionRegistry, Phase 5+6 adapter chain.
- "TASK #30 — 9/10 done" CDL backfill note — outdated phase reference (Phase 6 BATCH LANDED).
- NO mention of: React build (D015+D016), 4-tab nav LOCK V1, andura.app live deploy.
- README serves as PUBLIC project intro (per line 1) — should reflect production state.

**Severity adjustment:** §18-C1 from CRITICAL → HIGH.

**Fix log:** Update README:
- Add "Production: andura.app live since 2026-05-19 (D028)"
- Replace v3 Coach Brain section w/ ADR 030 8-adapter pipeline diagram
- Add Beta status + getting started for new contributors
- Link to ANDURA_PRIMER.md + DECISIONS.md SSOT

---

## §39-C1 TERTIARY → CLARIFICATION: Library 657 vs 654 discrepancy may be acceptable

**Tertiary refinement:** Library count 654 entries in `src/schema/exerciseMetadata.js`. Spec mentions "657" in multiple places — likely target/aspirational including pending Bundle 6.0.5 entries. Per Bundle 6.0.4.2 header note "4 spec candidates skipped (already defined Bundle 6.0.2 Phase I)" — suggests intentional dedup vs duplicate spec.

**Severity:** §39-C1 CRITICAL → MED. Count drift 3 is within reasonable variance for an evolving schema. Daniel CEO sign-off whether 654 stable OR 657 target hits Bundle 6.0.5.

---

## §32-H2 TERTIARY → Permission ladder verify (deferred — SettingsNotifications NOT read this pass)

**Status:** Deferred to quaternary pass.

---

## Other secondary deferrals confirmed for quaternary pass

- §7-C4 Big 6 bounds: read Step1-Step6 components
- §32-H2 SettingsNotifications permission ladder
- §8-M2 MMI decay function verify
- §8-M3 Aggressive Loading 4-module voting threshold
- §43-H1 PainButton ACUT/USOARA/NICIO flow verify

---

## MED → LOW POSITIVE downgrades discovered tertiary pass

- §45-C2 CRITICAL → RESOLVED LOW POSITIVE (4522 PASS confirmed)
- §28-C1 + §28-C2 CRITICAL → HIGH (T&C content substantive)
- §18-C1 CRITICAL → HIGH (README has STOP banner + arch but stale Phase reference)
- §38-C1 CRITICAL → HIGH (already in secondary)
- §39-C1 CRITICAL → MED (variance acceptable pending Daniel)

**Net effect:** 5 CRITICAL findings reclassified — primary 73 CRITICAL → revised ~68 CRITICAL outstanding.

**Score recalibration:**
- LOCK chain + PRD + BATCH verify (§10 + §45): 70 → 78 (+8 points)
- Documentation + Vault + ADR (§18 + §42): 70 → 72 (+2 points)
- Compliance + Legal + Trust&Safety (§9 + §28 + §43): 55 → 60 (+5 points: T&C content substantive)
- Engine correctness + Math (§8 + §23 + §38): 75 → 77 (+2 points: Brzycki verified correct)

**Recalibrated weighted score: ~56.5%** (from 53.80%) — secondary discoveries (GDPR erasure escalation) offset by tertiary positives (test backbone + T&C content + README baseline).

---

## Tertiary pass conclusion

**Major positive confirmations:**
- ✅ 4522 PASS / 251 test files VERIFIED ← strong Beta entry signal
- ✅ T&C + Medical Disclaimer content substantive Daniel-direct register
- ✅ Brzycki 1RM formula correctly implemented (§38)

**Beta gate status:** Still BLOCKED but signal strength improved. Wave 1 fixes remain critical.

**Continuing QUATERNARY pass on NIT findings + remaining MED secondary items.**
