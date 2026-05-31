// ══ GOAL / PHASE / NUTRITION COHERENCE MODEL — pure unit tests ══════════════
// Covers the model that makes goal + target weight + phase + kcal coherent
// (2026-05-30, Daniel repro masa+target90 → 2200 deficit). All pure — no I/O.

import { describe, it, expect } from 'vitest';
import {
  targetDirection,
  phaseForGoal,
  enabledGoalsForDirection,
  isGoalEnabled,
  deriveAutoPhase,
  sizeKcalForPhase,
  MAINTAIN_BAND_KG,
  KCAL_PER_KG,
  CUT_DEFICIT_FRACTION_DEFAULT,
  BULK_SURPLUS_FRACTION_DEFAULT,
  STRENGTH_SURPLUS_FRACTION,
} from '../../lib/goalPhaseModel';

describe('targetDirection — master intent from target vs current weight', () => {
  it('target below current (beyond band) → LOSE', () => {
    expect(targetDirection(110, 90)).toBe('LOSE');
  });
  it('target above current (beyond band) → GAIN', () => {
    expect(targetDirection(70, 80)).toBe('GAIN');
  });
  it('target within MAINTAIN band → MAINTAIN', () => {
    expect(targetDirection(110, 110 - (MAINTAIN_BAND_KG - 0.1))).toBe('MAINTAIN');
    expect(targetDirection(110, 110)).toBe('MAINTAIN');
  });
  it('exactly at band edge counts as the direction (>= band)', () => {
    expect(targetDirection(110, 110 - MAINTAIN_BAND_KG)).toBe('LOSE');
  });
  it('missing / invalid inputs → null (no gating)', () => {
    expect(targetDirection(null, 90)).toBeNull();
    expect(targetDirection(110, null)).toBeNull();
    expect(targetDirection(0, 90)).toBeNull();
    expect(targetDirection(110, -5)).toBeNull();
  });
});

describe('phaseForGoal — goal → phase-override token', () => {
  it('maps each goal to its phase', () => {
    expect(phaseForGoal('masa')).toBe('BULK');
    expect(phaseForGoal('slabire')).toBe('CUT');
    expect(phaseForGoal('forta')).toBe('STRENGTH');
    expect(phaseForGoal('mentenanta')).toBe('MAINTENANCE');
    expect(phaseForGoal('auto')).toBe('AUTO');
  });
  it('null / undefined → AUTO', () => {
    expect(phaseForGoal(null)).toBe('AUTO');
    expect(phaseForGoal(undefined)).toBe('AUTO');
  });
});

describe('gating — enabled/disabled goals per target direction', () => {
  it('LOSE → enabled auto+slabire; disabled masa/mentenanta/forta', () => {
    expect(isGoalEnabled('auto', 'LOSE')).toBe(true);
    expect(isGoalEnabled('slabire', 'LOSE')).toBe(true);
    expect(isGoalEnabled('masa', 'LOSE')).toBe(false);
    expect(isGoalEnabled('mentenanta', 'LOSE')).toBe(false);
    expect(isGoalEnabled('forta', 'LOSE')).toBe(false);
  });
  it('MAINTAIN → enabled auto+mentenanta+forta; disabled slabire/masa', () => {
    expect(isGoalEnabled('auto', 'MAINTAIN')).toBe(true);
    expect(isGoalEnabled('mentenanta', 'MAINTAIN')).toBe(true);
    expect(isGoalEnabled('forta', 'MAINTAIN')).toBe(true);
    expect(isGoalEnabled('slabire', 'MAINTAIN')).toBe(false);
    expect(isGoalEnabled('masa', 'MAINTAIN')).toBe(false);
  });
  it('GAIN → enabled auto+masa+forta; disabled slabire/mentenanta', () => {
    expect(isGoalEnabled('auto', 'GAIN')).toBe(true);
    expect(isGoalEnabled('masa', 'GAIN')).toBe(true);
    expect(isGoalEnabled('forta', 'GAIN')).toBe(true);
    expect(isGoalEnabled('slabire', 'GAIN')).toBe(false);
    expect(isGoalEnabled('mentenanta', 'GAIN')).toBe(false);
  });
  it('no target (null) → all enabled', () => {
    const all = enabledGoalsForDirection(null);
    for (const g of ['auto', 'forta', 'masa', 'slabire', 'mentenanta'] as const) {
      expect(all.has(g)).toBe(true);
    }
  });
  it('auto is never disabled', () => {
    for (const dir of ['LOSE', 'MAINTAIN', 'GAIN', null] as const) {
      expect(isGoalEnabled('auto', dir)).toBe(true);
    }
  });
});

