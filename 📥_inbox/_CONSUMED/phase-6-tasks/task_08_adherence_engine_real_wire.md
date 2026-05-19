# task_08 — Adherence Engine Real Wire (engineSignalsAggregate)

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — replace `BASELINE_ADHERENCE=50` Phase 5 proxy cu real `getAdherenceScore()` engine
**Deps:** task_07 LANDED
**Backup tag:** `pre-phase6-task-08-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-8

---

## §1 Slip codificat anti-recurrence

Sketch V1 inventat `computeAdherenceScore(userState)` cu signature `(userState: object) => number`. Primary-source grep `src/engine/adherence.js`:
- Actual export = **`getAdherenceScore()`** (sync, ZERO args, DB-backed)
- Return shape = `{score: number 0-100, color: string, label: string}` (NU plain number)
- ALWAYS returns valid object cu score (NU null) — score combination: +25 kcal logged + +25 protein>=150 + +30 workout compliance (CDL primary / logs fallback) + +20 weight logged
- Side-effect: reads `DB.get()` localStorage direct + reads `coachDecisionLog.readActiveForDate(today)` CDL
- Secondary export `computeAdherence({windowDays=30})` CDL-only metrics breakdown (NU folosit aici — getAdherenceScore mai potrivit pentru proxy single-score)

Anti-recurrence: future engineWrappers tasks MUST grep primary-source engine exports (function names + signatures + return shapes) pre-§B spec. Citation rule per D008 PRIMER §7.

---

## §2 Primary-source evidence verified

**`src/engine/adherence.js:60` `export function getAdherenceScore()`:**
```js
function getAdherenceScore() {
  // ... DB.get('kcals') + DB.get('prots') + DB.get('weights') + DB.get('logs')
  // ... coachDecisionLog.readActiveForDate(today)
  let score = 0;
  // ... +25 +25 +30 +20 accumulation
  let color, label;
  if (score >= 80) { color = 'var(--green)'; label = 'Excelent'; }
  else if (score >= 50) { color = 'var(--accent)'; label = 'OK'; }
  else { color = 'var(--accent2)'; label = 'Slab'; }
  return { score, color, label };
}
```

**Current `src/react/lib/engineSignalsAggregate.ts` Phase 5:** `BASELINE_ADHERENCE = 50` hardcoded (need verify Phase 5 task_10 LANDED file path + line — grep primary-source pre-§3).

---

## §3 Scope changes

### A. `src/react/lib/engineWrappers.ts` extend cu wrapper safe

```ts
import { getAdherenceScore } from '../../engine/adherence.js';

export interface AdherenceOutput {
  score: number; // 0-100
  source: 'engine' | 'baseline';
}

const BASELINE_ADHERENCE_OUTPUT: AdherenceOutput = {
  score: 50,
  source: 'baseline',
};

/**
 * Real wire Adherence Engine. Returns score 0-100 derived din 4 components
 * (kcal logging + protein >=150 + workout compliance + weight logging).
 *
 * Engine reads DB localStorage direct — caller-side ctx NU needed.
 *
 * Baseline fallback graceful când engine throws (DB unavailable în SSR sau
 * test env fără localStorage mock).
 */
export function getAdherenceOutput(): AdherenceOutput {
  try {
    const raw = getAdherenceScore();
    if (!raw || typeof raw !== 'object' || typeof raw.score !== 'number') {
      return BASELINE_ADHERENCE_OUTPUT;
    }
    const safeScore = Math.max(0, Math.min(100, raw.score));
    return { score: safeScore, source: 'engine' };
  } catch (e) {
    console.warn('[engineWrappers] getAdherenceOutput failed:', e);
    return BASELINE_ADHERENCE_OUTPUT;
  }
}
```

### B. `src/react/lib/engineSignalsAggregate.ts` refactor

Replace `BASELINE_ADHERENCE=50` hardcoded cu real engine call. Grep Phase 5 task_10 actual file content pre-edit pentru a păstra alte fields (`vitalityScore` + `energyDirection` + `source`):

```ts
import { getReadiness, getFatigue, getAdherenceOutput } from './engineWrappers';

const BASELINE_VITALITY = 50;

export interface EngineSignals {
  vitalityScore: number; // 0-100
  adherenceScore: number; // 0-100
  energyDirection: 'up' | 'flat' | 'down';
  source: 'engine' | 'baseline';
}

export function getEngineSignals(): EngineSignals {
  const readiness = getReadiness();
  const fatigue = getFatigue();
  const adherence = getAdherenceOutput();
  let energyDirection: EngineSignals['energyDirection'] = 'flat';
  if (readiness !== null) {
    if (readiness.score >= 80) energyDirection = 'up';
    else if (readiness.score < 50) energyDirection = 'down';
  }
  const vitalityScore = fatigue !== null && typeof fatigue.score === 'number'
    ? Math.max(0, Math.min(100, 100 - fatigue.score))
    : BASELINE_VITALITY;
  // Phase 6 task_08: real adherence din getAdherenceScore engine
  const adherenceScore = adherence.score;
  // source: 'engine' cand orice non-baseline component fed real engine output
  const anyEngine =
    readiness !== null || fatigue !== null || adherence.source === 'engine';
  return {
    vitalityScore,
    adherenceScore,
    energyDirection,
    source: anyEngine ? 'engine' : 'baseline',
  };
}
```

### C. Tests `src/react/__tests__/lib/engineWrappers.adherence.test.ts`

```ts
- getAdherenceOutput returns engine source cand getAdherenceScore valid
- Score clamped 0-100 invariant (raw 150 → 100, raw -10 → 0)
- non-object engine output → baseline fallback
- missing score field → baseline fallback
- engine throws → baseline fallback
- Score=0 valid (NU treated ca falsy)
- Source label 'engine'|'baseline' mapping
```

### D. Tests `src/react/__tests__/lib/engineSignalsAggregate.adherence.realwire.test.ts`

```ts
- adherenceScore propagates din getAdherenceOutput
- BASELINE_ADHERENCE constant DELETED (NU mai exists)
- source='engine' cand adherence engine fed real value
- source='baseline' cand all engines baseline
- vitalityScore + energyDirection invariant preserved Phase 5
- empty DB → adherence baseline fallback (engine throws sau score 0)
```

---

## §4 Acceptance criteria

- [ ] `getAdherenceOutput()` export LANDED în engineWrappers.ts
- [ ] `engineSignalsAggregate.adherenceScore` consume real engine (NU hardcoded 50)
- [ ] `BASELINE_ADHERENCE` constant DELETED din engineSignalsAggregate.ts
- [ ] Score clamped 0-100 invariant defensive
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

---

## §5 Commit message

```
refactor(react/lib): Adherence Engine real wire engineSignalsAggregate

Phase 6 final engine pipeline real wire. Replaces Phase 5 task_10
BASELINE_ADHERENCE=50 hardcoded proxy cu real getAdherenceScore() engine
output via getAdherenceOutput wrapper.

Engine reads DB.get localStorage direct (kcals + prots + weights + logs)
+ coachDecisionLog.readActiveForDate workout compliance. Score 0-100
combination: +25 kcal + +25 protein>=150 + +30 workout + +20 weight.

Defensive: typeof score check + clamp 0-100 + baseline fallback when
engine throws (DB unavailable). engineSignalsAggregate.source='engine'
when any composer (readiness + fatigue + adherence) returns real engine.

Closes Phase 6 §8 engine pipeline real wire 8/8 tasks complete.
```

---

## §6 Next

task_09 Cont Tab settings-profile Big 6 edit screen (sub-screen mockup parity).
