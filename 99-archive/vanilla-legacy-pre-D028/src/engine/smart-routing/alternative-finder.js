// ══ SMART-ROUTING §36.37 — Alternative Finder ════════════════════════════════
// Tier 1 forta = alternatives DOAR cu force_demand: 'high' (strict).
// Tier 2/3 = flexibility ridicata (toate alternatives cu acelasi muscle_target_primary).

import { EXERCISE_METADATA, getValidAlternatives } from '../../schema/exerciseMetadata.js';

/**
 * Find ranked alternatives for an exercise. Default: skip if zero valid alternatives
 * (NU fortezi substitutie inferior — anti-paternalism per §36.37).
 *
 * @param {string} exerciseName
 * @returns {{ alternatives: { name: string, similarity: number }[], shouldSkip: boolean }}
 */
export function findAlternatives(exerciseName) {
  const meta = EXERCISE_METADATA[exerciseName];
  if (!meta) return { alternatives: [], shouldSkip: true };

  const validNames = getValidAlternatives(exerciseName);
  if (!validNames.length) return { alternatives: [], shouldSkip: true };

  // Rank by similarity: same muscle_target_primary > same equipment_type > same force_demand
  const ranked = validNames.map(altName => {
    const altMeta = EXERCISE_METADATA[altName];
    let similarity = 0;
    if (altMeta.muscle_target_primary === meta.muscle_target_primary) similarity += 3;
    if (altMeta.equipment_type === meta.equipment_type) similarity += 1;
    if (altMeta.force_demand === meta.force_demand) similarity += 2;
    return { name: altName, similarity };
  }).sort((a, b) => b.similarity - a.similarity);

  return { alternatives: ranked, shouldSkip: false };
}
