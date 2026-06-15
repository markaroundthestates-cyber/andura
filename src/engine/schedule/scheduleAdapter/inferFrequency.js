// ── Inferred training frequency (dp_auto_infer_frequency_v1, 2026-06-14) ──────
// Dose WEEKLY VOLUME from the user's ACTUAL logged training cadence instead of
// only the configured/onboarding frequency. If a user configured 5 days but
// actually trains ~3, volume must dose for 3 (recovery-limited reality), NOT 5.
//
// SCOPE — VOLUME ONLY: this returns a FREQUENCY NUMBER fed into the weekly-volume
// budget (scaleWeeklyVolumeByInferredFrequency below). It NEVER changes which days
// are training days — the user's chosen schedule (the activeWeek day-pattern, the
// cluster-per-day, weeklySessionsPerGroup) is untouched. The configured frequency
// still drives the SCHEDULE; the inferred frequency only scales how much volume.
//
// LOG SOURCE: the SAME flattened recovery logs ACWR / DP / the recovery brain read
// (flattenSessionsToRecoveryLogs(userState.recentSessions) → rows { ex, ts, w }).
// No new persistence. PURE: derives everything from `logs` + an injected `nowMs`.
//
// COLD-START SAFETY (the eval grid + every new user): with < ~2 weeks of history
// span OR too few logged sessions → returns null → the caller falls back to the
// configured frequency → BYTE-IDENTICAL behavior. The eval grid seeds DP load logs
// (DB 'logs', path B) but NOT sessionsHistory, so recentSessions is empty there →
// null → byte-identical regardless of the flag default.

// Trailing window over which we count distinct training days.
const INFER_WINDOW_DAYS = 21;
const MS_PER_DAY = 86400000;
// Cold-start gates — ALL must clear or we return null (fall back to configured):
//   - at least this many DISTINCT logged training days (a few real sessions)
//   - at least this many days between the earliest + latest logged day in-window
//     (a real cadence needs ~2 weeks of span; a dense few-day burst is not a cadence
//     and — critically — the eval-grid synthetic histories span <= ~12 days, so this
//     keeps the grid cold-start → byte-identical).
const MIN_DISTINCT_DAYS = 4;
const MIN_SPAN_DAYS = 14;
// Anti-whiplash clamp: the inferred frequency may deviate from the configured
// frequency by at most this many steps, so one off block never wildly reshapes the
// dose. Combined with the rolling window this is the "smoothed + clamped" guard.
const MAX_DEVIATION_FROM_CONFIGURED = 2;

const _dayKey = (ts) => Math.floor(ts / MS_PER_DAY);

/**
 * Infer the user's ACTUAL weekly training cadence from their logged sessions.
 *
 * Counts DISTINCT training DAYS (by calendar day) in the trailing
 * INFER_WINDOW_DAYS window, divides by the number of weeks of history actually
 * present in-window (the observed span, not a flat 3), and rounds to an integer in
 * [1, 7]. Rolling-window + span-normalized → a single off week does not whiplash
 * the estimate (a 3-week span with one skipped week reads ~2/week, not 0).
 *
 * @param {ReadonlyArray<{ex?: string, ts?: number, date?: string, baseline?: boolean}>} logs
 *   the flattened recovery logs (same source ACWR/recovery read)
 * @param {number} nowMs - injected clock (deterministic; NOT Date.now)
 * @returns {number|null} inferred sessions/week in [1,7], or null at cold start
 *   (insufficient history) / malformed input → caller falls back to configured.
 */
export function inferTrainingFrequency(logs, nowMs) {
  if (!Array.isArray(logs) || logs.length === 0) return null;
  const now = Number(nowMs);
  if (!Number.isFinite(now) || now <= 0) return null;
  const cutoff = now - INFER_WINDOW_DAYS * MS_PER_DAY;

  // Collect the DISTINCT calendar days that carry a real (non-baseline) logged
  // exercise inside the window.
  const days = new Set();
  for (const log of logs) {
    if (!log || log.baseline || !log.ex) continue;
    const ts = Number(log.ts) || (log.date ? new Date(log.date).getTime() : 0);
    if (!Number.isFinite(ts) || ts <= 0 || ts < cutoff || ts > now) continue;
    days.add(_dayKey(ts));
  }
  const distinctDays = days.size;
  if (distinctDays < MIN_DISTINCT_DAYS) return null; // cold start

  // Span of real history in-window (earliest → latest distinct day). A real
  // cadence needs ~2 weeks of span; a tight burst is not a cadence (and keeps the
  // eval-grid synthetic histories — span <= ~12 days — cold-start = byte-identical).
  let minDay = Infinity;
  let maxDay = -Infinity;
  for (const d of days) {
    if (d < minDay) minDay = d;
    if (d > maxDay) maxDay = d;
  }
  const spanDays = maxDay - minDay;
  if (spanDays < MIN_SPAN_DAYS) return null; // cold start

  // Weeks of OBSERVED history (span-normalized, not a flat divisor) so a partial
  // window is not under-counted. +1 day so the inclusive span counts correctly
  // (e.g. exactly 14 days of span = 2 weeks, not 1.86).
  const weeks = Math.max(1, (spanDays + 1) / 7);
  const perWeek = distinctDays / weeks;
  const rounded = Math.round(perWeek);
  // Clamp to a sane training frequency.
  return Math.max(1, Math.min(7, rounded));
}

