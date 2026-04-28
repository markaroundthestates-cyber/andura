# COACH.JS SPLIT PLAN

## META

- **Dată planning:** 2026-04-24
- **LOC analizate:** 1477 / 1477 (fișier integral)
- **Fișier sursă:** `src/pages/coach.js`
- **Module propuse:** 9 (orchestrator + 8 submodule)
- **Confidence:** 82%
- **Autor plan:** consultant arhitect (sesiune planificare — ZERO cod scris)
- **Audit de referință:** `docs/AUDIT_COACH_JS_24APR.md` (2120 LOC)

---

## ANALIZA CURENTĂ

### Domenii identificate în coach.js

| # | Domeniu | LOC aprox. | Funcții principale |
|---|---------|-----------|--------------------|
| 1 | **Render coach idle (home)** | ~240 (200–436) | `renderCoachIdle`, `renderLastSessionMemory`, `renderFatigueScore`, `renderTodayAlerts`, `tickSess` (stub) |
| 2 | **Session lifecycle** | ~120 (438–482, 663–757, 1171–1216) | `startSession`, `endSession`, `cancelWorkout`, `closeSummary`, `finishEarly`, `confirmEarlyStop`, `skipExercise` |
| 3 | **Rest timer + inactivity** | ~90 (53–107, 176–181, 617–646) | `getSmartPause`, `startPause`, `stopPause`, `skipPause`, `setupInactivity`, `teardownInactivity` |
| 4 | **Per-set logging** | ~130 (562–615, 953–971, 1010–1013) | `setDone`, `confirmReps`, `selectRPE` (no-op), `renderSessLog`, `adjSessionReps`, `updateExCard` |
| 5 | **Kg-edit overlay** | ~45 (908–951) | `editSessionKg`, `adjSessionKg`, `confirmSessionKg`, `confirmEditKg` |
| 6 | **Rating + summary + confetti** | ~150 (748–906) | `showSessionRating`, `rateSession`, `showSessionSummary`, `launchConfetti`, `closeSummary` |
| 7 | **PR detection + wall** | ~110 (1143–1287) | `extractAndSavePRs`, `cleanFakeLogs`, `renderPRWall`, `togglePRWall` |
| 8 | **Muscle balance + weight reminder** | ~55 (1084–1140) | `checkMuscleBalance`, `checkWeightReminder` |
| 9 | **Readiness modal** | ~30 (1289–1317) | `showReadinessModal`, `selectReadiness` |
| 10 | **Skip / Alternative / Equipment modals** | ~110 (1319–1465) | `showSkipModal`, `confirmSkip`, `showAlternativeModal`, `selectAlternative`, `markEquipmentUnavailable`, `markOccupied` |
| 11 | **Why-engine modal** | ~30 (1422–1451) | `showWhyForExercise` |
| 12 | **Wake lock** | ~12 (1467–1477) | `requestWakeLock`, `releaseWakeLock` |
| 13 | **Draft auto-save** | ~12 (65–76) | `saveDraft`, `clearDraft` |
| 14 | **Off-day quest (steps)** | ~25 (1218–1241) | `saveStepsQuick` |
| 15 | **Pure helpers** | ~70 (40–50, 183–197, 973–1082) | `formatSetsReps`, `getGroupColor`, `getExGroup`, `getTodayExercises`, `getDisplayTime`, `calcAccurateTime`, `getAdaptiveTime`, `beepStart`, `resetNotes`, `toggleMute`, `toggleExList` |

Total: ~1400 LOC active + ~77 LOC whitespace/comments = 1477.

---

### State variables — cine folosește ce

Toate provin din `state` singleton (`../state.js`). Legenda: **R** = read, **W** = write.

| State variable | Accesată de | Ops |
|----------------|-------------|-----|
| `state.sessActive` | session lifecycle, draft, inactivity, rating, rest timer, logging | R/W |
| `state.sessStart` | session lifecycle, draft, logging, rating, cancel, endSession, confirmEarlyStop | R/W |
| `state.sessLog` | logging, rating, endSession, draft, cancel | R/W |
| `state.currentEx` | logging, rest timer, inactivity, kg-edit, rating, skipExercise, alternative | R/W |
| `state.currentSet` | logging, kg-edit, updateExCard | R/W |
| `state.sessRepsInput` | logging (adjSessionReps, confirmReps, updateExCard) | R/W |
| `state.sessionKgOverride` | kg-edit, logging (confirmReps read) | R/W |
| `state.activeNotes` | logging (confirmReps), resetNotes | R/W |
| `state.completedExercises` | session lifecycle, logging, skipExercise, updateSessionProgress | R/W |
| `state.sessionTotalExercises` | session lifecycle, renderIdle, progress | R/W |
| `state.sessKcalBurn` | session lifecycle (startSession init) | W only |
| `state.dropSetUsedThisSession` | startSession (reset) | W only |
| `state.earlyStopReason` | startSession, endSession, confirmEarlyStop | R/W |
| `state.sessTimer` | startSession, endSession, cancelWorkout | R/W |
| `state.pauseTimer` | rest timer | R/W |
| `state.pauseLeft` | rest timer | R/W |
| `state.pauseTotal` | rest timer | R/W |
| `state.lastPauseEndedAt` | rest timer, inactivity, cancel, end, logging (confirmReps) | R/W |
| `state.isMuted` | toggleMute, startSession (init), logging | R/W |

Niciun câmp de state nu este deținut exclusiv de un singur modul → `state.js` rămâne sursa de adevăr; modulele toate îl importă direct. **Nu introducem pass-by-arg între module.**

---

### Module-local state (scăpat din `state.js`)

| Variabilă | Declarată | Folosită de | Observație |
|-----------|-----------|-------------|------------|
| `_sessionCache` | line 17 | renderIdle (W), getTodayExercises (R), showWhyForExercise (R) | Exportat pe `window._directorCache` (linia 29) |
| `_cachedDirectorSession` | line 32 | alias legacy — scris în renderIdle, citit în getTodayExercises și showWhyForExercise | Trebuie extras într-un modul partajat |
| `wakeLock` | line 33 | requestWakeLock (W), releaseWakeLock (R/W), startSession | Module-local |
| `inactivityTimer` | line 34 | setupInactivity, teardownInactivity | Module-local |
| `exListExpanded` | line 159 | toggleExList, renderCoachIdle | Module-local (UI toggle) |
| `prWallExpanded` | line 1244 | togglePRWall, renderPRWall | Module-local (UI toggle) |

