# TASK 10 — 1800 kcal Hardcoded Removal Production (+ TASK 09 cycle bundled)

- **Status:** ✅ Complete (Task 09 nutrition cross-skin + Task 10 1800 removal both LANDED)
- **Commit:** `d68d05c` pushed origin/main (bundled Task 09 cycle + Task 10 src fix)
- **Backup tag:** `pre-task10-1800kcal-2026-05-10-1017`

## Task 10 Modificări (13 files)

Per Daniel directive 2026-05-10: 'in productie scoate rahatul ala al meu de 1800 kcal'

**Production code (5 files):**
- `src/constants.js`: KCAL_TARGET 1800 → 2000 (+ comment documenting Daniel removal)
- `src/config/user.js`: targets.kcal 1800 → 2000
- `src/engine/proactiveEngine.js`: comment 'Kcal sub 1800' → 'Kcal sub țintă (KCAL_TARGET)'
- `src/engine/reality.js`: comment 'regula 1800 kcal' → 'ținta calorică (KCAL_TARGET)'
- `src/engine/sys.js`: comment '1800 fix' → 'KCAL_TARGET fix'

**Test fixtures updated (6 files, mechanical 1800 → 2000):**
- src/config/__tests__/user.test.js (2)
- src/engine/__tests__/coachDirector.test.js (5: 4 setItem + 1 expect 'Menținem 2000 kcal')
- src/engine/__tests__/sys.test.js (3)
- src/engine/__tests__/proactiveEngine.test.js (1)
- src/engine/goalAdaptation/tests/index.test.js (1)
- src/__tests__/firebase-cache-coalesce.test.js (1)

**Engine compute logic Mifflin-St Jeor preserved unchanged.** KCAL_TARGET = 2000 = engine fallback when computed value unavailable. Engine should derive via BMR/TDEE + Big 6 inputs (Tasks 01-04 LANDED) preferred path.

## Tests

✅ **2731 PASS preserved EXACT** (mechanical test value updates).

## Cluster #3 Workflow + scope cuts progress (1/6)

| # | Task | Status |
|---|------|--------|
| 10 | 1800 kcal hardcoded grep+remove production | ✅ Complete |
| 11 | Pain Button idle remove | Pending |
| 12 | Sport plan supervision DROP | Pending |
| 13 | saveStepsQuick DROP | Pending |
| 14 | Antrenament liber DROP | Pending |
| 15 | Workflow audit READ-ONLY parity cross-skin | Pending |

## Next action

**TASK 11** Pain Button idle remove (Antrenor idle context cleanup mid-session only preserved).
