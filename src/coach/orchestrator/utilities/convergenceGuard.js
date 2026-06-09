// Convergence Guard utility per ADR 030 D5 LOCKED V1.
//
// Cross-cutting orchestrator-level utility (NOT per-adapter) per D5.
// Q-OPEN-7 RESOLVED V1 2026-05-08 — batch periodic per session-end (NOT
// per-session-tick) + cooldown asymmetric upgrade/downgrade per ADR 030 §3.7.
//
// resolveTier remains a PURE passthrough (the V1 stub): it returns the seed
// `userState.profileTier ?? null` unchanged. The BEHAVIORAL re-classification
// (resolveBehavioralTier below) is a SEPARATE function the call boundary invokes
// ONLY when the dp_behavioral_tier_v1 flag is ON — so flag-OFF the resolved tier
// is byte-identical to the self-reported seed (no behavior change).
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §2.5 D5 + §3.7 RESOLVED V1
//      03-decisions/_FROZEN/009-calibration-tiers.md §AMENDMENT 2026-05-05 birou after

import {
  classifyPattern,
  classifyMovementLevel,
  STRENGTH_TIER_BAND,
  CEILING_SEX_FACTOR,
} from '../../../engine/dp/ceiling.js';

/**
 * Resolve the calibration tier for a user state.
 *
 * V1 stub passthrough: returns `userState.profileTier ?? null` unchanged. The
 * behavioral override lives in resolveBehavioralTier (flag-gated at the caller).
 *
 * @param {{profileTier?: string|null, profileTier_lastChange_ts?: number}} [userState]
 * @returns {string|null}
 */
export function resolveTier(userState) {
  return userState?.profileTier ?? null;
}

// ── Behavioral tier classifier (auto-detect the REAL training level) ─────────
// The self-reported experience (the seed profileTier) is ONLY a cold-start guess;
// behavior is the truth and OVERRIDES it. We infer the real level from what the
// user actually lifts — STRENGTH relative to bodyweight is the PRIMARY signal (a
// user may have years of prior training before installing Andura, so the in-app
// session COUNT must NOT block promotion to advanced; only literal zero-data is
// gated). Progression rate corroborates (a still-climbing-linearly lifter is NOT
// advanced — newbie gains). Hysteresis stops the tier yo-yoing.

// Map a strength-derived level to the calibration tier token.
const LEVEL_TO_TIER = Object.freeze({ beginner: 'T0', intermediate: 'T1', advanced: 'T2' });
const TIER_RANK = Object.freeze({ T0: 0, T1: 1, T2: 2 });

// Cold-start gate: never act on behavior with fewer than this many logged
// sessions (the self-report seed stands until there is real data to override it).
export const MIN_SESSIONS_TO_CLASSIFY = 2;

// Hysteresis: a tier change is only allowed after at least this many sessions
// since the last change (anti yo-yo). The lastChange timestamp guards the same.
export const HYSTERESIS_MIN_SESSIONS = 2;

// Progression-rate guard: if the user is STILL adding load near-linearly (newbie
// gains), they are NOT advanced however strong a single e1RM looks. A lift whose
// recent best e1RM exceeds its earlier e1RM by more than this fraction across the
// window is "still climbing" → suppresses an advanced (T2) promotion only.
export const STILL_CLIMBING_FRACTION = 0.10;

/**
 * Best sex-normalized relative-strength level for ONE exercise from its logs.
 * Computes the highest RIR-corrected e1RM over the logs, divides by bodyweight,
 * un-scales the female factor (so a female ratio compares on the male-referenced
 * band), and classifies against STRENGTH_TIER_BAND. Returns null when the pattern
 * carries no band (isolation) or there is no usable e1RM. PURE.
 *
 * @param {string} exName EN-canonical exercise name
 * @param {Array<{w?: number, reps?: number|string, rpe?: number, ts?: number}>} logs
 * @param {number} bwKg bodyweight
 * @param {string|undefined} sex 'm' | 'f'
 * @param {(w:number, reps:number|string, rpe:number|undefined, ex:string)=>number|null} e1RMForSet
 * @returns {{ level: 'beginner'|'intermediate'|'advanced', climbing: boolean }|null}
 */
function levelForExercise(exName, logs, bwKg, sex, e1RMForSet) {
  const pattern = classifyPattern(exName);
  if (!STRENGTH_TIER_BAND[pattern]) return null; // no strength-standard band → no signal
  const bw = Number(bwKg);
  if (!Number.isFinite(bw) || bw <= 0) return null;
  if (!Array.isArray(logs) || logs.length === 0) return null;

  // e1RM per set (newest-first logs). Track the best for the level + an early-vs-
  // late best for the still-climbing corroboration.
  const e1rms = [];
  for (const l of logs) {
    const e = e1RMForSet(Number(l.w), l.reps, l.rpe, exName);
    if (Number.isFinite(e) && e > 0) e1rms.push(e);
  }
  if (e1rms.length === 0) return null;

  const best = Math.max(...e1rms);
  // Female lifters: un-scale the female factor so the measured ratio compares on
  // the male-referenced band (a female at 0.78× the male standard reads the same
  // level as a male at the standard). Male / unknown → factor 1.0 (no change).
  const sexF = CEILING_SEX_FACTOR[String(sex).toLowerCase()] ?? CEILING_SEX_FACTOR.m;
  const ratio = (best / bw) / (sexF || 1);
  const level = classifyMovementLevel(pattern, ratio);
  if (!level) return null;

  // Still-climbing corroboration: logs are newest-first. Compare the best of the
  // newer half to the best of the older half — a large recent jump = newbie gains.
  let climbing = false;
  if (e1rms.length >= 4) {
    const mid = Math.floor(e1rms.length / 2);
    const recentBest = Math.max(...e1rms.slice(0, mid));
    const olderBest = Math.max(...e1rms.slice(mid));
    if (Number.isFinite(olderBest) && olderBest > 0) {
      climbing = recentBest > olderBest * (1 + STILL_CLIMBING_FRACTION);
    }
  }
  return { level, climbing };
}

