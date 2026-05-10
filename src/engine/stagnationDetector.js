// ══ STAGNATION DETECTOR — Saptamani consecutive de stagnare ══════════════
// Grupeaza logurile pe saptamani ISO, calculeaza 1RM mediu per saptamana,
// si numara cate saptamani consecutive nu au progresat.

import { brzycki1RM } from './weaknessDetector.js';
import { isoWeek } from '../util/isoWeek.js';

/**
 * Calculeaza 1RM mediu pentru logs date (un singur exercitiu).
 */
function avg1RM(logs) {
  const orms = logs
    .map(l => brzycki1RM(l.w, parseInt(l.reps, 10) || l.reps))
    .filter(Boolean);
  if (orms.length === 0) return null;
  return orms.reduce((a, b) => a + b, 0) / orms.length;
}

/**
 * Grupeaza logurile unui exercitiu pe saptamani si calculeaza 1RM mediu/saptamana.
 * @param {string} exerciseName
 * @param {Array} logs
 * @returns {Array<{ week: string, avg1RM: number }>} cronologic
 */
export function weeklyProgression(exerciseName, logs) {
  const byWeek = new Map();
  for (const log of logs) {
    const ex = log.ex;
    if (!ex || ex.toLowerCase() !== exerciseName.toLowerCase()) continue;
    const ts = log.ts ?? (log.date ? new Date(log.date).getTime() : null);
    if (!ts) continue;
    const week = isoWeek(ts);
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week).push(log);
  }

  return [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, wLogs]) => ({ week, avg1RM: avg1RM(wLogs) }))
    .filter(w => w.avg1RM !== null);
}

/**
 * Numara saptamanile consecutive de stagnare la final de serie.
 * Stagnare = crestere < 1% fata de saptamana precedenta.
 * @param {string} exerciseName
 * @param {Array} logs
 * @returns {{ stagnationWeeks: number, progression: Array }}
 */
export function detectStagnation(exerciseName, logs) {
  const progression = weeklyProgression(exerciseName, logs);
  if (progression.length < 2) return { stagnationWeeks: 0, progression };

  let consecutive = 0;
  // Walk backwards from latest week
  for (let i = progression.length - 1; i >= 1; i--) {
    const change = (progression[i].avg1RM - progression[i - 1].avg1RM) / progression[i - 1].avg1RM;
    if (change < 0.01) {
      consecutive++;
    } else {
      break;
    }
  }

  return { stagnationWeeks: consecutive, progression };
}

/**
 * Gaseste numarul maxim de saptamani de stagnare across all exercises.
 * @param {Array} logs
 * @returns {{ maxStagnationWeeks: number, byExercise: Object }}
 */
export function detectGlobalStagnation(logs) {
  if (!logs || logs.length === 0) return { maxStagnationWeeks: 0, byExercise: {} };

  const exercises = [...new Set(logs.map(l => l.ex).filter(Boolean))];
  const byExercise = {};
  let maxStagnationWeeks = 0;

  for (const ex of exercises) {
    const { stagnationWeeks } = detectStagnation(ex, logs);
    byExercise[ex] = stagnationWeeks;
    if (stagnationWeeks > maxStagnationWeeks) maxStagnationWeeks = stagnationWeeks;
  }

  return { maxStagnationWeeks, byExercise };
}
