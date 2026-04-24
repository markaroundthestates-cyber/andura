# FAZA 2 — OPUS CRITICAL REVIEW

**Created:** 2026-04-24
**Reviewer:** Claude Opus 4.7 (strict mode)
**Subject:** `docs/FAZA_2_EXECUTION_PLAN.md` (Sonnet 4.6, 2026-04-24)
**Scope:** Strategic re-audit — zero cod modificat
**Refs verificate:** AUDIT_COACH_JS_24APR.md, AUDIT_BULLETPROOF_23APR.md, SESSIONBUILDER_AUDIT_1_6.md, FAZA_2_ROADMAP.md + src (session.js, rating.js, patternLearning.js, firebase.js, muscleMap.js, proactiveEngine.js, stagnationDetector.js, responseProfile.js, coachDirector.js, coachContext.js)

---

## 1. Executive Summary

Sonnet-ul a livrat un plan **operațional solid pentru zona bug-fix** (P2, P3): identificarea e corectă, fix-urile propuse sunt aplicabile quasi-verbatim, estimările de timp sunt realiste. Hybrid ordering (Opțiunea C) este alegerea corectă — P2 simple batch întâi construiește momentum și testează pipeline-ul înainte să atingi engine logic. Planul acoperă exact ce declară că acoperă.

**Biggest gap: exit criteria pentru FAZA 2 sunt underspecified ȘI omit două probleme critice deja cunoscute din AUDIT_COACH_JS_24APR.md, nereferențiate în FAZA_2_EXECUTION_PLAN.** **C4c (confirmReps salvează logs fără câmpul `set`/`kg` → `cleanDuplicateLogs` colapsează 3 seturi în 1 la fiecare `init()`)** și **C5c (endSession auto-șterge sesiuni <5 min fără confirmare)** sunt **CRITICAL** în audit și ambele afectează integritatea datelor la fiecare refresh de browser. Planul Sonnet le ignoră complet. Asta este o greșeală mai mare decât toate cele 5 bug-uri P2 luate împreună — pentru că se execută silent la init, nu doar la edge case UX, și transformă istoricul user-ului în date false. Orice lucrare pe sessionBuilder context-aware construiește peste aceeași fundație coruptă: dacă `logs` conțin 1/3 din realitate, `ctx.allLogs` și `weakGroups` rulează pe date amputate.

**Strategic recommendation: re-prioritizează P2 astfel încât C4c + C5c (dedupe bug + auto-delete) să fie primul batch, înaintea tuturor celorlalte.** Păstrează OPT C + OPT A, dar tratează-le ca **non-urgente** — sessionBuilder static nu pierde date; `cleanDuplicateLogs` DA. Un context-aware session builder care alege exerciții bazat pe un istoric pierdut 66% face alegeri mai proaste decât versiunea statică. Reordonarea pe care o propun mai jos (§7) adaugă 1 task și mută 2 — costul marginal e <40 minute, valoarea e salvarea integrității permanente a datelor.

---

## 2. Critical Review Table — Findings Sonnet

