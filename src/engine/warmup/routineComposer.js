// Cluster B2+B3 — Routine composition Hybrid 1-2 general + 2-3 specific muscle
// group prep per ADR 026 §9.7.2 verbatim.
//
// B2 Source 1 §65.2 Option C verbatim: Hybrid 1-2 general full-body mobility +
//    2-3 specific muscle group exercises (NU general only insufficient prep, NU
//    muscle-specific only cold start problematic).
//
// Cluster D4 Specialization weak group prioritize cross-ref §9.6 Hook:
//    Warm-up serves Specialization weak group (PARALLEL modifier precedent
//    Q11=B — Warm-up serves Specialization NU compete). Specialization weak
//    group included specific sets prioritized.
//
// V1 = text-only RO native exercise labels (NU GIF NU video — consistent §9.5
// Tempo E16 Q16 GIF REJECTED pre-Beta storage PWA + copyright + Gigel test).
//
// Pure functions — no side effects.

import {
  ROUTINE_TYPE,
  GENERAL_DYNAMIC_EXERCISES,
  SPECIFIC_MUSCLE_EXERCISES,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Select general dynamic warm-up exercises subset per Cluster B2 verbatim.
 *
 * V1 deterministic selection — first N from canonical pool ordered (Cluster B3
 * persona variations apply via duration modifier upstream, NU exercise selection
 * variance V1; future v1.5+ candidate per §9.7.6 Reconsideration Trigger 2).
 *
 * @param {number} setsCount   - 1-2 SCHEMA_CONSTANTS.generalSetsMin..Max
 * @returns {ReadonlyArray<string>}
 */
export function selectGeneralExercises(setsCount) {
  const n = Number.isFinite(setsCount)
    ? Math.max(SCHEMA_CONSTANTS.generalSetsMin,
        Math.min(SCHEMA_CONSTANTS.generalSetsMax, setsCount))
    : SCHEMA_CONSTANTS.generalSetsMin;
  return Object.freeze(GENERAL_DYNAMIC_EXERCISES.slice(0, n));
}

/**
 * Select specific muscle group warm-up exercises per Cluster B2 + D4 cross-ref.
 *
 * Algorithm:
 *   1. Resolve target muscle groups from session ctx (orchestrator passes list
 *      din workout primary muscles).
 *   2. Cluster D4 cross-ref §9.6: dacă Specialization weak group active →
 *      prioritize weak group în specific sets (top-1 priority queue).
 *   3. Select specific exercises pe target groups, capped la setsCount
 *      (specificSetsMin..Max = 2-3).
 *
 * Defensive fallback când targetMuscleGroups empty → return general fallback
 * 1 specific exercise (preserve total function).
 *
 * @param {Object} input
 * @param {ReadonlyArray<string>} [input.targetMuscleGroups]   - From orchestrator session ctx
 * @param {string|null} [input.weakGroup]                      - From Specialization §9.6 Hook D4
 * @param {number} [input.setsCount]                           - 2-3 default
 * @returns {{exercises: ReadonlyArray<string>, prioritizedGroup: string|null, groupsUsed: ReadonlyArray<string>}}
 */
export function selectSpecificExercises({ targetMuscleGroups, weakGroup, setsCount }) {
  const targetGroups = Array.isArray(targetMuscleGroups)
    ? targetMuscleGroups.filter((g) => typeof g === 'string')
    : [];
  const weak = typeof weakGroup === 'string' ? weakGroup.toLowerCase() : null;

  const n = Number.isFinite(setsCount)
    ? Math.max(SCHEMA_CONSTANTS.specificSetsMin,
        Math.min(SCHEMA_CONSTANTS.specificSetsMax, setsCount))
    : SCHEMA_CONSTANTS.specificSetsMin;

  // Cluster D4 — Specialization weak group prioritize first when present
  const orderedGroups = [];
  if (weak && targetGroups.includes(weak)) {
    orderedGroups.push(weak);
  } else if (weak && SPECIFIC_MUSCLE_EXERCISES[weak]) {
    // Weak group not în today's primary but Specialization active → still prioritize
    orderedGroups.push(weak);
  }
  for (const g of targetGroups) {
    const lower = g.toLowerCase();
    if (!orderedGroups.includes(lower) && SPECIFIC_MUSCLE_EXERCISES[lower]) {
      orderedGroups.push(lower);
    }
  }

  // Defensive fallback: NO target groups + NO weak group → empty specific sets
  if (orderedGroups.length === 0) {
    return {
      exercises:        Object.freeze([]),
      prioritizedGroup: null,
      groupsUsed:       Object.freeze([]),
    };
  }

  const groupsUsed = orderedGroups.slice(0, n);
  const exercises = groupsUsed.map((g) => SPECIFIC_MUSCLE_EXERCISES[g]).filter(Boolean);

  return {
    exercises:        Object.freeze(exercises),
    prioritizedGroup: weak && groupsUsed[0] === weak ? weak : null,
    groupsUsed:       Object.freeze(groupsUsed),
  };
}

/**
 * Compose full warm-up routine per Cluster B2+B3 Hybrid + D4 weak group.
 *
 * V1 = 'hybrid' routine type LOCKED Q65.2 Option C (NU general only NU specific
 * only). Future v1.5+ candidate: tier-aware adaptive routine type per §9.7.6
 * Reconsideration Trigger 2.
 *
 * @param {Object} input
 * @param {ReadonlyArray<string>} [input.targetMuscleGroups]   - From orchestrator
 * @param {string|null} [input.weakGroup]                      - From §9.6 Specialization Hook D4
 * @param {number} [input.generalSetsCount]                    - Default min (1)
 * @param {number} [input.specificSetsCount]                   - Default min (2)
 * @returns {import('./types.js').RoutineDecision}
 */
export function composeRoutine({
  targetMuscleGroups,
  weakGroup,
  generalSetsCount,
  specificSetsCount,
}) {
  const generalSets = selectGeneralExercises(
    generalSetsCount ?? SCHEMA_CONSTANTS.generalSetsMin,
  );
  const specific = selectSpecificExercises({
    targetMuscleGroups,
    weakGroup,
    setsCount: specificSetsCount ?? SCHEMA_CONSTANTS.specificSetsMin,
  });

  const rationale = specific.prioritizedGroup
    ? `hybrid_routine_q65_2_specialization_weak_group_${specific.prioritizedGroup}_prioritized_d4_hook`
    : 'hybrid_routine_q65_2_general_plus_specific_muscle_group_prep';

  return {
    routineType:           ROUTINE_TYPE.HYBRID,
    generalSetsCount:      generalSets.length,
    generalSets,
    specificSetsCount:     specific.exercises.length,
    specificSets:          specific.exercises,
    targetMuscleGroups:    specific.groupsUsed,
    weakGroupPrioritized:  specific.prioritizedGroup,
    rationale,
  };
}
