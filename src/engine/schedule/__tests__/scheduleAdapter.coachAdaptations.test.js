// Coach Voice — the engine emits a STRUCTURED adaptations log on the plan.
//
// Validates getDailyWorkout's coachAdaptations field: a machine-readable record
// (kind/group/cause tokens, NO copy) of what the adaptive brain ACTUALLY changed
// this session (M1 recovery cut, M2 weakness amp, M3 imbalance fix, deload). The
// React composer (coachInsight) turns it into one plain-language coach line.
//
// Truth-only (anti-hallucination, ADR 025): every entry maps to a real budget
// delta this run — derived from the SAME maps the plan was built from, never
// recomputed/fabricated. Nothing adapted → empty array (the React side then
// renders no line). The engine emits TOKENS, never Romanian copy.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailyWorkout } from '../scheduleAdapter.js';

const MONDAY_2026_05_18 = new Date(2026, 4, 18);
const DAY_MS = 24 * 60 * 60 * 1000;

function buildUserState(overrides = {}) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius' },
    recentSessions: [],
    aerobicSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

// 3 heavy Flat DB Press sets at `ts` (primary head chest_mid) — fatigues CHEST
// today (no decay). Same fixture shape the M1 recovery test uses.
function chestFatiguedSession(ts) {
  return {
    ts,
    exercises: [
      {
        exerciseName: 'Flat DB Press',
        sets: [
          { kg: 40, reps: 8, timestamp: ts },
          { kg: 40, reps: 8, timestamp: ts },
          { kg: 40, reps: 8, timestamp: ts },
        ],
      },
    ],
  };
}

// A spinning class at `ts` (no decay) — eases legs/glutes/core toward 'partial'
// (recovered→partial, aerobic-only). Same fixture the aerobic-recovery test uses.
function spinningSession(ts) {
  return { date: '2026-05-18', type: 'spinning', minutes: 50, kcal: 350, ts };
}

// Lagging-chest history placed in the past so resistance recovery has cleared
// today, but chest is under-volume vs its push peers (shoulders/triceps) inside
// the 14-day lagging lookback → chest is the weak group (M2 amplifies it).
function laggingChestSessions(now, daysAgo = 6) {
  const ts = now - daysAgo * DAY_MS;
  const set = (kg) => ({ kg, reps: 8, timestamp: ts });
  return [
    {
      ts,
      exercises: [
        { exerciseName: 'Flat DB Press', sets: [set(30)] },
        { exerciseName: 'DB Shoulder Press', sets: [set(20), set(20), set(20), set(20)] },
        { exerciseName: 'Lateral Raises', sets: [set(10), set(10), set(10), set(10)] },
        { exerciseName: 'Pushdown', sets: [set(25), set(25), set(25), set(25)] },
        { exerciseName: 'Overhead Triceps', sets: [set(15), set(15), set(15), set(15)] },
      ],
    },
  ];
}

const exercise = (name, n, ts) => ({
  exerciseName: name,
  sets: Array.from({ length: n }, () => ({ kg: 20, reps: 8, timestamp: ts })),
});

