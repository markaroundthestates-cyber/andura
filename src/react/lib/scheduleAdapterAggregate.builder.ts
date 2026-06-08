// ══ SCHEDULE ADAPTER AGGREGATE — userState builder concern ════════════════
// Hygiene split (barrel re-export, zero behavior change): the builder-layer
// signal-completion helpers (energyDirection / weekIdx / bf / phase) + the
// SINGLE buildUserStateForPipeline overlay live here. buildUserStateForPipeline
// + estimateBfFraction are re-exported by scheduleAdapterAggregate.ts — the
// public API is unchanged. readinessScoreForUser is consumed cross-module by the
// compose concern (export added for the sibling import; NOT in the barrel surface).

import { useWorkoutStore } from '../stores/workoutStore';
import type { LastSessionSummary } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useAerobicStore } from '../stores/aerobicStore';
import { MS_PER_DAY } from '../../constants.js';
import { getComputedReadinessScore, getTodayReadiness } from '../../engine/readiness.js';
import { doneVolumeByGroupThisWeek } from '../../engine/schedule/intraWeekVolume.js';
import { getWeekStartIso, primaryEmphasizedGroup } from '../../engine/schedule/scheduleAdapter.js';
import { isEnabled } from '../../util/featureFlags.js';
import { DB } from '../../db.js';
import { resolvePersonaId } from '../../engine/periodization/volumeLandmarks.js';
import { estimateBF_Deurenberg } from '../../engine/bodyComposition.js';
import { detectSubRecoveryDrift } from '../../engine/dp/subRecoveryDrift.js';
import { classifyPerformanceDip } from '../../engine/dp/dipClassifier.js';
import { computeACWR } from '../../engine/muscleRecovery.js';
import { calculateFatigueScore } from '../../engine/fatigue.js';
import { energyVolumeFactor } from '../../engine/dp/ceiling.js';
import { resolveEnergyMagnitude } from './engineWrappers.nutrition';
import { DP } from '../../engine/dp.js';
import {
  getCurrentWeightKg,
  readUserMaintenanceTDEE,
  readUserWeightKg,
  computeProteinTargetG,
} from './userTdee';
import { toEngineSession } from './scheduleAdapterAggregate.session';
import type { EngineSession } from './scheduleAdapterAggregate.session';
import {
  deriveInjurySignal,
  INJURY_LOOKBACK_DAYS,
  PAIN_CDL_KEY,
} from './scheduleAdapterAggregate.injury';
import type { PainCdlEntryRead } from './scheduleAdapterAggregate.injury';

// ── Builder-layer signal completion (energyDirection / weekIdx / bf / phase) ──
// Every helper below is PURE. They feed the SINGLE buildUserStateForPipeline
// overlay so the live engines that read recentSessions[*] / user / meta stop
// running on defaults. All degrade safe-absent (engines Number.isFinite /
// typeof-guard every field) → conservative baseline when a source is missing.

// energyEmoji (persisted traffic-light) → deload ENERGY_DIRECTION vocabulary
// (deload/constants.js: {UP,DOWN,NONE}). green->UP, yellow->NONE, red->DOWN.
// ONE persisted source (energyEmoji on the summary), the deload word derived at
// the boundary — NOT a third persisted copy.
const EMOJI_TO_DIRECTION: Readonly<Record<string, string>> = {
  green: 'UP',
  yellow: 'NONE',
  red: 'DOWN',
};

/**
 * Audit HIGH — readiness score cu tinta nutritionala REALA per-user (mentenanta
 * + proteine g/kg × greutate), NU flat 2000/180. Acelasi calcul ca
 * engineWrappers.getUserReadinessScore, inlinat aici ca sa NU cream un import
 * circular (engineWrappers importa deja din acest modul). Threadeaza targets in
 * engine; cold-start fara onboarding → null → engine cade pe flat.
 */
export function readinessScoreForUser(): number | null {
  const targetKcal = readUserMaintenanceTDEE();
  const targetProt = computeProteinTargetG(readUserWeightKg());
  return getComputedReadinessScore(targetKcal, targetProt);
}

/**
 * Audit MED — emoji-ul de energie de AZI (din EnergyCheck) → traffic-light
 * pentru engine-ul Energy Adjustment (resolveEmojiState citeste meta.energyEmoji
 * 'green'|'yellow'|'red'). EnergyCheck persista readiness 1-5 (saveReadiness);
 * il mapam pe banda traffic-light (mirror EnergyCheck intensity + EMOJI_TO_DIRECTION):
 *   5 (excelent) / 4 (bine) → green (UP)
 *   3 (normal)             → yellow (NONE)
 *   2 (slabit) / 1 (obosit) → red (DOWN)
 * Fara energy-check azi → undefined (engine ramane inert pe sesiunea curenta,
 * NU fabricam un semnal). Reads readiness store → I/O boundary.
 */
