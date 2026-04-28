# PROMPT EXECUȚIE FAZA 1.1 — SPLIT coach.js

## CONTEXT

Ești un agent de refactoring mecanic. Ai de realizat split-ul `src/pages/coach.js` (1477 LOC) în 9 submodule + 1 orchestrator, **exact** conform planului arhitectural din `docs/COACH_SPLIT_PLAN.md`.

**Planul este deja finalizat. Nu planifici. Nu optimizezi. Nu corectezi bug-uri. Execuți.**

---

## SETUP INIȚIAL

```bash
git checkout main
git pull origin main
git checkout -b refactor/coach-split
```

Verifică că ești pe branch-ul corect:
```bash
git branch --show-current
# trebuie să afișeze: refactor/coach-split
```

Fă un snapshot al stării pre-split:
```bash
wc -l src/pages/coach.js
npm run build && npm run test:all
# Salvează numărul de teste passing — acesta este TARGET-ul de menținut.
```

---

## REGULI ABSOLUTE

1. **ZERO bug fixes** — dacă observi un bug în codul pe care îl muți, documentează-l într-un comentariu `// BUG(audit): descriere` și continuă. NU repara.
2. **ZERO refactoring suplimentar** — nu redenumești variabile, nu schimbi structuri, nu introduci abstracții noi față de plan.
3. **STOP IMEDIAT** dacă `npm run build` sau `npm run test:all` raportează o eroare pe care planul **nu o menționează explicit** în secțiunea RISCURI. Documentează eroarea și cere instrucțiuni.
4. **Commit granular** — câte un commit per pas, cu mesajul exact specificat mai jos.
5. **Ordinea pașilor este fixă** — nu reordona, nu combina pași.
6. Fiecare pas începe cu **citirea secțiunii relevante** din `docs/COACH_SPLIT_PLAN.md`.

---

## PAS 1 — `src/pages/coach/state.js`

### Ce extragi
Din `src/pages/coach.js`, mută în fișierul nou `src/pages/coach/state.js`:
- Variabila `_sessionCache` (linia ~17–28) cu toate metodele sale interne (`get`, `set`, `invalidate`, `TTL`)
- Variabila `_cachedDirectorSession` (linia ~32)
- Variabila `wakeLock` (linia ~33)
- Variabila `inactivityTimer` (linia ~34)

### Ce creezi: `src/pages/coach/state.js`

Conținut minimal (~50 LOC):
- Exportă `sessionCache` (obiectul `_sessionCache` redenumit)
- Exportă funcțiile `getCachedDirector()` / `setCachedDirector(s)` ca accesori peste `_cachedDirectorSession`
- Exportă `wakeLockRef = { current: null }` (înlocuiește variabila `wakeLock`)
- Exportă `uiToggleFlags = { exListExpanded: {}, prWallExpanded: false }` (grupează cele două flags UI)
- **Side effect la import:** `window._directorCache = sessionCache` — linie de top-level (păstrează contractul public)

### Ce modifici: `src/pages/coach.js`

- Adaugă `import './coach/state.js'` ca side-effect (fără destructuring — garantează evaluarea)
- Adaugă `import { sessionCache, getCachedDirector, setCachedDirector, wakeLockRef, uiToggleFlags } from './coach/state.js'`
- Șterge declarațiile locale `_sessionCache`, `_cachedDirectorSession`, `wakeLock`, `inactivityTimer`
- Înlocuiește toate referințele la `_sessionCache` cu `sessionCache`
- Înlocuiește `wakeLock` cu `wakeLockRef.current` (read) și `wakeLockRef.current = ...` (write)
- Înlocuiește `_cachedDirectorSession` cu `getCachedDirector()` / `setCachedDirector(s)`
- Înlocuiește `exListExpanded` cu `uiToggleFlags.exListExpanded`
- Înlocuiește `prWallExpanded` cu `uiToggleFlags.prWallExpanded`

### Validare Pas 1
```bash
npm run build
# Trebuie: zero erori
# Verifică în DevTools sau cu node:
node -e "require('./src/pages/coach/state.js')" 2>&1 || true
# Verifică că window._directorCache nu e undefined (manual în browser sau cu JSDOM)
npm run test:all
# Trebuie: același număr de teste passing ca pre-split
```

