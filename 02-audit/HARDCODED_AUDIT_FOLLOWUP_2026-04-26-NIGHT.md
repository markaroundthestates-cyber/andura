# Hardcoded Values Audit — Follow-up 2026-04-26 Night

**Scope:** Full inventory of Daniel-specific and config-specific hardcoded values in `src/` post-FAZA 1.2.
**Method:** grep + manual source read of `config/user.js`, `constants.js`, `sys.js`, `firebase.js`, `dp.js`, `coachContext.js`, `proactiveEngine.js`.
**Status categories:** ✅ CENTRALIZED | ⚠️ SCATTERED | ❌ INLINE_ONLY

---

## 1. User Identity

| Value | Where | Status | Notes |
|---|---|---|---|
| `'Daniel'` (name) | `config/user.js:5` | ✅ CENTRALIZED | Via `USER_DEFAULTS.bio.name`, readable via `getUserConfig()` |
| `'users/daniel'` (Firebase path) | `config/user.js:19`, `firebase.js:7` | ⚠️ DUPLICATED | Defined in user.js AND re-declared as `USER_PATH` export in firebase.js:7 — two sources of truth |
| `'Daniel'` (dp.js comment) | `dp.js:56`, `dp.js:65` | ⚠️ COMMENT | Inline comments reference Daniel by name — not functional, but makes module identity-specific |

**Finding:** Firebase USER_PATH duplicated across `config/user.js` and `firebase.js`. If the Firebase path ever changes, both need updating. `firebase.js` should import from `config/user.js`.

---

## 2. Biometric Constants

| Value | Where | Status | Notes |
|---|---|---|---|
| `height: 183` | `config/user.js` | ✅ CENTRALIZED | Read via `getUserConfig().bio.height` → `SYS.HEIGHT` |
| `age: 30` | `config/user.js` | ✅ CENTRALIZED | Read via `getUserConfig().bio.age` → `SYS.AGE` |
| `startBF: 23` | `config/user.js` | ✅ CENTRALIZED | Used by `sys.js::getBF()` for fat-loss tracking |
| `startKg: 111.4` | `config/user.js` + `constants.js:1` (`SW_KG`) | ⚠️ DUPLICATED | Defined in user.js, also exported as `SW_KG` from constants.js — two sources |
| `targetKg: 101.5` | `config/user.js` + `constants.js:2` (`TW_KG`) | ⚠️ DUPLICATED | Same duplication as startKg |
| `currentKgFallback: 110.4` | `config/user.js` | ✅ CENTRALIZED | Fallback only when no weight log entry |

**Finding:** `SW_KG` and `TW_KG` in `constants.js` duplicate the values from `user.js`. These should be derived from `getUserConfig()` rather than independently declared.

---

## 3. Nutrition Targets

| Value | Where | Status | Notes |
|---|---|---|---|
| `kcal: 1800` | `config/user.js:14` | ✅ CENTRALIZED | Primary definition |
| `KCAL_TARGET = 1800` | `constants.js:7` | ⚠️ DUPLICATED | Re-declared in constants.js — two sources of truth. Used by 8+ production modules. |
| `protein: 180` | `config/user.js:15` | ✅ CENTRALIZED | Primary definition |
| `PROT_TARGET = 180` | `constants.js:8` | ⚠️ DUPLICATED | Re-declared in constants.js |
| `isDeficit: kcalTarget < 2200` | `coachContext.js:47` | ❌ INLINE_ONLY | 2200 is not sourced from any config. Represents "BMR-level" threshold but is hardcoded inline. Zero relation to KCAL_TARGET or user config. |
| `const target = bodyweightKg * 2.2` | `proactiveEngine.js:21` | ⚠️ IMPLICIT | Protein-per-kg multiplier (2.2g/kg). Not a named constant. Could be user-configurable (active vs very active). |
| Sub-1800 alert threshold | `proactiveEngine.js:159` | ⚠️ IMPLICIT | References 1800 in comment, threshold is KCAL_TARGET-derived, but not explicit |

