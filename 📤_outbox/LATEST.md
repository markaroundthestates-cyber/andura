# LATEST — LOCK 9 LOOP CLOSE: Accelerated Learning Wired Into Engine

**Task:** Close LOCK 9 loop — wire `detectAcceleratedLearningTrigger` + `detectT0ToT1AdvanceTrigger` into engine recommendation baseline + tier advance
**Model:** 🔴 Opus (zero Sonnet exceptions)
**Status:** Complete
**Branch:** `feature/v2-vanilla-port`
**Date:** 2026-05-15
**Backup tag:** `pre-lock-9-loop-close-accelerated-learning-engine-wire-2026-05-15` pushed origin

---

## §0 Pre-flight grep evidence inline

```
=== Predecessor LOCK 9 detection files (all exist — PASS) ===
src/engine/aggressiveLoadingThreshold.js
src/engine/acceleratedLearning.js
src/engine/__tests__/aggressiveLoadingThreshold.test.js
src/engine/__tests__/acceleratedLearning.test.js
src/pages/coach/aggressiveLoadingModal.js
src/pages/coach/__tests__/aggressiveLoadingModal.test.js
src/pages/coach/__tests__/confirmSessionKg.aggressiveLoading.test.js

=== CDL log key wired in logging.js ===
1 const reference (AGGRESSIVE_LOADING_LOG_KEY) — write at confirmSessionKg + enrichment at confirmReps

=== DP.recommend definition ===
src/engine/dp.js:141  recommend(ex) { ... }
src/engine/dp.js:329  const base = this.recommend(ex);  (internal use in microload)

=== AA.applyTo location ===
src/engine/aa.js:150  applyTo(rec, ex) { ... }

=== computeEngineTier exports ===
src/engine/calibrationReconciliation.js:98  export function computeEngineTier(sessionCount)
src/engine/calibrationReconciliation.js:204  (internal use in reconcile)

=== Schema 657 entries baseline (LOCK 2 Daniel Gates) ===
657 ✅

=== Tests baseline pre-execute ===
3594 PASS (180 files) ✅
```

---

## §A Audit findings + architectural choice rationale

**DP.recommend(ex):** `src/engine/dp.js:141`. Returns shape `{kg, repsTarget, rir, status, statusColor, statusLabel, progressionNote, progressionStage}`. Calls `_recommendRaw()` then rounds kg via `roundToStep`.

**AA.applyTo(rec, ex):** `src/engine/aa.js:150`. Wraps DP output with auto-adjust (HOLD/DECREASE/INCREASE/REDUCE_VOLUME). Compose pattern preserved everywhere: `AA.applyTo(DP.recommend(ex), ex)`.

**DP.recommend + AA.applyTo call sites (6 total):**
- `src/pages/coach/logging.js:79, 157, 254, 290` — user-facing (4×): updateExCard, confirmReps, editSessionKg, confirmSessionKg
- `src/pages/coach/renderIdle.js:292` — Today screen preview (display-only)
- `src/pages/coach/workout.js:53` — workout summary (display-only)
- `src/pages/coach/restTimer.js:77` — next-exercise preview (DP only, no AA)

**computeEngineTier callers:** `logging.js:282` (user-facing in confirmSessionKg) + internal `reconcile()` at `calibrationReconciliation.js:204`.

**Architectural choice (Option B compose preserved):**
- NEW pure-function adapter `applyAcceleratedLearningUpgrade` as **third layer wrapper** in the compose pipeline: `DP.recommend → AA.applyTo → applyAcceleratedLearningUpgrade`.
- Wire only the **4 user-facing logging.js sites** via NEW local helper `_recommendForUser(ex)` (single import + replace). Leave renderIdle/workout/restTimer untouched (display-only, baseline acceptable, reduces blast radius).
- Pure-function `computeEngineTierWithAccelerated` added to `calibrationReconciliation.js` (alongside baseline). Wire at `confirmSessionKg` tier read; leave internal `reconcile()` on baseline (deterministic sync algorithm needs unconditional tier).

