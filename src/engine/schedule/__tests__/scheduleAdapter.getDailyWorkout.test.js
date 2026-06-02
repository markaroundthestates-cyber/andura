// Phase 6 task_01 — getDailyWorkout pipeline consumer tests
//
// Validates that scheduleAdapter.getDailyWorkout invokes the runPipeline
// 8-adapter sequential strict pipeline + aggregates blueprints by engine id
// + delegates exercise selection to sessionBuilder + handles rest day and
// hard halt edges per ORCHESTRATOR §7 contract.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyWorkout,
  commitCalendarEdit,
  setMissingEquipment,
  frequencyToSplit,
  weeklySessionsPerGroup,
  pickAlternativeCluster,
  getCalendarOverride,
  CALENDAR_OVERRIDE_KEY,
} from '../scheduleAdapter.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';
import { CLUSTER_BIG6_TO_BIG11_WEIGHT } from '../../periodization/constants.js';

const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M)
const MONDAY_2026_05_18 = new Date(2026, 4, 18);  // dayIdx 0 (L)

function buildUserState(overrides = {}) {
  return {
    user: { gender: 'M', age: 30, level: 'intermediate', goal: 'hypertrophy' },
    recentSessions: [],
    weights: {},
    profileTier: 'T1',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('scheduleAdapter — getDailyWorkout pipeline consumer', () => {
  it('returns null on rest day calendar override', async () => {
    // Mark Monday inactive — query on Monday should return null
    const selectedDays = [
      { day: 'L', active: false },
      { day: 'M', active: true },
      { day: 'M2', active: true },
      { day: 'J', active: true },
      { day: 'V', active: true },
      { day: 'S', active: false },
      { day: 'D', active: false },
    ];
    commitCalendarEdit(selectedDays, MONDAY_2026_05_18);
    const plan = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    expect(plan).toBeNull();
  });

  it('training day + pipeline ok → returns WorkoutPlan complete shape', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(plan.type).toBe('training');
    expect(plan).toHaveProperty('sessionType');
    expect(plan).toHaveProperty('warmup');
    expect(plan).toHaveProperty('exercises');
    expect(plan).toHaveProperty('intensityModifier');
    expect(plan).toHaveProperty('volumeTargets');
    expect(plan).toHaveProperty('specializationTarget');
    expect(plan).toHaveProperty('deloadState');
    expect(plan).toHaveProperty('estimatedDurationMin');
    expect(plan).toHaveProperty('volumeKg');
    expect(plan).toHaveProperty('workoutTitle');
  });

  it('returns null when runPipeline emits hard error', async () => {
    const orchestratorModule = await import('../../../coach/orchestrator/index.js');
    vi.spyOn(orchestratorModule, 'runPipeline').mockResolvedValueOnce([
      { ok: false, error: { code: 'ENGINE_THREW', message: 'simulated', severity: 'hard', adapterId: 'periodization' } },
    ]);
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).toBeNull();
  });

  it('aggregates blueprints by engine id (periodization, deload, specialization, warmup)', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    // periodization blueprint propagates volumeTargets (non-null map)
    expect(plan.volumeTargets).not.toBeNull();
    expect(typeof plan.volumeTargets).toBe('object');
    // deload state defaults IDLE when no deload window
    expect(typeof plan.deloadState).toBe('string');
    // warmup blueprint propagates (object or null per pipeline emission)
    expect(plan.warmup === null || typeof plan.warmup === 'object').toBe(true);
  });

  it('set-count is periodization-driven end-to-end (DELOAD week < LOAD week)', async () => {
    // LIVE-PROOF the full pipeline feeds periodization volume_target_pct into
    // sessionBuilder set counts. weeksElapsed 0 -> LOAD; weeksElapsed 3 ->
    // mesocycle week 4 = DELOAD (-45% volume). Monday is an UPPER day (default
    // 4-day split) whose chest/back/shoulder weekly targets sit above the
    // per-exercise floor, so the -45% deload cut is observable in the TOTAL
    // prescribed sets (DELOAD drops both per-exercise sets and session size).
    const sumSets = (plan) => plan.exercises.reduce((a, e) => a + e.sets, 0);
    const load = await getDailyWorkout(
      buildUserState({ meta: { weeksElapsed: 0 } }), MONDAY_2026_05_18);
    const deload = await getDailyWorkout(
      buildUserState({ meta: { weeksElapsed: 3 } }), MONDAY_2026_05_18);
    expect(load).not.toBeNull();
    expect(deload).not.toBeNull();
    expect(deload.deloadState !== undefined).toBe(true);
    expect(sumSets(deload)).toBeLessThan(sumSets(load));
  });

  it('delegates exercise selection to sessionBuilder (array shape)', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(Array.isArray(plan.exercises)).toBe(true);
    // sessionBuilder emits objects with { name, sets } shape
    if (plan.exercises.length > 0) {
      expect(plan.exercises[0]).toHaveProperty('name');
      expect(plan.exercises[0]).toHaveProperty('sets');
    }
  });

  it('estimatedDurationMin + volumeKg present with numeric defaults', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(typeof plan.estimatedDurationMin).toBe('number');
    expect(typeof plan.volumeKg).toBe('number');
  });

  it('deloadState string + intensityModifier propagated from deload blueprint', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(typeof plan.deloadState).toBe('string');
    // intensityModifier may be null (no deload) or object (deload active)
    expect(plan.intensityModifier === null || typeof plan.intensityModifier === 'object').toBe(true);
  });

  it('specializationTarget propagates from specialization blueprint', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(plan.specializationTarget === null || typeof plan.specializationTarget === 'string').toBe(true);
  });

  it('workoutTitle defaults to the non-localized engine fallback sentinel', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    // Sentinel, NOT Romanian copy — render boundaries resolve it via t().
    expect(plan.workoutTitle).toBe('__engine_workout_title_fallback__');
  });

  it('sessionType derives from the frequency split deterministically', async () => {
    // No calendar override + no user.frequency → engine derives the default
    // active week (L, Mi, V, S = 4 days) → 4-day split ['upper','lower','upper',
    // 'lower']. Monday (idx0, 1st active) → 'upper'→UPPER; Tuesday (idx1, not
    // active, slots after 1 active day) → 'lower'→LOWER. Deterministic per day.
    const planMon = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const planTue = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(planMon).not.toBeNull();
    expect(planTue).not.toBeNull();
    expect(planMon.sessionType).toBe('UPPER');
    expect(planTue.sessionType).toBe('LOWER');
    // Same day → same plan (determinism invariant).
    const planMon2 = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    expect(planMon2.sessionType).toBe('UPPER');
    expect(planMon2.exercises.map((e) => e.name))
      .toEqual(planMon.exercises.map((e) => e.name));
  });

  it('empty userState → defensive defaults, pipeline still completes', async () => {
    const plan = await getDailyWorkout({}, TUESDAY_2026_05_19);
    // Empty user → Periodization tier 'none' but constraint object still emitted
    // → downstream adapters proceed → pipeline completes (no hard halt)
    expect(plan).not.toBeNull();
    expect(plan.type).toBe('training');
  });

  it('undefined userState → defensive defaults, returns shape or null gracefully', async () => {
    const plan = await getDailyWorkout(undefined, TUESDAY_2026_05_19);
    expect(plan === null || plan.type === 'training').toBe(true);
  });

  it('missingEquipment filter applied via sessionBuilder coarse equipment', async () => {
    // WP-4: mark gantere + aparat-cablu missing → dumbbell + cable coarse types
    // unavailable. The session still composes (bodyweight + remaining types fill
    // it — no DROP-to-empty), but no dumbbell/cable exercise survives.
    setMissingEquipment(['gantere', 'aparat-cablu']);
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    const types = plan.exercises.map(
      (e) => getExerciseMetadata(e.name).equipment_type,
    );
    expect(types).not.toContain('dumbbell');
    expect(types).not.toContain('cable');
  });

  it('A2 H-4: marking gantere missing EXCLUDES dumbbell exercises from session', async () => {
    // Baseline (nothing missing) — selection may include a dumbbell exercise.
    const baseline = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(baseline).not.toBeNull();

    // Mark gantere (→ coarse 'dumbbell') missing. Same day, same session type.
    setMissingEquipment(['gantere']);
    const adapted = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(adapted).not.toBeNull();
    const adaptedTypes = adapted.exercises.map(
      (e) => getExerciseMetadata(e.name).equipment_type,
    );
    // No dumbbell exercise survives; the session is still fully composed
    // (substitution territory is WP-5 — here it just doesn't crash/empty).
    expect(adaptedTypes).not.toContain('dumbbell');
    expect(adapted.exercises.length).toBeGreaterThan(0);
  });

  it('runPipeline returns empty array → returns null (defensive)', async () => {
    const orchestratorModule = await import('../../../coach/orchestrator/index.js');
    vi.spyOn(orchestratorModule, 'runPipeline').mockResolvedValueOnce([]);
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).toBeNull();
  });

  it('runPipeline throws → returns null (D4 violation insurance)', async () => {
    const orchestratorModule = await import('../../../coach/orchestrator/index.js');
    vi.spyOn(orchestratorModule, 'runPipeline').mockRejectedValueOnce(new Error('boom'));
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).toBeNull();
  });
});