| # | Sonnet's Item | Opus Verdict | Reasoning |
|---|---|---|---|
| P1.1 | OPT C — extrage `fallbackSessionBuilder` → `sessionBuilder.js` ca funcție pură | **AGREE** | Clean refactor, risc zero, îmbunătățește testabilitatea. Estimarea 45min e realistă (am verificat codul: 22 linii de mutat + update la 1 call site + teste). |
| P1.2 | OPT A — context-aware selection prin weakGroups, stagnation, prediction | **AGREE, cu modificări** | Conceptual corect. Dar implementarea descrisă (reorder + slice-la-4 + "inject alternativă la stagnationWeeks>3") e **sub-specificată pentru production**. Vezi §5 pentru deep-dive — lipsesc: criteriile de "variety rotation" pentru OPTIMIZED tier, interacțiunea cu `recompile.deficit`, separarea între PUSH/PULL muscle mapping. Nu "simpli 2h de cod" — e un design document care nu există. |
| C2c | `cancelWorkout` missing `clearDraft() / teardownInactivity() / releaseWakeLock() / state reset` | **AGREE (verbatim)** | Fix-ul Sonnet e corect la linia. Adaug: trebuie și `state.activeNotes?.clear()` verificat — în session.js nu există `state.activeNotes` direct, e în `state.js`. Test că `.clear()` nu aruncă pe undefined. |
| C3c | `rateSession` double-tap guard | **AGREE** | Fix-ul idempotency guard e correct. Dublă recomandare (disable buton + guard în funcție) este defense-in-depth bună. |
| H4c | `resume completedExercises` derivare din sessLog | **AGREE cu preferință pentru Opțiunea 1 (persist în draft)** | Sonnet recomandă derivarea. Auditul coach.js §1.3.2 preferă persistarea directă în `saveDraft`. Persistarea e mai robustă — derivarea depinde de `EX_SETS[ex]` fiind corect (dacă iterăm EX_SETS între versiuni, seturile complete se re-calculează greșit). Persist-ul e explicit. Trade-off: derivarea e 4 linii, persistul e 8. |
| H6c | `analyzeAndApplyPatterns` inflight guard | **AGREE** | Fix standard. Recomand debounce 2s peste guard pentru cazul nav rapid între tab-uri (nav.js:20, themeManager.js:16 pot fire back-to-back în <500ms). |
| H11c | `COACH_RELEVANT_KEYS` adăugiri | **AGREE dar cu clarificare** | Lista extinsă e corectă. **Atenție**: adăugarea `applied-patterns` creează un ciclu — `patternLearning._analyze` face `DB.set('applied-patterns', ...)` → invalidează cache → `renderCoachIdle` re-cheamă `coachDirector.buildSession` → care (via `getActivePatterns()`) citește `applied-patterns` → fine, dar nu re-rulează pattern analysis. OK in practică, dar merită comentariu în cod. |
| M3g+H13g | isoWeek shared helper în `dateUtils.js` | **AGREE, dar implementarea ISO 8601 a Sonnet e bugată subtil** | Vezi §3 pentru analiză. Fix-ul propus de Sonnet (linii 262-265) face iso-year detection via `d.getMonth() === 11 && d.getDate() > 28` — euristică, nu ISO 8601 real. Recomand implementarea standard (vezi §4). |
| H14g | `checkRecoveryGroups` — muscleState contract mismatch | **AGREE (Opțiunea A)** | Decizia corectă. Opțiunea B ar fi touching all getMuscleState consumers. Opțiunea A e izolată la proactiveEngine. |
| M7c | Phase tagging la log | **AGREE** | Correct, cheap, forward-compatible. |
| TASK #22 batch | P2-A + P2-B + P2-D | **AGREE** | Batching corect, toate sunt în fișiere diferite, zero overlap. |
| TASK #23 | session.js modificări | **AGREE dar INSUFICIENT** | Lipsesc fix-urile pentru C4c (set/kg schema) și C5c (auto-delete silent). Vezi §4 detailed. |
| TASK #24 | P3 engines batch | **AGREE** | Bine batch-uit. |
| TASK #25 | OPT C | **AGREE** | |
| TASK #26 | OPT A | **DEFER** | Vezi §4 și §5 — înainte de OPT A, fix C4c altfel operează pe date corupte. |
| TASK #27 | Vault update | **AGREE** | Admin task, pass-through. |
| Hybrid Opțiunea C ordering | — | **DISAGREE (minor)** | Vezi §7 pentru re-ordering. Sonnet pune P3-A (isoWeek) înaintea P3-B (muscleState) — schimb ordinea pentru că H14g e user-visible (alertele "grupe neantrenate" sunt afișate), M3g e invisible (doar stagnation count intern). |
| Exit criteria (5 bullets) | — | **PARTIAL AGREE** | Bulletul (a) e corect. (b) corect. (c) corect. (d) — "produce exerciții diferite" — insuficient măsurabil (§5). (e) — DevTools check manual, non-reproductibil în CI. Adăugări necesare: "zero dedupe corruption după 100 refresh-uri" (C4c), "zero data loss la sesiune 4min30s" (C5c), "phase key prezent în toate logurile scrise după data X". |

---

## 3. Deeper Root Cause Analysis — bug-uri P2+P3

### C2c (cancelWorkout incomplet) — de ce există

**Root cause real:** `cancelWorkout` a fost scris ca **versiune simplificată** de `endSession`, nu ca **variantă** a lui. Când `endSession` a crescut (teardownInactivity → wake lock → clearDraft, toate adăugate incremental în 6+ commit-uri), `cancelWorkout` nu a fost ținut în sincronizare. Nu există `cleanupSession()` comun apelat de ambele.

**Architectural reveal:** Lipsește abstracția **"session lifecycle cleanup"**. În momentul ăsta sunt 4 exit points pentru sesiune (`endSession`, `cancelWorkout`, `confirmEarlyStop` → endSession, refresh browser → automatic), fiecare cu propria secvență de cleanup. Orice fix viitor pe lifecycle (adăugare `sessionHash` pentru deduplicare Firebase? nou state field?) va duce la **nou missed case în cancelWorkout**. Fix-ul propus e un patch — adevărata soluție: extract `teardownSession(options)` care primește flags (persist_draft, keep_logs, wake_lock, inactivity).

**Shared root cause cu:** C3c (rateSession missing idempotency). Ambele sunt exit-path routines cu responsibility fragmentată. Același tratament → extracție shared utility `sessionFinalizer` cu state machine explicit.

### C3c (rateSession double-tap)

**Root cause:** Modalul `#rating-modal` folosește `onclick=` inline cu strings (`window._pendingRatingSummary`). Nu există idempotency natural din browser events — tap-ul instant scrie și UI nu trece în "submitting" state. `syncToFirebase` e fire-and-forget, deci nici feedback vizual că "e în curs".

**Architectural reveal:** Pattern-ul **"button click → immediately call mutator → remove modal"** e repetat în 10+ locuri în codebase (grep `onclick=".*\\('` în rating.js, session.js, dashboard.js). Acolo unde mutator-ul e idempotent (UI toggle), e fine. Acolo unde nu (rating push, finishEarly push), e bug-uri waiting to happen.

**Shared root cause cu:** H1 (startSession no guard — dublu-click creează 2 timere), H7 (concurrent buildSession calls). Toate trei sunt "no idempotency on user-triggered mutations", dar spread peste 3 fișiere.

### H4c (resume pierde completedExercises)

