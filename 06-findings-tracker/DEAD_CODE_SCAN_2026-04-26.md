# Dead Code Scan — 2026-04-26

**Methodology:** For each src/**/*.js, grep exports → check imports across src/ (excluding tests). Flag exports with zero production importers.

**Snapshot:** post-TASK #30.10 + ADR 012. Tests: 422/422.

**IMPORTANT: Daniel reviews each finding. Zero deletions from this scan.**

---

## Findings

### Likely dead — zero production imports

| File | Export | Notes |
|---|---|---|
| `src/config/weights.js` | `DUMBBELL_WEIGHTS` | Exported alias for `EQUIPMENT_WEIGHTS['dumbbell']`. No imports found outside the file. |
| `src/config/weights.js` | `CABLE_WEIGHTS` | Exported alias for `EQUIPMENT_WEIGHTS['bailib_stack']`. No imports found. |
| `src/config/weights.js` | `MACHINE_WEIGHTS` | Exported alias for `EQUIPMENT_WEIGHTS['leg_machine']`. No imports found. |
| `src/engine/alerts.js` | entire file | Intentionally empty module placeholder (comment in file: "kept as module placeholder"). Not imported anywhere. |
| `src/engine/coldStartGuidelines.js` | `generateColdStartSession` | 172 LOC file, only export. No import found in any src/ file. May be planned for FAZA 4 (cold start session generation). |
| `src/engine/muscleMap.js` | `MUSCLE_HEADS` | Constants exported but not imported in any production caller. |
| `src/engine/muscleMap.js` | `VOLUME_LANDMARKS` | Same — exported, zero importers. |
| `src/engine/muscleMap.js` | `getMuscleBalance` | Function exported, zero importers. `getWeeklyVolume` is called internally by `getMuscleBalance` only. |
| `src/engine/muscleMap.js` | `getWeeklyVolume` | Only called from `getMuscleBalance` which itself has zero external importers. |
| `src/engine/recalibration.js` | `maybeRecalibrate` | Full file has zero importers. Neither export is imported in any production file. |
| `src/engine/recalibration.js` | `triggerForceRecalibration` | Same — zero importers. |
| `src/engine/exerciseMapping.js` | `SIMILARITY_RATIO` | The map itself. `getSimilarityMultiplier` uses it internally, but `SIMILARITY_RATIO` is not imported directly by any production file. |
| `src/engine/calibration.js` | `_applyInactivityDecay` | Exported for testing (by convention, `_` prefix = internal). No production importer. Correct — test-only export. |
| `src/util/logNormalize.js` | `normalizeLog` | 19 LOC file, created in FAZA 1.3 as part of schema cleanup. Not imported in any production caller. |
| `src/util/cdlBackfill.js` | `getValidationSamples` | Manual validation helper (console use during TASK #30.3 gate). No production importer. |

### Possibly dead — only test file imports

| File | Export | Notes |
|---|---|---|
| `src/engine/calibration.js` | `_applyInactivityDecay` | Test-only export (by `_` prefix convention). Tests import it directly to unit-test the helper. Correct pattern. |
| `src/util/cdlBackfill.js` | `synthesizeOutcome` | Imported in tests AND in `runBackfill` internally. Actually used. Mark as false positive. |
| `src/util/cdlBackfill.js` | `reconstructContext` | Imported in tests AND internally within cdlBackfill.js. Actually used. False positive. |
| `src/util/cdlBackfill.js` | `inferSessionType` | Imported by tests AND by `coachDirector.js` production code. Active. |

### Active (sampled — not exhaustive)

Confirmed used in production:
- `applyRollingWindow` (calibration.js) → `coachDirector.js`
- `shouldRecalibrate` (calibration.js) → `recalibration.js` (file itself inactive, but function is wired up)
- `computeUserProfile` (responseProfile.js) → `recalibration.js`
- `contextSelectionEnabled` (calibration.js) → `sessionBuilder.js`
- `getMuscleState` (muscleMap.js) → `coachContext.js`
- `EXERCISE_MUSCLES` (muscleMap.js) → `weaknessDetector.js`
- `SIMILAR_EXERCISES`, `getSimilarityMultiplier` (exerciseMapping.js) → `dp.js`
- `calculateFatigueScore` (fatigue.js) → `renderIdle.js`, `dashboard.js`, `plan.js`
- `filterValidLogs` (logFilter.js) → `pages/coach/pr.js`
- `SYS` (sys.js) → `renderIdle.js`, `dashboard.js`, `plan.js`, `logging.js`, `weight.js`, `restTimer.js`, `session.js`, `reality.js`
- `realityEngine` / `getRealityCheck` (reality.js) → `coachDirector.js`, `dashboard.js`
- `recompileWeek` (recompileEngine.js) → `coachDirector.js`

---

## Summary

| Category | Count |
|---|---|
| Likely dead (zero prod importers) | 15 entries across 7 files |
| False positives caught (test-only by design) | 3 |
| High-confidence active | ~20+ confirmed |

---

## Recommendations

**Daniel reviews each finding before any deletion.**

### Easiest wins (confirm then delete)
1. `alerts.js` — file explicitly says it's a placeholder. Verify no dynamic import anywhere, then delete safely.
2. `DUMBBELL_WEIGHTS`, `CABLE_WEIGHTS`, `MACHINE_WEIGHTS` aliases in `config/weights.js` — confirm not used in UI code (grep for these names in HTML/script tags too), then remove the re-exports.
3. `normalizeLog` in `logNormalize.js` — if the file has no other importers and was a FAZA 1.3 artifact never wired in, delete file entirely.

### Needs context before deleting
4. `coldStartGuidelines.js::generateColdStartSession` — this is FAZA 4 planned code. Confirm with Daniel whether to keep as planned implementation or defer differently.
5. `recalibration.js` (`maybeRecalibrate`, `triggerForceRecalibration`) — file exists but is NEVER called. Is this planned for FAZA 3? Keep with TODO comment or delete.
6. `muscleMap.js` dead exports (`MUSCLE_HEADS`, `VOLUME_LANDMARKS`, `getMuscleBalance`, `getWeeklyVolume`) — these may be intended for a muscle-volume analysis feature. Confirm with Daniel.

### Do NOT delete without investigation
7. `getValidationSamples` — manual validation tool (CLI/console use). Safe to keep.
8. `_applyInactivityDecay` — test-only export by convention. Keep.
9. `SIMILARITY_RATIO` — internal detail, `getSimilarityMultiplier` uses it. Could be unexported if desired.

---

## Next steps

This scan is READ-ONLY. No code was modified.

To clean up confirmed dead code: spawn a separate task per file/export with explicit delete instruction from Daniel. Do NOT auto-delete in bulk — each deletion should have a test run gate.
