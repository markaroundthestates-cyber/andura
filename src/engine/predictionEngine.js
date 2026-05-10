// ══ PREDICTION ENGINE — Pattern absenta per zi saptamana ═════════════════
// Detecteaza zilele cu probabilitate mare de absenta bazat pe istoricul
// logurilor. Returneaza predictii si recomandari de replanificare.

import { todTs } from '../db.js';

const DAY_NAMES = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];

/**
 * Calculeaza cate sesiuni au fost planificate vs. efectuate per zi.
 * Sesiunea = set distinct de logs cu acelasi `session` timestamp (sau ts zi).
 */
function sessionsPerDayOfWeek(logs) {
  const sessions = new Map();
  for (const log of logs) {
    const ts = log.session ?? log.ts;
    if (!ts) continue;
    const sessionKey = log.session
      ? String(log.session)
      : todTs(ts);
    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, new Date(ts).getDay());
    }
  }
  const counts = new Array(7).fill(0);
  for (const dow of sessions.values()) counts[dow]++;
  return counts;
}

/**
 * Detecteaza zilele cu absenta frecventa folosind workout-skips din localStorage.
 * workoutSkips: { 'YYYY-MM-DD': true }
 */
function skipsPerDayOfWeek(skips) {
  const counts = new Array(7).fill(0);
  for (const dateStr of Object.keys(skips ?? {})) {
    const dow = new Date(dateStr).getDay();
    if (dow >= 0 && dow <= 6) counts[dow]++;
  }
  return counts;
}

/**
 * Calculeaza probabilitatea de absenta per zi (0–1).
 * Daca skips[dow] / (sessions[dow] + skips[dow]) > 0.3 → risc ridicat.
 */
export function absenceProbabilityByDay(logs, workoutSkips) {
  const sessionCounts = sessionsPerDayOfWeek(logs ?? []);
  const skipCounts = skipsPerDayOfWeek(workoutSkips ?? {});

  return sessionCounts.map((sessions, dow) => {
    const skips = skipCounts[dow];
    const total = sessions + skips;
    if (total < 3) return { dow, day: DAY_NAMES[dow], probability: 0, sessions, skips, insufficient: true };
    const probability = skips / total;
    return { dow, day: DAY_NAMES[dow], probability: parseFloat(probability.toFixed(3)), sessions, skips };
  });
}

/**
 * Returneaza zilele cu probabilitate de absenta > threshold (default 0.3).
 * @param {Array} logs
 * @param {Object} workoutSkips
 * @param {number} threshold
 * @returns {Array<{ dow, day, probability, recommendation }>}
 */
export function getHighRiskDays(logs, workoutSkips, threshold = 0.3) {
  return absenceProbabilityByDay(logs, workoutSkips)
    .filter(d => !d.insufficient && d.probability > threshold)
    .map(d => ({
      ...d,
      recommendation: `Planifica sesiunea mai scurta sau muta-o. Risc absenta: ${Math.round(d.probability * 100)}%`,
    }));
}

/**
 * Predictie pentru ziua curenta: este azi o zi cu risc ridicat?
 * @param {Array} logs
 * @param {Object} workoutSkips
 * @returns {{ isHighRisk: boolean, probability: number, recommendation: string|null }}
 */
export function predictToday(logs, workoutSkips) {
  const dow = new Date().getDay();
  const byDay = absenceProbabilityByDay(logs, workoutSkips);
  const today = byDay[dow];
  const isHighRisk = !today.insufficient && today.probability > 0.3;
  return {
    isHighRisk,
    probability: today.probability,
    dow,
    day: today.day,
    recommendation: isHighRisk
      ? `Istoric: ${Math.round(today.probability * 100)}% sanse sa sari azi. Sesiune scurta recomandata.`
      : null,
  };
}