### Commit Pas 1
```bash
git add src/pages/coach/state.js src/pages/coach.js
git commit -m "refactor(coach): extract module-local shared state to coach/state.js"
```

---

## PAS 2 — `src/pages/coach/util.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/util.js`:
- `formatSetsReps(rawStr, exName, isInCut)` (liniile ~40–50)
- `getGroupColor(g)` (liniile ~183–186)
- `getExGroup(ex)` (liniile ~997–1008)
- `getDisplayTime(prog)` (liniile ~1025–1039)
- `calcAccurateTime(prog)` (liniile ~1041–1072)
- `getAdaptiveTime(dayLabel)` (liniile ~1074–1080)
- `getTodayExercises()` (liniile ~973–995)
- `beepStart()` (linia ~197)
- `resetNotes()` (linia ~161)

### Ce creezi NOU în `coach/util.js`
- `isInCutPhase()` — **funcție nouă** (nu există în coach.js, o extragi prin deduplicare):
  - Copiază logica din `renderCoachIdle` liniile ~308–310 (citire `phase-override` din DB + comparație cu `2026-07-20`)
  - Aceasta **elimină duplicarea** față de `showWhyForExercise` liniile ~1436–1438 care are logică identică

### Imports în `coach/util.js`
```js
import { DB, cleanEx } from '../../db.js'
import { COMPOUND_EX } from '../../constants.js'
import { state } from '../../state.js'
import { beep } from '../../ui/ui.js'
import { sessionCache } from './state.js'
```

### Exports din `coach/util.js`
```js
export { formatSetsReps, getGroupColor, getExGroup, isInCutPhase,
         getDisplayTime, calcAccurateTime, getAdaptiveTime,
         getTodayExercises, beepStart, resetNotes }
```

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/util.js`
- Șterge funcțiile mutate din coach.js
- În `renderCoachIdle` și `showWhyForExercise`: înlocuiește logica inline de CUT detection cu `isInCutPhase()`

### Validare Pas 2
```bash
npm run build
npm run test:all
# Verifică manual: plan page se randează (folosește getDisplayTime)
```

### Commit Pas 2
```bash
git add src/pages/coach/util.js src/pages/coach.js
git commit -m "refactor(coach): extract pure helpers and isInCutPhase to coach/util.js"
```

---

## PAS 3 — `src/pages/coach/pr.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/pr.js`:
- `extractAndSavePRs()` (liniile ~1143–1155)
- `cleanFakeLogs()` (liniile ~1158–1168)
- `renderPRWall()` (liniile ~1252–1287)
- `togglePRWall()` (liniile ~1246–1249)
- Variabila `prWallExpanded` (dacă nu e deja mutată în `coach/state.js` la Pas 1 via `uiToggleFlags`)

### Ciclu de rezolvat la acest pas (CICLU A)
`pr.js` → `renderCoachIdle` (din renderIdle.js — neextras încă)

**Soluție temporară (late-binding):** în `cleanFakeLogs` și în orice loc din pr.js unde e apelată `renderCoachIdle`, înlocuiește cu:
```js
window.renderCoachIdle?.()
```
Această late-binding se va rezolva la **Pas 10** când toate modulele sunt extrase.

### Imports în `coach/pr.js`
```js
import { DB, $ } from '../../db.js'
import { toast } from '../../ui/ui.js'
import { filterValidLogs } from '../../util/logFilter.js'
import { uiToggleFlags } from './state.js'
```

### Exports din `coach/pr.js`
```js
export { extractAndSavePRs, cleanFakeLogs, renderPRWall, togglePRWall }
```

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/pr.js`
- Șterge funcțiile mutate

### Validare Pas 3
```bash
npm run build
npm run test:all
# Manual în DevTools (sau în test): extractAndSavePRs() → pr-records populat
# Manual: renderPRWall() nu aruncă erori
```

### Commit Pas 3
```bash
git add src/pages/coach/pr.js src/pages/coach.js
git commit -m "refactor(coach): extract PR detection and wall to coach/pr.js"
```

---

## PAS 4 — `src/pages/coach/restTimer.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/restTimer.js`:
- `getSmartPause(ex)` (liniile ~53–62)
- `startPause(sec, nextEx)` (liniile ~617–644)
- `stopPause()` (linia ~646)
- `skipPause()` (liniile ~176–181)
- `setupInactivity()` (liniile ~79–97)
- `teardownInactivity()` (liniile ~98–107)

