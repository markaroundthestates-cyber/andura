/**
 * Auto-Aggression Detection — pure functions module.
 *
 * Detects user self-sabotage patterns per ADR 013.
 * 5 signals + 1 amplifier (hyperfocus). No side effects.
 *
 * Reads CDL entries (filtered by caller). Does NOT read raw logs directly.
 *
 * Reference: ADR 013 (signals + windows + tier logic)
 *            ADR 011 (CDL schema, extension 2026-04-26 — autoAggression + rest_marked)
 */

import { isoWeek } from '../util/isoWeek.js';
export { isoWeek as _isoWeek };

// ── Tier computation ──────────────────────────────────────────────────────────

/**
 * Map signal count → severity tier.
 * 0→'none', 1→'LOW', 2-3→'MED', 4-5→'HIGH' (starting calibration, ADR 013 §5)
 */
export function _computeTier(signalCount) {
  if (signalCount <= 0) return 'none';
  if (signalCount === 1) return 'LOW';
  if (signalCount <= 3) return 'MED';
  return 'HIGH';
}

// ── Composite fatigue ─────────────────────────────────────────────────────────

/**
 * Return true if a single CDL entry has composite fatigue marker.
 * Primary: outcome.setsRPE — ≥50% of rated sets at RPE ≥9 (Hard/Very Hard).
 * Fallback: outcome.rating ≤2 proxy (pre-setsRPE entries, per ADR 013 reconsideration trigger #5).
 * Sets without RPE are excluded from the denominator.
 */
export function _computeCompositeFatigue(entry) {
  const outcome = entry?.outcome;
  if (!outcome) return false;

  const setsRPE = outcome.setsRPE;
  if (Array.isArray(setsRPE) && setsRPE.length > 0) {
    const rated = setsRPE.filter(r => typeof r === 'number');
    if (rated.length === 0) return false;
    const hardCount = rated.filter(r => r >= 9).length;  // RPE 9=Hard, 10=Very Hard
    return hardCount / rated.length >= 0.5;
  }

  // Proxy fallback: numeric rating ≤2 (pre-RPE-per-set entries)
  const rating = outcome.rating;
  if (typeof rating === 'number') return rating <= 2;
  return false;
}

// ── Signal detectors ──────────────────────────────────────────────────────────

/**
 * Signal #1 — Volume creep: 3+ consecutive workout sessions with deviation=true
 * AND actualSets > proposedSets, spanning ≤21 days (anti-stale on sporadic users).
 * "Consecutive" = adjacent executed sessions, no break in streak.
 * Starting threshold: 3 sessions / 21 days (ADR 013 empirical calibration table).
 */
export function _detectVolumeCreep(entries) {
  const workouts = entries
    .filter(e => e.outcome?.executed === true || e.outcome?.executed === 'partial')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (workouts.length < 3) return false;

  let streakStart = 0;
  let streakLen = 0;

  for (let i = 0; i < workouts.length; i++) {
    const isCreep = workouts[i].outcome?.deviation === true &&
                    (workouts[i].outcome?.actualSets ?? 0) > (workouts[i].outcome?.proposedSets ?? 0);

    if (isCreep) {
      if (streakLen === 0) streakStart = i;
      streakLen++;
      if (streakLen >= 3) {
        const spanDays = (new Date(workouts[i].date) - new Date(workouts[streakStart].date)) / 86400000;
        if (spanDays <= 21) return true;  // 21-day anti-stale window
      }
    } else {
      streakLen = 0;
    }
  }
  return false;
}

/**
 * Signal #2 — Calorie restriction acceleration: kcal_target drops >300 kcal
 * within any 7-day rolling window. Starting threshold: 300 kcal (ADR 013 empirical calibration).
 * Reads context.kcal_target across CDL entries.
 */
export function _detectCalorieAcceleration(entries) {
  const withKcal = entries
    .filter(e => typeof e.context?.kcal_target === 'number')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (withKcal.length < 2) return false;

  for (let i = 0; i < withKcal.length; i++) {
    const anchor = new Date(withKcal[i].date);
    const cutoff = new Date(anchor);
    cutoff.setDate(anchor.getDate() + 7);

    const window = withKcal.filter(e => {
      const d = new Date(e.date);
      return d >= anchor && d <= cutoff;
    });
    if (window.length < 2) continue;

    const maxKcal = Math.max(...window.map(e => e.context.kcal_target));
    const minKcal = Math.min(...window.map(e => e.context.kcal_target));
    if (maxKcal - minKcal > 300) return true;  // >300 kcal drop threshold
  }
  return false;
}

