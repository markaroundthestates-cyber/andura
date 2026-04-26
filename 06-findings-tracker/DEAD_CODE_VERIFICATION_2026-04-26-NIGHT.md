# Dead Code DEEP Verification — 2026-04-26 Night

**Scope:** Extended verification of each "Likely dead" export from `DEAD_CODE_SCAN_2026-04-26.md`.
**Baseline scan:** 15 entries across 7 files, snapshot post-TASK #30.10.
**Methodology extended:** static imports + dynamic imports + window.* attachments + eval/Function check.

---

## Dynamic Import Check (global)

Dynamic imports found in production code:
- `coachDirector.js:115` → `import('./dp.js')` — dp.js is active
- `main.js:124` → `import('./firebase.js')` — firebase is active
- `modals.js:156` → `import('../../engine/whyEngine.js')` — whyEngine is active
- `dataCleanup.js:277` → `import('../firebase.js')` — firebase is active
- `sentry.js:22` → `import('@sentry/browser')` — external package

**Finding:** Zero dead exports are referenced via dynamic import. No false positives from dynamic paths.

---

## eval / new Function Check

```bash
grep -rn "eval\b|new Function" src/ --include="*.js"
```

**Result:** Zero instances. No eval-based references to track.

---

## window.* Attachment Check

Relevant `window.*` assignments found:
- `firebase.js:183` — `window.syncToFirebase = syncToFirebase`
- `firebase.js:184` — `window.syncFromFirebase = syncFromFirebase`
- `cdlBackfill.js:265` — `window.getValidationSamples = getValidationSamples` ← **KEY FINDING**
- `main.js:5` — `window.__dataRegistryEnabled = true`

---

## Per-Export Deep Classification

### 1. `src/config/weights.js` — `DUMBBELL_WEIGHTS`, `CABLE_WEIGHTS`, `MACHINE_WEIGHTS`

Static import check: zero production importers (only `dp.js` and `reality.js` import from `weights.js`, but they import `roundToEquipmentWeight`, `getPrevWeight`, `EQUIPMENT_WEIGHTS`, `EXERCISE_EQUIPMENT_MAP` — NOT the 3 alias exports).

Dynamic import check: zero references.
Window attachment: zero.
Eval: zero.

**Classification: TRUE_DEAD** — all 3 alias exports (`DUMBBELL_WEIGHTS`, `CABLE_WEIGHTS`, `MACHINE_WEIGHTS`) are unexported aliases for slice of `EQUIPMENT_WEIGHTS` with zero importers. Safe to remove the 3 export lines.

**LOC removable:** 3 lines.

---

### 2. `src/engine/alerts.js` — entire file

Static import check: zero imports of `from './alerts.js'` or `from '../engine/alerts.js'`. The word "alerts" appears in many files but as a local variable/function, NOT as an import from this module.

Dynamic import check: zero references to `alerts.js` in dynamic imports.
Window attachment: zero.
Eval: zero.

**Classification: TRUE_DEAD** — file is a placeholder module with zero importers.

**LOC removable:** entire file (size to verify, but file is trivially small based on prior scan).

---

### 3. `src/engine/coldStartGuidelines.js` — `generateColdStartSession`

Static import check: zero production importers found (grep found only the self-definition in the file).
Dynamic import check: zero.
Window attachment: zero.
Eval: zero.

**Classification: TRUE_DEAD** (technically) — but this is **planned future code** (FAZA 4: onboarding cold start session generation). The function is 172 LOC of real implementation.

**Recommendation:** Do NOT delete. Mark with `// FAZA-4: not yet wired up` comment. Keep as forward implementation. Classify as **DEFERRED** rather than TRUE_DEAD.

---

### 4. `src/engine/muscleMap.js` — `MUSCLE_HEADS`, `VOLUME_LANDMARKS`, `getMuscleBalance`, `getWeeklyVolume`

Static import check:
- `MUSCLE_HEADS`: used internally in muscleMap.js itself (by `getMuscleState`, `getWeeklyVolume`) — zero external importers.
- `VOLUME_LANDMARKS`: zero references outside muscleMap.js.
- `getMuscleBalance`: zero external importers.
- `getWeeklyVolume`: zero external importers (called only by `getMuscleBalance`).

