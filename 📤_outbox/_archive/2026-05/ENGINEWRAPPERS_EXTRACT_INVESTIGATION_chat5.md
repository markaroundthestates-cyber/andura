# engineWrappers extract investigation chat 5 — 2026-05-23

**Investigator:** ENGINEWRAPPERS-EXTRACT-INVESTIGATION subagent (Opus, READ-ONLY)
**Scope:** `src/react/lib/engineWrappers.ts` refactor candidates per WAVE-21 P2.
**Output:** Investigation only. ZERO src/ touched.

---

## Current state

- **File:** `src/react/lib/engineWrappers.ts`
- **LOC:** 847 (NU 466 as raport mentioned — file grew chat 5 with MMI silent cap + Sentry +14 sites + phase override + 4 new composers)
- **Exports:** 13 (10 functions + 3 types + helper interfaces)
- **Sentry catch sites cu `captureException`:** 11 (NU 14 — verified via grep `captureException\(e`)
- **Inline helpers (private):** 3 (`estimateOneRM`, `extractSessionDatesLocal`, `computePauseDurationLocal`, `buildSilentMmiContext`, `getPhaseOverrideKcalToday`, `mapBNConfidence`)
- **Engine imports:** 11 modules (readiness, fatigue, prEngine, bayesianNutrition, stagnationDetector, adherence, proactiveEngine, muscleRecovery, weaknessDetector, muscleMemoryAdapter, DB, DP)
- **Type exports:** 9 interfaces consumed direct by components (PlannedWorkoutOutput, ReadinessOutput, FatigueOutput, PRDelta, NutritionTargetsEngine, AdherenceOutput, PatternBanner, ProactiveAlert, CoachRestReason, PRSet, PRHistoryEntry, PlannedExercise)

## Consumer surface (import graph)

**Production code (8 files):**
- `components/SessionPill.tsx` — getTodayWorkout + PlannedWorkoutOutput type
- `components/Antrenor/StatsGrid.tsx` — ReadinessOutput, FatigueOutput types
- `components/Antrenor/ReadinessVerdict.tsx` — ReadinessOutput type
- `components/Antrenor/CoachTodayCard.tsx` — `import * as engineWrappers` (namespace) + PlannedWorkoutOutput
- `components/Antrenor/CoachRestCard.tsx` — CoachRestReason type
- `components/Antrenor/PatternsBanner.tsx` — PatternBanner type
- `components/Antrenor/AlertsBanner.tsx` — ProactiveAlert type
- `components/Progres/FatigueStrip.tsx` — getFatigue
- `routes/screens/antrenor/WorkoutPreview.tsx` — getTodayWorkout + PlannedWorkoutOutput type
- `routes/screens/antrenor/Workout.tsx` — getTodayWorkout, getPRDelta, PlannedExercise
- `routes/screens/antrenor/PostRpe.tsx` — getTodayWorkout
- `lib/coachDirectorAggregate.ts` — multiple wrappers
- `lib/engineSignalsAggregate.ts` — multiple wrappers
- `lib/scheduleAdapterAggregate.ts` (internal sister)
- `lib/bayesianNutritionAggregate.ts` (internal sister)

**Test code (10 test files, 1473 LOC total):**
- `engineWrappers.test.ts` (287) — core orchestration
- `engineWrappers.sentry.test.ts` (301) — Sentry instrumentation §48-H1
- `engineWrappers.mmi-silent-cap.test.ts` (279) — MMI LOCK 10
- `engineWrappers.getNutritionTargetsToday.test.ts` (210)
- `engineWrappers.patternsBanner.test.ts` (180)
- `engineWrappers.proactiveAlerts.test.ts` (112)
- `engineWrappers.adherence.test.ts` (104)
- `coachDirectorAggregate.test.ts`, `engineSignalsAggregate.test.ts`, `bayesianNutritionAggregate.test.ts`, `WorkoutPreview.test.tsx`, `Workout.test.tsx`, `Antrenor.test.tsx`, `FatigueStrip.test.tsx`, `PatternsBanner.test.tsx`, `AlertsBanner.test.tsx`

**Total import sites:** 31 files mention engineWrappers identifiers.

## Function inventory