function readTodayEnergyEmoji(): string | undefined {
  const r = getTodayReadiness();
  if (r == null || !Number.isFinite(r)) return undefined;
  if (r >= 4) return 'green';
  if (r === 3) return 'yellow';
  if (r >= 1) return 'red';
  return undefined;
}

// 4-week mesocycle cycle length (mesocycle.isMariusDualSignalGreen requires
// weeks 1,2,3,4 present). Matches generator weekIdx = (i % 4) + 1.
const MESOCYCLE_WEEKS = 4;

/**
 * Earliest session timestamp = training start anchor. undefined when no
 * sessions yet (a brand-new user has no training history). Pure.
 */
function trainingStartTs(
  sessions: ReadonlyArray<LastSessionSummary>,
): number | undefined {
  let earliest = Infinity;
  for (const s of sessions) {
    const ts = Number(s?.ts);
    if (Number.isFinite(ts) && ts < earliest) earliest = ts;
  }
  return Number.isFinite(earliest) ? earliest : undefined;
}

/**
 * Derive a session's mesocycle weekIdx (1-4) from its age relative to the
 * training start, modulo the 4-week cycle. No stateful counter — survives gaps
 * honestly (a break advances the modulo, matching real mesocycle drift).
 * undefined when the start anchor is unknown (single/no-timeline). Pure.
 */
function deriveWeekIdx(
  sessionTs: number,
  startTs: number | undefined,
  now: number,
): number | undefined {
  if (!Number.isFinite(sessionTs) || startTs === undefined) return undefined;
  const ts = Math.min(sessionTs, now);
  const weeksSinceStart = Math.floor((ts - startTs) / (7 * MS_PER_DAY));
  if (!Number.isFinite(weeksSinceStart) || weeksSinceStart < 0) return undefined;
  return (weeksSinceStart % MESOCYCLE_WEEKS) + 1;
}

/**
 * Estimate body-fat as a FRACTION (0.0-1.0) from BMI/age/sex via Deurenberg
 * 1991: BF% = 1.20·BMI + 0.23·age − 10.8·sex − 5.4 (sex: male=1, female=0).
 * The percent is divided by 100 → FRACTION, because the engine thresholds are
 * fractional (bfPctHighMale 0.25); a raw percent would false-positive every
 * user (CRITICAL trap). Clamp [0.03, 0.60]. undefined when any input missing →
 * engine sees absent → no false BF-high risk (computeRiskScore guards
 * Number.isFinite(bf) && bf > 0). Population estimate, fitness-not-medicine —
 * NOT a body-composition measurement. Pure.
 *
 * @param input weight (kg), height (cm), age (years), sex ('m'|'f')
 */
export function estimateBfFraction(input: {
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  sex?: string | null;
}): number | undefined {
  // Canonical Deurenberg math lives in engine/bodyComposition (PERCENT 2-60).
  // Single source of truth — here we divide to a FRACTION at the engine
  // boundary (engine thresholds are fractional; raw percent false-positives
  // every user, CRITICAL trap) + apply the engine clamp [0.03, 0.60].
  const bfPercent = estimateBF_Deurenberg({
    weightKg: Number(input.weight),
    heightCm: Number(input.height),
    ageYears: Number(input.age),
    ...(typeof input.sex === 'string' ? { sex: input.sex } : {}),
  });
  if (bfPercent == null) return undefined;
  const fraction = bfPercent / 100; // percent → FRACTION (engine thresholds are fractional)
  return Math.min(0.6, Math.max(0.03, fraction));
}

/**
 * Profile tier from onboarding experience (specialization Gate 2 reads T1+).
 * incepator->T0 (calibration-window noise), intermediar->T1, avansat->T2. null
 * when experience missing → engine resolveTier returns null → conservative
 * baseline (specialization stays gated). Pure.
 */
/**
 * Distinct EN exercise names the user has logged with a weight (the PR-anchor
 * set for WP-4 selection). Reads the same `logs` channel DP.getLogs consumes.
 * Pure-ish (reads persisted DB only). Returns [] when nothing logged.
 */
function distinctLoggedExerciseNames(): string[] {
  const logs =
    (DB.get('logs') as Array<{ ex?: string; w?: number }> | null) ?? [];
  const names = new Set<string>();
  for (const l of logs) {
    if (l && typeof l.ex === 'string' && l.ex && l.w) names.add(l.ex);
  }
  return [...names];
}

/** A persisted set row from the `logs` channel (EN engineName key). */
type LogRow = { ex?: string; w?: number; reps?: number | string; ts?: number; session?: number };

// How many most-recent distinct sessions feed the Specialization recent window
// (consensus B2 last-12-sessions, weaknessConsumer.js:144-164).
const SPECIALIZATION_RECENT_SESSIONS = 12;