### Ciclu de rezolvat la acest pas (CICLU C soft)
`restTimer.js` → `updateExCard` din `logging.js` (neextras încă)

**Soluție temporară (late-binding):**
```js
window.updateExCard?.()
```
Se rezolvă la Pas 10.

### Variable de state local
`inactivityTimer` — poate fi variabilă module-local direct în `restTimer.js` (nu mai trece prin `coach/state.js`), sau importat din `./state.js`. **Preferă module-local dacă e folosit exclusiv de setupInactivity/teardownInactivity.**

### Atașare globală (păstrat contract)
`window._coachInactivityHandler` — atribuit în `setupInactivity` exact ca în codul original.

### Imports în `coach/restTimer.js`
```js
import { $ } from '../../db.js'
import { DP, SYS } from '../../engine/...'  // conform importurilor existente în coach.js
import { COMPOUND_EX, PAUSE_COMPOUND, PAUSE_ISO } from '../../constants.js'
import { toast, beep, beepAlert, speak, showPauseScreen, hidePauseScreen } from '../../ui/ui.js'
import { state } from '../../state.js'
```

### Exports din `coach/restTimer.js`
```js
export { getSmartPause, startPause, stopPause, skipPause,
         setupInactivity, teardownInactivity }
```

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/restTimer.js`
- Șterge funcțiile mutate

### Validare Pas 4
```bash
npm run build
npm run test:all
# Manual: startPause(30) → countdown vizibil pe ecran
# Manual: inactivitate 2+ min → toast pauză automată
```

### Commit Pas 4
```bash
git add src/pages/coach/restTimer.js src/pages/coach.js
git commit -m "refactor(coach): extract rest timer and inactivity handler to coach/restTimer.js"
```

---

## PAS 5 — `src/pages/coach/logging.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/logging.js`:
- `setDone()` (liniile ~562–567)
- `confirmReps()` (liniile ~569–609)
- `selectRPE(rpe)` (linia ~615 — no-op, dar exportul se păstrează)
- `adjSessionReps(d)` (liniile ~1010–1013)
- `renderSessLog()` (liniile ~953–971)
- `updateExCard()` (liniile ~484–560)
- `editSessionKg()` (liniile ~908–933)
- `adjSessionKg(delta)` (liniile ~935–939)
- `confirmSessionKg()` (liniile ~941–949)
- `confirmEditKg()` (linia ~951 — alias pentru confirmSessionKg)
- `toggleMute()` (liniile ~169–174)

### Global de păstrat (contract DOM)
`window._kgOvVal` — atribuit în `editSessionKg` și `adjSessionKg`. Păstrează atribuirile **exact** cum sunt.

### Ciclu de rezolvat la acest pas (CICLU B)
`logging.js` → `endSession` din `session.js` (neextras încă)

**Soluție temporară (late-binding):**
```js
window.endSession?.()
```
Se rezolvă la Pas 10.

### Imports în `coach/logging.js`
```js
import { DB, $, tod } from '../../db.js'
import { EX_SETS } from '../../constants.js'
import { DP, AA, SYS } from '../../engine/...'  // conform importurilor existente
import { toast, beep, beepDone, speak } from '../../ui/ui.js'
import { getSmartPause, startPause } from './restTimer.js'
import { getTodayExercises, getExGroup, resetNotes } from './util.js'
import { state } from '../../state.js'
```
`saveDraft` — importat din `./session.js` sau lăsat ca `window.saveDraft?.()` temporar (session.js neextras). **Preferă late-binding temporar.**

### Exports din `coach/logging.js`
```js
export { setDone, confirmReps, selectRPE, adjSessionReps, renderSessLog,
         updateExCard, editSessionKg, adjSessionKg, confirmSessionKg, confirmEditKg,
         toggleMute, getExGroup }
```

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/logging.js`
- Șterge funcțiile mutate

### Validare Pas 5
```bash
npm run build
npm run test:all
# Manual: setDone → RPE screen → confirmReps(10) → log salvat → renderSessLog afișează setul
# Manual: editSessionKg → adjSessionKg(-2.5) → confirmSessionKg → toast confirmare
# Manual: toggleMute → iconiță mute se schimbă
```

