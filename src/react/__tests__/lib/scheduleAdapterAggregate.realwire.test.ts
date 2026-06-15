// Phase 6 task_02 Option C — scheduleAdapterAggregate real wire tests.
// Per DECISIONS.md §D027 STRATEGY LOCKED V1.
//
// Async pipeline composer invokes real getDailyWorkout(userState, now) which
// drives runPipeline 8-adapter chain + sessionBuilder delegate. Tests verify:
//   - rest day calendar override → null
//   - pipeline hard halt → null
//   - training day → PlannedWorkoutOutput shape complete
//   - volumeKg + estimatedDuration propagate
//   - intensityMod 'minus' cand deload intensityModifier active
//   - empty stores defensive → does not throw
//   - exercise mapping engine → PlannedExercise (id/name/sets/targetReps/targetKg/restSec)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  composePlannedWorkoutToday,
  buildUserStateForPipeline,
  ENGINE_WORKOUT_TITLE_FALLBACK,
} from '../../lib/scheduleAdapterAggregate';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';
import {
  CALENDAR_OVERRIDE_KEY,
  commitCalendarEdit,
  getWeekStartIso,
  getDailyWorkout,
} from '../../../engine/schedule/scheduleAdapter.js';
import { DB, tod } from '../../../db.js';
import { MS_PER_DAY } from '../../../constants.js';
import { suggestStartWeight } from '../../../engine/coldStartGuidelines.js';
import { resolveMaxKg } from '../../../engine/dp/loadModel.js';
import { getExerciseMetadata } from '../../../engine/exerciseLibrary.js';
import { isBodyweightExercise } from '../../../engine/bodyweightLoad.js';
import { isEnabled, DEV_FLAGS_KEY } from '../../../util/featureFlags.js';
import { DP } from '../../../engine/dp.js';

const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M, PULL session)
const MONDAY_2026_05_18 = new Date(2026, 4, 18);  // dayIdx 0 (L, PUSH session)

function resetStores(): void {
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
    completed: true,
    completedAt: Date.now(),
  });
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    sessionsHistory: [],
    streak: 0,
  });
}

beforeEach(() => {
  localStorage.clear();
  resetStores();
  vi.restoreAllMocks();
});