**→ toate aceste variabile trebuie relocate într-un modul `coach/state.js` partajat sau co-locate cu consumatorul primar.**

---

### Globale atașate pe `window`

| Global | Scris de | Citit de | Dispoziție după split |
|--------|----------|----------|------------------------|
| `window._directorCache` | coach.js:29 | (consum extern posibil — devtools) | păstrat în `coach/state.js` |
| `window._coachInactivityHandler` | setupInactivity:92 | teardownInactivity:101 | păstrat în `coach/restTimer.js` |
| `window._pendingRatingSummary` | showSessionRating:822 | onclick în HTML (liniile 846,850,854) | păstrat în `coach/rating.js` — contract DOM |
| `window._kgOvVal` | editSessionKg:912, adjSessionKg:936 | confirmSessionKg:942 | păstrat în `coach/logging.js` (kg-edit sub-modul) |
| `window.speechSynthesis` | — (API browser) | cancelWorkout, endSession | N/A |
| `window.renderDash` | main.js (via Object.assign) | closeSummary, endSession, cleanFakeLogs, confirmSkip | N/A — citit ca late-binding |
| `window.closeDayFromDash` | main.js | closeSummary:756 | N/A — citit ca late-binding |

---

### Event listeners inventory

| Listener | Attach site | Cleanup site | Module propus |
|----------|-------------|--------------|---------------|
| `click, touchstart, keydown, mousemove` (inactivity) | `setupInactivity` (94) via `document.addEventListener` | `teardownInactivity` (103) | `coach/restTimer.js` |
| `navigator.wakeLock.request('screen')` | `requestWakeLock` (1474) | `releaseWakeLock` (1468) | `coach/session.js` |
| `setInterval(tickSess, 1000)` | `startSession` (453, 469) | `cancelWorkout` (665), `endSession` (685) | `coach/session.js` |
| `setInterval(...)` pause timer | `startPause` (630) | `stopPause` (646) | `coach/restTimer.js` |
| `setTimeout(inactivity fire)` | `setupInactivity` handler (84) | reset on each user action | `coach/restTimer.js` |
| Modal click-to-dismiss | `showSkipModal` (1332), `showAlternativeModal` (1395) | când modalul e scos din DOM | `coach/modals.js` |
| `requestAnimationFrame(draw)` | `launchConfetti` (807) | auto-stop după 120 frames | `coach/rating.js` |

---

### Cross-cutting concerns (tăie prin mai multe domenii)

1. **Phase-aware logic (CUT vs NON-CUT)** — folosit în:
   - `renderCoachIdle` (liniile 308–310 — citește `phase-override`, compară cu 2026-07-20)
   - `formatSetsReps` (apelat din `renderCoachIdle` cu `_isInCut` ca argument)
   - `showWhyForExercise` (1436–1438 — calcul identic)
   → Propunere: helper pur `isInCutPhase()` în `coach/util.js`.

2. **Calibration level gating (`_sessionCache.get()?.calibrationLevel.patternsEnabled`)** — folosit în:
   - `renderCoachIdle` (315–316)
   - `getTodayExercises` (980–987)
   - `showWhyForExercise` (1440)
   → Depinde direct de `_sessionCache`; consolidat prin `coach/state.js`.

3. **`renderCoachIdle()` ca hook de refresh** — apelat după aproape orice mutație DB:
   - `toggleExList` (167), `selectReadiness` (1315), `saveStepsQuick` (1240), `confirmSkip` (1344),
   - `markEquipmentUnavailable` (1419), `markOccupied` (1464), `cancelWorkout` (679), `closeSummary` (752),
   - `cleanFakeLogs` (1166), `endSession` mic (698).
   → Toate modulele trebuie să poată invoca `renderCoachIdle` → import din `coach/renderIdle.js` sau re-export din `coach.js`. Risc de ciclu → vezi RISCURI.

4. **DB reads repetate (phase, patterns, unavailable-equipment, pr-records)** — nu extragem cache; DB.get e ieftin. Doar semnalăm.

5. **Voice feedback (`speak`)** — împrăștiat prin module (startSession, startPause, updateExCard, endSession, skipExercise, cancelWorkout). Nu merită propriu modul — fiecare consumator îl importă direct din `../ui/ui.js`.

6. **Toast & beep** — la fel: importate direct în fiecare modul consumator.

---

## ARHITECTURA PROPUSĂ

### Module targets (9 fișiere: 1 orchestrator + 8 submodule)

---

#### 1. `src/pages/coach.js` — orchestrator (rescris, ~90 LOC)

- **Responsabilitate:** punct unic de re-export pentru consumatorii externi (`main.js`, `onboarding.js`, `nav.js`, `plan.js`). Zero logică.
- **Funcții incluse:** niciuna (toate re-exportate).
- **State necesar:** nimic.
- **Imports externe:** toate submodulele `./coach/*.js`.
- **Exports:** tot ce era exportat înainte — identic, same signatures:
  - `renderCoachIdle, checkWeightReminder, closeSummary` (used by main.js:11)
  - `cleanFakeLogs, extractAndSavePRs, finishEarly, confirmEarlyStop, saveStepsQuick, getGroupColor, toggleMute, skipPause, resetNotes, renderPRWall, togglePRWall, toggleExList, showWhyForExercise` (main.js:28)
  - `setDone, confirmReps, selectRPE, startSession, cancelWorkout, skipExercise, adjSessionReps, editSessionKg, confirmEditKg, adjSessionKg, confirmSessionKg, rateSession, endSession` (main.js:29-31)
  - `showReadinessModal, selectReadiness, showSkipModal, confirmSkip, showAlternativeModal, selectAlternative, markEquipmentUnavailable, markOccupied` (main.js:32)
  - `getDisplayTime` (plan.js:6)
  - `updateExCard, updateSessionProgress, renderSessLog, getExGroup, getTodayExercises, calcAccurateTime, getAdaptiveTime, checkMuscleBalance, requestWakeLock, releaseWakeLock` (interne + safety)
- **LOC estimat:** 90.

---

#### 2. `src/pages/coach/state.js` — module-local shared state (~50 LOC)

- **Responsabilitate:** container pentru state-ul ce nu aparține `state.js` dar e partajat între submodule coach. TTL cache + singleton pentru sesiunea Director.
- **Funcții incluse:** niciuna (doar obiecte exportate).
- **Exports:**
  - `sessionCache` — obiect cu `get()`, `set(s)`, `invalidate()` (azi `_sessionCache` linia 17)
  - `getCachedDirector()` / `setCachedDirector(s)` — wrapper în jurul variabilei legacy `_cachedDirectorSession`
  - `wakeLockRef` (obiect `{ current: null }`) — folosit în `coach/session.js`
  - `uiToggleFlags` — `{ exListExpanded: {}, prWallExpanded: false }`