### Commit Pas 5
```bash
git add src/pages/coach/logging.js src/pages/coach.js
git commit -m "refactor(coach): extract per-set logging and kg-edit overlay to coach/logging.js"
```

---

## PAS 6 — `src/pages/coach/rating.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/rating.js`:
- `showSessionRating(summaryData)` (liniile ~813–861)
- `rateSession(rating, summaryData)` (liniile ~863–906)
- `showSessionSummary(data)` (liniile ~759–781)
- `launchConfetti()` (liniile ~783–811)

### Global de păstrat (contract DOM)
`window._pendingRatingSummary` — atribuit în `showSessionRating`. Păstrează **exact**.

### Ciclu de rezolvat la acest pas
`rating.js` → `clearDraft` din `session.js` (neextras)

**Soluție temporară:**
```js
window.clearDraft?.()
```

### Imports în `coach/rating.js`
```js
import { DB, tod, $ } from '../../db.js'
import { syncToFirebase } from '../../firebase.js'
import { extractAndSavePRs, cleanFakeLogs } from './pr.js'
import { hidePauseScreen } from '../../ui/ui.js'
import { state } from '../../state.js'
```

### Exports din `coach/rating.js`
```js
export { showSessionRating, rateSession, showSessionSummary }
```
(`launchConfetti` nu e apelată extern — nu o exporta dacă planul nu o cere)

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/rating.js`
- Șterge funcțiile mutate

### Validare Pas 6
```bash
npm run build
npm run test:all
# Manual: end-of-session → showSessionRating → click „NORMALĂ" → showSessionSummary apare
# Manual: confetti se lansează la summary
# Manual: closeSummary → coach idle reapare
```

### Commit Pas 6
```bash
git add src/pages/coach/rating.js src/pages/coach.js
git commit -m "refactor(coach): extract session rating, summary and confetti to coach/rating.js"
```

---

## PAS 7 — `src/pages/coach/modals.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/modals.js`:
- `showReadinessModal()` (liniile ~1289–1309)
- `selectReadiness(value)` (liniile ~1311–1317)
- `showSkipModal()` (liniile ~1319–1334)
- `confirmSkip(reason)` (liniile ~1336–1346)
- `showAlternativeModal(exerciseName)` (liniile ~1348–1397)
- `selectAlternative(original, alternative)` (liniile ~1399–1410)
- `markEquipmentUnavailable(exerciseName)` (liniile ~1412–1420)
- `markOccupied(exerciseName)` (liniile ~1453–1465)
- `showWhyForExercise(exerciseName)` (liniile ~1422–1451)

### Cicluri de rezolvat (CICLU D și E)
`modals.js` → `renderCoachIdle` (neextras) și → `updateExCard` (extras la Pas 5)

**Soluție temporară:**
```js
window.renderCoachIdle?.()  // pentru selectReadiness, confirmSkip, markEquipmentUnavailable, markOccupied
```
`updateExCard` — import direct din `./logging.js` (deja extras la Pas 5) — **fără late-binding**.

### Păstrare dynamic import
`showWhyForExercise` face `import('../engine/whyEngine.js')` — **lasă ca dynamic import**, nu converti la static.

### Imports în `coach/modals.js`
```js
import { DB } from '../../db.js'
import { PROG } from '../../constants.js'
import { toast } from '../../ui/ui.js'
import { saveReadiness, READINESS_LABELS } from '../../engine/readiness.js'
import { updateExCard } from './logging.js'
import { getCachedDirector } from './state.js'
import { state } from '../../state.js'
```

### Exports din `coach/modals.js`
```js
export { showReadinessModal, selectReadiness, showSkipModal, confirmSkip,
         showAlternativeModal, selectAlternative, markEquipmentUnavailable,
         markOccupied, showWhyForExercise }
```

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/modals.js`
- Șterge funcțiile mutate

### Validare Pas 7
```bash
npm run build
npm run test:all
# Manual: fiecare modal deschis și închis:
#   - showReadinessModal → selectReadiness(3) → ecran refresh
#   - showSkipModal → confirmSkip('crowd') → exercițiu skipped
#   - showAlternativeModal → selectAlternative → updateExCard refresh
#   - markOccupied în sesiune → showAlternativeModal
#   - showWhyForExercise → alert cu explicație
```

