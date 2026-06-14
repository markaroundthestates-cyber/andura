// ── getDailyWorkout — compose today's plan (8-engine pipeline + sessionBuilder) ──
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { buildEngineContext } from '../../../coach/orchestrator/contextBuilder.js';
import { runPipeline } from '../../../coach/orchestrator/index.js';
import { logger } from '../../../util/logger.js';
import { captureException } from '../../../util/sentry.js';
import {
  periodizationAdapter,
  goalAdaptationAdapter,
  energyAdjustmentAdapter,
  tempoAdapter,
  specializationAdapter,
  warmupAdapter,
  deloadAdapter,
} from '../../../coach/orchestrator/adapters/index.js';
import { buildSession } from '../../sessionBuilder.js';
import { buildExclusionTokens, contraindicatedGroupsFromPainCdl } from '../../movementExclusion.js';
import { isEnabled } from '../../../util/featureFlags.js';
import { exercisePenaltyMap } from '../../dp/exercisePain.js';
import { DP } from '../../dp.js';
import { progressingNames } from '../../dp/progressionSignal.js';
import { lumbarDedupPenalties, mergePenalties, weekClustersFor } from './lumbarDedup.js';
import { getRefusalPenalties } from './refusalFlowStorage.js';
import { painSwapMap } from '../../dp/painMemory.js';
import { fatigueSetsAdjust } from '../../dp/fatigueCurve.js';
import { effectiveRepsSetsTrim } from '../../dp/effectiveReps.js';
import { availableCoarseTypes } from '../../equipmentMap.js';
import {
  getRecoveryByGroup,
  mergeAerobicRecovery,
} from '../../muscleRecovery.js';
import { detectImbalances, applyImbalanceCorrection } from '../../imbalanceDetector.js';
import { buildSessionSignalTrace, APPLIED_MAP } from './signalBus.core.js';

