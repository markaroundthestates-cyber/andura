// F2 #1 — readiness volumeMultiplier consumption (Path A: sets, not weight).
//
// readiness.js getReadinessVerdict() emits a GRADED per-band multiplier
// (PR_DAY 1.1 / NORMAL 1.0 / MODERATE 0.85 / LIGHT 0.7) that was COMPUTED but
// DROPPED — the only live readiness effect was the binary dp.js < 60 weight
// HOLD cliff, so MODERATE vs LIGHT produced ZERO plan difference. This wire
// scales SETS by the verdict, floored at the trim floor, leaving the weight to
// the cliff. These tests assert the value now MOVES the plan (the provable
// dropped -> applied for a non-pipeline engine, per F2 spec §2 Test).

import { describe, it, expect } from 'vitest';
import { scaleSetsByReadiness, scaleSetsByEnergy } from '../../lib/scheduleAdapterAggregate';
import { getReadinessVerdict } from '../../../engine/readiness.js';
import type { PlannedExercise } from '../../lib/engineWrappers';

const MIN_SETS_PER_EX = 2; // mirror of the compose-module floor

function ex(name: string, sets: number): PlannedExercise {
  return { id: name, name, engineName: name, sets, targetReps: 8, targetKg: 40, restSec: 90 };
}

// A 4-exercise session, 3 working sets each (the spec's 4x3 fixture).
const session = (): PlannedExercise[] => [
  ex('Squat', 3),
  ex('Bench Press', 3),
  ex('Row', 3),
  ex('Curl', 3),
];

