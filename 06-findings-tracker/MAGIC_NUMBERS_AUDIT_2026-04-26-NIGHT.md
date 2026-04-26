# Magic Numbers Extended Audit — 2026-04-26 NIGHT

**Scope:** `src/engine/` + `src/util/` — numeric literals, thresholds, time constants  
**Method:** grep comparisons + constants, check named vs inline

---

## What's Already Named (Good)

### src/constants.js — domain constants

```js
SW_KG = 111.4, TW_KG = 101.5   // Start/target weight
START_DATE, TARGET_DATE          // Program dates
DTOT                             // Total program days
KCAL_TARGET = 1800               // Calorie target
PROT_TARGET = 180                // Protein target
PAUSE_COMPOUND = 120             // Pause in seconds
PAUSE_ISO = 75                   // Pause in seconds
EX_SETS, EX_REPS                 // Exercise paramters
```

Domain-specific constants are well-extracted. Good foundation.

---

## Issues Found

### M1 — Readiness thresholds duplicated across 6 files (MEDIUM)

The four readiness score thresholds (85, 70, 55, 40) appear inline in:

| File | Threshold values |
|---|---|
| `src/engine/readiness.js` | 85, 70, 55, 40 (defined as the source of truth in score ranges) |
| `src/engine/coachContext.js:54-57` | 85, 70, 55, 40 (volumeMultiplier computation) |
| `src/engine/ruleEngine.js:27,44` | 40 (rest day trigger), 85 (PR opp in CUT) |
| `src/engine/whyEngine.js:56-60` | 85, 70, 55 (explanation strings) |
| `src/engine/proactiveEngine.js:53,75` | 60 (consecutive low readiness), 85 (PR opp) |
| `src/engine/coachDirector.js:69` | 55 (fatigue index threshold) |

**Risk:** If readiness tier boundaries change (e.g., "easy session" moves from >=40 to >=35), must update 6 files. Drift already present: proactiveEngine uses `< 60` for consecutive-low threshold (not matching the 55 boundary from readiness.js).

**Recommendation:** Extract readiness tier boundaries to `readiness.js` as named exports:
```js
export const READINESS_PR  = 85;
export const READINESS_HIGH = 70;
export const READINESS_MED  = 55;
export const READINESS_LOW  = 40;
```
Then import where used.

---

### M2 — Time constants as inline arithmetic (MEDIUM)

`86400000` (ms per day) appears in 7+ places as inline literal:

| File | Usage |
|---|---|
| `autoAggressionDetection.js:26,95` | ISO week calc, span days |
| `calibration.js:175` | Days since last session |
| `coachDirector.js:293` | Days since last session |
| `muscleMap.js:97` | Cutoff timestamp |
| `patternLearning.js:25` | 56-day lookback |
| `constants.js:6` | DTOT calc |

`3600000` (ms per hour) in `muscleMap.js:81,87`.

`calibration.js:212` uses `30 * 24 * 60 * 60 * 1000` (ms per day calculated inline).

**Recommendation:** Add to constants.js:
```js
export const MS_PER_DAY  = 86400000;
export const MS_PER_HOUR = 3600000;
```
Low priority — all usages are correct, no drift risk since ms-per-day doesn't change.

---

### M3 — proactiveEngine `2.2` protein ratio inline (LOW)

**File:** `src/engine/proactiveEngine.js:21`
```js
const target = bodyweightKg * 2.2;
```

`2.2g/kg` is a specific nutritional target. But `PROT_TARGET = 180` is already in constants.js.

**Issue:** proactiveEngine computes from bodyweight * 2.2 while constants.js uses fixed 180g. Two different protein targets in different modules — inconsistency.

**Risk:** LOW if user is using fixed KCAL_TARGET. But if bodyweight changes significantly, the 2.2 ratio gives different targets than the fixed constant.

---

### M4 — AA detection signal thresholds named inline (ACCEPTABLE)

`autoAggressionDetection.js` uses inline numbers but with comments:
```js
const hardCount = rated.filter(r => r >= 9).length;  // RPE 9=Hard, 10=Very Hard
```

And has named objects for tier mapping. The signal thresholds (e.g., 3+ deviations in 21 days, 60-day deload interval) are defined as local variables with clear naming:
```js
const decayLevels = Math.floor(daysSinceLastSession / 60);
```

**Assessment:** OK — thresholds are local to the detection function and self-documenting in context.

---

### M5 — calibration.js: `90` days and `40` sessions inline (LOW)

**File:** `src/engine/calibration.js:159`
```js
else if (daysSinceFirst < 90 || sessionsCount < 40)  levelName = 'PERSONALIZING';
```

90 days / 40 sessions are calibration tier thresholds. Not exported as constants.

**Risk:** LOW — calibration tier logic is self-contained in calibration.js. No external consumer reads these thresholds directly.

---

### M6 — `56` and `21` day windows inline (LOW)

**patternLearning.js:** `56 * 86400000` — 8-week lookback
**autoAggressionDetection.js:** 21-day window for volume creep signal

These are algorithm parameters inline. Named constants would help documentation but no drift risk (single definition point each).

---

## Summary Table

| ID | Finding | Files | Severity |
|---|---|---|---|
| M1 | Readiness thresholds (85,70,55,40) duplicated across 6 files | coachContext, ruleEngine, whyEngine, proactiveEngine, coachDirector | MEDIUM |
| M2 | `86400000` ms/day inline in 7+ files | engine/ wide | LOW |
| M3 | `2.2` protein ratio vs fixed PROT_TARGET inconsistency | proactiveEngine | LOW |
| M4 | AA detection thresholds inline with comments | autoAggressionDetection | ACCEPTABLE |
| M5 | 90/40 calibration tier thresholds inline | calibration | LOW |
| M6 | 56/21 day algorithm windows inline | patternLearning, autoAggressionDetection | LOW |

**Priority action:** M1 (readiness thresholds) — only medium-severity issue. A `<60` vs `<55` inconsistency already exists between proactiveEngine and readiness.js.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
