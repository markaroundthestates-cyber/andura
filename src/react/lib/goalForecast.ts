// ══ GOAL FORECAST — date-anchored weight ETA + strength trajectory ════════════
//
// Two HONEST, hedged forward forecasts surfaced next to the nutrition projection
// (ProjectionStrip). Read-only — never alters kcal targets / safety floors.
//
//   1. Weight ETA — "at this pace: {goal}kg by ~{date}". Reuses the SAME live
//      trend the ProjectionStrip already computes (intake − TDEE balance → a real
//      kg/day rate, KCAL_PER_KG). From current weight + goal weight + that rate we
//      compute the DATE the goal weight is reached at the current pace. Honest:
//      when the trend is flat OR moving the WRONG way (away from the goal), we say
//      so plainly ("not on track at the current pace") instead of a fake date.
//
//   2. Strength trajectory — "Bench ~{kg} in ~{weeks}". From the user's per-lift
//      logged history (estimated 1RM per session, Epley), fit a conservative
//      linear-ish recent slope and extrapolate a near-term 1RM. Gated on ENOUGH
//      history (>=3 sessions spanning real time) — never a forecast on 1-2 points.
//      Flat/declining slope → no forecast for that lift (we don't promise gains).
//
// Pure-function discipline: ZERO Date.now / Math.random / store reads in the math.
// `now` + the data are injected at the I/O boundary (readGoalForecast). Determinism
// is a hard invariant (same inputs → same output).

import { KCAL_PER_KG } from './nutritionProjection';

// ── Weight ETA ────────────────────────────────────────────────────────────────

// Below this absolute daily energy balance (kcal/day) the trend is "flat" — the
// same maintenance guard the ProjectionStrip uses, so the two never disagree on
// whether the user is moving. Re-stated here (single, documented constant) to keep
// this module self-contained for the ETA math.
export const FLAT_BALANCE_KCAL = 75;

// The user is "already there" within this band (kg) — no ETA, they reached it.
export const GOAL_REACHED_BAND_KG = 0.5;

// Cap the ETA horizon (days). A microscopic-but-nonzero rate toward a far goal
// could compute a date decades out — meaningless to surface. Beyond this we say
// "not on track at the current pace" (the pace is technically correct-direction
// but so slow it is not a credible ETA). ~2 years.
export const MAX_ETA_DAYS = 730;

export type WeightEtaResult =
  | {
      kind: 'eta';
      /** Projected timestamp (ms) the goal weight is reached at the current pace. */
      etaMs: number;
      /** Days from `now` to the ETA (>=1). */
      days: number;
      /** Goal weight echoed for the copy (kg). */
      goalKg: number;
      direction: 'loss' | 'gain';
    }
  // Flat trend, wrong-direction trend, or a credible-but-too-slow pace → honest.
  | { kind: 'off-track' }
  // Already at the goal (within the band).
  | { kind: 'reached' };

export interface WeightEtaInput {
  /** Current weight (kg). */
  currentWeightKg: number | null;
  /** Goal/target weight (kg). */
  goalWeightKg: number | null;
  /** Average recent daily intake (kcal/day) — same window the ProjectionStrip uses. */
  avgIntakeKcal: number | null;
  /** Estimated TDEE expenditure (kcal/day) — BN posterior.mu. */
  tdeeEstimateKcal: number | null;
  /** Reference clock (ms) — injected for determinism. */
  nowMs: number;
}

/**
 * Date-anchored weight ETA from the live trend. Returns null when we cannot form
 * an honest projection (missing weight / goal / intake / TDEE). Otherwise an
 * 'eta' (correct-direction, credible pace), 'off-track' (flat / wrong-direction /
 * too-slow), or 'reached' (already within the goal band). Pure.
 */
export function projectWeightEta(input: WeightEtaInput): WeightEtaResult | null {
  const { currentWeightKg, goalWeightKg, avgIntakeKcal, tdeeEstimateKcal, nowMs } = input;

  if (currentWeightKg == null || !Number.isFinite(currentWeightKg) || currentWeightKg <= 0) return null;
  if (goalWeightKg == null || !Number.isFinite(goalWeightKg) || goalWeightKg <= 0) return null;
  if (avgIntakeKcal == null || !Number.isFinite(avgIntakeKcal)) return null;
  if (tdeeEstimateKcal == null || !Number.isFinite(tdeeEstimateKcal)) return null;
  if (!Number.isFinite(nowMs)) return null;

  const deltaToGoal = goalWeightKg - currentWeightKg; // <0 need to lose, >0 need to gain
  if (Math.abs(deltaToGoal) < GOAL_REACHED_BAND_KG) return { kind: 'reached' };

  const balanceKcal = avgIntakeKcal - tdeeEstimateKcal; // <0 losing, >0 gaining
  // Flat trend → no credible date (honest).
  if (Math.abs(balanceKcal) < FLAT_BALANCE_KCAL) return { kind: 'off-track' };

  const kgPerDay = balanceKcal / KCAL_PER_KG; // signed: <0 losing, >0 gaining
  // Wrong direction — the current pace moves AWAY from the goal → honest.
  if (Math.sign(kgPerDay) !== Math.sign(deltaToGoal)) return { kind: 'off-track' };

  const days = Math.ceil(Math.abs(deltaToGoal) / Math.abs(kgPerDay));
  if (!Number.isFinite(days) || days < 1) return { kind: 'off-track' };
  // Credible but absurdly slow pace → not a real ETA.
  if (days > MAX_ETA_DAYS) return { kind: 'off-track' };

  return {
    kind: 'eta',
    etaMs: nowMs + days * 24 * 60 * 60 * 1000,
    days,
    goalKg: round1(goalWeightKg),
    direction: deltaToGoal < 0 ? 'loss' : 'gain',
  };
}