describe('scheduleAdapterAggregate — composePlannedWorkoutToday real wire async', () => {
  it('returns PlannedWorkoutOutput shape on training day', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(typeof out!.workoutTitle).toBe('string');
    expect(typeof out!.exerciseCount).toBe('number');
    expect(typeof out!.estimatedDuration).toBe('number');
    expect(['plus', 'normal', 'minus']).toContain(out!.intensityMod);
    expect(Array.isArray(out!.exercises)).toBe(true);
    expect(typeof out!.volumeKg).toBe('number');
  });

  it('returns null on rest day calendar override', async () => {
    commitCalendarEdit(
      [
        { day: 'L', active: false },
        { day: 'M', active: true },
        { day: 'M2', active: true },
        { day: 'J', active: true },
        { day: 'V', active: true },
        { day: 'S', active: false },
        { day: 'D', active: false },
      ],
      MONDAY_2026_05_18,
    );
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(out).toBeNull();
  });

  it('exerciseCount matches exercises.length', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.exerciseCount).toBe(out!.exercises.length);
  });

  it('exercises map engine output to PlannedExercise shape (id/name/sets/targetReps/targetKg/restSec)', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    if (out!.exercises.length > 0) {
      const ex = out!.exercises[0]!;
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.name).toBe('string');
      expect(typeof ex.sets).toBe('number');
      expect(typeof ex.targetReps).toBe('number');
      expect(typeof ex.targetKg).toBe('number');
      expect(typeof ex.restSec).toBe('number');
    }
  });

  it('workoutTitle defaults to the engine fallback sentinel (NO RO leak in source)', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.workoutTitle).toBe(ENGINE_WORKOUT_TITLE_FALLBACK);
    // Sentinel is a non-localized machine marker — render boundaries resolve it
    // to a locale-aware title via t(); the source never carries Romanian copy.
    expect(/[ăâîșțĂÂÎȘȚ]/.test(out!.workoutTitle)).toBe(false);
  });

  it('estimatedDuration computed real din seturi+odihna (NU hardcode 50)', async () => {
    // Audit HIGH — durata e calculata din volumul de seturi (sets × (lucru +
    // odihna)) + incalzire, NU mai e hardcode-ul 50 din engine. O sesiune cu
    // exercitii → durata pozitiva derivata real.
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(typeof out!.estimatedDuration).toBe('number');
    expect(out!.estimatedDuration).toBeGreaterThan(0);
  });

  it('intensityMod normal when no deload intensityModifier', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.intensityMod).toBe('normal');
  });

  it('empty stores → defensive defaults, pipeline completes', async () => {
    useOnboardingStore.setState({
      data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null, height: null },
      completed: false,
      completedAt: null,
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out === null || typeof out.workoutTitle === 'string').toBe(true);
  });

  it('returns null when pipeline throws unexpectedly (D4 insurance)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockRejectedValueOnce(new Error('boom'));
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).toBeNull();
  });

  it('returns null when getDailyWorkout returns null (rest day OR halt)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce(null);
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).toBeNull();
  });

  it('exercise id slug derived from engine name lowercase + dashes', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    if (out!.exercises.length > 0) {
      // ids should be kebab-case from engine exercise names + index suffix
      out!.exercises.forEach((ex) => {
        expect(ex.id).toMatch(/^[a-z0-9-]+$/);
      });
    }
  });

  it('volumeKg computed real din exercitii (sets×reps×kg), NU 0 hardcodat', async () => {
    // Audit HIGH "0 kg" — tonajul e calculat din exercitiile prescrise (targetKg/
    // targetReps reale), NU hardcode-ul 0 din engine. Sesiune cu exercitii cu
    // greutate → tonaj pozitiv.
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBeGreaterThanOrEqual(0);
    if (out!.exercises.some((e) => e.targetKg > 0)) {
      expect(out!.volumeKg).toBeGreaterThan(0);
    }
  });

  // ── F2 — COLD-START load clamped to the defensive MAX_KG (Daniel live 2026-06-10)
  // Empty history → every external-load exercise is a cold-start seed (population
  // prior / suggestStartWeight). Before F2 those snapped to the ladder TOP with no
  // ceiling (Y Raise umeri/db → 25 despite an 18 cap), because dp.recommend's at-cap
  // brake keys on the PRIOR logged weight (inert at cold-start). The compose path now
  // applies the same resolveMaxKg cap where the cold-start rec is born. Assert the
  // session-wide invariant: no cold-start external load exceeds its cap.
  it('cold-start external loads never exceed the exercise defensive MAX_KG (F2)', async () => {
    const flagOn = isEnabled('dp_load_model_v1');
    // Drive several real cold-start sessions (no history seeded) across days.
    for (const day of [TUESDAY_2026_05_19, MONDAY_2026_05_18]) {
      const out = await composePlannedWorkoutToday(day);
      if (!out) continue;
      for (const ex of out.exercises) {
        if (isBodyweightExercise(ex.engineName ?? ex.name)) continue; // bodyweight = added load
        const cap = resolveMaxKg({
          curated: (DP.MAX_KG as Record<string, number>)[ex.engineName ?? ex.name],
          meta: getExerciseMetadata(ex.engineName ?? ex.name),
          flagOn,
        });
        if (cap != null && cap > 0) {
          expect(ex.targetKg).toBeLessThanOrEqual(cap);
        }
      }
    }
  });

  // ── FOCUS PERSISTENCE → RECOMPUTE (D-focus-visible 2026-06-05) ─────────────
  // Daniel: "whatever I pick I get the v-taper workout." This proves the live
  // wire is NOT cached/memoized: writing onboardingStore.data.focusPreset (the
  // EXACT key SettingsProfile.handleSave → setField persists) changes the NEXT
  // composePlannedWorkoutToday output. buildUserStateForPipeline reads the store
  // fresh on every compose call (no module cache), so the Coach plan re-derives
  // the moment the selector changes.
  function sig(out: NonNullable<Awaited<ReturnType<typeof composePlannedWorkoutToday>>>): string {
    return out.exercises.map((e) => `${e.name}:${e.sets}`).join('|');
  }

  it('changing onboardingStore.focusPreset changes the next plan (no cache)', async () => {
    // Baseline (balanced) plan for the SAME day + state.
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175, focusPreset: 'balanced' },
      completed: true,
      completedAt: Date.now(),
    });
    const balanced = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(balanced).not.toBeNull();

    // The user changes the focus selector → setField writes data.focusPreset.
    // Mirror that exact mutation (the only thing that changed).
    useOnboardingStore.getState().setField('focusPreset', 'arms');
    const arms = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(arms).not.toBeNull();

    // The plan re-derived: a different generated session, NOT a stale clone.
    expect(sig(arms!)).not.toBe(sig(balanced!));
  });

  it('focusPreset is threaded into the pipeline userState (buildUserStateForPipeline)', async () => {
    useOnboardingStore.getState().setField('focusPreset', 'v-taper');
    const state = buildUserStateForPipeline();
    expect((state.user as { focusPreset?: string }).focusPreset).toBe('v-taper');
    // Default (no preset set) → 'balanced' (opt-in default, ZERO change).
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    expect((buildUserStateForPipeline().user as { focusPreset?: string }).focusPreset).toBe('balanced');
  });
});

describe('scheduleAdapterAggregate — week boundary + storage key safety', () => {
  it('does NOT crash when CALENDAR_OVERRIDE_KEY contains malformed JSON', async () => {
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, '{not valid json');
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out === null || typeof out.workoutTitle === 'string').toBe(true);
  });

  it('ignores stale override from prior week (Reset Luni natural)', async () => {
    const lastWeekTuesday = new Date(2026, 4, 12);
    commitCalendarEdit(
      [{ day: 'L', active: false }, { day: 'M', active: false }, { day: 'M2', active: false },
       { day: 'J', active: false }, { day: 'V', active: false }, { day: 'S', active: false },
       { day: 'D', active: false }],
      lastWeekTuesday,
    );
    // Current week (May 18 Monday-start) reads → stale override ignored → training day
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(getWeekStartIso(TUESDAY_2026_05_19)).toBe('2026-05-18');
  });
});

