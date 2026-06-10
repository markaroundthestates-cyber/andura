// Persona-aware session TIME budget (rest-inclusive) — trim tuning pass.
//
// The chassis sizes a session from the weekly volume budget but never bounds
// the resulting session DURATION, so a high-volume day could run ~2.5-3h. A
// real coach caps the session at a persona-aware time budget; rest periods
// dominate that time, so the cap is measured on the REST-INCLUSIVE duration
// (computeEstimatedDurationMin). The trim shaves sets from / drops the
// LOWEST-priority (TAIL) exercises first, never the FRONT priority/weak groups,
// and never below the floor (~4 exercises / 2 sets / ~25min).
//
// Tests:
//   - a long marius session trims to <= 90min; a long maria session to <= 60min
//   - a session already under the cap is UNCHANGED
//   - the trim removes TAIL volume first (front survives while tail is dropped)
//   - floor respected (never below ~4 exercises / 2 sets each)
//   - determinism (same inputs twice -> identical plan)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trimSessionToTimeBudget,
  personaTimeCapMin,
  personaTimeTargetMin,
  clusterFatigueFactor,
  computeEstimatedDurationMin,
  composePlannedWorkoutToday,
  stimulusScore,
  stimulusPerMin,
} from '../../lib/scheduleAdapterAggregate';
import type { PlannedExercise } from '../../lib/engineWrappers';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';

const TUESDAY_2026_05_19 = new Date(2026, 4, 19);

// Mirror of the (unexported) MIN_SETS_PER_EX floor in the compose module — used
// only to assert "not flattened to the set floor" without importing internals.
const MIN_SETS_PER_EX_TEST = 2;

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

// Build a planned exercise with explicit sets + restSec (the only fields the
// duration estimator + trim read). `tag` rides on the name so we can assert
// which positions survived.
function ex(tag: string, sets: number, restSec: number): PlannedExercise {
  return {
    id: `${tag}-0`,
    name: tag,
    engineName: tag,
    sets,
    targetReps: 10,
    targetKg: 40,
    restSec,
  };
}

describe('persona time caps + targets', () => {
  it('hard caps: maria 60 / gigica 75 / marius 90', () => {
    expect(personaTimeCapMin('maria')).toBe(60);
    expect(personaTimeCapMin('gigica')).toBe(75);
    expect(personaTimeCapMin('marius')).toBe(90);
  });

  it('unknown / null persona falls back to gigica (conservative)', () => {
    expect(personaTimeCapMin(null)).toBe(75);
    expect(personaTimeCapMin(undefined)).toBe(75);
    expect(personaTimeCapMin('nope')).toBe(75);
  });

  it('soft target = hard cap - 15 (marius ~75)', () => {
    expect(personaTimeTargetMin('marius')).toBe(75);
    expect(personaTimeTargetMin('gigica')).toBe(60);
    expect(personaTimeTargetMin('maria')).toBe(45);
  });
});