Note: `getMuscleState` IS imported externally (by `coachContext.js`). `EXERCISE_MUSCLES` IS imported externally (by `weaknessDetector.js`). These active exports depend internally on `MUSCLE_HEADS`. So `MUSCLE_HEADS` is used internally but not importable-dead.

Dynamic import check: zero.
Window attachment: zero.
Eval: zero.

**Classification:**
- `MUSCLE_HEADS`: **FALSE_POSITIVE** — used internally by active functions `getMuscleState` and `getWeeklyVolume`. Cannot be removed.
- `VOLUME_LANDMARKS`: **TRUE_DEAD** — defined, exported, zero references anywhere. Pure dead export.
- `getMuscleBalance`: **TRUE_DEAD** — function + its dependency `getWeeklyVolume` have zero external callers.
- `getWeeklyVolume`: **TRUE_DEAD** — only called by `getMuscleBalance` which itself is dead.

**LOC removable:** `VOLUME_LANDMARKS` constant + `getWeeklyVolume` function + `getMuscleBalance` function = ~50+ LOC.

---

### 5. `src/engine/recalibration.js` — `maybeRecalibrate`, `triggerForceRecalibration`

Static import check: zero production importers. File is self-contained.
Dynamic import check: zero. The word "recalibration" appears in `calibration.js` constants (strings) and in `dataRegistry.js` (`last-recalibration` localStorage key string) — not as an import.
Window attachment: zero.
Eval: zero.

**Classification: TRUE_DEAD** — entire file has zero importers. Both exports are dead.

**Note:** `calibration.js::shouldRecalibrate` is listed as "active" in original scan (imported by `recalibration.js`) — but since `recalibration.js` itself is dead, this is a circular inactive graph. `shouldRecalibrate` is effectively dead too through this path.

**LOC removable:** entire file (~60 LOC).

---

### 6. `src/engine/exerciseMapping.js` — `SIMILARITY_RATIO`

Static import check: zero direct external importers. `dp.js` imports `getSimilarityMultiplier` from this file, NOT `SIMILARITY_RATIO` directly.

Internal usage: `SIMILARITY_RATIO` is used by `getSimilarityMultiplier` internally within `exerciseMapping.js`.

**Classification: FALSE_POSITIVE** — `SIMILARITY_RATIO` is an internal implementation detail of `getSimilarityMultiplier` which IS externally used (by `dp.js`). The export keyword on `SIMILARITY_RATIO` is unnecessary but removing it is cosmetic, not a dead code issue.

**Recommendation:** Could remove `export` keyword (making it unexported), but leave as-is given low risk. Not TRUE_DEAD.

---

### 7. `src/engine/calibration.js` — `_applyInactivityDecay`

Static check: zero production importers (test-only by `_` prefix convention).
**Classification: TEST_ONLY** — correct pattern. Keep.

---

### 8. `src/util/logNormalize.js` — `normalizeLog`

Static import check: zero production importers.
Dynamic import check: zero references to `logNormalize.js` in dynamic imports.
Window attachment: zero.
Eval: zero.

**Classification: TRUE_DEAD** — created in FAZA 1.3, never wired in. Entire file (19 LOC) is dead.

**LOC removable:** entire file (19 LOC).

---

### 9. `src/util/cdlBackfill.js` — `getValidationSamples`

Static import check: zero production importers (only self-definition).

**KEY FINDING:** `cdlBackfill.js:265` attaches to `window`:
```js
window.getValidationSamples = getValidationSamples;
```
This means `getValidationSamples` IS accessible at runtime via browser console / DevTools. It's a manual validation helper exposed on window intentionally.

**Classification: FALSE_POSITIVE** — window-attached console tool. NOT dead. Keep and document.

---

## Updated Classification Table