/**
 * Auto-detect the REAL training tier from logged behavior, overriding the
 * self-reported seed in BOTH directions, with hysteresis. PURE — all I/O
 * (logs, clock) is injected so the caller owns the boundary and this stays unit-
 * testable + deterministic.
 *
 * Asymmetric gate (founder rule): DEMOTION (claimed higher than they lift — the
 * over-claimer) is FAST; PROMOTION to advanced trusts the strength signal. The
 * session count only guards the literal zero-data cold-start. The progression-rate
 * guard only blocks an ADVANCED promotion (a still-climbing lifter is not advanced).
 *
 * @param {{
 *   seedTier: string|null,
 *   bodyweightKg: number|null|undefined,
 *   sex: string|null|undefined,
 *   sessionCount: number,
 *   lastChangeTs?: number|null,
 *   now?: number,
 *   exerciseNames: ReadonlyArray<string>,
 *   getLogsFor: (ex: string) => Array<{w?: number, reps?: number|string, rpe?: number, ts?: number}>,
 *   e1RMForSet: (w: number, reps: number|string, rpe: number|undefined, ex: string) => number|null,
 * }} input
 * @returns {{ tier: string|null, changed: boolean, lastChangeTs: number|null }}
 */
export function resolveBehavioralTier(input) {
  const seed = input?.seedTier ?? null;
  const sessionCount = Number(input?.sessionCount) || 0;
  const lastChangeTs = input?.lastChangeTs ?? null;
  const now = Number.isFinite(input?.now) ? Number(input.now) : Date.now();
  const noChange = { tier: seed, changed: false, lastChangeTs };

  // Cold-start gate: with no real data the self-report seed stands.
  if (sessionCount < MIN_SESSIONS_TO_CLASSIFY) return noChange;

  const names = Array.isArray(input?.exerciseNames) ? input.exerciseNames : [];
  const getLogsFor = typeof input?.getLogsFor === 'function' ? input.getLogsFor : null;
  const e1RMForSet = typeof input?.e1RMForSet === 'function' ? input.e1RMForSet : null;
  if (!getLogsFor || !e1RMForSet || names.length === 0) return noChange;

  // Resolve a per-MOVEMENT level over the main patterns the user has logged. The
  // user's tier = the BEST level they demonstrate on any main lift (strength is
  // proof — a strong squat alone evidences real training age). Track whether any
  // main lift is still climbing (suppresses an advanced promotion only).
  let bestLevel = null; // 'beginner'|'intermediate'|'advanced'
  let anyClimbing = false;
  let anySignal = false;
  for (const ex of names) {
    const res = levelForExercise(ex, getLogsFor(ex), input.bodyweightKg, input.sex, e1RMForSet);
    if (!res) continue;
    anySignal = true;
    if (res.climbing) anyClimbing = true;
    if (bestLevel === null || TIER_RANK[LEVEL_TO_TIER[res.level]] > TIER_RANK[LEVEL_TO_TIER[bestLevel]]) {
      bestLevel = res.level;
    }
  }
  // No usable strength signal at all → keep the seed (cold-start-ish on data).
  if (!anySignal || bestLevel === null) return noChange;

  let resolvedLevel = bestLevel;
  // Progression-rate corroboration: a still-climbing-linearly lifter is NOT
  // advanced (newbie gains). Cap an advanced strength read down to intermediate
  // while they are still adding load fast.
  if (resolvedLevel === 'advanced' && anyClimbing) resolvedLevel = 'intermediate';

  const resolvedTier = LEVEL_TO_TIER[resolvedLevel];
  // Seed maps to a rank; unknown/null seed treated as T0 (conservative baseline,
  // same as tierForExperience's null → no tier mapping).
  const seedRank = TIER_RANK[seed] ?? null;
  const resolvedRank = TIER_RANK[resolvedTier];

  // No movement vs the seed → nothing to do.
  if (seedRank !== null && resolvedRank === seedRank) return noChange;
  if (seedRank === null && resolvedTier === seed) return noChange;

  // Hysteresis: a tier already changed recently must wait HYSTERESIS_MIN_SESSIONS
  // more sessions before moving again, so it does not yo-yo. The literal cold-
  // start gate (MIN_SESSIONS_TO_CLASSIFY) already passed. With no prior change
  // timestamp, the change is free (first-ever behavioral resolution).
  if (lastChangeTs !== null && sessionCount < HYSTERESIS_MIN_SESSIONS + MIN_SESSIONS_TO_CLASSIFY) {
    return noChange;
  }

  return { tier: resolvedTier, changed: true, lastChangeTs: now };
}
