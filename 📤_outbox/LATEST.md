# LATEST CC — task_03 Engine Wrappers + Coach Voice Phase 3

**Date:** 2026-05-16
**Task:** task_03 Engine Wrappers + Coach Voice library port (Phase B closure)
**Model:** Opus
**Branch:** feature/v3-react-clasic
**Status:** Complete | 2 commits | +32 tests | Push origin DONE | Phase B 100% COMPLETE

---

## §0 Bugatti checklist

- [✓] task_01 + task_02 LANDED (`📤_outbox/LATEST.md` prior 3836 PASS baseline @ `3d7a329`)
- [✓] Backup tag `pre-phase3-task-03-2026-05-16` pushed origin
- [✓] Atomic commits 2x single-concern (Karpathy §3 surgical)
- [✓] Pre-commit hook verde per commit (vitest 3850 + 3868 PASS)
- [✓] TS strict compile clean (1× `@ts-expect-error` la JS engine boundary acceptable — engines NU au .d.ts)
- [✓] Romanian no-diacritics rule preserved (D-LEGACY-064 verified via dedicated test)
- [✓] Anti-fabrication per spec §3 — engine signatures verified pre-write, TODO null fallback acolo unde engines lipsesc (NU fabricate logic)
- [✓] Acceptance criteria §5 task_03 ALL ✓

---

## §1 Commits

