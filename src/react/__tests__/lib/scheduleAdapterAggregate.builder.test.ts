// Builder-completion tests (GAP #2 energyDirection + #3a weekIdx + #4 bfPct/
// trainingWeeks + #36 persona/profileTier/goalPhase).
//
// buildUserStateForPipeline is the single pipeline choke-point. It used to feed
// the engines defaults (meta:{}, profileTier:null, no bfPct/trainingWeeks, no
// per-session energyDirection/weekIdx) so dp/fatigue/deload/mesocycle/
// goalAdaptation/specialization ran on absent signal. These tests prove each
// derived/estimated field reaches the engine reader that consumes it, AND that
// the pure toEngineSession transform never carries the builder-layer overlays.
//
// Cross-refs:
//   - src/engine/deload/triggerHierarchy.js (isEnergyDownSustained energyDirection)
//   - src/engine/periodization/mesocycle.js (isMariusDualSignalGreen weekIdx+rir+energy)
//   - src/engine/goalAdaptation/pushBackTiers.js (computeRiskScore bfPct fraction)
//   - src/engine/goalAdaptation/templates.js (isNewbieEffect trainingWeeks)
//   - src/engine/specialization/index.js (persona/profileTier/goalPhase gates)

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildUserStateForPipeline,
  estimateBfFraction,
} from '../../lib/scheduleAdapterAggregate';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';
import { DB } from '../../../db.js';
import { MS_PER_DAY } from '../../../constants.js';
import { isEnergyDownSustained } from '../../../engine/deload/triggerHierarchy.js';
import { saveReadiness } from '../../../engine/readiness.js';
import { isMariusDualSignalGreen } from '../../../engine/periodization/mesocycle.js';
import { computeRiskScore } from '../../../engine/goalAdaptation/pushBackTiers.js';
import { isNewbieEffect } from '../../../engine/goalAdaptation/templates.js';
import { evaluate as evaluateSpecialization } from '../../../engine/specialization/index.js';
import { ACTIVATION_STATE } from '../../../engine/specialization/constants.js';
import { evaluate as evaluatePeriodization } from '../../../engine/periodization/index.js';

const NOW = Date.now();

type EnergyLight = 'green' | 'yellow' | 'red';

// A persisted session summary carrying the fields the engines read: ts (daysAgo
// + weekIdx + trainingWeeks anchor), energyEmoji/energy (energyDirection +
// red-flag), and per-set ratings (rir via toEngineSession).
function sessionAt(
  daysAgo: number,
  rating: 'usor' | 'potrivit' | 'greu',
  energy: EnergyLight,
): LastSessionSummary {
  const ts = NOW - daysAgo * MS_PER_DAY;
  return {
    title: 'Push',
    meta: 'x',
    ts,
    energyEmoji: energy,
    energy,
    exercises: [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        sets: [
          { kg: 40, reps: 8, rating, timestamp: ts + 1000 },
          { kg: 40, reps: 8, rating, timestamp: ts + 2000 },
        ],
        totalVolume: 640,
        peakOneRM: 50,
      },
    ],
  };
}

function seedOnboarding(over: Partial<{
  age: number;
  sex: 'm' | 'f';
  goal: string;
  experience: string;
  weight: number;
  height: number;
}> = {}): void {
  useOnboardingStore.setState({
    data: {
      age: over.age ?? 25,
      sex: (over.sex ?? 'm') as 'm' | 'f',
      goal: (over.goal ?? 'masa') as never,
      frequency: '4',
      experience: (over.experience ?? 'avansat') as never,
      weight: over.weight ?? 80,
      height: over.height ?? 180,
    },
    completed: true,
    completedAt: NOW,
  });
}

function seedSessions(sessions: LastSessionSummary[]): void {
  // sessionsHistory is newest-tail; the builder reverses to newest-first.
  useWorkoutStore.setState({ sessionsHistory: sessions });
}

beforeEach(() => {
  localStorage.clear();
  seedOnboarding();
  seedSessions([]);
});

