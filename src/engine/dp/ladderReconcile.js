// ══ CYCLE-10 LADDER-SNAP RECONCILE — real-ladder vs generic-ladder seam ════════
// dp.recommend picks the next/prev rung on the GENERIC ladder (getNextWeight/
// getPrevWeight over EQUIPMENT_WEIGHTS) and bakes the progression note from THAT
// value, then snaps the FINAL kg onto the REAL pin stack / user ladder via
// roundToStep (realMachineStacks + per-user ladder, under dp_real_ladder_snap_v1 +
// dp_user_ladder_v1). When the two ladders disagree two defects surface:
//
//   C1 (ease/climb collapse) — a generic down-step (Cable Row 42 -> generic 40) can
//   re-snap UP onto the SAME real rung (40 -> 42 on the 6..90 stack), so the ease
//   silently no-ops AND the note (frozen from the pre-snap 40) contradicts the
//   prescribed 42. Symmetric for an up-step that re-snaps back down onto lastW.
//
//   C2 (PR-floor crater) — the PR-floor restores the proven load via
//   roundToStep(floorW), re-snapping the proven load through a COARSE grid
//   (barbell_heavy has no 105/115/145 rung) so it lands BELOW the very floor it is
//   meant to protect (squat 105 -> 100, 5 kg under demonstrated capacity).
//
// These helpers are PURE: they take the snap fn + the ladder primitives as args so
// the decision logic lives here (per the dp.js growth moratorium), and dp.recommend
// keeps only the thin in-flight call-site wiring. All gating is at the call site.

/**
 * The nearest REAL rung strictly BELOW `ref`, or 0 if already at the real floor.
 * Walks the GENERIC ladder downward while re-snapping each candidate through the
 * real-stack `roundToStep`, so it terminates on a rung that actually MOVED on the
 * REAL ladder (not the generic one). Bounded iteration (stack length).
 * @param {number} ref
 * @param {string} ex
 * @param {(kg:number, ex:string)=>number} roundToStep snap onto the real ladder
 * @param {(kg:number, ex:string)=>number} getPrevWeight generic prev-rung
 * @returns {number}
 */
export function realRungBelow(ref, ex, roundToStep, getPrevWeight) {
  let probe = ref;
  for (let i = 0; i < 64; i++) {
    const prev = getPrevWeight(probe, ex);
    if (!(prev < probe)) break; // generic floor -> cannot step lower
    const snapped = roundToStep(prev, ex);
    if (snapped > 0 && snapped < ref) return snapped;
    probe = prev;
  }
  return 0;
}

/**
 * The nearest REAL rung strictly ABOVE `ref`, or 0 if already at the real ceiling.
 * Mirror of realRungBelow, walking UP.
 * @param {number} ref
 * @param {string} ex
 * @param {(kg:number, ex:string)=>number} roundToStep
 * @param {(kg:number, ex:string)=>number} getNextWeight
 * @returns {number}
 */
export function realRungAbove(ref, ex, roundToStep, getNextWeight) {
  let probe = ref;
  for (let i = 0; i < 64; i++) {
    const next = getNextWeight(probe, ex);
    if (!(next > probe)) break; // generic ceiling -> cannot step higher
    const snapped = roundToStep(next, ex);
    if (snapped > ref) return snapped;
    probe = next;
  }
  return 0;
}

/**
 * C1 — decide how an ease/climb step that the real-stack snap collapsed onto lastW
 * should be reconciled. PURE + i18n-clean: returns a STRUCTURED decision (the new kg
 * / repsTarget + a semantic noteKind), the caller (dp.js, unscanned by the i18n leak
 * harness like all its sibling notes) composes the RO progressionNote from the kind.
 * The floor is the RAW demonstrated load (a load the user truly owns), NOT the e1RM
 * estimate — a sub-target distress run has rawFloor==0 so the genuine ease the user
 * asked for is allowed. Gating + lastW/floor resolution happen at the call site.
 *
 * noteKind: 'ease-down' (kg lowered to a real rung) | 'ease-hold-trim' (held + reps
 * trimmed at the floor) | 'climb-up' (bumped to the next real rung) | null (no change).
 * @param {{status:string, kg:number, repsTarget?:number, progressionStage?:number,
 *   lastW:number, rawFloor:number, ex:string, rMinFloor:number, effectiveMaxKg:number,
 *   roundToStep:(kg:number,ex:string)=>number,
 *   getPrevWeight:(kg:number,ex:string)=>number,
 *   getNextWeight:(kg:number,ex:string)=>number}} ctx
 * @returns {{noteKind:string, kg:number, repsTarget:number}|null}
 */
export function reconcileLadderStep({ status, kg, repsTarget, progressionStage, lastW, rawFloor, ex, rMinFloor, effectiveMaxKg, roundToStep, getPrevWeight, getNextWeight }) {
  const reps = repsTarget ?? 12;
  // (a) EASE / down-step that collapsed onto-or-above lastW -> a real rung strictly
  //     below lastW (only if it still honors the proven floor); else hold + trim reps.
  if ((status === 'EASE BACK' || status === 'SCALE BACK') && kg >= lastW) {
    const down = realRungBelow(lastW, ex, roundToStep, getPrevWeight);
    if (down > 0 && down < lastW && (rawFloor <= 0 || down >= rawFloor)) {
      return { noteKind: 'ease-down', kg: down, repsTarget: reps };
    }
    return { noteKind: 'ease-hold-trim', kg, repsTarget: Math.max(rMinFloor, reps - 1) };
  }
  // (b) WEIGHT-climb (INCREASE / CATCH UP) that collapsed onto-or-below lastW -> the
  //     next real rung above lastW (respect the defensive cap). GATE on progressionStage
  //     === 2 — the WEIGHT-move stage. A rep-increase INCREASE (stage 1: "urcam la N
  //     reps", weight HELD) intends kg == lastW and legitimately snaps DOWN to the real
  //     rung (18 kg held -> 17.5 real DB rung); only a true weight climb whose target
  //     rung the snap collapsed back onto lastW must be bumped.
  if ((status === 'INCREASE' || status === 'CATCH UP') && progressionStage === 2 && kg <= lastW) {
    const up = realRungAbove(lastW, ex, roundToStep, getNextWeight);
    if (up > lastW && !(effectiveMaxKg > 0 && up > effectiveMaxKg)) {
      return { noteKind: status === 'CATCH UP' ? 'climb-catchup' : 'climb-up', kg: up, repsTarget: reps };
    }
  }
  return null;
}
