// Coach Brain Eval — per-dimension comparators (Andura vs Claude oracle).
//
// Per COACH_BRAIN_EVAL_DESIGN.md §4.2: compare the NORMALIZED decision, not raw
// text. Tolerances absorb irrelevant numeric noise; categoricals match exact.
// A dimension is "in agreement" when its comparator returns true.
//
// Tolerances (§4.2, calibrated at first run, documented here):
//   - kcal / TDEE direction: categorical (deficit/surplus/maintenance) exact
//   - volume sets: +-1 set
//   - depth_pct deload: +-10 pp
//   - phase / deload_state / activation_state / energy_state: exact
//   - progression direction (up/hold/down): exact

/** Categorical equality, null-tolerant + case-insensitive for strings. */
function catEq(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return String(a).toLowerCase() === String(b).toLowerCase();
}

/** Numeric within absolute band. */
function within(a, b, band) {
  if (a == null || b == null) return false;
  if (typeof a !== 'number' || typeof b !== 'number') return false;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= band;
}

/**
 * Compare a single dimension. Each comparator returns
 * { agree: boolean, anduraValue, claudeValue, note }.
 * The oracle output schema (claudeOut) mirrors the normalized dimensions.
 */
export const COMPARATORS = {
  // Deload state — categorical exact.
  deloadState(a, c) {
    const av = a.deload && a.deload.deloadState;
    const cv = c.deloadState;
    return { agree: catEq(av, cv), anduraValue: av, claudeValue: cv };
  },
  // Deload depth — +-10pp band.
  // Semantic-equivalence: when there is no deload, the engine reports depthPct 0
  // while the oracle abstains with null. Both mean "no deload depth", so treat
  // oracle null as agreement when engine depth is 0 (or deloadState is IDLE).
  deloadDepth(a, c) {
    const av = a.deload && a.deload.depthPct;
    const cv = c.deloadDepthPct;
    if (av == null && cv == null) return { agree: true, anduraValue: av, claudeValue: cv };
    const anduraNoDeload = av === 0 || (a.deload && a.deload.deloadState === 'IDLE');
    if (cv == null && anduraNoDeload) return { agree: true, anduraValue: av, claudeValue: cv };
    return { agree: within(av, cv, 10), anduraValue: av, claudeValue: cv };
  },
  // Mesocycle phase — categorical exact.
  phase(a, c) {
    const av = a.volume && a.volume.phase;
    const cv = c.phase;
    return { agree: catEq(av, cv), anduraValue: av, claudeValue: cv };
  },
  // Goal phase (CUT/BULK/MAINTAIN/RECOMP) — categorical exact.
  goalPhase(a, c) {
    const av = a.phaseGoal && a.phaseGoal.phase;
    const cv = c.goalPhase;
    return { agree: catEq(av, cv), anduraValue: av, claudeValue: cv };
  },
  // Energy / readiness verdict — categorical exact.
  energyState(a, c) {
    const av = a.energy && a.energy.energyState;
    const cv = c.energyState;
    return { agree: catEq(av, cv), anduraValue: av, claudeValue: cv };
  },
  // Progression / energy adjustment direction — categorical (up/hold/down).
  // Semantic-equivalence: engine vocab is UP/DOWN/NONE; oracle emits up/down/hold.
  // Engine `NONE` and oracle `hold` are the SAME neutral state (no load nudge),
  // just different tokens for the shared concept. Treat them as equivalent.
  adjustmentDirection(a, c) {
    const av = a.energy && a.energy.adjustmentDirection;
    const cv = c.adjustmentDirection;
    const isNeutral = (v) => v != null && ['none', 'hold'].includes(String(v).toLowerCase());
    const agree = (isNeutral(av) && isNeutral(cv)) || catEq(av, cv);
    return { agree, anduraValue: av, claudeValue: cv };
  },
  // TDEE direction — derived from likelihood probabilities argmax vs oracle.
  tdeeDirection(a, c) {
    const lik = a.nutrition && a.nutrition.likelihood;
    let av = null;
    if (lik) {
      const entries = [
        ['deficit', lik.deficit_likelihood],
        ['surplus', lik.surplus_likelihood],
        ['maintenance', lik.maintenance_likelihood],
      ].filter(([, p]) => typeof p === 'number');
      if (entries.length) av = entries.sort((x, y) => y[1] - x[1])[0][0];
    }
    const cv = c.tdeeDirection;
    if (av == null && cv == null) return { agree: true, anduraValue: av, claudeValue: cv };
    return { agree: catEq(av, cv), anduraValue: av, claudeValue: cv };
  },
  // Specialization on/off — map activation_state to boolean-ish, exact.
  specialization(a, c) {
    const state = a.specialization && a.specialization.activationState;
    // ACTIVE → on; everything else → off/eligible.
    const av = state ? (String(state).startsWith('active') ? 'on' : 'off') : null;
    const cv = c.specialization; // 'on' | 'off'
    if (av == null && cv == null) return { agree: true, anduraValue: av, claudeValue: cv };
    return { agree: catEq(av, cv), anduraValue: av, claudeValue: cv };
  },
};

/**
 * Compare full normalized Andura decision vs oracle output. Only dimensions
 * the oracle actually returned (non-undefined) are scored — keeps fairness when
 * the oracle abstains on a dimension it cannot judge.
 *
 * @param {object} anduraDims - decision.dimensions
 * @param {object} claudeOut  - oracle output (flat per-dimension)
 * @returns {{ perDimension: object, agreeCount:number, totalCount:number }}
 */
export function compareDimensions(anduraDims, claudeOut) {
  const map = {
    deloadState: 'deloadState',
    deloadDepth: 'deloadDepthPct',
    phase: 'phase',
    goalPhase: 'goalPhase',
    energyState: 'energyState',
    adjustmentDirection: 'adjustmentDirection',
    tdeeDirection: 'tdeeDirection',
    specialization: 'specialization',
  };
  const perDimension = {};
  let agreeCount = 0;
  let totalCount = 0;
  for (const [dim, claudeKey] of Object.entries(map)) {
    if (claudeOut == null || !(claudeKey in claudeOut)) continue; // oracle abstained
    const res = COMPARATORS[dim](anduraDims, claudeOut);
    perDimension[dim] = res;
    totalCount += 1;
    if (res.agree) agreeCount += 1;
  }
  return { perDimension, agreeCount, totalCount };
}

export { catEq, within };
