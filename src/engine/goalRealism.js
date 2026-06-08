// ══ GOAL REALISM — push-back / reframe layer (#74) ════════════════════════
//
// A real coach does not just OBEY the goal — when the ask is impossible or
// self-contradictory (e.g. "lose 18kg in 7 weeks", "+8kg muscle AND visible
// abs in 12 weeks", a beginner wanting 7 hard days/week), it REFRAMES gently:
// shows the realistic band, proposes the sustainable alternative, never blocks.
// Daniel demonstrated this as a coaching MUST (2026-06-08).
//
// This is a PURE detection layer (zero Date.now / Math.random / mutation / I/O):
// given current/target/weeks + a BF-estimate BAND + goal + experience, it
// returns { label, reframeKey, vars } — a semantic i18n KEY (resolved EN/RO at
// the React boundary, NEVER a hardcoded sentence) plus the numbers to
// interpolate. The consumer (gated behind dp_goal_realism_v1, default OFF) shows
// the reframe ONCE at goal-set with an anti-spam cooldown.
//
// UX tone (LOCK — spec §4): ranges not verdicts —
//   "Targetul tau cere ~X%/sapt. Realist e 0.5-1.0%/sapt. Ajusteaza la Y-Z sapt
//    sau accepta risc de pierdere musculara."
// Nu minte userul, nici nu-l plesneste cu rigla.
//
// Source policy: _ENGINE_load_bf_rate_policy_2026-06-08.md §3 + §4.
// BF source: bodyComposition.js (two-tier Deurenberg + US-Navy) used as a BAND,
// conservative default on Tier-1-only.

// ── Rate-of-change bands (% bodyweight / week) ────────────────────────────
// Spec §4 labels on weekly_loss_pct = (current - target) / weeks / current * 100.
//   <=0.5 conservative | <=0.75 realistic | <=1.0 aggressive-but-reasonable
//   <=1.25 & BF_high very-aggressive-tradeoffs | else unrealistic.
export const RATE_CONSERVATIVE = 0.5;
export const RATE_REALISTIC = 0.75;
export const RATE_AGGRESSIVE = 1.0;
export const RATE_VERY_AGGRESSIVE = 1.25;

// ── Real-muscle GAIN rate bands (kg/month, spec §3 "Real muscle (lean, slower)") ──
// #70-D4 — the loss detectors only rate-gate a LOSS; a too-fast muscle-GAIN ask
// (Catalin: +8kg "muscle" + visible abs in 12 weeks) was uncaught. The policy:
// real LEAN muscle gain is novice ~0.5-1.0, intermediate ~0.25-0.5, advanced
// ~0.1-0.25 kg/MONTH. A scale target far above the realistic LEAN gain over the
// deadline is mostly fat/water, not the "muscle + abs" the user pictures → reframe
// to a realistic rate + a recomp/sequential framing (you can't add 8kg of MUSCLE
// and reveal abs at once). Per-month; 1 month ≈ 4.345 weeks (avg). Pure data.
export const GAIN_RATE_BEGINNER_KG_MO = 1.0;
export const GAIN_RATE_INTERMEDIATE_KG_MO = 0.5;
export const GAIN_RATE_ADVANCED_KG_MO = 0.25;
export const WEEKS_PER_MONTH = 4.345;
// How far above the realistic lean-gain ceiling an ask must sit to be flagged —
// a small overshoot is within estimate noise + early "newbie water/glycogen", so
// only a MATERIAL overshoot (≥1.5× the experience ceiling) reframes. Conservative
// (don't nag a slightly-keen but plausible bulk).
export const GAIN_UNREALISTIC_FACTOR = 1.5;

// ── BF gate on the MAX sustainable rate (spec §4) ─────────────────────────
//   M>25 / F>32      → default 1.0 / aggressive 1.25  (higher BF = more fat to
//                       spend before muscle is at risk)
//   M 15-25 / F 23-32 → 0.75 / 1.0
//   leaner            → 0.5 / 0.75
// Soft zones (estimated BF is noisy, ~4-5% SE on Tier-1) — see spec §2.
export const BF_GATE_HIGH_M = 25;
export const BF_GATE_HIGH_F = 32;
export const BF_GATE_MID_M = 15;
export const BF_GATE_MID_F = 23;

/**
 * @typedef {'high'|'mid'|'lean'} BfZone
 */

