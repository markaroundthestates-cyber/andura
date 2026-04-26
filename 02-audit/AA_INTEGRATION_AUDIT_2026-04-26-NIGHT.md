# AA Detection Integration Audit — 2026-04-26 NIGHT

**Scope:** autoAggressionDetection.js integration în coachContext.js + populateOutcome  
**Status:** CRITICAL GAPS IDENTIFIED — module LIVE dar zero production integration

---

## Executive Summary

`autoAggressionDetection.js` este un modul pur, bine testat (37 tests, toate pass), dar NEINTEGRAT în production.  
Niciuna din funcțiile publice (`detectAutoAggression`, `aggregateAutoAggression`) nu este importată sau apelată  
din production code. Modulul există în izolare completă față de flow-ul real al utilizatorului.

---

## Integration Points — Starea Actuală

### 1. Write-side: detectAutoAggression → populateOutcome

**Expected flow (per ADR 013):**
```
endSession()
  → populateOutcome(date, { ...outcome, autoAggression: detectAutoAggression({...}) })
```

**Actual flow:**
```
endSession()
  → populateOutcome(date, { executed, earlyStop, actualSets, matchScore, deviation, rating: null })
  // NO autoAggression field — detectAutoAggression() NEVER CALLED
```

**Gap:** `detectAutoAggression` nu este importat în `src/pages/coach/session.js`.  
CDL entries sunt salvate fără câmpul `outcome.autoAggression`.  
Toate intrările CDL actuale au `outcome.autoAggression = undefined`.

### 2. Write-side: setsRPE — câmp ADR 011, nerescris

**Expected:** `populateOutcome` include `setsRPE: [rpe1, rpe2, ...]` din `state.sessLog`  
**Actual:** `state.sessLog` conține per-set `rpe` (opțional, dacă user a ratinguit),  
dar `setsRPE` nu este construit și nu este inclus în `populateOutcome` call.  
`_computeCompositeFatigue` în AA module va cădea permanent pe proxy fallback (rating ≤2).

### 3. Write-side: rest_marked — câmp ADR 011, niciodată setat

**Expected:** pe zilele de odihnă, CDL entry cu `outcome.executed=false, rest_marked=true`  
**Actual:** nu există niciun cod care să creeze CDL entries pentru zilele de odihnă.  
`_detectRecoveryDebt` va returna întotdeauna `false` (byWeek va fi gol).

### 4. Read-side: aggregateAutoAggression → coachContext

**Expected (per design):**
```
buildCoachContext()
  → ctx.autoAggression = aggregateAutoAggression(recentCDLEntries)
```

**Actual:** `coachContext.js` nu importă nimic din `autoAggressionDetection.js`.  
`buildSession` în CoachDirector nu primește `ctx.autoAggression`.  
Bannerul UI de intervenție nu poate fi triggerat.

### 5. Intervention layer — inexistent

Chiar dacă AA ar fi detectat și persistat, nu există cod UI care să:
- Citească `ctx.autoAggression.tier` din context
- Afișeze banner de avertisment
- Modifice recomandările de volum la HIGH/MED tier

---

## Failure Modes

| # | Failure Mode | Severitate | Impact |
|---|---|---|---|
| F1 | `detectAutoAggression` never called — AA never written to CDL | CRITICAL | Toate detecțiile sunt void |
| F2 | `aggregateAutoAggression` never called — ctx.autoAggression absent | CRITICAL | No intervention possible |
| F3 | `setsRPE` not collected in populateOutcome | HIGH | compositeFatigue proxy-only forever |
| F4 | `rest_marked` CDL entries never created | HIGH | recoveryDebt signal always false |
| F5 | No intervention UI layer | HIGH | Even if AA detected, user sees nothing |
| F6 | `rating` always null in populateOutcome | MEDIUM | Proxy fallback compromised also |
| F7 | No `hyperfocusData` source | LOW | Amplifier always off — acceptable for v1 |

---

## Test vs Production Gap

Tests acoperă corect logica internă:
- `detectAutoAggression` — 15+ scenarios
- `aggregateAutoAggression` — 5 scenarios
- Tier computation, signal combinations, recovery debt rules

**Dar:** toate testele injectează CDL entries fabricate cu câmpuri complete.  
Niciun test nu validează că endSession → populateOutcome → CDL entry conține autoAggression.  
Gap-ul de integrare este invisible din test suite-ul actual.

---

## Spec Recomandat — Pași de Integrare

### Step 1: Colectare setsRPE în endSession

```javascript
// în endSession(), înainte de populateOutcome:
const setsRPE = state.sessLog
  .filter(s => s.rpe !== undefined && s.rpe !== null)
  .map(s => s.rpe);
```

### Step 2: Apel detectAutoAggression în endSession

```javascript
// după construirea outcome, înainte de populateOutcome:
import { detectAutoAggression } from '../../engine/autoAggressionDetection.js';
import { readAllActive } from '../../util/coachDecisionLog.js';

const recentCDL = readAllActive(e => {
  const d = new Date(e.date);
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  return d >= cutoff && e.date !== tod();
});

const aaResult = detectAutoAggression({
  currentEntry: { date: tod(), outcome: { ...outcomeBase, setsRPE } },
  recentEntries: recentCDL,
});
```

### Step 3: Include autoAggression în populateOutcome call

```javascript
populateOutcome(_today, {
  executed: hasEarlyStop ? 'partial' : true,
  // ...existing fields...
  setsRPE,
  autoAggression: aaResult,
});
```

### Step 4: Integrare aggregateAutoAggression în coachContext

```javascript
// în buildCoachContext(), după _buildCDLPatterns():
import { aggregateAutoAggression } from './autoAggressionDetection.js';

const recentCDL = coachDecisionLog.readAllActive(e => {
  const d = new Date(e.date);
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  return d >= cutoff;
});
const autoAggression = aggregateAutoAggression(recentCDL);

return {
  ...existingContext,
  autoAggression,
};
```

### Step 5: Intervention layer în CoachDirector / render

Per ADR 013: la tier MED/HIGH → afișare banner + reducere volum propus.  
Needs separate ADR amendment sau sub-task explicit.

---

## Estimare Efort

| Step | Efort | Risc |
|---|---|---|
| Step 1 (setsRPE) | 30min | LOW |
| Step 2+3 (write-side) | 1h | MEDIUM — nu rompe tests, dar adaugă câmpuri noi în CDL |
| Step 4 (read-side ctx) | 30min | LOW |
| Step 5 (intervention UI) | 3-5h | HIGH — nou flow UI |

**Total write-side + read-side (fără UI):** ~2h  
**Tests noi necesare:** integration test endSession → CDL entry → autoAggression field populated

---

## Recomandare

Prioritate NEXT SPRINT: Steps 1-4 (scrie + citește AA în CDL/ctx).  
Step 5 (intervention UI) = Faza B, după validare date reale.  
ADR 013 trebuie amendant să reflecte delay-ul de integrare față de plan.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