/**
 * Specialization weakness-detector inputs (specialization/index.js:200-201).
 * Reads the SAME persisted `logs` channel distinctLoggedExerciseNames + DP
 * consume — native `{ex (EN), w, reps, ts, session}` shape (workoutStore.logic.ts:
 * 124-137). Passed THROUGH UNCHANGED: the detector wants exactly `{ex,w,reps}`
 * keyed on the EN name, so NO remap / NO EN-RO translation.
 *   - lifetime = full logs.
 *   - recent = rows whose `session` ∈ the 12 most-recent distinct session anchors
 *     (consensus requires recent ∧ lifetime to converge on the same top-1 weak
 *     group or Specialization defers — both windows MUST be fed).
 * Pure (reads persisted DB only). Empty → {lifetime:[], recent:[]} → engine stays
 * at its conservative no-target baseline (NU a fabricated signal).
 */
function loggedSetsForWeakness(): { lifetime: LogRow[]; recent: LogRow[] } {
  const lifetime = (DB.get('logs') as LogRow[] | null) ?? [];
  if (lifetime.length === 0) return { lifetime: [], recent: [] };
  const distinctSessions = [
    ...new Set(
      lifetime
        .map((l) => l?.session)
        .filter((s): s is number => typeof s === 'number' && Number.isFinite(s)),
    ),
  ].sort((a, b) => b - a);
  const recentWindow = new Set(distinctSessions.slice(0, SPECIALIZATION_RECENT_SESSIONS));
  const recent =
    recentWindow.size === 0
      ? []
      : lifetime.filter((l) => typeof l?.session === 'number' && recentWindow.has(l.session));
  return { lifetime, recent };
}

function tierForExperience(experience: unknown): 'T0' | 'T1' | 'T2' | null {
  switch (experience) {
    case 'incepator':
      return 'T0';
    case 'intermediar':
      return 'T1';
    case 'avansat':
      return 'T2';
    default:
      return null;
  }
}

/**
 * Onboarding goal → nutrition phase (BULK/CUT/MAINTAIN), consistent with
 * goalAdaptation basePhaseForGoal/basePhaseForTemplate semantics. Specialization
 * Gate 3 activates on BULK/RECOMP; push-back/RECOMP detection read it. RECOMP is
 * a runtime sub-phase (detected from bf/trainingWeeks downstream), not a base
 * onboarding goal → the builder emits BULK/CUT/MAINTAIN only. null/auto ->
 * undefined (let the engine auto-detect; meta.goalPhase absent = conservative).
 * Pure.
 *
 * Deliberately a SEPARATE map from periodization resolveGoalId →
 * goalAdaptation basePhaseForGoal: those key on the canonical EN goal-id vocab
 * (hipertrofie/recompozitie/sanatate) and never return undefined, whereas this
 * boundary maps the RO onboarding Goal vocab (masa/mentenanta/auto — absent
 * upstream) and MUST emit undefined for 'auto'/null so the engine auto-detects.
 * Routing through the canonical chain would mis-default masa/mentenanta/slabire.
 */
function goalPhaseForGoal(goal: unknown): 'BULK' | 'CUT' | 'MAINTAIN' | undefined {
  switch (goal) {
    case 'forta':
    case 'masa':
      return 'BULK';
    case 'slabire':
      return 'CUT';
    case 'mentenanta':
      // §obiectiv-drop-longevitate 2026-05-28 — 'longevitate' dropped (semantic
      // dup of mentenanta); legacy persisted users migrated via onboardingStore.
      return 'MAINTAIN';
    default:
      return undefined; // 'auto' / null → engine auto-detect
  }
}