describe('estimateBfFraction — FRACTION not percent (engine threshold trap)', () => {
  it('returns a fraction in (0.20, 0.40) for a 90kg/175cm/40y male — NOT a percent', () => {
    const bf = estimateBfFraction({ weight: 90, height: 175, age: 40, sex: 'm' });
    expect(bf).toBeDefined();
    // CRITICAL: must be < 1 (a fraction). A raw percent (~28) would false-positive
    // the fractional bfPctHighMale 0.25 threshold for every user.
    expect(bf!).toBeLessThan(1);
    expect(bf!).toBeGreaterThan(0.2);
    expect(bf!).toBeLessThan(0.4);
  });

  it('female variant yields a higher fraction than male (sex factor)', () => {
    const m = estimateBfFraction({ weight: 80, height: 175, age: 40, sex: 'm' });
    const f = estimateBfFraction({ weight: 80, height: 175, age: 40, sex: 'f' });
    expect(f!).toBeGreaterThan(m!);
  });

  it('clamps to [0.03, 0.60]', () => {
    // Extreme high BMI → clamp 0.60.
    const high = estimateBfFraction({ weight: 200, height: 150, age: 70, sex: 'f' });
    expect(high!).toBeLessThanOrEqual(0.6);
    // Lean young male → clamp floor 0.03.
    const low = estimateBfFraction({ weight: 55, height: 190, age: 18, sex: 'm' });
    expect(low!).toBeGreaterThanOrEqual(0.03);
  });

  it('returns undefined when any input is missing', () => {
    expect(estimateBfFraction({ weight: null, height: 175, age: 40, sex: 'm' })).toBeUndefined();
    expect(estimateBfFraction({ weight: 80, height: null, age: 40, sex: 'm' })).toBeUndefined();
    expect(estimateBfFraction({ weight: 80, height: 175, age: null, sex: 'm' })).toBeUndefined();
    expect(estimateBfFraction({ weight: 80, height: 175, age: 40, sex: null })).toBeUndefined();
  });
});

describe('buildUserStateForPipeline — bfPct fraction reaches push-back risk', () => {
  it('high-BMI male → user.bfPct >= 0.25 → computeRiskScore includes bf_pct_high', () => {
    seedOnboarding({ weight: 90, height: 175, age: 40, sex: 'm' });
    const state = buildUserStateForPipeline();
    const bf = state.user.bfPct as number;
    expect(bf).toBeLessThan(1); // fraction, not percent
    expect(bf).toBeGreaterThanOrEqual(0.25);
    const { reasons } = computeRiskScore({
      goalId: 'hipertrofie',
      user: state.user,
      recentSessions: [],
    });
    expect(reasons).toContain('bf_pct_high');
  });

  it('lean male → user.bfPct < 0.25 → NO bf_pct_high (control)', () => {
    seedOnboarding({ weight: 70, height: 185, age: 25, sex: 'm' });
    const state = buildUserStateForPipeline();
    const bf = state.user.bfPct as number;
    expect(bf).toBeLessThan(0.25);
    const { reasons } = computeRiskScore({
      goalId: 'hipertrofie',
      user: state.user,
      recentSessions: [],
    });
    expect(reasons).not.toContain('bf_pct_high');
  });
});

describe('buildUserStateForPipeline — trainingWeeks reaches newbie detection', () => {
  it('earliest session 4 weeks ago → trainingWeeks 4 → isNewbieEffect true', () => {
    seedSessions([sessionAt(28, 'potrivit', 'green')]);
    const state = buildUserStateForPipeline();
    expect(state.user.trainingWeeks).toBe(4);
    expect(isNewbieEffect(state.user)).toBe(true);
  });

  it('earliest session 20 weeks ago → trainingWeeks 20 → isNewbieEffect false', () => {
    seedSessions([sessionAt(20 * 7, 'potrivit', 'green'), sessionAt(2, 'potrivit', 'green')]);
    const state = buildUserStateForPipeline();
    expect(state.user.trainingWeeks).toBe(20);
    expect(isNewbieEffect(state.user)).toBe(false);
  });

  it('no sessions → trainingWeeks 0 (a brand-new user IS a newbie)', () => {
    seedSessions([]);
    const state = buildUserStateForPipeline();
    expect(state.user.trainingWeeks).toBe(0);
    expect(isNewbieEffect(state.user)).toBe(true);
  });
});