/**
 * Classify the BF zone for the max-rate gate. Sex-aware (the male/female
 * thresholds differ — essential-fat asymmetry). Unknown/invalid BF → the
 * CONSERVATIVE zone ('lean') so a missing estimate never green-lights an
 * aggressive cut (safe-by-default, spec §2). Tier-1-only callers should already
 * pass the conservative estimate; this is the additional floor. Pure.
 *
 * @param {number|null|undefined} bfPct - estimated body-fat percent (band)
 * @param {string|null|undefined} sex   - 'm'/'male' = male, else female
 * @returns {BfZone}
 */
export function classifyBfZone(bfPct, sex) {
  if (!Number.isFinite(bfPct)) return 'lean';
  const sexLower = typeof sex === 'string' ? sex.toLowerCase() : '';
  const isMale = sexLower === 'm' || sexLower === 'male';
  const high = isMale ? BF_GATE_HIGH_M : BF_GATE_HIGH_F;
  const mid = isMale ? BF_GATE_MID_M : BF_GATE_MID_F;
  if (bfPct > high) return 'high';
  if (bfPct > mid) return 'mid';
  return 'lean';
}

/**
 * The (default, aggressive) max sustainable weekly-loss %BW for a BF zone.
 * `default` = the recommended ceiling; `aggressive` = the tradeoff ceiling
 * (muscle-loss risk acknowledged). Pure.
 *
 * @param {BfZone} zone
 * @returns {{ defaultRate: number, aggressiveRate: number }}
 */
export function maxRateForZone(zone) {
  if (zone === 'high') return { defaultRate: RATE_AGGRESSIVE, aggressiveRate: RATE_VERY_AGGRESSIVE };
  if (zone === 'mid') return { defaultRate: RATE_REALISTIC, aggressiveRate: RATE_AGGRESSIVE };
  return { defaultRate: RATE_CONSERVATIVE, aggressiveRate: RATE_REALISTIC };
}

/**
 * @typedef {'conservative'|'realistic'|'aggressive'|'very-aggressive'|'unrealistic'} RateLabel
 */

/**
 * Label a weekly-loss rate per spec §4, BF-gated. The plain bands
 * (conservative/realistic/aggressive) are universal; the very-aggressive and
 * unrealistic split depends on the BF zone — a high-BF user can sustain a higher
 * rate before muscle is at risk, so the SAME rate is "very-aggressive" for them
 * but "unrealistic" for a lean user. Pure.
 *
 * @param {number} weeklyPct - weekly loss as %BW (positive number)
 * @param {BfZone} zone
 * @returns {RateLabel}
 */
export function labelLossRate(weeklyPct, zone) {
  if (!Number.isFinite(weeklyPct) || weeklyPct <= 0) return 'conservative';
  if (weeklyPct <= RATE_CONSERVATIVE) return 'conservative';
  if (weeklyPct <= RATE_REALISTIC) return 'realistic';
  if (weeklyPct <= RATE_AGGRESSIVE) return 'aggressive';
  // Above the aggressive band. A high-BF user gets one more tier
  // (very-aggressive) up to 1.25%; everyone else is already unrealistic.
  if (weeklyPct <= RATE_VERY_AGGRESSIVE && zone === 'high') return 'very-aggressive';
  return 'unrealistic';
}

/**
 * Recommended timeline RANGE (weeks) to reach the target at a SAFE vs AGGRESSIVE
 * rate for the BF zone. Used to reframe an unrealistic ask ("adjust to Y-Z
 * weeks"). The safe end uses the zone's default rate; the aggressive end uses
 * the zone's aggressive rate (muscle-loss risk acknowledged). Rounded UP (a
 * fractional week always rounds to the longer, safer integer). Pure.
 *
 * @param {number} currentKg
 * @param {number} targetKg
 * @param {BfZone} zone
 * @returns {{ safeWeeksMin: number, safeWeeksMax: number, aggressiveWeeksMin: number, aggressiveWeeksMax: number }|null}
 */
export function recommendedTimelineWeeks(currentKg, targetKg, zone) {
  if (!Number.isFinite(currentKg) || currentKg <= 0) return null;
  if (!Number.isFinite(targetKg) || targetKg <= 0) return null;
  const deltaKg = Math.abs(currentKg - targetKg);
  if (deltaKg <= 0) return null;
  const { defaultRate, aggressiveRate } = maxRateForZone(zone);
  // weeks = totalPct / ratePct ; totalPct = deltaKg / currentKg * 100.
  const totalPct = (deltaKg / currentKg) * 100;
  // Safe window = the conservative edge (RATE_CONSERVATIVE) up to the zone's
  // default rate; aggressive window = the zone default up to the zone aggressive.
  const safeWeeksMax = Math.ceil(totalPct / RATE_CONSERVATIVE);
  const safeWeeksMin = Math.ceil(totalPct / defaultRate);
  const aggressiveWeeksMax = Math.ceil(totalPct / defaultRate);
  const aggressiveWeeksMin = Math.ceil(totalPct / aggressiveRate);
  return { safeWeeksMin, safeWeeksMax, aggressiveWeeksMin, aggressiveWeeksMax };
}