**Root cause:** Draft schema a fost gândită ca **"minimum needed to resume exercise X at set Y"**, nu ca **"full session state snapshot"**. Câmpurile `sessKcalBurn`, `dropSetUsedThisSession`, `sessionKgOverride`, `activeNotes` (Set!) nu sunt serializate → resume se face incomplete. `completedExercises` e un Set, nu serializabil prin JSON nativ.

**Architectural reveal:** **State management is ad-hoc**. `state.js` are 20+ câmpuri care evoluează session-by-session. Nu există distincție clară între "volatile" (sessTimer, pauseTimer — resources) vs "semantic" (completedExercises, sessLog — data) vs "derived" (sessionTotalExercises — poate fi recalculat). Draft salvează un subset arbitrar. Orice nou state field adăugat în viitor → same bug.

**Shared root cause cu:** M7c (phase lipsă în logs) — ambele sunt "schema extension without schema". Un field se adaugă în codul scriitor, dar nu se propagă în toate codurile serializer/reader.

### H6c (patternLearning fără inflight guard)

**Root cause:** `setTimeout(..., 500)` e folosit ca pseudo-debounce, dar fără `clearTimeout`. Fiecare apel creează un nou timer; fără gate, multi-apelul face N timere. Acestea rulează secvențial în JS single-thread, dar blocă event loop când lovesc.

**Architectural reveal:** **Scattered background work fără abstraction.** Patternul "run heavy logic async" apare în 4+ locuri (patternLearning, syncTimer în firebase.js, autoBackup, confetti animation). Fiecare are propria strategie (setTimeout, setInterval, requestAnimationFrame, Promise.then). Nu există `backgroundScheduler` care să coordoneze prioritățile.

**Shared root cause cu:** H7c (concurrent buildSession). Ambele sunt async work without coordination.

### H11c (COACH_RELEVANT_KEYS incomplete)

**Root cause:** Lista a fost inițial gândită pentru "muscle state + weights" (primele 5 keys). Adăugările ulterioare (`unavailable-equipment`, etc.) nu au actualizat lista pentru că contract-ul între `DB.set` hook și `_directorCache.invalidate()` e **implicit** — lista trebuie updatată manual la orice key nou care afectează sesiunea.

**Architectural reveal:** **"Cache invalidation by explicit allow-list" anti-pattern.** Ar trebui invers: `DB.set` să invalideze default, și engines care vor caching explicit să declare "I don't care about key X". Sau: invalidare bazată pe **dependency tracking** (build-time enumerare a cheilor citite de buildSession). Lista hardcoded e fragile.

**Shared root cause cu:** C1 (calibration cold_start permanent, deja fix în FAZA 1.5) — ambele sunt "context dependency leaks via implicit contracts".

### M3g+H13g (isoWeek inconsistent)

**Root cause:** Funcția ISO 8601 e **matematică dificilă** (year boundary handling, Thursday rule) și **nu există helper central**. Dezvoltator (prob Sonnet într-o iterație anterioară) a implementat două versiuni, una mai corectă (stagnationDetector), una quasi-broken (responseProfile — `Math.ceil(diff/604800000)`).

**Architectural reveal:** **Util functions not extracted.** `src/util/` conține `logFilter.js`, `logNormalize.js`, `logBackup.js`, `autoBackup.js` — dar nu `dateUtils.js`. Toate engines au helper-e date locale ad-hoc (grep `isoWeek\|getYear\|getWeek` arată duplicări). Missing layer.

**Shared root cause cu:** L5 audit (date `2026-07-20` hardcoded în 8 locuri). Ambele = date/time utilities scattered.

### H14g (muscleState contract mismatch)

**Root cause:** `checkRecoveryGroups` a fost scrisă **against a different contract** decât ce `getMuscleState` returnează. Semnaturile au divergat în dezvoltare, probabil pentru că test-ul pentru proactiveEngine folosea un mock al muscleState cu formatul `{fatigue: 'fresh', daysSinceLast: 7}`, iar când engine-ul a fost integrat în flow real, nu s-a verificat că mock-ul reflectă realitatea.

**Architectural reveal:** **Missing type definitions / JSDoc contracts.** `getMuscleState` returnează `{muscle: number}`, `checkRecoveryGroups` așteaptă `{muscle: {fatigue, daysSinceLast}}`. Fără TypeScript sau JSDoc riguros, engines comunică prin "implicit shape". Orice engine refactor poate rupe silent consumers.

**Shared root cause cu:** M8 audit (readiness score brut vs 0-100 — `whyEngine` așteaptă 0-100, primește 1-5). Same pattern: shape drift across engine boundaries.

### M7c (phase tag lipsă)

**Root cause:** `confirmReps` a fost scris înainte de introducerea phase tracking. Când phase-uri au fost adăugate (sys.js), `confirmReps` nu a fost updatat. Logurile vechi nu au `phase`, logurile noi nu au `phase` nici ele.

**Architectural reveal:** **Log schema evolution without migration.** Adăugarea de câmpuri la o structură serializată în localStorage necesită: (a) scriere nouă, (b) citire tolerantă la absență, (c) possibly backfill. Doar (a) s-a făcut în mod ad-hoc (unele câmpuri la unele versiuni); (b) și (c) lipsesc. Deja există `LOG_SCHEMA_AUDIT_1_3.md` care recunoaște asta ca problemă. FAZA 2 M7c e o ieșire parțială.

