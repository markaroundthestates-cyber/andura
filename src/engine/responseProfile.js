// ══ RESPONSE PROFILE ENGINE — Profilul de adaptare al utilizatorului ═════
// computeUserProfile(logs) analizează cum răspunde user-ul la volum,
// intensitate și frecvență, returnând sensitivitate pe fiecare dimensiune.

import { brzycki1RM } from './weaknessDetector.js';

/**
 * Grupează logurile pe sesiuni (timestamp-ul `session` sau zi din `ts`).
 */
function groupBySessions(logs) {
  const sessions = new Map();
  for (const log of logs) {
    const key = log.session
      ? String(log.session)
      : (log.ts ? new Date(log.ts).toISOString().slice(0, 10) : null);
    if (!key) continue;
    if (!sessions.has(key)) sessions.set(key, []);
    sessions.get(key).push(log);
  }
  return [...sessions.values()];
}

/**
 * Calculează câte seturi conține o sesiune.
 */
function setsInSession(sessionLogs) {
  return sessionLogs.length;
}

/**
 * Calculează 1RM mediu pentru o sesiune (toate exercițiile).
 */
function avg1RMForSession(sessionLogs) {
  const orms = sessionLogs
    .map(l => brzycki1RM(l.w ?? l.weight, parseInt(l.reps, 10) || l.reps))
    .filter(Boolean);
  if (orms.length === 0) return null;
  return orms.reduce((a, b) => a + b, 0) / orms.length;
}

/**
 * Calculează sensitivitatea la volum.
 * High volume sensitivity = performanța scade semnificativ în sesiunile cu > 20 seturi.
 * @returns {{ score: number, label: string }}
 */
function computeVolumeSensitivity(sessions) {
  if (sessions.length < 4) return { score: 0.5, label: 'insuficient', insufficient: true };

  const lowVol = sessions.filter(s => setsInSession(s) <= 15);
  const highVol = sessions.filter(s => setsInSession(s) > 20);

  if (lowVol.length < 2 || highVol.length < 2) return { score: 0.5, label: 'insuficient', insufficient: true };

  const avgLow = lowVol.map(avg1RMForSession).filter(Boolean).reduce((a, b) => a + b, 0) / lowVol.length;
  const avgHigh = highVol.map(avg1RMForSession).filter(Boolean).reduce((a, b) => a + b, 0) / highVol.length;

  if (!avgLow || !avgHigh) return { score: 0.5, label: 'insuficient', insufficient: true };

  const ratio = avgHigh / avgLow;
  // ratio < 0.85 → high sensitivity (performs worse with high volume)
  const score = Math.max(0, Math.min(1, 1 - ratio));
  return { score: parseFloat(score.toFixed(3)), label: score > 0.3 ? 'high' : 'low' };
}

/**
 * Calculează sensitivitatea la frecvență.
 * Măsoară dacă user-ul progresează mai bine cu 3+ sesiuni/săptămână vs. 2.
 */
function computeFrequencySensitivity(logs) {
  if (logs.length < 10) return { score: 0.5, label: 'insuficient', insufficient: true };

  // Group by ISO week
  const byWeek = new Map();
  for (const log of logs) {
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) continue;
    const d = new Date(ts);
    const week = `${d.getFullYear()}-W${String(Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 604800000)).padStart(2, '0')}`;
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week).push(log);
  }

  const weekData = [...byWeek.values()].map(wLogs => ({
    sessions: new Set(wLogs.map(l => l.session ? String(l.session) : new Date(l.ts).toISOString().slice(0, 10))).size,
    avg1RM: avg1RMForSession(wLogs),
  })).filter(w => w.avg1RM !== null);

  if (weekData.length < 4) return { score: 0.5, label: 'insuficient', insufficient: true };

  const lowFreq = weekData.filter(w => w.sessions <= 2);
  const highFreq = weekData.filter(w => w.sessions >= 3);

  if (lowFreq.length < 2 || highFreq.length < 2) return { score: 0.5, label: 'insuficient', insufficient: true };

  const avgLow = lowFreq.map(w => w.avg1RM).reduce((a, b) => a + b, 0) / lowFreq.length;
  const avgHigh = highFreq.map(w => w.avg1RM).reduce((a, b) => a + b, 0) / highFreq.length;

  const ratio = avgHigh / avgLow;
  const score = Math.max(0, Math.min(1, ratio - 1));
  return { score: parseFloat(score.toFixed(3)), label: score > 0.1 ? 'high' : 'low' };
}

/**
 * Calculează profilul complet al utilizatorului.
 * @param {Array} logs
 * @returns {{ volume: object, frequency: object, overallProfile: string }}
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
