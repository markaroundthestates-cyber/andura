// ══ PERFORMANCE SIGNAL — is the user actually thriving right now? ════════════
// Founder live 2026-08-28. The energy modulation (energyVolumeFactor) reads ONLY
// the kcal deficit: a deep cut → maximum protection (−30% volume, +2 RIR, deload
// pulled forward EVERY mesocycle). It is blind to whether the deficit is actually
// impairing the user.
//
// The founder's real account is the counter-example: a ~1300 kcal/day deficit
// (severity 0.52, far past the 0.30 saturation point → maximum protection) while
// setting NINE PRs in 30 days and rating 83% of sets `potrivit`. No coach who saw
// that would cut a third of his volume and push him 2 RIR further from failure.
//
// This module is the missing evidence half: a PURE read of the durable logs +
// PR records answering "is recent performance strong?" — used to TEMPER (never to
// deepen) the energy-driven cut. Deficit still reduces volume; it just stops
// applying the MAXIMUM reduction to someone visibly recovering fine.
//
// Deliberately conservative — every criterion must hold, and a thin window (not
// enough recent evidence) returns strong:false so the legacy protection stands.

/** Days of history the signal reads. One mesocycle-ish — long enough for a PR to
 *  land, short enough to describe the CURRENT state. */
export const PERF_WINDOW_DAYS = 21;
/** Minimum logged sets in the window before the signal is trusted at all. */
export const PERF_MIN_SETS = 12;
/** Share of `greu` (rpe >= 8.5) sets above which the user is NOT coasting. */
export const PERF_GREU_SHARE_MAX = 0.35;
/** rpe at/above which a set counts as `greu` (RATING_TO_RPE greu = 8.5). */
const GREU_RPE = 8.5;

const DAY_MS = 86_400_000;

/**
 * Is recent training performance STRONG (evidence the user is recovering well)?
 *
 * ALL must hold over the trailing PERF_WINDOW_DAYS:
 *   - at least one PR (a record set — the clearest "not under-recovered" signal),
 *   - `greu` share below PERF_GREU_SHARE_MAX (they are not grinding every set),
 *   - at least PERF_MIN_SETS logged sets (enough evidence to judge).
 *
 * PURE — `now` injected, no clock/RNG/IO. Malformed rows are skipped, never thrown on.
 *
 * @param {ReadonlyArray<{ts?: number, rpe?: number}>} logs durable set rows (any order)
 * @param {ReadonlyArray<{ts?: number}>} prRecords durable PR rows (any order)
 * @param {number} now wall-clock ms
 * @returns {{strong: boolean, recentPRs: number, greuShare: number, sets: number}}
 */
export function detectStrongPerformance(logs, prRecords, now) {
  const since = Number(now) - PERF_WINDOW_DAYS * DAY_MS;
  const blank = { strong: false, recentPRs: 0, greuShare: 0, sets: 0 };
  if (!Number.isFinite(since)) return blank;

  let sets = 0;
  let greu = 0;
  for (const l of Array.isArray(logs) ? logs : []) {
    const ts = Number(l?.ts);
    if (!Number.isFinite(ts) || ts < since || ts > now) continue;
    sets++;
    if (Number(l?.rpe) >= GREU_RPE) greu++;
  }

  let recentPRs = 0;
  for (const p of Array.isArray(prRecords) ? prRecords : []) {
    const ts = Number(p?.ts);
    if (Number.isFinite(ts) && ts >= since && ts <= now) recentPRs++;
  }

  const greuShare = sets > 0 ? greu / sets : 0;
  const strong = sets >= PERF_MIN_SETS && recentPRs >= 1 && greuShare < PERF_GREU_SHARE_MAX;
  return { strong, recentPRs, greuShare, sets };
}