// ── M4a — OPTIONAL priority-muscle override (Andura infers by default) ────
describe('getDailyWorkout — M4a priority-muscle override', () => {
  // priorityGroup is a Big-11 RO key (piept/spate/biceps/...) — the SAME
  // vocabulary weakGroups uses. Set → fed as an additional weak group → it flows
  // through M2 amplification-toward-MRV. Unset (default) → ZERO change.
  it('priorityGroup set → that group gets MORE weekly volume (amplified toward MRV)', async () => {
    // Monday = UPPER day (default 4-day split) → chest (piept) is trained. Pin
    // piept as the priority and assert its EN budget entry (chest) rises vs the
    // identical profile without a priority.
    const base = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const pinned = await getDailyWorkout(
      buildUserState({ user: { gender: 'M', age: 30, frequency: '4', priorityGroup: 'piept' } }),
      MONDAY_2026_05_18,
    );
    expect(base).not.toBeNull();
    expect(pinned).not.toBeNull();
    expect(typeof base.volumeTargets.chest).toBe('number');
    expect(pinned.volumeTargets.chest).toBeGreaterThan(base.volumeTargets.chest);
  });

  it('priorityGroup unset (default) → IDENTICAL plan to no-override baseline', async () => {
    // No priorityGroup field at all → weakGroups identical → plan identical
    // (graceful degradation, ADR 025). Compare full exercise + volume output.
    const a = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const b = await getDailyWorkout(
      buildUserState({ user: { gender: 'M', age: 30, frequency: '4', priorityGroup: null } }),
      MONDAY_2026_05_18,
    );
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(b.volumeTargets).toEqual(a.volumeTargets);
    expect(b.exercises.map((e) => e.name)).toEqual(a.exercises.map((e) => e.name));
  });

  it('empty-string / non-string priorityGroup → treated as unset (no-op)', async () => {
    const base = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const empty = await getDailyWorkout(
      buildUserState({ user: { gender: 'M', age: 30, frequency: '4', priorityGroup: '' } }),
      MONDAY_2026_05_18,
    );
    expect(base).not.toBeNull();
    expect(empty).not.toBeNull();
    expect(empty.volumeTargets).toEqual(base.volumeTargets);
  });

  it('priorityGroup is MRV-capped (never exceeds the Israetel ceiling)', async () => {
    const pinned = await getDailyWorkout(
      buildUserState({ user: { gender: 'M', age: 30, frequency: '4', priorityGroup: 'piept' } }),
      MONDAY_2026_05_18,
    );
    expect(pinned).not.toBeNull();
    // chest MRV = 22 (ISRAETEL_BASELINES). The amplified value must never exceed.
    expect(pinned.volumeTargets.chest).toBeLessThanOrEqual(22);
  });

  it('priority group + fatigued today → recovery STILL cuts today (M1 wins for today)', async () => {
    // Reuse the PROVEN M1 fatigue pattern (marius/T2 + Flat DB Press ×3 logged at
    // `now`, the same shape scheduleAdapter.recovery.test.js fatigues chest with)
    // so the chest budget is high enough that the recovery cut is observable even
    // after priority amplification. Pin piept as priority, then prove recovery
    // (M1, runs LAST) still cuts chest's TODAY budget below its pinned-fresh value.
    const now = MONDAY_2026_05_18;
    const marius = (priority, recentSessions = []) => ({
      user: { age: 30, goal: 'hipertrofie', persona: 'marius', priorityGroup: priority },
      recentSessions,
      weights: {},
      profileTier: 'T2',
      flags: {},
      meta: { weeksElapsed: 0 },
    });
    const chestFatiguedSession = {
      ts: now.getTime(),
      exercises: [
        {
          exerciseName: 'Flat DB Press',
          sets: [
            { kg: 40, reps: 8, timestamp: now.getTime() },
            { kg: 40, reps: 8, timestamp: now.getTime() },
            { kg: 40, reps: 8, timestamp: now.getTime() },
          ],
        },
      ],
    };
    const pinnedFresh = await getDailyWorkout(marius('piept'), now);
    const pinnedFatigued = await getDailyWorkout(
      marius('piept', [chestFatiguedSession]),
      now,
    );
    expect(pinnedFresh).not.toBeNull();
    expect(pinnedFatigued).not.toBeNull();
    // Recovery cut today → chest TODAY budget strictly below the fresh-pinned one.
    expect(pinnedFatigued.volumeTargets.chest).toBeLessThan(pinnedFresh.volumeTargets.chest);
  });
});