/**
 * Scale the weekly per-group VOLUME budget by the inferred-vs-configured training
 * frequency ratio, MEV-clamped. The periodization weekly budget does NOT depend on
 * frequency (it is persona × goal × experience × phase); frequency only acts as a
 * per-session DIVISOR downstream (weekly/freq). So feeding the inferred frequency
 * into the per-group session count alone would NOT change the DELIVERED weekly
 * total — the budget is absorbed by per-session floors. The honest dose is to
 * scale the WEEKLY BUDGET itself: a user training 3 of a configured 5 days
 * recovers ~3/5 of the weekly volume. Per-session sizing + the delivered total
 * both then reflect the real cadence, WITHOUT touching the day-schedule.
 *
 * Guards:
 *   - inferred null / inferred >= configured / configured <= 0 → passthrough
 *     (we only ever LOWER the dose to match a SHORTFALL in training days; a user
 *     who trains MORE than configured keeps the configured budget — extra volume
 *     is governed by the existing recovery/MRV layers, not inflated here).
 *   - each scaled group is floored at its Israetel MEV so no worked muscle sinks
 *     below maintenance (graceful, ADR 025); groups without an MEV entry keep the
 *     plain ratio.
 *
 * @param {Record<string, number>|null|undefined} volumeTargets - Big-11 EN -> sets/week
 * @param {number} inferredFreq - inferTrainingFrequency result (>0)
 * @param {number} configuredFreq - the schedule/day-count frequency the dose used
 * @param {Readonly<Object<string,{MEV:number}>>} israetelBaselines - EN-keyed MEV table
 * @returns {Record<string, number>} a NEW scaled map (input never mutated), or the
 *   input clone when no scaling applies.
 */
export function scaleWeeklyVolumeByInferredFrequency(
  volumeTargets,
  inferredFreq,
  configuredFreq,
  israetelBaselines,
) {
  if (!volumeTargets || typeof volumeTargets !== 'object') return volumeTargets;
  const inf = Number(inferredFreq);
  const cfg = Number(configuredFreq);
  if (!Number.isFinite(inf) || !Number.isFinite(cfg) || inf <= 0 || cfg <= 0) {
    return { ...volumeTargets };
  }
  // Only ever LOWER (shortfall) — inferred >= configured keeps the budget.
  if (inf >= cfg) return { ...volumeTargets };
  return scaleWeeklyVolumeByRatio(volumeTargets, inf / cfg, israetelBaselines);
}

/**
 * Scale a weekly per-group VOLUME budget by an arbitrary shortfall RATIO, MEV-
 * clamped. The per-target scale + MEV-floor loop extracted from
 * scaleWeeklyVolumeByInferredFrequency so BOTH the inferred-frequency path and the
 * chronic-low-adherence path (dp_adherence_volume_v1) apply the SAME single
 * discount under the SAME floor (the two combine by MIN of their ratios BEFORE
 * this call — never a doubled discount).
 *
 * Only ever LOWERS: ratio >= 1 (or a bad ratio) → passthrough clone (we never
 * inflate; over-execution / extra cadence is governed by the recovery/MRV layers).
 *
 * @param {Record<string, number>|null|undefined} volumeTargets - Big-11 EN -> sets/week
 * @param {number} ratio - the combined shortfall ratio in (0,1] (>=1 → no scaling)
 * @param {Readonly<Object<string,{MEV:number}>>} israetelBaselines - EN-keyed MEV table
 * @returns {Record<string, number>} a NEW scaled map (input never mutated), or the
 *   input clone when no scaling applies.
 */
