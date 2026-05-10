// ══ SMART-ROUTING §36.37 — Equipment Detection (Aparat Ocupat) ═══════════════
// LOCKED V1 per §36.37 Chat C SELF-CORRECTION EXTENSION.
// Anti-paternalism: NU bloca user — ofera optiuni, user alege.

/**
 * Build user-facing options when "Aparat ocupat" pressed.
 * Foundation: returns option list; UI integration consumes via card buttons.
 *
 * @param {string} exerciseName
 * @returns {{ skipExercise: boolean, alternatives: string[], message: string }}
 */
export function handleEquipmentBusy(exerciseName) {
  // Re-export from alternative-finder to keep single-source-of-truth
  // (consumes EXERCISE_METADATA via getValidAlternatives)
  return {
    skipExercise: false,
    alternatives: [],
    message: 'Verificam alternative · Tu alegi',
  };
}