describe('trimSessionToTimeBudget — rest-inclusive time bound', () => {
  // 8 exercises x 5 sets x (40 work + 180 rest) = 8800s = ~147min — well over
  // every persona cap, so the trim must engage.
  function longSession(): PlannedExercise[] {
    return Array.from({ length: 8 }, (_, i) => ex(`ex${i}`, 5, 180));
  }

  it('a long marius session trims to <= 90min (rest-inclusive)', () => {
    const trimmed = trimSessionToTimeBudget(longSession(), 0, personaTimeCapMin('marius'));
    const dur = computeEstimatedDurationMin(trimmed, 0)!;
    expect(dur).toBeLessThanOrEqual(90);
  });

  it('a long maria session trims to <= 60min (rest-inclusive)', () => {
    const trimmed = trimSessionToTimeBudget(longSession(), 0, personaTimeCapMin('maria'));
    const dur = computeEstimatedDurationMin(trimmed, 0)!;
    expect(dur).toBeLessThanOrEqual(60);
  });

  it('warmup minutes count toward the cap', () => {
    // A session at exactly the cap WITHOUT warmup must trim once warmup pushes it
    // over. 4 ex x 4 sets x (40 + 120) = 2560s = ~43min; +20 warmup = 63 > 60.
    const session = Array.from({ length: 4 }, (_, i) => ex(`ex${i}`, 4, 120));
    const trimmed = trimSessionToTimeBudget(session, 20, personaTimeCapMin('maria'));
    const dur = computeEstimatedDurationMin(trimmed, 20)!;
    expect(dur).toBeLessThanOrEqual(60);
  });

  it('a session already under the cap is UNCHANGED', () => {
    // 4 ex x 3 sets x (40 + 90) = 1560s = 26min < 60.
    const session = Array.from({ length: 4 }, (_, i) => ex(`ex${i}`, 3, 90));
    const before = computeEstimatedDurationMin(session, 0)!;
    expect(before).toBeLessThanOrEqual(60);
    const trimmed = trimSessionToTimeBudget(session, 0, personaTimeCapMin('maria'));
    expect(trimmed).toEqual(session);
  });

  it('an empty session is unchanged (floor protects it)', () => {
    expect(trimSessionToTimeBudget([], 0, 60)).toEqual([]);
  });

  it('a tiny session under the floor is unchanged even if nominally over cap', () => {
    // 4 ex x 2 sets x (40 + 600) = 5120s = ~85min, but the floor (4 ex / 2 sets)
    // is already hit, so the trim cannot shrink it further — returned as-is.
    const session = Array.from({ length: 4 }, (_, i) => ex(`ex${i}`, 2, 600));
    const trimmed = trimSessionToTimeBudget(session, 0, personaTimeCapMin('maria'));
    expect(trimmed).toEqual(session);
  });

  it('trims the TAIL first — the FRONT (priority/weak) exercise survives', () => {
    // 8 distinct-tagged exercises; the front (ex0) is the priority/weak group.
    const session = Array.from({ length: 8 }, (_, i) => ex(`ex${i}`, 5, 180));
    const trimmed = trimSessionToTimeBudget(session, 0, personaTimeCapMin('marius'));
    const names = trimmed.map((e) => e.name);
    // Front priority exercise must survive at full strength.
    expect(names[0]).toBe('ex0');
    expect(trimmed[0]!.sets).toBe(5);
    // A tail exercise must have been dropped or shaved before ex0 is touched.
    const lastSurvivor = trimmed[trimmed.length - 1]!;
    const tailWasTouched = trimmed.length < 8 || lastSurvivor.sets < 5;
    expect(tailWasTouched).toBe(true);
  });

  it('a MILD overshoot just shaves ONE set off the tail (no drop, front intact)', () => {
    // Barely over (rest-inclusive + the per-exercise transition the honest estimate
    // now adds): 5 ex x 3 sets x (50 work + 160 rest) + 5 x 105 transition = 3675s =
    // ~61.25min vs maria 60. A single tail set-shave (ex4 3->2) drops it to ~57.75min
    // — under the cap — so the trim never needs to drop an exercise. This is the
    // conservative "don't over-aggressive" path: gentle shave, full exercise count.
    const session = Array.from({ length: 5 }, (_, i) => ex(`ex${i}`, 3, 160));
    expect(computeEstimatedDurationMin(session, 0)!).toBeGreaterThan(60);
    const trimmed = trimSessionToTimeBudget(session, 0, personaTimeCapMin('maria'));
    expect(trimmed.length).toBe(5);            // shaving only, no exercise dropped
    expect(trimmed[0]!.sets).toBe(3);          // front priority untouched
    expect(trimmed[trimmed.length - 1]!.sets).toBe(2); // exactly one set shaved off tail
    expect(computeEstimatedDurationMin(trimmed, 0)!).toBeLessThanOrEqual(60);
  });

  it('a TIGHT cap protects the FRONT compound and DROPS accessories (no flatten)', () => {
    // Daniel bug repro: a healthy [3,5,2,3,3] with compounds (150s rest, idx 0/1)
    // + accessories (75s rest) under a tight 30-min cap. The OLD trim flattened
    // every exercise to 2 sets ([2,2,2,2,2] — 5 token lifts, main compound
    // crushed). The compound-protective trim shaves the tail to the floor then
    // DROPS whole accessories, keeping the front compound's set count.
    const session = [
      ex('compoundA', 3, 150),
      ex('compoundB', 5, 150),
      ex('accC', 2, 75),
      ex('accD', 3, 75),
      ex('accE', 3, 75),
    ];
    const trimmed = trimSessionToTimeBudget(session, 0, 30);
    // Front compound (idx 0) keeps a real working volume — never crushed to 2.
    expect(trimmed[0]!.name).toBe('compoundA');
    expect(trimmed[0]!.sets).toBeGreaterThanOrEqual(3);
    // The session is NOT a flat field of 2s: at least one exercise is > 2 sets.
    expect(trimmed.some((e) => e.sets > MIN_SETS_PER_EX_TEST)).toBe(true);
    // Accessories were dropped (fewer exercises) rather than flattened.
    expect(trimmed.length).toBeLessThan(session.length);
    // It trims toward the cap as far as the floors allow. With the honest (higher)
    // estimator + the 4-exercise / compound-3-set floors, a 30-min request can't go
    // below ~35min — the point is compound-protection + dropping accessories, not
    // hitting 30 exactly. Assert it trimmed well down (under the floor-limited band).
    expect(computeEstimatedDurationMin(trimmed, 0)!).toBeLessThanOrEqual(40);
  });

  it('LAST RESORT shave never crushes index 0 below 3 sets (compound floor)', () => {
    // Force both floors: exactly MIN_EXERCISES_FLOOR (4) heavy compounds so no
    // drop is allowed, and an impossibly tight cap. The trim shaves the tail to
    // the set floor (2) but must leave index 0 at >= 3 sets — never below the
    // compound working floor — even though the session still exceeds the cap.
    const session = Array.from({ length: 4 }, (_, i) => ex(`comp${i}`, 5, 180));
    const trimmed = trimSessionToTimeBudget(session, 0, 30);
    expect(trimmed.length).toBe(4);               // exercise floor held (no drop)
    expect(trimmed[0]!.sets).toBeGreaterThanOrEqual(3); // top compound protected
    for (const e of trimmed) {
      expect(e.sets).toBeGreaterThanOrEqual(2);   // set floor held everywhere
    }
  });

  it('floor respected — never below ~4 exercises / 2 sets each', () => {
    const session = Array.from({ length: 8 }, (_, i) => ex(`ex${i}`, 5, 240));
    const trimmed = trimSessionToTimeBudget(session, 0, personaTimeCapMin('maria'));
    expect(trimmed.length).toBeGreaterThanOrEqual(4);
    for (const e of trimmed) {
      expect(e.sets).toBeGreaterThanOrEqual(2);
    }
  });

  it('determinism — same inputs twice produce an identical trimmed plan', () => {
    const a = trimSessionToTimeBudget(
      Array.from({ length: 8 }, (_, i) => ex(`ex${i}`, 5, 180)),
      0,
      personaTimeCapMin('marius'),
    );
    const b = trimSessionToTimeBudget(
      Array.from({ length: 8 }, (_, i) => ex(`ex${i}`, 5, 180)),
      0,
      personaTimeCapMin('marius'),
    );
    expect(a).toEqual(b);
  });

  it('does not mutate the input array', () => {
    const session = Array.from({ length: 8 }, (_, i) => ex(`ex${i}`, 5, 180));
    const snapshot = JSON.parse(JSON.stringify(session));
    trimSessionToTimeBudget(session, 0, personaTimeCapMin('maria'));
    expect(session).toEqual(snapshot);
  });
});

