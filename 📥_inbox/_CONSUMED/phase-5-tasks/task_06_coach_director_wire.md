# task_06 — Coach Director Orchestrator Real Wire React

**Phase:** 5 (engine pipeline real wire)
**Type:** Feature — engine wire central conductor
**Deps:** task_05 (scheduleAdapter aggregate exists)
**Backup tag:** `pre-phase5-task-06-2026-05-17`
**Est commits:** 2 atomic (engineWrappers expand + Workout/Antrenor consume)
**Est tests delta:** +10-15

---

## §1 Scope

Coach Director (Engine #7 §42.10 pipeline orchestrator) = central conductor compose 8+1 engines + auxiliary into singular UI output per state (pre-session readiness card + workout planned + post-session feedback). Per DECISIONS.md §D-LEGACY-020 ADR 026 §42.10 + §D-LEGACY-027 Energy Adjustment + cross-cumulative.

Current React `engineWrappers.ts` has isolated wrappers (`getReadiness`, `getFatigue`, `getPRDelta`, `getPlannedWorkoutToday` post-task_05). Missing: aggregate `buildCoachToday(ctx)` consumer-facing API care lança toate engines în 1 call → single `CoachTodayOutput` cu:
- Readiness card (verdict + score + color + kcal/protein delta)
- Fatigue score + recommend
- Planned workout (post task_05)
- Patterns banner (LOW_ADHERENCE / STAGNATION)
- Streak counter
- PR Wall recent

NU mutate `src/engine/coachDirector.js` (assumes exists per memory primary verified via grep). React-side wrapper compose.

## §2 Changes

### A. Grep verify `src/engine/coachDirector.js` existing API

```bash
ls -la src/engine/coachDirector.js 2>/dev/null && grep -n "export" src/engine/coachDirector.js
```

Expected: exports `runCoachDirector(ctx)` sau similar pipeline. Daca NU există, decision: create new pure-function wrapper consume existing engines în order without mutating individual engine modules.

### B. `src/engine/coachDirector.js` (verify existing OR create thin wrapper)

If missing — create:
```js
/**
 * Coach Director — central pipeline orchestrator §42.10
 * Pure-function aggregate. ZERO side effects, ZERO mutation of dependency
 * engines. Composes outputs in deterministic order.
 *
 * Pipeline (post LOCK 10 MMI Engine #9 LAST):
 * 1. Periodization (mesocycle phase determination)
 * 2. Goal Adaptation (template selection)
 * 3. Energy Adjustment (readiness-modulated volume)
 * 4. Bayesian Nutrition (TDEE adaptive)
 * 5. Tempo / Form Cues (persona-aware)
 * 6. Specialization (Marius gate 4-strict)
 * 7. Warm-up & Mobility
 * 8. Deload (week 4 + MRV check)
 * 9. MMI (re-resume gap detect cap re-loading)
 */
export function runCoachDirector(ctx) {
  const readiness = getReadiness(ctx);
  const fatigue = getFatigue(ctx);
  const phase = getPeriodizationPhase(ctx);
  const template = getGoalTemplate(ctx);
  const energyMod = applyEnergyAdjustment(readiness, fatigue);
  const nutrition = getBayesianNutrition(ctx);
  const planned = composeWorkout(template, phase, energyMod, ctx);
  const patterns = detectPatterns(ctx); // LOW_ADHERENCE + STAGNATION
  const streak = computeStreak(ctx);
  const prWall = getRecentPRs(ctx);

  return {
    date: ctx.date,
    readiness,
    fatigue,
    nutrition,
    planned,
    patterns,
    streak,
    prWall,
    mesocyclePhase: phase,
  };
}
```

### C. `src/react/lib/engineWrappers.ts` (expand)

```tsx
export interface CoachTodayOutput {
  date: string;
  readiness: ReadinessOutput | null;
  fatigue: FatigueOutput | null;
  nutrition: NutritionOutput | null;
  planned: PlannedWorkoutOutput | null;
  patterns: Array<{ kind: 'LOW_ADHERENCE' | 'STAGNATION'; severity: 'soft' | 'hard'; detail: string }>;
  streak: { current: number; longest: number };
  prWall: Array<{ exerciseName: string; kg: number; reps: number; date: string }>;
}

export function buildCoachToday(): CoachTodayOutput | null {
  try {
    const ctx = buildCoachContext();
    const raw = runCoachDirector(ctx);
    return {
      date: raw.date,
      readiness: mapReadiness(raw.readiness),
      fatigue: mapFatigue(raw.fatigue),
      nutrition: mapNutrition(raw.nutrition),
      planned: mapPlanned(raw.planned),
      patterns: raw.patterns ?? [],
      streak: raw.streak ?? { current: 0, longest: 0 },
      prWall: raw.prWall ?? [],
    };
  } catch (e) {
    console.warn('[engineWrappers] buildCoachToday failed:', e);
    return null;
  }
}
```

### D. `src/react/routes/screens/antrenor/Antrenor.tsx` (consume)

Single `useCoachToday()` hook (or direct useEffect) replaces multiple isolated calls:
```tsx
const [coachToday, setCoachToday] = useState<CoachTodayOutput | null>(null);
useEffect(() => {
  setCoachToday(buildCoachToday());
}, []);
// Then render readiness card + planned + patterns + streak + prWall all from coachToday
```

## §3 Acceptance criteria

- [ ] `src/engine/coachDirector.js` exposes `runCoachDirector(ctx)` aggregate (verify existing OR create)
- [ ] React `buildCoachToday()` single-call aggregate API
- [ ] Antrenor.tsx refactor consume `coachToday` SSOT (vs scattered calls)
- [ ] Patterns banner (LOW_ADHERENCE + STAGNATION) wired real (per D-LEGACY-092 F1 modify simplified 2 keep / 3 drop V2)
- [ ] Streak counter F8 wired (DECISIONS §F8)
- [ ] PR Wall F6 recent list wired
- [ ] Tests +10-15 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/engineWrappers.buildCoachToday.test.tsx
- aggregates readiness + fatigue + planned + patterns + streak + prWall
- returns null gracefully când engine throws
- mocks runCoachDirector deterministic fixtures

src/react/__tests__/Antrenor.coachToday.test.tsx
- renders readiness card from coachToday
- renders patterns banner conditional
- renders streak counter
- renders PR wall top 3 recent
```

## §5 Commits (atomic 2)

```
feat(engine): coachDirector aggregate runCoachDirector §42.10 pipeline

Pure-function central orchestrator composes 9 engines deterministic order
ZERO mutation per ADR 026 §9. Output: CoachTodayContext = readiness +
fatigue + nutrition + planned + patterns + streak + prWall.

feat(react/lib): buildCoachToday wire Antrenor SSOT aggregate

Single-call API replaces scattered isolated wrappers în Antrenor.tsx.
F1 Patterns Banner (LOW_ADHERENCE + STAGNATION) + F6 PR Wall + F8 Streak
Counter wired real engine output. Mockup parity preserved cumulative.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_06_coach_director_wire.md`:
- coachDirector API verify/create status
- React aggregate API CoachTodayOutput shape
- Antrenor.tsx refactor diff stats
- Patterns + Streak + PR Wall wire confirmation