/**
 * Signal #3 — Frustration markers: low session rating (≤2 proxy, per ADR 013 §3)
 * followed by volume creep in same or next session within 14-day window.
 * Window: 14-day rolling (anti-reactive at <14d, anti-stale at >14d).
 */
export function _detectFrustrationMarkers(entries) {
  const workouts = entries
    .filter(e => e.outcome?.executed === true || e.outcome?.executed === 'partial')
    .sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < workouts.length; i++) {
    const rating = workouts[i].outcome?.rating;
    const isLowRating = typeof rating === 'number' && rating <= 2;
    if (!isLowRating) continue;

    const windowEnd = new Date(workouts[i].date);
    windowEnd.setDate(windowEnd.getDate() + 14);  // 14-day forward window

    for (let j = i; j < workouts.length; j++) {
      if (new Date(workouts[j].date) > windowEnd) break;
      const hasCreep = workouts[j].outcome?.deviation === true &&
                       (workouts[j].outcome?.actualSets ?? 0) > (workouts[j].outcome?.proposedSets ?? 0);
      if (hasCreep) return true;
    }
  }
  return false;
}

/**
 * Signal #4 — Ignore recovery: composite fatigue ≥2 sessions in 7-day window
 * + zero early-stops + no volume reduction (recovery not acknowledged).
 * Window: 7-day rolling snapshot.
 */
export function _detectIgnoreRecovery(entries) {
  const workouts = entries
    .filter(e => e.outcome?.executed === true || e.outcome?.executed === 'partial')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (workouts.length < 2) return false;

  for (let i = 0; i < workouts.length; i++) {
    const anchor = new Date(workouts[i].date);
    const cutoff = new Date(anchor);
    cutoff.setDate(anchor.getDate() + 7);

    const window = workouts.filter(e => {
      const d = new Date(e.date);
      return d >= anchor && d < cutoff;
    });
    if (window.length < 2) continue;

    const fatigueSessions = window.filter(e => _computeCompositeFatigue(e));
    if (fatigueSessions.length < 2) continue;

    // Condition: no early-stop (would indicate recovery was acknowledged)
    if (window.some(e => e.outcome?.earlyStop === true)) continue;

    // Condition: volume not dropped in fatigue sessions (user keeps pushing)
    const volumeDropped = fatigueSessions.some(
      e => (e.outcome?.actualSets ?? 0) < (e.outcome?.proposedSets ?? 0)
    );
    if (volumeDropped) continue;

    return true;
  }
  return false;
}

/**
 * Signal #5 — Recovery debt: 3+ consecutive ISO weeks (Mon-Sun) with <2 rest_marked=true days.
 * Streak breaks at first week with ≥2 rest_marked=true days.
 * NOTE: caller (detectAutoAggression) enforces "combined with ≥1 other signal" rule.
 * Singular recovery debt = noise for aggressive profiles (ADR 013 §1).
 * Threshold: <2 rest days / 3 weeks (ADR 013 empirical calibration).
 */
export function _detectRecoveryDebt(entries) {
  const byWeek = {};

  for (const entry of entries) {
    if (!entry.date) continue;
    const week = isoWeek(entry.date);
    if (!byWeek[week]) byWeek[week] = 0;
    // Only count explicit rest_marked=true on non-executed days (per ADR 011 rest semantics)
    if (entry.outcome?.executed === false && entry.outcome?.rest_marked === true) {
      byWeek[week]++;
    }
  }

  const sortedWeeks = Object.keys(byWeek).sort();
  if (sortedWeeks.length < 3) return false;

  let streak = 0;
  for (const week of sortedWeeks) {
    if (byWeek[week] < 2) {  // <2 rest days threshold
      streak++;
      if (streak >= 3) return true;
    } else {
      streak = 0;  // streak breaks at week with ≥2 rest days
    }
  }
  return false;
}

/**
 * Hyperfocus amplifier — 8h+/day for 4+ days/week (7-day rolling).
 * NOT a detection signal — calibration heuristic that tightens other thresholds.
 * Starting threshold: 4 days (ADR 013 empirical calibration reconsideration trigger #7).
 * Returns { amplified, reason } for attachment to AA output.
 */