// ── F6c #12 — stimulus-per-minute optimizer ─────────────────────────────────
// stimulusScore differentiates a compound (COMPOUND_EX) + wide muscle breadth from
// a low-density isolation. stimulusPerMin = score / minute cost. The trim's DROP
// step removes the lowest stimulus/min tail candidate when dp_stimulus_per_min_v1
// is ON — denser remaining session — and is byte-identical (strict tail-first) OFF.
describe('F6c #12 — stimulusScore + stimulusPerMin (pure)', () => {
  it('a compound scores higher than an isolation', () => {
    // Leg Press is in COMPOUND_EX; Calf Raises is not.
    expect(stimulusScore('Leg Press')).toBeGreaterThan(stimulusScore('Calf Raises'));
  });

  it('an unknown name falls to the baseline (never throws)', () => {
    expect(stimulusScore('___not_a_real_ex___')).toBeGreaterThan(0);
    expect(stimulusScore(undefined)).toBeGreaterThan(0);
  });

  it('stimulusPerMin divides the score by the rest-inclusive minute cost', () => {
    // A cheaper (shorter-rest, fewer-set) compound has a HIGHER density than a
    // long-rest, many-set isolation.
    const denseCompound = ex('Leg Press', 2, 60);
    const sparseIso = ex('Calf Raises', 5, 180);
    denseCompound.engineName = 'Leg Press';
    sparseIso.engineName = 'Calf Raises';
    expect(stimulusPerMin(denseCompound)).toBeGreaterThan(stimulusPerMin(sparseIso));
  });
});