- **Imports externe:** niciunul.
- **Side effects:** atașează `window._directorCache = sessionCache` la import (păstrează contractul public de debugging).
- **LOC estimat:** 50.

---

#### 3. `src/pages/coach/util.js` — helpers puri (~130 LOC)

- **Responsabilitate:** funcții pure / helper simple fără state modul. Convertori, display helpers, lookup-uri.
- **Funcții incluse:**
  - `formatSetsReps(rawStr, exName, isInCut)` — 40–50
  - `getGroupColor(g)` — 183–186
  - `getExGroup(ex)` — 997–1008
  - `isInCutPhase()` — **NOU** (extract din renderIdle 308–310 + showWhyForExercise 1436–1438; elimină duplicarea)
  - `getDisplayTime(prog)` — 1025–1039
  - `calcAccurateTime(prog)` — 1041–1072
  - `getAdaptiveTime(dayLabel)` — 1074–1080
  - `getTodayExercises()` — 973–995 (citește `sessionCache` din `./state.js`)
  - `beepStart()` — 197
  - `resetNotes()` — 161 (super mic, dar imp. din confirmReps)
- **State necesar:** `sessionCache` pentru `getTodayExercises`.
- **Imports externe:** `DB, cleanEx` din `../../db.js`; `COMPOUND_EX` din `../../constants.js`; `state` din `../../state.js`; `beep` din `../../ui/ui.js`; `sessionCache` din `./state.js`.
- **Exports:** toate cele de mai sus.
- **LOC estimat:** 130.

---

#### 4. `src/pages/coach/renderIdle.js` — render coach home (~400 LOC)

- **Responsabilitate:** randează ecranul idle (pre-start), card memorie ultima sesiune, fatigue score, PR wall, alerte, readiness card. Cel mai mare modul.
- **Funcții incluse:**
  - `renderCoachIdle()` — 200–436 (principala; async; apelează coachDirector)
  - `renderLastSessionMemory(dayLabel)` — 110–156
  - `renderFatigueScore(elId)` — 187–192
  - `renderTodayAlerts()` — 194 (stub)
  - `tickSess()` — 196 (stub — dar apelat de `setInterval` în startSession; păstrat ca no-op)
  - `toggleExList(dayIdx)` — 164–167
  - `toggleMute()` — 169–174 (touch DOM → rămâne cu render idle care îl citește)
  - `checkMuscleBalance()` — 1084–1114 (apelată DOAR din renderCoachIdle la 296)
  - `checkWeightReminder()` — 1116–1140 (independent de sessActive, banner pe coach screen)
  - `saveStepsQuick()` — 1218–1241 (off-day quest → declanșează renderCoachIdle)
- **State necesar (din `state.js`):** niciunul direct (doar `state.js` citit transitiv prin alte module).
- **State local (din `coach/state.js`):** `sessionCache`, `setCachedDirector`, `uiToggleFlags.exListExpanded`, `uiToggleFlags.prWallExpanded` (pentru renderPRWall prin import).
- **Imports externe:**
  - `DB, $, tod, cleanEx` din `../../db.js`
  - `PROG, EX_SETS, COMPOUND_EX` din `../../constants.js`
  - `DP, AA, SYS` (engines)
  - `calculateFatigueScore` — `../../engine/fatigue.js`
  - `getTodayReadiness, getReadinessVerdict, getReadinessScore, READINESS_LABELS` — `../../engine/readiness.js`
  - `analyzeAndApplyPatterns` — `../../engine/patternLearning.js`
  - `coachDirector` — `../../engine/coachDirector.js`
  - `formatSetsReps, getExGroup, isInCutPhase` din `./util.js`
  - `renderPRWall` din `./pr.js`
  - `state` din `../../state.js`
- **Exports:** `renderCoachIdle, renderLastSessionMemory, toggleExList, toggleMute, checkMuscleBalance, checkWeightReminder, saveStepsQuick` (+ re-export `tickSess` pentru session.js).
- **LOC estimat:** 400.

---

#### 5. `src/pages/coach/session.js` — session lifecycle + wake lock + draft (~280 LOC)

- **Responsabilitate:** start/end/cancel sesiune, resume draft, finish early, skip exercise, wake lock, tick cronometru sesiune.
- **Funcții incluse:**
  - `startSession()` — 438–482
  - `endSession()` — 682–746
  - `cancelWorkout()` — 663–680
  - `closeSummary()` — 748–757
  - `finishEarly()` — 1171–1190
  - `confirmEarlyStop(reason)` — 1192–1216
  - `skipExercise()` — 648–661
  - `updateSessionProgress()` — 1015–1023
  - `saveDraft()` — 65–75
  - `clearDraft()` — 76
  - `requestWakeLock()` — 1471–1477
  - `releaseWakeLock()` — 1467–1469
  - `tickSess()` — 196 (dar import-at din renderIdle.js; alternativ mutat aici)
- **State necesar (din `state.js`):** `sessActive, sessStart, sessLog, sessTimer, currentEx, currentSet, sessKcalBurn, dropSetUsedThisSession, earlyStopReason, completedExercises, sessionTotalExercises, isMuted, lastPauseEndedAt` (R/W).
- **State local (din `coach/state.js`):** `wakeLockRef`.
- **Imports externe:**
  - `DB, $, tod` din `../../db.js`
  - `syncToFirebase` din `../../firebase.js`
  - `PROG, EX_SETS` din `../../constants.js`
  - `SYS` (kcal computed), `DP` — engines
  - `toast, speak, beep` din `../../ui/ui.js`
  - `renderCoachIdle` din `./renderIdle.js` ← **potențial ciclu** (vezi RISCURI)
  - `updateExCard, renderSessLog` din `./logging.js`
  - `getTodayExercises` din `./util.js`
  - `startPause, stopPause, hidePauseScreen, setupInactivity, teardownInactivity, getSmartPause` din `./restTimer.js`
  - `showSessionRating` din `./rating.js`
  - `state` din `../../state.js`
- **Exports:** `startSession, endSession, cancelWorkout, closeSummary, finishEarly, confirmEarlyStop, skipExercise, updateSessionProgress, requestWakeLock, releaseWakeLock, saveDraft, clearDraft, tickSess`.
- **LOC estimat:** 280.

---

