// ══ TIER STORAGE — Stocare pe 3 niveluri temporale ════════════════════════
// live:      ultimele 90 zile — date complete, per-entry
// aggregate: 90 zile – 1 an — agregate zilnice/saptamanale
// archive:   > 1 an — sumar lunar comprimat

import { DB, todTs, todDate } from '../db.js';

const TIER_KEYS = {
  live: 'tier-live',
  aggregate: 'tier-aggregate',
  archive: 'tier-archive',
};

const NOW = () => new Date();
const MS_DAY = 86400000;
const LIVE_CUTOFF_DAYS = 90;
const AGGREGATE_CUTOFF_DAYS = 365;

/**
 * Returneaza data de start pentru fiecare tier.
 */
export function getTierBoundaries(now = NOW()) {
  const liveCutoff = new Date(now.getTime() - LIVE_CUTOFF_DAYS * MS_DAY);
  const aggregateCutoff = new Date(now.getTime() - AGGREGATE_CUTOFF_DAYS * MS_DAY);
  return { liveCutoff, aggregateCutoff };
}

/** @typedef {{ ts?: number, date?: string, w?: number, ex?: string, session?: string|number, [k: string]: unknown }} TierLogEntry */
/** @typedef {{ sets: number, totalWeight: number, exercises: Set<string> }} DayAccum */
/** @typedef {{ totalSets: number, exercises: Record<string, number> }} MonthAccum */

/**
 * Clasifica un array de intrari logs pe tiers.
 * @param {TierLogEntry[]} logs - fiecare cu { ts } sau { date }
 * @param {Date} now
 * @returns {{ live: TierLogEntry[], aggregate: TierLogEntry[], archive: TierLogEntry[] }}
 */
export function classifyLogs(logs, now = NOW()) {
  const { liveCutoff, aggregateCutoff } = getTierBoundaries(now);

  /** @type {TierLogEntry[]} */
  const live = [];
  /** @type {TierLogEntry[]} */
  const aggregate = [];
  /** @type {TierLogEntry[]} */
  const archive = [];

  for (const log of logs ?? []) {
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) { live.push(log); continue; }
    if (ts >= liveCutoff.getTime()) live.push(log);
    else if (ts >= aggregateCutoff.getTime()) aggregate.push(log);
    else archive.push(log);
  }

  return { live, aggregate, archive };
}

/**
 * Agregeaza logs vechi (90d-1yr) in sumar zilnic.
 * @param {TierLogEntry[]} logs
 * @returns {Record<string, { sets: number, avgWeight: number, exercises: string[] }>}
 */
export function aggregateLogs(logs) {
  /** @type {Record<string, DayAccum>} */
  const byDay = {};
  for (const log of logs ?? []) {
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) continue;
    const day = todTs(ts);
    if (!byDay[day]) byDay[day] = { sets: 0, totalWeight: 0, exercises: new Set() };
    byDay[day].sets++;
    byDay[day].totalWeight += Number(log.w ?? 0);
    byDay[day].exercises.add(String(log.ex ?? ''));
  }
  /** @type {Record<string, { sets: number, avgWeight: number, exercises: string[] }>} */
  const result = {};
  for (const [day, data] of Object.entries(byDay)) {
    result[day] = {
      sets: data.sets,
      avgWeight: data.sets > 0 ? Math.round(data.totalWeight / data.sets) : 0,
      exercises: [...data.exercises].filter(Boolean),
    };
  }
  return result;
}

/**
 * Arhiveaza logs > 1 an in sumar lunar.
 * @param {TierLogEntry[]} logs
 * @returns {Record<string, { sessions: number, totalSets: number, topExercises: string[] }>}
 */
export function archiveLogs(logs) {
  /** @type {Record<string, MonthAccum>} */
  const byMonth = {};
  /** @type {Record<string, Set<string>>} */
  const sessionsByMonth = {};

  for (const log of logs ?? []) {
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) continue;
    const d = new Date(ts);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const sessionKey = log.session ? String(log.session) : todDate(d);

    if (!byMonth[month]) byMonth[month] = { totalSets: 0, exercises: {} };
    if (!sessionsByMonth[month]) sessionsByMonth[month] = new Set();

    byMonth[month].totalSets++;
    sessionsByMonth[month].add(sessionKey);

    const ex = String(log.ex ?? '');
    if (ex) byMonth[month].exercises[ex] = (byMonth[month].exercises[ex] ?? 0) + 1;
  }

  /** @type {Record<string, { sessions: number, totalSets: number, topExercises: string[] }>} */
  const result = {};
  for (const [month, data] of Object.entries(byMonth)) {
    const topExercises = Object.entries(data.exercises)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ex]) => ex);
    result[month] = {
      sessions: sessionsByMonth[month]?.size ?? 0,
      totalSets: data.totalSets,
      topExercises,
    };
  }
  return result;
}

/**
 * Salveaza tiers in localStorage (optimizat: doar live e stocat complet).
 * @param {TierLogEntry[]} logs
 */
export function saveTiers(logs) {
  const { live, aggregate, archive } = classifyLogs(logs);
  DB.set(TIER_KEYS.live, live);
  DB.set(TIER_KEYS.aggregate, aggregateLogs(aggregate));
  DB.set(TIER_KEYS.archive, archiveLogs(archive));
}

/**
 * Citeste doar logs live (ultimele 90 zile) — fast path pentru UI.
 * @returns {TierLogEntry[]}
 */
export function getLiveLogs() {
  return /** @type {TierLogEntry[] | null} */ (DB.get(TIER_KEYS.live)) ?? [];
}

/**
 * Citeste sumar agregat pentru grafice istorice.
 * @returns {Object}
 */
export function getAggregateData() {
  return DB.get(TIER_KEYS.aggregate) ?? {};
}

/**
 * Citeste arhiva lunara pentru statistici pe termen lung.
 * @returns {Object}
 */
export function getArchiveData() {
  return DB.get(TIER_KEYS.archive) ?? {};
}