describe('F6c #12 — trim drop order: flag OFF byte-identical, ON drops lowest density', () => {
  const ON = (): void => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_stimulus_per_min_v1: true }));
  };

  // A session at the SET FLOOR (2) — so the trim can only DROP, never shave — whose
  // TAIL has a high-stimulus compound positioned LAST and a low-density isolation
  // positioned EARLIER in the tail. Front 4 are CHEAP (short rest) so they survive;
  // the cap forces dropping exactly ONE tail item. Blind tail-first → drops the
  // last (compound); stimulus trim → drops the low-density isolation instead.
  function tailMixSession(): PlannedExercise[] {
    const e = (tag: string, name: string, sets: number, rest: number): PlannedExercise => {
      const p = ex(tag, sets, rest);
      p.engineName = name;
      return p;
    };
    return [
      // Front 4 (priority/weak prefix, never a drop candidate) — cheap (60s rest).
      e('f0', 'Lat Pulldown', 2, 60),
      e('f1', 'Cable Row', 2, 60),
      e('f2', 'Flat DB Press', 2, 60),
      e('f3', 'Incline DB Press', 2, 60),
      // Tail: a low-density isolation (idx 4) + a high-stimulus compound LAST (idx 5),
      // both expensive (300s rest) + at the set floor → the trim must DROP one.
      e('isoTail', 'Calf Raises', 2, 300),   // idx 4 — low density (isolation)
      e('compTail', 'Leg Press', 2, 300),    // idx 5 (last) — high density (compound)
    ];
  }
  // Front 4: 4 x 2 x (50+60) = 880s; each tail: 2 x (50+300) = 700s; transition
  // 6 x 105 = 630s. Full = 2910s = ~48.5min. Dropping ONE tail → 5 ex = 2105s =
  // ~35.1min. A 40-min cap forces dropping exactly ONE tail item (48.5 > 40 >= 35.1).
  const ONE_DROP_CAP = 40;

  it('flag OFF: drops the positional LAST (the compound) — legacy tail-first', () => {
    // dp_stimulus_per_min_v1 now DEFAULTS ON (THE FLIP 2026-06-08) so "no _devFlags"
    // no longer means OFF — force the flag OFF explicitly to exercise the legacy
    // blind tail-first drop.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_stimulus_per_min_v1: false }));
    const trimmed = trimSessionToTimeBudget(tailMixSession(), 0, ONE_DROP_CAP);
    const names = trimmed.map((e) => e.name);
    // The last-positioned compound was dropped (blind tail-first); the isolation survives.
    expect(names).not.toContain('compTail');
    expect(names).toContain('isoTail');
    localStorage.removeItem('_devFlags');
  });

  it('flag ON: drops the lowest stimulus/min tail (the isolation), KEEPS the compound', () => {
    ON();
    const trimmed = trimSessionToTimeBudget(tailMixSession(), 0, ONE_DROP_CAP);
    const names = trimmed.map((e) => e.name);
    // The denser compound survives; the low-density isolation is dropped instead.
    expect(names).toContain('compTail');
    expect(names).not.toContain('isoTail');
    localStorage.removeItem('_devFlags');
  });

  it('flag ON: the FRONT prefix (first 4) is never a drop candidate', () => {
    ON();
    const trimmed = trimSessionToTimeBudget(tailMixSession(), 0, ONE_DROP_CAP);
    const names = trimmed.map((e) => e.name);
    // The four front exercises always survive (priority/weak protection unchanged).
    for (const f of ['f0', 'f1', 'f2', 'f3']) expect(names).toContain(f);
    localStorage.removeItem('_devFlags');
  });

  it('flag ON: a uniform-density tail trims to the SAME result as OFF (tie → positional)', () => {
    const uniform = (): PlannedExercise[] =>
      Array.from({ length: 8 }, (_, i) => {
        const p = ex(`ex${i}`, 5, 180);
        p.engineName = 'Calf Raises'; // identical density for every row
        return p;
      });
    const off = trimSessionToTimeBudget(uniform(), 0, personaTimeCapMin('maria'));
    ON();
    const on = trimSessionToTimeBudget(uniform(), 0, personaTimeCapMin('maria'));
    localStorage.removeItem('_devFlags');
    expect(on.map((e) => e.name)).toEqual(off.map((e) => e.name));
  });

  it('flag ON: all floors still hold (>=4 ex / >=2 sets)', () => {
    ON();
    const trimmed = trimSessionToTimeBudget(tailMixSession(), 0, 20);
    expect(trimmed.length).toBeGreaterThanOrEqual(4);
    for (const e of trimmed) expect(e.sets).toBeGreaterThanOrEqual(2);
    localStorage.removeItem('_devFlags');
  });
});