export function scaleWeeklyVolumeByRatio(volumeTargets, ratio, israetelBaselines) {
  if (!volumeTargets || typeof volumeTargets !== 'object') return volumeTargets;
  const r = Number(ratio);
  // ratio >= 1 / malformed → never inflate → passthrough clone.
  if (!Number.isFinite(r) || r <= 0 || r >= 1) return { ...volumeTargets };
  const out = {};
  for (const [enKey, weekly] of Object.entries(volumeTargets)) {
    if (typeof weekly !== 'number' || !Number.isFinite(weekly)) {
      out[enKey] = weekly;
      continue;
    }
    const scaled = weekly * r;
    const mev =
      israetelBaselines && israetelBaselines[enKey] && typeof israetelBaselines[enKey].MEV === 'number'
        ? israetelBaselines[enKey].MEV
        : 0;
    // Floor at MEV but never RAISE a group that was already below MEV (defensive:
    // a budget already under MEV stays as-is, scaled — we never inflate).
    out[enKey] = weekly <= mev ? scaled : Math.max(mev, scaled);
  }
  return out;
}

// ── Chronic-low-adherence VOLUME ratio (dp_adherence_volume_v1, 2026-06-16) ─────
// A user who SHOWS UP but chronically UNDER-EXECUTES (executed << proposed) with NO
// 3-week per-exercise gap (so _returnDeload never fires) and a normal cadence (so
// the inferred-frequency path never fires) had their dose UNREDUCED. computeAdherence
// already measures this — its score already weights partials (executed×1 + partial
// ×0.5)/proposed — so the adherence ratio is simply score/100, guarded for cold start.
//
// The ratio NEVER zeroes volume: it is clamped to the SAME MEV-floor contract the
// inferred-frequency scaler enforces (scaleWeeklyVolumeByRatio MEV-floors each group),
// and additionally floored away from 0 here so a 0%-adherence reading still doses the
// minimum (the user re-engaging must not face an empty plan). VOLUME ONLY.

// Below this many proposed sessions in-window the score is too noisy to dose on
// (one missed session out of two is not "chronic") → treat as cold start.
const ADHERENCE_MIN_PROPOSED = 4;
// Never let the adherence ratio crater the budget below this fraction; the per-group
// MEV floor (scaleWeeklyVolumeByRatio) is the real safety, this just bounds the ratio
// itself so a near-zero score can't drive every above-MEV group to its MEV at once.
const ADHERENCE_MIN_RATIO = 0.5;

/**
 * Derive a VOLUME shortfall ratio from a recent-window adherence reading.
 * Cold-start guarded → 1 (no effect): null score (no proposed sessions) OR fewer
 * than ADHERENCE_MIN_PROPOSED proposed sessions. Otherwise score/100, floored at
 * ADHERENCE_MIN_RATIO so it never zeroes the dose.
 *
 * @param {number|null} score - computeAdherence().score (0..100, or null at cold start)
 * @param {number} proposed - computeAdherence().proposed (in-window proposed sessions)
 * @returns {number} a ratio in [ADHERENCE_MIN_RATIO, 1]; exactly 1 when inert (no effect)
 */
export function adherenceVolumeRatio(score, proposed) {
  const p = Number(proposed);
  // Cold start: no measurement / too few proposed sessions → inert (ratio 1).
  if (score === null || score === undefined || !Number.isFinite(p) || p < ADHERENCE_MIN_PROPOSED) {
    return 1;
  }
  const s = Number(score);
  if (!Number.isFinite(s) || s >= 100) return 1; // full adherence → no effect
  const ratio = s / 100;
  // Clamp into [MIN_RATIO, 1] — never inflate, never zero.
  return Math.max(ADHERENCE_MIN_RATIO, Math.min(1, ratio));
}

/**
 * Resolve the effective frequency the VOLUME dose should use, given the configured
 * frequency + the logs. Applies the anti-whiplash clamp (the inferred value may
 * deviate from the configured by at most MAX_DEVIATION_FROM_CONFIGURED steps).
 * Returns null when cold-start / inference unavailable (caller keeps configured).
 *
 * @param {ReadonlyArray<object>} logs - flattened recovery logs
 * @param {number} nowMs - injected clock
 * @param {number} configuredFreq - the schedule/day-count frequency
 * @returns {number|null} the clamped inferred frequency, or null at cold start
 */
export function resolveVolumeFrequency(logs, nowMs, configuredFreq) {
  const inferred = inferTrainingFrequency(logs, nowMs);
  if (inferred === null) return null;
  const cfg = Number(configuredFreq);
  if (!Number.isFinite(cfg) || cfg <= 0) return inferred;
  // Anti-whiplash: never let the inferred value stray more than N steps from the
  // configured frequency (clamps a wild estimate from a sparse/odd window).
  const lo = Math.max(1, cfg - MAX_DEVIATION_FROM_CONFIGURED);
  const hi = Math.min(7, cfg + MAX_DEVIATION_FROM_CONFIGURED);
  return Math.max(lo, Math.min(hi, inferred));
}