// ── Strength trajectory ─────────────────────────────────────────────────────

// Minimum distinct logged sessions for a lift before we will project it. Fewer →
// no forecast (no fabrication on 1-2 data points). 3 = a slope you can trust a bit.
export const STRENGTH_MIN_SESSIONS = 3;

// How far ahead we project the strength trend (weeks). Near-term + conservative.
export const STRENGTH_FORECAST_WEEKS = 4;

// Hard cap on projected gain as a fraction of the current best 1RM over the
// horizon — conservative anti-overpromise (a 4-week linear extrapolation of a hot
// streak must not promise +30%). 8% over 4 weeks is already an optimistic ceiling.
export const STRENGTH_MAX_GAIN_FRACTION = 0.08;

/** One logged working set for a lift: estimated 1RM at a point in time. */
export interface LiftSamplePoint {
  /** Timestamp (ms) of the set. */
  ts: number;
  /** Estimated 1RM (kg) at that set (caller computes via Epley). */
  oneRm: number;
}

export interface LiftHistory {
  /** Display name of the lift (e.g. "Bench Press"). */
  name: string;
  /** Samples (any order) — at least STRENGTH_MIN_SESSIONS distinct sessions to project. */
  samples: ReadonlyArray<LiftSamplePoint>;
}

export interface StrengthForecast {
  name: string;
  /** Current best estimated 1RM (kg, 1 decimal) from recent history. */
  currentOneRm: number;
  /** Projected 1RM (kg, 1 decimal) in STRENGTH_FORECAST_WEEKS at the recent slope. */
  projectedOneRm: number;
  /** Horizon echoed for the copy (weeks). */
  weeks: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/**
 * Conservative near-term 1RM forecast for ONE lift from its logged history. Fits a
 * simple least-squares slope (kg/day) over the samples and extrapolates
 * STRENGTH_FORECAST_WEEKS ahead, capped at STRENGTH_MAX_GAIN_FRACTION of the
 * current best. Returns null when:
 *   - fewer than STRENGTH_MIN_SESSIONS distinct sessions (no fabrication),
 *   - all samples on a single day (no real time span → no slope),
 *   - the slope is flat or DECLINING (we don't promise gains that aren't there).
 * Pure.
 */
export function projectLiftStrength(history: LiftHistory): StrengthForecast | null {
  const pts = [...history.samples]
    .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.oneRm) && p.oneRm > 0)
    .sort((a, b) => a.ts - b.ts);

  // Distinct sessions = distinct local-ish day buckets (one session per day). Use
  // the raw ts day index so two sets on the same day count as one session.
  const distinctDays = new Set(pts.map((p) => Math.floor(p.ts / DAY_MS)));
  if (distinctDays.size < STRENGTH_MIN_SESSIONS) return null;

  const firstTs = pts[0]!.ts;
  const lastTs = pts[pts.length - 1]!.ts;
  if (lastTs <= firstTs) return null; // all on one instant → no span

  // Least-squares slope (kg per day) of oneRm vs days-since-first.
  const xs = pts.map((p) => (p.ts - firstTs) / DAY_MS);
  const ys = pts.map((p) => p.oneRm);
  const n = pts.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - meanX;
    num += dx * (ys[i]! - meanY);
    den += dx * dx;
  }
  if (den <= 0) return null;
  const slopePerDay = num / den;
  // Flat or declining → no forecast (honest — don't promise gains).
  if (!Number.isFinite(slopePerDay) || slopePerDay <= 0) return null;

  // Current best = the max recent estimated 1RM (the strongest the user has shown).
  const currentOneRm = Math.max(...ys);
  const horizonDays = (STRENGTH_FORECAST_WEEKS * WEEK_MS) / DAY_MS;
  const rawGain = slopePerDay * horizonDays;
  // Conservative cap on the projected gain.
  const maxGain = currentOneRm * STRENGTH_MAX_GAIN_FRACTION;
  const gain = Math.min(rawGain, maxGain);
  const projectedOneRm = currentOneRm + gain;

  return {
    name: history.name,
    currentOneRm: round1(currentOneRm),
    projectedOneRm: round1(projectedOneRm),
    weeks: STRENGTH_FORECAST_WEEKS,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ── I/O boundary (impure plumbing) ──────────────────────────────────────────

import { useNutritionStore } from '../stores/nutritionStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { readBayesianNutritionContext } from './nutritionObservations';
import { readTdeeEstimateKcal } from './engineWrappers';
import { getCurrentWeightKg } from './userTdee';
import { avgRecentLoggedIntake } from './nutritionProjection';

/** Epley 1RM estimate (kg) — same formula engineWrappers uses for PR deltas. */
function epleyOneRm(kg: number, reps: number): number {
  if (kg <= 0 || reps <= 0) return 0;
  return kg * (1 + reps / 30);
}

// How many distinct lifts (by recent volume of history) we surface a forecast for.
const MAX_STRENGTH_FORECASTS = 3;
// Recency window for strength history (days) — reflect the CURRENT trajectory, not
// ancient PRs. ~12 weeks of training.
const STRENGTH_WINDOW_DAYS = 84;

export interface GoalForecastResult {
  /** Weight ETA verdict, or null when not derivable (missing inputs). */
  weightEta: WeightEtaResult | null;
  /** Strength forecasts for the lifts with enough recent history (may be empty). */
  strength: StrengthForecast[];
}

/**
 * I/O boundary — reads current weight + goal weight + recent intake + TDEE for the
 * weight ETA, and per-lift logged history from sessionsHistory for the strength
 * trajectory, then delegates to the pure projectors. `now` injectable for tests.
 * Read-only (never writes targets/floors). Graceful: a sub-forecast that cannot be
 * formed is simply absent (null / empty), never a crash.
 */
export async function readGoalForecast(now: number = Date.now()): Promise<GoalForecastResult> {
  // ── Weight ETA ──
  let weightEta: WeightEtaResult | null = null;
  try {
    const ctx = readBayesianNutritionContext();
    const tdeeEstimateKcal = await readTdeeEstimateKcal(ctx);
    const dailyLog = useNutritionStore.getState().dailyLog;
    const avgIntakeKcal = avgRecentLoggedIntake(dailyLog, now);
    const currentWeightKg = getCurrentWeightKg();
    const goalWeightKg = useOnboardingStore.getState().data.targetWeight ?? null;
    weightEta = projectWeightEta({
      currentWeightKg,
      goalWeightKg,
      avgIntakeKcal,
      tdeeEstimateKcal,
      nowMs: now,
    });
  } catch {
    weightEta = null;
  }

  // ── Strength trajectory ──
  let strength: StrengthForecast[] = [];
  try {
    strength = readStrengthForecasts(now);
  } catch {
    strength = [];
  }

  return { weightEta, strength };
}

/**
 * Build per-lift strength forecasts from sessionsHistory. Each working set →
 * an estimated-1RM sample; lifts are bucketed by exercise name, projected via
 * projectLiftStrength, and the strongest-progressing few are surfaced. Pure-ish
 * (reads the store; `now` injected). Recency-windowed to the current trajectory.
 */
export function readStrengthForecasts(now: number): StrengthForecast[] {
  const sessions = useWorkoutStore.getState().sessionsHistory;
  const cutoff = now - STRENGTH_WINDOW_DAYS * DAY_MS;
  const byLift = new Map<string, LiftSamplePoint[]>();

  for (const session of sessions) {
    if (!session.exercises) continue;
    for (const ex of session.exercises) {
      const name = ex.exerciseName;
      if (typeof name !== 'string' || name.length === 0) continue;
      for (const set of ex.sets) {
        const ts = set.timestamp;
        if (!Number.isFinite(ts) || ts < cutoff || ts > now) continue;
        const oneRm = epleyOneRm(set.kg, set.reps);
        if (oneRm <= 0) continue;
        if (!byLift.has(name)) byLift.set(name, []);
        byLift.get(name)!.push({ ts, oneRm });
      }
    }
  }

  const forecasts: StrengthForecast[] = [];
  for (const [name, samples] of byLift) {
    const f = projectLiftStrength({ name, samples });
    if (f) forecasts.push(f);
  }
  // Most projected absolute gain first (the lift the user is climbing fastest).
  forecasts.sort((a, b) => (b.projectedOneRm - b.currentOneRm) - (a.projectedOneRm - a.currentOneRm));
  return forecasts.slice(0, MAX_STRENGTH_FORECASTS);
}