| # | Function | LOC | Domain | Engine source | Sentry wired | Visibility |
|---|----------|-----|--------|---------------|--------------|------------|
| 1 | getReadiness | 21 | workout/signals | readiness.js | YES | export |
| 2 | estimateOneRM | 4 | workout/PR helper | (pure) | NO | private |
| 3 | getFatigue | 25 | workout/signals | fatigue.js | YES | export |
| 4 | getPRDelta | 29 | workout/PR | prEngine.js | YES | export |
| 5 | extractSessionDatesLocal | 8 | helper/sessions | (pure) | NO | private |
| 6 | computePauseDurationLocal | 24 | helper/sessions | (pure) | NO | private |
| 7 | buildSilentMmiContext | 44 | workout/MMI | muscleMemoryAdapter + DB | NO (console only) | private |
| 8 | applyMmiCapToWorkout | 14 | workout/MMI | muscleMemoryAdapter + DP | NO | export |
| 9 | getTodayWorkout | 13 | workout/orchestration | scheduleAdapterAggregate (8-engine pipeline) | YES | export async |
| 10 | mapBNConfidence | 5 | nutrition helper | (pure) | NO | private |
| 11 | getPhaseOverrideKcalToday | 24 | nutrition/phase | localStorage + baseline | NO (silent fail) | private |
| 12 | getNutritionTargetsToday | 46 | nutrition | bayesianNutrition.js | YES | export async |
| 13 | getAdherenceOutput | 17 | coach signals | adherence.js | YES | export |
| 14 | getPatternsBanner | 64 | coach signals | stagnationDetector + adherence + workoutStore | YES (per pattern x2) | export |
| 15 | getProactiveAlerts | 17 | coach signals | proactiveEngine.js | YES | export |
| 16 | getCoachRestReason | 39 | coach signals | muscleRecovery + readiness + workoutStore | YES | export |
| 17 | getLaggingSignal | 30 | coach signals | weaknessDetector + workoutStore | YES | export |

**Constants/types:** ~50 LOC.
**Comments/headers (8 ── separators + JSDoc):** ~280 LOC.
**Imports:** 28 LOC.

## Domain partition

Total functional LOC (~430 net code): workout 45%, nutrition 18%, coach signals 33%, helpers 4%.

- **WORKOUT domain (~190 LOC):** getReadiness, getFatigue, getPRDelta, estimateOneRM, buildSilentMmiContext, applyMmiCapToWorkout, getTodayWorkout, extract/computePause helpers, MMI types + interfaces (PlannedWorkoutOutput, ReadinessOutput, FatigueOutput, PRDelta, PRSet, PRHistoryEntry, PlannedExercise)
- **NUTRITION domain (~120 LOC):** getNutritionTargetsToday, getPhaseOverrideKcalToday, mapBNConfidence, BASELINE_NUTRITION, KCAL_FLOOR, PHASE_MULTIPLIERS, NutritionTargetsEngine type
- **COACH SIGNALS domain (~180 LOC):** getAdherenceOutput, getPatternsBanner, getProactiveAlerts, getCoachRestReason, getLaggingSignal, BASELINE_ADHERENCE_OUTPUT, threshold constants, SEVERITY_MAP, types (AdherenceOutput, PatternBanner, ProactiveAlert, CoachRestReason)

---

## Refactor options compared

### Option A: Domain split (workout/nutrition/coach)

**Output structure:**
```
src/react/lib/engine/
  index.ts              (~30 LOC barrel re-export)
  workout.ts            (~250 LOC: readiness/fatigue/PR/MMI/today)
  nutrition.ts          (~140 LOC: targets/phase override)
  coachSignals.ts       (~220 LOC: adherence/patterns/proactive/rest/lagging)
  _internal/
    sessionHelpers.ts   (~40 LOC: extractSessionDatesLocal + computePauseDurationLocal + workoutStore→logs flatten)
    sentryCapture.ts    (~25 LOC: withSentryCapture HOF — Option D combined)
```

**Tradeoffs:**
- LOC delta: ~847 → ~705 (split + barrel) = 17% reduction via dedup workoutStore→logs flatten (3× repetition in getPatternsBanner / getCoachRestReason / getLaggingSignal saves ~30 LOC)
- Import surface: ZERO breaking change daca barrel `index.ts` re-exports all current symbols. Path stays `'../lib/engineWrappers'` resolves to `'../lib/engine/index'` via path mapping OR we rename folder `engineWrappers/` and let TS resolve `engineWrappers/index.ts`.
- Test refactor cost: ~LOW. Tests import from `'../../lib/engineWrappers'` — barrel preserves API. Internal vi.mock paths in `sentry.test.ts` MAY need update if test mocks specific file (currently mocks `'../../util/sentry'` which works fine).
- Cohesion gain: HIGH. Workout dev touches workout.ts only; coach signals dev touches coachSignals.ts only. Engine adapter co-location with conceptual domain.
- Risk: LOW (barrel preserves API), MEDIUM if barrel skipped (10+ consumer imports need rewrite + 10 test files).