describe('deriveAutoPhase — target-driven + BF-driven sex-aware', () => {
  it('target LOSE wins → CUT (even with low BF)', () => {
    expect(deriveAutoPhase({ direction: 'LOSE', bfFraction: 0.08, sex: 'm' })).toBe('CUT');
  });
  it('target GAIN wins → BULK (even with high BF)', () => {
    expect(deriveAutoPhase({ direction: 'GAIN', bfFraction: 0.40, sex: 'm' })).toBe('BULK');
  });
  it('men: BF > 15% → CUT, < 12% → BULK, else MAINTENANCE', () => {
    expect(deriveAutoPhase({ direction: 'MAINTAIN', bfFraction: 0.20, sex: 'm' })).toBe('CUT');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.10, sex: 'm' })).toBe('BULK');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.135, sex: 'm' })).toBe('MAINTENANCE');
  });
  it('women: BF > 25% → CUT, < 22% → BULK, else MAINTENANCE', () => {
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.30, sex: 'f' })).toBe('CUT');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.20, sex: 'f' })).toBe('BULK');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.235, sex: 'f' })).toBe('MAINTENANCE');
  });
  it('no BF signal → MAINTENANCE', () => {
    expect(deriveAutoPhase({ direction: null, bfFraction: null, sex: 'm' })).toBe('MAINTENANCE');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0, sex: 'f' })).toBe('MAINTENANCE');
  });
});