**Shared root cause cu:** H4c (draft schema incomplete), toate bug-urile de "data structure divergence between write-site and read-site".

### Meta-pattern across all 8 bugs

**Common architectural root:** **lipsa "session lifecycle model" formal.** Starea sesiunii e răspândită în: `state.js` (20+ fields, in-memory), `session-draft` (localStorage JSON, subset), `logs` (individual set entries), `session-ratings`, `session-burns`, `early-stops`, `applied-patterns`. Nu există un document / schema / tip care zice "aceasta e forma unei sesiuni complete". Fiecare bug e un simptom al acestei incompletitudini.

Un refactor "session domain model" (estimat 8-12h) ar închide structural C2c, C3c, H4c, și ar preveni 5+ bug-uri viitoare. Sonnet nu propune asta (și e OK — scope-ul FAZA 2 e bug fix, nu arhitectură). Dar merită flag pentru FAZA 3.

---

## 4. Challenges to Sonnet's Plan

### 4.1 What Sonnet missed

**(a) C4c — dedupe cu set/kg lipsă (CRITICAL audit finding).** La `confirmReps` se scrie log cu `sets: 1` și `w: ...` dar fără `set` (singular, index-ul setului curent) și fără `kg`. `cleanDuplicateLogs` (main.js:117) face dedupe pe cheia `${session}|${ex}|${l.set||0}|${l.kg}|${l.reps}`. Cheia colapsează în `${session}|${ex}|0|undefined|${reps}` pentru toate seturile același exercițiu la aceeași greutate și reps. **La fiecare `init()` (pe fiecare refresh browser), 3 seturi devin 1 set.** Data pierdere cronică.

Auditul coach.js §2 (C4) documentează explicit. Fix-ul e o linie (adaugă `set: state.currentSet` și `kg: logKg`). Sonnet nu-l include în plan.

**(b) C5c — auto-delete sesiuni <5min fără opt-out (CRITICAL audit finding).** În `session.js:119`, `endSession` șterge silent toate logurile dacă sesiunea a durat <5 minute și nu e earlyStop. Un user care face un quick circuit (2 exerciții × 2 seturi în 4min30s — posibil) pierde totul. Niciun undo, niciun toast "Salvezi oricum?".

Auditul coach.js §2 (C5). Fix-ul e minor (add `confirm()` sau check `sessLog.length === 0` în loc de timp). Sonnet nu-l include.

**(c) H1 — startSession fără idempotency.** Audit HIGH. Dublu-click pe START → două `setInterval` → primul orphan. CPU waste minor, dar compounds cu H7c (concurrent buildSession). Fix e 1 linie (`if (state.sessActive) return`). Sonnet nu-l include.

**(d) Test strategy pentru OPT A e vagă.** Sonnet listează "5+ teste" pentru context-aware, dar **fiecare e de forma "assert [exercise X] is first when [weakGroup Y] is set"**. Astea sunt teste de **implementare**, nu de **comportament**. Nu probează că comportamentul e **corect** (adică util pentru user) — doar că o regulă de cod se execută. Vezi §5 pentru test strategy reală.

**(e) Feature flag pentru OPT A e mentionat dar neinstanțiat.** Sonnet zice "feature flag `ctx.calibrationLevel.contextSelectionEnabled`" — dar acel flag **nu există** în `calibration.js` actual. Planul presupune modificare la calibration module fără să o listeze ca task.

**(f) Interacția dintre cache invalidation (H11c) și sessionBuilder OPT A.** Dacă OPT A citește `ctx.weakGroups` care depinde de `ctx.allLogs`, și sesiunile sunt cache-uite prin `_cachedDirectorSession`, atunci la orice `DB.set` pe logs (fiecare confirmReps), cache e invalidat și sesiunea e re-built (presupunând că ctx se schimbă). Asta e corect acum (logs e în COACH_RELEVANT_KEYS), dar dacă OPT A introduce non-determinism (random din variety rotation), fiecare rebuild poate produce exerciții diferite, generând "flicker" în UI între sesiuni consecutive. Planul nu discută.

### 4.2 What prioritization is wrong

Sonnet zice Hybrid = P2 simple first, apoi session.js, apoi P3 engines, apoi P1. **Dar nu prioritizează C4c+C5c deloc** pentru că nu le vede. După re-prioritizare:

**Tier 0 — Data integrity first (mandatory before anything else):**
- Fix C4c (dedupe colapse) — 5 min
- Fix C5c (auto-delete sub 5min) — 10 min
- Fix H1 (startSession guard) — 5 min