// ── F6a — composite deload-trigger telemetry assembly (the PARTIAL seam) ──────
// The deload engine reads its REACTIVE-AA trigger candidates off `meta` (deload/
// index.js:268-272: aaMarkerDirectActive + the energy-down feed). The builder
// previously assembled ONLY recentSessionsForEnergy (the energy candidate); the
// drift/composite candidate + the life-dip suppression were the PARTIAL boundary
// (registry §F6a §7). This assembles them — INERT unless a flag that reads it is
// ON, so with both flags OFF every field below is undefined → the trigger
// hierarchy is byte-identical to today.
//
//   #26 dp_subrecovery_drift_v1 → meta.aaMarkerDirectActive (early under-recovery
//        pre-empts a deload via the AA-trigger slot the engine already reads).
//   #32 dp_dip_classifier_v1    → meta.suppressReactiveDeload (a LIFE_DIP cause
//        suppresses the reactive deload — lifestyle patch, not training fatigue).
//
// PURE on its inputs (a read of the durable `logs` + the existing detectors); no
// DB writes. Returns only the keys whose owning flag is ON.
function buildDeloadTriggerTelemetry(
  logs: ReadonlyArray<{ ex?: string; w?: number; reps?: number | string; rpe?: number; ts?: number }>,
  now: number,
): { aaMarkerDirectActive?: boolean; suppressReactiveDeload?: boolean } {
  const driftOn = isEnabled('dp_subrecovery_drift_v1');
  const dipOn = isEnabled('dp_dip_classifier_v1');
  if (!driftOn && !dipOn) return {}; // both OFF → no telemetry → byte-identical.

  // Group the flat log into per-exercise newest-first slices (DP.getLogs order)
  // for the detectors. Keyed on the EN canonical engineName (the `ex` field).
  const byEx: Record<string, Array<{ ex: string; w?: number; reps?: number | string; rpe?: number; ts?: number }>> = {};
  for (const l of Array.isArray(logs) ? logs : []) {
    if (!l || typeof l.ex !== 'string' || !l.ex) continue;
    (byEx[l.ex] ??= []).push({ ex: l.ex, w: l.w, reps: l.reps, rpe: l.rpe, ts: l.ts });
  }
  for (const ex of Object.keys(byEx)) {
    (byEx[ex] ?? []).sort((a, b) => Number(b.ts ?? 0) - Number(a.ts ?? 0));
  }

  // e1RM fn only when dp_e1rm_v1 is ON (the drift detector degrades to rating-
  // drift-only otherwise — same graceful-degrade the module documents).
  const e1rmFn = isEnabled('dp_e1rm_v1')
    ? (w: number, reps: number | string, rpe?: number, ex?: string): number | null =>
        (DP as unknown as { e1RMForSet: (w: number, reps: number | string, rpe?: number, ex?: string) => number | null })
          .e1RMForSet(w, reps, rpe, ex)
    : null;

  const drift = (driftOn || dipOn)
    ? detectSubRecoveryDrift(byEx, now, e1rmFn as Parameters<typeof detectSubRecoveryDrift>[2])
    : { systemic: false };

  const out: { aaMarkerDirectActive?: boolean; suppressReactiveDeload?: boolean } = {};

  // #32 first — classify the dip CAUSE; LIFE_DIP suppresses the reactive deload.
  // The classifier consumes already-computed signals (gap via _returnDeload across
  // the user's logged exercises, ACWR, the #26 drift, fatigue.js sleep/notes). The
  // ACWR-HIGH-forces-FATIGUE guard inside it means a truly fatigued user is never
  // suppressed. Degrades safe (acwr null → not LIFE_DIP) → today's behavior.
  if (dipOn) {
    // Any qualifying training GAP across the user's logged exercises → DETRAINING
    // branch (the existing ramp owns it; the classifier only labels it).
    let returnDeload: { multiplier: number } | null = null;
    for (const ex of Object.keys(byEx)) {
      const rd = DP._returnDeload(ex, now) as { multiplier: number } | null;
      if (rd != null) { returnDeload = rd; break; }
    }
    const acwr = computeACWR(logs, now);
    const fatigue = calculateFatigueScore() as { recommend?: string; sleepBad?: number };
    const dip = classifyPerformanceDip({
      returnDeload,
      acwr,
      drift: { systemic: !!drift.systemic },
      fatigue,
      lifestyle: { closedDaysRecent: 0, kcalShortfall: false },
    });
    if (dip.suppressDeload) out.suppressReactiveDeload = true;
  }

  // #26 — a systemic drift pattern feeds the AA-trigger candidate so an EARLY,
  // mild deload can PRE-EMPT a crater. If #32 suppressed (LIFE_DIP), the engine
  // zeroes the AA candidates anyway — but the classifier guarantees LIFE_DIP only
  // fires when drift is NOT systemic, so the two never contradict here.
  if (driftOn && drift.systemic) out.aaMarkerDirectActive = true;

  return out;
}

/**
 * Build the userState aggregate consumed by getDailyWorkout pipeline.
 * Primary-source slice fields verified (anti-recurrence D027 §5):
 *   - user: useOnboardingStore.data Big 6 + height (age/sex/goal/frequency/
 *     experience/weight/height), plus bfPct (Deurenberg estimate, FRACTION) +
 *     trainingWeeks (from the session timeline). Both estimated at the builder —
 *     NO new onboarding question (honors D078 minimal onboarding); both degrade
 *     safe-absent (Number.isFinite guarded downstream).
 *   - recentSessions: useWorkoutStore.sessionsHistory (newest-first), each mapped
 *     through the PURE toEngineSession then a SINGLE builder-layer overlay that
 *     stamps injury / energyDirection / weekIdx (the signal fields engines read
 *     off recentSessions[*] that toEngineSession cannot honestly derive alone).
 *   - meta: painButtonActive/painAffectedGroups (injury gate) + persona/goalPhase
 *     (specialization Gate 1/3). profileTier (Gate 2) is a top-level field.
 *
 * Every overlay/estimate is sourced from already-persisted data → ZERO migration
 * (derived fields materialize on the next pipeline run). NU fabricate fields care
 * nu există în stores (slip cause D027 §5): absent source → field omitted →
 * engine conservative baseline.
 */
