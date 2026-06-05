// ── getDailyWorkout — compose today's plan (8-engine pipeline + sessionBuilder) ──
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { buildEngineContext } from '../../../coach/orchestrator/contextBuilder.js';
import { runPipeline } from '../../../coach/orchestrator/index.js';
import {
  periodizationAdapter,
  goalAdaptationAdapter,
  energyAdjustmentAdapter,
  bayesianNutritionAdapter,
  tempoAdapter,
  specializationAdapter,
  warmupAdapter,
  deloadAdapter,
} from '../../../coach/orchestrator/adapters/index.js';
import { buildSession } from '../../sessionBuilder.js';
import { availableCoarseTypes } from '../../equipmentMap.js';
import {
  getRecoveryByGroup,
  mergeAerobicRecovery,
} from '../../muscleRecovery.js';
import { detectImbalances, applyImbalanceCorrection } from '../../imbalanceDetector.js';

import { mapDateToIndex, getWeekStartIso } from './dateHelpers.js';
import { getCalendarOverride } from './calendarOverrideStorage.js';
import { getMissingEquipment } from './missingEquipmentStorage.js';
import {
  frequencyToSplit,
  activeWeekForFrequency,
  activeWeekFromOverride,
  activeWeekFromScheduleStore,
  clusterForDay,
  CLUSTER_TO_SESSION_TAG,
} from './frequencySplit.js';
import { pickAlternativeCluster } from './alternativeCluster.js';
import { weeklySessionsPerGroup } from './weeklySessions.js';
import { flattenSessionsToRecoveryLogs } from './recoveryLogs.js';
import { FOCUS_PRESETS, deEmphasizedGroups, emphasizedGroups, applyFocusBias } from './focus.js';
import {
  laggingGroupsFromLogs,
  applyWeaknessAmplification,
  applyRecoveryToVolumeBudget,
  redistributeRecoveredVolumeToFreshSessionGroups,
} from './volumeAdaptation.js';
import { deriveCoachAdaptations } from './coachAdaptations.js';
import {
  weekSessionSpreadByGroup,
  computeIntraWeekMakeup,
  applyMakeupToVolumeBudget,
} from './intraWeekMakeup.js';

/**
 * Compose today's workout plan — invoke 8-engine pipeline §42.10 sequential
 * strict + aggregate blueprints by engine id + delegate exercise selection
 * to sessionBuilder.
 *
 * Returns null when:
 *   - Calendar override marks today as a rest day (`selectedDays[dayIdx].active === false`)
 *   - Pipeline emits a hard halt (e.g. Periodization fails — downstream cannot proceed)
 *   - runPipeline throws unexpectedly (D4 contract violation insurance)
 *
 * Returns a unified WorkoutPlan when training day + pipeline complete.
 *
 * @param {object} [userState] - { user, recentSessions, weights, profileTier, flags, meta }
 * @param {Date} [now=new Date()] - injected for deterministic testing
 * @returns {Promise<{
 *   type: 'training',
 *   sessionType: string,
 *   warmup: object|null,
 *   exercises: Array<{name: string, sets: number}>,
 *   intensityModifier: object|null,
 *   volumeTargets: object|null,
 *   restTimeRange: [number, number]|null,
 *   specializationTarget: string|null,
 *   deloadState: string,
 *   weekMakeup: {added: Object<string,number>, behind: Object<string,number>},
 *   estimatedDurationMin: number,
 *   volumeKg: number,
 *   workoutTitle: string,
 * }|null>}
 */