### Commit Pas 7
```bash
git add src/pages/coach/modals.js src/pages/coach.js
git commit -m "refactor(coach): extract user-initiated modals to coach/modals.js"
```

---

## PAS 8 — `src/pages/coach/session.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/session.js`:
- `startSession()` (liniile ~438–482)
- `endSession()` (liniile ~682–746)
- `cancelWorkout()` (liniile ~663–680)
- `closeSummary()` (liniile ~748–757)
- `finishEarly()` (liniile ~1171–1190)
- `confirmEarlyStop(reason)` (liniile ~1192–1216)
- `skipExercise()` (liniile ~648–661)
- `updateSessionProgress()` (liniile ~1015–1023)
- `saveDraft()` (liniile ~65–75)
- `clearDraft()` (linia ~76)
- `requestWakeLock()` (liniile ~1471–1477)
- `releaseWakeLock()` (liniile ~1467–1469)
- `tickSess()` (linia ~196 — stub gol; **nu implementa**, mută stub-ul verbatim)

### BUG CUNOSCUT — NU REPARA
`cancelWorkout` NU apelează `teardownInactivity()` și NU apelează `clearDraft()` — bug pre-existent documentat în audit (C2). Mută logica **exact cum e**, fără adăugiri.

### Rezolvare late-binding-uri (la acest pas înlocuiesc importuri reale)
La Pas 8 toate dependențele sunt extrase → înlocuiește:
- `window.renderCoachIdle?.()` din `session.js` cu `import { renderCoachIdle } from './renderIdle.js'` — **NU ACUM**, renderIdle.js se extrage la Pas 9. Lasă late-binding.

### Imports în `coach/session.js`
```js
import { DB, $, tod } from '../../db.js'
import { syncToFirebase } from '../../firebase.js'
import { PROG, EX_SETS } from '../../constants.js'
import { SYS, DP } from '../../engine/...'
import { toast, speak, beep } from '../../ui/ui.js'
import { updateExCard, renderSessLog } from './logging.js'
import { getTodayExercises } from './util.js'
import { startPause, stopPause, hidePauseScreen, setupInactivity, teardownInactivity, getSmartPause } from './restTimer.js'
import { showSessionRating } from './rating.js'
import { wakeLockRef } from './state.js'
import { state } from '../../state.js'
```
`renderCoachIdle` — `window.renderCoachIdle?.()` (late-binding până la Pas 9).

### Exports din `coach/session.js`
```js
export { startSession, endSession, cancelWorkout, closeSummary, finishEarly,
         confirmEarlyStop, skipExercise, updateSessionProgress,
         requestWakeLock, releaseWakeLock, saveDraft, clearDraft, tickSess }
```

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/session.js`
- Șterge funcțiile mutate
- Înlocuiește `window.saveDraft?.()` din logging.js cu import real: adaugă `import { saveDraft } from './session.js'` în `logging.js` și șterge late-binding-ul.

### Validare Pas 8
```bash
npm run build
npm run test:all
# Manual: full flow startSession → 3 seturi → endSession → rating → summary
# Manual: cancelWorkout → confirmare → coach idle
# Manual: finishEarly → motiv → confirmEarlyStop → rating flow
# Manual: resume draft (refresh în sesiune activă → confirm restore)
```

### Commit Pas 8
```bash
git add src/pages/coach/session.js src/pages/coach/logging.js src/pages/coach.js
git commit -m "refactor(coach): extract session lifecycle, wake lock and draft to coach/session.js"
```

---

## PAS 9 — `src/pages/coach/renderIdle.js`

### Ce extragi
Din `src/pages/coach.js`, mută în `src/pages/coach/renderIdle.js`:
- `renderCoachIdle()` (liniile ~200–436 — conține ~240 LOC de template strings; **copy-paste verbatim, fără split**)
- `renderLastSessionMemory(dayLabel)` (liniile ~110–156)
- `renderFatigueScore(elId)` (liniile ~187–192)
- `renderTodayAlerts()` (linia ~194 — stub gol; **mută verbatim**)
- `toggleExList(dayIdx)` (liniile ~164–167)
- `checkMuscleBalance()` (liniile ~1084–1114)
- `checkWeightReminder()` (liniile ~1116–1140)
- `saveStepsQuick()` (liniile ~1218–1241)

### Rezolvare late-binding-uri (la acest pas se rezolvă CICLU A și CICLU D)
Acum că `renderIdle.js` există, înlocuiește `window.renderCoachIdle?.()` din:
- `src/pages/coach/pr.js` → adaugă `import { renderCoachIdle } from './renderIdle.js'`
- `src/pages/coach/modals.js` → adaugă `import { renderCoachIdle } from './renderIdle.js'`
- `src/pages/coach/session.js` → adaugă `import { renderCoachIdle } from './renderIdle.js'`

**Atenție la cicluri ES module:** toate aceste importuri sunt folosite **în corpul funcțiilor**, nu la top-level → ciclul e tolerat de Node/browser. Dacă build raportează `ReferenceError: Cannot access 'renderCoachIdle' before initialization` → fallback: păstrează `window.renderCoachIdle?.()` și documentează.

### Imports în `coach/renderIdle.js`
```js
import { DB, $, tod, cleanEx } from '../../db.js'
import { PROG, EX_SETS, COMPOUND_EX } from '../../constants.js'
import { DP, AA, SYS } from '../../engine/...'
import { calculateFatigueScore } from '../../engine/fatigue.js'
import { getTodayReadiness, getReadinessVerdict, getReadinessScore, READINESS_LABELS } from '../../engine/readiness.js'
import { analyzeAndApplyPatterns } from '../../engine/patternLearning.js'
import { coachDirector } from '../../engine/coachDirector.js'
import { formatSetsReps, getExGroup, isInCutPhase } from './util.js'
import { renderPRWall } from './pr.js'
import { sessionCache, setCachedDirector, uiToggleFlags } from './state.js'
import { state } from '../../state.js'
```

### Exports din `coach/renderIdle.js`
```js
export { renderCoachIdle, renderLastSessionMemory, renderFatigueScore,
         renderTodayAlerts, toggleExList, toggleMute, checkMuscleBalance,
         checkWeightReminder, saveStepsQuick, tickSess }
