// ══ MOAT "why?" (#56) — engine status → plain-RO i18n key (flag dp_moat_why_v1)
// Maps the engine's REAL per-exercise decision status — PlannedExercise.recReason
// .status (F5-W0), the machine enum getSmartRecommendation already computed — to a
// plain, jargon-free i18n KEY under `why.reason.*`. This is the moat's truth-gate:
// the "why?" the user taps is the engine's ACTUAL branch for THIS exercise this
// session, never a kg-vs-last re-guess.
//
// MINIMALISM (Daniel LOCK 2026-06-08 §5) + GIGEL rule: one sentence, ON TAP, never
// pushed. The i18n copy carries ZERO jargon (no RPE/RIR/e1RM/1RM/MEV) — a {kg}
// number is allowed (a number is not jargon) but is interpolated by the caller only
// when the key needs it. This module returns the KEY; the engine's own hardcoded
// progressionNote is NEVER printed directly (i18n-leak rule).
//
// Unmapped / absent status → null → the caller degrades to the honest fallback
// ladder (categorical summary, then why.unavailable). Never invents a reason.

/**
 * Normalize a raw engine status (e.g. 'EASE BACK', 'STAGNANT +SET') to an i18n
 * key under `why.reason.*`. Returns null for an absent / unknown status so the
 * caller can fall back honestly.
 *
 * @param status the engine's machine status enum (recReason.status)
 */
export function whyForStatus(status: string | null | undefined): string | null {
  if (typeof status !== 'string' || status.trim() === '') return null;
  const key = WHY_REASON_KEY[status.trim().toUpperCase()];
  return key ?? null;
}

// Every status the engine can emit (dp.js status enum) → one why.reason.* key.
// CATCH UP folds into INCREASE's "climbing toward your real weight" framing;
// ON TARGET / PEAK / CAP REPS / CAP share the "sweet spot, hold and build" framing
// (CAP = the over-cap clamp dp.js emits when working load hits its ceiling);
// TECHNIQUE / SCALE BACK share the "one step back for two forward" framing.
const WHY_REASON_KEY: Readonly<Record<string, string>> = {
  INCREASE: 'why.reason.increase',
  'CATCH UP': 'why.reason.catchUp',
  'EASE BACK': 'why.reason.easeBack',
  CONSOLIDATE: 'why.reason.consolidate',
  INIT: 'why.reason.init',
  MAINTAIN: 'why.reason.maintain',
  'ON TARGET': 'why.reason.onTarget',
  PEAK: 'why.reason.onTarget',
  'CAP REPS': 'why.reason.onTarget',
  CAP: 'why.reason.onTarget',
  'STAGNANT +SET': 'why.reason.stagnantSet',
  TECHNIQUE: 'why.reason.technique',
  'SCALE BACK': 'why.reason.technique',
};

/** The set of distinct why.reason.* keys (for the no-jargon ban test). */
export const WHY_REASON_KEYS: readonly string[] = Array.from(
  new Set(Object.values(WHY_REASON_KEY)),
);
