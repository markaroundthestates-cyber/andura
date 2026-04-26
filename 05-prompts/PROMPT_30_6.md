# PROMPT TASK #30.6 — patternLearning reads CDL (ENGINE ONLY)

**Target:** sonnet | **Effort:** xhigh | **Scope:** patternLearning citește CDL + parallel write applied-patterns

---

## ⚠️ Pre-requisites (verifică ÎNAINTE să rulezi)

- [ ] **GATE C live integration test PASSED** marți. Dacă nu — STOP, nu rula 30.6 încă.
- [ ] **TASK #31 + #31.5 deployed pe production** și smoke test trecut.
- [ ] **Repo curat** — `git status` clean, on main, latest pulled.

---

## ⚠️ SCOPE STRICT

ENGINE ONLY. NU modifica:
- `src/pages/coach/renderIdle.js` (banner UI vine în 30.8)
- UI strings pentru pattern types (vine în 30.8)
- `src/engine/adherence.js` (vine în 30.7)
- `src/engine/coachContext.js` ctx.patterns logic (vine în 30.8)

Dacă apare scope creep, STOP și raportează.

---

## Step 1 — paste direct ca slash command (Enter):

```
/model sonnet
```

## Step 2 — copy code block-ul integral, paste, Enter:

```
Implementează TASK #30.6 din 10-exec-queue/EXEC_QUEUE.md — patternLearning reads CDL primary + parallel write to applied-patterns conform ADR 011.

SCOPE STRICT: ENGINE ONLY. NU atinge renderIdle.js, NU adăuga UI strings, NU modifica adherence.js, NU modifica ctx.patterns logic în coachContext.js.

═══════════════════════════════════════════════════════════════════
CITEȘTE ÎNTÂI (mandatory)
═══════════════════════════════════════════════════════════════════

1. cat docs/decisions/011-coach-decision-log-architecture.md
   Atenție specială: secțiunile "matchScore — gate, not weighted", "Decommissioning applied-patterns" (parallel period), "Synthetic entries with reduced weight (0.5×)"

2. cat src/engine/patternLearning.js
   Context complet: implementarea actuală cu SKIP_DAY, EARLY_END, STAGNATION, PEAK_HOURS

3. cat src/util/coachDecisionLog.js
   Caută export-uri: readAllActive, readActiveForDate, computeMatchScore, STORAGE_KEYS

4. cat src/util/cdlBackfill.js
   Pentru shape entries synthetic vs real

5. cat src/engine/coachContext.js | grep -A 20 "patterns"
   Cum se populează ctx.patterns curent (ca să NU strici)

═══════════════════════════════════════════════════════════════════
PRE-FLIGHT (verifică în repo, NU PRESUPUNE)
═══════════════════════════════════════════════════════════════════

grep -rn "applied-patterns" src/ --include="*.js" | head -30
grep -rn "analyzeAndApplyPatterns\|getAppliedPatterns\|dismissPattern" src/ --include="*.js" | head -20
grep -n "export function" src/util/coachDecisionLog.js
grep -n "patterns" src/engine/coachContext.js | head -10

Notează (raportează în răspunsul final):
- Toate call-site-urile pentru analyzeAndApplyPatterns (mai ales main.js, onboarding.js, coach.js, nav.js)
- Cum se populează ctx.patterns în coachContext.js (sursă curentă)
- Dacă coachDecisionLog exportă readAllActive cu filterFn parameter optional
- Dacă există computeMatchScore exportat sau e helper intern

GATE: Dacă API public CDL (readAllActive cu filterFn) NU există cu signature așteptat — STOP, raportează exact ce ai găsit înainte să modifici cod.

═══════════════════════════════════════════════════════════════════
DESIGN — funcții noi în patternLearning.js
═══════════════════════════════════════════════════════════════════

Adaugă export public NOU (NU înlocui analyzeAndApplyPatterns existent încă):

/**
 * Analyze CDL entries and produce pattern set derived from coach decisions.
 * Returns array — caller decides what to do with them (write, filter, ignore).
 *
 * Synthetic entries are weighted 0.5× per ADR 011.
 *
 * @param {object} opts
 * @param {number} [opts.windowDays=30] — lookback window
 * @returns {Array<object>} — patterns derived from CDL
 */
export function analyzeFromCDL({ windowDays = 30 } = {}) {
  // Implementation per spec below
}

LOGICA analyzeFromCDL:

1. Read CDL via coachDecisionLog.readAllActive() — filtrează superseded automat conform ADR 011

2. Filter pe windowDays:
   - cutoff = Date.now() - (windowDays * 86400000)
   - keep entries unde new Date(entry.date).getTime() >= cutoff
   - keep doar entries cu outcome populated (entry.outcome !== null)

3. Calculează metrici weighted (synthetic === true → 0.5×):

   const weight = (e) => e.synthetic === true ? 0.5 : 1.0;
   const weightedProposedCount = entries.reduce((s, e) => s + weight(e), 0);
   const weightedExecutedCount = entries.filter(e => e.outcome.executed === true && !e.outcome.deviation).reduce((s, e) => s + weight(e), 0);
   const weightedPartialCount = entries.filter(e => e.outcome.executed === 'partial').reduce((s, e) => s + weight(e), 0);
   const weightedSkippedCount = entries.filter(e => e.outcome.executed === false).reduce((s, e) => s + weight(e), 0);
   const weightedDeviationCount = entries.filter(e => e.outcome.deviation === true).reduce((s, e) => s + weight(e), 0);
   const weightedEarlyStopCount = entries.filter(e => e.outcome.earlyStop === true).reduce((s, e) => s + weight(e), 0);

4. Compute rates (null safe):
   const adherenceRate = weightedProposedCount > 0
     ? (weightedExecutedCount + weightedPartialCount * 0.5) / weightedProposedCount
     : null;
   const deviationRate = weightedProposedCount > 0
     ? weightedDeviationCount / weightedProposedCount
     : null;
   const earlyEndRate = weightedProposedCount > 0
     ? weightedEarlyStopCount / weightedProposedCount
     : null;

5. Generează patterns conform ADR 011:

   const patterns = [];
   const MIN_PROPOSED_FOR_PATTERN = 4; // guard împotriva false positives

   // LOW_ADHERENCE (NEW pattern type)
   if (adherenceRate !== null && adherenceRate < 0.5 && weightedProposedCount >= MIN_PROPOSED_FOR_PATTERN) {
     patterns.push({
       type: 'LOW_ADHERENCE',
       adherenceRate: Math.round(adherenceRate * 100),
       windowDays,
       proposedCount: Math.round(weightedProposedCount * 10) / 10,
       appliedAt: Date.now()
     });
   }

   // HIGH_DEVIATION (NEW pattern type)
   if (deviationRate !== null && deviationRate > 0.3 && weightedProposedCount >= MIN_PROPOSED_FOR_PATTERN) {
     patterns.push({
       type: 'HIGH_DEVIATION',
       deviationRate: Math.round(deviationRate * 100),
       windowDays,
       proposedCount: Math.round(weightedProposedCount * 10) / 10,
       appliedAt: Date.now()
     });
   }

   // EARLY_END (REUSE existing type, citit din CDL outcome.earlyStop)
   if (earlyEndRate !== null && earlyEndRate > 0.4 && weightedProposedCount >= MIN_PROPOSED_FOR_PATTERN) {
     patterns.push({
       type: 'EARLY_END',
       earlyEndRate: Math.round(earlyEndRate * 100),
       windowDays,
       appliedAt: Date.now()
     });
   }

   // STAGNATION — reuse existing logic din _analyze (citește logs cu .w field)
   // Mută acum logica STAGNATION existentă din _analyze în analyzeFromCDL,
   // citește DB.get('logs') direct (NU CDL — STAGNATION e per-exercise weight pattern, nu session pattern)
   const logs = DB.get('logs') ?? [];
   const exNames = [...new Set(logs.filter(l => !l.baseline && l.ex).map(l => l.ex))];
   const exStagnation = [];
   exNames.forEach(ex => {
     const exLogs = logs.filter(l => l.ex === ex && l.w).slice(0, 12);
     if (exLogs.length < 9) return;
     const last3w = exLogs.slice(0, 3).map(l => l.w);
     const prev3w = exLogs.slice(6, 9).map(l => l.w);
     if (last3w.every(w => w === last3w[0]) && prev3w.every(w => w === prev3w[0]) && last3w[0] === prev3w[0]) {
       exStagnation.push({ ex, kg: last3w[0] });
     }
   });
   if (exStagnation.length > 0) {
     patterns.push({
       type: 'STAGNATION',
       exercises: exStagnation.map(e => e.ex),
       appliedAt: Date.now()
     });
   }

   // SKIP_DAY — DEPRECATED. NU se generează aici. NU scrie cod care produce SKIP_DAY.
   // PEAK_HOURS — rămâne în _analyze legacy (timing pattern, nu CDL-derived)

6. NU adăuga `description` field în patterns. UI strings vin în 30.8 separate.
7. NU adăuga `confidence` field. Filter în calibration tier funcționează pe MIN_PROPOSED_FOR_PATTERN guard.
8. Returnează array. NU scrie în localStorage de aici.

═══════════════════════════════════════════════════════════════════
PARALLEL WRITE — modifică analyzeAndApplyPatterns existent
═══════════════════════════════════════════════════════════════════

În analyzeAndApplyPatterns (după setTimeout, în _analyze):

1. Păstrează logica existentă (SKIP_DAY, EARLY_END, STAGNATION, PEAK_HOURS via burns) — scrie în applied-patterns ca până acum
2. ADIȚIONAL, după block-ul existent care scrie applied-patterns, adaugă:

   // Parallel: also compute CDL-derived patterns and write to new key
   try {
     const cdlPatterns = analyzeFromCDL({ windowDays: 30 });
     if (cdlPatterns.length > 0) {
       DB.set('cdl-patterns', cdlPatterns);
     } else {
       // Clear stale cdl-patterns dacă nu mai sunt patterns active
       DB.set('cdl-patterns', []);
     }
   } catch (err) {
     console.error('[patternLearning] analyzeFromCDL failed:', err);
     // Non-fatal — applied-patterns oricum scris în paralel
   }

Asta menține:
- applied-patterns scris ca legacy (pentru engines/UI care încă citesc)
- cdl-patterns scris parallel (citit ulterior de coachContext în 30.8 după validare)
- Niciun reader nu se sparge

3. Adaugă constanta sus în file:
   export const CDL_PATTERNS_KEY = 'cdl-patterns';

═══════════════════════════════════════════════════════════════════
SYNC_KEYS update (firebase.js)
═══════════════════════════════════════════════════════════════════

cat src/firebase.js | grep -A 3 "SYNC_KEYS\|coach-decisions"

Adaugă 'cdl-patterns' în array-ul SYNC_KEYS (lângă 'applied-patterns' și 'coach-decisions'). Asta asigură sync Firebase pentru noul key.

═══════════════════════════════════════════════════════════════════
TESTE — extinde src/engine/__tests__/patternLearning.test.js (sau creează dacă nu există)
═══════════════════════════════════════════════════════════════════

Verifică întâi:
ls src/engine/__tests__/patternLearning.test.js 2>/dev/null || echo "NU EXISTĂ — trebuie creat"

Dacă NU există, creează-l. Dacă există, extinde.

Helper la top:
function makeCDLEntry({ date, executed = true, deviation = false, earlyStop = false, synthetic = false }) {
  return {
    id: `cd_${date}_${Math.random().toString(36).slice(2, 6)}`,
    ts: new Date(date).getTime(),
    date,
    synthetic,
    superseded: false,
    supersedes: null,
    context: { calibrationLevel: 'PERSONALIZING', readinessScore: 75, partial: synthetic },
    proposed: {
      sessionType: 'PUSH',
      rationale: { winnerId: 'CUT_CONSERVATIVE', winnerPriority: 85, overridden: [] },
      exercises: ['Incline DB Press', 'Pec Deck'],
      proposedSets: 8,
      volumeMultiplier: 1.0,
      notes: ''
    },
    outcome: {
      executed,
      deviation,
      actualSessionType: deviation ? 'PULL' : 'PUSH',
      matchScore: deviation ? null : 0.95,
      completedExercises: executed === true ? 2 : (executed === 'partial' ? 1 : 0),
      totalProposedExercises: 2,
      actualSets: executed === true ? 8 : (executed === 'partial' ? 4 : 0),
      proposedSets: 8,
      actualExercises: executed === true ? ['Incline DB Press', 'Pec Deck'] : (executed === 'partial' ? ['Incline DB Press'] : []),
      actualDurationMins: executed === true ? 45 : (executed === 'partial' ? 22 : 0),
      earlyStop,
      rating: 'normal',
      completedAt: new Date(date).getTime() + 45 * 60000
    }
  };
}

8 teste minim:

1. analyzeFromCDL returns empty array when no CDL entries

2. analyzeFromCDL ignores entries with outcome === null (no proposed-only entries)

3. LOW_ADHERENCE fires when adherence < 50% with 4+ proposed entries
   - 4 entries: 1 executed, 3 skipped → adherence 25% → LOW_ADHERENCE pattern
   - assert pattern.adherenceRate === 25
   - assert pattern.windowDays === 30

4. LOW_ADHERENCE does NOT fire with < 4 proposed entries (guard)
   - 2 entries: 0 executed, 2 skipped → adherence 0% but only 2 proposed → no pattern

5. HIGH_DEVIATION fires when deviation > 30% with 4+ entries
   - 5 entries: 2 with deviation === true, 3 normal → deviation 40% → HIGH_DEVIATION pattern
   - assert pattern.deviationRate === 40

6. Synthetic entries weighted 0.5× in adherence calc
   - 4 real entries (all executed) + 4 synthetic entries (all executed)
   - real weight 4×1.0 = 4, synthetic 4×0.5 = 2
   - total weighted proposed = 6, executed = 6 → adherence 100%
   - assert NOT LOW_ADHERENCE

7. SKIP_DAY pattern type is NEVER produced by analyzeFromCDL
   - any input → assert result.find(p => p.type === 'SKIP_DAY') === undefined

8. STAGNATION still detected from logs (not CDL)
   - Setup logs cu 12 entries pe Bench Press, w identic ultimele 9
   - assert result includes { type: 'STAGNATION', exercises: ['Bench Press'] }

9. EARLY_END detected from CDL outcome.earlyStop
   - 5 entries: 3 with earlyStop === true → earlyEndRate 60% > 40% → EARLY_END
   - assert pattern.earlyEndRate === 60

10. Parallel write: analyzeAndApplyPatterns(logs) writes BOTH applied-patterns AND cdl-patterns
    - Setup CDL entries + logs
    - Call analyzeAndApplyPatterns(logs)
    - Wait setTimeout 500ms (use vi.useFakeTimers + vi.runAllTimers)
    - assert localStorage.getItem('applied-patterns') !== null
    - assert localStorage.getItem('cdl-patterns') !== null
    - Parse cdl-patterns → assert array shape

═══════════════════════════════════════════════════════════════════
BUILD + TESTS
═══════════════════════════════════════════════════════════════════

npm run build
npm run test:run

Expected:
- Build verde
- 371 + ZZ tests pass (was 371 baseline post-#31.5, expected +10 new minimum)
- Zero existing tests broken

Dacă teste existente eșuează cu schimbări de comportament neașteptate — STOP, raportează care + de ce.

═══════════════════════════════════════════════════════════════════
COMMIT + PUSH (2 commits)
═══════════════════════════════════════════════════════════════════

Commit 1 — implementation:
git add src/engine/patternLearning.js src/engine/__tests__/patternLearning.test.js src/firebase.js
git commit -m "feat(cdl): TASK #30.6 — patternLearning reads CDL + parallel write (ADR 011)

- analyzeFromCDL: reads coach-decisions, computes adherenceRate + deviationRate
- New patterns: LOW_ADHERENCE (<50% adherence) + HIGH_DEVIATION (>30% deviation)
- Synthetic entries weighted 0.5x per ADR 011
- SKIP_DAY DEPRECATED (no longer generated)
- EARLY_END now from CDL outcome.earlyStop (was session-burns)
- STAGNATION unchanged (logs-based)
- Parallel write: applied-patterns (legacy) + cdl-patterns (new)
- SYNC_KEYS extended with cdl-patterns
- 10+ new tests"
git push

Commit 2 — queue update:
Update 10-exec-queue/EXEC_QUEUE.md: TASK #30.6 status PENDING → DONE
Update 10-exec-queue/EXEC_RESULTS.md: prepend new entry standard format

git add 10-exec-queue/EXEC_QUEUE.md 10-exec-queue/EXEC_RESULTS.md
git commit -m "docs(queue): TASK #30.6 marked DONE in EXEC_QUEUE/RESULTS"
git push

═══════════════════════════════════════════════════════════════════
NU FACE
═══════════════════════════════════════════════════════════════════

- NU modifica src/pages/coach/renderIdle.js (banner UI = 30.8)
- NU modifica src/engine/adherence.js (rewrite = 30.7)
- NU modifica src/engine/coachContext.js ctx.patterns logic (= 30.8)
- NU adăuga UI strings sau description fields în patterns
- NU șterge old SKIP_DAY logic din _analyze legacy (parallel period — păstrează până la 30.9 decommission)
- NU începe automat 30.7 sau 30.8. STOP după push.

═══════════════════════════════════════════════════════════════════
RAPORT FINAL în chat
═══════════════════════════════════════════════════════════════════

[PROMPT 5 — TASK #30.6 — model: sonnet]
Pre-flight:
- analyzeAndApplyPatterns call sites găsite: <list>
- ctx.patterns sursă curentă: <description>
- coachDecisionLog API: readAllActive(filterFn) ✅/❌
- computeMatchScore: ✅ exported / ❌ internal
Build: ✅/❌
Tests: XXX/YYY pass (was 371 baseline, +ZZ new)
Commits: <hash1> (impl), <hash2> (queue)
SYNC_KEYS updated: ✅
Patterns generated correctly: LOW_ADHERENCE ✅, HIGH_DEVIATION ✅, EARLY_END from CDL ✅, STAGNATION from logs ✅, SKIP_DAY removed ✅
Issues: NONE / desc

STOP după push. Awaiting Daniel sign-off pentru parallel period start (GATE D — non-blocking pentru 30.7).
```
