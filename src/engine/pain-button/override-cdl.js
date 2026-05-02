// ══ PAIN BUTTON §36.38 — CDL Override Flag ═══════════════════════════════════
// LOCKED V1 — F2 SUFLET respected (AI-ul informează, nu impune).
// Logged ca user_override_pain_redflag pentru audit, NU blocking.

/**
 * Build CDL audit entry for pain-related override.
 * @param {{ exerciseName: string, painKey: string, userOverride: boolean }} ctx
 * @returns {{ user_override_pain_redflag: boolean, exerciseName: string, painKey: string, ts: number }}
 */
export function buildOverrideAuditEntry(ctx) {
  return {
    user_override_pain_redflag: !!ctx.userOverride,
    exerciseName: ctx.exerciseName,
    painKey: ctx.painKey,
    ts: Date.now(),
  };
}
