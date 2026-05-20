# task_05 — engineWrappers Patterns Banner Composer (Option B)

**Phase:** 6 (engine pipeline real wire)
**Type:** Feature — async composer pattern banner React-side via pure engines
**Deps:** task_04 LANDED
**Backup tag:** `pre-phase6-task-05-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +8-12
**Authority:** Daniel CEO "quality over speed" directive 2026-05-18 chat ACASĂ → Option B Bugatti verdict (composer separat React-side pure-function engines, NU CoachDirector.buildSession() heavyweight cu side-effects pollution)

---

## §1 Slip codificat anti-recurrence

Sketch V1 inventat `new CoachDirector().run(userState)` cu return shape `{patternsBanner, prWallRecent, alerts, recommendedRecompile}`. Primary-source grep `src/engine/coachDirector.js`:
- Class `CoachDirector` exists dar method este **`.buildSession(sessionType)`**, NU `.run`
- Return shape este `session.context.{patterns, proactiveAlerts, recompile}` — top-level fields invented NU există
- Side-effects heavy: CDL write + Sentry capture + Auto-backup — invocation context inappropriate pentru React home aggregator

Anti-recurrence: future engineWrappers tasks MUST grep primary-source engine exports (function names + signatures + return shapes) pre-§B spec. Citation rule per D008 PRIMER §7.

---

## §2 Primary-source evidence verified

**`src/engine/stagnationDetector.js` exports:**
- `detectStagnation(exerciseName, logs)` → `{stagnationWeeks: number, progression: Array}`
- `detectGlobalStagnation(logs)` → `{maxStagnationWeeks: number, byExercise: Object}`
- `weeklyProgression(exerciseName, logs)` → `Array<{week, avg1RM}>`

Pure-function, ADR 026 §9 compliant. Input `logs` shape `{ex, ts/date, w, reps}` (compatible workoutStore.sessionsHistory[].exercises[].sets flattened).

**`src/engine/adherence.js` exports:**
- `getAdherenceScore()` → `{score: number 0-100, color: string, label: string}` (need verify tail full shape — CC executes via additional grep pre-§B)
- ZERO args, DB-backed (`DB.get('kcals'/'prots'/'weights'/'logs')`)

**`src/react/lib/prHistoryAggregate.ts` exports** (Phase 5 task_11 already-shipped):
- `getPRHistoryAll()` → `PRRecord[]` cu `{exerciseId, exerciseName, kg, reps, oneRMEstimate, sessionTs, sessionTitle}`

**`src/engine/proactiveEngine.js` exports:**
- `runProactiveChecks(ctx)` → `Array<{type, severity: 'warning'|'info'|'success', message, ...}>` sorted by severity
- ctx shape: `{prots, weights, kcals, waters, readiness, logs, muscleState, isInCut, peakHours, workoutSkips, user}`
- DB-backed inside (uses `tod()`, `todDate()`)

---

## §3 Scope changes

### A. `src/react/lib/engineWrappers.ts` (extend cu 2 NEW exports)

```ts
import { detectGlobalStagnation } from '../../engine/stagnationDetector.js';
import { getAdherenceScore } from '../../engine/adherence.js';
import { runProactiveChecks } from '../../engine/proactiveEngine.js';
import { useWorkoutStore } from '../stores/workoutStore';

// ── Patterns Banner (LOW_ADHERENCE + STAGNATION only V1 per PRIMER §2) ────

export interface PatternBanner {
  id: 'LOW_ADHERENCE' | 'STAGNATION';
  severity: 'info' | 'warn';
  text: string; // RO wording NO_DIACRITICS_RULE
}

const STAGNATION_WEEKS_THRESHOLD = 2; // 2+ consecutive weeks → banner
const LOW_ADHERENCE_THRESHOLD = 50;   // adherence < 50 → banner

/**
 * Composer Option B Bugatti — patterns banner via pure-function engines
 * direct (stagnationDetector + adherence engine). ZERO side-effects (NU
 * invoca CoachDirector.buildSession care scrie CDL + Sentry + Auto-backup).
 *
 * 2 patterns V1 LOCK per PRIMER §2 MODIFY simplified: LOW_ADHERENCE +
 * STAGNATION (3 V2-deferred paranoid drop).
 *
 * Defensive: engine throws → empty array fallback graceful.
 */
export function getPatternsBanner(): PatternBanner[] {
  const banners: PatternBanner[] = [];

  // Pattern 1: STAGNATION via stagnationDetector
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    // Flatten sessions.exercises.sets → logs shape {ex, ts, w, reps}
    const logs: Array<{ ex: string; ts: number; w: number; reps: number }> = [];
    for (const session of sessions) {
      if (!session.exercises) continue;
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          logs.push({
            ex: ex.exerciseName,
            ts: set.timestamp,
            w: set.kg,
            reps: set.reps,
          });
        }
      }
    }
    const stag = detectGlobalStagnation(logs);
    if (stag.maxStagnationWeeks >= STAGNATION_WEEKS_THRESHOLD) {
      banners.push({
        id: 'STAGNATION',
        severity: 'warn',
        text: `Stagnare ${stag.maxStagnationWeeks} saptamani. Coach ajusteaza intensitatea.`,
      });
    }
  } catch (e) {
    console.warn('[engineWrappers] getPatternsBanner STAGNATION failed:', e);
  }

  // Pattern 2: LOW_ADHERENCE via adherence engine
  try {
    const adherence = getAdherenceScore();
    const score = typeof adherence === 'object' && adherence !== null
      ? (adherence as { score?: number }).score
      : (typeof adherence === 'number' ? adherence : null);
    if (typeof score === 'number' && score < LOW_ADHERENCE_THRESHOLD) {
      banners.push({
        id: 'LOW_ADHERENCE',
        severity: 'info',
        text: 'Adherenta scazuta saptamana asta. Reia ritmul cu o sesiune scurta.',
      });
    }
  } catch (e) {
    console.warn('[engineWrappers] getPatternsBanner LOW_ADHERENCE failed:', e);
  }

  return banners;
}