// Push-dominant history (push >> pull) cleared today → M3 biases the pull side
// (back/biceps) toward parity → imbalance-fix on those groups.
function pushDominantSessions(now, daysAgo = 6) {
  const ts = now - daysAgo * DAY_MS;
  return [
    {
      ts,
      exercises: [
        exercise('Flat DB Press', 6, ts),
        exercise('DB Shoulder Press', 6, ts),
        exercise('Pushdown', 6, ts),
        exercise('Lat Pulldown', 3, ts),
        exercise('Bayesian Curl', 2, ts),
      ],
    },
  ];
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('scheduleAdapter — coachAdaptations structured log (Coach Voice)', () => {
  it('field is always present + an array (additive contract, no shape break)', async () => {
    const plan = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    expect(plan).not.toBeNull();
    expect(Array.isArray(plan.coachAdaptations)).toBe(true);
  });

  it('nothing adapted → empty array (graceful; the React side renders no line)', async () => {
    const plan = await getDailyWorkout(
      buildUserState({ recentSessions: [], aerobicSessions: [] }),
      MONDAY_2026_05_18,
    );
    expect(plan).not.toBeNull();
    expect(plan.coachAdaptations).toEqual([]);
  });

  it('fatigued chest today → recovery-cut for chest (piept) with RESISTANCE cause', async () => {
    const now = MONDAY_2026_05_18;
    const plan = await getDailyWorkout(
      buildUserState({ recentSessions: [chestFatiguedSession(now.getTime())] }),
      now,
    );
    expect(plan).not.toBeNull();
    const cut = plan.coachAdaptations.find(
      (a) => a.kind === 'recovery-cut' && a.group === 'piept',
    );
    expect(cut).toBeDefined();
    expect(cut.cause).toBe('resistance');
  });

  it('recent spinning → recovery-cut on a leg group with AEROBIC cause (the spin class)', async () => {
    const now = MONDAY_2026_05_18;
    const plan = await getDailyWorkout(
      buildUserState({ aerobicSessions: [spinningSession(now.getTime())] }),
      now,
    );
    expect(plan).not.toBeNull();
    // spinning eases quads (gradient 1.0) recovered→partial → cut owed to cardio.
    const quadCut = plan.coachAdaptations.find(
      (a) => a.kind === 'recovery-cut' && a.group === 'picioare-quads',
    );
    expect(quadCut).toBeDefined();
    expect(quadCut.cause).toBe('aerobic');
    // Every spinning-driven cut is attributed to aerobic (no resistance logs).
    for (const a of plan.coachAdaptations) {
      if (a.kind === 'recovery-cut') expect(a.cause).toBe('aerobic');
    }
  });

  it('lagging chest history → weakness-amp entry for chest (piept)', async () => {
    const now = MONDAY_2026_05_18;
    const plan = await getDailyWorkout(
      buildUserState({ recentSessions: laggingChestSessions(now.getTime()) }),
      now,
    );
    expect(plan).not.toBeNull();
    const amp = plan.coachAdaptations.find(
      (a) => a.kind === 'weakness-amp' && a.group === 'piept',
    );
    expect(amp).toBeDefined();
  });

  it('push-dominant history → imbalance-fix entry on the pull side (spate/biceps)', async () => {
    const now = MONDAY_2026_05_18;
    const plan = await getDailyWorkout(
      buildUserState({ recentSessions: pushDominantSessions(now.getTime()) }),
      now,
    );
    expect(plan).not.toBeNull();
    const fix = plan.coachAdaptations.find(
      (a) => a.kind === 'imbalance-fix' && (a.group === 'spate' || a.group === 'biceps'),
    );
    expect(fix).toBeDefined();
  });

  it('deload week → deload entry', async () => {
    // weeksElapsed 3 → mesocycle week 4 = DELOAD (SCHEDULED_LINEAR, non-zero
    // intensity modifier) — the same signal the React intensityMod 'minus' uses.
    const plan = await getDailyWorkout(
      buildUserState({ meta: { weeksElapsed: 3 } }),
      MONDAY_2026_05_18,
    );
    expect(plan).not.toBeNull();
    expect(plan.coachAdaptations.some((a) => a.kind === 'deload')).toBe(true);
  });

  it('emits TOKENS only — never Romanian copy (i18n leak discipline)', async () => {
    const now = MONDAY_2026_05_18;
    const plan = await getDailyWorkout(
      buildUserState({ recentSessions: [chestFatiguedSession(now.getTime())] }),
      now,
    );
    expect(plan).not.toBeNull();
    const ALLOWED_KINDS = new Set(['recovery-cut', 'weakness-amp', 'imbalance-fix', 'deload']);
    const ALLOWED_CAUSES = new Set(['aerobic', 'resistance']);
    // Big-11 RO group KEYS (machine tokens) — NOT display labels like "Pieptul".
    const ALLOWED_GROUPS = new Set([
      'piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core',
      'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
    ]);
    for (const a of plan.coachAdaptations) {
      expect(ALLOWED_KINDS.has(a.kind)).toBe(true);
      if (a.group !== undefined) expect(ALLOWED_GROUPS.has(a.group)).toBe(true);
      if (a.cause !== undefined) expect(ALLOWED_CAUSES.has(a.cause)).toBe(true);
    }
  });

  it('determinism: same now + logs + user → identical adaptations across runs', async () => {
    const now = MONDAY_2026_05_18;
    const state = () =>
      buildUserState({ recentSessions: [chestFatiguedSession(now.getTime())] });
    const a = await getDailyWorkout(state(), now);
    const b = await getDailyWorkout(state(), now);
    expect(a).not.toBeNull();
    expect(a.coachAdaptations).toEqual(b.coachAdaptations);
  });
});