export async function getDailyWorkout(userState, now = new Date(), options = {}) {
  const date = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const dayIdx = mapDateToIndex(date);
  // "Different group" ephemeral override (ScheduleOverride "Alta grupa"). When
  // true, Andura swaps today's scheduled cluster for the most-recovered ALTERNATIVE
  // cluster (pickAlternativeCluster) — a real different session, in-memory only,
  // never persisted to the calendar (the weekly schedule is untouched). Default
  // false → byte-identical to the prior behavior for every other caller.
  const wantDifferentMuscle = options?.differentMuscle === true;

  // Rest day check via calendar override
  const override = getCalendarOverride(date);
  if (override && Array.isArray(override.selectedDays)) {
    const dayConfig = override.selectedDays[dayIdx];
    if (dayConfig && dayConfig.active === false) {
      return null;
    }
  }

  // Compute available equipment — WP-4 selection uses COARSE equipment types
  // (library equipment_type), derived from the user's missing picker IDs.
  const missingUserIds = getMissingEquipment();
  const availableCoarse = availableCoarseTypes(missingUserIds);

  // Build EngineContext + invoke 8-adapter pipeline sequential strict
  const ctx = buildEngineContext(userState);
  const adapters = [
    periodizationAdapter,
    goalAdaptationAdapter,
    energyAdjustmentAdapter,
    bayesianNutritionAdapter,
    tempoAdapter,
    specializationAdapter,
    warmupAdapter,
    deloadAdapter,
  ];

  let results;
  try {
    results = await runPipeline(ctx, adapters);
  } catch {
    return null;
  }

  if (!Array.isArray(results) || results.length === 0) return null;

  // Hard halt detection — first hard error short-circuits pipeline downstream
  const hardError = results.find(r => r && r.ok === false && r.error && r.error.severity === 'hard');
  if (hardError) return null;

  // Aggregate engine blueprints by engine id (output.meta carries blueprint payload)
  const blueprints = {};
  for (const r of results) {
    if (r && r.ok === true && r.output && typeof r.output.id === 'string') {
      blueprints[r.output.id] = r.output.meta || {};
    }
  }

  // Frequency-based split: resolve the active-day week (override edge first, else
  // derive from onboarding frequency threaded via userState.user.frequency) and
  // map the queried day's ordinal-among-active-days → the Nth cluster of the
  // frequency-appropriate template. cluster drives BOTH selection (buildSession)
  // and the per-group weekly frequency the volume budget is divided across.
  // Focus selector (D-focus 2026-06-02) — the user's optional LOOK preset shapes
  // BOTH the split (focus-aware frequencyToSplit reshapes the week) and the
  // volume budget (applyFocusBias below). Default 'balanced' → ZERO change
  // (byte-identical to pre-feature). The de-emphasized RO groups are computed
  // once + reused to SUPPRESS the auto-signals (M2 weakness / M3 imbalance) on
  // the region the user intentionally minimized (focus BEATS auto-balance).
  const focusPreset =
    typeof userState?.user?.focusPreset === 'string' && FOCUS_PRESETS[userState.user.focusPreset]
      ? userState.user.focusPreset
      : 'balanced';
  const deEmphSet = deEmphasizedGroups(focusPreset);
  // Focus EMPHASIS (D-focus-visible 2026-06-05) — the Big-11 RO groups the preset
  // raises. Threaded into buildSession so the emphasis surfaces as MORE exercise
  // slots + front-of-session on the day the group is trained — NOT just a weekly
  // volume bump the SESSION_SIZE clamp + cluster-weight slot caps silently absorb.
  // This is what makes arms/chest produce a VISIBLY different session than balanced
  // (Daniel: "whatever I pick I get the v-taper workout" — arms/chest were
  // exercise-for-exercise clones of balanced because only v-taper changed the
  // SPLIT; emphasis-only presets need an in-session lever). balanced → empty set →
  // byte-identical to pre-feature.
  const emphSet = emphasizedGroups(focusPreset);
  const activeWeek =
    activeWeekFromOverride(override) ??
    activeWeekFromScheduleStore() ??
    activeWeekForFrequency(userState?.user?.frequency);
  const scheduledCluster = clusterForDay(activeWeek, dayIdx, focusPreset);
  // "Different group" override — Andura picks the most-recovered ALTERNATIVE
  // cluster (≠ today's scheduled one) from the recovery state already derivable
  // from the user's logged sessions. Recovery flatten + state are pure + cheap;
  // the later resistanceState (Coach Voice attribution) recomputes them under the
  // SAME clock, so the values agree. No override requested → effectiveCluster IS
  // the scheduledCluster (zero change).
  const overrideRecoveryLogs = wantDifferentMuscle
    ? flattenSessionsToRecoveryLogs(userState?.recentSessions)
    : [];
  const overrideRecoveryState =
    wantDifferentMuscle && overrideRecoveryLogs.length > 0
      ? getRecoveryByGroup(overrideRecoveryLogs, undefined, date.getTime())
      : {};
  const cluster = wantDifferentMuscle
    ? pickAlternativeCluster(scheduledCluster, overrideRecoveryState)
    : scheduledCluster;
  const split = frequencyToSplit(activeWeek.filter(Boolean).length || 1, focusPreset);
  const sessionsPerGroup = weeklySessionsPerGroup(split);
  // OUTPUT session-type tag (uppercase) for the localized title boundary — kept
  // SEPARATE from the cluster id buildSession consumes. Reflects the EFFECTIVE
  // cluster so a "Different group" override surfaces the alternative session type.
  const sessionType = CLUSTER_TO_SESSION_TAG[cluster] || 'FULL';
  const specializationTarget = blueprints.specialization?.target_muscle_group ?? null;
  const userId = userState?.user?.uid ?? userState?.uid ?? '';
  const seed = `${userId}|${getWeekStartIso(date)}|${dayIdx}`;

  // ── M1: muscle-recovery → today's volume budget (the moat seam) ──────────
  // The recovery brain already exists (getRecoveryByGroup) but only DISPLAYED.
  // Here it ACTS on the plan: a group fatigued today gets its weekly budget cut
  // today (partial ×0.80, fatigued ×0.60), and the volume it gives up is then
  // REDISTRIBUTED to the fresh groups TODAY's cluster trains (see
  // redistributeRecoveredVolumeToFreshSessionGroups below — proportional to
  // cluster weight, MRV-capped), so the freed volume does NOT vanish: a fatigued
  // chest on a push day becomes lighter-chest/heavier-shoulders, not a collapsed
  // session. Logs come from the SAME persisted sessions the Progress
  // manikin reads (recentSessions → flattenSessionsToRecoveryLogs). `date.getTime()`
  // threads the planned clock into recovery so the cut is DETERMINISTIC.
  // No logs / all-recovered → budget unchanged → identical to pre-M1 chassis
  // (graceful degradation, ADR 025). Aerobic sessions (userState.aerobicSessions
  // from useAerobicStore) are folded into the recovery state at the RO stage of
  // applyRecoveryToVolumeBudget below: a recent class only EASES a fresh group
  // (recovered→partial ×0.80), never deepens an already-stressed one — so a hard
  // spin class (legs) makes today's leg budget lighter. No aerobic → identical.
  const baseVolumeTargets = blueprints.periodization?.volume_target_pct ?? null;
  const recoveryLogs = flattenSessionsToRecoveryLogs(userState?.recentSessions);
  const aerobicSessions = Array.isArray(userState?.aerobicSessions)
    ? userState.aerobicSessions
    : undefined;

  // ── M2: weakness amplifies REAL volume toward MRV (the substance, not just
  // reordering). Weak groups are layered, graceful (ADR 025):
  //   1. the Specialization 4-gate target (when it fires), then
  //   2. the always-available lagging signal (getLaggingMuscles) from the SAME
  //      flattened sessions M1 uses — so amplification still works when the
  //      4-gate doesn't fire. De-duped, most-lagging-first after the spec target.
  // No weak signal at all → weakGroups empty → amplification + reordering are
  // both no-ops → plan identical to the M1 chassis.
  const laggingGroups = laggingGroupsFromLogs(recoveryLogs, date.getTime());
  // ── M4a: OPTIONAL priority-muscle override (D-priority-muscle 2026-06-02) ──
  // Andura INFERS the priority by default — the lagging group above IS the
  // inferred priority (M2). M4a only adds an opt-in hook so a user CAN pin a
  // group ("vreau brate mai mari") via userState.user.priorityGroup (a Big-11 RO
  // key, the SAME vocabulary weakGroups uses). When set, the pinned group is fed
  // as an ADDITIONAL weak/priority group → it flows through the existing M2
  // amplification-toward-MRV mechanism (NO duplicate math). When unset (default
  // null) → ZERO change; the inferred priority governs. The picker UI is deferred
  // (override optional, never required) — this is the engine-ready hook only.
  const priorityGroup =
    typeof userState?.user?.priorityGroup === 'string' && userState.user.priorityGroup.length > 0
      ? userState.user.priorityGroup
      : null;
  // Focus suppression (D-focus): drop any de-emphasized group from the weak set
  // so M2 weakness amplification does NOT re-inflate the region the user
  // intentionally minimized (focus BEATS auto-balance). EMPHASIZED groups are
  // unaffected here — focus + weakness compose fine (both raise), still MRV-capped.
  // balanced → deEmphSet empty → identical to pre-feature.
  const weakGroups = [...new Set(
    [priorityGroup, specializationTarget, ...laggingGroups].filter(
      (g) => typeof g === 'string' && g.length > 0 && !deEmphSet.has(g),
    ),
  )];

  // ── M3: detect + correct antagonist/pattern imbalances (the moat substance:
  // Andura silently balances push/pull + quad/ham from history, ZERO user input).
  // Detected from the SAME flattened sessions M1/M2 use; the lagging side's group
  // budgets are raised toward parity with the dominant side, severity-scaled, each
  // group HARD-capped at its MRV. ADDITIVE only — never lowers the dominant side.
  // No imbalance (balanced / insufficient data) → budget unchanged → identical to
  // the M2 output (graceful degradation, ADR 025). NOT a medical signal — volume
  // biasing only. date.getTime() threads the clock for determinism.
  const rawImbalances = detectImbalances({ logs: recoveryLogs, now: date.getTime() });
  // Focus suppression (D-focus): strip de-emphasized groups from each imbalance's
  // laggingGroups so M3 imbalance correction does NOT re-inflate the minimized
  // region (e.g. v-taper must not let a quad/ham imbalance pull the de-emphasized
  // legs back up). A pair whose lagging side is fully de-emphasized drops out.
  // balanced → deEmphSet empty → imbalances pass through unchanged (identical).
  const imbalances =
    deEmphSet.size === 0
      ? rawImbalances
      : rawImbalances
        .map((imb) => ({
          ...imb,
          laggingGroups: imb.laggingGroups.filter((g) => !deEmphSet.has(g)),
        }))
        .filter((imb) => imb.laggingGroups.length > 0);

  // CRITICAL ORDERING (base → FOCUS → M2 → M3 → M1): the focus selector biases
  // the budget FIRST (emphasized→MRV, de-emphasized→MEV), then weakness (M2) +
  // imbalance (M3) amplify ON TOP (both already SUPPRESSED on de-emphasized
  // groups above) — each clamped to MRV — then M1's recovery redistribution cuts
  // TODAY's budget last (recovery + time remain guards: focus shapes intent, not
  // safety). balanced → focusBiasedTargets === baseVolumeTargets clone → the rest
  // of the chain is byte-identical to pre-feature.
  const focusBiasedTargets = applyFocusBias(baseVolumeTargets, focusPreset);
  const amplifiedTargets = applyWeaknessAmplification(focusBiasedTargets, weakGroups);
  const balancedTargets = applyImbalanceCorrection(amplifiedTargets, imbalances);

  // ── INTRA-WEEK DEFICIT RECOVERY (D-intra-week 2026-06-04) ────────────────
  // What was already done EARLIER this microcycle (skipped / early-ended sessions)
  // is made up on a later day — BEFORE the M1 recovery cut below, so the body still
  // governs: a fatigued group's makeup is then trimmed by recovery, and the final
  // MEV/MRV clamp keeps it recoverable. The weekly TARGET is the PRE-adaptation base
  // (baseVolumeTargets), prorated per group by how many of this week's PAST+TODAY
  // scheduled days train it — so a group whose sessions are all UPCOMING registers
  // NO deficit (Thursday must not chase Saturday's leg day). DONE volume + the week
  // anchor arrive React-side on userState.weekContext (raw sessionsHistory carries
  // per-exercise sets; the engine-mapped recentSessions may not). Cold start (no
  // weekContext / no done volume / no elapsed sessions) → makeup all 0 → the budget
  // is byte-identical to pre-feature (graceful degradation, ADR 025). Pure: the
  // proration threads the planned clock's weekday + the active week; no globals.
  // weekContext is the EXPLICIT opt-in signal that DONE-volume measurement ran
  // (React builder computes it from raw sessionsHistory). Its ABSENCE means "no
  // intra-week measurement available" → makeup is a strict NO-OP (NOT a zero-done
  // assumption — treating absent as all-zero-done would manufacture a phantom
  // deficit equal to the full to-date target). Every caller without weekContext
  // (engine unit fixtures, legacy callers) is therefore byte-identical to before.
  const weekContext =
    userState && typeof userState.weekContext === 'object' && userState.weekContext !== null
      ? userState.weekContext
      : null;
  const intraWeekMakeup = weekContext
    ? computeIntraWeekMakeup(
        baseVolumeTargets,
        typeof weekContext.volumeDone === 'object' && weekContext.volumeDone !== null
          ? weekContext.volumeDone
          : {},
        split,
        weekSessionSpreadByGroup(activeWeek, dayIdx, focusPreset),
      )
    : { added: {}, behind: {} };
  const madeUpTargets = applyMakeupToVolumeBudget(balancedTargets, intraWeekMakeup.added);

  const recoveredTargets = applyRecoveryToVolumeBudget(
    madeUpTargets,
    recoveryLogs,
    date.getTime(),
    aerobicSessions,
  );

  // Coach Voice — derive the structured adaptations log from the SAME maps the
  // plan was built from (zero recompute of the math, only a diff of deltas). The
  // recovery STATES (resistance-only vs merged-with-aerobic) drive the
  // recovery-cut cause attribution (a spin class vs a heavy session). Both
  // recompute cheaply + deterministically under the same clock the plan used.
  const resistanceState =
    recoveryLogs.length > 0 ? getRecoveryByGroup(recoveryLogs, undefined, date.getTime()) : {};
  const mergedState = aerobicSessions
    ? mergeAerobicRecovery(resistanceState, aerobicSessions, date.getTime())
    : resistanceState;

  // Recovery REDISTRIBUTION (the moat fix): the volume a recovery-cut group gave
  // up this session is reallocated to the FRESH groups TODAY's cluster trains
  // (proportional to cluster weight, each MRV-capped) — so a fatigued chest on a
  // push day becomes "lighter chest, HEAVIER shoulders/triceps" and the session
  // stays substantial instead of collapsing (the freed volume no longer vanishes).
  // SESSION-LOCAL: balancedTargets (the weekly SSOT) is untouched, so chest is
  // normal again on a fresh day. All-recovered / balanced → freed total is 0 →
  // volumeTargets === recoveredTargets (byte-identical to pre-feature). Uses the
  // SAME mergedState that drove the cut + the EFFECTIVE cluster the session trains.
  // Pre-cut reference is madeUpTargets (the budget the recovery cut ran ON) — so a
  // group whose intra-week makeup recovery then trimmed releases the CORRECT freed
  // amount. No makeup → madeUpTargets === balancedTargets clone (identical).
  const volumeTargets = redistributeRecoveredVolumeToFreshSessionGroups(
    madeUpTargets,
    recoveredTargets,
    cluster,
    mergedState,
  );
  // ACTIVE deload = any non-zero intensity modifier (mirrors the React-side
  // hasActiveDeload check in scheduleAdapterAggregate.compose: the IDLE blueprint
  // emits a zero modifier, every real deload state — SCHEDULED_LINEAR /
  // REACTIVE_* — a non-zero one).
  const deloadMod = blueprints.deload?.intensity_modifier ?? null;
  const deloadActive =
    deloadMod !== null &&
    ((deloadMod.rir_increment ?? 0) > 0 || (deloadMod.intensity_pct_decrement ?? 0) > 0);
  const coachAdaptations = deriveCoachAdaptations({
    // weakness-amp (M2) is the amplified-vs-focusBiased delta — so a focus-bias
    // bump is NOT mislabeled as weakness amplification (focus is intent, not a
    // detected weakness). balanced → focusBiasedTargets === baseVolumeTargets
    // clone → identical attribution to pre-feature.
    baseTargets: focusBiasedTargets,
    amplifiedTargets,
    balancedTargets,
    // The recovery cut ran on the POST-makeup budget (intra-week deficit recovery
    // adds volume before the cut), so the cut attribution compares madeUpTargets→
    // recovered. No makeup → madeUpTargets === balancedTargets clone (identical
    // attribution to pre-feature). M2/M3 attribution still reads the originals.
    preCutTargets: madeUpTargets,
    // The recovery-CUT attribution compares balanced→recovered (the groups that
    // dropped), so it reads the PRE-redistribution recovered budget — the
    // session-local fresh-group bump is an emphasis shift, not a detected cut.
    recoveredTargets,
    resistanceState,
    mergedState,
    deloadActive,
  });

  const sessionCtx = {
    equipment: { available: availableCoarse },
    weakGroups,
    profileTier: userState?.profileTier ?? null,
    prNames: Array.isArray(userState?.prNames) ? userState.prNames : [],
    seed,
    // Periodization volume signal (sets/week per Big-11 group, varies by
    // mesocycle phase), recovery-redistributed for TODAY (M1) — drives
    // per-exercise set counts in buildSession.
    volumeTargets,
    // Per-group weekly session frequency from the split — buildSession divides
    // the weekly volume budget by it to size the session (count + set counts).
    weeklySessionsPerGroup: sessionsPerGroup,
    // M1 "make it bite" — per-group recovery state (RO-keyed, recovered/partial/
    // fatigued) so the recovery cut REACHES the visible session: a fatigued group
    // is allowed below the normal compound set-floor AND drops ~1 exercise that
    // day (visibly lighter), not just on paper. This is the SAME mergedState that
    // drove the M1 budget cut above (resistance + aerobic) — NOT a new penalty,
    // it only makes the existing cut visible. Empty state (no logs) → no-op.
    recoveryState: mergedState,
    // Focus EMPHASIS surfacing (D-focus-visible 2026-06-05) — the emphasized
    // Big-11 RO groups earn an EXTRA exercise slot (over the cluster-weight cap)
    // AND front-of-session ordering, so the preset's volume intent shows as a
    // different exercise list, not just a higher weekly number the clamps absorb.
    // Distinct from weakGroups (auto-detected lagging): emphasis is the USER'S
    // explicit look choice. balanced → empty array → no-op (byte-identical).
    emphasizedGroups: [...emphSet],
  };

  const session = buildSession(cluster, sessionCtx);

  return {
    type: 'training',
    sessionType,
    warmup: blueprints.warmup || null,
    exercises: session && Array.isArray(session.exercises) ? session.exercises : [],
    intensityModifier: blueprints.deload?.intensity_modifier ?? null,
    // Recovery-redistributed budget actually consumed by buildSession this
    // session — the reported field matches what drove the plan (M1).
    volumeTargets,
    // Goal Adaptation rest-time prescription [minSec, maxSec] per template ×
    // phase × mode (goalAdaptation/index.js:178 rest_time_modifier). Was
    // computed by the engine but dropped here → planner hardcoded restSec 90.
    // null when the blueprint is absent (empty user) → planner falls back to 90.
    restTimeRange: blueprints.goalAdaptation?.rest_time_modifier ?? null,
    specializationTarget,
    deloadState: blueprints.deload?.deload_state ?? 'IDLE',
    // Coach Voice — structured, machine-readable adaptations log (the React side
    // synthesizes one plain-language coach line from it). ADDITIVE field; empty
    // array when nothing adapted this session. NO copy strings — tokens only.
    coachAdaptations,
    // Intra-week deficit recovery (D-intra-week 2026-06-04) — DATA only (no copy
    // this phase). `added` = makeup volume applied to TODAY's session per EN group;
    // `behind` = deficit still outstanding after today. A follow-up phase renders a
    // supportive note from this. Cold start / no deficit → both empty objects.
    weekMakeup: { added: intraWeekMakeup.added, behind: intraWeekMakeup.behind },
    estimatedDurationMin: 50,
    volumeKg: 0,
    // Non-localized fallback SENTINEL (NOT user copy). The React render
    // boundaries (CoachTodayCard / WorkoutPreview / Workout / PostRpe) detect it
    // and substitute a locale-aware title via t() — engines never emit localized
    // Romanian copy. Value mirrors ENGINE_WORKOUT_TITLE_FALLBACK in
    // src/react/lib/scheduleAdapterAggregate.ts (engine→React import is a
    // layering violation, so the literal is duplicated with this cross-ref).
    workoutTitle: '__engine_workout_title_fallback__',
  };
}