// ── Proactive Alerts wrapper (compose ctx din DB-backed + stores) ─────────

export interface ProactiveAlert {
  id: string;
  text: string;
  severity: 'info' | 'warn' | 'urgent';
}

const SEVERITY_MAP: Record<string, ProactiveAlert['severity']> = {
  warning: 'warn',
  info: 'info',
  success: 'info', // success collapses to info în UI (NU urgent)
};

/**
 * Wraps runProactiveChecks. Reads ctx din DB-backed localStorage direct
 * (engine internal uses DB.get pattern — caller can pass already-built ctx
 * sau let engine read DB defensive). Phase 6 V1: pass empty {} → engine
 * reads DB direct via tod()/todDate() internals.
 *
 * Returns mapped UI shape (severity normalize 3-tier).
 */
export function getProactiveAlerts(ctx: object = {}): ProactiveAlert[] {
  try {
    const raw = runProactiveChecks(ctx);
    if (!Array.isArray(raw)) return [];
    return raw.map((alert, idx) => ({
      id: `${alert.type ?? 'unknown'}_${idx}`,
      text: alert.message ?? '',
      severity: SEVERITY_MAP[alert.severity] ?? 'info',
    }));
  } catch (e) {
    console.warn('[engineWrappers] getProactiveAlerts failed:', e);
    return [];
  }
}
```

### B. Tests `src/react/__tests__/lib/engineWrappers.patternsBanner.test.ts`

```ts
- getPatternsBanner returns [] cand empty sessionsHistory + adherence>=50
- STAGNATION banner cand maxStagnationWeeks>=2
- LOW_ADHERENCE banner cand adherence<50
- Both banners stacked cand both triggers active
- Defensive: stagnation throw → graceful empty array
- Defensive: adherence throw → graceful empty array
- Adherence engine returns plain number → handled correctly
- Adherence engine returns {score, ...} object → score extracted
- text wording RO NO_DIACRITICS_RULE compliance
- Severity mapping (STAGNATION=warn, LOW_ADHERENCE=info)
```

### C. Tests `src/react/__tests__/lib/engineWrappers.proactiveAlerts.test.ts`

```ts
- getProactiveAlerts returns [] cand engine throws
- Severity mapping warning→warn, info→info, success→info
- ID generation type_index unique
- Empty engine output → empty array
- Engine non-array output → empty array defensive
- Text field extracted from alert.message
- Order preserved engine sorted (warning first)
```

---

## §4 Acceptance criteria

- [ ] `getPatternsBanner()` export LANDED — sync return (NU async — stagnationDetector + getAdherenceScore both sync)
- [ ] `getProactiveAlerts(ctx)` export LANDED — sync return (runProactiveChecks sync)
- [ ] ZERO invocare `CoachDirector.buildSession` din React aggregator (side-effects pollution prevented)
- [ ] Thresholds STAGNATION_WEEKS_THRESHOLD=2 + LOW_ADHERENCE_THRESHOLD=50 declared inline constants (Daniel reviews Bugatti audit nuclear pre-Launch)
- [ ] 2 patterns V1 LOCK only (LOW_ADHERENCE + STAGNATION); 3 V2-deferred patterns NU implemented (PRIMER §2 MODIFY)
- [ ] Tests +8 minim PASS (12 max — 10 patterns + 7 proactive)
- [ ] TS strict 0 errors
- [ ] NO_DIACRITICS_RULE wording compliance ("saptamani" NU "săptămâni")

---

## §5 Commit message

```
feat(react/lib): engineWrappers patterns banner + proactive alerts composer

Option B Bugatti per Daniel "quality over speed" 2026-05-18 — composer
React-side pure-function engines (stagnationDetector + adherence +
proactiveEngine) NU CoachDirector.buildSession heavyweight side-effects.

NEW 2 exports: getPatternsBanner() returns PatternBanner[] cu 2 V1 LOCK
patterns (STAGNATION via detectGlobalStagnation 2+ weeks threshold +
LOW_ADHERENCE via getAdherenceScore <50 threshold). getProactiveAlerts(ctx)
wraps runProactiveChecks cu severity mapping 3-tier (warning→warn,
info→info, success→info collapse).

Defensive try/catch graceful fallback empty array per engine. ZERO
src/engine/* mutation. Anti-recurrence task_05 v1 slip codified D027 §5
extension: engine API grep primary-source mandatory pre-§B spec.

Unlocks task_06 React coachDirectorAggregate enrich consume.
```

---

## §6 Next

task_06 React `coachDirectorAggregate.getCoachToday()` enrich consume `getPatternsBanner()` + `getPRHistoryAll()` slice top 3 + `getProactiveAlerts(ctx)` → UI Antrenor home wire components PatternsBanner + PRWallRecent + AlertsBanner.
