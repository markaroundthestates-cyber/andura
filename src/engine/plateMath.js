// ══ PLATE MATH — barbell loading hint (Daniel-approved proposal 2026-06-10) ══
// "70 kg" on a barbell is not actionable on the gym floor — the lifter needs
// "bar 20 + 25/side". Pure, deterministic, zero-cost. SCOPE v1 (deliberate):
// ONLY equipment_type 'barbell'. Smith bars vary per gym (15-20kg, often
// counterweighted) and stack machines already show their pin number — a wrong
// hint is worse than none, so those stay out until a per-gym bar-weight setting
// exists. Only EXACT decompositions are returned (a load that standard plates
// cannot hit exactly → null → the UI shows nothing rather than lying).

export const BARBELL_BAR_KG = 20; // standard Olympic bar
// Standard plate denominations (kg), descending for greedy decomposition.
export const PLATE_DENOMS = Object.freeze([25, 20, 15, 10, 5, 2.5, 1.25]);

/**
 * Decompose a total barbell load into per-side plates.
 *
 * @param {number} totalKg — the full load INCLUDING the bar
 * @param {number} [barKg=20]
 * @returns {{ barKg: number, perSide: number[] } | null}
 *   perSide = plate list for ONE side, heaviest first ([] = bar only).
 *   null = not representable (below bar / non-finite / no exact plate combo).
 */
export function platesPerSide(totalKg, barKg = BARBELL_BAR_KG) {
  const total = Number(totalKg);
  if (!Number.isFinite(total) || total < barKg) return null;
  // Work in 1/4-kg integer units so 1.25/2.5 plates stay exact (no float drift).
  let rem = Math.round((total - barKg) * 2) / 2 / 2; // per-side kg, snapped to 0.25
  if (Math.abs((total - barKg) / 2 - rem) > 1e-9) return null; // not a 0.25 grid load
  const perSide = [];
  for (const p of PLATE_DENOMS) {
    while (rem >= p - 1e-9) {
      perSide.push(p);
      rem = Math.round((rem - p) * 4) / 4;
    }
  }
  if (rem > 1e-9) return null; // residue smaller than the smallest plate → no exact combo
  return { barKg, perSide };
}

// (i18n formatting lives in the UI layer — Workout builds the hint string via
// t('workout.plateHint'/{bar,plates}) from this decomposition. Engine stays pure.)