#### 6. `src/pages/coach/restTimer.js` — pause timer + inactivity (~100 LOC)

- **Responsabilitate:** smart rest pause între seturi și auto-pauză la inactivitate (5+ min).
- **Funcții incluse:**
  - `getSmartPause(ex)` — 53–62
  - `startPause(sec, nextEx)` — 617–644
  - `stopPause()` — 646
  - `skipPause()` — 176–181
  - `setupInactivity()` — 79–97
  - `teardownInactivity()` — 98–107
- **State necesar (din `state.js`):** `pauseTimer, pauseLeft, pauseTotal, sessActive, currentEx, lastPauseEndedAt`.
- **State local (din `coach/state.js`):** `inactivityTimer` (sau module-local direct — e variabilă mică).
- **Imports externe:**
  - `$` din `../../db.js`
  - `DP, SYS` — engines
  - `COMPOUND_EX, PAUSE_COMPOUND, PAUSE_ISO` din `../../constants.js`
  - `toast, beep, beepAlert, speak, showPauseScreen, hidePauseScreen` din `../../ui/ui.js`
  - `updateExCard` din `./logging.js` ← **potențial ciclu soft**
  - `state` din `../../state.js`
- **Exports:** `getSmartPause, startPause, stopPause, skipPause, setupInactivity, teardownInactivity` + re-export `hidePauseScreen` ca utility (sau import direct din ui.js din consumatori).
- **LOC estimat:** 100.

---

#### 7. `src/pages/coach/logging.js` — per-set logging + kg-edit + update card (~280 LOC)

