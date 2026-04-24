# FINDINGS MASTER TRACKER

**See also:** [[INDEX_MASTER]] | [[DECISION_LOG]] | [[QA_MANUAL_24APR_2230]] | [[FAZA_2_FINAL_REPORT]] | [[FAZA_1_FINAL_REPORT]]

**Ultima actualizare:** 25 apr 2026 (post-Task #27)  
**Total findings:** 127 unice (~15 overlap eliminate între cele 2 audituri + 2 noi din QA 25 apr)  
**Surse:** [[AUDIT_GENERAL_23APR]] (83) + [[AUDIT_COACH_JS_24APR]] (42) + QA live 24 apr seară (3 noi) + [[QA_MANUAL_25APR_POSTFIX]] (2 noi) + [[OPUS_NUCLEAR_AUDIT_25APR]] (7 arhitecturale)

---

## LEGEND

| Simbol | Semnificație |
|--------|-------------|
| 🔴 OPEN | Bug confirmat, nerezolvat |
| 🟢 FIXED | Rezolvat + test |
| 🟡 DEFERRED | Acceptat ca risc sau amânat |
| ⚪ WONTFIX | Respins deliberat |
| 🔵 IN_PROGRESS | Lucru în curs |

**Suffix ID:** `g` = din audit general 23 apr · `c` = din audit coach.js 24 apr · fără sufix = FAZA 1 sub-task

---

## CRITICAL (14 total)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| C1g | Calibration COLD_START forever — `ctx.allLogs` deriva din 3 sesiuni în loc de full history | 🟢 FIXED | FAZA 1.5 |
| C2g | Firebase 500 logs limit → data loss silent după ~7 săptămâni | 🟢 FIXED | FAZA 1.8 (500→5000) |
| C3g | `restoreFromBackup` window binding overwritten — naming collision | 🟢 FIXED | FAZA 1.4 |
| C4g | `tierStorage.js` DEAD CODE — arhitectura declarată nu există în runtime | 🟡 DEFERRED | FAZA 4 |
| C5g | `_recommendRaw` scrie DB ca side-effect — re-entrancy unsafe | 🟡 DEFERRED | FAZA 3 |
| C6g | `init()` neawait-uit la nivel modul — erorile devin UnhandledPromiseRejection | 🟡 DEFERRED | FAZA 3 |
| C7g | `cleanDuplicateLogs` key colizionează când `set` lipsește — loguri legitime comasate | 🟢 FIXED | FAZA 1.4 |
| C8g | Sentry `beforeSend` filtrează erorile Firebase — opacity totală pe eșecuri critice | 🟡 DEFERRED | FAZA 3 observability |
| C9g | `sessionBuilder.js` STUB — null export, toate sesiunile prin fallback intern | 🟢 FIXED | FAZA 2 (OPT C) |
| C1c | `endSession` state machine — draft nu e curățat la `cancelWorkout` | 🟢 FIXED | FAZA 2 (C2c) |
| C2c | `cancelWorkout` nu apelează `clearDraft/teardownInactivity/releaseWakeLock` | 🟢 FIXED | FAZA 2 |
| C3c | `rateSession` double-tap duplică ratings/notes (nu guard inflight) | 🟢 FIXED | FAZA 2 |
| C4c | Log schema incompletă — `kg` și `set` lipseau din `confirmReps` | 🟢 FIXED | FAZA 2 |
| C5c | `endSession` șterge automat sesiunile < 5 min — data loss | 🟢 FIXED | FAZA 2 |
| **C10c** | **Director cache invalidation loop — `[Cache] Director session invalidated` × 12+ per page load (Firebase sync scope)** | 🟢 FIXED | Task #26 (suppressInvalidations + debounce 250ms) |
| **C11c** | **Full Reset declanșează cache cascade 12+ invalidări — `dataCleanup.js:174,279,339,433` direct invalidate() + post-reload sync** | 🟢 FIXED | Task #27 (scheduleInvalidation + __suppressFirebaseSyncUntil) |

---

## HIGH (31+ total — selecție cu ID-uri cunoscute)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| H1g | `DB.set` fără try/catch → QuotaExceededError crash write | 🟡 DEFERRED | FAZA 3 |
| H2g | `syncFromFirebase` fără timeout → app hang pe rețea slabă | 🟡 DEFERRED | FAZA 3 |
| H3g | `Object.assign` conflict resolution — local wins silent, remote changes pierdute | 🟡 DEFERRED | FAZA 3 |
| H4g | `ts` collision ms → Set dedup fals pe logs array merge | 🟡 DEFERRED | FAZA 3 |
| H5g | `coachDirector.buildSession` swallow-ează toate erorile engines | 🟡 DEFERRED | FAZA 3 |
| H6g | `patternLearning.analyzeAndApplyPatterns` race condition pe render concurent | 🟢 FIXED | FAZA 2 (H6c) |
| H10g | `SYNC_KEYS` include `session-draft` — race mid-session multi-device | 🟡 DEFERRED | FAZA 3 |
| H13g | `isoWeek` în `responseProfile.computeFrequencySensitivity` spart la year-boundary | 🟢 FIXED | FAZA 2 |
| H14g | `checkRecoveryGroups` primește muscleState în format greșit | 🟢 FIXED | FAZA 2 |
| H27g | Firebase data loss 500→5000 logs (overlap cu C2g) | 🟢 FIXED | FAZA 1.8 |
| H4c | `completedExercises` resetat la `new Set()` la resume — progress pierdut | 🟢 FIXED | FAZA 2 |
| H6c | `analyzeAndApplyPatterns` fără guard inflight — concurrent calls cumulează | 🟢 FIXED | FAZA 2 |
| H11c | `COACH_RELEVANT_KEYS` 5 keys — cache invalidat incorect pe 6+ write paths | 🟢 FIXED | FAZA 2 |
| H16c | `inactivityTimer` nu se re-armează corect după `skipPause` | 🟢 FIXED | FAZA 2 |
| **H30c** | **Pattern learning false positives pe cold_start — 88-100% skip rate pe date inexistente** | 🔴 **OPEN** | Task #28 + #29 |
| **H31c** | **Full Reset nu curăță `applied-patterns` + dinamice (muscle-extra-*, ex-extra-sets-*, aa-cooldown-*, equipment-occupied-session) — registry gap** | 🟢 FIXED | Task #27 (localStorage.clear() whitelist + dataRegistry.js) |
| **H32c** | **"Rerun onboarding" nu funcționează post Full Reset — `onboarding-done` persistă sau re-populat prin Firebase pull** | 🟢 FIXED | Task #27 (__suppressFirebaseSyncUntil survives reload, suppresses stale Firebase pull) |

---

## MEDIUM (27 total — selecție)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| M1g | `patternLearning` SKIP_DAY presupune calendar-week training | 🟡 DEFERRED | FAZA 4 |
| M2g | `brzycki1RM` null pentru reps > 12 → exclude silent din weaknessDetector | 🟡 DEFERRED | FAZA 3 |
| M3g | `stagnationDetector.isoWeek` year-transition edge case | 🟢 FIXED | FAZA 2 |
| M4g | `Date.now() < new Date('2026-07-20')` hardcoded cutoff | 🟡 DEFERRED | FAZA 3 |
| M5g | `estimateTDEE` fallback 14 days când user are 4 weigh-ins în 90 zile | 🟡 DEFERRED | FAZA 3 |
| M6g | `adminPrefill.js` conține user-data Daniel specific — risc la launch | 🟡 DEFERRED | FAZA 4 launch prep |
| M7g | `checkKcalDeficit` threshold 1800 hardcoded | 🟡 DEFERRED | FAZA 4 |
| M8g | `inject.js:184` DB.set triggerează cleanDuplicateLogs la reload | 🟡 DEFERRED | FAZA 3 |
| M9g | `autoBackup.js` — `photos` nu e backup-at | 🟡 DEFERRED | FAZA 4 |
| M10g | `restoreFromBackup` face `localStorage.clear()` — wipe neselective | 🟡 DEFERRED | FAZA 3 |
| M14c | Onboarding 11 ex × 3 sets cu același `session: Date.now()` → cleanDuplicateLogs comasează | 🟡 DEFERRED | FAZA 3 |
| M15c | `getReadinessScore` clamp 10-100 ascunde valori reale negative | 🟡 DEFERRED | FAZA 3 |

---

## LOW (16 total — selecție)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| L1g | `cleanEx` regex nu acoperă diacritice și variante | 🟡 DEFERRED | FAZA 4 |
| L4g | `dateCleanup.restoreRealLogs` hardcoded date (21-22 apr) | 🟡 DEFERRED | FAZA 4 |
| L7g | `initSentry()` fire-and-forget — failure tacit | 🟡 DEFERRED | FAZA 3 observability |
| L8g | Firebase URL hardcodat — risc la project re-deploy | 🟡 DEFERRED | FAZA 4 config |
| L10g | `adminPrefillAll` expus pe `window` — consolă accesibilă la launch | 🟡 DEFERRED | FAZA 4 launch prep |

---

## OPEN BUGS (prioritizate pentru sprint curent)

### 🟢 C11c — Full Reset cache cascade 12+ invalidări (FIXED Task #27)
**Root cause:** `dataCleanup.js` 4 direct `invalidate()` calls bypassed debounce; `window._suppressFirebaseSync` lost on reload → stale Firebase pull restored data after reset.  
**Fix:** (1) Direct calls replaced with `scheduleInvalidation()`. (2) `localStorage.__suppressFirebaseSyncUntil` written before reload, checked in `syncFromFirebase` — survives page reload.

### 🔴 H30c — Pattern false positives pe cold_start (HIGH)
**Symptom:** "Marți 88% skip rate", "Miercuri 100% skip rate" după deploy fresh  
**Root cause suspect:** `renderIdle.js:186` bypass la calibration filter + `patternLearning.js:31-35` numără zile calendar (~8 Marți în 56 zile) nu zile plan  
**QA context:** [[QA_MANUAL_24APR_2230]], [[QA_MANUAL_25APR_POSTFIX]] (re-confirmat)  
**Task:** #28 + #29

### 🟢 H31c — Full Reset incomplet (FIXED Task #27)
**Root cause:** Blacklist approach missing dynamic keys. Fixed with whitelist: `localStorage.clear()` + restore `PRESERVE_ON_RESET_KEYS` = [device-id, active-theme, last-backup].  
**Registry:** `src/util/dataRegistry.js` — central source of truth for all key lists.

### 🟢 H32c — Rerun onboarding down post-reset (FIXED Task #27)
**Root cause:** `window._suppressFirebaseSync` lost on reload → `syncFromFirebase` ran at post-reset load and restored stale Firebase data (onboarding-done, logs, etc.).  
**Fix:** `localStorage.__suppressFirebaseSyncUntil` (10 s window) written before reload, gates `syncFromFirebase` on next page load.

---

## OBS DE INVESTIGAT (non-bug)

| ID | Observație | Status |
|----|-----------|--------|
| OBS-1 | Protein target 242g în UI (expected 180g) — **root cause identificat** în OPUS audit: constants.js PROT_TARGET=180 static vs proactiveEngine.js bodyweight×2.2 dynamic | 🔵 ROOT CAUSE KNOWN — Task #31 |
| OBS-2 | Kcal est. 495 pentru 72 min legs — plauzibil, formula OK în range | 🟢 RESOLVED |
| OBS-3 | Streak "1" după Full Reset (expected 0) | 🔵 INVESTIGATE (parte din H31c) |

---

## FEATURE REQUESTS (din QA 25 apr, queue FAZA 4)

| ID | Descriere | Effort | Tier |
|----|-----------|--------|------|
| FR1 | Săptămânal LMMJVSD clickable pe zile | 2-3 zile | 5 |
| FR2 | "Trend activ" UX color — roșu → verde/neutru pentru progres pozitiv | 10 min | 5 (cost-low, merită imediat) |
| FR3 | Echipament list insuficient — expand EQUIP_MAP + EXERCISES_BY_TYPE | 3-5 zile | 5 |
| FR4 | UX clarity "per sesiune" vs "permanent" pe butoane echipament | 1 zi | 5 |

---

## STATISTICI STATUS

| Status | Count |
|--------|-------|
| 🟢 FIXED | 19 (FAZA 1: C1g, C2g, C3g, C7g, H27g · FAZA 2: C9g, C1c, C2c, C3c, C4c, C5c, H4c, H6c, H11c, H13g, H14g, H16c, M3g · Task #26: C10c · Task #27: **C11c, H31c, H32c**) |
| 🔴 OPEN | 1 (H30c — pattern false positives, target Task #28 + #29) |
| 🟡 DEFERRED | ~100 (majority — planificate FAZA 3/4) |
| ⚪ WONTFIX | 0 |

**Ultima sesiune QA:** 25 apr 2026 — [[QA_MANUAL_25APR_POSTFIX]]  
**Next sprint:** Task #28 + #29 (H30c pattern false positives)
