// ══ F1 — IN-SESSION MANUAL-OVERRIDE RECALIBRATION (taste-defining) ═══════════
//
// checkInSessionAdjust autoregulates around the RECOMMENDED load (recKg). When the
// user MANUALLY types a load that DIFFERS from the rec, that entry is the user
// telling us the rec is wrong NOW — the coach must recalibrate the NEXT set's
// target to what they actually did, in BOTH directions:
//
//   • LOWER  (entered < rec)  — a deliberate lighter entry → ANCHOR the next set
//     to the entered load (the rec was too heavy now). greu may step one rung
//     UNDER it; potrivit anchors at it; usor at a lower load holds the rec
//     (no chase-down — they had headroom).
//   • HIGHER (entered > rec)  — a deliberate heavier entry rated on CAPACITY.
//     Comparing kg and reps SEPARATELY is the sticky bug (Daniel live: Bayesian
//     14kg "usor" but only 9 of 11 reps → the old usor branch saw 9<11 and HELD;
//     BB Shrug 50→60→70 all "potrivit" → the old potrivit branch held the rec).
//     We compare e1RM(entered set) vs e1RM(rec set): when the demonstrated e1RM
//     clears the rec's by a margin AND the set was not greu, the user has proven
//     capacity above the rec → step the next set UP, anchored at the entered load.
//
// WHY here (not the generic rating branches): the generic greu/usor/potrivit
// branches in dp.js key the WEIGHT move on `dpState.lastW > 0` — the PERSISTED
// prior-session working load, which is 0 all session for a cold-start exercise
// (per-set logs are only persisted at session-finish). So a brand-new exercise
// the user is overriding (Seated DB Press, Straight-Arm Lat Pulldown, BB Shrug —
// all cold-start in the live logs) can never move its weight through those
// branches; it falls to a rep-trim or a flat hold. This module reasons off the
// load the user JUST LOGGED (loggedKg) instead of the empty history, so the
// override is honored even on the very first session of a lift.
//
// PURE + deterministic — the caller (dp.checkInSessionAdjust) injects the ladder
// + e1RM helpers and turns the returned token into the localized message, keeping
// i18n + the prescription return shape in dp.js and this module free of I/O. Gated
// at the caller on ctx.wasManualOverride so a path that does not pass it is
// byte-identical (legacy / engine-only tests).
//
// rating is read from the in-session RPE (INSESSION_RATING_TO_RPE): greu = 10
// (>= 9.5), potrivit = 7.5, usor = 6.5.

// e1RM margin (entered set's e1RM must clear the rec set's by this factor for the
// UP path to fire). 1.10 = a clear 10% capacity surplus — a noise band that keeps
// a near-equal heavier entry (a single extra plate) from yo-yoing the target up.
const E1RM_UP_MARGIN = 1.10;