import { mapDateToIndex, getWeekStartIso } from './dateHelpers.js';
import { getCalendarOverride } from './calendarOverrideStorage.js';
import { getMissingEquipment } from './missingEquipmentStorage.js';
import { getMissingEquipmentExercises } from './equipmentMemoryStorage.js';
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
import { resolveExperienceId } from '../../periodization/volumeLandmarks.js';
import { flattenSessionsToRecoveryLogs } from './recoveryLogs.js';
import { FOCUS_PRESETS, deEmphasizedGroups, emphasizedGroups, applyFocusBias, effectiveFocusPreset } from './focus.js';
import { applyFocusVolumeContracts, focusContractDemotions, applyLedgerLowerBackCap } from './focusVolumeContracts.js';
import { computeWeekLedger } from './weekLedger.js';
import {
  laggingGroupsFromLogs,
  applyWeaknessAmplification,
  applyEmphasisDeEmphasis,
  applyBeginnerVolumeCap,
  applyMaintenanceFloor,
  seniorSessionVolumeCap,
  applyRecoveryToVolumeBudget,
  redistributeRecoveredVolumeToFreshSessionGroups,
  allocateWeeklyVolumeByRecovery,
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
  // #82 EQUIPMENT PROFILE (fresh-eyes M5): a user with an explicit AVAILABLE
  // equipment profile (e.g. home gym = ['dumbbell','bodyweight'] for DB+bench+pull-up)
  // filters the pool to ONLY what they have — the subtractive missing-picker can't
  // express "I only have dumbbells" cleanly. When user.equipmentProfile is a non-empty
  // list of coarse types it REPLACES the missing-picker-derived availability (bodyweight
  // is always implicitly available — added below). Absent/empty → the existing
  // missing-picker path (byte-identical). INPUT-CAPTURE BOUNDARY: the onboarding UI to
  // SET a home/DB-only profile is a follow-up; the filter is wired + tested now.
  const profile = Array.isArray(userState?.user?.equipmentProfile)
    ? userState.user.equipmentProfile.filter((t) => typeof t === 'string' && t.length > 0)
    : [];
  const missingUserIds = getMissingEquipment();
  const availableCoarse =
    profile.length > 0
      ? [...new Set([...profile, 'bodyweight'])] // bodyweight always performable
      : availableCoarseTypes(missingUserIds);

  // Build EngineContext + invoke 8-adapter pipeline sequential strict
  const ctx = buildEngineContext(userState);
  // H-2 audit 2026-06-10: bayesianNutritionAdapter REMOVED from this pipeline —
  // its blueprint was computed then never read here (zero `blueprints.
  // bayesianNutrition` consumers in this file), pure wasted compute per plan
  // build. Bayesian Nutrition's REAL path is the React nutrition aggregate
  // (engineWrappers.ts evaluateBN + bayesianNutritionAggregate.ts), untouched.
  // BN consumed the constraint object read-only (never re-emitted), so removal
  // does not alter the downstream ctx chain — composition is byte-identical
  // (full-path-sim hash gate holds).
  const adapters = [
    periodizationAdapter,
    goalAdaptationAdapter,
    energyAdjustmentAdapter,
    tempoAdapter,
    specializationAdapter,
    warmupAdapter,
    deloadAdapter,
  ];

  let results;
  try {
    results = await runPipeline(ctx, adapters);
  } catch (err) {
    // M-1 audit 2026-06-10: a crashed pipeline used to be swallowed silently and
    // rendered as a rest day — indistinguishable from a real rest day for both
    // the user and debugging. Surface it before the null fallback (db.js idiom).
    logger.error('[getDailyWorkout] engine pipeline crashed — rendering as rest day', err);
    try { captureException(err, { tags: { component: 'getDailyWorkout.runPipeline' } }); } catch { /* swallow Sentry failure */ }
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

  // Signal-bus trace — observation-only computed-vs-applied record (additive
  // field on the returned object, ignored by every existing consumer). PURE;
  // the dev-gated SINK is wired React-side (signalBus.ts). Zero prescription.
  // Timestamp = the injected deterministic clock (NOT Date.now()) so the field
  // stays deterministic — preserves the plan byte-identical / determinism guards.
  const __signalTrace = buildSessionSignalTrace(results, APPLIED_MAP, hardError, date.getTime());

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
  // ARMS SIGNATURE (dp_arms_signature_v1, 2026-06-13) — on an arms focus, demote umeri
  // (shoulders) from the emphasize list to de-emphasize so biceps + triceps become the
  // week's clear top-two by volume (the eval-capped signature). effectiveFocusPreset
  // returns the umeri-demoted variant ONLY for arms when the flag is ON; otherwise the
  // raw preset (byte-identical). Threaded ONLY into the VOLUME/EMPHASIS path below — the
  // SPLIT path keeps reading the raw `focusPreset` string (arms's split is byte-identical
  // either way: it returns a null day-mix lean whether or not umeri is emphasized).
  const armsSignatureOn = isEnabled('dp_arms_signature_v1');
  const effectivePreset = effectiveFocusPreset(focusPreset, armsSignatureOn);
  const deEmphSet = deEmphasizedGroups(focusPreset, effectivePreset);
  // Focus EMPHASIS (D-focus-visible 2026-06-05) — the Big-11 RO groups the preset
  // raises. Threaded into buildSession so the emphasis surfaces as MORE exercise
  // slots + front-of-session on the day the group is trained — NOT just a weekly
  // volume bump the SESSION_SIZE clamp + cluster-weight slot caps silently absorb.
  // This is what makes arms/chest produce a VISIBLY different session than balanced
  // (Daniel: "whatever I pick I get the v-taper workout" — arms/chest were
  // exercise-for-exercise clones of balanced because only v-taper changed the
  // SPLIT; emphasis-only presets need an in-session lever). balanced → empty set →
  // byte-identical to pre-feature.
  const emphSet = emphasizedGroups(focusPreset, effectivePreset);
  // W-Split (dp_split_rebalance_v1) — gate the week-level split rebalance
  // (minimal-freq full-body + focus day-mix lean + back≥chest antagonist floor).
  // OFF → frequencyToSplit/clusterForDay run their legacy reshape → byte-identical.
  const splitRebalance = isEnabled('dp_split_rebalance_v1');
  const activeWeek =
    activeWeekFromOverride(override) ??
    activeWeekFromScheduleStore() ??
    activeWeekForFrequency(userState?.user?.frequency);
  const scheduledCluster = clusterForDay(activeWeek, dayIdx, focusPreset, splitRebalance);
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
  // dp_rotation_intraweek_v1 — TRAINING-DAY ORDINAL within the week (0-based). This is
  // the SAME `position` clusterForDay computes: today's index among the active days, or —
  // when today is not itself active — the count of active days strictly before it. It is
  // the canonical "Nth training day of the week", a pure function of the active-week split
  // + dayIdx (NOT Date.now()), so the intra-week rotation is deterministic and stable
  // across recompositions of the same day. Threaded into buildSession so poolForGroup
  // rotates the top equal-ish UNLOGGED isolation by the ordinal → adjacent training days
  // surface a different equivalent-role variant (the sweep's "repetate adiacent" fix).
  const activeIdxsForOrdinal = [];
  for (let i = 0; i < 7; i++) if (activeWeek[i]) activeIdxsForOrdinal.push(i);
  const activePos = activeIdxsForOrdinal.indexOf(dayIdx);
  const intraWeekDayOrdinal = activePos >= 0
    ? activePos
    : activeIdxsForOrdinal.filter((i) => i < dayIdx).length;
  const split = frequencyToSplit(activeWeek.filter(Boolean).length || 1, focusPreset, splitRebalance);
  // #R6a-T2 — does THIS week's split contain a separate Push day? (clusters are
  // lowercase: 'upper'/'lower'/'push'/'pull'/'legs'/'full'). A pure UPPER/LOWER split
  // (4d: upper/lower/upper/lower) has NONE — so the #2 upper-day triceps de-dup (which
  // assumes "the Push day already covers triceps") orphans direct triceps to 0 sets/wk.
  // 5d/6d/7d hybrids DO contain 'push' → the de-dup stays correct (byte-identical).
  const weekHasPushDay = split.includes('push');
  // DE-EMPHASIZED divisor fix (D-focus-divisor 2026-06-06): the per-session set
  // budget = weeklyBudget / weeklySessionsPerGroup[group]. A v-taper collapses the
  // lower body from 2 leg days → 1, dropping the leg divisor 2→1, so the (already
  // de-emphasized) weekly leg budget lands ENTIRELY on the single remaining leg day
  // → a FATTER session than balanced (≈29 vs ≈25 sets), the opposite of "lighten
  // legs" (founder live 2026-06-06: "powerlifter legs, could barely walk"). Fix:
  // keep a DE-EMPHASIZED group's divisor at the BALANCED session count (the count
  // before focus collapsed the days), so the lone leg day stays ~light (≈half the
  // weekly budget) instead of absorbing the whole week. Net intent: a v-taper leg
  // day's volume ≤ a balanced leg day, never more. EMPHASIZED + neutral groups are
  // untouched; balanced (deEmphSet empty) → identical to pre-fix.
  const sessionsPerGroup = weeklySessionsPerGroup(split);
  // TRUE per-group weekly training frequency (snapshot BEFORE the de-emphasis divisor
  // inflation below). The low-capacity weekly-band clamp must divide its ceiling by the
  // REAL number of days a muscle is trained — the de-emph fix below RAISES the divisor
  // for a de-emphasized group (so its weekly budget is not dumped on the lone day),
  // which would make the clamp under-trim... no, OVER-trim a de-emphasized major that is
  // truly trained once. Capturing the real count keeps weekly ≥ the maintenance floor.
  const trueSessionsPerGroup = { ...sessionsPerGroup };
  if (deEmphSet.size > 0) {
    const balancedSessionsPerGroup = weeklySessionsPerGroup(
      frequencyToSplit(activeWeek.filter(Boolean).length || 1, 'balanced', splitRebalance),
    );
    for (const roGroup of deEmphSet) {
      const balancedFreq = balancedSessionsPerGroup[roGroup];
      const collapsedFreq = sessionsPerGroup[roGroup];
      // Only RAISE the divisor (de-emph collapsed the days) — never lower it, so a
      // group the focus did NOT collapse keeps its real frequency.
      if (
        typeof balancedFreq === 'number' &&
        typeof collapsedFreq === 'number' &&
        balancedFreq > collapsedFreq
      ) {
        sessionsPerGroup[roGroup] = balancedFreq;
      }
    }
  }
  // OUTPUT session-type tag (uppercase) for the localized title boundary — kept
  // SEPARATE from the cluster id buildSession consumes. Reflects the EFFECTIVE
  // cluster so a "Different group" override surfaces the alternative session type.
  const sessionType = CLUSTER_TO_SESSION_TAG[cluster] || 'FULL';
  const specializationTarget = blueprints.specialization?.target_muscle_group ?? null;
  // F emphasis = specialization-phase (T6) — the engine's already-computed
  // volume_modifier (DISCARDED until now; getDailyWorkout read only the target).
  // When the user-picked emphasis is ACTIVE the engine emits a non-zero
  // otherGroupsReductionPct (−0.25); after the 4-week mesocycle it auto-returns
  // to zeros (computeMesocycleProgress.exiting) → the trade silently reverts to
  // balanced. Behind dp_emphasis_specialization_v1 (default OFF). Flag-OFF the
  // builder never sets the spec target/accept meta → the modifier stays zero (and
  // the de-emph step below is gated on the flag anyway) → byte-identical.
  const specVol = blueprints.specialization?.volume_modifier ?? null;
  const emphasisSpecOn = isEnabled('dp_emphasis_specialization_v1');
  // Active iff the flag is on AND the engine emitted a real cut for a resolved
  // target (zeros after the meso exit / when not active → inert).
  const emphasisActive =
    emphasisSpecOn &&
    specVol !== null &&
    typeof specVol.otherGroupsReductionPct === 'number' &&
    specVol.otherGroupsReductionPct < 0 &&
    typeof specializationTarget === 'string' &&
    specializationTarget.length > 0;
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
  const baseVolumeTargetsRaw = blueprints.periodization?.volume_target_pct ?? null;
  const recoveryLogs = flattenSessionsToRecoveryLogs(userState?.recentSessions);
  const aerobicSessions = Array.isArray(userState?.aerobicSessions)
    ? userState.aerobicSessions
    : undefined;

  // ── F6a #30: weekly volume allocation by recovery (flag-gated, NO-OP OFF) ──
  // RE-SKINS the EXISTING M1 redistribution at the WEEK level: a group whose
  // recovery window has not elapsed (partial/fatigued) defers its excess weekly
  // budget to the groups that ARE fresh (room-to-MRV weighted), conserving the
  // week's total volume + MEV/MRV bounds. Behind dp_weekly_recovery_alloc_v1
  // (default OFF) → the allocator is never invoked → baseVolumeTargets is the raw
  // periodization budget → byte-identical positional split + intra-day M1 path.
  // Even ON, an all-recovered / no-history week self-no-ops to a clone.
  const baseVolumeTargets =
    isEnabled('dp_weekly_recovery_alloc_v1') && baseVolumeTargetsRaw && recoveryLogs.length > 0
      ? allocateWeeklyVolumeByRecovery(
          baseVolumeTargetsRaw,
          // dp_recovery_dose_v1 (gym-log arc 2026-06-11): the recovery window
          // stretches with dose × unaccustomedness, so a big-volume session on
          // a long-rested muscle reads 'partial' (real DOMS) instead of fresh.
          getRecoveryByGroup(recoveryLogs, undefined, date.getTime(), {
            doseScaling: isEnabled('dp_recovery_dose_v1'),
          }),
        )
      : baseVolumeTargetsRaw;

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
  // T7 — when the specialization-phase emphasis is ACTIVE, the emphasized
  // target's UP-bias is owned by applyWeaknessAmplification (the spec target is in
  // weakGroups), so suppress applyFocusBias's emphasize-up to avoid a double-lerp
  // toward MRV. The de-emphasize→MEV branch of applyFocusBias is KEPT (v-taper/
  // upper lower-region relax). Flag-OFF / not active → suppressEmphasizeUp is
  // false → applyFocusBias is byte-identical to today.
  const focusBiasedTargets = applyFocusBias(baseVolumeTargets, focusPreset, emphasisActive, effectivePreset);
  const amplifiedTargets = applyWeaknessAmplification(focusBiasedTargets, weakGroups);
  // T6 REST-DOWN — relax every non-emphasized group toward MEV by the engine's
  // otherGroupsReductionPct (the zero-sum trade's down half). Protect the
  // emphasized set (the target rode UP via amplification above). Gated on
  // emphasisActive → flag-OFF this is skipped entirely → byte-identical. Runs
  // AFTER amplification so the target's UP is never clawed back. MEV-clamped.
  const tradedTargets = emphasisActive
    ? applyEmphasisDeEmphasis(amplifiedTargets, emphSet, specVol.otherGroupsReductionPct)
    : amplifiedTargets;
  const balancedTargetsRaw = applyImbalanceCorrection(tradedTargets, imbalances);
  // #70-D5 — BEGINNER per-group weekly volume CAP (experience anchoring, behind
  // dp_learned_volume_v1, default OFF → byte-identical). A beginner (T0) is hard-
  // capped at each group's MAV no matter the day count, so a high-frequency ask
  // can't hand a novice advanced-peak volume (Stefan back 26 > the beginner band).
  // Applied AFTER all amplification (focus/weakness/imbalance) so none of those can
  // lift a beginner past MAV; the recovery cut + MEV/MRV clamp still run below.
  const balancedCappedTargets = isEnabled('dp_learned_volume_v1')
    ? applyBeginnerVolumeCap(balancedTargetsRaw, userState?.profileTier)
    : balancedTargetsRaw;
  // W-Split GAP 4 — per-major-muscle weekly MAINTENANCE FLOOR (dp_split_rebalance_v1,
  // default OFF → byte-identical). Raises any MAJOR muscle that fell below its MEV
  // (a de-emphasis collapse, the 72yo's back) back UP to MEV so no big mover ~0s.
  // Applied AFTER the beginner cap so the floor sits inside [MEV, MAV/MRV]; small
  // groups (biceps/triceps/calves) are untouched (a focus trade may relax them).
  const balancedFlooredTargets = splitRebalance
    ? applyMaintenanceFloor(balancedCappedTargets)
    : balancedCappedTargets;
  // FOCUS VOLUME CONTRACTS (dp_focus_contracts_v1, 2026-06-12) — the per-focus WEEKLY
  // group-volume cap/floor layer (cross-group relationships the per-session resolver
  // cannot reach: back ≤1.6×median on balanced, biceps≈triceps on arms, chest>back,
  // shoulders floors, lower upper-maintenance caps, …). Applied AFTER the maintenance
  // floor (so the floor stays supreme; every contract write is [MEV,MRV]-clamped) and
  // BEFORE the intra-week makeup + recovery cut (the contract shapes weekly INTENT;
  // recovery/time still govern the day below). The contracted map becomes the weekly
  // SSOT (balancedTargets) every downstream step reads. daysPerWeek selects the band
  // (some contracts only bite at ≥4 training days). OFF / balanced-with-no-contract /
  // pure-fn callers → passthrough → byte-identical (the fp hash holds; pinned OFF in
  // the fp cohorts).
  const contractedTargets = isEnabled('dp_focus_contracts_v1')
    ? applyFocusVolumeContracts(
        balancedFlooredTargets,
        focusPreset,
        activeWeek.filter(Boolean).length || 1,
        armsSignatureOn,
      )
    : balancedFlooredTargets;

  // CROSS-DAY WEEK LEDGER (dp_week_ledger_v1, 2026-06-12) — re-derive what the week's
  // PRIOR days (0..dayIdx-1) projected (per-group SETS + per-sub-bucket SLOTS), the SAME
  // deterministic way the plan derives the day→cluster sequence (clusterForDay). Built
  // from the CONTRACTED weekly budget (the stable weekly SSOT every day shares) so the
  // projection matches what each day actually divides. Threaded into the resolver below
  // (ctx.weeklyLedger) for the slot-side contracts (close-grip cap, lateral/rear second
  // slot, biceps:triceps weekly parity) AND read HERE for the LOWER back-cap: the upper/
  // pull days of a lower-focus week shave their back budget toward the founder's
  // ≤0.65×max-lower cap once the ledger shows the lower buckets dominate — never below
  // MEV (the maintenance floor stays supreme). OFF / pure-fn caller → null → byte-
  // identical (the fp hash holds; pinned OFF in the fp cohorts).
  const weekLedger = isEnabled('dp_week_ledger_v1')
    ? computeWeekLedger({
        activeWeek,
        dayIdx,
        focusPreset,
        splitRebalance,
        volumeTargetsEN: contractedTargets,
      })
    : null;
  const balancedTargets =
    weekLedger && isEnabled('dp_focus_contracts_v1')
      ? applyLedgerLowerBackCap(
          contractedTargets,
          focusPreset,
          activeWeek.filter(Boolean).length || 1,
          weekLedger,
        )
      : contractedTargets;

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
        weekSessionSpreadByGroup(activeWeek, dayIdx, focusPreset, splitRebalance),
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
    recoveryLogs.length > 0
      ? getRecoveryByGroup(recoveryLogs, undefined, date.getTime(), {
          doseScaling: isEnabled('dp_recovery_dose_v1'),
        })
      : {};
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

  // #81 HARD movement-pattern EXCLUSION (contraindicated injury / explicit refusal).
  // SAFETY fix (NOT a flagged experiment — shipping a deadlift to a disc-herniation
  // patient or a squat to a user who refused it is the bug). Two honest inputs:
  //   - INJURY: the Pain CDL channel read with the INJECTED clock
  //     (contraindicatedGroupsFromPainCdl(date.getTime())) — the SAME clock the
  //     recovery path uses, so it is correct under a planned/back-dated clock (the
  //     React builder's meta.painAffectedGroups derives off Date.now() and is stale
  //     against a non-real clock). A lower-back/disc report (→ spate) or a shoulder
  //     report (→ umeri) maps to the contraindicated tokens in INJURY_PATTERN_EXCLUSIONS.
  //   - REFUSAL: user.refusedPatterns (persisted per-UID list, e.g. ['squat',
  //     'deadlift']) hard-removes those PATTERNS — distinct from the in-session
  //     one-tap skip. INPUT-CAPTURE BOUNDARY: the onboarding/profile UI that SETS
  //     this list is a follow-up (no field exists yet); the engine exclusion is wired
  //     + tested now and activates the moment the field is populated.
  // No injury + no refusal (the common case) → empty token set → poolForGroup removes
  // nothing → byte-identical to today.
  const injuryGroups = contraindicatedGroupsFromPainCdl(date.getTime());
  const refusedPatterns = Array.isArray(userState?.user?.refusedPatterns)
    ? userState.user.refusedPatterns
    : [];
  const excludedMovements =
    injuryGroups.length > 0 || refusedPatterns.length > 0
      ? buildExclusionTokens(injuryGroups, refusedPatterns)
      : null;

  const sessionCtx = {
    equipment: { available: availableCoarse },
    weakGroups,
    profileTier: userState?.profileTier ?? null,
    // W-Split GAP 4 — SENIOR / COLD-START per-session VOLUME CAP (dp_split_rebalance_v1,
    // default OFF → null → buildSession leaves the session untouched, byte-identical).
    // When ON, a senior (age ≥60) and/or beginner gets a MAX total working-sets ceiling
    // (age × experience) so session 1 is not ~20+ sets; buildSession trims down to it,
    // never below the per-exercise MEV floor. A trained adult → null → no cap.
    seniorSessionCap: splitRebalance
      ? seniorSessionVolumeCap(userState?.user?.age, resolveExperienceId(userState?.user))
      : null,
    // LOW-CAPACITY WEEKLY-BAND CLAMP (dp_lowcap_weekly_band_v1, 2026-06-14, default ON).
    // A MAINTENANCE-goal (goal 'mentenanta') or OLDER (age >=60) trainee must NOT get
    // weekly volume that scales linearly with frequency (the eval defect: p9 ~67/wk at
    // freq-7, p10 ~71/wk at freq-5 — over-prescribed for a maintenance/older trainee).
    // When set, buildSession clamps EACH trained muscle's per-session DELIVERED sets so
    // its WEEKLY sum lands in the maintenance band (perMuscleCeiling), regardless of how
    // many days they train — extra days become lighter sessions, not more total volume.
    // Reuses ctx.weeklySessionsPerGroup (above) for the per-muscle frequency. NULL for a
    // trained adult under 60 → no clamp → byte-identical (pinned OFF in the fp cohorts).
    lowCapWeeklyBand:
      isEnabled('dp_lowcap_weekly_band_v1')
      && (userState?.user?.goal === 'mentenanta'
        || (typeof userState?.user?.age === 'number' && userState.user.age >= 60))
        ? {
          perMuscleCeiling: 5,
          sessionsPerGroup: trueSessionsPerGroup,
          // FOCUS-AWARE two-tier ceiling (2026-06-14 refine): the focus / emphasized-region
          // muscles (v-taper = BOTH umeri AND spate) get a HIGHER ceiling in buildSession so
          // the focus stays EMPHASIZED and LEADS the maintenance week — the flat ceiling had
          // clamped the focus to the non-focus band, firing the judge's "focus not
          // emphasized" cap. Empty (balanced) → every muscle uses perMuscleCeiling.
          emphasizedGroups: [...emphSet],
        }
        : null,
    // W-Split GAP 4 — MAJOR-MUSCLE SLOT GUARANTEE (dp_split_rebalance_v1, default
    // OFF → false → buildSession never runs the guarantee, byte-identical). The
    // slot-side complement of applyMaintenanceFloor: the weekly floor keeps every
    // major muscle ≥ MEV in the BUDGET, but a slot-limited full-body day whose
    // focus front-loads its emphasized region can drop a major muscle to ZERO
    // SLOTS (Gigel 2d UPPER: hams/glutes/calves slotted out → the floored budget
    // never lands). When ON, buildSession guarantees each major muscle this cluster
    // trains at least one exercise so a de-emphasized region is MAINTAINED at MEV,
    // never zeroed.
    maintenanceFloorGuarantee: splitRebalance,
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
    // F5 (dp_latiso_dedup_v1, 2026-06-10) — the active week's derived clusters,
    // so the focus-policy resolver can defer a weekly minimum from the GENERALIST
    // 'upper' day to the week's SPECIALIST days (v-taper: Pull owns the lat-iso
    // exposure, Upper lands at 7 lifts — Daniel's coach-review + the D117 intent).
    // OFF → null → byte-identical (no deferral).
    weekClusters: isEnabled('dp_latiso_dedup_v1')
      ? weekClustersFor({ activeWeek, focusPreset, splitRebalance })
      : null,
    // CROSS-DAY WEEK LEDGER (dp_week_ledger_v1, 2026-06-12) — the projection of what
    // the week's PRIOR days delivered (per-group sets + per-sub-bucket slot days/sets),
    // so the focus-policy resolver can enforce the cross-day SLOT contracts a per-day
    // pass cannot reach: tighten close-grip once the week's prior push days already
    // projected the ≤4-set quota; inject a SECOND lateral/rear slot on a later shoulder
    // day when the week still owes the ≥6-set quota; inject extra direct-biceps when the
    // projected WEEK biceps trails 0.85×triceps. The SAME ledger object built at the
    // budget seam above (shared, not recomputed). OFF → null → byte-identical (the
    // resolver's contract gates all degrade to no-op without it).
    weeklyLedger: weekLedger,
    // Focus EMPHASIS surfacing (D-focus-visible 2026-06-05) — the emphasized
    // Big-11 RO groups earn an EXTRA exercise slot (over the cluster-weight cap)
    // AND front-of-session ordering, so the preset's volume intent shows as a
    // different exercise list, not just a higher weekly number the clamps absorb.
    // Distinct from weakGroups (auto-detected lagging): emphasis is the USER'S
    // explicit look choice. balanced → empty array → no-op (byte-identical).
    emphasizedGroups: [...emphSet],
    // De-emphasized Big-11 RO groups (focus.deEmphasize) — threaded so the
    // full-body slot crunch on a 1-3-day FOCUS week resolves toward the focus
    // (Daniel sweep review 2026-06-11): a de-emphasized region is MAINTENANCE
    // (ONE compound), so on a slot-starved full-body day its SURPLUS leg
    // compounds may yield to the focus's width work, and the maintenance-floor
    // guarantees the de-emphasized region at REGION level (>=1), not per-group.
    // balanced → empty → byte-identical (no de-emphasis, no yield).
    deEmphasizedGroups: [...deEmphSet],
    // #8/D pain/injury per-exercise deprioritize (dp_pain_deprioritize_v1, default
    // OFF → empty map → byte-identical pool order). When ON, a repeatedly-skipped /
    // recently-painful SPECIFIC exercise is demoted in poolForGroup so a same-muscle
    // sibling is preferred; never a hard ban (poolForGroup keeps the last option).
    // Refusal-memory (dp_refusal_memory_v1, Daniel 2026-06-10): a "nu vreau"
    // swap-away DEMOTES that exercise here with a 28-day-half-life decay — it
    // comes back on its own (reversible) and swap PICK-LISTS are untouched (the
    // refused name still appears there). Soft layer between "nothing" (the old
    // behavior under 3 refusals) and the threshold-3 "permanent?" modal. Empty
    // counter → empty map → byte-identical (sims have no refusals).
    exercisePenalties: mergePenalties(
      isEnabled('dp_pain_deprioritize_v1') ? exercisePenaltyMap() : null,
      isEnabled('dp_refusal_memory_v1') ? getRefusalPenalties(date.getTime()) : null,
    ),
    // #R6d cross-week lumbar dedup (dp_lumbar_dedup_v1) — moved OUT of the soft
    // pain/refusal channel to its OWN structural channel (Daniel focus-sweep
    // review 2026-06-11): unlike pain/refusal it must PIERCE the PR-continuity
    // exemption (the heavy hinge it spaces IS the user's logged RDL — the soft
    // channel's PR pass-through made the demote a no-op for exactly its target)
    // and it threads into the set distribution (a repeat-day hinge that still
    // lands trains LIGHT, isolation band). Demote-only, last-option guarded.
    // Merged: the cross-week lumbar dedup (above) UNION the focus-contract shrug +
    // lower-back demotion (dp_focus_contracts_v1) — both demote-only, max-unioned by
    // mergePenalties so a name in both keeps the stricter (1.0). The focus demote keeps
    // traps/erectors off a v-taper/back/upper focus's lat-width slots (contracts 6+7).
    // OFF / non-demote focus → empty map → byte-identical to the lumbar-only channel.
    structuralPenalties: mergePenalties(
      lumbarDedupPenalties({
        flagOn: isEnabled('dp_lumbar_dedup_v1'),
        activeWeek,
        dayIdx,
        todayCluster: cluster,
        focusPreset,
        splitRebalance,
      }),
      isEnabled('dp_focus_contracts_v1') ? focusContractDemotions(focusPreset) : null,
    ),
    // R6d-b in-session lumbar pairing (same flag seam): a heavy deadlift-family
    // hinge and a back-extension accessory must not share ONE session (his
    // 4d-lower Thursday stacked Squat + RDL + Hyperextension). sessionBuilder
    // drops the back-extension, minSession-guarded.
    lumbarPairDedup: isEnabled('dp_lumbar_dedup_v1'),
    // dp_accessory_rotation_v1 — anchor/accessory rotation. poolForGroup
    // alternates the top two equal-ish LOGGED isolations on the ISO-week parity
    // (derived from `seed` above), so a mature account's accessories rotate
    // weekly while tier-1 anchors repeat. OFF → byte-identical pool order.
    accessoryRotation: isEnabled('dp_accessory_rotation_v1'),
    // dp_rotation_intraweek_v1 — INTRA-WEEK isolation rotation (extends the cross-week
    // sibling above one dimension over). poolForGroup rotates the top equal-ish UNLOGGED
    // isolation by the training-day ordinal WITHIN the week (intraWeekDayOrdinal, derived
    // from the active-week split above) so ADJACENT training days surface a different
    // equivalent-role variant — the sweep's "repetate adiacent" info signals on unlogged
    // accessories. LOGGED isolations are DP anchors and STAY (disjoint from the cross-week
    // step). OFF → null ordinal path / byte-identical pool order.
    rotationIntraWeek: isEnabled('dp_rotation_intraweek_v1'),
    intraWeekDayOrdinal,
    // #64 PERSISTENT pain memory PROACTIVE swap (dp_pain_memory_v1, default OFF →
    // null → byte-identical pool). When ON, a user-PINNED painful exercise is
    // REPLACED in poolForGroup by its persisted curated chain substitute (held
    // until the pin is cleared); no suitable substitute → falls back to the
    // existing DEMOTE (exercisePenalties above). Empty pin store → empty map →
    // byte-identical even with the flag ON.
    painSwaps: isEnabled('dp_pain_memory_v1') ? painSwapMap() : null,
    // #81 HARD contraindication/refusal exclusion (SAFETY — applied whenever a real
    // injury/refusal signal exists, NOT gated behind a default-OFF experiment).
    // poolForGroup REMOVES the contraindicated movement pattern (last-option guarded)
    // so a safe same-muscle sibling leads. Null (no injury + no refusal) → no-op.
    excludedMovements,
    // EQUIPMENT-MEMORY hard exclusion (founder Busy/Missing redesign 2026-06-12,
    // dp_equipment_memory_v1, default ON). The SPECIFIC EN canonical exercise names
    // the user told the coach are equipment-missing (in-session "Aparat lipsa" →
    // confirm → wv2-equipment-missing-exercises). buildSession HARD-removes exactly
    // these names from each group's pool (last-option guarded — never an empty
    // muscle). Distinct from the COARSE missing-equipment TYPE filter above
    // (availableCoarse) and from the SOFT refusal demote (exercisePenalties): a
    // missing machine is a hard, name-level, non-decaying constraint until the user
    // removes it in Account. Empty list (the common case + every sim) → empty array
    // → byte-identical composition. Flag OFF → empty array → byte-identical (the
    // full-path-sim hash holds; pinned OFF in the fp cohorts).
    equipmentMissingNames: isEnabled('dp_equipment_memory_v1')
      ? getMissingEquipmentExercises()
      : [],
    // F6a #20 per-set fatigue curve (dp_fatigue_curve_v1, default OFF → null →
    // distributeGroupSets applies adjust 0 → byte-identical). When ON, the learned
    // per-exercise drop-off index (persisted dp-fatigue-curve, name-keyed on the EN
    // canonical engineName — the SAME name sessionBuilder uses for the pool) yields
    // +1 working set for a MAINTAINER / -1 for a CRASHER, clamped to the existing
    // [floor, ceiling] band in distributeGroupSets. The learner runs at session
    // finish (workoutStore.logic persistSessionLogs); this only READS the cache.
    fatigueSetsAdjust: isEnabled('dp_fatigue_curve_v1') ? fatigueSetsAdjust : null,
    // #19 V3 effective-reps DOSE (dp_effective_reps_v1, default ON post-flip). The
    // narration (StimulusBlock) was wired; the DOSE half — feeding the stimulus
    // efficiency back into the set-count TARGET so a train-to-failure user needs
    // FEWER raw sets for the same stimulus — was DEFERRED (the last hop). TRIM-ONLY:
    // effectiveRepsSetsTrim reads the user's recent working sets and returns -1 (drop
    // one set) ONLY for a consistent grinder (mean stimulus-per-set ≥85% of full),
    // else 0. It can NEVER return positive → never pushes past MRV / the band ceiling
    // (spec §2c.2 trim-only clamp). Applied alongside fatigueSetsAdjust in
    // distributeGroupSets, clamped to the SAME [floor, ceiling] + ≥1 working set.
    // Flag OFF → null → no trim → byte-identical.
    effectiveRepsSetsTrim: isEnabled('dp_effective_reps_v1') ? effectiveRepsSetsTrim : null,
    // #72 emphasis raises per-exercise SETS (dp_emphasis_specialization_v1, default
    // OFF → byte-identical). When ON, an emphasized Big-11 RO group's compound
    // ceiling rises in buildSession so the weekly budget already raised toward MRV
    // (applyWeaknessAmplification, with non-focus held at MEV via
    // applyEmphasisDeEmphasis above) actually REACHES the visible per-exercise set
    // count (the +2-6 sets specialization quantum, policy §3) instead of being
    // capped at 5 — the DIAG #2 "emphasis doesn't change the sets" gap. Reuses the
    // SAME flag the spec-engine trade rides (one coherent emphasis switch).
    emphasisSetsBoost: emphasisSpecOn,
    // #71 coherent weekly volume allocation (dp_coherent_weekly_alloc_v1, default
    // OFF → byte-identical). When ON, buildSession derives each group's per-day
    // budget from a STABLE per-exercise dose so the SAME lift no longer swings 3↔5
    // across days as the day's slot count varies (DIAG #3 incoherent allocation),
    // and the catch-all overlap day stops ballooning a few slots into 5-set presses.
    coherentAlloc: isEnabled('dp_coherent_weekly_alloc_v1'),
    // tier-aware FRESH compound floor (dp_tier_compound_floor_v1, default OFF →
    // byte-identical). When ON, a T0 NOVICE's fresh compound floor may drop to 2
    // (MEV) in distributeGroupSets while a TRAINED lifter (T1/T2) keeps the
    // universal 3 (so trained compounds are never stranded at 2 when the muscle is
    // fresh). The beginner gate reads ctx.profileTier inside buildSession; OFF →
    // the universal 3-set fresh floor for everyone.
    tierCompoundFloor: isEnabled('dp_tier_compound_floor_v1'),
    // R4 anchor-protective shave (dp_anchor_sets_v1, Daniel coach audit 2026-06-10
    // "main lifts primesc 3 seturi, nu totul 2"). When ON, a NON-RECOVERED group's
    // 1-set shave + lowered floor EXEMPT the anchor (first tier-1 compound) — the
    // squat stays at 3 working sets and the lighter day is carried by the
    // isolations (one extra set shaved from the back of the group instead, total
    // preserved). OFF → byte-identical (the shave hits every exercise).
    anchorProtect: isEnabled('dp_anchor_sets_v1'),
    // #73 goal/sex-aware SELECTION (dp_smart_selection_v1, default OFF →
    // byte-identical). When ON:
    //  - lateralRaiseGuarantee: a focus that emphasizes the shoulders (umeri in
    //    emphSet — v-taper / upper / shoulders) guarantees a lateral raise in the
    //    session (the #1 width movement the DIAG showed selection was missing), so
    //    the emphasized delts reach the 17-20 width band instead of stalling ~16.
    // SEX-BIAS CUT (Wave 1.1, Daniel 2026-06-09): the sexBias selection demotion is
    // REMOVED — exercise quality must not depend on sex (Hip Thrust/Kickback valid
    // for men; Bench valid for women). Sex stays ONLY in cold-start load seeding /
    // strength + volume priors (coldStartGuidelines / populationPrior), never in
    // pick quality. So sexBias is no longer threaded into buildSession/poolForGroup.
    lateralRaiseGuarantee:
      isEnabled('dp_smart_selection_v1') && emphSet.has('umeri'),
    // #R6a upper-day biceps guarantee (dp_biceps_guarantee_v1, default ON). A
    // cluster that trains biceps (upper/pull/full → targets includes 'biceps')
    // must include >=1 biceps movement — Daniel's real Upper day rounded biceps
    // (0.15 weight) out entirely. OFF → byte-identical (never injects).
    bicepsGuarantee: isEnabled('dp_biceps_guarantee_v1'),
    // #R6a-T full-body triceps guarantee (dp_triceps_fullbody_guarantee_v1,
    // default ON). Scoped to the `full` cluster ONLY: an all-full-body week
    // (freq<=3) has no separate Push day, so direct triceps rounds to 0 sets/wk
    // even though `full` weights triceps 0.10. Inject one if none landed. The
    // upper-day triceps de-dup (#2) is NOT touched. OFF → byte-identical.
    tricepsFullbodyGuarantee: isEnabled('dp_triceps_fullbody_guarantee_v1'),
    // #R6a-T2 split-day (UPPER/LOWER) triceps guarantee (dp_triceps_split_guarantee_v1,
    // default ON). Scoped to an `upper` day on a week with NO push day (a pure
    // UPPER/LOWER 4-day split). The #2 upper-day triceps de-dup drops direct triceps on
    // `upper` justified by "the Push day already covers it" — FALSE on a U/L split (no
    // push day) → triceps orphaned to 0 sets/wk. When true, buildSession restores a
    // direct-triceps lift AFTER the de-dup, orphan-safely + surface-safely (swap an
    // over-slotted non-surfaced isolation; never claw back a weak/emphasized group's
    // slot). Splits WITH a push day (5d/6d/7d) → false → de-dup holds → byte-identical.
    // OFF → byte-identical.
    tricepsSplitGuarantee:
      isEnabled('dp_triceps_split_guarantee_v1') && cluster === 'upper' && !weekHasPushDay,
    // #R6b spate-injury hamstring leg-curl guarantee (dp_legcurl_guarantee_v1,
    // default ON). SAFETY-paired with the disc/lower-back exclusion: spate kills the
    // whole spinal-loading hinge family (RDL/deadlift/good-morning/hip-thrust/squat +
    // the GHR/Nordic/hyperextension erector family via the LUMBAR_HINGE sentinel),
    // which would orphan hamstrings on slot-limited full-body days. When ON, a cluster
    // that trains hamstrings under a spate exclusion injects a spine-neutral Leg Curl
    // (knee flexion, no axial load) if none landed — the backfill that makes the GHR
    // exclusion safe. Only fires WITH a spate injury signal (the sentinel is in the
    // exclusion set); no injury → null excludedMovements → never runs → byte-identical.
    legCurlGuarantee: isEnabled('dp_legcurl_guarantee_v1'),
    // #LEG POSTERIOR+QUAD FLOOR (dp_posterior_chain_floor_v1, default ON). Elite-coach
    // invariant: a FULL-BODY day ALWAYS trains quads AND the posterior chain. On freq
    // 1-3 all-full-body weeks under an upper-biased focus (v-taper / chest / shoulders /
    // upper / back) the focus zeroes the leg weights, so the leg majors are not in
    // `targets` and the maintenance-floor guarantee + 2-in-3 region floor + focus-protect
    // let legs fall to ZERO slots (88 configs posterior=0, 38 quads=0 in the grid). When
    // ON, buildSession enforces (FULL cluster only) >=1 quad-primary slot AND >=1
    // posterior (hams|glutes)-primary slot AFTER all other slot logic, displacing the
    // focus's surplus upper isolation if needed (the one case where leg maintenance
    // OVERRIDES focus-protect). Scoped `cluster === 'full'` inside buildSession — U/L
    // split upper days legitimately have 0 legs (the Lower day trains them). OFF →
    // ctx.posteriorChainFloor false → block never runs → byte-identical.
    posteriorChainFloor: isEnabled('dp_posterior_chain_floor_v1'),
    // #70-D2 — COMPOUND-FIRST guarantee on an emphasis/weak-reordered session
    // (dp_emphasis_specialization_v1, default OFF → byte-identical). When ON, the
    // weak/emphasis front-loader is prevented from leading the day with an ISOLATION
    // (a glute-emphasis leg day whose fese pick is a kickback/abduction) ahead of an
    // available compound. Rides the same emphasis switch the front-loader rides.
    compoundFirstGuard: emphasisSpecOn,
    // #70-D5 — BEGINNER per-group slot cap (dp_learned_volume_v1, default OFF →
    // byte-identical). When ON, a beginner's NON-focus groups are capped to keep a
    // high-frequency novice week in the MEV/low-MAV band (experience anchoring).
    beginnerVolumeCap: isEnabled('dp_learned_volume_v1'),
    // BEGINNER session-size cap (dp_beginner_session_size_v1, default ON). The
    // elite-coach rubric wants a novice at <=4-5 exercises/session (compound-first,
    // few patterns mastered); the /10 eval docked the beginner for 8/session on
    // EVERY config. When ON + the user is a BEGINNER (resolveExperienceId reads
    // user.experience), this is the effective session-size cap (5) buildSession uses
    // IN PLACE OF SESSION_SIZE — the fill loop targets 5, selection stays compound-
    // first (focus still leads >=2 slots), and the iso guarantees relax so a major is
    // COVERED by a compound's primary/secondary rather than forcing a separate slot
    // above the cap. Null (flag OFF / non-beginner) → buildSession uses SESSION_SIZE
    // = 8 as today → byte-identical (pinned OFF in fp-config FLIPPED_FLAGS).
    beginnerSessionSize:
      isEnabled('dp_beginner_session_size_v1')
      && resolveExperienceId(userState?.user) === 'incepator'
        ? 5
        : null,
    // §beginner-volume-v2 (dp_beginner_volume_v2, default ON; pinned OFF in fp) —
    // when ON, buildSession applies a FINAL clamp that caps a BEGINNER's EMPHASIZED-
    // group ISOLATIONS at MEV (2 sets). The prior delivered path rode a novice's
    // single-muscle emphasis to ~20-22 weekly DELIVERED sets (= advanced MRV): the
    // focus signature surfaces press + lateral + rear width SLOTS on each training
    // day and the cross-day delt-quota ledger floor handed those isolations 3 sets.
    // The clamp keeps the SLOTS (the look choice / width promise stays visible) but
    // trims the per-exercise junk 3rd set so the emphasized muscle lands toward the
    // ~10-14 beginner band; the COMPOUND anchor + isolation-ONLY emphasized groups
    // (arms) are exempt so nothing sinks below MEV. OFF → no clamp → byte-identical
    // (fp holds — pinned OFF in FLIPPED_FLAGS). The name is historical (the slot-cap
    // lever it once gated was retired for sinking non-focus majors below MEV).
    beginnerEmphasisSlotCap: isEnabled('dp_beginner_volume_v2'),
    // Daniel expert tier-list SELECTION (dp_daniel_tier_select_v1, default OFF →
    // byte-identical). When ON, poolForGroup orders each muscle's auto-pool by
    // Daniel's hand-ranked S/A/B/C/D selection band (exerciseTierRank.js) as the
    // PRIMARY quality key + hard-excludes D-band anti-patterns (last-option guarded),
    // so the engine prescribes from HIS ranked list per muscle ("Andura picks like
    // Daniel"). PR-history continuity (band 0) + squat-primacy + all gates intact.
    danielTierSelect: isEnabled('dp_daniel_tier_select_v1'),
    // FINER sub-family selection dedup (dp_selection_dedup_v1, default ON →
    // SWAP-not-add). When ON, the in-session movement dedup keys with deepFamily=true
    // so a "bench" resolves to its chest-press sub-family: two FLAT presses (e.g.
    // Smith Machine Bench + Flat Chest Press Machine) collapse onto ONE press slot
    // and the freed slot fills with the in-pool complementary INCLINE — same exercise
    // count, no orphaned muscle. OFF → byte-identical movementKey (pinned OFF in
    // fp-config so the frozen full-path hashes hold).
    selectionDedup: isEnabled('dp_selection_dedup_v1'),
    // #42 progression-conditioned selection bonus (dp_progression_bonus_v1, gym-
    // log arc 2026-06-11). ONLY exercises with a real upward e1RM trend earn the
    // +5 tierSelectScore `progressing` bonus (sub-band — never jumps a tier).
    // The blanket logged-bonus form was MEASURED harmful and refused; this is the
    // conditional form, PROBE-gated at the validation burst. OFF → null →
    // byte-identical.
    progressionBonus: isEnabled('dp_progression_bonus_v1'),
    progressingNames: isEnabled('dp_progression_bonus_v1')
      ? progressingNames(DP._loggedExerciseNames(), (name) => DP.getLogs(name, 12), null)
      : null,
    // Wave 1.3-B focus-policy resolver (dp_focus_policy_v1, default OFF →
    // byte-identical). When ON, buildSession applies the per-focus LOCAL
    // constraint policy (sessionCaps + sessionRequirements from FOCUS_RULES):
    // prune press/arm/pull excess over a cap, inject a missing required slot
    // (side/rear delt, flye, lat-isolation, overhead-triceps, stretch-curl) when a
    // qualifying candidate is in the pool — under the safety/recovery/coverage >
    // requirements > caps > score precedence. The focus id keys FOCUS_RULES; the
    // active-day count is the 1.3-C weekly-ledger hook (read, not enforced here).
    focusPolicy: isEnabled('dp_focus_policy_v1'),
    // dp_focus_contracts_v1 — gates the focus-contracts-arc resolver additions
    // (direct arm-work injection on back/upper/arms days + the shrug/close-grip/
    // arm-OHP sub-bucket caps). The WEEKLY volume contracts ride volumeTargets
    // (applyFocusVolumeContracts above); this is the SLOT-side half. OFF → the
    // resolver is byte-identical to the pre-arc behavior.
    focusContracts: isEnabled('dp_focus_contracts_v1'),
    // dp_arms_signature_v1 — gates the resolver's arms-only signature additions (back-lat
    // maintenance cap + raised direct-arm per-session minimums). OFF → the arms rule is
    // byte-identical to the pre-flag table; only the `arms` focus reads it.
    armsSignature: armsSignatureOn,
    focusId: focusPreset,
    daysPerWeek: activeWeek.filter(Boolean).length || 1,
  };

  const session = buildSession(cluster, sessionCtx);

  return {
    type: 'training',
    sessionType,
    warmup: blueprints.warmup || null,
    exercises: session && Array.isArray(session.exercises) ? session.exercises : [],
    intensityModifier: blueprints.deload?.intensity_modifier ?? null,
    // F2 #4 — Energy Adjustment direction + magnitude (energyAdjustment/index.js:
    // 204-205). RECONCILE only: the in-session ±% scale in Workout.tsx used FLAT
    // hardcoded literals (×0.8 / ×1.15); this surfaces the engine's tier-gated
    // asymmetric magnitude (UP/DOWN, |pct| ≤ 0.15) so the SAME single scale uses
    // the real engine number instead of a constant — NOT a third multiplier.
    // direction UP/DOWN/NONE; magnitudePct signed float in [-0.15,+0.15]. null
    // when the blueprint is absent (empty user) → Workout.tsx keeps the legacy
    // constant fallback (byte-identical).
    energyAdjustment: blueprints.energyAdjustment
      ? {
          direction: blueprints.energyAdjustment.adjustment_direction ?? 'NONE',
          magnitudePct: Number(blueprints.energyAdjustment.adjustment_magnitude_pct) || 0,
        }
      : null,
    // Recovery-redistributed budget actually consumed by buildSession this
    // session — the reported field matches what drove the plan (M1).
    volumeTargets,
    // Goal Adaptation rest-time prescription [minSec, maxSec] per template ×
    // phase × mode (goalAdaptation/index.js:178 rest_time_modifier). Was
    // computed by the engine but dropped here → planner hardcoded restSec 90.
    // null when the blueprint is absent (empty user) → planner falls back to 90.
    restTimeRange: blueprints.goalAdaptation?.rest_time_modifier ?? null,
    // F2 #3 — Tempo session-level cue (tempo/index.js:244-245). The Tempo engine
    // emits a persona-aware preSetIntro (notation + form cue) + form_cue, computed
    // but dropped. Surfaced as a UNIFORM session cue: per-exercise movementId is a
    // Faza-3 structural input dep (meta.movementId is never set, so the engine
    // emits one generic cue), so we apply it session-level — better than dropping,
    // and we do NOT fake per-exercise movement. null when the blueprint is absent.
    tempoCue: blueprints.tempo
      ? {
          // `line` = the engine's pre-composed RO text. Kept as a back-compat
          // fallback ONLY — the render boundary prefers the structured fields
          // below (cueId + persona + notation) and localizes via i18n so the
          // cue surfaces in the active locale (anti RO-leak under EN).
          line:
            blueprints.tempo.tempo_prescription?.preSetIntro ??
            blueprints.tempo.form_cue?.cueText ??
            null,
          notation: blueprints.tempo.tempo_prescription?.notation ?? null,
          // Structured, locale-neutral fields for the render boundary.
          cueId: blueprints.tempo.form_cue?.cueId ?? null,
          persona: blueprints.tempo.form_cue?.persona ?? null,
        }
      : null,
    // F2 #2 — Goal Adaptation rep + RIR modifiers (goalAdaptation/index.js:176-177).
    // rep_range_modifier [min,max] is the engine's intended per-(template,phase,
    // mode) rep band; rir_target_modifier [min,max] the intended RIR band. Both
    // were computed but dropped here (only rest_time_modifier was read). null when
    // the blueprint is absent (empty user) → DP keeps its phase-aware default band.
    repRangeModifier: blueprints.goalAdaptation?.rep_range_modifier ?? null,
    rirTargetModifier: blueprints.goalAdaptation?.rir_target_modifier ?? null,
    // W-Meso — the periodization mesocycle phase (LOAD/LOAD+/PEAK/DELOAD) for the
    // current week-in-block (periodization/index.js blueprint mesocycle_phase).
    // Surfaced so the compose seam can fold the intra-block RIR ramp (early weeks
    // higher RIR, ramping to lower RIR at PEAK) into the rir DISPLAY band behind
    // dp_meso_rir_v1 (default OFF). null when the blueprint is absent → no ramp.
    mesocyclePhase: blueprints.periodization?.mesocycle_phase ?? null,
    // F3 #6 — Periodization %1RM intensity corridor {floor,ceiling} (goal-derived,
    // hard-capped 90%, phase-multiplied; periodization/index.js:174). Computed but
    // previously dropped here (only volume_target_pct was read). Surfaced so the
    // compose seam can thread it into DP.getSmartRecommendation, which (behind
    // dp_intensity_corridor_v1, default OFF) bounds the prescribed kg's implied
    // %1RM into the band. null when the blueprint is absent → DP no-op.
    intensityCorridor: blueprints.periodization?.intensity_target_pct ?? null,
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
    // Signal-bus computed-vs-applied trace (observation only, additive). The
    // React layer reads this and feeds the dev-gated sink; no engine→React import.
    __signalTrace,
  };
}