- **Responsabilitate:** UI-ul per-set (butonul „SET DONE", input reps, RPE stub), randare log sesiune, overlay editare kg, card exercițiu curent.
- **Funcții incluse:**
  - `setDone()` — 562–567
  - `confirmReps()` — 569–609
  - `selectRPE(rpe)` — 615 (no-op, dar export păstrat)
  - `adjSessionReps(d)` — 1010–1013
  - `renderSessLog()` — 953–971
  - `updateExCard()` — 484–560
  - `editSessionKg()` — 908–933
  - `adjSessionKg(delta)` — 935–939
  - `confirmSessionKg()` — 941–949
  - `confirmEditKg()` — 951 (alias → confirmSessionKg)
- **State necesar (din `state.js`):** `currentEx, currentSet, sessRepsInput, sessionKgOverride, activeNotes, sessStart, sessLog, completedExercises, sessionTotalExercises, lastPauseEndedAt`.
- **State local:** `window._kgOvVal` (păstrat ca global — contract cu HTML onclick).
- **Imports externe:**
  - `DB, $, tod` din `../../db.js`
  - `EX_SETS` din `../../constants.js`
  - `DP, AA, SYS` — engines
  - `toast, beep, beepDone, speak` din `../../ui/ui.js`
  - `getSmartPause, startPause` din `./restTimer.js` ← **potențial ciclu cu restTimer (vezi RISCURI)**
  - `endSession` din `./session.js` ← **ciclu cu session**
  - `getTodayExercises, getExGroup, resetNotes` din `./util.js`
  - `saveDraft` din `./session.js` (sau `./util.js`)
  - `state` din `../../state.js`
- **Exports:** `setDone, confirmReps, selectRPE, adjSessionReps, renderSessLog, updateExCard, editSessionKg, adjSessionKg, confirmSessionKg, confirmEditKg, getExGroup`.
- **LOC estimat:** 280.

---

#### 8. `src/pages/coach/rating.js` — session rating + summary + confetti (~150 LOC)

- **Responsabilitate:** modal rating (easy/normal/hard) la end-of-session, modal summary (min/sets/kcal + PR list), confetti.
- **Funcții incluse:**
  - `showSessionRating(summaryData)` — 813–861
  - `rateSession(rating, summaryData)` — 863–906
  - `showSessionSummary(data)` — 759–781
  - `launchConfetti()` — 783–811
- **State necesar (din `state.js`):** `sessStart` (pentru note retroactive).
- **State local:** `window._pendingRatingSummary` (contract cu HTML).
- **Imports externe:**
  - `DB, tod, $` din `../../db.js`
  - `syncToFirebase` din `../../firebase.js`
  - `extractAndSavePRs, cleanFakeLogs` din `./pr.js`
  - `clearDraft` din `./session.js`
  - `hidePauseScreen` din `../../ui/ui.js`
  - `state` din `../../state.js`
- **Exports:** `showSessionRating, rateSession, showSessionSummary` (și launchConfetti dacă e nevoie extern; momentan nu).
- **LOC estimat:** 150.

---

#### 9. `src/pages/coach/pr.js` — PR detection + PR wall (~110 LOC)

- **Responsabilitate:** extract PR-uri din logs, curăță logs invalide, randare card PR pe coach idle.
- **Funcții incluse:**
  - `extractAndSavePRs()` — 1143–1155
  - `cleanFakeLogs()` — 1158–1168
  - `renderPRWall()` — 1252–1287
  - `togglePRWall()` — 1246–1249
- **State necesar:** niciun state.js direct.
- **State local (din `coach/state.js`):** `uiToggleFlags.prWallExpanded`.
- **Imports externe:**
  - `DB, $` din `../../db.js`
  - `toast` din `../../ui/ui.js`
  - `filterValidLogs` din `../../util/logFilter.js`
  - `renderCoachIdle` din `./renderIdle.js` ← **ciclu cu renderIdle**
- **Exports:** `extractAndSavePRs, cleanFakeLogs, renderPRWall, togglePRWall`.
- **LOC estimat:** 110.

---

#### 10. `src/pages/coach/modals.js` — user-initiated modals (~220 LOC)

- **Responsabilitate:** toate modalele declanșate de user din HTML (readiness, skip day, alternative equipment, why).
- **Funcții incluse:**
  - `showReadinessModal()` — 1289–1309
  - `selectReadiness(value)` — 1311–1317
  - `showSkipModal()` — 1319–1334
  - `confirmSkip(reason)` — 1336–1346
  - `showAlternativeModal(exerciseName)` — 1348–1397
  - `selectAlternative(original, alternative)` — 1399–1410
  - `markEquipmentUnavailable(exerciseName)` — 1412–1420
  - `markOccupied(exerciseName)` — 1453–1465
  - `showWhyForExercise(exerciseName)` — 1422–1451
- **State necesar (din `state.js`):** `sessActive, currentEx` (pentru markOccupied branch + selectAlternative).
- **State local (din `coach/state.js`):** `getCachedDirector()` pentru showWhyForExercise.
- **Imports externe:**
  - `DB` din `../../db.js`
  - `PROG` din `../../constants.js`
  - `toast` din `../../ui/ui.js`
  - `saveReadiness, READINESS_LABELS` din `../../engine/readiness.js`
  - `renderCoachIdle` din `./renderIdle.js` ← **ciclu**
  - `updateExCard` din `./logging.js` ← **ciclu**
  - `state` din `../../state.js`
  - Lazy dynamic import: `../engine/whyEngine.js` (rămâne dynamic pentru lazy load)
- **Exports:** toate cele 9 de mai sus.
- **LOC estimat:** 220.

---

### Module index (recapitulativ)

```
src/pages/
├── coach.js                      (orchestrator + re-exports, ~90 LOC)
└── coach/
    ├── state.js                  (module-local shared state, ~50 LOC)
    ├── util.js                   (pure helpers, ~130 LOC)
    ├── renderIdle.js             (coach home render, ~400 LOC)
    ├── session.js                (lifecycle + draft + wake lock, ~280 LOC)
    ├── restTimer.js              (pause + inactivity, ~100 LOC)
    ├── logging.js                (per-set + kg-edit + update card, ~280 LOC)
    ├── rating.js                 (rating + summary + confetti, ~150 LOC)
    ├── pr.js                     (PR detect + wall, ~110 LOC)
    └── modals.js                 (user modals, ~220 LOC)
```

**Total LOC post-split:** ~1810 (+23% față de 1477 datorită delimitărilor — module headers, imports duplicate, re-exports).

---

### Dependency graph (after split)

```
                         ┌─────────────┐
                         │  coach.js   │  (orchestrator)
                         └──────┬──────┘
                                │ re-exports all
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
  renderIdle.js             session.js               modals.js
       │                        │                        │
       │                        │                        │
       ├──► util.js ◄───────────┤                        │
       │                        │                        │
       ├──► pr.js               ├──► logging.js          │
       │    │                   │    │                   │
       │    └──► renderIdle.js  │    ├──► restTimer.js   │
       │         (CYCLE A)      │    │                   │
       │                        │    └──► session.js     │
       │                        │         (CYCLE B)      │
       │                        │                        │
       │                        ├──► restTimer.js        │
       │                        │    │                   │
       │                        │    └──► logging.js     │
       │                        │         (CYCLE C)      │
       │                        │                        │
       │                        ├──► rating.js           │
       │                        │    │                   │
       │                        │    └──► pr.js, session │
       │                        │                        │
       │                        └──► util.js             │
       │                                                 │
       │                                                 ├──► renderIdle.js
       │                                                 │    (CYCLE D)
       │                                                 └──► logging.js
       │                                                      (CYCLE E)
       │
       └──► state.js (shared module-local state — no deps)
```

**5 cicluri identificate — toate între module peer în submodul.** Node/browser ES modules suportă cicluri dacă importurile sunt folosite doar în corpul funcțiilor (nu la module-load time). Verificare necesară.

---

## RISCURI IDENTIFICATE

### Risc 1 — **Cicluri de import între submodule**
- **Descriere:** 5 cicluri detectate mai sus (A–E), toate concentrate în jurul `renderCoachIdle` și `updateExCard` ca "refresh hooks" apelate din toate părțile.
- **Mitigation strategy:**
  - Toate funcțiile în cauză (renderCoachIdle, updateExCard, endSession) sunt apelate **la runtime, în corpul altor funcții**, nu la top-level → ciclul ES module e tolerat.
  - Alternativ safer: expunere prin `window.renderCoachIdle` (deja pattern existent în `main.js` via `Object.assign(window, { renderCoachIdle, ... })`) — consumatorii interni să apeleze `window.renderCoachIdle` în loc de import direct. **Acest lucru elimină ciclurile la cost de type-safety.**
  - Decizie recomandată: import direct cu acceptarea ciclurilor; dacă build rupe (`npm run build` raportează warning), fallback la `window.*`.
- **Verification după split:**
  - `npm run build` — trebuie să termine fără `ReferenceError: Cannot access 'X' before initialization`.
  - `npm run test:all` — testele existente verifică la runtime flow-urile complete.

### Risc 2 — **Contract DOM + HTML onclick preservation**
- **Descriere:** HTML-ul (`index.html`) apelează funcții via `onclick="functionName(...)"`. `main.js` face `Object.assign(window, {...})` cu 20+ funcții. Dacă o funcție își schimbă signature sau dispare, butoanele nu mai răspund silently.
- **Mitigation strategy:**
  - Orchestrator `coach.js` re-exportă **toate** numele de funcții exact cum erau — `main.js` nu se modifică.
  - `window._kgOvVal`, `window._pendingRatingSummary`, `window._coachInactivityHandler`, `window._directorCache` rămân atașate la încărcarea modulelor.
- **Verification după split:**
  - `grep -oE 'onclick="[^"]+"' index.html | sort -u` — lista completă de handlere; fiecare trebuie să se regăsească fie pe `window`, fie pe re-exportul coach.js consumat de main.js.
  - Manual QA: click pe fiecare buton din flow-ul coach idle + sesiune.

### Risc 3 — **State sharing peste module boundaries**
- **Descriere:** `state` singleton din `../state.js` e importat în fiecare modul. Fiecare modul citește/scrie aceleași câmpuri. Dacă ordinea de load (side effects de import) schimbă initializarea, apar bug-uri subtile.
- **Mitigation strategy:**
  - `state.js` nu are side effects la import (verificat: `export const state = { ... }`).
  - Niciun submodul coach nu trebuie să scrie în state la top-level — doar în corpul funcțiilor.
- **Verification după split:**
  - Search regex: `^state\.` la nivel de modul (exclude în funcții) — trebuie să fie zero.
  - Test: `startSession → 3 sets → rateSession → summary` produce aceleași loguri ca pre-split.

### Risc 4 — **Pierdere side-effect `window._directorCache` assignment**
- **Descriere:** Linia 29 atașează `window._directorCache = _sessionCache` la load-ul modulului. Dacă `coach/state.js` nu e niciodată importat (module tree-shaking), globala nu mai există.
- **Mitigation strategy:**
  - `coach.js` orchestrator face `import './coach/state.js'` ca side-effect (fără destructuring) — garantează execuția.
  - Alternativ: `coach/state.js` e importat de `renderIdle.js` și `util.js` oricum → va fi evaluat.
- **Verification după split:**
  - DevTools: `window._directorCache` nu este `undefined` după load.
  - `_sessionCache.invalidate()` apelat din alt tab (sau după ceas) invalidează corect.

### Risc 5 — **Regresie pe `renderCoachIdle` — call graph mare**
- **Descriere:** `renderCoachIdle` este apelată din 10 locuri diferite. Post-split se află în `renderIdle.js`. Dacă un modul care o apelează are imports incorecte sau lazy-binding-ul window.renderCoachIdle e stale, refresh-urile nu mai funcționează → UI se "îngheață" până la navigate.
- **Mitigation strategy:**
  - Toate import-urile de `renderCoachIdle` stau în `import { renderCoachIdle } from './renderIdle.js'` (nu lazy).
  - `main.js` continuă să facă `Object.assign(window, { renderCoachIdle })` — late-binding funcționează.
- **Verification după split:**
  - E2E smoke: `selectReadiness → ecranul trebuie să re-randeze cu card-ul readiness nou`.
  - E2E smoke: `markOccupied → exercițiul apare opacizat`.
  - E2E smoke: `saveStepsQuick → bara de progres se actualizează`.

### Risc 6 — **Timer leaks la cancelWorkout (bug existent neatins)**
- **Descriere:** Audit C2 (docs/AUDIT_COACH_JS_24APR.md:481) raportează că `cancelWorkout` NU cheamă `teardownInactivity()` și NU cheamă `clearDraft()`. Dacă mutăm logica fără să observăm bug-ul existent, îl perpetuăm.
- **Mitigation strategy:**
  - Split-ul e **refactor pur** — nu atingem bug-uri comportamentale. Le raportăm în meta-observații.
  - Nu adăugăm teardownInactivity în cancelWorkout în acest PR. Un PR separat rezolvă C2 după split.
- **Verification după split:**
  - Snapshot audit C2 înainte/după split — comportament identic (bug prezent în ambele).

### Risc 7 — **PR detection side-effect order**
- **Descriere:** `rateSession` apelează secvența: `extractAndSavePRs()` → `cleanFakeLogs()` → `syncToFirebase()` (linii 894–898). `cleanFakeLogs()` cheamă la rândul ei `extractAndSavePRs()` intern (linia 1159). Dacă ordinea de import face ca `cleanFakeLogs` să fie imported înainte de `extractAndSavePRs`, unele bundlere pot eșua.
- **Mitigation strategy:**
  - Ambele funcții stau în `pr.js` → fără cross-module — ordine garantată.
  - Păstrăm apelul dublu (aparent redundant) — audit-ul nu a flagat această redundanță și schimbarea ei ține de un alt PR.
- **Verification după split:**
  - Test: `rateSession` produce `pr-records` identic cu pre-split (fixture test).

### Risc 8 — **`_cachedDirectorSession` legacy alias poate rămâne desincronizat**
- **Descriere:** Variabila de la linia 32 e scrisă doar în `renderCoachIdle` (264) și citită în `getTodayExercises` (980) + `showWhyForExercise` (1425, 1440). Dacă `renderIdle.js` nu o exportă corect prin `state.js`, cele două consumatoare primesc `null` → patterns bypass-at necorect.
- **Mitigation strategy:**
  - `state.js` expune `getCachedDirector() / setCachedDirector(s)` ca **accesori explicit**; niciun modul nu stochează un snapshot local.
  - Test unit în `util.test.js`: `setCachedDirector(fake) → getTodayExercises` respectă `patternsEnabled: false`.
- **Verification după split:**
  - Manual: log sesiune cu calibration banner activă → `getTodayExercises` NU aplică skip pattern când `calibrationLevel.patternsEnabled === false`.

### Risc 9 — **Inline HTML în `renderCoachIdle` (240 LOC de template strings)**
- **Descriere:** Funcția conține ~240 LOC de string templates (linii 222–409). Nu poate fi împărțită în sub-funcții fără apel nou. Mutarea mecanică e OK, dar orice typo în template e greu de detectat.
- **Mitigation strategy:**
  - Copy-paste verbatim, fără split ulterior în acest PR.
  - Validare post-split: `diff` pe output-ul HTML (dacă putem capta cu JSDOM în test).
- **Verification după split:**
  - Snapshot test (dacă există vitest + jsdom): `renderCoachIdle()` output DOM identic.
  - Manual QA: coach idle screen arată identic cu pre-split (compară screenshot).

### Risc 10 — **Tree-shaking / dead-code elimination agresiv**
- **Descriere:** `coach.js` orchestrator face re-export din 9 submodule. Dacă bundler-ul (Vite) decide că un submodul nu e folosit de consumator direct (ex. util.js), poate elimina side-effects critice.
- **Mitigation strategy:**
  - Niciun submodul coach nu trebuie să aibă side-effects critice la load (cu excepția `coach/state.js` care atașează `window._directorCache`).
  - `coach.js` importă `./coach/state.js` ca side-effect explicit (`import './coach/state.js'` fără destructuring).
- **Verification după split:**
  - După build: grep `window._directorCache` în bundle-ul produs.

---

## ORDINEA SPLIT-ULUI (pentru executor)

Principiu: **module fără dependențe interne primele, orchestrator ultimul**. La fiecare pas validăm build + teste înainte de pasul următor.

### Pas 1 — `coach/state.js` (cel mai simplu, zero deps)
- **De ce primul:** nu depinde de niciun alt submodul. Conține doar obiecte + `window._directorCache` assignment.
- **Ce mută:** `_sessionCache` (17–28), `_cachedDirectorSession` (32), `wakeLock` (33), `inactivityTimer` (34) + accesori.
- **ATENȚIE:** `coach.js` încă trebuie să funcționeze — la acest pas, coach.js **importă** din `./coach/state.js` și șterge declarațiile locale. Nu mută încă nicio funcție.
- **Test imediat:** `npm run build`, apoi rulează app-ul — `window._directorCache` trebuie să fie definit.

### Pas 2 — `coach/util.js` (pure helpers)
- **De ce al doilea:** fără dependențe interne (doar `./state.js` pentru `getTodayExercises`).
- **Ce mută:** `formatSetsReps, getGroupColor, getExGroup, getDisplayTime, calcAccurateTime, getAdaptiveTime, getTodayExercises, beepStart, resetNotes` + helper NOU `isInCutPhase()`.
- **Test imediat:** `npm run test -- util.test` (dacă există), apoi `plan.js` folosește `getDisplayTime` — verifică plan page se randează.

### Pas 3 — `coach/pr.js` (PR detection)
- **De ce al treilea:** folosit de rating.js și renderIdle.js — scoatem din calea lor.
- **Ciclu:** `pr.js → renderIdle.js` — **încă nu rezolvat**, pentru că renderIdle nu e extras. Temporar: `cleanFakeLogs` apelează `window.renderCoachIdle()` (late-binding) în loc de import.
- **Ce mută:** `extractAndSavePRs, cleanFakeLogs, renderPRWall, togglePRWall` + `prWallExpanded` (mută în `./state.js`).
- **Test imediat:** `extractAndSavePRs` din devtools → `pr-records` populat; `renderPRWall` cheamă fără erori.

### Pas 4 — `coach/restTimer.js`
- **De ce al patrulea:** depinde doar de `./logging.js` (pentru `updateExCard`) — rezolvăm **după** logging; temporar late-binding `window.updateExCard`.
- **Ce mută:** `getSmartPause, startPause, stopPause, skipPause, setupInactivity, teardownInactivity`.
- **Test imediat:** startPause cu 30s, verificat countdown + beep-uri.

### Pas 5 — `coach/logging.js`
- **De ce al cincilea:** folosește `./restTimer.js` (deja extras) + `./session.js` (nu încă).
- **Ciclu cu session.js:** `confirmReps → endSession` — rezolvat prin late-binding `window.endSession`.
- **Ce mută:** `setDone, confirmReps, selectRPE, adjSessionReps, renderSessLog, updateExCard, editSessionKg, adjSessionKg, confirmSessionKg, confirmEditKg, toggleMute`.
- **Test imediat:** setDone → RPE screen → confirmReps → log salvat → renderSessLog arată setul.

### Pas 6 — `coach/rating.js`
- **De ce al șaselea:** depinde de `./pr.js` (extras la Pas 3) + `./session.js` (late-binding).
- **Ce mută:** `showSessionRating, rateSession, showSessionSummary, launchConfetti`.
- **Test imediat:** end-of-session rating modal → click „NORMALĂ" → summary apare → closeSummary.

### Pas 7 — `coach/modals.js`
- **De ce al șaptelea:** depinde de `./logging.js` (updateExCard) + renderIdle prin late-binding.
- **Ce mută:** `showReadinessModal, selectReadiness, showSkipModal, confirmSkip, showAlternativeModal, selectAlternative, markEquipmentUnavailable, markOccupied, showWhyForExercise`.
- **Test imediat:** fiecare modal deschis/închis; `markOccupied` în sesiune activă → `showAlternativeModal`; `selectAlternative` → `updateExCard` refresh.

### Pas 8 — `coach/session.js`
- **De ce al optulea:** consumă deja restTimer + rating + logging + renderIdle (prin late-binding) + pr.
- **Ciclu rezolvat natural:** la acest pas, toate late-binding-urile `window.*` pot fi înlocuite cu import-uri directe.
- **Ce mută:** `startSession, endSession, cancelWorkout, closeSummary, finishEarly, confirmEarlyStop, skipExercise, updateSessionProgress, saveDraft, clearDraft, requestWakeLock, releaseWakeLock, tickSess`.
- **Test imediat:** full flow `startSession → 3 sets → endSession → rating → summary`.

### Pas 9 — `coach/renderIdle.js`
- **De ce al nouălea:** cel mai complex, cu HTML template. Îl extragem ultimul ca să nu îl mutăm de două ori.
- **Ciclu rezolvat natural:** pr.js și modals.js pot înlocui `window.renderCoachIdle` cu `import { renderCoachIdle } from './renderIdle.js'`.
- **Ce mută:** `renderCoachIdle, renderLastSessionMemory, renderFatigueScore, renderTodayAlerts, toggleExList, checkMuscleBalance, checkWeightReminder, saveStepsQuick` + `exListExpanded` (dacă nu e în state.js).
- **Test imediat:** deschide app → coach tab → idle screen arată identic.

### Pas 10 — Consolidare `coach.js` (orchestrator final)
- **Ce mută:** nimic. `coach.js` devine **doar** re-exports. Ștergem orice rămășiță de logică.
- **Audit imports:** fiecare import din main.js, onboarding.js, nav.js, plan.js trebuie să se regăsească în re-exports.
- **Test imediat:** `npm run build && npm run test:all` — zero regresii.
- **Replace late-binding:** înlocuiește toate `window.renderCoachIdle()`, `window.updateExCard()`, `window.endSession()` interne cu import-uri directe; șterge late-binding-urile temporare introduse la pașii 3–8.

---

## VALIDATION CHECKLIST

Verificări care trebuie să treacă după split complet (post-Pas 10):

### Build / Lint / Type
- [ ] `npm run build` succeeds fără warning-uri noi
- [ ] `npm run lint` (dacă există) — zero noi erori
- [ ] No circular dependency warnings în build output

### Test suite
- [ ] `npm run test:all` — aceleași rezultate ca pre-split (count pass/fail)
- [ ] `npm run test -- coach` (dacă există teste unitare) — pass
- [ ] E2E smoke tests (`tests/e2e/smoke-critical-paths.spec.ts`) — pass

### Flow-uri utilizator (manual QA, testează fiecare)
- [ ] **Coach idle (zi workout):** header corect, main lift, readiness card, PR wall, fatigue score — identic cu pre-split
- [ ] **Coach idle (zi off):** quest steps, streak, input steps, save — funcțional
- [ ] **Readiness:** `selectReadiness(3)` → card se schimbă, score calculat
- [ ] **Start flow:** `startSession` → session UI apare, primul exercițiu auto-selectat
- [ ] **Per-set flow:** `setDone → confirmReps` cu 10 reps → log salvat → next set / next exercise cu pauză
- [ ] **Pauza rest:** countdown vizibil, beep la 10s și sub 3s, hide la 0
- [ ] **Inactivity pause:** stai 2 min inactiv → toast pauză automată
- [ ] **Kg edit:** `editSessionKg → −2.5 → confirm` → override salvat, toast
- [ ] **Skip exercise:** butonul skip → completedExercises incrementat → next
- [ ] **Alternative modal:** `markOccupied` în sesiune → alternativă propusă → selectAlternative
- [ ] **Early stop:** `finishEarly → motiv → confirmEarlyStop` → log `__early_stop__` + rating flow
- [ ] **Cancel:** `cancelWorkout` → confirm → loguri șterse, today-screen reapare
- [ ] **End normal:** `endSession → showSessionRating → rateSession('normal')` → showSessionSummary → closeSummary
- [ ] **PR detection:** set cu greutate > istoric → PR apare în summary + în pr-records
- [ ] **Resume draft:** închide tab mid-sesiune → redeschide → confirm restore → sesiunea continuă cu sessLog intact
- [ ] **Test session auto-delete:** end < 5 min (fără earlyStop) → logurile sunt șterse din DB
- [ ] **Wake lock:** sesiune activă → ecranul nu se stinge (verifică pe mobil sau via `navigator.wakeLock`)
- [ ] **Why modal:** `showWhyForExercise('Lat Pulldown')` → alert cu explicație din whyEngine

### Regresii specifice la split
- [ ] `window._directorCache` este definit după load
- [ ] `window._pendingRatingSummary` există când modal rating e deschis
- [ ] `window._kgOvVal` se actualizează la adjSessionKg
- [ ] `window._coachInactivityHandler` este atașat la setupInactivity și curățat la teardown
- [ ] `main.js` Object.assign(window, {...}) cu toate funcțiile coach — zero `undefined`
- [ ] `plan.js` `getDisplayTime` import funcțional (plan page se randează fără eroare)
- [ ] `onboarding.js` `renderCoachIdle` import funcțional (post-onboarding redirect funcționează)
- [ ] `nav.js` `renderCoachIdle` import funcțional (click pe tab Coach randează)

### Post-split hygiene
- [ ] `src/pages/coach.js` are **sub 150 LOC** (orchestrator pur)
- [ ] Niciun submodul nu depășește 450 LOC
- [ ] `grep -r "window\.renderCoachIdle\|window\.updateExCard\|window\.endSession" src/pages/coach/` returnează **zero** (toate late-binding-urile rezolvate)
- [ ] `grep -n "^let \|^const \|^var " src/pages/coach/*.js | grep -v "^src.*\./\*"` — nicio variabilă de stare nouă în afară de cele din `state.js` și `coach/state.js`

---

## META-OBSERVAȚII

Lucruri remarcate în timpul planificării, care **nu țin de split** dar merită documentate într-un follow-up:

1. **`tickSess()` este stub gol** (linia 196, `function tickSess() {}`), dar `startSession` îl apelează cu `setInterval(tickSess, 1000)` (linia 453, 469). Asta înseamnă că timerul sesiunii (#sess-clock, #sess-kcal) **nu se actualizează vizual**. Comentariul indică intenția (`TODO: update session clock`). Bug cosmetic, pre-existent. Follow-up: implementare reală.

2. **`renderTodayAlerts()` este stub gol** (linia 194) cu TODO similar. Niciun consumator vizual nu pierde date, dar feature-ul e indisponibil.

3. **`selectRPE(rpe)` e export no-op** (linia 615) — păstrat pentru compatibilitate HTML, dar audit-ul C1 (linia 383) arată că AA engine e de-facto dezactivat pentru că logurile au RPE=8 hardcodat în `confirmReps` (linia 581). Follow-up separat: reactivare AA engine.

4. **`closeSummary` auto-închide ziua seara** (linia 756: `if (h >= 22 && window.closeDayFromDash)`) — comportament implicit ne-documentat. Nu mutăm logica, dar merită flagat într-un comment la mutare.

5. **`showWhyForExercise` face `dynamic import`** (`import('../engine/whyEngine.js')` linia 1424) — pattern de lazy loading. Păstrăm dynamic în modals.js (nu convertim la static import).

6. **Code duplication — phase detection**: calculul `isInCut` din linia 309 este identic cu cel din linia 1436. Extragem `isInCutPhase()` în util.js (ONE extraction, nu refactor larger).

7. **`extractAndSavePRs` apelată de 3 ori per rateSession** (direct + via cleanFakeLogs). Redundanță ușoară. Nu optimizăm acum.

8. **`window.speechSynthesis.cancel()`** apelat la endSession ȘI cancelWorkout. Dacă endSession e apelat după cancelWorkout (race), apelul dublu e benign dar vorbitorul poate fi întrerupt vizibil. Nu atingem.

9. **`renderCoachIdle` apelat de `selectReadiness`, `markOccupied`, `saveStepsQuick`** etc. = 10+ re-randări per sesiune completă. Fiecare apel invocă `coachDirector.buildSession` dacă cache-ul expiră (TTL 5 min). Cost CPU real. Audit H6 (docs/AUDIT_COACH_JS_24APR.md:969) tratează acest punct. Split-ul nu introduce noi apeluri, dar merită un PR de debouncing separat.

10. **Circular DOM refresh pattern**: `selectAlternative → updateExCard; markOccupied → renderCoachIdle; confirmSkip → renderCoachIdle + renderDash`. Nu este consistent (selectAlternative nu face renderDash). Nu atingem.

---

## DECLARAȚIE FINALĂ

- **Confidence în plan:** 82%
- **Ore estimate pentru execuție split:** 8–12 ore dev senior (1 zi completă), cu:
  - 1h / pas × 10 pași = 10h setup + extragere mecanică
  - 2h QA manual flow-uri critice
  - 1h rezolvare cicluri residuale + cleanup late-binding
- **Riscuri reziduale după split (nu se îmbunătățesc, nu se înrăutățesc):**
  - Bug-urile C1–C5 + H1–H9 din audit rămân **exact ca înainte** (split pur, zero fix-uri comportamentale)
  - UI inline în `renderCoachIdle` rămâne monolitic (~240 LOC de template) — nu îl mai rupem
  - Dependența `selectRPE` + `cleanFakeLogs` de apeluri redundante — rămâne
- **Probleme IDENTIFICATE în timpul planificării, NU incluse în split (follow-ups dedicate):**
  1. Fix C2 (cancelWorkout leak inactivity + draft) — PR separat
  2. Fix C3 (rateSession idempotency) — PR separat
  3. Fix H6 (renderCoachIdle debounce pattern analysis) — PR separat
  4. Implementare reală `tickSess` și `renderTodayAlerts` — feature nouă
  5. Reactivare AA engine (audit C1) — PR mare separat
- **Recomandare:** **PROCEED**, dar:
  - executorul să parcurgă pașii **în ordinea de mai sus, fără reordonare**
  - la fiecare pas: `npm run build && npm run test:all` înainte de pasul următor
  - dacă la orice pas apar cicluri ES module neașteptate: fallback la `window.*` late-binding (temporar, de curățat la Pas 10)
  - NU combina split-ul cu niciun fix comportamental; bug-urile din audit rămân intacte
  - după Pas 10, deschide PR separate pentru fix-urile C2/C3/H6 identificate