describe('buildUserStateForPipeline — energyDirection reaches deload AA-trigger', () => {
  it('3 consecutive red sessions → energyDirection DOWN → isEnergyDownSustained true', () => {
    seedSessions([
      sessionAt(3, 'potrivit', 'red'),
      sessionAt(2, 'potrivit', 'red'),
      sessionAt(1, 'potrivit', 'red'),
    ]);
    const state = buildUserStateForPipeline();
    const sessions = state.recentSessions as Array<{ energyDirection?: string }>;
    expect(sessions.every((s) => s.energyDirection === 'DOWN')).toBe(true);
    expect(
      isEnergyDownSustained(
        state.recentSessions as Parameters<typeof isEnergyDownSustained>[0],
      ),
    ).toBe(true);
  });

  it('green/yellow sessions → not DOWN → isEnergyDownSustained false (conservative)', () => {
    seedSessions([
      sessionAt(3, 'potrivit', 'green'),
      sessionAt(2, 'potrivit', 'yellow'),
      sessionAt(1, 'potrivit', 'green'),
    ]);
    const state = buildUserStateForPipeline();
    expect(
      isEnergyDownSustained(
        state.recentSessions as Parameters<typeof isEnergyDownSustained>[0],
      ),
    ).toBe(false);
  });

  it('sessions WITHOUT energyEmoji → no energyDirection (not fabricated)', () => {
    const noEnergy: LastSessionSummary = {
      title: 'Push',
      meta: 'x',
      ts: NOW - MS_PER_DAY,
      exercises: [
        {
          exerciseId: 'b',
          exerciseName: 'Bench Press',
          sets: [{ kg: 40, reps: 8, rating: 'potrivit', timestamp: NOW }],
          totalVolume: 320,
          peakOneRM: 50,
        },
      ],
    };
    seedSessions([noEnergy]);
    const state = buildUserStateForPipeline();
    const sessions = state.recentSessions as Array<Record<string, unknown>>;
    expect('energyDirection' in sessions[0]!).toBe(false);
  });
});

describe('buildUserStateForPipeline — F1 T2/T3 top-level meta.energyDirection', () => {
  // One field (mapped from TODAY's EnergyCheck via EMOJI_TO_DIRECTION), four
  // readers: Deload Hook D3 (deload/index.js:237), Tempo, Specialization
  // light-coupling, Warmup. Proves the builder now populates the field the
  // engines read; absent today-check → absent field (NU a fabricated NONE).
  it('red energy-check today → meta.energyDirection DOWN', () => {
    saveReadiness(1); // 1-2 → red → DOWN
    const state = buildUserStateForPipeline();
    expect(state.meta.energyDirection).toBe('DOWN');
  });

  it('green energy-check today → meta.energyDirection UP', () => {
    saveReadiness(5); // 4-5 → green → UP
    const state = buildUserStateForPipeline();
    expect(state.meta.energyDirection).toBe('UP');
  });

  it('yellow energy-check today → meta.energyDirection NONE', () => {
    saveReadiness(3); // 3 → yellow → NONE
    const state = buildUserStateForPipeline();
    expect(state.meta.energyDirection).toBe('NONE');
  });

  it('no energy-check today → energyDirection absent (not fabricated)', () => {
    const state = buildUserStateForPipeline();
    expect('energyDirection' in (state.meta as Record<string, unknown>)).toBe(false);
  });
});

