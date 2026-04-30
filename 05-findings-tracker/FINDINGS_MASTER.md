# FINDINGS MASTER TRACKER

**See also:** [[INDEX_MASTER]] | [[DECISION_LOG]] | [[HANDOVER_GLOBAL_2026-04-30_evening]]

**Ultima actualizare:** 27 apr 2026 (post TASK #7 friction modal HIGH + E2E fix + 2 fail-uri pre-existing flagged)
**Total findings:** 130 unice (+2 din E2E pre-existing scan)
**Surse istorice (consolidate, accesibile prin git history):** AUDIT_GENERAL_23APR (83) + AUDIT_COACH_JS_24APR (42) + QA live 24 apr seară (3 noi) + QA_MANUAL_25APR_POSTFIX (2 noi) + OPUS_NUCLEAR_AUDIT_25APR (7 arhitecturale) + E2E pre-existing scan 27 apr (2 noi). Source files removed in vault cleanup 2026-04-30 (info catalogată aici + DECISION_LOG; recuperare prin `git log --all --full-history -- "02-audit/<file>"`).

---

## LEGEND

| Simbol | Semnificație |
|--------|-------------|
| 🔴 OPEN | Bug confirmat, nerezolvat |
| 🟢 FIXED | Rezolvat + test |
| 🟡 DEFERRED | Acceptat ca risc sau amânat |
| ⚪ WONTFIX | Respins deliberat |
| 🔵 IN_PROGRESS | Lucru în curs |

**Suffix ID:** `g` = din audit general 23 apr · `c` = din audit coach.js 24 apr · `e` = E2E test desync · fără sufix = FAZA 1 sub-task

---

## CRITICAL (16 total)

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
| **H30c** | **Pattern learning false positives pe cold_start — 88-100% skip rate pe date inexistente** | 🟢 **FIXED** | TASK #30.8 + #30.8.1 (CDL-sourced banner — ADR 011) |
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
| **MP9** | **`toISOString().slice(0,10)` returnează dată UTC — utilizatorii EU (UTC+3) între 00:00-03:00 local primesc data greșită pe log-uri și CDL** | 🟢 **FIXED** | Task #31 |

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

## E2E TEST DESYNC (pre-existing, low priority — flagged 27 apr 2026)

Aceste fail-uri E2E au fost descoperite la rularea locală post TASK #7. Verificat git checkout 1007ffe (commit anterior TASK #7) — fail identic. **Pre-existing, NU regression de la TASK #7 sau alte commits recente sesiunea 27 apr.** Producție GH Pages = HEALTHY (deploy green).

| ID | Test | File:Line | Symptom | Status |
|----|------|-----------|---------|--------|
| **E2E-1e** | "CDL with 5 real entries low adherence shows LOW_ADHERENCE banner" | `tests/e2e/scenarios/calibration-ui.spec.js:193` | Test setează 5 CDL real entries cu adherence scăzută, așteaptă banner "Adherence scăzută". Page actual rendăruiește "OFF – RECUPERARE / DATE INSUFICIENTE" — banner nu apare. CDL setup în test nu trigger-uiește pattern detection în UI. | 🟡 DEFERRED |
| **E2E-2e** | "selectând readiness îl salvează și ascunde selectorul" | `tests/integration.spec.js:97` | Test selectează readiness, așteaptă verdict card cu "Sesiune"/"Readiness"/"🧠". Body actual conține doar "OBIECTIVUL DE AZI / 0 pași". Verdict card nu apare după select. | 🟡 DEFERRED |

**Decizie:** Quality bar bulletproof pe ce construim, NU sweep tot la fiecare commit (Memory #14). Cele 2 fail-uri E2E rămân roșii pe CI dar **NU blochează deploy production** (deploy GH Pages = green pe commit-uri sesiunea 27 apr). Investigare + fix programat pentru sesiune dedicată viitoare cu Opus audit pe E2E suite (memory #23 — audit = exclusiv Opus).

**Reproducere:**
```
cd C:\Users\Daniel\Documents\salafull
npx playwright test tests/e2e/scenarios/calibration-ui.spec.js:193 tests/integration.spec.js:97 --reporter=list
```

**NU sunt cauzate de:**
- TASK #7 (commit d4a167c) — verificat git checkout 1007ffe înainte
- TASK #2 CDL_KEYS migration (52e09f1) — applied-patterns assertion fix-uit separat (commit 8d2dae9)
- AA pipeline LIVE (Sprint A) — fail-uri prezente și înainte

**Ipoteze fix viitor:**
- CDL setup în page.evaluate() poate fi run prea devreme (înainte de sync sau init pattern engine)
- Test environment differs de production prin lipsa unor flag-uri (cold_start logic, calibration tier)
- Possible flaky timing — `waitForTimeout` insuficient

---

## TASK #7 — Friction Modal HIGH Tier (closed 27 apr 2026)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| **T7-1** | **HIGH tier AA detection setează `session.aaBlocked` dar nu există UI care să-l consume — feature invisible la user real** | 🟢 **FIXED** | TASK #7 (commit d4a167c) — friction modal mobile-first, typing data-injected, escalation pattern, state persistence |
| **T7-2** | **ADR 014 §5 typing decision wording static "Am văzut pattern-ul" — vulnerable la reflex paste-buffer după 2-3 expuneri** | 🟢 **FIXED** | TASK #7 — wording update la data-injected dynamic: "continui peste {N} signals în 14 zile" |

**Quality bar TASK #7:**
- 24 tests aaFrictionModal (target era 12+, livrat dublu)
- 559 → 583 tests (+24, zero regresii)
- ADR 013 §6 implementation COMPLETĂ
- Validation pending pe sesiune reală + manual UX testing (mâine PUSH/PULL day)

---

## OPEN BUGS (prioritizate pentru sprint curent)

### 🟢 C11c — Full Reset cache cascade 12+ invalidări (FIXED Task #27)
**Root cause:** `dataCleanup.js` 4 direct `invalidate()` calls bypassed debounce; `window._suppressFirebaseSync` lost on reload → stale Firebase pull restored data after reset.  
**Fix:** (1) Direct calls replaced with `scheduleInvalidation()`. (2) `localStorage.__suppressFirebaseSyncUntil` written before reload, checked in `syncFromFirebase` — survives page reload.

### S1 — ADR 011 schema reconciliation (26 apr) 🟢 FIXED
**Severity:** LOW (doc consistency)
**Source:** Audit retrospectiv post-30.4+30.5 (chat Opus, 26 apr 2026)
**Description:** 3 fields livrate de code dar absente din ADR 011 schema (proposed.proposedSets, outcome.actualExercises, outcome.actualDurationMins). Plus 1 inconsistență internă: cdlBackfill.synthesizeOutcome setează earlyStop:null în loc de false (vs session.js care setează false).
**Fix:** ADR 011 updated cu cele 3 fields + rationale documentat. Reconsideration Trigger #8 adăugat. cdlBackfill earlyStop fix la false. actualDurationMins reconstruit în synthetic entries when ≥2 logs.
**Commits:** TBD (Task #31.5)

### 🟢 H30c — Pattern false positives pe cold_start (FIXED — Task #30.8 + #30.8.1)
**Symptom:** "Marți 88% skip rate", "Miercuri 100% skip rate" după deploy fresh  
**Root cause:** `renderIdle.js:186` bypass la calibration filter — banner citea direct `applied-patterns` (legacy), nu prin CDL.  
**Fix:** Banner acum sourced din `ctx.patterns` (CDL via `analyzeFromCDL`). Suppression când `realCDLCount < 3`. False "Marți 88% skip rate" no longer reproducible.  
**ADR:** 011 — Coach Decision Log as architectural primitive  
**Note:** `applied-patterns` storage key încă există în patternLearning.js pending caller cleanup + Daniel sign-off (TASK #30.9 deferred). Nu afectează H30c closure — bannerul este CDL-sourced.  
**QA context:** [[QA_MANUAL_24APR_2230]], [[QA_MANUAL_25APR_POSTFIX]] (confirmat reproducibil pre-fix)  
**Commits:** TASK #30.8 (renderIdle CDL banner) + #30.8.1 (ctx.patterns CDL unification)

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
| 🟢 FIXED | 24 (FAZA 1: C1g, C2g, C3g, C7g, H27g · FAZA 2: C9g, C1c, C2c, C3c, C4c, C5c, H4c, H6c, H11c, H13g, H14g, H16c, M3g · Task #26: C10c · Task #27: **C11c, H31c, H32c** · Task #31: **MP9** · Task #31.5: **S1** · Task #30.8/8.1: **H30c** · TASK #7: **T7-1, T7-2**) |
| 🔴 OPEN | 0 |
| 🟡 DEFERRED | ~102 (majority — planificate FAZA 3/4 + 2 noi E2E pre-existing) |
| ⚪ WONTFIX | 0 |

**Ultima sesiune QA:** 25 apr 2026 — [[QA_MANUAL_25APR_POSTFIX]]
**Ultima sesiune dev:** 27 apr 2026 — TASK #7 friction modal LIVE + E2E fix + 2 fail-uri pre-existing flagged
**Next sprint:** Cleanup backlog (dead code 3 files + magic numbers) sau bloodwork integration spec