```
(`tickSess` re-exportat din session.js sau mutat direct — verifică cine are nevoie)
(`toggleMute` — conform planului aparține renderIdle.js)

### Ce modifici: `src/pages/coach.js`
- Adaugă import din `./coach/renderIdle.js`
- Șterge funcțiile mutate

### Validare Pas 9
```bash
npm run build
# Verifică: niciun ReferenceError pentru cicluri
npm run test:all
# Manual: deschide app → tab Coach → idle screen identic vizual cu pre-split
# Manual: saveStepsQuick → bara de progres se actualizează
# Manual: selectReadiness(3) → ecranul se refresh-ează cu card-ul readiness nou
# Manual: markOccupied → exercițiul apare opacizat
```

### Commit Pas 9
```bash
git add src/pages/coach/renderIdle.js src/pages/coach/pr.js src/pages/coach/modals.js src/pages/coach/session.js src/pages/coach.js
git commit -m "refactor(coach): extract coach idle render to coach/renderIdle.js; resolve late-bindings"
```

---

## PAS 10 — Consolidare `coach.js` (orchestrator final)

### Ce faci
`src/pages/coach.js` trebuie să devină **exclusiv re-export orchestrator**. Nu trebuie să conțină nicio logică.

1. Verifică că au rămas funcții în `coach.js` — ar trebui să fie **zero**.
2. Dacă a mai rămas ceva, mută-l în modulul corespunzător.
3. Structura finală a `coach.js`:

```js
// Orchestrator: re-exports for main.js, onboarding.js, nav.js, plan.js
import './coach/state.js'  // side-effect: window._directorCache

export { renderCoachIdle, renderLastSessionMemory, toggleExList, toggleMute,
         checkMuscleBalance, checkWeightReminder, saveStepsQuick, tickSess }
  from './coach/renderIdle.js'

export { startSession, endSession, cancelWorkout, closeSummary, finishEarly,
         confirmEarlyStop, skipExercise, updateSessionProgress,
         requestWakeLock, releaseWakeLock, saveDraft, clearDraft }
  from './coach/session.js'

export { setDone, confirmReps, selectRPE, adjSessionReps, renderSessLog,
         updateExCard, editSessionKg, adjSessionKg, confirmSessionKg, confirmEditKg }
  from './coach/logging.js'

export { showSessionRating, rateSession, showSessionSummary }
  from './coach/rating.js'