// LOW-CODE-09 — nullish coalescing preserves legitimate 0/empty engine values
// (anti-falsy-coercion silent shape mismatch). Mocks getDailyWorkout pentru
// scenarii sintetice care altfel pe pipeline real nu apar (engine emits
// concrete defaults src/engine/schedule/scheduleAdapter.js:493-495).
describe('scheduleAdapterAggregate — falsy-coercion nullish coalesce LOW-CODE-09', () => {
  const STUB_PLAN_BASE = {
    type: 'training' as const,
    sessionType: 'FULL_UPPER',
    warmup: null,
    exercises: [] as Array<{ name: string; sets: number }>,
    intensityModifier: null,
    volumeTargets: null,
    restTimeRange: null,
    specializationTarget: null,
    deloadState: 'IDLE',
  };

  it('preserves volumeKg=0 from engine (NOT coerced to fallback)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 50,
      volumeKg: 0,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBe(0);
  });

  it('preserves estimatedDuration=0 from engine when explicitly emitted (NOT coerced to 50)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 0,
      volumeKg: 100,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.estimatedDuration).toBe(0);
  });

  it('preserves volumeKg=0 + estimatedDuration=42 + workoutTitle non-empty simultaneously', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 42,
      volumeKg: 0,
      workoutTitle: 'Antrenament Push',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBe(0);
    expect(out!.estimatedDuration).toBe(42);
    expect(out!.workoutTitle).toBe('Antrenament Push');
  });

  it('falls back to the engine fallback sentinel when engine workoutTitle null (NU empty string coerce)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 50,
      volumeKg: 0,
      // @ts-expect-error — sintetic null testeaza null path; engine real
      // garanteaza string non-null per scheduleAdapter.js:495.
      workoutTitle: null,
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.workoutTitle).toBe(ENGINE_WORKOUT_TITLE_FALLBACK);
  });

  it('falls back to 50 when engine estimatedDurationMin null/undefined (NU 0 coerce)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      // @ts-expect-error — sintetic undefined testeaza nullish path
      estimatedDurationMin: undefined,
      volumeKg: 0,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.estimatedDuration).toBe(50);
  });

  it('falls back to 0 when engine volumeKg null/undefined (idempotent for 0 case)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 50,
      // @ts-expect-error — sintetic undefined testeaza nullish path
      volumeKg: undefined,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBe(0);
  });
});

