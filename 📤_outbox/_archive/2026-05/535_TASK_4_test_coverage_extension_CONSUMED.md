# TASK 4 — Test coverage extension pentru TASK 1-3 fix-uri

**Track:** Bugatti pre-commit invariant (test coverage cod nou mandatory).
**Category:** ENG / testing.
**Atomic commit type:** `test(<area>):` separate commit per cluster, sau `test:` umbrella dacă cluster strâns.

## Intent

Per `DECISIONS.md §D-LEGACY-072` Vitest unit + Playwright E2E framework + Bugatti craft `D-LEGACY-089` Quality > Speed: orice cod nou (TASK 1-3) merge cu coverage NEW tests vitest local + (dacă applicable) playwright smoke.

Baseline 3734 PASS preserved invariant. Aim: TASK 1-3 cumulative ajunge la **~3734 + delta** (delta proporțional cu LOC nou + branch coverage).

## Per-task test plan

### TASK 1 (Button wire Import Nutritie)

**Tests minim:**
1. Unit test: butonul în Istoric tab component → click → invocă `triggerMFPImport` (mock).
2. Verify `showToast` NU mai e called (placeholder removed).
3. Smoke playwright (dacă wire-up cross-component): click button → assert flow progresses.

**Files:**
- `src/pages/__tests__/istoric.test.js` (sau equivalent existing test path — CC discovery).

### TASK 2 (Dashboard banner periodic)

**Caz dependent:**

#### Caz A/C (implementat sau fix logic):
1. Unit test: `lastLogTimestamp` 3+ zile vechi → banner show.
2. `lastLogTimestamp` < 3 zile → banner hidden.
3. Dismiss banner → localStorage flag set → re-show după 3 zile fresh threshold.
4. Anti-paternalism check: copy gentle, NU imperative (assertion text content match spec).

#### Caz B/D (no-op sau ambiguity):
NU adăuga teste — flag în raport.

**Files:**
- `src/pages/__tests__/progres.test.js` (sau equivalent).
- Eventual `src/utils/__tests__/banner.test.js`.

### TASK 3 (LOCK 8 KCAL_FLOOR toast)

**Tests minim:**
1. Import dataset cu zile `kcal < 1200` → toast called cu count corect.
2. Import dataset cu toate zile `kcal >= 1200` → toast NU called.
3. Import dataset mixed → toast called count = doar zile sub threshold.
4. Save flow NU blocked în orice scenariu (anti-paternalism assertion).
5. Constant `KCAL_FLOOR` import path corect (NU hardcoded 1200 în code under test).

**Files:**
- `src/pages/__tests__/weight.test.js` sau `src/import/__tests__/mfpImporter.test.js`.

## Discovery (CC autonomous)

1. **Existing test patterns:** `find src/ -name "*.test.js" | head -20` → identifică convențiile de naming + structure (vitest config + jsdom mocks pattern).
2. **Mock conventions:** `grep -rn "vi.mock\|vi.fn" src/pages/__tests__/ | head -10` → mimic existing mock style.
3. **Test runner:** `npm test -- --run` pentru confirma 3734 baseline + delta după additions.

## Reguli invariante

- Test coverage pentru cod nou DOAR (NU touched existing tests).
- Pre-commit hook verde mandatory.
- ZERO `--no-verify`.
- Coverage thresholds existing preserved (NU lower bar pentru a pasa pre-commit).
- Naming: `descrie comportament observabil din perspectiva user/sistem`, NU implementation detail.

## Acceptance criteria

- [x] Tests adăugate pentru TASK 1, 2 (caz applicable), 3.
- [x] `npm test -- --run` PASS toate (delta vs baseline 3734 raportat).
- [x] Pre-commit hook verde.
- [x] Mock conventions match existing patterns src/pages/__tests__/.
- [x] Anti-paternalism check incluse pentru TASK 2, 3.

## Commits (atomic per cluster sau umbrella)

Decide bazat pe LOC delta:
- LOC delta cumulative < 100 → 1 commit umbrella `test: add coverage for pre-beta cap-coada fixes (TASK 1-3)`.
- LOC delta cumulative >= 100 → 3 commits separate `test(istoric):`, `test(progres):`, `test(weight-import):`.

## Raport per task

```
TASK 4 ✓/✗ — <commit hash(es)>
- Tests added: <count delta vs 3734>
- Final test count: <total>
- Coverage per fix: TASK 1 N tests | TASK 2 N | TASK 3 N
- Pre-commit hook: ✓
```