| SHA | Subject |
|-----|---------|
| `59e7990` | feat(react/lib): engineWrappers pure-function adapters src/engine/* React-friendly interface |
| `d8ef419` | feat(react/lib): coachVoice library + coachPick deterministic selector port mockup |

---

## §2 Tests

- **Baseline:** 3836 PASS @ `3d7a329` (post task_02)
- **Final:** 3868 PASS (+32 new tests) — within spec range `+25-40`
- **Breakdown delta:**
  - `engineWrappers.test.ts`: 14 NEW tests (4 describe groups — getReadiness 5 + getFatigue 4 + getPRDelta 4 + getTodayWorkout 1 stub)
  - `coachVoice.test.ts`: 18 NEW tests (5 describe groups — library shape 4 + deterministic seed 6 + fallback 3 + Math.random default 2 + no-diacritics 3)
- **All test files:** 195 PASS / 195 (zero regression cross-suite)

---

## §3 Modificări

### Created (4 NEW files)

**Lib adapters:**
- `src/react/lib/engineWrappers.ts` (~150 LOC) — Pure-function adapters wrap `src/engine/*` cu try/catch safe fallback + simplified output types
- `src/react/lib/coachVoice.ts` (~100 LOC) — COACH_VOICE lookup library port verbatim mockup + coachPick deterministic seed selector

**Tests:**
- `src/react/__tests__/lib/engineWrappers.test.ts` (~180 LOC) — 14 tests, vi.mock engine modules pattern
- `src/react/__tests__/lib/coachVoice.test.ts` (~95 LOC) — 18 tests

### engineWrappers.ts wrappers

- `getReadiness(opts)` → `ReadinessOutput | null` wraps `getComputedReadinessScore` + `getReadinessVerdict`
- `getFatigue()` → `FatigueOutput | null` wraps `calculateFatigueScore`
- `getPRDelta(exercise, set, history)` → `PRDelta | null` wraps `detectPR`
- `getTodayWorkout()` → null (Phase 3 STUB cu TODO Phase 5 — `scheduleAdapter.js` NU exports `getTodayPlannedWorkout` yet; aggregate logic posibil sit în `coachDirector` sau `sessionBuilder`)

Try/catch + `console.warn` fallback toate wrappers — daca engine throws (DB unavailable în SSR, invalid input), wrapper returns `null` în loc să blocheze render.

### coachVoice.ts library

**COACH_VOICE structure** (port verbatim mockup `andura-clasic.html#L3796-3842` cu diacritics stripped):
- 8 buckets / 26 strings totali (preset 5 + postUsor 3 + postPotrivit 3 + postGreu 3 + rest 5 + endExercise 4 + endSession nested rating 6 + reflectie 3)
- D-LEGACY-064 enforcement: `â` → `a`, em-dash `—` → standard hyphen `-`

**coachPick(category, rating?, seed?)** selector:
- Deterministic mode cu `seed`: `idx = abs(seed) % pool.length` reproducibility tests + seeded UX continuity
- Default `Math.random()` mode = side-effect la I/O boundary (ADR 026 §9 acceptable caller responsibility)
- Empty string `''` fallback graceful pe invalid category/rating (NU throw)

---

## §4 Issues

**P3 — Spec assumption corrections vs real engines:**

Spec task_03 §2 A assumed naming/signatures that NU match real `src/engine/*` exports. Corrections applied:

| Spec assumption | Real engine signature |
|----------------|----------------------|
| `computeReadiness(userId)` | `getComputedReadinessScore()` (DB-bound, no args) + `getReadinessVerdict(score, opts)` |
| `computeFatigueScore(userId)` | `calculateFatigueScore()` (DB-bound, no args, rich output `{score, key, label, icon, color, recommend, detail}`) |
| `detectPRs(history)` | `detectPR(exercise, set, history)` per-set detection cu 3 PR types |
| `detectWeakness` / `runCoachDirector` | Phase 3 scope NU needed pentru sub-screens stubs — defer Phase 5+ tactical wire dacă necesar |
| `getTodayPlannedWorkout` | `scheduleAdapter.js` NU exports — TODO Phase 5 stub null fallback |

Engines toate DB-bound (use `DB.get('logs'/'readiness'/'wellbeing'/etc)` module). Wrappers `pure-function` only la React boundary — engines internal NU pure. Caller responsibility (Phase C tasks) să invoce via useEffect sau store action, NU în render body.

**P3 — Spec/mockup `endSession` rating taxonomy mismatch:**

Spec §4 B test snippet `coachPick('endSession', 'usoara', 0)` cu rating type `'usoara' | 'normala' | 'grea'` (F12 post-RPE wording per PRIMER §2). Mockup `COACH_VOICE.endSession` keys are `'usor'/'potrivit'/'greu'` (per-set rating taxonomy). Mockup authoritative for COACH_VOICE structure — `coachPick` rating param typed `'usor' | 'potrivit' | 'greu'`. F12 post-RPE wording layer SEPARATE — task_09 post-summary may need aliasing `workoutStore.lastRating` (`'usoara'/'normala'/'grea'`) la `COACH_VOICE.endSession` keys (`'usor'/'potrivit'/'greu'`). Defer la task_09 implementation.

**P3 — TS `@ts-expect-error` la engine imports:**

`src/engine/*` are JS modules fără `.d.ts` declarations. Imports `from '../../engine/X.js'` need `@ts-expect-error` suppression pentru implicit any. Phase 5+ might add `.d.ts` companions sau migrate engines la TS — defer.

---

## §5 Acceptance criteria task_03 §5

- [✓] `engineWrappers.ts` exports 4+ wrapper functions (getReadiness, getFatigue, getPRDelta, getTodayWorkout — 4 exported, getTodayWorkout stub TODO)
- [✓] `coachVoice.ts` exports `COACH_VOICE` lookup + `coachPick()` selector
- [✓] Romanian no-diacritics rule preserved (`/[ăâîșțĂÂÎȘȚ]/.test(allStrings)` = false verified prin dedicated test)
- [✓] Pure-function design: seed-able coachPick, try/catch wrappers safe fallback
- [✓] vitest count: +32 new tests (within spec `+25-40`)
- [✓] TS strict compile clean
- [✓] Pre-commit hook verde

---

## §6 Next action

**Phase B COMPLETE** (task_02 + task_03 both LANDED). Phase C unblock READY.

**Phase C — 6 sub-screen implementations paralel grupabili 2 batches max throughput Daniel multi-terminal:**

**Batch 1 (3 paralel):**
- `task_04_antrenor_home` — Antrenor home full features F2/F4/F6/F8/F10/F11 parity mockup (uses workoutStore pausedSnapshot + lastSession + engineWrappers getReadiness/getFatigue + coachVoice reflectie)
- `task_05_energy_flow` — EnergyCheck + EnergyCause + WorkoutPreview real components (uses workoutStore startSession + coachVoice preset)
- `task_06_problem_flow` — CevaNuMerge + PainButton real components

**Batch 2 (3 paralel după Batch 1 LANDED):**
- `task_07_constraint_flow` — EquipmentSwap + AparateLipsa + ScheduleOverride
- `task_08_workout_state_machine` — Workout real component cu state transitions workoutStore phase machine + per-set logSet
- `task_09_post_rpe_summary` — PostRpe + PostSummary cu PR detection via engineWrappers getPRDelta + coachVoice endSession by rating + streak update

**Sequential safe default single terminal:** `task_04 → task_05 → task_06 → task_07 → task_08 → task_09`.

Phase 3 closure gate (orchestrator §8) când all 9 tasks LANDED + `DECISIONS.md` D021 append + milestone tag `phase-3-antrenor-landed-2026-05-16`.

---

🦫 **Bugatti craft. task_03 Adapters Phase B closure LANDED. Pure-function paradigm (ADR 026 §9) preserved at React boundary. Anti-fabrication discipline — engine signatures verified pre-write, TODO null fallback acolo unde engines lipsesc. Voice preservation D-LEGACY-052 + D-LEGACY-064 mandatory. Co-CTO autonomous task_03 complete cu zero Daniel review. Phase C 6 sub-screen tasks unblocked.**