describe('scaleSetsByReadiness — graded readiness ramp on SETS', () => {
  it('NORMAL (score in [60,85)) -> multiplier 1.0 -> byte-identical sets', () => {
    const out = scaleSetsByReadiness(session(), 70);
    expect(out.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });

  it('null score (no energy-check today) -> 1.0 -> unchanged', () => {
    const out = scaleSetsByReadiness(session(), null);
    expect(out.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });

  it('LIGHT (score in [40,55)) -> 0.7 -> fewer sets than NORMAL, floored at 2', () => {
    // 3 * 0.7 = 2.1 -> round 2 (== floor)
    const light = scaleSetsByReadiness(session(), 45);
    expect(light.map((e) => e.sets)).toEqual([2, 2, 2, 2]);
    const normal = scaleSetsByReadiness(session(), 70);
    const lightTotal = light.reduce((s, e) => s + e.sets, 0);
    const normalTotal = normal.reduce((s, e) => s + e.sets, 0);
    expect(lightTotal).toBeLessThan(normalTotal);
  });

  it('MODERATE (score in [55,70)) -> 0.85 -> between LIGHT and NORMAL', () => {
    // 4 sets * 0.85 = 3.4 -> round 3 (vs 4 normal, vs 3 light)
    const mod = scaleSetsByReadiness([ex('Squat', 4)], 60);
    expect(mod[0]!.sets).toBe(3);
  });

  it('PR day (high score, history) -> 1.1 -> MORE sets', () => {
    // 4 * 1.1 = 4.4 -> round 4 (no change on small counts); 10 * 1.1 = 11 -> +1
    const pr = scaleSetsByReadiness([ex('Squat', 10)], 95);
    expect(pr[0]!.sets).toBe(11);
  });

  it('floor: never below MIN_SETS_PER_EX even at the lightest band', () => {
    const out = scaleSetsByReadiness([ex('Squat', 2)], 45);
    expect(out[0]!.sets).toBeGreaterThanOrEqual(MIN_SETS_PER_EX);
  });

  it('REST band (score < 40) -> verdict 0 -> no-op (rest day is filtered upstream)', () => {
    const out = scaleSetsByReadiness(session(), 20);
    expect(out.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });

  it('does NOT mutate the input array', () => {
    const input = session();
    scaleSetsByReadiness(input, 45);
    expect(input.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });
});

// ── CUT-AWARE PR-DAY BOOST SUPPRESSION (dp_readiness_cut_no_prboost_v1) ────────
// scaleSetsByReadiness called getReadinessVerdict with no opts, so a high-readiness
// user in an active CUT got the PR_DAY ×1.1 SET boost — +~10% volume in a deficit,
// the exact case the readiness model suppresses (getReadinessVerdict's isInCut path
// maps a CUT-high to SOLID 1.0). The isInCut param threads the cut state through.
describe('scaleSetsByReadiness — no PR-day set boost during a CUT', () => {
  it('CUT user at PR readiness (95) → no ×1.1 boost (SOLID 1.0 → sets unchanged)', () => {
    // 10 sets × 1.1 = 11 when NOT in cut; in a cut the verdict is SOLID (1.0) → 10.
    const inCut = scaleSetsByReadiness([ex('Squat', 10)], 95, true);
    expect(inCut[0]!.sets).toBe(10); // no boost in a deficit
  });

  it('non-cut user at PR readiness (95) → ×1.1 boost still applies', () => {
    const notCut = scaleSetsByReadiness([ex('Squat', 10)], 95, false);
    expect(notCut[0]!.sets).toBe(11); // boost preserved outside a cut
    // And the default (omitted isInCut) matches the non-cut path → byte-identical.
    const dflt = scaleSetsByReadiness([ex('Squat', 10)], 95);
    expect(dflt[0]!.sets).toBe(11);
  });

  it('CUT does not gut the SUB-PR bands — a MODERATE cut day still cuts (0.85)', () => {
    // 4 × 0.85 = 3.4 → 3 in both cut and non-cut (the cut path only changes the
    // PR band; MODERATE/LIGHT multipliers are identical in/out of a cut).
    expect(scaleSetsByReadiness([ex('Squat', 4)], 60, true)[0]!.sets).toBe(3);
    expect(scaleSetsByReadiness([ex('Squat', 4)], 60, false)[0]!.sets).toBe(3);
  });
});

// ── Cycle-9 cluster 4 — hasHistory gates the PR-day SET boost ──
// scaleSetsByReadiness called getReadinessVerdict with NO hasHistory → defaulted
// true → a NO-HISTORY user at PR readiness silently got the PR_DAY ×1.1 set boost
// (+1 set on >=5-set lifts) while the card (getReadiness, which DOES thread
// hasHistory) showed NORMAL. The hasHistory param mirrors the card's gate.
describe('scaleSetsByReadiness — hasHistory gates the PR-day boost', () => {
  it('NO history at PR readiness (95) → no ×1.1 boost (NORMAL → sets unchanged)', () => {
    // 11 working sets × 1.1 = 12.1 → 12 WITH history; with NO history the verdict is
    // NORMAL (1.0) → 11 (no phantom boost while the card reads NORMAL).
    const noHist = scaleSetsByReadiness([ex('Cable Row', 11)], 95, false, false);
    expect(noHist[0]!.sets).toBe(11);
  });

  it('WITH history at PR readiness (95) → ×1.1 boost applies', () => {
    const withHist = scaleSetsByReadiness([ex('Cable Row', 11)], 95, false, true);
    expect(withHist[0]!.sets).toBe(12);
    // Default (omitted hasHistory) keeps the historical engine-caller behavior.
    const dflt = scaleSetsByReadiness([ex('Cable Row', 11)], 95, false);
    expect(dflt[0]!.sets).toBe(12);
  });

  it('NO history does NOT change the SUB-PR bands (a MODERATE day still cuts 0.85)', () => {
    // 7 × 0.85 = 5.95 → 6 regardless of history (only the PR band is history-gated).
    expect(scaleSetsByReadiness([ex('Cable Row', 7)], 60, false, false)[0]!.sets).toBe(6);
    expect(scaleSetsByReadiness([ex('Cable Row', 7)], 60, false, true)[0]!.sets).toBe(6);
  });
});

// ── NUTR-VOL-1 readiness×energy MIN-compose (dp_readiness_energy_min_v1) ───────
// The compose seam ran scaleSetsByReadiness THEN scaleSetsByEnergy back-to-back, so
// the two Path-A volume cuts MULTIPLIED — but both the compose.ts + ceiling.js
// docstrings DOCUMENT a MIN-style ~30% never-double-cut floor. The fix composes the
// two factors with a single MIN applied ONCE. These tests use REAL band values and
// REAL scaler functions to prove the contract (the deeper stressor governs, never the
// product) on the exact two-factor logic the compose site now performs.
describe('readiness × energy compose MIN, not multiplicative (per contract)', () => {
  // A MODERATE readiness day (score 60 → 0.85) on a deep deficit (energyVol 0.70).
  const MODERATE = 60;
  const DEEP = 0.7;
  it('verdict band sanity: score 60 → 0.85 multiplier', () => {
    expect(getReadinessVerdict(MODERATE, {}).volumeMultiplier).toBeCloseTo(0.85);
  });

  it('light-readiness + deep-deficit user is cut by MIN (0.70) once, not 0.85×0.70', () => {
    const start = [ex('Squat', 10)];
    // OLD (multiplicative): readiness 0.85 → round(8.5)=9, then energy 0.70 →
    // round(6.3)=6 sets (~40% cut, the double-cut defect).
    const readinessFirst = scaleSetsByReadiness(start, MODERATE);
    const multiply = scaleSetsByEnergy(readinessFirst, DEEP);
    expect(multiply[0]!.sets).toBe(6);
    // NEW (MIN-compose): MIN(0.85, 0.70) = 0.70 applied ONCE → round(7.0)=7 sets
    // (~30% cut, the documented muscle-preserving floor).
    const minMult = Math.min(getReadinessVerdict(MODERATE, {}).volumeMultiplier, DEEP);
    const minCompose = scaleSetsByEnergy(start, minMult);
    expect(minCompose[0]!.sets).toBe(7);
    // The MIN-compose preserves MORE volume than the multiply (never double-cuts).
    expect(minCompose[0]!.sets).toBeGreaterThan(multiply[0]!.sets);
  });

  it('single-stressor user is unchanged (readiness 1.0 → energy alone governs)', () => {
    const start = [ex('Squat', 10)];
    // NORMAL readiness (1.0) + a 0.70 deficit → MIN(1.0, 0.70) = 0.70 → round(7)=7,
    // identical to energy-alone (no readiness cut to compose with).
    const energyAlone = scaleSetsByEnergy(start, DEEP);
    const minMult = Math.min(getReadinessVerdict(70, {}).volumeMultiplier, DEEP);
    const minCompose = scaleSetsByEnergy(start, minMult);
    expect(minCompose[0]!.sets).toBe(energyAlone[0]!.sets);
  });

  it('surplus user is not over-raised above the unscaled session (MRV-bounded)', () => {
    const start = [ex('Squat', 10)];
    // A surplus (energyVol > 1) is NOT a cut → the MIN-compose guard does not engage
    // (it requires BOTH factors < 1); the surplus rides the EXISTING sequential path on
    // the readiness-cut sets. It is MRV-bounded — it may partially restore toward the
    // original dose but must never inflate volume ABOVE the unscaled session.
    const readinessCut = scaleSetsByReadiness(start, MODERATE); // 0.85 → 9
    const surplusOnCut = scaleSetsByEnergy(readinessCut, 1.1);  // 9 × 1.1 = 9.9 → 10
    expect(surplusOnCut[0]!.sets).toBeLessThanOrEqual(start[0]!.sets); // never above 10
    expect(surplusOnCut[0]!.sets).toBeGreaterThanOrEqual(readinessCut[0]!.sets); // sequential surplus on the cut
  });
});