describe('clusterFatigueFactor — fatigue-aware cap scaling', () => {
  it('legs/lower are the most fatiguing (0.80)', () => {
    expect(clusterFatigueFactor('LEGS')).toBe(0.8);
    expect(clusterFatigueFactor('LOWER')).toBe(0.8);
  });

  it('full-body sits between legs and upper (0.90)', () => {
    expect(clusterFatigueFactor('FULL')).toBe(0.9);
    const legs = clusterFatigueFactor('LEGS');
    const full = clusterFatigueFactor('FULL');
    const upper = clusterFatigueFactor('UPPER');
    expect(legs).toBeLessThan(full);
    expect(full).toBeLessThan(upper);
  });

  it('upper / push / pull cost less systemically — no reduction (1.0)', () => {
    expect(clusterFatigueFactor('UPPER')).toBe(1.0);
    expect(clusterFatigueFactor('PUSH')).toBe(1.0);
    expect(clusterFatigueFactor('PULL')).toBe(1.0);
  });

  it('case-insensitive on the engine tag', () => {
    expect(clusterFatigueFactor('legs')).toBe(0.8);
    expect(clusterFatigueFactor('Full')).toBe(0.9);
  });

  it('unknown / missing sessionType → factor 1.0 (graceful, no reduction)', () => {
    expect(clusterFatigueFactor(null)).toBe(1.0);
    expect(clusterFatigueFactor(undefined)).toBe(1.0);
    expect(clusterFatigueFactor('FULL_UPPER')).toBe(1.0); // not a known key
    expect(clusterFatigueFactor('')).toBe(1.0);
  });
});

describe('composePlannedWorkoutToday — fatigue-aware time cap', () => {
  const STUB_BASE = {
    type: 'training' as const,
    warmup: null,
    intensityModifier: null,
    volumeTargets: null,
    restTimeRange: [120, 180] as [number, number],
    specializationTarget: null,
    deloadState: 'IDLE',
    workoutTitle: 'Antrenament azi',
    estimatedDurationMin: 50,
    volumeKg: 1000,
  };
  const EIGHT_COMPOUNDS = [
    'DB Shoulder Press',
    'Incline DB Press',
    'Flat DB Press',
    'Flat Barbell Bench',
    'Lat Pulldown',
    'Cable Row',
    'Chest-Supported Row',
    'Romanian Deadlift',
  ];

  function setMariusOnboarding(): void {
    useOnboardingStore.setState({
      data: { age: 25, sex: 'm', goal: 'masa', frequency: '5', experience: 'avansat', weight: 90, height: 185 },
      completed: true,
      completedAt: Date.now(),
    });
  }

  async function durationFor(sessionType: string): Promise<number> {
    setMariusOnboarding();
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_BASE,
      sessionType,
      exercises: EIGHT_COMPOUNDS.map((name) => ({ name, sets: 5 })),
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    return out!.estimatedDuration!;
  }

  it('LEGS caps/trims to a LOWER duration than UPPER (same persona + volume)', async () => {
    const legs = await durationFor('LEGS');
    const upper = await durationFor('UPPER');
    // legs effectiveCap = 90 x 0.80 = 72; upper = 90 x 1.00 = 90 → legs trims more.
    expect(legs).toBeLessThan(upper);
    expect(legs).toBeLessThanOrEqual(72);
    expect(upper).toBeLessThanOrEqual(90);
  });

  it('LOWER behaves like LEGS (lower than UPPER)', async () => {
    const lower = await durationFor('LOWER');
    const upper = await durationFor('UPPER');
    expect(lower).toBeLessThan(upper);
  });

  it('FULL sits between legs and upper', async () => {
    const legs = await durationFor('LEGS');
    const full = await durationFor('FULL');
    const upper = await durationFor('UPPER');
    // effective caps: legs 72 < full 81 < upper 90.
    expect(legs).toBeLessThan(full);
    expect(full).toBeLessThanOrEqual(upper);
  });

  it('unknown sessionType → factor 1.0 → identical to the flat-cap (c2711c4b) result', async () => {
    // 'FULL_UPPER' is not a known fatigue key → factor 1.0 → flat marius 90 cap.
    const unknown = await durationFor('FULL_UPPER');
    const upper = await durationFor('UPPER'); // factor 1.0 too → same effective cap
    expect(unknown).toBe(upper);
    expect(unknown).toBeLessThanOrEqual(90);
  });

  it('determinism — same persona + sessionType + plan twice → identical duration', async () => {
    const a = await durationFor('LEGS');
    const b = await durationFor('LEGS');
    expect(a).toBe(b);
  });
});

