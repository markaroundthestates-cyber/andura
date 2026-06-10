// ══ F1 — IN-SESSION MANUAL-OVERRIDE DOWN ANCHOR (taste-defining 2026-06-10) ═══
//
// checkInSessionAdjust autoregulates around the RECOMMENDED load (recKg). When the
// user MANUALLY typed a load well BELOW the rec (Daniel live: rec 30, entered
// 20-25 across 4 sets) the coach kept re-prescribing 30 every set — the UP channel
// ("you beat the target") worked, but there was NO symmetric DOWN. A deliberate
// lower entry is the user telling us the rec is too heavy NOW, so we honor it
// WITHIN the session. The next-SESSION dp ease-back path (logs → recommend) is a
// separate, already-correct channel and is NOT touched by this.
//
// PURE + deterministic — the caller (dp.checkInSessionAdjust) injects the ladder
// helpers and turns the returned token into the localized message, keeping i18n +
// the prescription return shape in dp.js (consistent with the rest of that fn) and
// this module free of I/O. Gated at the caller on ctx.wasManualOverride so a path
// that does not pass it is byte-identical (legacy / engine-only tests).
//
// rating is read from the in-session RPE (INSESSION_RATING_TO_RPE): greu = 10
// (>= 9.5), potrivit = 7.5, usor = 6.5.

/**
 * Resolve the manual-override DOWN anchor for one rated set. Returns the FULL
 * checkInSessionAdjust result (so the caller is a 1-line `if (r) return r;`):
 *   - a DOWN adjust `{adjust:true, dir:'down', newKg, msg}` when we anchor lower,
 *   - a HOLD `{adjust:false}` when the override applies but resolves to keeping the
 *     rec (e.g. a lower load rated usor — no chase-down),
 *   - null when this is NOT a manual-override-DOWN situation (caller falls through
 *     to the normal rating branches → byte-identical legacy).
 *
 * Fires ONLY when the user explicitly overrode the prefill (wasManualOverride) AND
 * entered MORE than one ladder step below the rec, so an unedited prefill, a tiny
 * deviation, or an engine-driven value never trips it.
 *   - greu     → one ladder step BELOW the entered load.
 *   - potrivit → the entered load (snapped).
 *   - usor     → hold the rec.
 * getPrevWeight is floor-guarded (never below the ladder floor); the result is only
 * ever a DOWN from rec (a snap that would not be below rec degrades to a hold).
 *
 * @param {Object} args
 * @param {boolean} args.wasManualOverride  user typed this set's load (vs prefill)
 * @param {boolean} args.haveRec            a valid recKg/recReps was supplied
 * @param {number}  args.loggedKg           the load actually logged this set
 * @param {number}  args.recKg              the load recommended for this set
 * @param {number}  args.lastRPE            in-session RPE of the rated set
 * @param {string}  args.ex                 engine exercise name (ladder identity)
 * @param {Object}  helpers
 * @param {(kg:number, ex:string)=>number} helpers.getPrevWeight  ladder step-down
 * @param {(kg:number, ex:string)=>number} helpers.roundToStep    ladder snap
 * @param {(key:string, vars:object)=>string} helpers.t           i18n translator
 * @returns {({adjust:boolean, dir?:string, newKg?:number, msg?:string})|null}
 */
export function manualOverrideDownTarget(
  { wasManualOverride, haveRec, loggedKg, recKg, lastRPE, ex },
  { getPrevWeight, roundToStep, t },
) {
  if (wasManualOverride !== true || !haveRec) return null;
  const logged = Number(loggedKg);
  const rec = Number(recKg);
  if (!(logged > 0) || !(rec > 0)) return null;
  // Entered strictly MORE than one ladder step below the rec (getPrevWeight(rec) is
  // rec minus one snapped step). Equal/closer → not an override-down, fall through.
  if (!(logged < getPrevWeight(rec, ex))) return null;

  const down = (kg, key) => ({ adjust: true, dir: 'down', newKg: kg, msg: t(`workout.adjust.${key}`, { kg }) });
  const HOLD = { adjust: false };
  if (lastRPE <= 6.5) return HOLD; // found the lower load EASY → keep the rec

  if (lastRPE >= 9.5) {
    const eased = getPrevWeight(logged, ex); // one step below the entered load
    if (eased < logged) return down(eased, 'greuWeight');
    const snapped = roundToStep(logged, ex); // already at the floor → snap to entered
    return snapped < rec ? down(snapped, 'greuWeight') : HOLD;
  }
  // POTRIVIT at a lower load → anchor the next set's target to what they did.
  const snapped = roundToStep(logged, ex);
  return snapped < rec ? down(snapped, 'potrivitWeight') : HOLD;
}