### Option B: Per-engine split (one wrapper per engine source)

**Output structure:** 11 files (readinessWrapper.ts, fatigueWrapper.ts, prEngineWrapper.ts, mmiWrapper.ts, nutritionWrapper.ts, adherenceWrapper.ts, stagnationWrapper.ts, proactiveWrapper.ts, recoveryWrapper.ts, weaknessWrapper.ts, scheduleAggregateWrapper.ts) + barrel.

**Tradeoffs:**
- LOC delta: ~847 → ~900 (NET INCREASE — each file gets header + imports + types duplication)
- Cohesion: LOSE. getPatternsBanner uses BOTH stagnationDetector + adherence + workoutStore → which file does it live in? Forces artificial split.
- Import surface: Same barrel approach works.
- Test refactor: HIGH cost — 10 test files have to be re-targeted per engine wrapper, splitting test specs.
- Anti-pattern: 1:1 engine:wrapper hides composer pattern (composers like getPatternsBanner combine 2-3 engines, NU 1 engine).
- **Reject:** trades cohesion for granularity Daniel doesn't need.

### Option C: Helper extraction only (minimal change)

**Output structure:** engineWrappers.ts shrunk + new sessionHelpers.ts (~40 LOC) + new sentryCapture.ts (~25 LOC HOF).