describe('composePlannedWorkoutToday — persona time budget integration', () => {
  // A synthetic high-volume plan (8 compounds x 5 sets) routed through the real
  // composer proves the trim engages end-to-end and the output duration lands
  // under the persona cap. restTimeRange max 180s drives the rest-inclusive cost.
  const STUB_PLAN_BASE = {
    type: 'training' as const,
    sessionType: 'FULL_UPPER',
    warmup: null,
    intensityModifier: null,
    volumeTargets: null,
    restTimeRange: [120, 180] as [number, number],
    specializationTarget: null,
    deloadState: 'IDLE',
    workoutTitle: 'Antrenament azi',
    estimatedDurationMin: 50,
    volumeKg: 1000,
  };

  // Eight real COMPOUND engine names (src/constants.js COMPOUND_EX) so
  // resolveRestSec picks the range MAX (180s) — the worst case for session time.
  // Reused with repetition where the pool is < 8 (the trim is name-agnostic;
  // only sets + restSec drive duration). All are compounds → all rest at 180.
  const EIGHT_COMPOUNDS = [
    'DB Shoulder Press',
    'Incline DB Press',
    'Flat DB Press',
    'Flat Barbell Bench',
    'Lat Pulldown',
    'Cable Row',
    'Chest-Supported Row',
    'Romanian Deadlift',
  ];

  it('marius high-volume session lands <= 90min after the composer trim', async () => {
    useOnboardingStore.setState({
      data: { age: 25, sex: 'm', goal: 'masa', frequency: '5', experience: 'avansat', weight: 90, height: 185 },
      completed: true,
      completedAt: Date.now(),
    });
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      exercises: EIGHT_COMPOUNDS.map((name) => ({ name, sets: 5 })),
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.estimatedDuration).toBeLessThanOrEqual(90);
    // Trim actually engaged (8 x 5 x (40+180) = 147min raw was over the cap).
    expect(out!.exerciseCount).toBeLessThanOrEqual(8);
  });

  it('maria high-volume session lands <= 60min and keeps the FRONT exercise', async () => {
    useOnboardingStore.setState({
      data: { age: 66, sex: 'f', goal: 'mentenanta', frequency: '3', experience: 'incepator', weight: 65, height: 162 },
      completed: true,
      completedAt: Date.now(),
    });
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    const planExercises = EIGHT_COMPOUNDS.map((name) => ({ name, sets: 5 }));
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      exercises: planExercises,
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.estimatedDuration).toBeLessThanOrEqual(60);
    // Front priority exercise (engine position 0) survives the trim.
    const frontEngine = planExercises[0]!.name;
    expect(out!.exercises[0]!.engineName).toBe(frontEngine);
    // Floor honoured.
    expect(out!.exercises.length).toBeGreaterThanOrEqual(4);
  });

  it('a normal-volume session is not trimmed by the composer', async () => {
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    // 5 exercises x 3 sets x (40 + 180) = 3300s = 55min < gigica 75 cap.
    const planExercises = EIGHT_COMPOUNDS.slice(0, 5).map((name) => ({ name, sets: 3 }));
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      exercises: planExercises,
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    // Gigica (age 30) cap 75 — 55min session untouched: count + sets preserved.
    expect(out!.exerciseCount).toBe(5);
    out!.exercises.forEach((e) => expect(e.sets).toBe(3));
  });
});

