# TASK 03 — sessionsHistory Persist + IstoricDetail Breakdown LANDED

**Date:** 2026-05-17
**Status:** ✓ Complete

## §1 Commit
- `fd56cbc` feat(react/store+istoric): sessionsHistory exercises breakdown + IstoricDetail render
- Files: 5 changed (+246/-3)

## §2 Tests
- Baseline: 4212 PASS @ `c5a8e36`
- Final: 4220 PASS (+8)
- Istoric.test.tsx: 12 → 16 tests (+4 breakdown describe)
- PostRpe.test.tsx: 18 → 21 tests (+3 breakdown computation)
- TS: 0 errors preserved

## §3 Schema diff
- NEW `SessionExerciseBreakdown` interface (exerciseId, exerciseName, sets[], totalVolume, peakOneRM)
- EXTEND `LastSessionSummary` cu optional `exercises?: SessionExerciseBreakdown[]`
- PostRpe handleSubmit: compute breakdown via Object.entries(history) + planned.exercises[idx] lookup
- IstoricDetail: breakdown table conditional + legacy fallback message backward compat

## §4 Acceptance ✓
- [✓] sessionsHistory entries persist exercises field
- [✓] IstoricDetail renders breakdown table cand prezent
- [✓] PR markers visual cu "PR" label
- [✓] 1RM peak per exercise displayed (Epley formula)
- [✓] Total volume per exercise correct
- [✓] Backward compat legacy fallback render
- [✓] Vitest +8 tests
- [✓] TS strict 0 errors

## §5 Next
task_04 TS strict pass-2 cleanup (any casts + tighter types).