/**
 * Resolve the manual-override DOWN anchor for one rated set (LEGACY shape, kept
 * for the existing inSessionOverride callers/tests — byte-identical behavior).
 * See manualOverrideTarget for the unified bidirectional resolver the live caller
 * now uses; this remains the DOWN-only half.
 *
 * Returns the FULL checkInSessionAdjust result (so the caller is a 1-line
 * `if (r) return r;`):
 *   - a DOWN adjust `{adjust:true, dir:'down', newKg, msg}` when we anchor lower,
 *   - a HOLD `{adjust:false}` when the override applies but resolves to keeping the
 *     rec (e.g. a lower load rated usor — no chase-down),
 *   - null when this is NOT a manual-override-DOWN situation (caller falls through).
 *
 * Fires ONLY when the user explicitly overrode the prefill (wasManualOverride) AND
 * entered MORE than one ladder step below the rec.
 *   - greu     → one ladder step BELOW the entered load.
 *   - potrivit → the entered load (snapped).
 *   - usor     → hold the rec.
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

/**
 * Unified bidirectional manual-override resolver (DOWN-anchor + UP-on-capacity).
 * Returns the FULL checkInSessionAdjust result, or null when no override applies
 * (caller falls through to the legacy rating branches → byte-identical).
 *
 * Direction is read from the entered-vs-rec relationship, NOT from `dpState.lastW`
 * (which is empty all session on a cold-start lift):
 *
 *   • entered < one ladder step below rec  → delegate to the DOWN anchor above
 *     (greu steps under / potrivit anchors / usor holds).
 *   • entered ≥ rec, rating ≠ greu, and e1RM(entered) ≥ e1RM(rec) × E1RM_UP_MARGIN
 *     → UP: anchor the next set at the entered load, snapped up one ladder rung
 *     when the entered load equals the rec (so a heavier-FELT-easy genuinely
 *     progresses), capped at one rung above the entered load (anti-yo-yo). The
 *     e1RM comparison fixes the "kg-and-reps judged separately" sticky bug: a set
 *     of 14×9 (more load, fewer reps) can still out-e1RM a 9×11 rec → UP.
 *   • otherwise (heavier-but-greu, or capacity not cleared) → null (fall through;
 *     a heavier-and-greu set is left to the generic greu ease branch).
 *
 * Never urcă pe greu. The UP step is bounded to ≤ one rung above the entered load,
 * matching how the rest of the engine moves (getNextWeight), so no single rated
 * set can jump the target more than one ladder step (anti-yo-yo).
 *
 * @param {Object} args
 * @param {boolean} args.wasManualOverride
 * @param {boolean} args.haveRec
 * @param {number}  args.loggedKg
 * @param {number}  args.loggedReps   reps performed this set (for entered e1RM)
 * @param {number}  args.recKg
 * @param {number}  args.recReps      rec rep target (for rec e1RM)
 * @param {number}  args.lastRPE
 * @param {string}  args.ex
 * @param {Object}  helpers
 * @param {(kg:number, ex:string)=>number} helpers.getPrevWeight
 * @param {(kg:number, ex:string)=>number} helpers.getNextWeight  ladder step-up
 * @param {(kg:number, ex:string)=>number} helpers.roundToStep
 * @param {(w:number, reps:number, rpe:number, ex:string)=>(number|null)} helpers.e1RMForSet
 * @param {(key:string, vars:object)=>string} helpers.t
 * @returns {({adjust:boolean, dir?:string, newKg?:number, msg?:string})|null}
 */
export function manualOverrideTarget(
  { wasManualOverride, haveRec, loggedKg, loggedReps, recKg, recReps, lastRPE, ex },
  { getPrevWeight, getNextWeight, roundToStep, e1RMForSet, t },
) {
  if (wasManualOverride !== true || !haveRec) return null;
  const logged = Number(loggedKg);
  const rec = Number(recKg);
  if (!(logged > 0) || !(rec > 0)) return null;

  // LOWER override → the existing DOWN anchor (unchanged semantics).
  const down = manualOverrideDownTarget(
    { wasManualOverride, haveRec, loggedKg, recKg, lastRPE, ex },
    { getPrevWeight, roundToStep, t },
  );
  if (down) return down;

  // From here: entered is NOT more than one step below rec (it's ≥ rec, or within
  // one step of it). Only the UP-on-capacity path remains.
  if (lastRPE >= 9.5) return null;          // never urcă pe greu — leave to ease branch
  if (!(logged >= rec)) return null;        // within-a-step-below but not below → no signal, hold via legacy

  // Need both e1RMs to compare capacity. Missing reps / e1RM-ineligible lift →
  // no capacity read → fall through (byte-identical legacy).
  const reps = Number(loggedReps);
  const recR = Number(recReps);
  if (!(reps > 0) || !(recR > 0)) return null;
  if (typeof e1RMForSet !== 'function') return null;
  const eEntered = e1RMForSet(logged, reps, lastRPE, ex);
  const eRec = e1RMForSet(rec, recR, 7.5, ex);   // rec set at the potrivit working target
  if (!(eEntered > 0) || !(eRec > 0)) return null;

  // Demonstrated capacity must clear the rec's by the margin → genuine surplus.
  if (!(eEntered >= eRec * E1RM_UP_MARGIN)) return null;

  // Anchor at the entered load; if they entered exactly the rec, step one rung up
  // so a heavier-FELT-easy actually progresses. Cap at one rung above entered
  // (anti-yo-yo: a single set never moves the target more than one ladder step).
  const ceil = getNextWeight(logged, ex);
  let newKg = roundToStep(logged, ex);
  if (newKg <= rec) newKg = getNextWeight(rec, ex);
  if (ceil > 0 && newKg > ceil) newKg = ceil;
  if (!(newKg > rec)) return null;          // nothing to raise → fall through to legacy
  return { adjust: true, dir: 'up', newKg, msg: t('workout.adjust.usorWeight', { kg: newKg }) };
}