| File | Export | Original Classification | Deep Classification | Action |
|---|---|---|---|---|
| `config/weights.js` | `DUMBBELL_WEIGHTS` | Likely dead | **TRUE_DEAD** | Remove export line |
| `config/weights.js` | `CABLE_WEIGHTS` | Likely dead | **TRUE_DEAD** | Remove export line |
| `config/weights.js` | `MACHINE_WEIGHTS` | Likely dead | **TRUE_DEAD** | Remove export line |
| `engine/alerts.js` | entire file | Likely dead | **TRUE_DEAD** | Delete file |
| `engine/coldStartGuidelines.js` | `generateColdStartSession` | Likely dead | **DEFERRED** (FAZA-4) | Add comment, keep |
| `engine/muscleMap.js` | `MUSCLE_HEADS` | Likely dead | **FALSE_POSITIVE** | Keep (internal dep) |
| `engine/muscleMap.js` | `VOLUME_LANDMARKS` | Likely dead | **TRUE_DEAD** | Remove |
| `engine/muscleMap.js` | `getMuscleBalance` | Likely dead | **TRUE_DEAD** | Remove (+ `getWeeklyVolume`) |
| `engine/muscleMap.js` | `getWeeklyVolume` | Likely dead | **TRUE_DEAD** | Remove |
| `engine/recalibration.js` | `maybeRecalibrate` | Likely dead | **TRUE_DEAD** | Delete file (both exports dead) |
| `engine/recalibration.js` | `triggerForceRecalibration` | Likely dead | **TRUE_DEAD** | Delete file |
| `engine/exerciseMapping.js` | `SIMILARITY_RATIO` | Likely dead | **FALSE_POSITIVE** | Keep (internal impl detail) |
| `engine/calibration.js` | `_applyInactivityDecay` | Test-only | **TEST_ONLY** | Keep |
| `util/logNormalize.js` | `normalizeLog` | Likely dead | **TRUE_DEAD** | Delete file |
| `util/cdlBackfill.js` | `getValidationSamples` | Likely dead | **FALSE_POSITIVE** (window-attached) | Keep, document |

---

## Summary by Category

| Category | Count | LOC removable |
|---|---|---|
| TRUE_DEAD | 9 entries (across 5 files/actions) | ~80-100 LOC |
| DEFERRED (planned future code) | 1 | 0 |
| FALSE_POSITIVE | 3 | 0 |
| TEST_ONLY | 1 | 0 |

**New finding vs original scan:** `getValidationSamples` reclassified from "Likely dead" → FALSE_POSITIVE due to `window.getValidationSamples` attachment at cdlBackfill.js:265.

---

## Cleanup Recommendations

### High confidence — safe to delete (each requires individual Daniel confirm + test run gate)

1. **`src/engine/alerts.js`** — delete file. Zero importers, zero window/dynamic refs. Placeholder file.
2. **`src/util/logNormalize.js`** — delete file. Zero importers. FAZA 1.3 artifact never wired.
3. **`src/engine/recalibration.js`** — delete file. Zero importers. Both exports dead.
4. **`src/config/weights.js`** — remove 3 alias export lines (lines 86-88). Keep file, keep `EQUIPMENT_WEIGHTS`.
5. **`src/engine/muscleMap.js`** — remove `VOLUME_LANDMARKS`, `getWeeklyVolume`, `getMuscleBalance` (~50 LOC). Keep `MUSCLE_HEADS` (internal dep), `getMuscleState`, `EXERCISE_MUSCLES`.

### Do NOT delete

6. **`coldStartGuidelines.js`** — FAZA 4 planned code. Add `// FAZA-4` comment, keep.
7. **`SIMILARITY_RATIO`** — internal implementation detail of active `getSimilarityMultiplier`. Keep.
8. **`getValidationSamples`** — window-attached console tool. Keep and document explicitly.
9. **`_applyInactivityDecay`** — test-only by convention. Keep.

---

## Estimated Total Cleanup (if all TRUE_DEAD removed)

- Files deleted: 3 (`alerts.js`, `logNormalize.js`, `recalibration.js`)
- Lines removed in-place: ~56 LOC (`weights.js` 3 lines + `muscleMap.js` ~53 LOC)
- Total LOC reduction: ~80-100 LOC
- Risk level: LOW (all zero-importer confirmed by static + dynamic + window scan)

---

*Audit completed: 2026-04-27. Extended methodology: static + dynamic + window + eval. 15 entries re-classified. 9 TRUE_DEAD confirmed. 3 FALSE_POSITIVE caught (including new window-attachment finding for `getValidationSamples`).*