export function _detectHyperfocusAmplifier(hyperfocusData) {
  if (!hyperfocusData) return { amplified: false, reason: null };
  const { daysWithHyperfocus = 0 } = hyperfocusData;
  const amplified = daysWithHyperfocus >= 4;  // 4+ days/week at 8h+ threshold
  return {
    amplified,
    reason: amplified ? 'hyperfocus_pattern_8h_4days_per_week' : null,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compute escalation flag: MED tier sustained in 2+ consecutive ISO weeks.
 * Reads outcome.autoAggression.tier from CDL entries.
 *
 * @param {object[]} cdlEntries
 * @returns {boolean}
 */
export function computeEscalation(cdlEntries) {
  const withAA = (cdlEntries ?? []).filter(e => e.outcome?.autoAggression?.tier != null);
  if (withAA.length < 1) return false;

  const byWeek = {};
  for (const entry of withAA) {
    const week = isoWeek(entry.date);
    if (!byWeek[week]) byWeek[week] = [];
    byWeek[week].push(entry.outcome.autoAggression.tier);
  }

  const sortedWeeks = Object.keys(byWeek).sort();
  if (sortedWeeks.length < 2) return false;

  let streak = 0;
  for (const week of sortedWeeks) {
    const hasMedOrHigher = byWeek[week].some(t => t === 'MED' || t === 'HIGH');
    if (hasMedOrHigher) {
      streak++;
      if (streak >= 2) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

/**
 * Aggregate AA signals across CDL entries for buildSession context (read-side snapshot).
 * Used by coachContext to build ctx.autoAggression for intervention layer + banner UI.
 *
 * @param {object[]} cdlEntries - CDL entries (typically last 30d, filtered by caller)
 * @returns {{ signals: string[], tier: string, escalating: boolean, amplified: boolean, amplifierReason: string|null, riskFlags: string[] }}
 */
export function aggregateAutoAggression(cdlEntries) {
  const empty = { signals: [], tier: 'none', escalating: false, amplified: false, amplifierReason: null, riskFlags: [] };
  if (!cdlEntries || cdlEntries.length === 0) return empty;

  const real = cdlEntries.filter(e => !e.synthetic && e.outcome != null);
  if (real.length === 0) return empty;

  const signalSet = new Set();
  for (const entry of real) {
    const aa = entry.outcome?.autoAggression;
    if (!aa || aa.tier === 'none') continue;
    for (const s of (aa.signals ?? [])) signalSet.add(s);
  }

  const signals = [...signalSet];
  const tier = _computeTier(signals.length);
  const escalating = computeEscalation(real);

  const amplifiedEntry = real.find(e => e.outcome?.autoAggression?.amplified === true);
  const amplified = amplifiedEntry != null;
  const amplifierReason = amplified ? (amplifiedEntry.outcome.autoAggression.amplifierReason ?? null) : null;

  return { signals, tier, escalating, amplified, amplifierReason, riskFlags: [] };
}

/**
 * Detect AA signals on current entry context (write-side, single entry).
 * Run during populateOutcome to persist autoAggression in CDL.
 *
 * Recovery debt (signal #5) only counted when ≥1 other signal also fires
 * (singular recovery debt = noise for aggressive profiles, ADR 013 §1).
 *
 * @param {object} opts
 * @param {object} opts.currentEntry - CDL entry being finalized (outcome populated, no autoAggression yet)
 * @param {object[]} [opts.recentEntries] - last 30d CDL entries, excl. current
 * @param {object} [opts.hyperfocusData] - { hoursInApp7d, daysWithHyperfocus } from analytics
 * @returns {{ tier: string, signals: string[], escalating: boolean, amplified: boolean, amplifierReason: string|null, riskFlags: string[] }}
 */
export function detectAutoAggression({ currentEntry, recentEntries = [], hyperfocusData = null }) {
  const allEntries = [...(recentEntries ?? []), currentEntry].filter(Boolean);

  const volumeCreep       = _detectVolumeCreep(allEntries);
  const calorieAccel      = _detectCalorieAcceleration(allEntries);
  const frustration       = _detectFrustrationMarkers(allEntries);
  const ignoreRecovery    = _detectIgnoreRecovery(allEntries);
  const rawRecoveryDebt   = _detectRecoveryDebt(allEntries);

  // Recovery debt only when combined with ≥1 other active signal (ADR 013 §1)
  const otherCount = [volumeCreep, calorieAccel, frustration, ignoreRecovery].filter(Boolean).length;
  const recoveryDebt = rawRecoveryDebt && otherCount >= 1;

  const signals = [
    volumeCreep     && 'volume_creep',
    calorieAccel    && 'calorie_acceleration',
    frustration     && 'frustration',
    ignoreRecovery  && 'ignore_recovery',
    recoveryDebt    && 'recovery_debt',
  ].filter(Boolean);

  const tier = _computeTier(signals.length);
  const escalating = computeEscalation(recentEntries ?? []);
  const { amplified, reason: amplifierReason } = _detectHyperfocusAmplifier(hyperfocusData);

  return { tier, signals, escalating, amplified, amplifierReason, riskFlags: [] };
}
