---
title: DECISION-FACTOR AUDIT — does every coach decision use the CORRECT input factors?
type: audit
date: 2026-05-26
author: fresh-eyes decision-logic audit agent (read-only)
scope: src/engine/** decision math + src/react/lib bridge (buildUserStateForPipeline / engineWrappers / scheduleAdapterAggregate / scheduleAdapter / sessionBuilder) + live consumers
method: per-decision factor trace — for each decision the coach makes, list the factors it SHOULD consume, then trace whether each factor REACHES + is USED by the code, or is defaulted/dropped/ignored/hardcoded
precedent: cycle-4 "vizor fara usa" (DP weight ran on hardcoded 20kg; dp.recommend computed but not consulted; readiness/persona never reached engine). Same scrutiny applied to ALL decisions.
verdict_legend: CORRECT = all proper factors wired + used | PARTIAL = some factors missing/defaulted | BROKEN = key factor(s) ignored/hardcoded -> decision effectively fake
companion: STUB-WIRING-AUDIT.md (screen/feature wiring lens — equipment substitution + dormant 657-library). This doc = engine-decision factor lens. Minimal overlap (equipment); the rest is new.
---

# DECISION-FACTOR AUDIT — "every decision must be computed from the correct factors"

Daniel's bar (verbatim): *"fiecare DECIZIE pe care Andura o ia ... trebuie sa o ia in functie de alti X factori."* This audit checks the math, not the rendering: for every coach decision, does it actually consume the factors a real fitness coach would use, or is a factor silently defaulted / dropped before the engine / never wired?

## §0 Executive summary

The honest headline: **cycle-4 fixed the data-feed for the SLOW signals (persona, tier, goal-phase, injury, nutrition observations, log writeback) — those are genuinely wired now. But the FAST, in-the-moment training decisions are still running on partial or fake factors.** The most important number a fitness coach produces — *how heavy should I lift today, given how recovered I am* — does NOT consume readiness in the live React path, and the in-session "this is too heavy, drop the weight" auto-correction is dead code. Periodization runs frozen at macrocycle week 0 for every user (the `weeksElapsed` factor is never fed). Reactive deload can essentially never fire (its trigger factors are never assembled). Specialization/weakness selection is triple-dead.

### Counts (distinct decisions)

| Verdict | Count | Decisions |
|---|---|---|
| **CORRECT** | 9 | nutrition kcal target, TDEE/Kalman adapt, protein target, bf% estimate, projection, per-muscle recovery, injury->recovery escalation, PR detection, streak, log writeback (enabler), readiness SCORE itself |
| **PARTIAL** | 8 | planned weight (DP), set/rep targets, deload state->UI weight, warmup duration, phase auto-detect (nutrition), equipment substitution, proactive alerts, readiness VERDICT->weight |
| **BROKEN** | 6 | readiness-gated weight (live), in-session RPE auto-adjust, periodization phase progression, reactive deload triggers, specialization/weakness exercise selection, rest-time prescription |

(Counts list decisions; some bundle tightly. "Readiness score" computes correctly but its downstream USE on weight is broken — split below.)

### Ranked BROKEN / surprising PARTIAL decisions (by harm to the user)

1. **[BROKEN — the cycle-4 bug, still half-present] Planned weight does NOT consume readiness.** The live planner calls bare `DP.recommend(name)` (`scheduleAdapterAggregate.ts:503`), NOT `DP.getSmartRecommendation(ex, readinessScore, muscleState)`. `getSmartRecommendation` — the function that holds back weight when readiness < 60 — is **never called in `src/` outside tests** (grep: only `dp.test.js`). So "don't push heavy when you slept badly" is computed nowhere on the prescribed kg. A comment in `Workout.tsx:110-118` even *claims* readiness "already shapes the prescription via the readiness read-side" — it does not. Readiness only reaches weight indirectly through the EnergyCheck->deload intensityMod path (a blunt ±, see #3), not through DP.
2. **[BROKEN] In-session RPE auto-correction is dead.** `DP.checkInSessionAdjust` (2× RPE 10 -> drop weight now / 2× easy -> bump) exists and is tested, but is **never wired into the Workout screen**. Logging two brutal sets does not change the next set's target. A core "real coach watching you" behavior is inert.
3. **[BROKEN] Periodization phase progression is frozen at week 0.** The engine reads `meta.weeksElapsed` (`periodization/index.js:85`) to place the user in the macrocycle/mesocycle and thus pick the volume + intensity multipliers. `buildUserStateForPipeline` **never sets `weeksElapsed`** -> `NaN` -> `hasMacrocycleAnchor=false` -> `computeMacrocycleBlock(0, ...)`. Every user, forever, is treated as macrocycle week 0. The phase-based volume/intensity periodization the app advertises never advances.
4. **[BROKEN] Reactive deload can essentially never fire.** Deload's composite/AA triggers read `meta.performanceDropPct`, `meta.restTimeMultiplier`, `meta.rirMismatch`, `meta.aaDetectionActive`, `meta.aaMarkerDirectActive`, `meta.recentSessionsForEnergy`, `meta.energyDirection` (`deload/index.js:218-273`). **None of these are assembled by `buildUserStateForPipeline`.** Only the LINEAR/CALENDAR deload (driven by periodization phase === 'DELOAD') can fire — but periodization is frozen at week 0 (#3), so even that is unreachable in normal use. The whole reactive-recovery layer is a no-op in the live pipeline.
5. **[BROKEN] Specialization / weakness-based exercise selection is triple-dead.** (a) Specialization reads `meta.lifetimeLogs` + `meta.recentLogs` to detect the weak group (`specialization/index.js:200-201`) — the builder never sets them -> weakness signal always empty. (b) Even if it produced a target, `buildSession` only applies weak-group ordering when `contextSelectionEnabled` is true, and that flag is **hardcoded `false`** (`calibration.js:251`). (c) Vocabulary mismatch: weaknessDetector/specialization speak Big-11 (`piept`, `picioare-quads`); `sessionBuilder.MUSCLE_GROUP_EXERCISES` keys are head-level (`delt_rear`, `quad`). Exercise SELECTION ignores weakness entirely.
6. **[BROKEN] Rest-time is hardcoded 90s.** `toPlannedExercise` sets `restSec: 90` for every exercise (`scheduleAdapterAggregate.ts:522`). A real coach rests compounds longer than isolation, and longer under high RIR/fatigue. None of that is consulted. (Deload does not touch rest either.)
7. **[PARTIAL] Set count ignores periodization volume.** `buildSession` emits `sets: 3` for every exercise (`sessionBuilder.js:57`). The pipeline computes `volume_target_pct` (periodization volumeMap) and `getDailyWorkout` extracts it as `volumeTargets` — then **never passes it to `buildSession`**. Volume periodization never changes how many sets you get.
8. **[PARTIAL] EnergyCheck readiness -> weight is a blunt ±20%, not the engine.** The deload `intensityMod` ('minus'/'plus') multiplies target kg by 0.8 / 1.15 in `Workout.tsx:119-124`. That is the ONLY way today's self-reported energy moves weight. It is coarse (fixed -20%/+15%), and it rides on the deload engine output which is itself mostly inert (#4). Acceptable as a floor, but it is not the per-exercise readiness math DP was built to do.

### Honest CORRECT list (cycle-4 and earlier genuinely landed)
Nutrition kcal target + adaptive TDEE (Kalman) + protein + bf% + projection are real and well-fed (NutritionInline/TDEEStrip call `readBayesianNutritionContext()` with real weight+intake observations). Per-muscle recovery + Pain->recovery escalation + PR detection + streak are real. `workoutStore.finishSession` writes `DB.set('logs', ...)` so DP/fatigue/recovery/weakness/calibration get real history. Readiness SCORE is computed from real inputs (energy + yesterday's kcal/protein deficits). Injury signal genuinely reaches both gates (cycle-4 fix verified). These are not facades.

---

## §1 Per-decision factor table

Evidence is `file:line`. "SHOULD use" = domain-correct expectation for a real coach. "ACTUALLY uses" = what the code feeds + reads.

### A. Training prescription (the damage zone)

| Decision | Factors it SHOULD use | Factors it ACTUALLY uses | Missing / defaulted | Verdict | Evidence |
|---|---|---|---|---|---|
| **Planned weight (per exercise)** | last weight + progression state + readiness + RPE history + persona/tier + goal phase + MMI cap + equipment step | last weight + progression state + phase (CUT via global `phase-override`) + equipment step + MMI cap (post-hoc) | **readiness IGNORED**; persona/tier not used by DP; equipment-missing not used by DP | **BROKEN** (readiness), else PARTIAL | bare `DP.recommend` `scheduleAdapterAggregate.ts:503`; `getSmartRecommendation` unused (grep tests only); MMI applied after `engineWrappers.ts:473-486` |
| **In-session weight auto-adjust** | recent set RPEs + reps vs rep-cap | nothing — function never invoked | ALL (dead) | **BROKEN** | `DP.checkInSessionAdjust` `dp.js:330`; zero live callers |
| **Rep target** | exercise rep range + phase (CUT caps isolation) + progression stage | DP rep range + phase (CUT) — real, BUT `?? 10` fallback when DP returns no number | fallback 10 masks engine-absent | **PARTIAL** | `toPlannedExercise` `scheduleAdapterAggregate.ts:505-506`; phase-aware range `dp.js:99-106` |
| **RIR/RPE prescription** | progression stage + readiness + phase | DP `rir` per stage (real) — but NOT surfaced to the planned exercise (PlannedExercise has no rir field); readiness not consulted | rir dropped at planner boundary; readiness ignored | **PARTIAL** | `dp.js` emits rir per branch; `PlannedExercise` lacks rir `engineWrappers.ts:112-123` |
| **Rest time** | compound vs isolation + RIR + fatigue/deload | hardcoded 90 | ALL | **BROKEN** | `restSec: 90` `scheduleAdapterAggregate.ts:522` |
| **Set count / volume** | periodization volume_target_pct + persona MV/MRV + recovery | hardcoded 3 | volume target computed but not passed to builder | **PARTIAL** | `sets: 3` `sessionBuilder.js:57`; volume extracted-not-used `scheduleAdapter.js:490` |
| **Exercise selection (split/weakness/recovery)** | session-type template + equipment + weak group + recovery state | session-type template + equipment ONLY | weakness target never computed (no logs in meta) + flag off + vocab mismatch | **BROKEN** | `buildSession` `sessionBuilder.js:51-64`; `contextSelectionEnabled=false` `calibration.js:251`; spec reads `meta.lifetimeLogs` empty `specialization/index.js:200` |
| **Equipment substitution** | busy/missing equipment -> alternative exercise from library | missing list subtracts engine ids before buildSession (PARTIAL); busy-equipment context dropped by consumer | 5/10 picker ids map to `[]`; busy-swap not wired (see companion) | **PARTIAL** | `scheduleAdapter.js:435-437`; empty maps `:340-344` |
| **Warm-up duration** | persona + goal phase + periodization phase + energy direction + target muscles | persona + goalPhase + periodizationPhase (real); energyDirection + targetMuscleGroups NOT fed | energyDirection (meta) + target groups absent | **PARTIAL** | reads `warmup/index.js:260-266,270-275`; builder sets only persona+goalPhase `scheduleAdapterAggregate.ts:455-464` |
| **MMI re-resume cap** | pause months + pre-pause peak (pr-records) + user choice | pauseMonths + peak/exercise + refuse-respect — all real | none | **CORRECT** | `engineWrappers.ts:419-486` |

### B. Recovery / fatigue / periodization decisions

| Decision | Factors it SHOULD use | Factors it ACTUALLY uses | Missing / defaulted | Verdict | Evidence |
|---|---|---|---|---|---|
| **Periodization phase / volume / intensity** | weeks elapsed (macrocycle) + persona + goal + tier + recent sessions + recovery | persona + goal + tier + recentSessions (real); **weeksElapsed NEVER fed** -> always week 0; recoveryGreen/recovery never fed | weeksElapsed, recovery signals | **BROKEN** (frozen week 0) | reads `periodization/index.js:85,134-135`; builder omits both |
| **Deload state (reactive)** | perf drop + rest-time inflation + RIR mismatch + AA + sustained energy-down + periodization deload window | only LINEAR via periodization phase (which is frozen) | ALL reactive trigger inputs absent in pipeline meta | **BROKEN** | reads `deload/index.js:218-281`; builder sets none |
| **Deload -> UI (weight 'minus')** | deload intensity_modifier | reads `intensity_modifier` -> 'minus' flag -> ×0.8 | depends on deload firing (rarely) | **PARTIAL** | `scheduleAdapterAggregate.ts:550-553`; applied `Workout.tsx:119-124` |
| **Fatigue score** | last 4 sessions notes + RPE trend + sleep (wellbeing) | all of those from `DB.logs` + `DB.wellbeing` | none (note: 'notes'/'sleep' depend on those being logged; wellbeing rarely written) | **CORRECT** (math); input-thin in practice | `fatigue.js:5-95` |
| **Per-muscle recovery** | per-head stress decay from logs + pain CDL escalation | logs (real, via flatten) + pain CDL (real) | none | **CORRECT** | `muscleRecovery.js:68-117`; consumer `engineWrappers.ts:1056-1071` |
| **Weakness detection (signal)** | per-group 1RM (Brzycki) from logs | logs via `flattenSessionsToEngineLogs` (real) for the coach-line consumer | none for the LAGGING-LINE use; but selection use is dead (A) | **CORRECT** (as displayed signal) | `weaknessDetector.js:140-170`; `getLaggingSignal` `engineWrappers.ts:1100-1117` |
| **Readiness score** | today energy self-report + yesterday kcal/protein vs target | exactly those | none | **CORRECT** | `readiness.js:24-42,87-98` |
| **Readiness verdict (volumeMultiplier/canPR)** | score + isInCut + hasHistory | score + isInCut + hasHistory (real) | volumeMultiplier is **not applied to weight or sets** anywhere | **PARTIAL** (computed, barely consumed) | `readiness.js:53-71`; `volumeMultiplier` only returned, not used on prescription |

### C. Nutrition decisions

| Decision | Factors it SHOULD use | Factors it ACTUALLY uses | Missing / defaulted | Verdict | Evidence |
|---|---|---|---|---|---|
| **Kcal target** | adaptive TDEE (Kalman posterior) + goal phase + manual override + floor 1200 | posterior.mu (real, fed observations) + goalMult + phase override + floor | none — genuine | **CORRECT** | `getNutritionTargetsToday` `engineWrappers.ts:733-781`; ctx `nutritionObservations.ts:227-241` |
| **TDEE / Kalman adaptation** | weight-trend energy balance + intake + demographic prior + tier | observations (energy balance) + demographicMu + tier — all fed | none | **CORRECT** | `buildBayesianNutritionContext` `nutritionObservations.ts:182-202` |
| **Protein target** | per-kg bodyweight | `computeProteinTargetG(readUserWeightKg())` | flat-180 fallback only when weight absent | **CORRECT** | `engineWrappers.ts:589-590,764-765` |
| **bf% estimate** | weight/height/age/sex (Deurenberg) -> FRACTION | exactly those, clamped, fraction | none | **CORRECT** | `estimateBfFraction` `scheduleAdapterAggregate.ts:278-297` |
| **Energy-balance projection** | TDEE estimate + intake | `readTdeeEstimateKcal(ctx)` with real ctx | none | **CORRECT** | `nutritionProjection.ts:241` |
| **Phase auto-detect (nutrition AUTO)** | weight trend kg/week | `detectAutoPhaseFromWeightTrend(weightLog)` (real) | only for nutrition; does NOT drive training periodization (#B-periodization) | **PARTIAL** (scope) | `engineWrappers.ts:707-717`; engine `phaseAutoDetection.js:184-219` |

### D. Coach voice / alerts / signals

| Decision | Factors it SHOULD use | Factors it ACTUALLY uses | Missing / defaulted | Verdict | Evidence |
|---|---|---|---|---|---|
| **Proactive alerts (10 checks)** | prots/kcals/weights/waters/readiness/logs/muscleState/peakHours/isInCut/bodyweight | called with `{}` in the composer -> reads only DB-internal globals; most check inputs are undefined | composer passes empty ctx (`getProactiveAlerts({})`) | **PARTIAL** | `coachDirectorAggregate.ts:74`; checks `proactiveEngine.js:302-332` (most return null on missing args) |
| **PR detection** | set vs prior history (weight/reps/volume) | real, vs `DB.logs` accumulator | none | **CORRECT** | `prRecordsWriteback.ts:79-96`; `prEngine.detectPR` |
| **Streak** | session dates | real from logs | none | **CORRECT** | `proactiveEngine.checkTrainingStreak` |
| **Coach quote / lagging line / rest reason** | recovery state + weakness from logs + readiness | logs (real) + pain CDL + readiness | none | **CORRECT** | `engineWrappers.ts:1056-1181` |
| **"Why this exercise?"** | readiness score + rec.kg vs lastWeight | readiness + recommendationKg + lastWeight (real, built on tap) | none | **CORRECT** | `getWhyExerciseSummary` `engineWrappers.ts:313-334`; `whyEngine.selectVerdict` |
| **AA friction thresholds** | vitality + adherence engine signals | `getEngineSignals()` (real) | none | **CORRECT** | `Workout.tsx:379-388` |

---

## §2 Deep-dive: `buildUserStateForPipeline` — every factor it assembles, and whether it reaches the engine that needs it

`src/react/lib/scheduleAdapterAggregate.ts:369-466`. This is THE assembly point for the workout pipeline (`getDailyWorkout(userState)`), the analog of the cycle-4 fix. It returns `{ user, recentSessions, weights, profileTier, flags, meta }`.

| Field assembled | Source | Engine(s) that read it | Reaches + used? |
|---|---|---|---|
| `user.{age,sex,goal,frequency,experience,weight,height}` | onboardingStore | periodization (persona/goal), warmup, etc. | YES — `resolvePersonaId(user)`, `resolveGoalId(user)` consume it |
| `user.bfPct` (Deurenberg fraction) | estimated | goalAdaptation RECOMP / push-back bf | YES (degrade-safe) |
| `user.trainingWeeks` | session timeline | goalAdaptation newbie effect | YES |
| `recentSessions[*]` (+ daysAgo, rir, injury, energyDirection, weekIdx) | workoutStore + overlays | periodization scaling, goalAdaptation push-back, mesocycle dual-signal | PARTIAL — injury reaches push-back (used); `weekIdx`/`rir`/`energyDirection` stamped but the engines that consume them mostly read DIFFERENT meta fields (see below) |
| `profileTier` | experience -> T0/T1/T2 | specialization Gate 2, deload tier | YES |
| `weights: {}` | **empty literal** | (recovery/periodization recovery hooks) | NO — always empty |
| `flags: {}` | **empty literal** | — | NO |
| `meta.painButtonActive` + `meta.painAffectedGroups` | Pain CDL | specialization Gate 4 | YES (cycle-4 fix, verified) |
| `meta.persona` | resolvePersonaId(age) | specialization Gate 1, warmup duration | YES |
| `meta.goalPhase` | goal -> BULK/CUT/MAINTAIN | specialization Gate 3, deload modulation, warmup | YES |

**Factors the engines read but `buildUserStateForPipeline` does NOT assemble (silent defaults):**

- `meta.weeksElapsed` — periodization macrocycle anchor. **Absent -> periodization frozen at week 0.** (BROKEN #3)
- `meta.recentSessionsForEnergy` + `meta.energyDirection` (at meta level) — deload energy-down + warmup duration. The builder stamps `energyDirection` on `recentSessions[*]`, but deload reads `meta.recentSessionsForEnergy` / `meta.energyDirection`, NOT `recentSessions[*].energyDirection`. **Field-name mismatch -> the stamp is consumed by no one in the live pipeline.**
- `meta.performanceDropPct`, `meta.restTimeMultiplier`, `meta.rirMismatch`, `meta.aaDetectionActive`, `meta.aaMarkerDirectActive`, `meta.behavioralModifiersInputPct`, `meta.currentMesoWeek`, `meta.weekActiveCount`, `meta.affectedMuscleGroupsMrvExceeded` — deload reactive triggers + depth + scope. **All absent -> reactive deload inert.** (BROKEN #4)
- `meta.lifetimeLogs` + `meta.recentLogs` — specialization weakness signal. **Absent -> weakness target always null.** (BROKEN #5)
- `meta.targetMuscleGroups`, `meta.generalSetsCount`, `meta.specificSetsCount` — warmup routine composition. **Absent -> warmup uses default routine** (duration still partially adapts via persona/goalPhase).
- `recentSessions[*].weekIdx` — mesocycle dual-signal is keyed to a `meta.weeksElapsed` macrocycle anchor that is absent, so the stamped weekIdx has no anchor to be meaningful against.

**Net:** the builder is a real improvement over cycle-4's `meta:{}` — persona, tier, goalPhase, injury now flow. But it stops at the SLOW/identity factors. Every fast/stateful periodization+deload factor is still missing, and two stamped fields (`energyDirection`, `weekIdx`) are dead-on-arrival due to field-name / anchor mismatches with their consumers.

---

## §3 Trust assessment — how much of "smartest coach app" is real, post-cycle-4

**Real (would survive a skeptical user poking at it):**
- The *nutrition brain* is the strongest part. Adaptive TDEE from weight-trend energy balance, goal-phase deltas, manual override precedence, protein per-kg, kcal floor — all fed real data, all degrade honestly. A user who logs weight + food gets a genuinely personalized, adapting kcal/protein number. This is the headline "intelligent" feature and it is not a facade.
- Pain adaptation, PR/streak, per-muscle recovery display, readiness score, the "why" explainer, MMI re-resume cap — all consume real factors. The log writeback (`finishSession -> DB.logs`) is the quiet enabler that makes DP/fatigue/recovery work once a user trains.

**Facade or partial (would NOT survive poking):**
- The *training brain* — the thing a lifter judges the app on rep-to-rep — is the weak half. "Lift lighter today because you're tired" is not computed on the prescribed weight. "Two crushing sets -> drop the weight" never fires. The periodization that's supposed to wave volume/intensity across a mesocycle is frozen at week 0. Reactive deload — the safety/recovery centerpiece — can't trigger. Weakness-driven exercise selection is off behind a hardcoded flag AND starved of input AND vocabulary-mismatched. Rest is a fixed 90s.
- What saves the *appearance* of a smart training coach: the workout still gets real progressive-overload weights from DP history (double-progression IS real and good), real exercise names, real PR banners, real coach voice lines. So it *looks* and *partly is* adaptive — DP progression is genuine. But the multi-factor "adapt to YOUR state TODAY" layer (readiness, periodization position, reactive recovery, weakness) is largely not wired into the prescription.

**Bottom line for the gate:** cycle-4 closed the identity/slow-signal feed and the nutrition loop — those are real. The remaining "vizor fara usa" cases are concentrated in the in-session training-adaptation math: readiness->weight, RPE->weight, periodization weeksElapsed, reactive deload triggers, weakness->selection, rest-time. These pass tests because the engines are unit-tested in isolation with hand-fed `meta` (e.g. the getDailyWorkout fixture passes `meta:{weeksElapsed:0}` — proving the dependency the production builder omits). The decisions render plausible numbers, so prior audits that checked rendering/tests/parity didn't catch that the live `meta` never carries these factors.

## §4 Uncertainty / caveats (not guesses)
- I did not run the app or tests (read-only). Verdicts are static traces with `file:line`.
- "DP progression is real/good" is scoped to double-progression vs `DB.logs` history; I did not re-derive every DP branch's correctness, only that readiness/RPE-live are not in the live path.
- The deload LINEAR path *could* theoretically fire if some other live caller passed a richer `meta` with `weeksElapsed`; I confirmed `buildUserStateForPipeline` is the sole production assembler for `getDailyWorkout` via `composePlannedWorkoutToday` -> `getTodayWorkout`, and it does not. If another entry point exists I did not find it (grep `getDailyWorkout`/`composePlannedWorkout` -> only that chain in `src/`, rest are tests).
- Field-name mismatch claims (`meta.energyDirection` vs `recentSessions[*].energyDirection`; `meta.recentSessionsForEnergy`) are verified against both the writer (`scheduleAdapterAggregate.ts:406-411`, `455-464`) and the reader (`deload/index.js:218,237`). High confidence.
- `contextSelectionEnabled=false` is a literal export (`calibration.js:251`); I did not find any code that flips it at runtime (grep showed only the definition + buildSession read).