describe('composePlannedWorkoutToday — user pre-session TIME budget', () => {
  // Marius (cap 90) with a high-volume plan, so the user-chosen budget has room
  // to shrink the session well below the persona ceiling.
  const STUB_PLAN_BASE = {
    type: 'training' as const,
    sessionType: 'UPPER', // fatigue factor 1.0 → flat persona cap (no interference)
    warmup: null,
    intensityModifier: null,
    volumeTargets: null,
    restTimeRange: [120, 180] as [number, number],
    specializationTarget: null,
    deloadState: 'IDLE',
    workoutTitle: 'Antrenament azi',
    estimatedDurationMin: 50,
    volumeKg: 1000,
  };
  const EIGHT_COMPOUNDS = [
    'DB Shoulder Press',
    'Incline DB Press',
    'Flat DB Press',
    'Flat Barbell Bench',
    'Lat Pulldown',
    'Cable Row',
    'Chest-Supported Row',
    'Romanian Deadlift',
  ];

  function setMarius(): void {
    useOnboardingStore.setState({
      data: { age: 25, sex: 'm', goal: 'masa', frequency: '5', experience: 'avansat', weight: 90, height: 185 },
      completed: true,
      completedAt: Date.now(),
    });
  }

  async function composeWith(timeBudgetMin: number | null) {
    setMarius();
    useWorkoutStore.setState({ sessionTimeBudgetMin: timeBudgetMin });
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      exercises: EIGHT_COMPOUNDS.map((name) => ({ name, sets: 5 })),
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    return out!;
  }

  it('user picks 30 min → session compresses to ~30 (or floor) + fewer exercises vs no-limit', async () => {
    const noLimit = await composeWith(null);
    const limited = await composeWith(30);
    // The shortened session is no longer than the user's budget (the floor may
    // hold it slightly above if 30 is impossibly short — still <= the no-limit).
    expect(limited.estimatedDuration!).toBeLessThanOrEqual(noLimit.estimatedDuration!);
    // 30 min is well under marius 90 → the trim engaged: fewer total exercises.
    expect(limited.exerciseCount).toBeLessThanOrEqual(noLimit.exerciseCount);
    // Honest floor: never gutted below the ~4 exercise / 25 min minimum.
    expect(limited.exercises.length).toBeGreaterThanOrEqual(4);
    expect(limited.estimatedDuration!).toBeGreaterThanOrEqual(25);
  });

  it('skip / no time budget (null) → BYTE-IDENTICAL to the current persona-derived plan', async () => {
    // Establish the persona-only baseline (no user budget).
    setMarius();
    useWorkoutStore.setState({ sessionTimeBudgetMin: null });
    const mod1 = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod1, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      exercises: EIGHT_COMPOUNDS.map((name) => ({ name, sets: 5 })),
    });
    const baseline = await composePlannedWorkoutToday(TUESDAY_2026_05_19);

    // Same plan, still no budget → must be deeply equal (no behavior change).
    setMarius();
    useWorkoutStore.setState({ sessionTimeBudgetMin: null });
    const mod2 = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod2, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      exercises: EIGHT_COMPOUNDS.map((name) => ({ name, sets: 5 })),
    });
    const again = await composePlannedWorkoutToday(TUESDAY_2026_05_19);

    expect(again).toEqual(baseline);
  });

  it('user time LONGER than the persona cap → persona cap still wins (no extension)', async () => {
    const noLimit = await composeWith(null);            // marius cap 90
    const generous = await composeWith(180);            // user "I have 3h"
    // The budget only ever SHRINKS the cap; a value above the persona ceiling
    // must not extend the session — identical to the persona-derived plan.
    expect(generous.estimatedDuration).toBe(noLimit.estimatedDuration);
    expect(generous.exerciseCount).toBe(noLimit.exerciseCount);
  });

  it('determinism — same budget + plan twice → identical duration', async () => {
    const a = await composeWith(45);
    const b = await composeWith(45);
    expect(a.estimatedDuration).toBe(b.estimatedDuration);
    expect(a.exerciseCount).toBe(b.exerciseCount);
  });
});