export { extractAndSavePRs, cleanFakeLogs, renderPRWall, togglePRWall }
  from './coach/pr.js'

export { showReadinessModal, selectReadiness, showSkipModal, confirmSkip,
         showAlternativeModal, selectAlternative, markEquipmentUnavailable,
         markOccupied, showWhyForExercise }
  from './coach/modals.js'

export { getGroupColor, getExGroup, getDisplayTime, calcAccurateTime,
         getAdaptiveTime, getTodayExercises, resetNotes }
  from './coach/util.js'
```

4. **Curăță toate late-binding-urile reziduale:** caută și înlocuiește:
```bash
grep -rn "window\.renderCoachIdle\|window\.updateExCard\|window\.endSession\|window\.saveDraft\|window\.clearDraft" src/pages/coach/
```
Fiecare match trebuie înlocuit cu import direct. **Dacă un match rămâne din cauza unui ciclu real (`ReferenceError` la build), lasă-l și documentează.**

5. Verifică că toate exporturile din planul arhitectural sunt prezente:
```bash
# Trebuie să nu returneze niciun undefined:
grep -o "export {[^}]*}" src/pages/coach.js
```

### Verificări finale pre-commit
```bash
# Coach.js sub 150 LOC:
wc -l src/pages/coach.js  # trebuie < 150

