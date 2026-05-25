// ══ WEAKNESS DETECTOR — Brzycki 1RM per muscle group ════════════════════
// Calculeaza 1RM estimat (formula Brzycki) pentru fiecare grupa musculara
// si identifica grupele cu 1RM relativ cel mai scazut fata de restul.
//
// Brzycki vs Epley choice: see ADR-ENGINE-MATH-LOCKED-VALUES §1. Brzycki
// linear-in-reps, accuracy zone 1-10 reps (Brzycki 1993); Andura targets
// gym lifters intermediate range (5-12 reps typical hypertrophy/strength).
// Citation: Brzycki, M. (1993). "Strength testing—predicting a one-rep max
// from reps-to-fatigue." J Phys Ed Recreation & Dance 64(1): 88-90.

import { EXERCISE_MUSCLES } from './muscleMap.js';

/**
 * Brzycki formula: 1RM = weight × (36 / (37 - reps))
 *
 * Valid pentru reps 1-12 (per Brzycki 1993 accuracy zone + Mayhew reviewer
 * convergence). Returneaza null daca reps outside [1, 12] OR weight/reps
 * falsy/undefined. Edge case reps=37 (divisor zero) impossible per pre-guard.
 *
 * Cross-ref: ADR-ENGINE-MATH-LOCKED-VALUES §1.
 *
 * @param {number | undefined} weight
 * @param {number | undefined} reps
 */
export function brzycki1RM(weight, reps) {
  if (!weight || !reps || reps < 1 || reps > 12) return null;
  return weight * (36 / (37 - reps));
}

// Big 11 canonical V1 per ADR_ENGINE_REFACTOR §4.2 LOCK V1 + ADR_ANATOMICAL_CLASSIFICATION_V1 §2 LOCK V1.
// Returns one of: piept|spate|umeri|biceps|triceps|antebrate|core|picioare-quads|picioare-hamstrings|fese|gambe.
/** @param {string | null | undefined} head */
function _headToGroup(head) {
  if (!head) return null;
  if (/chest/.test(head)) return 'piept';
  if (/delt|rear_delt_trap/.test(head)) return 'umeri';
  if (/^tri/.test(head)) return 'triceps';
  if (/^bi_/.test(head)) return 'biceps';
  if (/lat|mid_trap|lower_back/.test(head)) return 'spate';
  if (/quad/.test(head)) return 'picioare-quads';
  if (/hamstring/.test(head)) return 'picioare-hamstrings';
  if (/glute/.test(head)) return 'fese';
  if (/calf/.test(head)) return 'gambe';
  if (/forearm|wrist|grip/.test(head)) return 'antebrate';
  if (/core/.test(head)) return 'core';
  return null;
}

/**
 * Gaseste ultima intrare per exercitiu din logs (cea cu ts maxim).
 * Suporta campurile ex/exercise, w/weight, reps, ts.
 * E-05: pastreaza intrarea cu ts maxim per exercitiu — robust indiferent de
 * ordinea logs (anterior pastra prima aparitie, presupunand ordine most-recent-
 * first nedocumentata; ordine oldest-first ar fi selectat date stale).
 * @param {Array<{ex?: string, w?: number, reps?: number | string, ts?: number}>} logs
 */
function getLastLogPerExercise(logs) {
  /** @type {Map<string, {ex?: string, w?: number, reps?: number | string, ts?: number}>} */
  const byEx = new Map();
  for (const log of logs) {
    const ex = log.ex;
    if (!ex) continue;
    const existing = byEx.get(ex);
    if (!existing) {
      byEx.set(ex, log);
      continue;
    }
    const ts = Number.isFinite(log.ts) ? /** @type {number} */ (log.ts) : -Infinity;
    const existingTs = Number.isFinite(existing.ts) ? /** @type {number} */ (existing.ts) : -Infinity;
    if (ts > existingTs) byEx.set(ex, log);
  }
  return byEx;
}

/**
 * Rezolva grupa musculara pentru un exercitiu (Big 11 canonical V1).
 * Output: piept|spate|umeri|biceps|triceps|antebrate|core|picioare-quads|picioare-hamstrings|fese|gambe.
 * Per ADR_ENGINE_REFACTOR §4.2 LOCK V1 + ADR_ANATOMICAL_CLASSIFICATION_V1 §2 LOCK V1.
 * @param {string | null | undefined} exerciseName
 */