// ── Goal/phase mapping (onboarding goal tokens) ──────────────────────────
// The contradictory-goals detector needs to know whether the user is asking for
// aggressive FAT-LOSS while ALSO chasing max MUSCLE-GAIN. The signals:
//   - an aggressive/unrealistic loss RATE (computed above) = aggressive fat loss
//   - goal 'masa' (muscle mass) + a near-zero or below-current target = the
//     muscle-gain intent the loss directly contradicts.
// We do NOT block; we reframe to recomp (high-BF: viable) or sequential
// cut-then-lean-bulk (lean: can't do both).

// ── Frequency / volume for experience (spec: beginner wanting 7 hard days) ──
// A beginner cannot recover from 7 hard sessions/week; a real coach reframes to
// sustainable (e.g. 3 hard + light fillers). The threshold is experience-keyed.
export const BEGINNER_MAX_HARD_DAYS = 4; // a beginner over this = unwise
export const INTERMEDIATE_MAX_HARD_DAYS = 5;
export const SUSTAINABLE_BEGINNER_HARD_DAYS = 3;

/**
 * @typedef {Object} GoalRealismInput
 * @property {number|null} [currentKg]   - current bodyweight (kg)
 * @property {number|null} [targetKg]    - target bodyweight (kg)
 * @property {number|null} [weeks]       - desired timeline (weeks to deadline)
 * @property {number|null} [bfPct]       - estimated body-fat % BAND (conservative on Tier-1)
 * @property {string|null} [sex]         - 'm'/'male' = male, else female
 * @property {string|null} [goal]        - onboarding goal token (masa/slabire/forta/mentenanta/auto)
 * @property {string|null} [experience]  - incepator/intermediar/avansat
 * @property {number|null} [hardDaysPerWeek] - requested hard training days/week
 */

/**
 * @typedef {Object} GoalRealismFlag
 * @property {'timeline'|'gain'|'contradiction'|'frequency'} type
 * @property {RateLabel|string} label
 * @property {string} reframeKey  - i18n key (resolved EN/RO at the React boundary)
 * @property {Object<string, number|string>} vars - interpolation variables
 */

/**
 * Detect an unrealistic timeline (spec §4 #1). Returns a flag only when the
 * implied rate is UNREALISTIC (or very-aggressive) — conservative/realistic/
 * aggressive-reasonable asks pass silently (a real coach does not nag a fine
 * plan). null when there is no loss target or inputs are incomplete. Pure.
 *
 * Worked example (Daniel): 108→90 in 7wk → 18kg over 7wk = 2.38%/wk → above the
 * 1.25 ceiling for any zone → 'unrealistic'. With a mid BF zone the safe window
 * is 17-24wk (0.75 default … 0.5 conservative) and the aggressive window 13-16wk.
 *
 * @param {GoalRealismInput} input
 * @returns {GoalRealismFlag|null}
 */
export function detectUnrealisticTimeline(input = {}) {
  const currentKg = Number(input.currentKg);
  const targetKg = Number(input.targetKg);
  const weeks = Number(input.weeks);
  if (!Number.isFinite(currentKg) || currentKg <= 0) return null;
  if (!Number.isFinite(targetKg) || targetKg <= 0) return null;
  if (!Number.isFinite(weeks) || weeks <= 0) return null;

  const deltaKg = currentKg - targetKg; // positive = loss
  // Only a LOSS target is rate-gated here (muscle-loss risk). A gain target is a
  // bulk-rate concern handled separately (not in scope #1 — spec §3 caps gain at
  // a much lower rate but a fast bulk is "extra fat", not a health/muscle risk).
  if (deltaKg <= 0) return null;

  const weeklyPct = (deltaKg / weeks / currentKg) * 100;
  const zone = classifyBfZone(input.bfPct, input.sex);
  const label = labelLossRate(weeklyPct, zone);

  // Only reframe when the plan is past the reasonable band.
  if (label !== 'unrealistic' && label !== 'very-aggressive') return null;

  const tl = recommendedTimelineWeeks(currentKg, targetKg, zone);
  if (tl === null) return null;
  const { defaultRate } = maxRateForZone(zone);

  return {
    type: 'timeline',
    label,
    // Distinct keys: an outright unrealistic ask vs a very-aggressive (high-BF
    // tradeoff) ask get a slightly different tone (both ranges-not-verdicts).
    reframeKey:
      label === 'unrealistic'
        ? 'goalRealism.timeline.unrealistic'
        : 'goalRealism.timeline.veryAggressive',
    vars: {
      // round the rate to 1 decimal for display (2.38 → 2.4)
      askedPct: Math.round(weeklyPct * 10) / 10,
      safeRateLow: RATE_CONSERVATIVE,
      safeRateHigh: defaultRate,
      safeWeeksMin: tl.safeWeeksMin,
      safeWeeksMax: tl.safeWeeksMax,
      aggressiveWeeksMin: tl.aggressiveWeeksMin,
      aggressiveWeeksMax: tl.aggressiveWeeksMax,
    },
  };
}