**Rationale:**
- Preserves AA.applyTo signature unchanged (no breaking change to 6 callers).
- DP.recommend stays a "pure" engine layer — does NOT become CDL-coupled.
- Forensic flags `_acceleratedLearningApplied / _originalKg / _upgradePct / _samplesUsed` ride on the recommendation object — ADR 011 §append-only audit trail invariant.
- Display-only sites unaffected — minimum-surface Bugatti craft.

---

## §B `acceleratedLearningAdapter.js` NEW + tests + DP pipeline wiring

**Module:** `src/engine/acceleratedLearningAdapter.js` (NEW, 64 LOC)

Exports:
- `applyAcceleratedLearningUpgrade(recommendation, exerciseName, cdlEntries, dpEngine)` — pure wrapper, returns recommendation unchanged when no trigger; upgraded with forensic flags when 2+ legitimate overrides detected for `exerciseName`. Idempotent (ADR 018 §2). NO mutation (immutability via `{...recommendation, ...overrides}`).
- `readAggressiveLoadingLog(db)` — I/O boundary helper; defensive against null db, missing `.get`, throws, non-array, null returns.

**Wired into:** `src/pages/coach/logging.js` via local helper `_recommendForUser(exerciseName)`:
```javascript
function _recommendForUser(exerciseName) {
  const rec = AA.applyTo(DP.recommend(exerciseName), exerciseName);
  const cdlEntries = readAggressiveLoadingLog(DB);
  return applyAcceleratedLearningUpgrade(rec, exerciseName, cdlEntries, DP);
}
```

Applied at 4 user-facing sites: `updateExCard`, `confirmReps`, `editSessionKg`, `confirmSessionKg`.

**Tests:**
- `src/engine/__tests__/acceleratedLearningAdapter.test.js` — **23 tests PASS**
  - No-trigger paths (null rec, kg=0, empty CDL, 1-entry only, different exercise)
  - Upgrade-applied paths (2 legit overrides → upgraded by avg deviation; forensic flags; roundToStep; null dpEngine fallback; shape passthrough; immutability; idempotency)
  - I/O boundary helper (null db, throws, non-array, null, correct key)
- `src/engine/__tests__/dp.recommend.acceleratedLearning.test.js` — **8 end-to-end PASS**
  - Real DP + AA + adapter against real schema (Flat Barbell Bench)
  - No-CDL → baseline unchanged
  - 1-entry only → no upgrade
  - Different exercise → no upgrade
  - 2 legit → upgrade with correct deviation% + roundToStep
  - Idempotency end-to-end
  - Reverted entries excluded
  - High-RPE (>8) excluded (anti-paternalism preserved)

---

## §C `computeEngineTierWithAccelerated` NEW + tests

**Modified:** `src/engine/calibrationReconciliation.js` — added pure-function export alongside baseline `computeEngineTier`:

```javascript
export function computeEngineTierWithAccelerated(sessionCount, cdlEntries) {
  const baselineTier = computeEngineTier(sessionCount);
  if (baselineTier !== 'T0') return baselineTier;
  const advance = _detectT0ToT1AdvanceFromLog(cdlEntries);
  return advance ? 'T1' : 'T0';
}
```

Scope: T0→T1 only (per spec). T1→T2 governed by ADR 009 §AMENDMENT 2026-05-05 Convergence Guard "T2 Unlock" mechanism — separate concern, not bumped here.

**Wired into:** `confirmSessionKg` at `logging.js` — tier read for aggressive loading evaluation:
```javascript
const cdlEntries = readAggressiveLoadingLog(DB);
const tier = computeEngineTierWithAccelerated(_countDistinctSessionDates(), cdlEntries);
```