**Tradeoffs:**
- LOC delta: ~847 → ~770 (helper extraction saves ~30 LOC dedup + ~50 LOC moved out)
- Domain mixing: PERSISTS. Workout + nutrition + coach signals still cohabitate in 1 file.
- Import surface: ZERO change.
- Test refactor: ZERO (tests don't touch helpers directly).
- Risk: VERY LOW.
- Gain: SMALL — file still 700+ LOC, still mixes domains. Buys time NU solves architecture.
- **Useful as preparatory step pentru Option A.**

### Option D: HOF withSentryCapture pattern only

**Pattern sketch:**
```typescript
function withSentryCapture<T>(adapter: string, fn: () => T, fallback: T): T {
  try { return fn(); }
  catch (e) {
    console.warn(`[engineWrappers] ${adapter} failed:`, e);
    captureException(e, { tags: { source: 'engine-adapter-fallback', adapter } });
    return fallback;
  }
}

// Usage:
export function getReadiness(opts) {
  return withSentryCapture('getReadiness', () => {
    const score = getComputedReadinessScore();
    if (score == null) return null;
    // ...
    return { score, label, color, volumeMultiplier, canPR };
  }, null);
}
```

**Tradeoffs:**
- LOC delta: 11 catch sites × ~5 LOC = ~55 LOC saved if all migrated; HOF itself ~12 LOC. Net ~40 LOC reduction.
- Async complexity: 3 catch sites are async (getTodayWorkout, getNutritionTargetsToday have await inside try) — HOF needs overload for `withSentryCaptureAsync` returning Promise. Doable.
- Per-site extra `extra` field varies (getPRDelta has `extra: { exercise }`, getPatternsBanner has `pattern: 'STAGNATION'/'LOW_ADHERENCE'`). HOF signature needs optional `extra?: Record<string, unknown>` param OR per-site closure injecting different tags. Drift risk LOW dacă HOF accepts `tags: Record<string, unknown>` directly.
- Readability: try/catch pattern este idiomatic, juniors recognize immediately. HOF wrap requires reading HOF def to understand control flow. Bugatti craft considers this Junior-Daniel-readability tradeoff.
- Test refactor: ZERO (tests assert on `captureException` mock call args, which HOF preserves verbatim).
- Risk: LOW. Pure mechanical refactor.
- Anti-pattern guard: HOF nests one level deeper, complicates error stack traces. `console.warn` ALREADY uniform — HOF mostly DRYs Sentry call, NU adds semantic value.

### Option E: Co-locate composer pattern in dedicated coachSignals module + helpers extracted

**Hybrid Option A + C:** Workout stays in current file (renamed engineWrappers.ts → workoutAdapters.ts), nutrition + coach signals + helpers extracted.

**Tradeoffs:**
- LOC delta: ~847 → ~370 workoutAdapters + ~140 nutrition + ~220 coachSignals + ~40 sessionHelpers = ~770 total (smaller wins than full Option A)
- Inconsistent: workout privileged, others demoted. Hard to explain WHY.
- **Reject:** asymmetric without principled justification.

---

## Recommendation Co-CTO

**Option A: Domain split (workout / nutrition / coach signals) + Option C helpers + Option D HOF — combined as single coherent refactor.**

**Rationale:**

1. **Cohesion gain is real:** File grew from ~270 LOC (Phase 4) → 847 LOC (chat 5) by adding orthogonal domains. Future Daniel/Claude touching `getPatternsBanner` should NOT have to scroll past MMI Cap implementation. Co-location by engine source (Option B) fails because composers cross engines.
2. **Barrel preserves API:** `engineWrappers/index.ts` re-exports everything. Zero breaking change for 16+ production consumers + 10 test files. This is the standard React/TS migration pattern.
3. **Helper extraction (`sessionHelpers.ts`) eliminates 3× duplication** of workoutStore.sessionsHistory → logs flatten pattern (currently in getPatternsBanner, getCoachRestReason, getLaggingSignal). ~30 LOC saved.
4. **withSentryCapture HOF** removes 11× duplicated try/catch boilerplate. Async overload needed for getTodayWorkout + getNutritionTargetsToday. ~40 LOC saved. Tests preserved verbatim (HOF passes through captureException call exactly).
5. **MMI helpers (extractSessionDatesLocal + computePauseDurationLocal) stay private** to workout.ts because the `Local` suffix exists deliberately per L259-264 comment: importing from src/engine/coachContext.js breaks vi.mock isolation in sentry.test.ts. This is a TEST INFRA constraint, not domain. Document explicitly in new workout.ts header.
6. **Daniel's "Quality long horizon" mandate:** File grew 3× in 1 chat. If not split now, chat 6+ will add more (engine #10 wires, more composers per F-pass audit gaps) and the file becomes ungovernable. Better atomic now than retrofit at 1500 LOC.

## Implementation path

**Sequence (single PR, ~6-9 hours):**

1. **Create folder `src/react/lib/engine/`** (NU `engineWrappers/` to avoid naming collision during refactor; we'll alias barrel after).
2. **Extract `src/react/lib/engine/_internal/sessionHelpers.ts`** — extractSessionDatesLocal + computePauseDurationLocal + new `flattenSessionsToLogs(sessions)` helper consuming workoutStore shape. ~50 LOC.
3. **Extract `src/react/lib/engine/_internal/withSentryCapture.ts`** — HOF + async overload. ~30 LOC.
4. **Create `src/react/lib/engine/workout.ts`** — readiness/fatigue/PR/MMI/today + workout types. Migrate all 7 functions + buildSilentMmiContext + applyMmiCapToWorkout + estimateOneRM. Use sessionHelpers + withSentryCapture. ~250 LOC.
5. **Create `src/react/lib/engine/nutrition.ts`** — getNutritionTargetsToday + getPhaseOverrideKcalToday + mapBNConfidence + NutritionTargetsEngine + constants. ~140 LOC.
6. **Create `src/react/lib/engine/coachSignals.ts`** — adherence + patternsBanner + proactiveAlerts + coachRestReason + laggingSignal + types + constants. Use sessionHelpers (flattenSessionsToLogs) + withSentryCapture. ~220 LOC.
7. **Create `src/react/lib/engine/index.ts` barrel** re-exporting all public symbols. ~30 LOC.
8. **Rename** `src/react/lib/engineWrappers.ts` → DELETE, OR keep as 5-LOC stub `export * from './engine'` for backwards compat (Daniel decision). Recommend DELETE since barrel is the canonical entry.
9. **Update imports in 16 consumer files** OR redirect via barrel. Tests imports `'../../lib/engineWrappers'` → need rename to `'../../lib/engine'`. Or `tsconfig paths` alias temporarily.
10. **Re-run Vitest:** confirm all 4290+ tests still PASS. Verify Sentry tests pass (HOF preserves captureException call shape exactly).
11. **Atomic commits Bugatti per Daniel convention:**
    - Commit 1: helpers extraction (sessionHelpers + withSentryCapture)
    - Commit 2: workout.ts split
    - Commit 3: nutrition.ts split
    - Commit 4: coachSignals.ts split
    - Commit 5: barrel + delete engineWrappers.ts + consumer import updates
    - Commit 6: SSOT DECISIONS.md entry + PRIMER §5 micro-append

## Risk + mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Test mock paths break (vi.mock targets `'../../lib/engineWrappers'`) | MED | Audit all 10 test files BEFORE refactor. Most mock engine modules NU engineWrappers itself; only `sentry.test.ts` mocks `'../../util/sentry'` (unaffected). Update vi.mock paths in commit 5 atomic with barrel rename. |
| HOF async overload subtle bug (Promise vs sync return inference) | MED | TypeScript function overloads or 2 distinct exports (`withSentryCapture` + `withSentryCaptureAsync`). Add explicit unit tests for HOF itself. |
| MMI helpers (extractSessionDatesLocal/computePauseDurationLocal) accidentally swapped for engine versions during migration | MED | Mandatory inline comment block in workout.ts header (verbatim per current L259-264) + explicit "DO NOT import from src/engine/coachContext.js" warning. Optional: ESLint rule `no-restricted-imports` for coachContext.js from workout.ts. |
| Consumer namespace import `import * as engineWrappers from '../../lib/engineWrappers'` in CoachTodayCard.tsx + WorkoutPreview.test.tsx — barrel must preserve every export symbol | LOW | Barrel `export *` resolves this. Smoke compile + run tests to verify. |
| Sentry source tag drift (`source: 'engine-adapter-fallback'`) | LOW | HOF hardcodes the tag verbatim. Single source of truth in withSentryCapture. |
| Coach composers (getPatternsBanner) use BOTH adherence + stagnationDetector + workoutStore — which file owns flatten helper? | LOW | sessionHelpers._internal/ folder, shared. Pure functions, NU domain-bound. |

## Estimated impact

- **LOC reduction:** 847 → ~770 net across 7 files (~9% reduction). Bigger win is **cognitive load distribution**: largest file ~250 LOC (workout.ts) NU 847 LOC monolith.
- **Test refactor cost:** ~1-2 hours (paths + vi.mock target updates in 10 test files, no logic changes).
- **Risk level:** LOW-MED. Mechanical refactor + barrel preserves API. Main risk is async HOF type inference.
- **Total effort estimate:** 6-9 hours (focused chat 6 session). Half via subagent parallelization possible (sessionHelpers + nutrition + coachSignals atomic per subagent, workout.ts main session orchestrates).
- **Quality dividend:** Future chats touching workout vs nutrition vs coach signals editing distinct files = ZERO conflicts via parallel agents, NU cross-file lock.

## Daniel CEO decisions required

1. **Approve Option A combined refactor** (vs defer to chat 7+ vs Option C minimal vs reject)?
2. **Folder name:** `src/react/lib/engine/` (recommended) vs `src/react/lib/engineWrappers/` (preserve verbal continuity in DECISIONS.md but causes refactor naming friction during transition)?
3. **engineWrappers.ts stub backwards-compat:** DELETE clean (recommended, 16 consumer imports updated atomic) vs keep 5-LOC stub for 1 milestone vs path alias `tsconfig.json`?
4. **Atomic commit count:** 6 commits per recommended (Bugatti single-concern) vs 1 mega-commit?

## Blockers

NONE. All preconditions satisfied:
- engineWrappers.ts stable (chat 5 LANDED). NU mid-flight edits expected.
- Test coverage 4290+ PASS (safety net for regression catch).
- D045 LOCK V1 Mass Fix V2 Wave A pending Daniel approve → this refactor decoupled, can land in chat 6 P2 slot.

## Cross-refs

- DECISIONS.md §D027 (Phase 6 task_02 Option C async)
- DECISIONS.md §D-LEGACY-076 scheduleAdapter
- DECISIONS.md §D-LEGACY-098 LOCK 10 MMI Engine #9
- ADR-033 §32.1 MMI cap buckets verbatim
- ADR-026 §9 pure-function paradigm
- Current `engineWrappers.ts` L259-L264 comment (MMI helpers Local inline rationale)
- Comparable refactor precedent: scheduleAdapterAggregate split chat 4 (4-engine pipeline composer)

---

## Lean raport per request format

```
ENGINEWRAPPERS-EXTRACT-INVESTIGATION: 📤_outbox/ENGINEWRAPPERS_EXTRACT_INVESTIGATION_chat5.md
LOC: ~260
Current engineWrappers.ts LOC: 847 (NU 466 — raport WAVE-21 stale, file grew chat 5)
Refactor options: 5 (A domain / B per-engine / C helpers / D HOF / E hybrid)
Recommended option: A combined cu C + D (domain split + helpers + HOF)
Estimated impact: -77 LOC (847→770) + cognitive load distributed across 7 files max 250 LOC
Effort: 6-9 hours
```

EOF