export function buildUserStateForPipeline(): {
  user: Record<string, unknown>;
  recentSessions: ReadonlyArray<unknown>;
  aerobicSessions: ReadonlyArray<unknown>;
  weights: Record<string, unknown>;
  prNames: string[];
  profileTier: string | null;
  flags: Record<string, unknown>;
  meta: Record<string, unknown>;
  weekContext: { volumeDone: Record<string, number>; weekStartMs: number };
} {
  const onboardingData = useOnboardingStore.getState().data;
  const sessionsHistory = useWorkoutStore.getState().sessionsHistory ?? [];
  // Aerobic CLASSES (aerobicStore) feed the recovery→plan loop: a hard spin class
  // (legs) eases tomorrow's leg budget. The engine reads each session's `type` +
  // `ts`/`date` (mergeAerobicRecovery) — the persisted shape passes straight
  // through. Empty → engine path byte-identical to resistance-only.
  const aerobicSessions = useAerobicStore.getState().sessions ?? [];
  const now = Date.now();
  // Live injury safety signal from the Pain CDL channel (DB('pain-cdl')) — the
  // honest persisted source PainButton writes. Feeds BOTH pipeline injury gates
  // that were previously inert (meta:{}):
  //   - specialization Gate 4 reads meta.painButtonActive + meta.painAffectedGroups
  //   - goalAdaptation push-back reads recentSessions[*].injury + .daysAgo
  const injury = deriveInjurySignal(DB.get<PainCdlEntryRead[]>(PAIN_CDL_KEY), now);
  // Training start anchor (earliest session ts) — shared by weekIdx + trainingWeeks.
  const startTs = trainingStartTs(sessionsHistory);
  // sessionsHistory appends newest-tail (workoutStore.finishSession); engine
  // recentSessions consumers slice(0, N) expecting newest-first (types.js:17
  // "ordered desc by date" + mesocycle.js:99/triggerHierarchy.js:246 trailing
  // window). Reverse to newest-first, map each through the PURE toEngineSession,
  // then a SINGLE builder-layer overlay stamps the signal fields that have no
  // honest per-summary source (injury / energyDirection / weekIdx). One overlay
  // map — NU stack a second/third .map(). toEngineSession stays injury/energy/
  // weekIdx-free (purity contract test).
  const recentSessions = sessionsHistory
    .slice()
    .reverse()
    .map((s) => toEngineSession(s, now))
    .map((s) => {
      const overlay: Partial<EngineSession> = {};
      // injury:true on sessions inside the lookback window → push-back recent-
      // injury check (reads recentSessions[*].injury, NU meta).
      if (injury.active && s.daysAgo <= INJURY_LOOKBACK_DAYS) overlay.injury = true;
      // energyDirection from the persisted energyEmoji → deload isEnergyDownSustained.
      const direction =
        typeof s.energyEmoji === 'string' ? EMOJI_TO_DIRECTION[s.energyEmoji] : undefined;
      if (direction !== undefined) overlay.energyDirection = direction;
      // weekIdx from the session timeline modulo 4 → mesocycle dual-signal.
      const weekIdx = deriveWeekIdx(Number(s.ts), startTs, now);
      if (weekIdx !== undefined) overlay.weekIdx = weekIdx;
      return Object.keys(overlay).length > 0 ? { ...s, ...overlay } : s;
    });
  // Canonical greutate CURENTA: ultima greutate LOGATA > onboarding (sursa unica,
  // audit CRIT). Feed pipeline-ul (bf%/demografice) cu greutatea reala curenta —
  // era inghetata pe onboarding, deci logarea unei greutati nu misca planul.
  const currentWeightKg = getCurrentWeightKg();
  // Audit MED — emoji-ul de energie de AZI (EnergyCheck) pentru engine Energy
  // Adjustment (meta.energyEmoji). undefined cand fara energy-check azi.
  const todayEnergyEmoji = readTodayEnergyEmoji();
  // bfPct as a FRACTION (Deurenberg) — engine thresholds are fractional; a raw
  // percent would false-positive every user (CRITICAL trap, fact 10).
  const bfPct = estimateBfFraction({
    weight: currentWeightKg,
    height: onboardingData.height,
    age: onboardingData.age,
    sex: onboardingData.sex,
  });
  // trainingWeeks from the first-session date (0 when no sessions — a brand-new
  // user IS a newbie). Feeds templates.isNewbieEffect (<=12 weeks).
  const trainingWeeks =
    startTs === undefined
      ? 0
      : Math.max(0, Math.floor((now - startTs) / (7 * MS_PER_DAY)));
  // Specialization meta wire (was unset → blocked at Gate 1 persona for EVERY
  // real user). persona = canonical age-based resolvePersonaId (reused, NOT
  // reinvented); profileTier from experience (Gate 2 reads T1+); goalPhase from
  // goal (Gate 3 activates BULK/RECOMP). Absent inputs → conservative baseline.
  const persona = resolvePersonaId(
    onboardingData.age !== null ? { age: onboardingData.age } : {},
  );
  // ── F emphasis = specialization-phase (T2+T4+T5, dp_emphasis_specialization_v1)
  // Route a USER-PICKED muscle-group emphasis into the EXISTING specialization
  // engine: the preset's primary emphasized group becomes the engine's user-picked
  // TARGET (meta.userOverrideWeakGroup — override beats the lagging detector, so
  // the pick is DETERMINISTIC with empty logs), the pick auto-accepts the proposal
  // (meta.userProposalAccepted — the pick IS the accept; anti-paternalism cuts the
  // other way for an explicit opt-in) and bypasses the persona/phase gate
  // (meta.userPickedEmphasis — keeps the injury gate + MRV cap), and the pick-time
  // clock (focusPresetPickedAt) → weeks-elapsed drives the 4-week mesocycle
  // auto-return. ALL gated behind the flag → flag-OFF sets NONE of these meta
  // fields, so buildWeaknessSignal resolves no target and the plan composition is
  // byte-identical to today. balanced / no primary group → also inert.
  const emphasisSpecOn = isEnabled('dp_emphasis_specialization_v1');
  const emphasisTargetGroup = emphasisSpecOn
    ? primaryEmphasizedGroup(onboardingData.focusPreset ?? 'balanced')
    : null;
  const emphasisPickedAt =
    typeof onboardingData.focusPresetPickedAt === 'number' &&
    Number.isFinite(onboardingData.focusPresetPickedAt)
      ? onboardingData.focusPresetPickedAt
      : null;
  // Weeks since the emphasis was picked (clock for computeMesocycleProgress, which
  // exits at >= 4). Floors to 0 for a just-picked emphasis. Absent pick-time → 0
  // (fresh — engine treats elapsed 0 as week 1, never exiting yet).
  const emphasisWeeksElapsed =
    emphasisTargetGroup && emphasisPickedAt !== null
      ? Math.max(0, Math.floor((now - emphasisPickedAt) / (7 * MS_PER_DAY)))
      : 0;
  const profileTier = tierForExperience(onboardingData.experience);
  const goalPhase = goalPhaseForGoal(onboardingData.goal);
  // PR-anchor set for WP-4 selection: distinct exercise names the user has
  // actually logged (weighted set). sessionBuilder prefers these over other
  // candidates so existing users keep visible PR continuity. EN canonical names
  // (logs key on the EN name, same as DP.getLogs / cold-start guidelines).
  const prNames = distinctLoggedExerciseNames();
  // F1 T1 — Specialization weakness-detector inputs (lifetimeLogs + recentLogs).
  // Same persisted `logs` channel, native shape, passed through unchanged.
  const { lifetime: lifetimeLogs, recent: recentLogs } = loggedSetsForWeakness();
  // F6a — composite deload-trigger telemetry (the PARTIAL seam). Both flags OFF →
  // {} → meta byte-identical. #26 sets aaMarkerDirectActive (drift pre-empt), #32
  // sets suppressReactiveDeload (LIFE_DIP suppress). Pure read of `logs`.
  const deloadTelemetry = buildDeloadTriggerTelemetry(
    lifetimeLogs as ReadonlyArray<{ ex?: string; w?: number; reps?: number | string; rpe?: number; ts?: number }>,
    now,
  );
  // #76 deloadBias → deload CADENCE (dp_energy_volume_v1). energyVolumeFactor
  // surfaces deloadBias ∈ [0,1] (deeper/sustained deficit → deloads sooner). The
  // volume + RIR halves are wired in compose; the cadence half pulls the CALENDAR
  // deload one week forward in periodization (index.js DELOAD_BIAS_PULL_FORWARD).
  // Flag OFF → energyMagnitude null → deloadBias 0 → omitted → periodization sees
  // no field → byte-identical cadence. Resolved here (the SAME magnitude compose
  // resolves) so the engine's meta carries it BEFORE periodization runs.
  const energyDeloadBias = isEnabled('dp_energy_volume_v1')
    ? (() => {
        const mag = resolveEnergyMagnitude();
        return mag ? energyVolumeFactor(mag).deloadBias : 0;
      })()
    : 0;
  // Intra-week deficit recovery (D-intra-week 2026-06-04) — DONE working-set volume
  // per Big-11 EN group for the CURRENT microcycle, computed React-side from the
  // RAW sessionsHistory (each LastSessionSummary carries per-exercise `sets`). The
  // engine-mapped recentSessions above may NOT retain per-exercise sets, so the
  // measurement MUST happen here from the raw store. weekStart = the user's
  // training-microcycle anchor (getWeekStartIso(now), Monday-anchored, NOT a
  // corporate calendar week) → ms. doneVolumeByGroupThisWeek counts only sessions
  // in [weekStartMs, now]. Threaded into getDailyWorkout via userState.weekContext,
  // where it is prorated + capped into TODAY's budget (recovery still overrides).
  // Cold start (no sessions this week) → volumeDone {} → makeup no-op downstream.
  const weekStartMs = new Date(getWeekStartIso(new Date(now))).getTime();
  const weekContext = {
    volumeDone: doneVolumeByGroupThisWeek(sessionsHistory, weekStartMs, now) as Record<
      string,
      number
    >,
    weekStartMs,
  };
  return {
    user: {
      age: onboardingData.age,
      sex: onboardingData.sex,
      goal: onboardingData.goal,
      frequency: onboardingData.frequency,
      // Focus selector (D-focus 2026-06-02) — the user's optional LOOK preset.
      // scheduleAdapter shapes volume + split around it; 'balanced' (default) →
      // ZERO change. Threaded like frequency (a setup-once onboarding param).
      focusPreset: onboardingData.focusPreset ?? 'balanced',
      experience: onboardingData.experience,
      // Canonical greutate curenta (ultima logata > onboarding) — audit CRIT.
      weight: currentWeightKg,
      height: onboardingData.height,
      // #81 explicit movement REFUSAL list (e.g. ['squat','deadlift']) → hard pool
      // exclusion in getDailyWorkout. Pass-through of the persisted onboarding field.
      // INPUT-CAPTURE BOUNDARY: the UI to set this is a follow-up; absent → omitted
      // → no exclusion (byte-identical). exactOptionalPropertyTypes: spread conditional.
      ...(Array.isArray(onboardingData.refusedPatterns) && onboardingData.refusedPatterns.length > 0
        ? { refusedPatterns: onboardingData.refusedPatterns }
        : {}),
      // #82 explicit AVAILABLE equipment profile (coarse types, e.g.
      // ['dumbbell','bodyweight'] for a home DB+bench+pull-up setup) → filters the
      // pool to only what the user has. Pass-through of the persisted onboarding field.
      // INPUT-CAPTURE BOUNDARY: the UI to set a home/DB-only profile is a follow-up;
      // absent → omitted → the missing-picker path (byte-identical).
      ...(Array.isArray(onboardingData.equipmentProfile) && onboardingData.equipmentProfile.length > 0
        ? { equipmentProfile: onboardingData.equipmentProfile }
        : {}),
      // Degrade safe-absent: only set when the estimate/timeline is real.
      ...(bfPct !== undefined ? { bfPct } : {}),
      trainingWeeks,
    },
    recentSessions,
    // Aerobic CLASSES → recovery→plan loop (eases fresh groups, never deepens).
    aerobicSessions,
    weights: {},
    // WP-4 PR-anchor set (sessionBuilder prefers logged names).
    prNames,
    // Gate 2 tier (specialization resolveTier reads top-level profileTier).
    profileTier,
    flags: {},
    meta: {
      // painButtonActive + painAffectedGroups = specialization injury gate input
      // (activationGating Gate 4) — PRESERVED from the injury wire.
      painButtonActive: injury.active,
      painAffectedGroups: injury.affectedGroups,
      // persona (Gate 1) + goalPhase (Gate 3). Omit goalPhase when undefined
      // (goal 'auto'/null) → engine auto-detect, NU a fabricated phase.
      persona,
      ...(goalPhase !== undefined ? { goalPhase } : {}),
      // Fix #3 — macrocycle anchor (periodization/index.js:85 reads
      // meta.weeksElapsed). Was NEVER set → NaN → hasMacrocycleAnchor=false →
      // every user frozen at macrocycle week 0 forever (block 1 / meso 1 / LOAD).
      // weeksElapsed === trainingWeeks (weeks since the first logged session) —
      // SAME continuous count, single source (NU a second derivation that could
      // drift). Floors to the macrocycle block/mesocycle/phase via
      // computeMacrocycleBlock; advances volume scaling M1→M2→M3 + phase as the
      // user accumulates weeks. 0 for a brand-new user = correct (week 0, LOAD).
      weeksElapsed: trainingWeeks,
      // Fix #6 — reactive deload AA trigger (energy-down sustained). The deload
      // engine reads meta.recentSessionsForEnergy (deload/index.js:218) and
      // isEnergyDownSustained checks the 3 most recent for energyDirection==DOWN
      // (triggerHierarchy.js:244). The builder ALREADY stamps energyDirection on
      // recentSessions[*] (from persisted energyEmoji), but the deload engine
      // reads meta.recentSessionsForEnergy, NOT recentSessions[*] — the
      // field-name mismatch the audit flagged (§2). Pointing the meta field at
      // the same already-stamped array closes it: 3 consecutive red sessions →
      // REACTIVE_AA deload → intensity_modifier → intensityMod 'minus' downstream.
      // NU a new signal — the SAME energyDirection data, surfaced where deload
      // reads it. The composite trigger (performanceDropPct/restTimeMultiplier/
      // rirMismatch) needs CDL telemetry not assembled here — DEFERRED (see report).
      recentSessionsForEnergy: recentSessions,
      // F6a composite deload-trigger telemetry — #26 aaMarkerDirectActive (drift
      // pre-empt) + #32 suppressReactiveDeload (LIFE_DIP suppress). Conditional
      // spread: both flags OFF → {} → these keys are absent → the deload trigger
      // hierarchy reads undefined → byte-identical to today.
      ...deloadTelemetry,
      // #76 deloadBias → periodization deload CADENCE. Only set when a real
      // (deficit) bias exists — 0 omitted so periodization reads undefined →
      // byte-identical when the flag is OFF or there's no deficit.
      ...(energyDeloadBias > 0 ? { deloadBias: energyDeloadBias } : {}),
      // Audit MED — emoji-ul de energie de AZI (EnergyCheck) → engine Energy
      // Adjustment (resolveEmojiState citeste meta.energyEmoji). Era nesetat →
      // engine inert pe sesiunea curenta (green→UP / yellow→NONE / red→DOWN nu
      // contribuiau). Omit cand fara energy-check azi (engine ramane inert onest,
      // NU fabricam semnal). exactOptionalPropertyTypes: spread conditional.
      ...(todayEnergyEmoji !== undefined ? { energyEmoji: todayEnergyEmoji } : {}),
      // F1 T2+T3 — top-level meta.energyDirection (UP/NONE/DOWN), derived from
      // TODAY's energyEmoji via the SAME EMOJI_TO_DIRECTION map the per-session
      // stamping uses (NU a second persisted copy). ONE field, FOUR readers:
      // Deload Hook D3 consumeEnergyReadiness (deload/index.js:237), Tempo
      // (tempo/index.js:172,212), Specialization light-coupling
      // (specialization/index.js:233), Warmup (warmup/index.js:196). Deload AA
      // already fired via the recentSessionsForEnergy fallback (:246); this
      // closes the null D3 readiness signal. Omit when no energy-check today
      // (or unmapped emoji) → engines stay at TODAY's conservative baseline,
      // NU a fabricated NONE.
      ...(todayEnergyEmoji !== undefined &&
      EMOJI_TO_DIRECTION[todayEnergyEmoji] !== undefined
        ? { energyDirection: EMOJI_TO_DIRECTION[todayEnergyEmoji] }
        : {}),
      // F1 T1 — Specialization weakness-detector inputs (specialization/index.js:
      // 200-201 buildWeaknessSignal). lifetimeLogs = full `logs`; recentLogs =
      // the last-12-distinct-sessions subset (consensus B2 — recent ∧ lifetime
      // must converge on the same top-1 weak group or Specialization defers, so
      // BOTH windows are fed). Once non-null, target_muscle_group folds into the
      // de-duped weakGroups Set at getDailyWorkout.js:284-287 (a SECOND weakness
      // source alongside getLaggingMuscles; the Set + MRV-capped
      // applyWeaknessAmplification absorb the overlap — see report). Omit when no
      // logs → engine keeps its conservative no-target baseline (NU fabricated).
      ...(lifetimeLogs.length ? { lifetimeLogs, recentLogs } : {}),
      // F emphasis = specialization-phase (T2+T4+T5) — only when the flag is on
      // AND the user picked a non-balanced emphasis with a primary group. These
      // four fields turn the user's LOOK pick into the spec engine's active
      // user-picked block: target (override beats detector), auto-accept (pick =
      // accept), gate bypass (explicit opt-in; injury gate + MRV cap KEPT), and
      // the 4-week meso clock. Conditional spread → flag-OFF / balanced emits NONE
      // → meta byte-identical to today → buildWeaknessSignal resolves no target.
      ...(emphasisTargetGroup
        ? {
            userOverrideWeakGroup: emphasisTargetGroup,
            userProposalAccepted: true,
            userPickedEmphasis: true,
            specializationWeeksElapsed: emphasisWeeksElapsed,
          }
        : {}),
    },
    // Intra-week deficit recovery — DONE volume + microcycle anchor for the engine
    // proration/spread (getDailyWorkout reads userState.weekContext). Computed from
    // RAW sessionsHistory (per-exercise sets); cold start → empty volumeDone.
    weekContext,
  };
}