// ── C1: weights from the DP brain (no longer hardcoded 20 / 10) ────────────
// MONDAY 2026-05-18 = the freq-'4' user's 1st active day → UPPER cluster (spate
// 0.25 → 'Lat Pulldown' EN canonical surfaces). (Volume-driven split 2026-06-02
// moved the back day off the absolute weekday onto the active-day position.)
// Tests prove:
//   - logged-history user gets a DP-derived weight (NOT the old hardcode 20)
//   - cold-start user gets a per-exercise population prior scaled by experience
//   - the EN canonical name keys DP/cold-start (RO display never leaks into the
//     engine lookup)
describe('scheduleAdapterAggregate — C1 DP/cold-start weight wiring', () => {
  function findByEnSlug(
    exercises: ReadonlyArray<{ id: string; targetKg: number; targetReps: number }>,
    enName: string,
  ): { id: string; targetKg: number; targetReps: number } | undefined {
    const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return exercises.find((e) => e.id.startsWith(`${slug}-`));
  }

  it('logged-history exercise gets a DP weight, NOT the old hardcoded 20', async () => {
    // Seed real per-set logs for Lat Pulldown (English canonical key DP reads).
    // 3 sessions at 56 kg below top reps → DP CONSOLIDATE holds last weight,
    // snapped to the equipment stack (bailib_stack 56 -> 55).
    DB.set('logs', [
      { ex: 'Lat Pulldown', w: 56, reps: '9', set: 1, ts: Date.now() - 1000 },
      { ex: 'Lat Pulldown', w: 56, reps: '9', set: 1, ts: Date.now() - 2000 },
      { ex: 'Lat Pulldown', w: 56, reps: '9', set: 1, ts: Date.now() - 3000 },
    ]);
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(out).not.toBeNull();
    const lat = findByEnSlug(out!.exercises, 'Lat Pulldown');
    expect(lat).toBeDefined();
    // Real DP output (55, equipment-rounded) — proves the brain is wired, NOT
    // the dead 20 default NOR the cold-start prior (30 for this exercise).
    expect(lat!.targetKg).toBe(55);
    expect(lat!.targetKg).not.toBe(20);
    expect(lat!.targetKg).not.toBe(suggestStartWeight('Lat Pulldown', 'intermediate'));
    // DP repsTarget wired too (not a hardcode). The seeded logs carry no rpe, so
    // DP reads the default RPE 7 = MEDIUM band → modest standard +1 rep (9 -> 10).
    // (Before the 2026-06-04 rating-driven rewrite, RPE<=7 blanket-added +2 = 11;
    // +1 is the correct medium fill — the decisive +1-then-weight is reserved for
    // an actual EASY rating, RPE<=6.5.)
    expect(lat!.targetReps).toBe(10);
  });

  it('cold-start (no logs) uses suggestStartWeight scaled by experience + bodyweight', async () => {
    // No logs → cold-start path. The composer now threads the user's bodyweight
    // (75kg) + sex into suggestStartWeight, so Lat Pulldown intermediate scales
    // by the bodyweight model (75 * 0.72 * 1.0 * 1.0 = 54), NOT the bare 70kg-
    // reference prior (30). This is the cold-start fix: a heavier user gets a
    // heavier, still-conservative start. (Fraction raised 0.62 -> 0.72, Target 4.)
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(out).not.toBeNull();
    // tier-select anchor (2026-06-09): the back::pulldown anchor now follows the
    // SELECTION band, so the S-band 'Wide-Grip Lat Pulldown' leads the (no-log)
    // cold-start session over the out-ranked plain 'Lat Pulldown' (same movement key).
    const lat = findByEnSlug(out!.exercises, 'Wide-Grip Lat Pulldown');
    expect(lat).toBeDefined();
    // dp_population_prior_v1 ON (THE FLIP 2026-06-08) + #80 cold-start safety damps:
    // the cold-start seeds from the published per-exercise strength-standard prior,
    // back-solved in e1RM space, then damped by the policy's no-history confidence
    // (×0.92) + load-AXIS (pulldown = cable ×0.80; age 30 → no age damp). For a
    // 75kg intermediate male this lands a sensible, machine-settable 40kg (down from
    // the pre-#80 50 — undershoot+ramp > overshoot; the first set recalibrates).
    expect(lat!.targetKg).toBe(40);
  });

  it('experience RO->EN scaling: avansat (advanced 1.3x) beats incepator (beginner 0.7x)', async () => {
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'incepator', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    const begOut = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    // tier-select anchor (2026-06-09): the no-log back::pulldown anchor follows the
    // SELECTION band, which is experience-scored — beginner leads with the S-band
    // 'Wide-Grip Lat Pulldown', advanced with the higher-band 'Single-Arm Lat Pulldown'
    // (both same pulldown movement, both out-ranking the plain 'Lat Pulldown').
    const begLat = findByEnSlug(begOut!.exercises, 'Wide-Grip Lat Pulldown');

    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'avansat', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    const advOut = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const advLat = findByEnSlug(advOut!.exercises, 'Single-Arm Lat Pulldown');

    expect(begLat).toBeDefined();
    expect(advLat).toBeDefined();
    // dp_population_prior_v1 ON (THE FLIP 2026-06-08) + #80 cold-start safety damps:
    // the cold-start seeds from the strength-standard prior scaled by training age,
    // then damped by no-history confidence (×0.92) + load-AXIS (cable ×0.80; age 30
    // → no age damp). The RO experience strings still map to EN buckets (advanced
    // strictly heavier than beginner — NOT a silent tie at the x1.0 default).
    expect(advLat!.targetKg).toBeGreaterThan(begLat!.targetKg);
    expect(begLat!.targetKg).toBe(25); // #80-damped conservative beginner prior (cable axis + confidence), stack-snapped
    // Advanced #80-damped prior snaps to 50 on the bailib stack — heavier than the
    // beginner seed, but the policy damps keep it below the undamped raw fraction.
    expect(advLat!.targetKg).toBe(50);
  });

  it('preserves Romanian display name + sub while wiring engine weight', async () => {
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(out).not.toBeNull();
    // tier-select anchor (2026-06-09): no-log cold-start leads with the S-band
    // 'Wide-Grip Lat Pulldown' (same pulldown movement, out-ranks plain 'Lat Pulldown').
    const lat = findByEnSlug(out!.exercises, 'Wide-Grip Lat Pulldown');
    expect(lat).toBeDefined();
    // id stays English-canonical slug (engine identity) while the user-facing
    // exercise carries the RO display (exro base preserved through C1 merge).
    const full = out!.exercises.find((e) => e.id === lat!.id) as { name: string } | undefined;
    expect(full).toBeDefined();
    expect(typeof full!.name).toBe('string');
    expect(full!.name.length).toBeGreaterThan(0);
  });
});

