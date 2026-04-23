// ══ TIER STORAGE — Stocare pe 3 niveluri temporale ════════════════════════
// live:      ultimele 90 zile — date complete, per-entry
// aggregate: 90 zile – 1 an — agregate zilnice/săptămânale
// archive:   > 1 an — sumar lunar comprimat

import { DB } from '../db.js';

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
 * Returnează data de start pentru fiecare tier.
 */
export function getTierBoundaries(now = NOW()) {
  const liveCutoff = new Date(now.getTime() - LIVE_CUTOFF_DAYS * MS_DAY);
  const aggregateCutoff = new Date(now.getTime() - AGGREGATE_CUTOFF_DAYS * MS_DAY);
  return { liveCutoff, aggregateCutoff };
}

/**
 * Clasifică un array de intrări logs pe tiers.
 * @param {Array} logs - fiecare cu { ts } sau { date }
 * @param {Date} now
 * @returns {{ live: Array, aggregate: Array, archive: Array }}
 */
export function classifyLogs(logs, now = NOW()) {
  const { liveCutoff, aggregateCutoff } = getTierBoundaries(now);

  const live = [];
  const aggregate = [];
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
 * Agregează logs vechi (90d-1yr) în sumar zilnic.
 * @param {Array} logs
 * @returns {Object} { 'YYYY-MM-DD': { sets: N, avgWeight: N, exercises: [...] } }
 */
export function aggregateLogs(logs) {
  const byDay = {};
  for (const log of logs ?? []) {
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) continue;
    const day = new Date(ts).toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { sets: 0, totalWeight: 0, exercises: new Set() };
    byDay[day].sets++;
    byDay[day].totalWeight += Number(log.w ?? log.weight ?? 0);
    byDay[day].exercises.add(log.ex ?? log.exercise ?? '');
  }
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
 * Arhivează logs > 1 an în sumar lunar.
 * @param {Array} logs
 * @returns {Object} { 'YYYY-MM': { sessions: N, totalSets: N, topExercises: [...] } }
 */
export function archiveLogs(logs) {
  const byMonth = {};
  const sessionsByMonth = {};

  for (const log of logs ?? []) {
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) continue;
    const d = new Date(ts);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const sessionKey = log.session ? String(log.session) : d.toISOString().slice(0, 10);

    if (!byMonth[month]) byMonth[month] = { totalSets: 0, exercises: {} };
    if (!sessionsByMonth[month]) sessionsByMonth[month] = new Set();

    byMonth[month].totalSets++;
    sessionsByMonth[month].add(sessionKey);

    const ex = log.ex ?? log.exercise ?? '';
    if (ex) byMonth[month].exercises[ex] = (byMonth[month].exercises[ex] ?? 0) + 1;
  }

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
 * Salvează tiers în localStorage (optimizat: doar live e stocat complet).
 * @param {Array} logs
 */
export function saveTiers(logs) {
  const { live, aggregate, archive } = classifyLogs(logs);
  DB.set(TIER_KEYS.live, live);
  DB.set(TIER_KEYS.aggregate, aggregateLogs(aggregate));
  DB.set(TIER_KEYS.archive, archiveLogs(archive));
}

/**
 * Citește doar logs live (ultimele 90 zile) — fast path pentru UI.
 * @returns {Array}
 */
export function getLiveLogs() {
  return DB.get(TIER_KEYS.live) ?? [];
}

/**
 * Citește sumar agregat pentru grafice istorice.
 * @returns {Object}
 */
export function getAggregateData() {
  return DB.get(TIER_KEYS.aggregate) ?? {};
}

/**
 * Citește arhiva lunară pentru statistici pe termen lung.
 * @returns {Object}
 */
export function getArchiveData() {
  return DB.get(TIER_KEYS.archive) ?? {};
}