describe('sizeKcalForPhase — %-of-TDEE adaptive, sign forced by phase', () => {
  const FLOOR = 1200;
  const base = { maintenanceTdee: 2800, kcalFloor: FLOOR };

  it('MAINTENANCE → maintenance (no shift)', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'MAINTENANCE', currentKg: 100, targetKg: 100, daysRemaining: 90 });
    expect(r.kcalTarget).toBe(2800);
    expect(r.dailyShift).toBe(0);
  });

  it('STRENGTH → slight surplus (+5%)', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'STRENGTH', currentKg: 100, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2800 * (1 + STRENGTH_SURPLUS_FRACTION)));
  });

  it('CUT no target → default 20% of TDEE deficit', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: null, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2800 * (1 - CUT_DEFICIT_FRACTION_DEFAULT)));
    expect(r.rateCapped).toBe(false);
  });

  it('BULK no target → default 12% of TDEE surplus', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'BULK', currentKg: null, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2800 * (1 + BULK_SURPLUS_FRACTION_DEFAULT)));
  });

  // ── Daniel worked checks 2026-05-30 (the bug + the new contract) ────────────
  it('WORKED — 110kg male, TDEE ~2500, LOSE, no date → ~2000 (NOT 1200)', () => {
    // 20% of 2500 = 500 deficit → 2000. The whole point: never floored here.
    const r = sizeKcalForPhase({ maintenanceTdee: 2500, kcalFloor: FLOOR, phase: 'CUT', currentKg: 110, targetKg: 90, daysRemaining: null });
    expect(r.kcalTarget).toBe(2000);
    expect(r.dailyShift).toBe(-500);
    expect(r.floored).toBe(false);
  });

  it('WORKED — small user TDEE 1500, LOSE, no date → 1200 (at floor, ok)', () => {
    // 20% of 1500 = 300 → 1200 == floor.
    const r = sizeKcalForPhase({ maintenanceTdee: 1500, kcalFloor: FLOOR, phase: 'CUT', currentKg: 60, targetKg: 50, daysRemaining: null });
    expect(r.kcalTarget).toBe(1200);
    expect(r.dailyShift).toBe(-300);
    // 1500-300 = 1200 == floor exactly: lands ON the floor, not clamped below it.
  });

  it('WORKED — BULK 110kg, TDEE 2500, no date → 12% surplus → ~2800', () => {
    const r = sizeKcalForPhase({ maintenanceTdee: 2500, kcalFloor: FLOOR, phase: 'BULK', currentKg: 110, targetKg: 120, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2500 * 1.12)); // 2800
    expect(r.dailyShift).toBe(300);
  });

  // CEO LOCK 2026-05-31 — the rate caps (25% / 1.5kg-wk loss, 15% / 0.5kg-wk gain)
  // were REMOVED. An aggressive goal+deadline drives the deficit/surplus directly;
  // the sex kcal floor is the SOLE limit. These were the old "capped" cases —
  // updated to assert the new floor-only behavior (rateCapped never fires).
  it('aggressive loss date is NOT rate-capped — drives to the floor', () => {
    // 110→62 in 4 days → required ~92,000/day deficit. No rate cap → the shift
    // drives the target far below the floor, so it lands EXACTLY at the floor.
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: 110, targetKg: 62, daysRemaining: 4 });
    expect(r.rateCapped).toBe(false);
    expect(r.floored).toBe(true);
    expect(r.kcalTarget).toBe(FLOOR);
  });

  it('aggressive loss for a very-high-TDEE user stays above the floor (no cap)', () => {
    // TDEE 8000, 200→100 in 7 days → required ~110,000/day → floored. No kg/week cap.
    const r = sizeKcalForPhase({ maintenanceTdee: 8000, kcalFloor: FLOOR, phase: 'CUT', currentKg: 200, targetKg: 100, daysRemaining: 7 });
    expect(r.rateCapped).toBe(false);
    expect(r.floored).toBe(true);
    expect(r.kcalTarget).toBe(FLOOR);
  });

  it('aggressive gain date is NOT rate-capped — surplus drives directly', () => {
    // 70→90 in 4 weeks = 5 kg/wk → required 20*7700/28 = 5500/day surplus, applied
    // directly (no 15% / 0.5kg-wk cap). Target = 2800 + 5500 = 8300.
    const required = Math.round((20 * KCAL_PER_KG) / 28);
    const r = sizeKcalForPhase({ ...base, phase: 'BULK', currentKg: 70, targetKg: 90, daysRemaining: 28 });
    expect(r.rateCapped).toBe(false);
    expect(r.dailyShift).toBe(required);
    expect(r.kcalTarget).toBe(2800 + required);
  });

  it('REPRO — BULK with a BELOW-current target never flips to a deficit', () => {
    // masa + target 90 from 110 over 16wk → BULK forces SURPLUS (default %).
    const r = sizeKcalForPhase({ maintenanceTdee: 2400, kcalFloor: FLOOR, phase: 'BULK', currentKg: 110, targetKg: 90, daysRemaining: 112 });
    expect(r.dailyShift).toBeGreaterThan(0);
    expect(r.kcalTarget).toBeGreaterThan(2400);
  });

  it('loss date uses the date-required rate (drives the deficit directly)', () => {
    // 5 kg over 10 weeks → required ≈ 550/day deficit → 2800 - 550 (above floor).
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: 110, targetKg: 105, daysRemaining: 70 });
    expect(r.rateCapped).toBe(false);
    expect(r.kcalTarget).toBe(2800 - Math.round((5 * KCAL_PER_KG) / 70));
  });

  it('floor holds — never below the sex-aware floor', () => {
    const r = sizeKcalForPhase({ maintenanceTdee: 1500, kcalFloor: 1000, phase: 'CUT', currentKg: 60, targetKg: 50, daysRemaining: 7 });
    expect(r.kcalTarget).toBeGreaterThanOrEqual(1000);
  });

  // ── CEO LOCK 2026-05-31 — sex floor is the SOLE safety limit ────────────────
  // The recommendation is goal+deadline-driven and as aggressive as the goal
  // demands. The ONLY clamp is the sex kcal floor (women 1000 / men 1200). These
  // assert the two founder repro cases land EXACTLY at the floor (the goal would
  // require eating below the safe minimum, so we limit UP to it).
  it('CASE A — woman aggressive deadline → floored to 1000 exactly', () => {
    // F 160/78 → 60kg by ~Aug (≈92 days): required ~1506/day deficit on a ~1542
    // maintenance → far below 1000 → floored to the female minimum.
    const r = sizeKcalForPhase({ maintenanceTdee: 1542, kcalFloor: 1000, phase: 'CUT', currentKg: 78, targetKg: 60, daysRemaining: 92 });
    expect(r.kcalTarget).toBe(1000);
    expect(r.floored).toBe(true);
    expect(r.rateCapped).toBe(false);
  });

  it('CASE B — man aggressive deadline → floored to 1200 exactly', () => {
    // M 181/108 → 90kg by ~Aug (≈92 days): required ~1506/day deficit on a ~2400
    // maintenance → below 1200 → floored to the male minimum.
    const r = sizeKcalForPhase({ maintenanceTdee: 2400, kcalFloor: 1200, phase: 'CUT', currentKg: 108, targetKg: 90, daysRemaining: 92 });
    expect(r.kcalTarget).toBe(1200);
    expect(r.floored).toBe(true);
    expect(r.rateCapped).toBe(false);
  });

  it('BULLETPROOF — never below the sex floor for ANY aggressive input', () => {
    // Sweep extreme deadlines / weights / TDEE — the output must always be >= the
    // floor (women 1000 / men 1200). The floor is the sole, inviolable limit.
    for (const floor of [1000, 1200]) {
      for (const tdee of [900, 1300, 2000, 4741]) {
        for (const days of [1, 3, 7, 30]) {
          for (const [cur, tgt] of [[78, 50], [250, 60], [60, 40]] as const) {
            const r = sizeKcalForPhase({ maintenanceTdee: tdee, kcalFloor: floor, phase: 'CUT', currentKg: cur, targetKg: tgt, daysRemaining: days });
            expect(r.kcalTarget).toBeGreaterThanOrEqual(floor);
          }
        }
      }
    }
  });

  it('BULLETPROOF — degrades to the safe band on invalid floor/shift input', () => {
    // An invalid floor (NaN / <=0) must NOT let the output fall below the safe
    // band — it degrades to the conservative male minimum (1200), never lower.
    const rNaN = sizeKcalForPhase({ maintenanceTdee: 1500, kcalFloor: Number.NaN, phase: 'CUT', currentKg: 78, targetKg: 50, daysRemaining: 3 });
    expect(rNaN.kcalTarget).toBeGreaterThanOrEqual(1200);
    const rZero = sizeKcalForPhase({ maintenanceTdee: 1500, kcalFloor: 0, phase: 'CUT', currentKg: 78, targetKg: 50, daysRemaining: 3 });
    expect(rZero.kcalTarget).toBeGreaterThanOrEqual(1200);
  });

  // ── Extreme bodyweight invariant (250kg male repro 2026-05-30) ──────────────
  // Founder live repro at the max input bound (250kg/230cm): masa (3722) landed
  // BELOW auto (3900) and below maintenance because the phase snapshot used the
  // legacy SYS.estimateTDEE (hardcoded 111kg config, capped 3500) while AUTO used
  // the real per-user TDEE. Asserting the pure invariant: for ANY single TDEE,
  // BULK > MAINTENANCE > CUT and the BULK surplus is never below maintenance.
  it('INVARIANT — 250kg male maintenance ~4741: BULK > maintenance > CUT', () => {
    // Mifflin BMR 250kg/230cm/30yr male = 3793; × NEAT 1.25, 0 sessions = ~4741.
    const tdee = 4741;
    const cut = sizeKcalForPhase({ maintenanceTdee: tdee, kcalFloor: FLOOR, phase: 'CUT', currentKg: 250, targetKg: null, daysRemaining: null });
    const maint = sizeKcalForPhase({ maintenanceTdee: tdee, kcalFloor: FLOOR, phase: 'MAINTENANCE', currentKg: 250, targetKg: null, daysRemaining: null });
    const bulk = sizeKcalForPhase({ maintenanceTdee: tdee, kcalFloor: FLOOR, phase: 'BULK', currentKg: 250, targetKg: null, daysRemaining: null });
    expect(maint.kcalTarget).toBe(tdee);
    // BULK is a SURPLUS — strictly above maintenance (the founder's masa < auto bug).
    expect(bulk.kcalTarget).toBeGreaterThan(maint.kcalTarget);
    // CUT is a deficit — strictly below maintenance.
    expect(cut.kcalTarget).toBeLessThan(maint.kcalTarget);
    // Full ordering BULK > MAINTENANCE > CUT.
    expect(bulk.kcalTarget).toBeGreaterThan(cut.kcalTarget);
  });

  it('INVARIANT — BULK never below maintenance across a TDEE sweep', () => {
    // No %-cap or rate-cap can ever turn a surplus into a value <= maintenance.
    for (const tdee of [1300, 2000, 2800, 3793, 4741, 6000]) {
      const maint = sizeKcalForPhase({ maintenanceTdee: tdee, kcalFloor: FLOOR, phase: 'MAINTENANCE', currentKg: 250, targetKg: null, daysRemaining: null });
      const bulk = sizeKcalForPhase({ maintenanceTdee: tdee, kcalFloor: FLOOR, phase: 'BULK', currentKg: 250, targetKg: null, daysRemaining: null });
      expect(bulk.kcalTarget).toBeGreaterThanOrEqual(maint.kcalTarget);
    }
  });
});