Leaves internal `reconcile()` on baseline `computeEngineTier` (sync algorithm must be deterministic + monotonic — accelerated logic doesn't apply there).

**Tests:** `src/engine/__tests__/calibrationReconciliation.acceleratedTier.test.js` — **14 tests PASS**
- Baseline pass-through (sessionCount 0/5/21/1000 + null/undefined/NaN handling)
- Accelerated T0→T1 trigger (3+ distinct exercises with legitimate pattern)
- Below-threshold trigger (2 distinct exercises only → stays T0)
- Pre-natural-advance threshold (sessionCount=4 + trigger → T1 accelerated)
- T1+ NEVER accelerated to T2 (spec scope)
- T2 NEVER downgraded (monotonic invariant)
- Purity (idempotency, no mutation, baseline unchanged behavior)

---

## §D Tests baseline 3594 → 3639 PASS + ZERO regression evidence

```
Test Files  183 passed (183)
     Tests  3639 passed (3639)
   Start at  17:55:05
   Duration  33.13s
```

Delta: **+45 NEW tests** (23 adapter + 14 tier + 8 end-to-end). All pre-existing 3594 tests preserved EXACT — ZERO regression.

---

## §E Commits + push origin

**Atomic commit single-concern (pre-commit hook gate green, NO `--no-verify` bypass).**

Files staged:
- NEW: `src/engine/acceleratedLearningAdapter.js`
- NEW: `src/engine/__tests__/acceleratedLearningAdapter.test.js`
- NEW: `src/engine/__tests__/dp.recommend.acceleratedLearning.test.js`
- NEW: `src/engine/__tests__/calibrationReconciliation.acceleratedTier.test.js`
- MODIFIED: `src/engine/calibrationReconciliation.js` (added `computeEngineTierWithAccelerated` + import)
- MODIFIED: `src/pages/coach/logging.js` (added `_recommendForUser` helper + 4 site replacements + accelerated tier read in confirmSessionKg)
- MOVE: `📤_outbox/LATEST.md` → `📤_outbox/_archive/2026-05/516_LATEST_PREVIOUS_LOCK_9_AGGRESSIVE_LOADING_DETECTION_LANDED_CONSUMED.md`
- NEW: `📤_outbox/LATEST.md` (this file)

---

## §F Backup tag pre-execute verify

```
git tag pre-lock-9-loop-close-accelerated-learning-engine-wire-2026-05-15
git push origin pre-lock-9-loop-close-accelerated-learning-engine-wire-2026-05-15
→ [new tag] pushed
```

Rollback: `git reset --hard pre-lock-9-loop-close-accelerated-learning-engine-wire-2026-05-15`.

---

## §G HARD CONSTRAINTS §F3.12 verification

- ✅ **Schema 657 entries preserved invariant** (LOCK 2 Daniel Gates 100% gate)
- ✅ **ZERO src/ touched outside scope** — only `src/engine/calibrationReconciliation.js` (added function, no break) + `src/pages/coach/logging.js` (4 site swap + 1 tier read + 1 helper added)
- ✅ **ZERO `--no-verify` bypass** — pre-commit hook ran 3639 tests green
- ✅ **ZERO Big 11 engine layer mutation** (C4.1-C4.8 preserved invariant)
- ✅ **Pure-function paradigm ADR 026 §9** — adapter NO Date.now / Math.random / mutation; DB read encapsulated at I/O boundary helper `readAggressiveLoadingLog`
- ✅ **Forensic transparency ADR 011 §append-only** — `_acceleratedLearningApplied` + `_originalKg` + `_upgradePct` + `_samplesUsed` preserve audit trail on every upgrade
- ✅ **Anti-paternalism ABSOLUTE preserved** — engine "I'm wrong" self-heals when user pattern proves baseline conservative; user override never blocked; reverted entries + high-RPE (>8) excluded from upgrade (prevents reinforcing grind/injury patterns)
- ✅ **Idempotency invariant ADR 018 §2** — verified by test: same (rec, ex, cdlEntries) → same (kg, _upgradePct)
- ✅ **Force-typing ELIMINATED PERMANENT (ADR 013 §AMENDMENT 2026-04-30)** — preserved invariant (4 matches)
- ✅ **Voice preservation policy §1 wiki concept page** — zero edits

---

## §H Issues encountered + recovery actions

**Issue 1: Static import vs lazy import for accelerated detector in calibrationReconciliation.js.**
Initial concern about circular dependency between `calibrationReconciliation.js` (depended on by many) and `acceleratedLearning.js`. Investigation: `acceleratedLearning.js` is a pure leaf module (no DB read, no other engine imports). Static import safe. Internal helper `_detectT0ToT1AdvanceFromLog` isolates the import for testability/clarity. NO recovery action needed — clean wiring.

**Issue 2: Test ordering — confirmSessionKg integration tests failed mid-flight.**
After wiring `_recommendForUser` + accelerated tier read into `confirmSessionKg` but BEFORE adding `computeEngineTierWithAccelerated` export, the existing integration tests failed with `computeEngineTierWithAccelerated is not a function`. Expected — fixed by completing §C immediately. Tests went 12-failed → 13-pass once export landed. Verified before commit.

**Issue 3: Compose pattern preservation — chose Option B over A.**
Option A (modify DP.recommend internally to read CDL) would have required all 6 sites get the upgrade automatically, but couples DP to CDL log storage (breaking layer boundary). Option B (third wrapper layer) keeps DP pure + allows surgical opt-in at user-facing sites only. Display-only sites (`renderIdle`, `workout`, `restTimer`) stay on baseline — reduces unnecessary risk and surface.

---

## §I Next action recommendation

**LOCK 9 LOOP NOW END-TO-END COMPLETE pre-Beta scope.** Engine reads user-override pattern → upgrades baseline recommendation → upgraded baseline shown in UI → user sees stronger kg without re-overriding manually. "Engine I'm wrong se vindeca in 2-3 sesiuni" promise FULFILLED.

**P3 LOCK 10 candidate options (in priority order Co-CTO autonomous read):**

1. **LOCK 10 ADR 033 MMI promote** — unify 3 patterns observable behavioral safety V1 (Volume Creep §36.18 + Auto-pedeapsă §36.19 + Aggressive Loading §EXT-2) into Multi-Modal Intelligence infrastructure. Strategic value high but borderline §AR.26 — recommend chat-dedicated CEO decision NOT tactical CTO autonomous.

2. **LOCK 11 F5 AA-Friction Modal UX iteration** — review `aaFrictionModal.js` copy + visual hierarchy. Currently uses `🟠` + "signal counts" copy from older design; possible iteration to neutral observable per ADR 013 §AMENDMENT 2026-04-30 anti-RE invariant. Pure UX polish, tactical scope.

3. **Sketch wire accelerated learning to remaining display sites** — `renderIdle.js:292`, `workout.js:53` could also use `_recommendForUser` for consistency. Currently on baseline (display-only, acceptable per §A audit). Optional Bugatti craft polish — flag for chat NEW decision dacă Daniel vrea uniformity.

4. **Pre-Beta LOCK directive next item** — per `[[wiki/concepts/pre-beta-full-scope-lock-v2]]` consult remaining locks pre-Beta launch a-z review.

**Recommendation Co-CTO:** **#2 LOCK 11 F5 AA-Friction Modal UX iteration** — purely tactical, anti-RE compliance check, minimum risk, low surface. Sets stage for clean pre-Beta UX audit. Alternatively, signal Daniel chat dedicated explicit decision for LOCK 10 MMI promote (strategic scope §AR.26).

---

🦫 **Bugatti craft. LOCK 9 LOOP END-TO-END COMPLETE. Engine "I'm wrong se vindeca in 2-3 sesiuni" promise FULFILLED — pattern user-override → upgrade baseline → UI surfaces stronger kg → CDL forensic trail preserved (ADR 011 §append-only). Pure-function paradigm ADR 026 §9 invariant. Idempotency ADR 018 §2 invariant. Anti-paternalism ABSOLUTE preserved (reverted/high-RPE entries excluded — no reinforcement of grind/injury patterns). Tests baseline 3594 → 3639 PASS (+45 NEW), ZERO regression. Schema 657 entries preserved invariant. Voice preservation policy §1 source wiki concept unchanged. Daniel CEO autonomy MAXIMUM 14th consecutive cross-chat trust delegation preserved.**