// ── FIX #1: readiness GATES the planned weight (DP.getSmartRecommendation) ──
// Anti-recurrence of the cycle-4 "vizor fara usa": the live planner used to call
// bare DP.recommend(), so today's readiness never touched the prescribed kg.
// These tests drive the REAL pipeline (NO mock of the engine path) and prove a
// DIFFERENT readiness produces a DIFFERENT recommended kg end-to-end:
//   - seed Lat Pulldown at top reps (12) + light RPE → DP base = INCREASE day
//   - LOW readiness (<60) → getSmartRecommendation HOLDS weight at lastW (55)
//   - HIGH readiness → INCREASE intact → +1 step (55 -> 59 -> stack-rounded 60)
// Readiness reads the REAL `tod()` (engine internal Date), so we seed against it.
describe('scheduleAdapterAggregate — FIX #1 readiness-gated planned weight', () => {
  function findByEnSlug(
    exercises: ReadonlyArray<{ id: string; targetKg: number; targetReps: number }>,
    enName: string,
  ): { id: string; targetKg: number; targetReps: number } | undefined {
    const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return exercises.find((e) => e.id.startsWith(`${slug}-`));
  }

  // Lat Pulldown at top reps (12) / RPE 7 across 3 sessions → DP INCREASE branch
  // (atTopReps && lastRPE <= 8). 55 kg already sits on the bailib_stack.
  function seedIncreaseDayLogs(): void {
    DB.set('logs', [
      { ex: 'Lat Pulldown', w: 55, reps: '12', rpe: 7, set: 1, ts: Date.now() - 1000 },
      { ex: 'Lat Pulldown', w: 55, reps: '12', rpe: 7, set: 1, ts: Date.now() - 2000 },
      { ex: 'Lat Pulldown', w: 55, reps: '12', rpe: 7, set: 1, ts: Date.now() - 3000 },
    ]);
  }

  function yesterdayKey(): string {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y.toLocaleDateString('sv');
  }

  it('LOW readiness (<60) HOLDS the INCREASE weight; HIGH readiness adds a step', async () => {
    // ── LOW readiness: energy 1 (=60) + a big kcal deficit yesterday (-20) → 40.
    seedIncreaseDayLogs();
    DB.set('readiness', { [tod()]: 1 });
    DB.set('kcals', { [yesterdayKey()]: 1000 }); // 50% of KCAL_TARGET 2000 → -20
    const lowOut = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const lowLat = findByEnSlug(lowOut!.exercises, 'Lat Pulldown');
    expect(lowLat).toBeDefined();
    // Readiness gate held the weight at lastW (55), did NOT add the +step.
    expect(lowLat!.targetKg).toBe(55);

    // ── HIGH readiness: energy 5 (=100), no deficit. Same logs → INCREASE fires.
    seedIncreaseDayLogs();
    DB.set('readiness', { [tod()]: 5 });
    DB.set('kcals', {});
    const highOut = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const highLat = findByEnSlug(highOut!.exercises, 'Lat Pulldown');
    expect(highLat).toBeDefined();
    // HIGH readiness → the climb fires: 55 → 60 (bailib_stack). dp_e1rm_v1 ON (THE
    // FLIP 2026-06-08) routes the 55×12 top-reps climb through the find-your-weight
    // CATCH UP (e1RM-credited working load) instead of the raw +1-step INCREASE, but
    // through the full compose path it lands on the same 60 rung. Strictly heavier than
    // the LOW (gated-hold 55) arm — proving readiness still gates the climb (the gate
    // now covers CATCH UP, not only INCREASE).
    expect(highLat!.targetKg).toBe(60);
    expect(highLat!.targetKg).toBeGreaterThan(lowLat!.targetKg);
  });

  it('readiness reaches the engine: low-readiness kg differs from no-readiness kg', async () => {
    // No energy-check today (readiness null) → engine runs plain double-
    // progression (INCREASE → 60). Then a LOW readiness → held at 55. The two
    // diverging numbers prove the score is CONSUMED, not ignored.
    seedIncreaseDayLogs();
    DB.set('readiness', {}); // none today → getComputedReadinessScore() = null
    const noReadyOut = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const noReadyLat = findByEnSlug(noReadyOut!.exercises, 'Lat Pulldown');
    // Ungated climb → 60 (bailib_stack). dp_e1rm_v1 ON routes it through the find-your-
    // weight CATCH UP but lands on the same 60 rung through the full compose path.
    expect(noReadyLat!.targetKg).toBe(60);

    seedIncreaseDayLogs();
    DB.set('readiness', { [tod()]: 1 });
    DB.set('kcals', { [yesterdayKey()]: 1000 });
    const lowOut = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const lowLat = findByEnSlug(lowOut!.exercises, 'Lat Pulldown');
    expect(lowLat!.targetKg).toBe(55); // gated hold
    expect(lowLat!.targetKg).not.toBe(noReadyLat!.targetKg);
  });
});

// ── FIX #4: rest time comes from the engine, not the hardcoded 90 ──────────
// The planner stamped restSec: 90 for EVERY exercise; the goal-adaptation rest
// range (rest_time_modifier [minSec, maxSec]) was computed but dropped at the
// getDailyWorkout boundary. Now getDailyWorkout returns restTimeRange and the
// planner maps it per exercise: compounds (COMPOUND_EX) rest at MAX, isolation
// at MIN. MONDAY = the freq-'4' user's UPPER day: Lat Pulldown (compound,
// COMPOUND_EX) + DB Preacher Curl (isolation) both survive the equipment filter
// (upper cluster trains spate + biceps). (Isolation pin updated from Bayesian Curl
// to DB Preacher Curl 2026-06-09: the dp_daniel_tier_select_v1 default-ON flip
// changed WHICH movements the selection composes — Lat Pulldown stays the picked
// compound, DB Preacher Curl is the picked biceps isolation. The INVARIANT is
// unchanged and STILL HOLDS: compound = range MAX, isolation = range MIN.)
describe('scheduleAdapterAggregate — FIX #4 engine-sourced rest time', () => {
  function findByEnSlug(
    exercises: ReadonlyArray<{ id: string; restSec: number }>,
    enName: string,
  ): { id: string; restSec: number } | undefined {
    const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return exercises.find((e) => e.id.startsWith(`${slug}-`));
  }

  it('rest range reaches the planner: compound restSec = range MAX, isolation = range MIN', async () => {
    // Read the engine rest range directly from the SAME pipeline the composer
    // drives (real builder userState) — proves the planner consumes THIS range.
    const userState = buildUserStateForPipeline();
    const plan = await getDailyWorkout(userState, MONDAY_2026_05_18);
    expect(plan).not.toBeNull();
    const range = plan!.restTimeRange as readonly [number, number] | null;
    expect(Array.isArray(range)).toBe(true);
    const [minSec, maxSec] = range!;
    expect(maxSec).toBeGreaterThan(minSec); // a real range, not a point

    // tier-select anchor (2026-06-09): the no-log back::pulldown anchor follows the
    // SELECTION band, which surfaces a pulldown VARIANT ('Wide-Grip Lat Pulldown')
    // not in the canonical COMPOUND_EX list — so this test (which probes COMPOUND_EX
    // → rest MAX) seeds a 'Lat Pulldown' log so the canonical COMPOUND_EX member wins
    // the anchor (its hasLog tierSelect boost out-scores the variant), keeping the
    // compound-vs-isolation rest contract under test.
    DB.set('logs', [
      { ex: 'Lat Pulldown', w: 56, reps: '9', set: 1, ts: Date.now() - 1000 },
    ]);
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const compound = findByEnSlug(out!.exercises, 'Lat Pulldown'); // COMPOUND_EX
    const isolation = findByEnSlug(out!.exercises, 'DB Preacher Curl'); // isolation
    expect(compound).toBeDefined();
    expect(isolation).toBeDefined();
    // Wired end-to-end: compound takes the engine range MAX, isolation the MIN.
    expect(compound!.restSec).toBe(maxSec);
    expect(isolation!.restSec).toBe(minSec);
    // ...and it is NOT the dead hardcoded 90 for both.
    expect(compound!.restSec).toBeGreaterThan(isolation!.restSec);
  });

  it('every planned exercise rests per its compound/isolation class (not a flat 90)', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.exercises.length).toBeGreaterThan(1);
    const restValues = out!.exercises.map((e) => e.restSec);
    // At least two distinct rest values across the session (compound vs iso) —
    // the old code produced a single value (90) for every exercise.
    expect(new Set(restValues).size).toBeGreaterThan(1);
  });

  it('falls back to 90s when the engine emits no rest range (empty user)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      type: 'training',
      sessionType: 'PULL',
      warmup: null,
      exercises: [{ name: 'Lat Pulldown', sets: 3 }],
      intensityModifier: null,
      volumeTargets: null,
      restTimeRange: null, // engine emitted no range
      specializationTarget: null,
      deloadState: 'IDLE',
      estimatedDurationMin: 50,
      volumeKg: 0,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out!.exercises[0]!.restSec).toBe(90); // documented fallback
  });
});