function resolveGroup(exerciseName) {
  if (!exerciseName) return null;
  const lower = exerciseName.toLowerCase();
  const exMap = /** @type {Record<string, {primary?: string[], secondary?: string[]}>} */ (EXERCISE_MUSCLES ?? {});
  // Check EXERCISE_MUSCLES for primary muscle head → map to Big 11 group
  for (const [exName, muscles] of Object.entries(exMap)) {
    if (lower === exName.toLowerCase() && (muscles.primary?.length ?? 0) > 0) {
      return _headToGroup(muscles.primary?.[0]);
    }
  }
  // Fallback keyword heuristics Big 11 — PRIORITY ORDER mandatory (antebrate + fese ÎNAINTE biceps/legs broad to avoid mis-classification)
  if (/wrist|forearm|grip|farmer|fat grip|hammer hold/i.test(lower)) return 'antebrate';
  if (/hip thrust|glute|sumo|bulgarian|kickback|hip abduction/i.test(lower)) return 'fese';
  if (/calf|heel raise|tibialis/i.test(lower)) return 'gambe';
  if (/leg curl|nordic|good morning|rdl|romanian deadlift|hamstring/i.test(lower)) return 'picioare-hamstrings';
  if (/squat|leg extension|leg press|lunge|sissy|step-up|pistol|wall sit/i.test(lower)) return 'picioare-quads';
  if (/bench|chest|pec|fly/i.test(lower)) return 'piept';
  if (/row|pull|lat|chin-up|pulldown/i.test(lower)) return 'spate';
  if (/shoulder|overhead.*press|press.*overhead|\bohp\b|lateral raise|front raise|rear delt|arnold/i.test(lower)) return 'umeri';
  if (/curl|bicep/i.test(lower)) return 'biceps';
  if (/tricep|pushdown|skull|extension overhead|dip|french press/i.test(lower)) return 'triceps';
  if (/plank|crunch|\bab\b|core|dead bug|bird dog|hollow|wood ?chop|pallof|sit-up|russian twist|leg raise|toes-to-bar|l-sit/i.test(lower)) return 'core';
  return null;
}

/**
 * Calculeaza 1RM mediu per grupa musculara.
 * @param {Array<{ex?: string, w?: number, reps?: number | string}>} logs
 * @returns {Map<string, number>} group → avg1RM
 */
export function compute1RMByGroup(logs) {
  const lastPerEx = getLastLogPerExercise(logs);
  /** @type {Map<string, number[]>} */
  const byGroup = new Map();

  for (const [ex, log] of lastPerEx) {
    const group = resolveGroup(ex);
    if (!group) continue;
    const w = log.w;
    const r = typeof log.reps === 'string' ? parseInt(log.reps, 10) : log.reps;
    const orm = brzycki1RM(w, r);
    if (!orm) continue;
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group)?.push(orm);
  }

  /** @type {Map<string, number>} */
  const result = new Map();
  for (const [group, orms] of byGroup) {
    result.set(group, orms.reduce((a, b) => a + b, 0) / orms.length);
  }
  return result;
}

/**
 * Identifica grupele slabe: cele cu 1RM relativ < 80% din media celorlalte.
 * @param {Array<{ex?: string, w?: number, reps?: number | string}>} logs
 * @returns {{ weakGroups: string[], byGroup: Record<string, number>, ratio: Record<string, number>, average1RM?: number }}
 */
export function detectWeakGroups(logs) {
  if (!logs || logs.length === 0) return { weakGroups: [], byGroup: {}, ratio: {} };

  const orm1RMByGroup = compute1RMByGroup(logs);
  if (orm1RMByGroup.size < 2) return { weakGroups: [], byGroup: Object.fromEntries(orm1RMByGroup), ratio: {} };

  const values = [...orm1RMByGroup.values()];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  /** @type {string[]} */
  const weakGroups = [];
  /** @type {Record<string, number>} */
  const ratio = {};

  for (const [group, orm] of orm1RMByGroup) {
    const r = avg > 0 ? orm / avg : 1;
    const rounded = parseFloat(r.toFixed(3));
    ratio[group] = rounded;
    if (rounded < 0.8) weakGroups.push(group); // use rounded to avoid float precision mismatches
  }

  // Sort weakest first
  weakGroups.sort((a, b) => (ratio[a] ?? 0) - (ratio[b] ?? 0));

  return {
    weakGroups,
    byGroup: Object.fromEntries(orm1RMByGroup),
    ratio,
    average1RM: avg,
  };
}