**Tier 1 — User-visible UX bugs (Sonnet's P2):**
- Fix C2c, C3c, H4c, H6c, H11c

**Tier 2 — Engine logic correctness (Sonnet's P3):**
- Fix H14g (user-visible alerts), M3g+H13g, M7c

**Tier 3 — Architecture improvement (Sonnet's P1):**
- OPT C + OPT A

Tier 0 pre-requisite pentru Tier 3: fără fix pe dedupe, OPT A folosește `ctx.allLogs` amputate cu 66%, deciziile sunt irelevante.

### 4.3 What proposed fixes could introduce new problems

**(a) isoWeek implementation in Sonnet's plan is wrong (line 262).** Euristica `d.getMonth() === 11 && d.getDate() > 28` pentru iso-year detection e incorectă. ISO 8601 year e determinat de thursday-ul săptămânii curente, nu de calendar month. Săptămâna cu Dec 30-31 poate aparține ISO year-ului **următor**, iar săptămâna cu Jan 1-3 poate aparține ISO year-ului **precedent**. Implementare corectă:

```js
// correct ISO 8601 week + year
function isoWeek(ts) {
  const d = new Date(ts || Date.now());
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (t.getUTCDay() + 6) % 7; // Monday = 0
  t.setUTCDate(t.getUTCDate() - dayNum + 3); // Thursday of this week
  const isoYear = t.getUTCFullYear();
  const firstThu = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNum = (firstThu.getUTCDay() + 6) % 7;
  firstThu.setUTCDate(firstThu.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((t - firstThu) / (7 * 24 * 3600 * 1000));
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}
```

Dacă Sonnet livrează varianta proprie, va avea bug la ~1-3% din timestamp-urile în jurul an boundary. Test cu 2026-12-28 (ISO 2026-W53 sau 2027-W01?) e critical.

**(b) Derivare completedExercises din sessLog (H4c) depinde de `EX_SETS[ex]`.** Dacă `EX_SETS` se schimbă între versiuni (ex: Lat Pulldown era 3 sets, devine 4 sets), la resume un exercițiu cu 3 seturi complete (vechi) va fi marcat ca incomplete (3 < 4). Persistul direct în draft e mai robust. Recomand Opțiunea 1 din auditul original.

**(c) OPT A reorder prin `MUSCLE_EXERCISE_MAP`** — Sonnet propune să extragă map-ul din `EXERCISE_MUSCLES` în muscleMap.js. Dar `EXERCISE_MUSCLES` are structura `{exercise: {primary, secondary}}`, iar reordering-ul trebuie invers: `{muscle: [exercises]}`. Inversarea poate produce exerciții duplicate între muscles (Lat Pulldown apare la `lat` și `bi_long`, etc.). Dacă user are weakGroups=`['lat', 'bi_long']`, Lat Pulldown primește boost dublu? Nu e clar din plan.

**(d) `predictionToday.isHighRisk` → slice(0, 4)** — reducerea volum la 4 exerciții poate colide cu `recompile.deficit` care poate vrea volum adițional pentru a recupera sesiunile ratate. Conflict nu e rezolvat în plan.

### 4.4 Simpler alternatives

**(a) Pentru H11c:** Decât să enumeri keys, fă opus — cache valid **DOAR** dacă `lastCacheTime > lastWriteTime`. Hook `DB.set` pentru a actualiza un counter global `_dbWriteCounter`, cache păstrează snapshot-ul counter-ului la build time. E mai simple și robust long-term.

**(b) Pentru H4c:** În loc de derivare sau persist, **calculează on-demand în `updateSessionProgress()`**:
```js
const done = new Set(state.sessLog.map(s => s.ex).filter(ex => {
  const count = state.sessLog.filter(s => s.ex === ex).length;
  return count >= (EX_SETS[ex] || 3);
}));
```
Zero state mutation, computed property. Același risc de `EX_SETS` change, dar izolat la o funcție.

**(c) Pentru C3c:** Disable button pe click via `this.disabled = true` în onclick inline. 1 linie per buton, zero logic în rateSession. Guard-ul în rateSession rămâne ca safety net pentru calls programatice (via window). Mult mai simplu.

---

## 5. sessionBuilder Architecture Deep-Dive

### 5.1 OPT A as proposed — critique

**What Sonnet's OPT A actually does:**
1. Reorder (weakGroups first) — deterministic, no new exercises
2. `stagnationWeeks > 3` → swap to alternative (via `resolveExercise`) — deterministic if alternative stable
3. `predictionToday.isHighRisk` → slice to 4 — deterministic
4. "variety from allLogs" for OPTIMIZED — undefined behavior ("deprioritize if in last 2 sessions")

**Critique:** Points 1-3 are **reordering/filtering rules**, not real exercise selection. The static list (`PUSH` → 6 exercises) is untouched — OPT A just reorders or truncates it. Real "context-aware selection" would **choose** exercises from a larger pool based on muscle volume targets (MEV/MAV/MRV from `VOLUME_LANDMARKS`), not just reorder a fixed list of 6.

**Example:** Today is PUSH. Static list = 6 exercises. User's weakGroup = `['delt_rear']`. None of the 6 exercises train `delt_rear` (check: Incline DB Press hits chest_upper/delt_front, DB Shoulder Press hits delt_front/delt_mid, Lateral Raises hits delt_mid, Overhead Triceps hits tri_long, Pushdown hits tri_lateral, Pec Deck hits chest_mid — **zero delt_rear coverage**). Reorder is no-op. OPT A gives no benefit.

**Real context-aware selection** would: **inject** Rear Delt Fly or Face Pulls into the PUSH session when delt_rear is weak, even though they're not in the default list. That's a fundamentally different operation (pool-based selection vs. list reordering).

### 5.2 Alternatives to Sonnet's OPT A

**Option α — Rule-based (what Sonnet proposes):** Hardcoded rules. Predictable. Fast to ship. Low ceiling.

**Option β — Scoring-based:** Each candidate exercise gets a score based on multiple factors:
```
score(ex) = weakGroupBonus(ex, weakGroups) 
          + varietyBonus(ex, recentLogs)
          - stagnationPenalty(ex, stagnationData)
          - equipmentPenalty(ex, unavailable)
          + phaseBonus(ex, phase)
```
Pick top N. Explainable (score breakdown = whyEngine content). Extensible (add factor = add term). Medium complexity.

**Option γ — ML-lite (pattern-based recommendation):** Learn user's actual response to exercise substitutions from `patternLearning`. If "swapping DB Shoulder Press for OHP improved user's shoulder volume 2 weeks later", remember. Too complex for current data volume (<6 months history).

**Recommendation:** **Start with β (scoring), fall back to α for quick win.** Sonnet's α is acceptable MVP if explicitly labeled as "phase 1 — reordering only". DO NOT call it "context-aware selection" yet — it's "context-aware reordering". Set expectation correctly.

### 5.3 Integration points

SessionBuilder sits **between** these:

```
buildCoachContext() → ctx (with allLogs, muscleState, weakGroups, etc.)
              ↓
ruleEngine.evaluate(ctx) → {rest, deload, normal}
              ↓ (if normal)
sessionBuilder.buildSession(sessionType, ctx) ← OPT A lives here
              ↓ (list of exercises)
resolveExercise() — equipment alternatives
              ↓
DP.getSmartRecommendation — kg/reps per exercise
              ↓
applyAAAdjustments — safety on notes (form issues)
              ↓
realityEngine.validate — CUT/BULK limits
              ↓
applyPatterns — reduce volume if early_end pattern
              ↓
final session
```

**Critical integration point #1: DP depends on selected exercises.** If OPT A swaps exercise X for Y, DP generates kg/reps for Y. If Y never been trained, DP returns INIT recommendation (weight 10-20kg). User gets "new exercise with 20kg recommendation" — surprise. OPT A must gate injections behind **calibrationLevel OPTIMIZED** or similar, ensuring some history exists for the injected exercise.

**Critical integration point #2: reality.js enforces CUT/BULK rep caps.** If OPT A injects a 4×12-15 exercise during CUT, reality.js caps at 10. Works. OK.

**Critical integration point #3: AA.applyTo.** AA is "mostly dead" per audit C1 (RPE hardcoded at 8 → no trigger). But forceDeload on form issues still fires. If OPT A injects new exercise, user has no form notes → AA doesn't trigger. Fine, but opaque.

**No integration with:** `patternLearning` at session build time (patterns read from DB via `applied-patterns`, not from ctx). If OPT A produces session, and later user does early-stop, pattern learning won't feed back for ~3+ sessions. OK — not realtime loop.

### 5.4 Test strategy — proving "context-aware works, not just appears to"

Sonnet's tests (5 tests, "assert Lat Pulldown first when lat weak") are **presence tests**: "the rule fired". They don't prove **usefulness**.

**Real test strategy:**

**Unit level (isolated rule tests):**
- Deterministic: given ctx, buildSession produces expected output. 5-10 tests. OK.

**Integration level:**
- Given 80-session fixture (weak lat — insufficient pull volume), OPT A produces session where over 3 simulated weeks, lat volume increases 20%. Regenerate weakGroups → lat no longer weak. (Fixture + simulation, not just snapshot.)

**Property-based:**
- For any ctx, buildSession outputs at least 3 exercises (unless equipment blocks all).
- For any ctx, output exercises ⊆ some known pool (no random strings).
- If ctx.weakGroups non-empty, at least one output exercise targets one of weakGroups (if phase allows).

**Acceptance test:**
- Run on Daniel's actual logs (80+ sessions existing). Manual inspection: "are the suggestions sensible?" — subjective but necessary.

**Regression test:**
- "Before/after" snapshot for 5 specific user profiles (cold, personalizing, optimized × weak/no-weak × stagnant/fresh). Document expected session output per profile. Any future change must preserve or improve.

**The missing one:** **End-to-end test with simulated user behavior.** Not in scope for FAZA 2, but flag for FAZA 3 — automated simulator that plays scenarios ("user trains 3x/week, skips every 2nd Wednesday, readiness drops when kcal<1800") and measures coach adaptation.

### 5.5 What "context-aware" means concretely for Daniel today

Daniel's current state (inferred from git log and audits):
- 80+ sessions existent (calibration shouldn't be COLD_START anymore after FAZA 1.5 fix)
- CUT phase active
- Weak groups: **unknown** (we haven't seen output)
- Training 4x/week (based on PROG structure)
- Target: 90kg by 2026-07-20

**Concrete context-aware benefits that would matter TO DANIEL:**
1. If he's been stagnant on Lat Pulldown 3+ weeks → suggest Cable Row variation or adding `+1 set` (already in DP.js partially via stage 3).
2. If his delt_rear is undertrained (per muscleState contract fix H14g) → session should include Rear Delt Fly or Face Pulls **even on non-delt days** (Push Day).
3. If predictionToday.isHighRisk (from low readiness + CUT kcal deficit) → reduce exercise count to 4 ESSENTIAL compound lifts, not slice(0, 4) of existing list (the first 4 might all be isolation).

Sonnet's OPT A achieves #1 partially, #3 shallowly, and fails #2 entirely (fixed list doesn't inject new exercises).

**Minimum viable version for Daniel:** OPT C + a **subset of OPT A**:
- Reorder weakGroup exercises first (valor: small)
- Reduce volume on high-risk days (valor: medium — risk: might drop the wrong exercise)
- Skip the "stagnation alternative injection" for now (complex, interacts with DP stage 3)
- Skip "variety rotation" for now (undefined behavior)

This is a strict subset of OPT A. Ships in 1h instead of 2h. Delivers 60% of the benefit. Remaining 40% → FAZA 3 when user data / feedback informs the exact scoring.

---

## 6. Production Readiness Assessment

### 6.1 After FAZA 2 — what remains

Even after FAZA 2 complete, the following will block public launch:

**Hard blockers (data integrity):**
1. **C1 audit bulletproof — already fixed în FAZA 1.5.** OK.
2. **C2 audit bulletproof — Firebase 500 cap — already fixed în FAZA 1.8 Step 1 (5000).** OK for ~2 years.
3. **C3 audit bulletproof — `restoreFromBackup` naming collision** — not fixed. Manual recovery broken.
4. **C4 audit bulletproof — tierStorage.js dead code** — not fixed. Long-term scale issue.
5. **C5 audit bulletproof — `_recommendRaw` mutates DB as side effect** — not fixed. Re-entrancy unsafe.
6. **C6 audit bulletproof — `init()` unawaited** — not fixed. Silent init failures.
7. **C7 audit bulletproof — Firebase open (no auth)** — deferred per user decision. Acceptable for single-user prototype, blocker for public launch.

**Hard blockers (security):**
- No auth (Firebase open rules)
- Device secret (FIREBASE_URL) exposed in client bundle
- XSS risk — inline onclick with user data (L3 audit coach.js)

**UX blockers for non-Daniel users:**
- Onboarding flow assumes Daniel-specific defaults
- No multi-user support anywhere
- PROG is hardcoded for Daniel's 4-day split

**Observability:**
- No analytics beyond Sentry. No usage metrics.
- No error rate monitoring for Firebase sync failures
- No way to know if a feature is actually used

### 6.2 Real measurable exit criteria for FAZA 2

Replace the vague "zero breakdown in 3-5 days" with:

**Data integrity metrics:**
- For any user fixture (10/100/1000 logs), `cleanDuplicateLogs` preserves all distinct sets (no collapse) — **property-based test**.
- For any user action sequence (start → cancel → start → rate → refresh), resulting DB state is consistent (no orphan sessions, no leaked timers, no duplicate ratings) — **E2E test suite**.
- Log schema conformance: 100% of logs written post-fix have `phase`, `set`, `kg`, `ts` fields — **unit test on confirmReps**.

**Behavior metrics:**
- After cancel workout: 0 event listeners on document, 0 active timers, 0 wake locks — **manual + DevTools check** (acknowledge non-automated).
- After 5+ days without training: proactive alert "undertrained groups" appears — **unit test on runProactiveChecks**.
- After 100 rapid taps on rating button: exactly 1 entry in session-ratings — **stress test**.

**Context awareness metrics (if OPT A ships):**
- For user with `weakGroups=['delt_mid']`, PUSH session places at least one delt_mid-targeting exercise in top 3 positions — **deterministic test**.
- For user with `predictionToday.isHighRisk=true`, output session has ≤ 4 exercises — **deterministic test**.
- Manual review: 5 simulated user profiles produce session recommendations that Daniel subjectively rates ≥4/5 on appropriateness — **manual acceptance gate**.

**Performance:**
- `coachDirector.buildSession` completes in <500ms on mid-range Android — **measured manually**.
- Pattern analysis runs max 1x per 2s regardless of navigation rate — **unit test on inflight guard**.

**Regression:**
- All 232 existing tests still pass.
- No new warnings in console during normal flow.

### 6.3 Earliest viable release state

**Earliest "Daniel personal tool" release (where it already is):** ready now, FAZA 1 complete.

**Earliest "private beta" (Daniel + 2-3 invited users):** after FAZA 2 + C4c fix + C5c fix + `init()` unawaited + restoreFromBackup collision. Estimate: FAZA 2 (~7h) + additional fixes (~2h) = 9h.

**Earliest "public launch":**
- FAZA 2 complete
- FAZA 3 (observability, error tracking, analytics)
- Firebase auth + per-user rules
- Onboarding for non-Daniel defaults
- Basic legal (privacy policy for data stored)
- Performance: sub-3s initial load on mid-range Android

Estimate for public launch: **FAZA 2 + FAZA 3 + ~2 weeks additional = ~8-10 weeks from today**. Not achievable with "bug-fix only" approach. Needs a FAZA 3 scope doc.

---

## 7. Re-Ordered Task List

Sonnet's ordering with my modifications.

### TASK #22a — NEW — Tier 0 data integrity (C4c + C5c + H1)
**Priority:** CRITICAL | **Effort:** 20 min + teste

Rationale: these must land before anything else because they corrupt data on every init/refresh.

1. `logging.js:~99` (confirmReps): add `set: state.currentSet, kg: logKg, phase: SYS.getPhase()` to log object (also resolves M7c in same stroke)
2. `session.js:119` (endSession auto-delete): change condition to `state.sessLog.length === 0 && !hasEarlyStop` OR add `confirm()` prompt
3. `session.js:29` (startSession): add `if (state.sessActive) return;` guard at top
4. Tests: C4c dedup preservation (3 sets same exercise same weight/reps → still 3 after cleanDuplicateLogs), C5c no-auto-delete with logs, H1 idempotency

### TASK #22 — Sonnet's P2 simple batch (C3c + H6c + H11c + rating idempotency)
**Priority:** HIGH | **Effort:** 25 min + teste

Unchanged from Sonnet's plan.

### TASK #23 — Sonnet's P2 session.js batch (C2c + H4c)
**Priority:** HIGH | **Effort:** 35 min + teste

Modify H4c fix to **Opțiunea 1 (persist completedExercises in draft)** instead of Sonnet's derivation-based fix — more robust against EX_SETS changes.

### TASK #24a — NEW split from TASK #24 — H14g muscleState fix (user-visible)
**Priority:** HIGH | **Effort:** 30 min + teste

Split because this fixes user-visible alerts ("grupe neantrenate"), higher priority than invisible isoWeek.

### TASK #24b — Reduced TASK #24 — isoWeek + phase tag (backend correctness)
**Priority:** MEDIUM | **Effort:** 45 min + teste

1. `src/util/dateUtils.js` with **correct ISO 8601** isoWeek (not Sonnet's heuristic)
2. Replace in stagnationDetector.js and responseProfile.js
3. Phase tag: **already done in TASK #22a** (M7c merged into confirmReps fix)
4. Tests: 4 isoWeek year boundary tests (2026-12-28, 2026-12-31, 2027-01-01, 2027-01-04)

### TASK #25 — OPT C sessionBuilder refactor (pure function)
**Priority:** MEDIUM | **Effort:** 45 min + teste

Unchanged from Sonnet.

### TASK #26 — OPT A REDUCED SCOPE sessionBuilder
**Priority:** MEDIUM | **Effort:** 60 min + teste (down from 2h)

**Reduced scope:**
- Reorder by weakGroups only
- Reduce to 4 exercises on predictionToday.isHighRisk
- Skip stagnation injection (defer)
- Skip variety rotation (defer)
- Add **explicit feature flag** `calibration.contextSelectionEnabled` (requires task to add flag to calibration.js)
- Gate all logic behind PERSONALIZING+ tier
- 3 tests: reorder, volume reduce, flag disabled = no-op

### TASK #27 — Vault Update
**Priority:** LOW | **Effort:** 15 min

Unchanged.

### TASK #28 — NEW — Defer to FAZA 3 or drop
Keep in mind (not to queue now):
- Full OPT A scope (stagnation injection, variety rotation, scoring-based) — FAZA 3
- C3 audit bulletproof (restoreFromBackup collision) — FAZA 2.5 standalone
- C6 audit bulletproof (init unawaited) — FAZA 2.5 standalone

### Ordering rationale

Original Sonnet hybrid: P2-A + B + D → P2-C → P3 → P1-C → P1-A
New: **TASK #22a (Tier 0)** → TASK #22 (P2 simple) → TASK #23 (session.js) → TASK #24a (H14g) → TASK #24b (isoWeek) → TASK #25 (OPT C) → TASK #26 (OPT A reduced) → TASK #27

Total effort: ~6h (was ~7h). Lower risk. Higher data integrity guarantees.

---

## 8. Final Recommendation

### Proceed? Modify? Re-plan?

**MODIFY.** Sonnet's plan is 80% correct. Accept it as-is for P2 simple batch (#22), session.js batch (#23), isoWeek + phase (#24b), OPT C (#25). Reject it as-is for:
- Missing Tier 0 (C4c, C5c, H1) — **add** as TASK #22a before anything
- OPT A full scope — **reduce** to reorder + volume-cap only; defer injection and variety
- Exit criteria — **replace** with measurable metrics from §6.2

### Top 3 risks for FAZA 2

**Risk 1 — Silent data corruption persists through FAZA 2 if C4c/C5c ignored.** Every `init()` still colapses seturi. OPT A builds on garbage. Mitigation: TASK #22a mandatory first.

**Risk 2 — OPT A ships as "context-aware" but is only reordering.** Marketing expectation > delivered value → user perceives no difference → loss of confidence. Mitigation: reduced scope + honest labeling. Don't call it "context-aware selection"; call it "weakness-prioritized ordering".

**Risk 3 — isoWeek implementation ships with Sonnet's euristic year-boundary logic, bug fires at Dec 29-Jan 3.** Silent failure (stagnation counter reset on wrong weeks). Mitigation: use standard ISO 8601 implementation (§4.3), test with 4 boundary dates.

### One thing Sonnet got right that deserves emphasis

**Hybrid ordering (Opțiunea C) over pure P1-first or pure P2-first.** Sonnet correctly identified that P2 simple batch builds momentum cheaply, that session.js needs isolation, that engine batch can ship together, and that OPT A comes last. This ordering is non-obvious — naive planners do "priorities in order" (P1 first, then P2, then P3). Sonnet saw that **dependency and risk matter more than stated priority**. That's good systems thinking.

Emphasize: **always order by dependency and risk, not by assigned priority tier.** This ordering principle is a reusable pattern, should be documented for FAZA 3.

---

*Generat de: Claude Opus 4.7 | Critical review — zero cod modificat*
