# localStorage Keys Complete Audit — 2026-04-26 NIGHT

**Scope:** Toate localStorage usages în src/ vs dataRegistry.js  
**Method:** grep localStorage.* + DB.get/set/remove

---

## Keys folosite prin DB wrapper (src/db.js)

Wrapper: `DB = { get: k => JSON.parse(localStorage.getItem(k)), set: (k,v) => localStorage.setItem(k,JSON.stringify(v)) }`

Keys found via DB.get/set in production:
`logs, weights, kcals, prots, waters, wellbeing, readiness, phase-override, current-kcal, phase-change-date,
bf-override, pr-records, session-burns, muted, notif-enabled, suppl-list, workout-skips, step-streaks, steps-today,
early-stops, peak-hours, session-start-hours, auto-recommendations, applied-recommendations, applied-patterns,
session-draft, coach-decisions, coach-decisions-aggregate, coach-decisions-archive, cdl-patterns,
onboarding-done, sf.userConfig, aa-cooldown-* (dynamic), ex-extra-sets-* (dynamic)`

---

## Keys folosite direct cu localStorage.* (bypass DB wrapper)

| Key | File | Motiv | Status vs Registry |
|---|---|---|---|
| `readiness` | coachContext.js | JSON.parse direct (performance?) | USER_DATA_KEYS ✓ |
| `phase-override` | coachContext.js | JSON.parse direct | USER_DATA_KEYS ✓ |
| `current-kcal` | coachContext.js | Direct read | USER_DATA_KEYS ✓ |
| `logs` | coachContext.js, main.js | Direct read | USER_DATA_KEYS ✓ |
| `weights` | coachContext.js, coachDirector.js | Direct read | USER_DATA_KEYS ✓ |
| `unavailable-equipment` | coachContext.js | Direct read | TEST_RESIDUE_KEYS |
| `prots`, `kcals`, `waters` | coachDirector.js | Direct read | USER_DATA_KEYS ✓ |
| `workout-skips` | coachDirector.js | Direct read | USER_DATA_KEYS ✓ |
| `sf.userConfig` | config/user.js | Direct get+set | USER_DATA_KEYS, NOT in SYNC_KEYS ⚠️ |
| `session-draft` | session.js | localStorage.removeItem | TEST_RESIDUE_KEYS ✓ |
| `applied-patterns` | main.js, adminPrefill.js | removeItem | TEST_RESIDUE_KEYS ✓ |
| `pattern-learning-cache` | main.js, adminPrefill.js | removeItem | TEST_RESIDUE_KEYS ✓ |
| `detected-patterns` | main.js, adminPrefill.js | removeItem | TEST_RESIDUE_KEYS ✓ |
| `bf-override` | weight.js | removeItem | USER_DATA_KEYS ✓ |
| `active-theme` | themeManager.js | get+set | PRESERVE_ON_RESET_KEYS ✓ |
| `device-id` | firebase.js | get+set | PRESERVE_ON_RESET_KEYS ✓ |
| `__suppressFirebaseSyncUntil` | firebase.js | get+set | NOT in registry ⚠️ |
| `cdl-last-demote-date` | autoBackup.js | get+set | NOT in registry ⚠️ |
| `weak-group-cache` | recalibration.js | set | TEST_RESIDUE_KEYS ✓ |
| `response-profile` | recalibration.js | set | TEST_RESIDUE_KEYS ✓ |
| `last-recalibration` | recalibration.js | get+set | USER_DATA_KEYS ✓ |
| `DEV_INJECT_BASELINE` | inject.js | get (dev flag) | NOT in registry (dev-only) |

---

## Drift vs dataRegistry

### Keys NOT în registry

| Key | Usage | Risk |
|---|---|---|
| `__suppressFirebaseSyncUntil` | Firebase sync suppressor | LOW — transient flag, ok not in registry |
| `cdl-last-demote-date` | CDL tier demotion tracking | MEDIUM — should be in registry for wipe on fullReset |
| `DEV_INJECT_BASELINE` | Dev-only flag | LOW — dev only, never in prod data |

### Keys în coachContext.js via localStorage direct (bypass DB)

8 keys sunt citite cu `localStorage.getItem()` direct în loc de `DB.get()`.  
Inconsistency pattern — aceleași keys sunt uneori citite prin DB, alteori direct.  
Risk: DB wrapper patch în firebase.js (coalesce cache) nu interceptează direct reads.

---

## Summary

- Total unique keys în producție: ~45+ (including dynamic)
- Toate cheile principale sunt în dataRegistry sau SYNC_KEYS
- 3 keys notabile absente din registry: `__suppressFirebaseSyncUntil`, `cdl-last-demote-date`, `DEV_INJECT_BASELINE`
- `sf.userConfig` în USER_DATA dar absent SYNC_KEYS — risc cross-device (noted in SYNC audit)
- coachContext.js bypass-ează DB wrapper pe 8 keys — inconsistency minor

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
