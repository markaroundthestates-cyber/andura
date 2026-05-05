// ══ SIMULATOR PRUNING RULES A-E ════════════════════════════════════════════
// Per `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` §3.2.
// Output: ~1500-2000 valid branches from raw 3645 cross-product per ADR 026 Q2.

/**
 * @typedef {import('./types.js').ConstraintObject} ConstraintObject
 */

/** Pruning verdict for a single branch candidate. */
export const PRUNE_VERDICTS = Object.freeze({
  VALID: 'VALID',
  PRUNE_A: 'PRUNE_A_persona_goal_biological',
  PRUNE_B: 'PRUNE_B_equipment_goal_redundant',
  PRUNE_C: 'PRUNE_C_experience_frequency_biological',
  PRUNE_D: 'PRUNE_D_history_recovery_contradiction',
  PRUNE_E: 'PRUNE_E_goal_phase_invalid',
  TRIPWIRE: 'TRIPWIRE_passive_mode',
});

/**
 * Pruning A — Persona × Goal incompatibilitate biologică.
 * @param {ConstraintObject} c
 * @returns {string|null} verdict tag if pruned, null if passes
 */
function pruningA(c) {
  // Maria 65 + Forță Pură (RPE 9-10 implied by template Forta)
  if (c.persona.age >= 60 && c.goal.template === 'Forta') {
    return PRUNE_VERDICTS.PRUNE_A;
  }
  // >75 ani + Slăbire deficit aggressive (CUT phase)
  if (c.persona.age > 75 && c.goal.template === 'Slabire' && c.goal.phase === 'CUT') {
    return PRUNE_VERDICTS.PRUNE_A;
  }
  // Pregnant flag (recovery.injury_flags) + CUT/BULK = Passive Mode tripwire
  const isPregnant = c.recovery.injury_flags.includes('pregnant');
  if (isPregnant && (c.goal.phase === 'CUT' || c.goal.phase === 'BULK')) {
    return PRUNE_VERDICTS.TRIPWIRE;
  }
  return null;
}

/**
 * Pruning B — Equipment × Goal redundanță.
 * @param {ConstraintObject} c
 * @returns {string|null}
 */
function pruningB(c) {
  const equipSet = new Set(c.equipment.map((e) => String(e).toLowerCase()));
  const isBodyweightOnly = equipSet.has('bodyweight') && !equipSet.has('barbell') && !equipSet.has('dumbbell');
  if (isBodyweightOnly && c.goal.template === 'Forta') {
    return PRUNE_VERDICTS.PRUNE_B;
  }
  // Sală full + Slăbire + beginner = redundant (overlap with Tonifiere)
  const isFullGym = equipSet.has('barbell') && equipSet.has('dumbbell') && equipSet.has('machines');
  if (isFullGym && c.goal.template === 'Slabire' && c.experience === 'beginner') {
    return PRUNE_VERDICTS.PRUNE_B;
  }
  return null;
}

/**
 * Pruning C — Experience × Frequency biologic.
 * @param {ConstraintObject} c
 * @returns {string|null}
 */
function pruningC(c) {
  const f = c.schedule.frequency;
  if (c.experience === 'beginner' && f >= 6) return PRUNE_VERDICTS.PRUNE_C;
  if (c.experience === 'advanced' && f <= 2) return PRUNE_VERDICTS.PRUNE_C;
  return null;
}

/**
 * Pruning D — History × Recovery contradiction.
 * @param {ConstraintObject} c
 * @returns {string|null}
 */
function pruningD(c) {
  const hasSevereInjury = c.recovery.injury_flags.some((f) =>
    /severe|<3luni|recent|acute/i.test(String(f)),
  );
  if (c.history.tier === 'T0' && hasSevereInjury) {
    return PRUNE_VERDICTS.TRIPWIRE; // medical referral, NU engine output
  }
  if (c.history.tier === 'T3' && c.recovery.vitality_tier === 'LOW') {
    // T3 chronic LOW = re-eval phase, but NOT pruned — flagged downstream
    return null;
  }
  return null;
}

/**
 * Pruning E — Goal × Phase invalid.
 * @param {ConstraintObject} c
 * @returns {string|null}
 */
function pruningE(c) {
  if (c.goal.template === 'Forta' && c.goal.phase === 'CUT') {
    return PRUNE_VERDICTS.PRUNE_E;
  }
  if (c.goal.template === 'Longevitate' && c.goal.phase === 'BULK') {
    return PRUNE_VERDICTS.PRUNE_E;
  }
  return null;
}

/**
 * Apply all pruning rules A-E to a single branch candidate.
 * @param {ConstraintObject} c
 * @returns {{ verdict: string, rule: 'A' | 'B' | 'C' | 'D' | 'E' | null }}
 */
export function pruneBranch(c) {
  const a = pruningA(c);
  if (a) return { verdict: a, rule: 'A' };
  const b = pruningB(c);
  if (b) return { verdict: b, rule: 'B' };
  const cc = pruningC(c);
  if (cc) return { verdict: cc, rule: 'C' };
  const d = pruningD(c);
  if (d) return { verdict: d, rule: 'D' };
  const e = pruningE(c);
  if (e) return { verdict: e, rule: 'E' };
  return { verdict: PRUNE_VERDICTS.VALID, rule: null };
}

/**
 * Apply pruning to a batch of candidates.
 * @param {ReadonlyArray<ConstraintObject>} candidates
 * @returns {{
 *   valid: ConstraintObject[],
 *   pruned: { rule: string, branch: ConstraintObject }[],
 *   tripwires: ConstraintObject[],
 * }}
 */
export function pruneInvalidCombos(candidates) {
  const valid = [];
  const pruned = [];
  const tripwires = [];
  for (const c of candidates) {
    const { verdict, rule } = pruneBranch(c);
    if (verdict === PRUNE_VERDICTS.VALID) {
      valid.push(c);
    } else if (verdict === PRUNE_VERDICTS.TRIPWIRE) {
      tripwires.push(c);
    } else {
      pruned.push({ rule: String(rule), branch: c });
    }
  }
  return { valid, pruned, tripwires };
}