describe('buildUserStateForPipeline — weekIdx reaches mesocycle dual-signal', () => {
  it('4 sessions across 4 training-weeks (green + rir in [1,2]) → isMariusDualSignalGreen true', () => {
    // Start 21 days ago → weeks 1,2,3,4 at days 21,14,7,0. potrivit → rir 2 (in range).
    seedSessions([
      sessionAt(21, 'potrivit', 'green'),
      sessionAt(14, 'potrivit', 'green'),
      sessionAt(7, 'potrivit', 'green'),
      sessionAt(0, 'potrivit', 'green'),
    ]);
    const state = buildUserStateForPipeline();
    const weekIdxs = (state.recentSessions as Array<{ weekIdx?: number }>).map((s) => s.weekIdx);
    expect(new Set(weekIdxs)).toEqual(new Set([1, 2, 3, 4]));
    expect(
      isMariusDualSignalGreen(
        state.recentSessions as Parameters<typeof isMariusDualSignalGreen>[0],
      ),
    ).toBe(true);
  });

  it('only recent sessions (all week 1) → dual-signal false (weeks 2-4 missing)', () => {
    seedSessions([
      sessionAt(2, 'potrivit', 'green'),
      sessionAt(1, 'potrivit', 'green'),
      sessionAt(0, 'potrivit', 'green'),
    ]);
    const state = buildUserStateForPipeline();
    expect(
      isMariusDualSignalGreen(
        state.recentSessions as Parameters<typeof isMariusDualSignalGreen>[0],
      ),
    ).toBe(false);
  });
});