/**
 * Realistic LEAN muscle-gain ceiling (kg/month) for an experience level (spec §3).
 * Novice gains fastest, advanced slowest. Unknown → the intermediate rate (the
 * sane middle). Pure.
 *
 * @param {string|null|undefined} experience - incepator/intermediar/avansat
 * @returns {number} realistic lean-gain ceiling in kg/month
 */
export function gainRateForExperience(experience) {
  const exp = typeof experience === 'string' ? experience.toLowerCase() : '';
  if (exp === 'incepator') return GAIN_RATE_BEGINNER_KG_MO;
  if (exp === 'avansat') return GAIN_RATE_ADVANCED_KG_MO;
  return GAIN_RATE_INTERMEDIATE_KG_MO; // intermediar / unknown
}

/**
 * Detect an unrealistic muscle-GAIN timeline (#70-D4). The loss timeline detector
 * skips a gain target (targetKg > currentKg); this is its mirror. When the goal is
 * muscle (masa) and the SCALE gain implied by (target - current) over the deadline
 * sits MATERIALLY above the realistic LEAN-gain rate for the user's experience
 * (spec §3), the ask ("+8kg muscle + abs in 12 weeks") is reframed: a realistic
 * lean-gain timeline + the recomp/sequential truth (you can't add that much MUSCLE
 * and reveal abs at once — the rest is fat/water). Ranges, not verdicts. Returns
 * null for a loss/maintain target, a non-masa goal, or a plausible bulk. Pure.
 *
 * @param {GoalRealismInput} input
 * @returns {GoalRealismFlag|null}
 */
export function detectUnrealisticGain(input = {}) {
  const goal = typeof input.goal === 'string' ? input.goal.toLowerCase() : '';
  if (goal !== 'masa') return null; // only a muscle-mass goal makes a gain-rate claim

  const currentKg = Number(input.currentKg);
  const targetKg = Number(input.targetKg);
  const weeks = Number(input.weeks);
  if (!Number.isFinite(currentKg) || currentKg <= 0) return null;
  if (!Number.isFinite(targetKg) || targetKg <= 0) return null;
  if (!Number.isFinite(weeks) || weeks <= 0) return null;

  const gainKg = targetKg - currentKg; // positive = gain intent
  if (gainKg <= 0) return null; // a loss/maintain target is the loss detector's job

  const months = weeks / WEEKS_PER_MONTH;
  const askedRateKgMo = gainKg / months;
  const realisticRate = gainRateForExperience(input.experience);
  // Only reframe a MATERIAL overshoot (≥1.5× the realistic lean-gain ceiling).
  if (askedRateKgMo <= realisticRate * GAIN_UNREALISTIC_FACTOR) return null;

  // Realistic weeks to gain THIS much LEAN mass at the experience ceiling — the
  // honest "this is how long real muscle takes" window (rounded UP, longer/safer).
  const realisticWeeks = Math.ceil((gainKg / realisticRate) * WEEKS_PER_MONTH);

  return {
    type: 'gain',
    label: 'unrealistic',
    reframeKey: 'goalRealism.gain.unrealistic',
    vars: {
      gainKg: Math.round(gainKg * 10) / 10,
      askedWeeks: Math.round(weeks),
      // realistic lean-gain rate per MONTH (one decimal for display)
      realisticRateKgMo: Math.round(realisticRate * 100) / 100,
      realisticWeeks,
    },
  };
}