**Key finding — `isDeficit` threshold:** `kcalTarget < 2200` at `coachContext.js:47` has no config origin. It represents a minimum adequate intake level (above which is "not deficit"). This is domain-appropriate but should be a named constant (e.g., `DEFICIT_THRESHOLD_KCAL = 2200`).

---

## 4. Phase / Timeline Dates

| Value | Where | Status | Notes |
|---|---|---|---|
| `START_DATE = new Date('2026-04-17')` | `constants.js:3` | ❌ INLINE_ONLY | Hardcoded in constants.js — no user.js origin |
| `TARGET_DATE = new Date('2026-07-20')` | `constants.js:4` | ⚠️ PARTIAL | Hardcoded in constants.js; also in `config/user.js:16` as `phaseTargetDate: '2026-07-20'` — two sources |
| `'20 iulie'` (UI strings) | `dashboard.js:194`, `dashboard.js:209`, `dashboard.js:531`, `weight.js:88`, `reality.js:78`, `sys.js:91/94/137` | ❌ INLINE_ONLY | Romanian-language date string appearing 7+ times in UI/logic. Not derived from TARGET_DATE. If date changes → 7 manual string updates |
| `isBeforeJuly20_2026` | `coachContext.js:46` | ⚠️ IMPLICIT | Boolean derived from `TARGET_DATE` — correct approach. But flag name bakes in the specific date. |

**Key finding — `'20 iulie'` duplication:** The literal string `'20 iulie'` appears in at least 7 places in UI code and sys.js comments. These are NOT derived from `TARGET_DATE` or `config/user.js`. If the phase endpoint changes, these are manual find-and-replace targets.

**Recommendation:** Define `TARGET_DATE_LABEL = '20 iulie'` (or derive from `TARGET_DATE` via locale formatter) in constants.js and reference throughout.

---

## 5. Physiology Formula Constants (sys.js)

| Value | Where | Status | Notes |
|---|---|---|---|
| BF% formula: `1.20 * bmi + 0.23 * AGE - 16.2` | `sys.js:27` | ❌ INLINE_ONLY | Deurenberg formula for males. Coefficients are formula-specific (not calibration constants), but the sex assumption ("males") is implicit. |
| Activity multiplier: `bmr * 1.55` | `sys.js:70` | ❌ INLINE_ONLY | Hard-coded "moderately active" TDEE multiplier. Not user-configurable. |
| Fat caloric density: `kgLost * 7700` | `sys.js:77` | ❌ INLINE_ONLY | Standard 7700 kcal/kg fat assumption. Scientifically appropriate constant, but unnamed. |
| Strength-to-bodyweight ratio: `avgW / kg > 0.18` | `sys.js:33` | ❌ INLINE_ONLY | Used for "muscular build correction" in BF% calc. Threshold derived from shoulder press performance. Daniel-specific empirical value. |
| Muscle-loss ratio: `kgLost * 0.75` (fat) | `sys.js:39` | ❌ INLINE_ONLY | 75% fat / 25% muscle assumption during deficit. Not named, not configurable. |
| Protein per kg: `bodyweightKg * 2.2` | `proactiveEngine.js:21` | ❌ INLINE_ONLY | 2.2g/kg protein target multiplier. Not derivable from user config. |

**Note:** The Deurenberg formula coefficients are scientifically standard — naming them doesn't add clarity. The truly risky ones are the empirical thresholds (0.18 ratio, 0.75 fat-loss fraction) that are Daniel-specific calibrations embedded silently in production logic.

---

## 6. Exercise-Specific Calibrations (dp.js)

| Value | Where | Status | Notes |
|---|---|---|---|
| Initial weight suggestions (Hammer Curl: 28, Preacher: 30, etc.) | `dp.js:60–70` | ❌ INLINE_ONLY | Default starting weights for dp (progression) engine. Not user-configurable. Daniel's actual weights embedded as code. |
| `// Daniel: Lat Pulldown 64, Cable Row 72...` | `dp.js:56` | ❌ COMMENT | Non-functional but identity-specific documentation. |
| `// Daniel face 20-22kg` | `dp.js:65` | ❌ COMMENT | Same pattern. |

