// ══ DISPLAY TARGET GUARD — invariant lock (re-guard final summed target) ══
// The Progres hero re-assembles the displayed kcal at the DISPLAY layer (engine
// target + fatigue ease + aerobic class add-on), OUTSIDE the guarded engine
// path. guardDisplayTarget re-applies the floor/ceiling to that final sum. These
// tests lock the three invariants the audit flagged as HIGH:
//   1. maintenance ceiling — a CUT/MAINTENANCE day never DISPLAYS above
//      maintenance, even after ease + aerobic add-on stack;
//   2. healthy floor — a subponderal user (BMI <= 18.5) never drops below the
//      lean-gain surplus the engine guardrail enforces;
//   3. hard floor (sex-aware) — never below 1200 (m) / 1000 (f).
// Real-store wiring (NU mock) — set onboarding stats + read the real maintenance,
// same pattern as engineWrappers.nutritionSafety.test.ts.

import { describe, it, expect, beforeEach } from 'vitest';
import { guardDisplayTarget } from '../../lib/displayTargetGuard';
import { readUserMaintenanceTDEE } from '../../lib/userTdee';
import { LEAN_GAIN_SURPLUS_MULT } from '../../../engine/bodyComposition.js';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { useWorkoutStore } from '../../stores/workoutStore';

function setOnboarding(data: Partial<{
  age: number; sex: 'm' | 'f'; goal: string; frequency: string;
  experience: string; weight: number; height: number;
}>): void {
  useOnboardingStore.setState({
    data: {
      age: 30, sex: 'm', goal: 'auto', frequency: '3',
      experience: 'intermediar', weight: 80, height: 180,
      ...data,
    } as never,
    completed: true,
    completedAt: Date.now(),
  });
}

beforeEach(() => {
  localStorage.clear();
  useProgresStore.setState({ weightLog: [], bodyData: [] } as never);
  useWorkoutStore.setState({ sessionsHistory: [] } as never);
});

describe('guardDisplayTarget — maintenance ceiling (deficit phases)', () => {
  it('CUT + high-fatigue ease + 60min spinning must NOT exceed maintenance', () => {
    // Healthy 80kg/180cm male → real maintenance. CUT base below maintenance.
    setOnboarding({ weight: 80, height: 180, goal: 'slabire' });
    const maintenance = readUserMaintenanceTDEE() as number;
    const cutBase = maintenance - 400; // a real deficit day
    // Stack the add-ons the way the strip does: fatigue ease (+150) + a big
    // 60-min spinning burn (~595). Summed = a SURPLUS on a cut day pre-guard.
    const summed = cutBase + 150 + 595;
    expect(summed).toBeGreaterThan(maintenance); // repro: pre-guard overshoot
    const guarded = guardDisplayTarget(summed, cutBase, maintenance);
    // Invariant: a cut day never DISPLAYS above maintenance.
    expect(guarded.kcal).toBeLessThanOrEqual(maintenance);
    expect(guarded.kcal).toBe(Math.round(maintenance));
    expect(guarded.ceilingClamped).toBe(true);
  });

  it('a small ease on a cut day that stays below maintenance is NOT clamped', () => {
    setOnboarding({ weight: 80, height: 180, goal: 'slabire' });
    const maintenance = readUserMaintenanceTDEE() as number;
    const cutBase = maintenance - 400;
    const summed = cutBase + 100; // still below maintenance
    const guarded = guardDisplayTarget(summed, cutBase, maintenance);
    expect(guarded.kcal).toBe(Math.round(summed));
    expect(guarded.ceilingClamped).toBe(false);
  });

  it('surplus phase (base above maintenance) is EXEMPT — add-on may exceed maintenance', () => {
    // BULK day: engine base already above maintenance → aerobic add-on legit.
    setOnboarding({ weight: 80, height: 180, goal: 'masa' });
    const maintenance = readUserMaintenanceTDEE() as number;
    const bulkBase = maintenance + 300;
    const summed = bulkBase + 595; // big class on top of a surplus
    const guarded = guardDisplayTarget(summed, bulkBase, maintenance);
    // No ceiling on surplus phases — the full add-on rides through.
    expect(guarded.kcal).toBe(Math.round(summed));
    expect(guarded.ceilingClamped).toBe(false);
  });
});

describe('guardDisplayTarget — healthy floor (subponderal)', () => {
  it('subponderal + class add-on must NOT drop below the healthy floor', () => {
    // 55kg/182cm → BMI 16.6 (subponderal). Healthy floor = maintenance × 1.08.
    setOnboarding({ weight: 55, height: 182, goal: 'slabire' });
    const maintenance = readUserMaintenanceTDEE() as number;
    const healthyFloor = Math.round(maintenance * LEAN_GAIN_SURPLUS_MULT);
    // A degenerate low input (e.g. a wrong-direction add-on) must be lifted.
    const guarded = guardDisplayTarget(maintenance - 500, maintenance - 500, maintenance);
    expect(guarded.kcal).toBeGreaterThanOrEqual(healthyFloor);
  });

  it('subponderal ceiling is NOT applied (the healthy raise wins over the cut ceiling)', () => {
    // The lean-gain surplus is ABOVE maintenance by design — the ceiling must
    // not then claw it back down to maintenance (safety raise has priority).
    setOnboarding({ weight: 55, height: 182, goal: 'slabire' });
    const maintenance = readUserMaintenanceTDEE() as number;
    const guarded = guardDisplayTarget(maintenance - 200, maintenance - 200, maintenance);
    expect(guarded.kcal).toBeGreaterThan(maintenance);
    expect(guarded.ceilingClamped).toBe(false);
  });
});

describe('guardDisplayTarget — hard floor (sex-aware)', () => {
  it('never below 1200 for a male, even with no maintenance signal', () => {
    setOnboarding({ sex: 'm' });
    // No maintenance → ceiling skipped; only the hard floor applies.
    const guarded = guardDisplayTarget(800, 800, null);
    expect(guarded.kcal).toBeGreaterThanOrEqual(1200);
  });

  it('never below 1000 for a female', () => {
    setOnboarding({ sex: 'f' });
    const guarded = guardDisplayTarget(700, 700, null);
    expect(guarded.kcal).toBeGreaterThanOrEqual(1000);
  });
});