// ── frequencyToSplit — pure helper (volume-driven program 2026-06-02) ─────
describe('frequencyToSplit — frequency-appropriate cluster template', () => {
  // Daniel-LOCKED templates. The real win each must satisfy: a lower-body day
  // (legs/lower/full — full trains every group incl. fese/gambe) exists at EVERY
  // frequency, so legs/glutes/calves are NEVER orphaned the way the old absolute-
  // weekday map orphaned them (legs only Wednesday, glutes/calves never).
  const LOWER_CLUSTERS = new Set(['legs', 'lower', 'full']);

  it('returns the exact LOCKED template per frequency', () => {
    expect(frequencyToSplit(1)).toEqual(['full']);
    expect(frequencyToSplit(2)).toEqual(['upper', 'lower']);
    expect(frequencyToSplit(3)).toEqual(['full', 'full', 'full']);
    expect(frequencyToSplit(4)).toEqual(['upper', 'lower', 'upper', 'lower']);
    expect(frequencyToSplit(5)).toEqual(['upper', 'lower', 'push', 'pull', 'legs']);
    expect(frequencyToSplit(6)).toEqual(['push', 'pull', 'legs', 'upper', 'lower', 'full']);
    expect(frequencyToSplit(7)).toEqual(['push', 'pull', 'legs', 'upper', 'lower', 'full', 'full']);
  });

  it('every frequency template includes at least one lower-body day', () => {
    for (let n = 1; n <= 7; n++) {
      const split = frequencyToSplit(n);
      expect(split.length).toBe(n);
      expect(split.some((c) => LOWER_CLUSTERS.has(c))).toBe(true);
    }
  });

  it('clamps out-of-range / non-finite N to [1,7]', () => {
    expect(frequencyToSplit(0)).toEqual(['full']);
    expect(frequencyToSplit(99)).toEqual(frequencyToSplit(7));
    expect(frequencyToSplit(NaN)).toEqual(['full']);
    expect(frequencyToSplit(3.4)).toEqual(['full', 'full', 'full']); // rounds to 3
  });

  it('returns a fresh array (callers cannot mutate the template)', () => {
    const a = frequencyToSplit(4);
    a.push('mutated');
    expect(frequencyToSplit(4)).toEqual(['upper', 'lower', 'upper', 'lower']);
  });
});