# Niciun submodul peste 450 LOC:
wc -l src/pages/coach/*.js

# Zero late-binding-uri reziduale (sau documentate):
grep -rn "window\.renderCoachIdle\|window\.updateExCard\|window\.endSession" src/pages/coach/

# Nicio variabilă de state nouă în submodule (în afara state.js și coach/state.js):
grep -n "^let \|^const \|^var " src/pages/coach/*.js | grep -v "state\.js"
```

### Validare finală Pas 10
```bash
npm run build && npm run test:all
# Trebuie: zero erori noi, același număr de teste passing ca pre-split
```

### Commit Pas 10
```bash
git add src/pages/coach.js src/pages/coach/*.js
git commit -m "refactor(coach): finalize orchestrator, remove all late-bindings, coach.js pure re-export"
```

---

## VALIDATION CHECKLIST FINAL

Bifează fiecare înainte de a deschide PR-ul.

### Build / Lint / Type
- [ ] `npm run build` succeeds fără warning-uri noi
- [ ] `npm run lint` (dacă există) — zero noi erori
- [ ] No circular dependency warnings în build output (`ReferenceError: Cannot access before initialization`)

### Test suite
- [ ] `npm run test:all` — **același număr** de teste passing ca pre-split
- [ ] `npm run test -- coach` (dacă există teste unitare) — pass
- [ ] E2E smoke tests (`tests/e2e/smoke-critical-paths.spec.ts`) — pass

### Flow-uri utilizator (QA manual)
- [ ] **Coach idle (zi workout):** header, main lift, readiness card, PR wall, fatigue score — identic cu pre-split
- [ ] **Coach idle (zi off):** quest steps, input steps, save — funcțional
- [ ] **Readiness:** `selectReadiness(3)` → card se schimbă, score calculat
- [ ] **Start session:** `startSession` → session UI apare, primul exercițiu auto-selectat
- [ ] **Per-set:** `setDone → confirmReps(10)` → log salvat → next set cu pauză rest
- [ ] **Pauza rest:** countdown vizibil, beep la 10s și sub 3s, hide la 0
- [ ] **Inactivity pause:** stai 2 min inactiv → toast pauză automată
- [ ] **Kg edit:** `editSessionKg → adjSessionKg(-2.5) → confirmSessionKg` → override salvat
- [ ] **Skip exercise:** buton skip → completedExercises incrementat → next
- [ ] **Alternative modal:** `markOccupied` în sesiune → alternativă propusă → `selectAlternative`
- [ ] **Early stop:** `finishEarly → confirmEarlyStop` → log `__early_stop__` + rating flow
- [ ] **Cancel:** `cancelWorkout` → confirm → loguri șterse, today-screen reapare
- [ ] **End normal:** `endSession → rateSession('normal')` → `showSessionSummary` → `closeSummary`
- [ ] **PR detection:** set cu greutate > istoric → PR apare în summary + în pr-records
- [ ] **Resume draft:** refresh tab mid-sesiune → confirm restore → sessLog intact
- [ ] **Wake lock:** sesiune activă → ecranul nu se stinge (test pe mobil sau `navigator.wakeLock`)
- [ ] **Why modal:** `showWhyForExercise('Lat Pulldown')` → alert cu explicație

### Regresii specifice split
- [ ] `window._directorCache` definit după load (DevTools: `window._directorCache !== undefined`)
- [ ] `window._pendingRatingSummary` există când modal rating e deschis
- [ ] `window._kgOvVal` se actualizează la `adjSessionKg`
- [ ] `window._coachInactivityHandler` atașat la `setupInactivity`, curățat la `teardownInactivity`
- [ ] `main.js` `Object.assign(window, {...})` cu toate funcțiile — zero `undefined`
- [ ] `plan.js` — `getDisplayTime` import funcțional (plan page se randează)
- [ ] `onboarding.js` — `renderCoachIdle` import funcțional (redirect post-onboarding)
- [ ] `nav.js` — `renderCoachIdle` import funcțional (click tab Coach)

### Post-split hygiene
- [ ] `src/pages/coach.js` are **sub 150 LOC**
- [ ] Niciun submodul depășește **450 LOC**
- [ ] `grep -r "window\.renderCoachIdle\|window\.updateExCard\|window\.endSession" src/pages/coach/` — **zero** (sau documentate dacă ciclu real)
- [ ] Toate exporturile originale din coach.js sunt prezente în orchestrator

---

## RAPORT FINAL (de completat după Pas 10)

```
## Split Execution Report — FAZA 1.1

**Data execuție:** ___
**Branch:** refactor/coach-split
**Executor:** ___

### LOC Summary
| Fișier | LOC pre-split | LOC post-split |
|--------|--------------|----------------|
| src/pages/coach.js | 1477 | ___ |
| src/pages/coach/state.js | — | ___ |
| src/pages/coach/util.js | — | ___ |
| src/pages/coach/pr.js | — | ___ |
| src/pages/coach/restTimer.js | — | ___ |
| src/pages/coach/logging.js | — | ___ |
| src/pages/coach/rating.js | — | ___ |
| src/pages/coach/modals.js | — | ___ |
| src/pages/coach/session.js | — | ___ |
| src/pages/coach/renderIdle.js | — | ___ |
| **TOTAL** | **1477** | **___** |

### Teste
- Pre-split: ___ passing / ___ failing
- Post-split: ___ passing / ___ failing
- Regresii introduse: ___

### Cicluri ES module rezolvate
| Ciclu | Soluție aplicată |
|-------|-----------------|
| A: pr.js → renderIdle.js | direct import / late-binding rezidual |
| B: logging.js → session.js | direct import / late-binding rezidual |
| C: restTimer.js → logging.js | direct import / late-binding rezidual |
| D: modals.js → renderIdle.js | direct import / late-binding rezidual |
| E: modals.js → logging.js | direct import / late-binding rezidual |

### Late-binding-uri reziduale (dacă există)
| Locație | Funcție | Motiv |
|---------|---------|-------|
| | | |

### Erori întâmpinate (ne-identificate în plan)
| Pas | Eroare | Acțiune luată |
|-----|--------|---------------|
| | | |

### Bug-uri observate (pre-existente, NU reparate)
- Bug C2: cancelWorkout — nu apelează teardownInactivity + clearDraft (PR separat)
- [altele observate la execuție]

### Diff summary
```bash
git diff main...refactor/coach-split --stat
```
[Output aici]
```
```

---

## STOP CONDITIONS

Oprește-te **imediat** și documentează dacă:

1. `npm run build` eșuează cu o eroare **care nu e menționată în secțiunea RISCURI** din `COACH_SPLIT_PLAN.md`
2. `npm run test:all` raportează teste failing **noi** (care treceau pre-split)
3. O funcție nu poate fi găsită la liniile estimate din plan (indiciu că fișierul a fost modificat)
4. Un import dintr-un modul extern (engines, DB, ui) nu poate fi rezolvat
5. Ordinea de execuție a pașilor trebuie schimbată din orice motiv

**În caz de STOP:** creează un commit cu sufixul `WIP` și deschide un issue cu eroarea exactă.

---

*Prompt versiune 1.0 — bazat pe `docs/COACH_SPLIT_PLAN.md` (2026-04-24, confidence 82%)*
*Execuție estimată: 8–12h senior dev*