describe('buildUserStateForPipeline — meta-wire activates specialization for an advanced user', () => {
  // Logs producing a predictable weak group via weaknessDetector (1RM ratio
  // << peers) — same fixture shape the specialization engine tests use.
  const weakBicepsLogs = () => [
    { ex: 'Bench Press', w: 120, reps: 5 },
    { ex: 'Barbell Row', w: 110, reps: 5 },
    { ex: 'Bicep Curl', w: 25, reps: 8 },
    { ex: 'Squat', w: 130, reps: 5 },
  ];

  it('advanced (avansat) + young (marius) + masa (BULK) → persona/tier/goalPhase wired → NOT blocked at Gate 1', async () => {
    seedOnboarding({ age: 25, experience: 'avansat', goal: 'masa' });
    const state = buildUserStateForPipeline();
    // The three gate inputs are now populated (were unset → Gate 1 blocked all).
    expect(state.meta.persona).toBe('marius');
    expect(state.profileTier).toBe('T2');
    expect(state.meta.goalPhase).toBe('BULK');

    const result = await evaluateSpecialization({
      user: {},
      recentSessions: [],
      profileTier: state.profileTier as string,
      meta: { ...state.meta, lifetimeLogs: weakBicepsLogs(), recentLogs: weakBicepsLogs() },
    });
    // ACTIVATES: passes persona (marius) + tier (T2) + phase (BULK) + no injury
    // → a PROPOSAL/ACTIVE-family state, NOT the persona/tier/phase ineligible blocks.
    expect(result.meta.activation_state).not.toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
    expect(result.meta.activation_state).not.toBe(ACTIVATION_STATE.INELIGIBLE_NOT_ADVANCED);
    expect(result.meta.activation_state).not.toBe(ACTIVATION_STATE.INELIGIBLE_PHASE_GATE);
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.PROPOSAL_PENDING);
  });

  it('beginner (incepator) → profileTier T0 → blocked at Gate 2 (tier), NOT persona', async () => {
    seedOnboarding({ age: 25, experience: 'incepator', goal: 'masa' });
    const state = buildUserStateForPipeline();
    expect(state.profileTier).toBe('T0');
    const result = await evaluateSpecialization({
      user: {},
      recentSessions: [],
      profileTier: state.profileTier as string,
      meta: { ...state.meta, lifetimeLogs: weakBicepsLogs(), recentLogs: weakBicepsLogs() },
    });
    // persona is marius (young) so Gate 1 passes; T0 blocks at Gate 2.
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_ADVANCED);
  });

  // F1 T1 — the builder itself now populates lifetimeLogs/recentLogs from the
  // persisted `logs` key (the headline un-darkening). These rows carry the native
  // {ex (EN), w, reps, ts, session} shape workoutStore.logic.ts writes.
  const weakBicepsLogRows = (session: number) => [
    { ex: 'Bench Press', w: 120, reps: 5, ts: session + 1, session },
    { ex: 'Barbell Row', w: 110, reps: 5, ts: session + 2, session },
    { ex: 'Bicep Curl', w: 25, reps: 8, ts: session + 3, session },
    { ex: 'Squat', w: 130, reps: 5, ts: session + 4, session },
  ];

  it('T1: builder feeds lifetimeLogs/recentLogs from the `logs` key → engine target null→value', async () => {
    seedOnboarding({ age: 25, experience: 'avansat', goal: 'masa' });
    // Two distinct sessions in the persisted `logs` channel.
    DB.set('logs', [
      ...weakBicepsLogRows(NOW - 7 * MS_PER_DAY),
      ...weakBicepsLogRows(NOW - 1 * MS_PER_DAY),
    ]);
    const state = buildUserStateForPipeline();
    // The builder now SETS the detector inputs (were absent → engine starved).
    expect(Array.isArray(state.meta.lifetimeLogs)).toBe(true);
    expect((state.meta.lifetimeLogs as unknown[]).length).toBe(8);
    expect(Array.isArray(state.meta.recentLogs)).toBe(true);
    // Native shape passed through unchanged (EN ex key, w, reps).
    const row = (state.meta.lifetimeLogs as Array<Record<string, unknown>>)[0]!;
    expect(row.ex).toBe('Bench Press');

    // Through the REAL engine, fed ONLY by the builder meta (no hand-fed logs):
    // target_muscle_group flips null → a weak group (signal-bus `computed`).
    const result = await evaluateSpecialization({
      user: {},
      recentSessions: [],
      profileTier: state.profileTier as string,
      meta: state.meta,
    });
    expect(result.meta.target_muscle_group).toBe('biceps');
  });

  it('T1: no logs → lifetimeLogs/recentLogs absent → engine target stays null (conservative)', async () => {
    seedOnboarding({ age: 25, experience: 'avansat', goal: 'masa' });
    const state = buildUserStateForPipeline();
    expect('lifetimeLogs' in (state.meta as Record<string, unknown>)).toBe(false);
    expect('recentLogs' in (state.meta as Record<string, unknown>)).toBe(false);
    const result = await evaluateSpecialization({
      user: {},
      recentSessions: [],
      profileTier: state.profileTier as string,
      meta: state.meta,
    });
    expect(result.meta.target_muscle_group).toBeNull();
  });

  it('T1: recentLogs window = the 12 most-recent distinct sessions', () => {
    seedOnboarding({ age: 25, experience: 'avansat', goal: 'masa' });
    // 14 distinct sessions; only the newest 12 should be in recentLogs.
    const rows: Array<Record<string, unknown>> = [];
    for (let i = 0; i < 14; i += 1) {
      const session = NOW - i * MS_PER_DAY;
      rows.push({ ex: 'Bench Press', w: 100, reps: 5, ts: session, session });
    }
    DB.set('logs', rows);
    const state = buildUserStateForPipeline();
    const recent = state.meta.recentLogs as Array<{ session: number }>;
    const distinct = new Set(recent.map((r) => r.session));
    expect(distinct.size).toBe(12);
    // The two oldest sessions are excluded from the recent window.
    expect(distinct.has(NOW - 13 * MS_PER_DAY)).toBe(false);
    expect(distinct.has(NOW - 0 * MS_PER_DAY)).toBe(true);
  });

  it('preserves injury meta (painButtonActive/painAffectedGroups) alongside persona/goalPhase', () => {
    DB.set('pain-cdl', [
      { type: 'pain', region: 'umar-stang', intensity: 2, ts: NOW - 3 * MS_PER_DAY },
    ]);
    seedSessions([sessionAt(2, 'potrivit', 'green')]);
    const state = buildUserStateForPipeline();
    // Injury wire PRESERVED.
    expect(state.meta.painButtonActive).toBe(true);
    expect(Array.isArray(state.meta.painAffectedGroups)).toBe(true);
    expect((state.meta.painAffectedGroups as string[]).length).toBeGreaterThan(0);
    // ...and the new meta keys coexist (not clobbered).
    expect(state.meta.persona).toBe('marius');
    expect(state.meta.goalPhase).toBe('BULK');
    // ...and the session carries BOTH injury (within window) and weekIdx overlays.
    const s0 = (state.recentSessions as Array<Record<string, unknown>>)[0]!;
    expect(s0.injury).toBe(true);
    expect(typeof s0.weekIdx).toBe('number');
  });
});

