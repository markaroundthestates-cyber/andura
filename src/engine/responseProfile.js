// ══ RESPONSE PROFILE ENGINE — Profilul de adaptare al utilizatorului ═════
// computeUserProfile(logs) analizeaza cum raspunde user-ul la volum,
// intensitate si frecventa, returnand sensitivitate pe fiecare dimensiune.

import { brzycki1RM } from './weaknessDetector.js';
import { todTs } from '../db.js';

/**
 * @typedef {Object} ResponseLog
 * @property {string | number} [session]
 * @property {number} [ts]
 * @property {string} [date]
 * @property {number} [w]
 * @property {number | string} [reps]
 */

/**
 * Grupeaza logurile pe sesiuni (timestamp-ul `session` sau zi din `ts`).
 * @param {Array<ResponseLog>} logs
 * @returns {Array<Array<ResponseLog>>}
 */
function groupBySessions(logs) {
  /** @type {Map<string, Array<ResponseLog>>} */
  const sessions = new Map();
  for (const log of logs) {
    const key = log.session
      ? String(log.session)
      : (log.ts ? todTs(log.ts) : null);
    if (!key) continue;
    if (!sessions.has(key)) sessions.set(key, []);
    sessions.get(key)?.push(log);
  }
  return [...sessions.values()];
}

/**
 * Calculeaza cate seturi contine o sesiune.
 * @param {Array<ResponseLog>} sessionLogs
 */
function setsInSession(sessionLogs) {
  return sessionLogs.length;
}

/**
 * Calculeaza 1RM mediu pentru o sesiune (toate exercitiile).
 * @param {Array<ResponseLog>} sessionLogs
 * @returns {number | null}
 */
function avg1RMForSession(sessionLogs) {
  const orms = /** @type {number[]} */ (sessionLogs
    .map((l) => brzycki1RM(l.w, typeof l.reps === 'string' ? parseInt(l.reps, 10) : (l.reps ?? 0)))
    .filter((v) => typeof v === 'number' && v > 0));
  if (orms.length === 0) return null;
  return orms.reduce((a, b) => a + b, 0) / orms.length;
}

/**
 * Calculeaza sensitivitatea la volum.
 * High volume sensitivity = performanta scade semnificativ in sesiunile cu > 20 seturi.
 * @param {Array<Array<ResponseLog>>} sessions
 * @returns {{ score: number, label: string, insufficient?: boolean }}
 */
function computeVolumeSensitivity(sessions) {
  if (sessions.length < 4) return { score: 0.5, label: 'insuficient', insufficient: true };

  const lowVol = sessions.filter(s => setsInSession(s) <= 15);
  const highVol = sessions.filter(s => setsInSession(s) > 20);

  if (lowVol.length < 2 || highVol.length < 2) return { score: 0.5, label: 'insuficient', insufficient: true };

  const lowOrms = /** @type {number[]} */ (lowVol.map(avg1RMForSession).filter((v) => v != null && v > 0));
  const highOrms = /** @type {number[]} */ (highVol.map(avg1RMForSession).filter((v) => v != null && v > 0));
  const avgLow = lowOrms.length > 0 ? lowOrms.reduce((a, b) => a + b, 0) / lowOrms.length : 0;
  const avgHigh = highOrms.length > 0 ? highOrms.reduce((a, b) => a + b, 0) / highOrms.length : 0;

  if (!avgLow || !avgHigh) return { score: 0.5, label: 'insuficient', insufficient: true };

  const ratio = avgHigh / avgLow;
  // ratio < 0.85 → high sensitivity (performs worse with high volume)
  const score = Math.max(0, Math.min(1, 1 - ratio));
  return { score: parseFloat(score.toFixed(3)), label: score > 0.3 ? 'high' : 'low' };
}

/**
 * Calculeaza sensitivitatea la frecventa.
 * Masoara daca user-ul progreseaza mai bine cu 3+ sesiuni/saptamana vs. 2.
 */
/**
 * @param {Array<ResponseLog>} logs
 * @returns {{ score: number, label: string, insufficient?: boolean }}
 */
function computeFrequencySensitivity(logs) {
  if (logs.length < 10) return { score: 0.5, label: 'insuficient', insufficient: true };

  // Group by ISO week
  /** @type {Map<string, Array<ResponseLog>>} */
  const byWeek = new Map();
  for (const log of logs) {
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) continue;
    const d = new Date(ts);
    // ISO 8601: week belongs to the year of its Thursday
    const thursday = new Date(d);
    thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
    const jan4 = new Date(thursday.getFullYear(), 0, 4);
    const w1start = new Date(jan4);
    w1start.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const weekNum = Math.floor((thursday.getTime() - w1start.getTime()) / (7 * 86400000)) + 1;
    const week = `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week)?.push(log);
  }

  const weekData = [...byWeek.values()].map(wLogs => ({
    sessions: new Set(wLogs.map((l) => l.session ? String(l.session) : (l.ts ? todTs(l.ts) : ''))).size,
    avg1RM: avg1RMForSession(wLogs),
  })).filter(w => w.avg1RM !== null);

  if (weekData.length < 4) return { score: 0.5, label: 'insuficient', insufficient: true };

  const lowFreq = weekData.filter(w => w.sessions <= 2);
  const highFreq = weekData.filter(w => w.sessions >= 3);

  if (lowFreq.length < 2 || highFreq.length < 2) return { score: 0.5, label: 'insuficient', insufficient: true };

  const avgLow = lowFreq.map(w => w.avg1RM ?? 0).reduce((a, b) => a + b, 0) / lowFreq.length;
  const avgHigh = highFreq.map(w => w.avg1RM ?? 0).reduce((a, b) => a + b, 0) / highFreq.length;

  if (!avgLow) return { score: 0.5, label: 'insuficient', insufficient: true };
  const ratio = avgHigh / avgLow;
  const score = Math.max(0, Math.min(1, ratio - 1));
  return { score: parseFloat(score.toFixed(3)), label: score > 0.1 ? 'high' : 'low' };
}

/**
 * Calculeaza profilul complet al utilizatorului.
 * @param {Array<ResponseLog>} logs
 * @returns {{ volume: { score: number, label: string, insufficient?: boolean }, frequency: { score: number, label: string, insufficient?: boolean }, overallProfile: string }}
 */
export function computeUserProfile(logs) {
  if (!logs || logs.length === 0) {
    return {
      volume: { score: 0.5, label: 'insuficient', insufficient: true },
      frequency: { score: 0.5, label: 'insuficient', insufficient: true },
      overallProfile: 'insufficient_data',
    };
  }

  const sessions = groupBySessions(logs);
  const volume = computeVolumeSensitivity(sessions);
  const frequency = computeFrequencySensitivity(logs);

  let overallProfile = 'balanced';
  if (volume.label === 'high' && frequency.label === 'high') overallProfile = 'quality_over_quantity';
  else if (volume.label === 'low' && frequency.label === 'high') overallProfile = 'high_frequency';
  else if (volume.label === 'high' && frequency.label === 'low') overallProfile = 'low_frequency_high_intensity';

  return { volume, frequency, overallProfile };
}