// ── weeklySessionsPerGroup — glutes + calves are reachable ────────────────
describe('weeklySessionsPerGroup — every Big-11 group reachable across a week', () => {
  it('glutes (fese) + calves (gambe) ARE trained at every frequency with a lower day', () => {
    // The old bug: glutes/calves were NEVER programmed. Now a lower-body cluster
    // (legs/lower/full) carries fese + gambe (CLUSTER_BIG6_TO_BIG11_WEIGHT), so
    // the week's split trains them whenever it has a lower day — i.e. always.
    for (let n = 1; n <= 7; n++) {
      const per = weeklySessionsPerGroup(frequencyToSplit(n));
      expect(per.fese).toBeGreaterThan(0);
      expect(per.gambe).toBeGreaterThan(0);
    }
  });

  it('counts how many sessions train each group (derived from cluster weight keys)', () => {
    // 4-day split = upper,lower,upper,lower. piept appears in upper (×2); the
    // quads group appears in lower (×2).
    const per = weeklySessionsPerGroup(['upper', 'lower', 'upper', 'lower']);
    expect(per.piept).toBe(2);
    expect(per['picioare-quads']).toBe(2);
    // A group only in lower is not counted for the upper days.
    expect(per.gambe).toBe(2);
  });

  it('ignores unknown cluster ids defensively', () => {
    expect(weeklySessionsPerGroup(['nope', 'full'])).toEqual(
      Object.fromEntries(Object.keys(CLUSTER_BIG6_TO_BIG11_WEIGHT.full).map((g) => [g, 1])),
    );
  });
});