**Note:** dp.js starting weights are functionally necessary defaults but are calibrated to Daniel's current capacity. A multi-user scenario would require user-configurable starting weights.

---

## 7. Program Structure (constants.js)

| Value | Where | Status | Notes |
|---|---|---|---|
| Full `PROG` weekly split | `constants.js` | ✅ CENTRALIZED | Single definition, referenced by multiple pages |
| `EX_SETS`, `EX_REPS` maps | `constants.js` | ✅ CENTRALIZED | Single definition |
| `PAUSE_COMPOUND = 120, PAUSE_ISO = 75` | `constants.js` | ✅ CENTRALIZED | Named constants, single source |
| `COMPOUND_EX` list | `constants.js` | ✅ CENTRALIZED | Used for rest-time discrimination |

**Status: OK.** Program structure is fully centralized in `constants.js`. No scatter found.

---

## Summary by Priority

### Priority 1 — Two sources of truth (critical if config changes)

1. **`users/daniel` path** — defined in `config/user.js:19` AND `firebase.js:7`. Firebase should import from user config.
2. **`SW_KG` (111.4) and `TW_KG` (101.5)** — defined in `config/user.js` AND `constants.js`. constants.js should derive from user config.
3. **`KCAL_TARGET` and `PROT_TARGET`** — same pattern as SW_KG/TW_KG. constants.js should derive from user config rather than re-declare.
4. **`TARGET_DATE`** — in `constants.js` AND `config/user.js`. One source should be removed.

### Priority 2 — Inline values that should be named

5. **`kcalTarget < 2200`** in `coachContext.js:47` — name as `DEFICIT_FLOOR_KCAL = 2200`.
6. **`'20 iulie'` literal strings** — 7+ occurrences in UI/logic. Should be derived from `TARGET_DATE`.
7. **`bmr * 1.55`** — name as `ACTIVITY_MULTIPLIER = 1.55`.
8. **`kgLost * 7700`** — name as `KCAL_PER_KG_FAT = 7700`.

### Priority 3 — Daniel-specific empirical values (low risk, identity-bound)

9. **`avgW / kg > 0.18`** — shoulder press / bodyweight ratio threshold. Acceptable as calibration constant.
10. **`kgLost * 0.75`** — fat-loss fraction. Acceptable, but should be named.
11. **`bodyweightKg * 2.2`** — protein multiplier. Reasonable constant, should be named.
12. **dp.js starting weights** — Daniel-calibrated starting values. Acceptable for single-user app, document explicitly.

### Not a problem (correctly centralized)

- All bio data (`height`, `age`, `startBF`, `startKg`, `targetKg`) — centralized in `config/user.js`
- Full program structure (`PROG`, `EX_SETS`, `EX_REPS`) — centralized in `constants.js`
- Rest times (`PAUSE_COMPOUND`, `PAUSE_ISO`) — centralized in `constants.js`

---

## LOC Impact if Priority 1 Fixed

Fixing Priority 1 (deduplication) would require:
- `firebase.js:7` — remove `USER_PATH` declaration, import from `config/user.js`
- `constants.js:1-2` (`SW_KG`, `TW_KG`) — derive from `getUserConfig()` (or remove and update importers)
- `constants.js:7-8` (`KCAL_TARGET`, `PROT_TARGET`) — same
- `constants.js:4` (`TARGET_DATE`) — align with `config/user.js.phaseTargetDate`

This is a medium-complexity refactor (~8 files to update importers) with low risk (constants don't change at runtime).

---

*Audit completed: 2026-04-27. Methodology: grep + source read. Scope: all src/ .js files excluding tests. 12 distinct hardcoded value categories identified. 4 Priority-1 duplication issues, 7 Priority-2 naming issues, 3 Priority-3 calibration constants.*