describe('buildUserStateForPipeline — FIX #3 weeksElapsed advances periodization', () => {
  // periodization/index.js:85 reads meta.weeksElapsed; absent → NaN →
  // hasMacrocycleAnchor=false → computeMacrocycleBlock(0) → every user frozen at
  // macrocycle week 0 forever. The builder now sets it = trainingWeeks (weeks
  // since the first logged session). These tests prove the field is set AND that
  // a different weeksElapsed produces a different macrocycle block + volume map
  // through the REAL periodization engine (NOT a hand-fed meta fixture).

  it('sets meta.weeksElapsed to the training-start week count (== trainingWeeks)', () => {
    seedSessions([sessionAt(5 * 7, 'potrivit', 'green'), sessionAt(0, 'potrivit', 'green')]);
    const state = buildUserStateForPipeline();
    expect(state.meta.weeksElapsed).toBe(5);
    expect(state.meta.weeksElapsed).toBe(state.user.trainingWeeks);
    expect(Number.isFinite(Number(state.meta.weeksElapsed))).toBe(true);
  });

  it('no sessions → weeksElapsed 0 (a brand-new user IS at macrocycle week 0)', () => {
    seedSessions([]);
    const state = buildUserStateForPipeline();
    expect(state.meta.weeksElapsed).toBe(0);
  });

  it('weeksElapsed reaches the engine: week-0 vs week-5 user → different macrocycle block + volume', async () => {
    // gigica persona (age 35) advances M1→M2 freely (only maria is gated).
    seedOnboarding({ age: 35, experience: 'intermediar', goal: 'masa' });

    // Week-0 user (no sessions) → mesocycle block 1 (scaling 1.00), LOAD.
    seedSessions([]);
    const week0State = buildUserStateForPipeline();
    expect(week0State.meta.weeksElapsed).toBe(0);
    const week0 = await evaluatePeriodization(week0State as never);

    // Week-5 user → weeksIntoBlock 5 → mesocycleIdx 2 (scaling 1.10), LOAD.
    seedSessions([sessionAt(5 * 7, 'potrivit', 'green'), sessionAt(0, 'potrivit', 'green')]);
    const week5State = buildUserStateForPipeline();
    expect(week5State.meta.weeksElapsed).toBe(5);
    const week5 = await evaluatePeriodization(week5State as never);

    // The macrocycle ADVANCED: mesocycleIdx 1 → 2 (was frozen at 1 forever).
    const block0 = week0.meta.macrocycle_block as { mesocycleIdx: number };
    const block5 = week5.meta.macrocycle_block as { mesocycleIdx: number };
    expect(block0.mesocycleIdx).toBe(1);
    expect(block5.mesocycleIdx).toBe(2);

    // M2 scaling 1.10 lifts the volume map vs M1 1.00 — chest sets strictly
    // higher (14 MAV × 0.70 gigica × 1.00 goal × {1.00 vs 1.10} block, < MRV 22).
    const vol0 = week0.meta.volume_target_pct as Record<string, number>;
    const vol5 = week5.meta.volume_target_pct as Record<string, number>;
    expect(Number(vol5.chest)).toBeGreaterThan(Number(vol0.chest));
  });
});