// ── Leg day guaranteed end-to-end (real pipeline, glutes/calves reachable) ─
describe('getDailyWorkout — a lower-body day surfaces over the week (real pipeline)', () => {
  // Walk the default-active week (L, Mi, V, S) and assert at least one day is a
  // lower-body session AND that the union of prescribed groups reaches fese/gambe.
  const WEEK = [
    new Date(2026, 4, 18), // Mon
    new Date(2026, 4, 20), // Wed
    new Date(2026, 4, 22), // Fri
    new Date(2026, 4, 23), // Sat
  ];
  it('the week contains a Lower/Legs day and reaches glutes + calves', async () => {
    const tags = [];
    const groupsSeen = new Set();
    for (const day of WEEK) {
      const plan = await getDailyWorkout(buildUserState(), day);
      expect(plan).not.toBeNull();
      tags.push(plan.sessionType);
      for (const ex of plan.exercises) {
        groupsSeen.add(getExerciseMetadata(ex.name).muscle_target_primary);
      }
    }
    // 4-day split → upper,lower,upper,lower → at least one LOWER day exists.
    expect(tags).toContain('LOWER');
    // glutes (fese) + calves (gambe) are actually programmed across the week.
    expect(groupsSeen.has('fese')).toBe(true);
    expect(groupsSeen.has('gambe')).toBe(true);
  });

  it('a 3-day user gets Full×3 — legs every session (frequency wired via userState)', async () => {
    const u3 = buildUserState({ user: { gender: 'M', age: 30, frequency: '3' } });
    // freq '3' → active L, Mi, V → split full,full,full. Every day trains legs.
    const mon = await getDailyWorkout(u3, new Date(2026, 4, 18)); // L (1st active)
    expect(mon).not.toBeNull();
    expect(mon.sessionType).toBe('FULL');
    const groups = mon.exercises.map((e) => getExerciseMetadata(e.name).muscle_target_primary);
    // Full body reaches at least one lower-body group in the session.
    expect(groups.some((g) =>
      ['picioare-quads', 'picioare-hamstrings', 'fese', 'gambe'].includes(g),
    )).toBe(true);
  });
});

// ── "Different group" ephemeral override (D-override-different-muscle 2026-06-02) ──
describe('pickAlternativeCluster — most-recovered alternative (pure)', () => {
  it('excludes the scheduled cluster (never returns the same one)', () => {
    expect(pickAlternativeCluster('upper', {})).not.toBe('upper');
    expect(pickAlternativeCluster('push', {})).not.toBe('push');
  });

  it('no recovery signal → first non-scheduled cluster in declaration order (stable default)', () => {
    // PHASE_CLUSTERS_BIG6 = ['push','pull','legs','upper','lower','full'].
    // scheduled 'upper' → first non-'upper' = 'push'.
    expect(pickAlternativeCluster('upper', {})).toBe('push');
    // scheduled 'push' → first non-'push' = 'pull'.
    expect(pickAlternativeCluster('push', {})).toBe('pull');
  });

  it('picks the cluster whose groups are the most RECOVERED today', () => {
    // 'push' groups (piept/umeri/triceps) fatigued, 'pull' groups (spate/biceps/
    // antebrate) fresh → for a scheduled 'legs' day, 'pull' must win over 'push'.
    const recoveryState = {
      piept: 'fatigued', umeri: 'fatigued', triceps: 'fatigued',
      spate: 'recovered', biceps: 'recovered', antebrate: 'recovered',
    };
    expect(pickAlternativeCluster('legs', recoveryState)).toBe('pull');
  });

  it('is deterministic (same inputs → same output)', () => {
    const state = { piept: 'partial', spate: 'recovered' };
    expect(pickAlternativeCluster('legs', state)).toBe(pickAlternativeCluster('legs', state));
  });
});

describe('getDailyWorkout — "Different group" override (real alternative session)', () => {
  it('different-muscle → a DIFFERENT session type than today\'s scheduled one', async () => {
    // Monday default split → scheduled UPPER. The override must surface a real
    // alternative cluster (≠ UPPER) — not a relabel of the same session.
    const scheduled = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const alternative = await getDailyWorkout(
      buildUserState(), MONDAY_2026_05_18, { differentMuscle: true });
    expect(scheduled).not.toBeNull();
    expect(alternative).not.toBeNull();
    expect(scheduled.sessionType).toBe('UPPER');
    expect(alternative.sessionType).not.toBe(scheduled.sessionType);
    expect(alternative.type).toBe('training');
  });

  it('is EPHEMERAL — never writes the persisted calendar override', async () => {
    localStorage.removeItem(CALENDAR_OVERRIDE_KEY);
    await getDailyWorkout(buildUserState(), MONDAY_2026_05_18, { differentMuscle: true });
    // The weekly schedule (calendar override storage) is untouched — today-only.
    expect(localStorage.getItem(CALENDAR_OVERRIDE_KEY)).toBeNull();
    expect(getCalendarOverride(MONDAY_2026_05_18)).toBeNull();
  });

  it('default (no option) → byte-identical to the prior scheduled session', async () => {
    const a = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const b = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18, {});
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(b.sessionType).toBe(a.sessionType);
    expect(b.exercises.map((e) => e.name)).toEqual(a.exercises.map((e) => e.name));
  });
});