/**
 * Detect contradictory goals (spec §4 #2): the user wants max MUSCLE-GAIN AND
 * aggressive FAT-LOSS at the same time. Signal = goal 'masa' (build muscle) with
 * a below-current LOSS target whose implied rate is aggressive+ (the body can't
 * meaningfully build muscle while shedding fat fast — except a recomp window).
 * Reframe by BF zone: high BF → recomp viable; lean → can't do both, propose
 * sequential cut-then-lean-bulk. null when not contradictory. Pure.
 *
 * @param {GoalRealismInput} input
 * @returns {GoalRealismFlag|null}
 */
export function detectContradictoryGoals(input = {}) {
  const goal = typeof input.goal === 'string' ? input.goal.toLowerCase() : '';
  // The contradiction is specifically muscle-gain (masa) intent + a fat-loss
  // direction. STRENGTH (forta) also wants surplus but is out of the explicit
  // spec example; we scope to the demonstrated 'masa' case.
  if (goal !== 'masa') return null;

  const currentKg = Number(input.currentKg);
  const targetKg = Number(input.targetKg);
  const weeks = Number(input.weeks);
  if (!Number.isFinite(currentKg) || currentKg <= 0) return null;
  if (!Number.isFinite(targetKg) || targetKg <= 0) return null;

  const deltaKg = currentKg - targetKg; // positive = loss intent
  if (deltaKg <= 0) return null; // gaining/maintaining with masa = coherent

  // The fat-loss must be at least aggressive to truly contradict muscle gain. If
  // a timeline is provided, gate on the implied rate; without a timeline, the
  // direction alone (masa + below-current target) is the contradiction.
  const zone = classifyBfZone(input.bfPct, input.sex);
  if (Number.isFinite(weeks) && weeks > 0) {
    const weeklyPct = (deltaKg / weeks / currentKg) * 100;
    const label = labelLossRate(weeklyPct, zone);
    if (label === 'conservative' || label === 'realistic') return null; // slow cut + masa ≈ recomp, fine
  }

  // High BF → recomp is realistic (beginner+high BF especially, spec §2);
  // lean → can't gain muscle + lose fat fast, propose sequential.
  const recompViable = zone === 'high';
  return {
    type: 'contradiction',
    label: recompViable ? 'recomp' : 'sequential',
    reframeKey: recompViable
      ? 'goalRealism.contradiction.recomp'
      : 'goalRealism.contradiction.sequential',
    vars: {},
  };
}

/**
 * Detect an unwise frequency/volume for the user's experience (spec §4 #3): a
 * beginner asking for 7 hard days/week can't recover. Reframe to a sustainable
 * cadence (e.g. 3 hard + light fillers). Experience-keyed threshold. null when
 * the cadence is appropriate or inputs are incomplete. Pure.
 *
 * @param {GoalRealismInput} input
 * @returns {GoalRealismFlag|null}
 */
export function detectUnwiseFrequency(input = {}) {
  const hardDays = Number(input.hardDaysPerWeek);
  if (!Number.isFinite(hardDays) || hardDays <= 0) return null;
  const exp = typeof input.experience === 'string' ? input.experience.toLowerCase() : '';

  let cap;
  let sustainable;
  if (exp === 'incepator') {
    cap = BEGINNER_MAX_HARD_DAYS;
    sustainable = SUSTAINABLE_BEGINNER_HARD_DAYS;
  } else if (exp === 'intermediar') {
    cap = INTERMEDIATE_MAX_HARD_DAYS;
    sustainable = INTERMEDIATE_MAX_HARD_DAYS;
  } else {
    // advanced (or unknown) — no reframe; an advanced lifter can program high
    // frequency, and an unknown experience should not be nagged.
    return null;
  }

  if (hardDays <= cap) return null;

  return {
    type: 'frequency',
    label: 'unsustainable',
    reframeKey: 'goalRealism.frequency.beginnerTooMany',
    vars: {
      requested: Math.round(hardDays),
      sustainableHard: sustainable,
    },
  };
}

/**
 * Top-level goal-realism evaluation. Runs the three detectors and returns the
 * SINGLE highest-priority reframe (timeline > contradiction > frequency — an
 * impossible timeline is the most urgent reframe), or null when everything is
 * realistic. The consumer (gated dp_goal_realism_v1, default OFF) shows it once
 * at goal-set with an anti-spam cooldown. Pure (deterministic, no I/O).
 *
 * @param {GoalRealismInput} input
 * @returns {GoalRealismFlag|null}
 */
export function evaluateGoalRealism(input = {}) {
  return (
    detectUnrealisticTimeline(input) ??
    detectUnrealisticGain(input) ??
    detectContradictoryGoals(input) ??
    detectUnwiseFrequency(input) ??
    null
  );
}
