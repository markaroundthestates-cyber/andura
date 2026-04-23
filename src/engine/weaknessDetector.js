// ══ WEAKNESS DETECTOR — Brzycki 1RM per muscle group ════════════════════
// Calculează 1RM estimat (formula Brzycki) pentru fiecare grupă musculară
// și identifică grupele cu 1RM relativ cel mai scăzut față de restul.

import { EXERCISE_MUSCLES } from './muscleMap.js';

/**
 * Brzycki formula: 1RM = weight × (36 / (37 - reps))
 * Valid pentru reps 1-10. Returneaza null dacă reps > 12.
 */
export function brzycki1RM(weight, reps) {
  if (!weight || !reps || reps < 1 || reps > 12) return null;
  return weight * (36 / (37 - reps));
}

function _headToGroup(head) {
  if (!head) return null;
  if (/chest/.test(head)) return 'chest';
  if (/delt/.test(head)) return 'shoulders';
  if (/tri/.test(head)) return 'triceps';
  if (/bi_/.test(head)) return 'biceps';
  if (/lat|trap|rear_delt/.test(head)) return 'back';
  if (/quad|hamstring|glute|calf/.test(head)) return 'legs';
  if (/lower_back|core/.test(head)) return 'core';
  return null;
}

/**
 * Găsește ultima intrare per exercițiu din logs.
 * Suportă câmpurile ex/exercise, w/weight, reps.
 */
function getLastLogPerExercise(logs) {
  const byEx = new Map();
  for (const log of logs) {
    const ex = log.ex ?? log.exercise;
    if (!ex) continue;
    if (!byEx.has(ex)) byEx.set(ex, log);
  }
  return byEx;
}

/**
 * Rezolvă grupa musculară pentru un exercițiu.
 * MUSCLE_MAP: { exerciseName: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' }
 */
function resolveGroup(exerciseName) {
  if (!exerciseName) return null;
  const lower = exerciseName.toLowerCase();
  // Check EXERCISE_MUSCLES for primary muscle head → map to broad group
  for (const [exName, muscles] of Object.entries(EXERCISE_MUSCLES ?? {})) {
    if (lower === exName.toLowerCase() && muscles.primary?.length > 0) {
      return _headToGroup(muscles.primary[0]);
    }
  }
  // Fallback: keyword heuristics
  if (/bench|chest|pec|fly/i.test(lower)) return 'chest';
  if (/row|pull|lat|cable/i.test(lower)) return 'back';
  if (/shoulder|press.*overhead|ohp|lateral|delt/i.test(lower)) return 'shoulders';
  if (/curl|bicep/i.test(lower)) return 'biceps';
  if (/tricep|pushdown|extension|dip/i.test(lower)) return 'triceps';
  if (/squat|leg|lunge|rdl|deadlift|glute/i.test(lower)) return 'legs';
  if (/plank|crunch|ab|core/i.test(lower)) return 'core';
  return null;
}

/**
 * Calculează 1RM mediu per grupă musculară.
 * @param {Array} logs
 * @returns {Map<string, number>} group → avg1RM
 */
export function compute1RMByGroup(logs) {
  const lastPerEx = getLastLogPerExercise(logs);
  const byGroup = new Map();

  for (const [ex, log] of lastPerEx) {
    const group = resolveGroup(ex);
    if (!group) continue;
    const w = log.w ?? log.weight;
    const r = parseInt(log.reps, 10) || log.reps;
    const orm = brzycki1RM(w, r);
    if (!orm) continue;
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push(orm);
  }

  const result = new Map();
  for (const [group, orms] of byGroup) {
    result.set(group, orms.reduce((a, b) => a + b, 0) / orms.length);
  }
  return result;
}

/**
 * Identifică grupele slabe: cele cu 1RM relativ < 80% din media celorlalte.
 * @param {Array} logs
 * @returns {{ weakGroups: string[], byGroup: Object, ratio: Object }}
 */
export function detectWeakGroups(logs) {
  if (!logs || logs.length === 0) return { weakGroups: [], byGroup: {}, ratio: {} };

  const orm1RMByGroup = compute1RMByGroup(logs);
  if (orm1RMByGroup.size < 2) return { weakGroups: [], byGroup: Object.fromEntries(orm1RMByGroup), ratio: {} };

  const values = [...orm1RMByGroup.values()];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const weakGroups = [];
  const ratio = {};

  for (const [group, orm] of orm1RMByGroup) {
    const r = avg > 0 ? orm / avg : 1;
    ratio[group] = parseFloat(r.toFixed(3));
    if (r < 0.8) weakGroups.push(group);
  }

  // Sort weakest first
  weakGroups.sort((a, b) => ratio[a] - ratio[b]);

  return {
    weakGroups,
    byGroup: Object.fromEntries(orm1RMByGroup),
    ratio,
    average1RM: avg,
  };
}