// ── FIX #6 (partial): reactive deload AA trigger from sustained energy-down ──
// The deload reactive triggers read meta fields the builder never assembled, so
// reactive deload could essentially never fire. The cleanly-available trigger is
// energy-down sustained: the builder already stamps energyDirection on
// recentSessions[*] (from persisted energyEmoji) but the deload engine reads
// meta.recentSessionsForEnergy (field-name mismatch, audit §2). Pointing that
// meta field at the same array closes the gap. These tests drive the REAL
// pipeline: 3 consecutive red-energy sessions -> REACTIVE_AA deload -> non-zero
// intensity_modifier -> intensityMod 'minus' on the plan (which the Workout
// screen multiplies into a lighter target). The COMPOSITE trigger
// (performanceDropPct/restTimeMultiplier/rirMismatch) needs CDL telemetry not
// assembled here and stays DEFERRED (see final report).
describe('scheduleAdapterAggregate — FIX #6 reactive deload (energy-down sustained)', () => {
  // A persisted session with a red energy traffic-light (builder maps red->DOWN).
  function redSessionAt(daysAgo: number): LastSessionSummary {
    const ts = Date.now() - daysAgo * MS_PER_DAY;
    return {
      title: 'Pull',
      meta: 'x',
      ts,
      energyEmoji: 'red',
      energy: 'red',
      exercises: [
        {
          exerciseId: 'lat-pulldown',
          exerciseName: 'Lat Pulldown',
          sets: [{ kg: 50, reps: 10, rating: 'greu', timestamp: ts + 1000 }],
          totalVolume: 500,
          peakOneRM: 65,
        },
      ],
    };
  }

  function greenSessionAt(daysAgo: number): LastSessionSummary {
    return { ...redSessionAt(daysAgo), energyEmoji: 'green', energy: 'green' };
  }

  it('3 consecutive red-energy sessions → reactive deload → intensityMod "minus"', async () => {
    // sessionsHistory is newest-tail; the builder reverses to newest-first, so
    // these become the 3 most-recent for isEnergyDownSustained.
    useWorkoutStore.setState({
      sessionsHistory: [redSessionAt(3), redSessionAt(2), redSessionAt(1)],
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    // Reactive AA deload fired end-to-end → the plan carries the deload cut.
    expect(out!.intensityMod).toBe('minus');
  });

  it('green-energy sessions → no reactive deload → intensityMod stays "normal"', async () => {
    useWorkoutStore.setState({
      sessionsHistory: [greenSessionAt(3), greenSessionAt(2), greenSessionAt(1)],
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.intensityMod).toBe('normal');
  });

  it('only 2 red sessions → below the 3-consecutive threshold → no reactive deload', async () => {
    useWorkoutStore.setState({
      sessionsHistory: [redSessionAt(2), redSessionAt(1)],
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.intensityMod).toBe('normal');
  });
});

// ── FIX #3: periodization weeksElapsed advances the mesocycle (macrocycle anchor) ──
// The audit's exact finding: buildUserStateForPipeline NEVER set meta.weeksElapsed,
// so periodization saw NaN → hasMacrocycleAnchor=false → every user frozen at
// macrocycle week 0 forever (block 1 / meso 1 / LOAD, scheduled deload could never
// fire). The builder now derives weeksElapsed = trainingWeeks (weeks since the
// earliest logged session). These tests drive the REAL pipeline (NO engine mock)
// and prove the week-4-of-mesocycle SCHEDULED deload fires once the training
// history is old enough — i.e. accumulated weeks actually move the prescription.
// (Probed against the raw engine: weeksElapsed 3 → deloadState SCHEDULED_LINEAR +
// intensity_pct_decrement 12.5 → intensityMod 'minus'; weeksElapsed 0/4/8 → IDLE.)
describe('scheduleAdapterAggregate — FIX #3 periodization weeksElapsed advances mesocycle', () => {
  // A non-red session (green energy → no reactive-deload confound) whose ts sits
  // `daysAgo` in the past. trainingWeeks = floor(daysAgo / 7) = weeksElapsed, so
  // 24 days → 3 weeks → mesocycle week 4 (0-indexed 3) → scheduled deload window.
  function greenSessionDaysAgo(daysAgo: number): LastSessionSummary {
    const ts = Date.now() - daysAgo * MS_PER_DAY;
    return {
      title: 'Pull',
      meta: 'x',
      ts,
      energyEmoji: 'green',
      energy: 'green',
      exercises: [
        {
          exerciseId: 'lat-pulldown',
          exerciseName: 'Lat Pulldown',
          sets: [{ kg: 50, reps: 10, rating: 'potrivit', timestamp: ts + 1000 }],
          totalVolume: 500,
          peakOneRM: 65,
        },
      ],
    };
  }

  it('fresh history (week 0) → no scheduled deload → intensityMod "normal"', async () => {
    // Earliest session 3 days ago → weeksElapsed 0 → mesocycle week 1 (LOAD).
    useWorkoutStore.setState({ sessionsHistory: [greenSessionDaysAgo(3)] });
    const us = buildUserStateForPipeline();
    expect(us.meta.weeksElapsed).toBe(0);
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.intensityMod).toBe('normal');
  });

  it('~3 weeks of history → mesocycle week 4 scheduled deload → intensityMod "minus"', async () => {
    // Earliest session 24 days ago → weeksElapsed 3 → mesocycle week 4 deload.
    useWorkoutStore.setState({ sessionsHistory: [greenSessionDaysAgo(24)] });
    const us = buildUserStateForPipeline();
    expect(us.meta.weeksElapsed).toBe(3);
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    // The macrocycle anchor is live: accumulated weeks drove the scheduled deload
    // (was permanently frozen at week 0 before the wire). Green energy rules out
    // the reactive-deload path → this 'minus' is the periodization week-4 cut.
    expect(out!.intensityMod).toBe('minus');
  });

  it('weeksElapsed differs with training age → the prescription is NOT frozen at week 0', async () => {
    useWorkoutStore.setState({ sessionsHistory: [greenSessionDaysAgo(3)] });
    const weekZero = await composePlannedWorkoutToday(TUESDAY_2026_05_19);

    useWorkoutStore.setState({ sessionsHistory: [greenSessionDaysAgo(24)] });
    const weekFour = await composePlannedWorkoutToday(TUESDAY_2026_05_19);

    // Same user, same calendar day — only the training-history age differs, yet
    // the mesocycle position moves the deload state. A regression that dropped
    // weeksElapsed (NaN → frozen) would tie both at 'normal'.
    expect(weekZero!.intensityMod).toBe('normal');
    expect(weekFour!.intensityMod).toBe('minus');
    expect(weekFour!.intensityMod).not.toBe(weekZero!.intensityMod);
  });
});

// ── dp_lifedip_inputs_v1: REAL closed-days + kcal-shortfall into the #32 classifier ──
// The #32 LIFE_DIP classifier reads lifestyle.closedDaysRecent (>=2 missed sessions →
// trigger) + lifestyle.kcalShortfall (a real deficit → trigger), but the builder fed
// both HARD-CODED zeros, so 2 of its 3 lifestyle triggers were DEAD — only the
// in-fatigue sleep trigger could ever fire. This flag threads the REAL signals
// (computeAdherence skipped-count + a CUT-with-deficit flag) through the builder, and
// the wiring is observable on userState.meta.suppressReactiveDeload (set true ONLY when
// the classifier returns a LIFE_DIP, which suppresses the reactive deload).
//
// The scenario isolates the NEW inputs: a dip is present via 4 FATIGUE notes
// (recommend='deload', sleepBad=0 — so the sleep trigger is NOT the cause), at LOW
// volume (steady 4-week logs → ACWR ~1.0 ≤ LIFEDIP_MAX, not the FATIGUE guard), with no
// systemic drift. With closedDaysRecent fed REAL (>=2 skipped CDL outcomes) the cause is
// lifestyle → LIFE_DIP → suppress; fed the OLD zero it is plain FATIGUE → no suppress.
describe('scheduleAdapterAggregate — dp_lifedip_inputs_v1 real LIFE_DIP inputs (#32 wiring)', () => {
  // dp_dip_classifier_v1 must be ON for the telemetry to compute at all; this suite
  // toggles ONLY the new dp_lifedip_inputs_v1 (real-vs-zero inputs), keeping every
  // other flag at its registry default — the A/B isolates exactly the new wiring.
  function setLifedipFlag(on: boolean): void {
    localStorage.setItem(
      DEV_FLAGS_KEY,
      JSON.stringify({ dp_dip_classifier_v1: true, dp_lifedip_inputs_v1: on }),
    );
  }

  // A CUT user (goal 'slabire' → resolveActivePhase 'CUT'); with no target the default
  // 20% deficit (CUT_DEFICIT_FRACTION_DEFAULT) → severity ~0.20 ≥ the 0.10 threshold →
  // kcalShortfall true when the flag is ON. Real per-user maintenance TDEE derives from
  // these onboarding stats (readUserMaintenanceTDEE), so resolveEnergyMagnitude is non-null.
  function setCutUser(): void {
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'slabire', frequency: '4', experience: 'intermediar', weight: 80, height: 178 },
      completed: true,
      completedAt: Date.now(),
    });
  }

  // Steady, evenly-spread 4-week log history at a FIXED working load → ACWR ~1.0 (a real
  // chronic baseline, NOT the >=1.5 spike that forces FATIGUE), and the 4 most-recent
  // sessions each carry a 'fatigue' note (fatigue>=4 → calculateFatigueScore recommend
  // 'deload', sleepBad 0 — the dip is present but NOT sleep-sourced). 'Lat Pulldown' is a
  // real curated CORE_AUTO lift (spate primary) so computeACWR sees its muscle map →
  // steady 8-session/3.5d history yields ACWR exactly 1.0 (<= ACWR_LIFEDIP_MAX). session
  // keys group the logs for calculateFatigueScore; no gap → DP._returnDeload stays null
  // (not DETRAINING), so the gap branch does not pre-empt the LIFE_DIP classification.
  function seedLowVolumeFatiguedHistory(now: number): void {
    const logs: Array<Record<string, unknown>> = [];
    // 8 sessions across ~25 days (every ~3.5d) at the SAME load → steady volume.
    for (let i = 0; i < 8; i++) {
      const ts = now - Math.round(i * 3.5 * MS_PER_DAY) - MS_PER_DAY; // all in the past
      const recent = i < 4; // the 4 newest sessions carry the fatigue note
      logs.push({
        ex: 'Lat Pulldown',
        session: `s${i}`,
        w: 60,
        reps: '8',
        rpe: 8,
        set: 1,
        ts,
        date: new Date(ts).toLocaleDateString('sv'),
        ...(recent ? { notes: ['fatigue'] } : {}),
      });
    }
    DB.set('logs', logs);
  }

  // Seed N recent SKIPPED coach-decision outcomes inside the 14-day adherence window so
  // computeAdherence({ windowDays: 14 }).skipped === N (closedDaysRecent). Real CDL shape:
  // a non-synthetic, non-superseded entry with outcome.executed === false counts as skipped.
  function seedSkippedCdl(n: number, now: number): void {
    const entries = [];
    for (let i = 0; i < n; i++) {
      const ts = now - (i + 1) * MS_PER_DAY; // 1..n days ago (well inside 14d)
      entries.push({
        id: `cdl-skip-${i}`,
        ts,
        date: new Date(ts).toLocaleDateString('sv'),
        synthetic: false,
        superseded: false,
        proposed: {},
        outcome: { executed: false },
      });
    }
    DB.set('coach-decisions', entries);
  }

  it('flag OFF → closedDaysRecent fed 0 (byte-identical) → plain FATIGUE, NO suppression', () => {
    const now = Date.now();
    setCutUser();
    seedLowVolumeFatiguedHistory(now);
    seedSkippedCdl(3, now); // 3 real skips exist — but OFF must IGNORE them (zeros)
    setLifedipFlag(false);

    expect(isEnabled('dp_lifedip_inputs_v1')).toBe(false);
    const state = buildUserStateForPipeline();
    // OFF threads { closedDaysRecent: 0, kcalShortfall: false } → no lifestyle source →
    // the dip stays FATIGUE → suppressReactiveDeload is never set (undefined).
    expect((state.meta as { suppressReactiveDeload?: boolean }).suppressReactiveDeload).toBeUndefined();
  });

  it('flag ON → real >=2 skipped sessions thread closedDaysRecent → LIFE_DIP suppresses the deload', () => {
    const now = Date.now();
    setCutUser();
    seedLowVolumeFatiguedHistory(now);
    seedSkippedCdl(3, now); // computeAdherence({windowDays:14}).skipped === 3 (>= 2)
    setLifedipFlag(true);

    expect(isEnabled('dp_lifedip_inputs_v1')).toBe(true);
    const state = buildUserStateForPipeline();
    // ON threads the REAL closedDaysRecent (3) → lifestyleSourced at low ACWR + no drift
    // → classifyPerformanceDip returns LIFE_DIP → meta.suppressReactiveDeload === true.
    expect((state.meta as { suppressReactiveDeload?: boolean }).suppressReactiveDeload).toBe(true);
  });

  it('flag ON → a CUT user with a real deficit threads kcalShortfall → LIFE_DIP suppresses (no skips)', () => {
    const now = Date.now();
    setCutUser();                 // CUT phase, ~20% default deficit → severity ~0.20 ≥ 0.10
    seedLowVolumeFatiguedHistory(now);
    DB.set('coach-decisions', []); // NO skipped sessions → closedDaysRecent 0; kcal is the trigger
    setLifedipFlag(true);

    const state = buildUserStateForPipeline();
    // kcalShortfall (a real CUT deficit) alone sources the LIFE_DIP at low volume.
    expect((state.meta as { suppressReactiveDeload?: boolean }).suppressReactiveDeload).toBe(true);
  });
});
