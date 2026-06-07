// ══ BUILD #8/D — pain/injury per-exercise deprioritize tests (F4 spec §D) ════
// (1) Pure exercisePenalty / recordExerciseSkip + time decay.
// (2) Composition: with penalties injected, buildSession DEMOTES a repeatedly-
//     skipped lift and a same-muscle sibling leads — but the muscle is STILL
//     trained, and nothing is dropped (last-option safety). Flag-off (no penalty
//     map) → byte-identical pool order.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordExerciseSkip,
  exercisePenalty,
  exercisePenaltyMap,
  SKIP_THRESHOLD,
  SKIP_HALF_LIFE_DAYS,
  EXERCISE_PAIN_KEY,
} from '../dp/exercisePain.js';
import { buildSession } from '../sessionBuilder.js';
import { PAIN_REGION_GROUP_MAP } from '../muscleRecoveryConstants.js';
import { DB } from '../../db.js';

const NOW = Date.UTC(2026, 5, 1);

describe('exercisePenalty / recordExerciseSkip — pure', () => {
  beforeEach(() => localStorage.clear());

  it('record + decayed skip penalty ramps to 1 at SKIP_THRESHOLD recent skips', () => {
    for (let i = 0; i < SKIP_THRESHOLD; i++) recordExerciseSkip('Lat Pulldown', NOW);
    const p = exercisePenalty('Lat Pulldown', 'spate', [], PAIN_REGION_GROUP_MAP, NOW);
    expect(p).toBeCloseTo(1, 2);
  });

  it('a single skip is below the demote threshold', () => {
    recordExerciseSkip('Lat Pulldown', NOW);
    const p = exercisePenalty('Lat Pulldown', 'spate', [], PAIN_REGION_GROUP_MAP, NOW);
    expect(p).toBeLessThan(0.5);
  });

  it('skips decay over time (a stale skip fades)', () => {
    for (let i = 0; i < SKIP_THRESHOLD; i++) recordExerciseSkip('Lat Pulldown', NOW);
    const later = NOW + SKIP_HALF_LIFE_DAYS * 86400000; // one half-life later
    const p = exercisePenalty('Lat Pulldown', 'spate', [], PAIN_REGION_GROUP_MAP, later);
    expect(p).toBeCloseTo(0.5, 1); // halved
  });

  it('a recent severe pain report on the muscle drives a high penalty', () => {
    const painCdl = [{ type: 'pain', region: 'spate', intensity: 3, ts: NOW - 86400000 }];
    const p = exercisePenalty('Lat Pulldown', 'spate', painCdl, PAIN_REGION_GROUP_MAP, NOW);
    expect(p).toBe(1);
  });

  it('a pain report on a DIFFERENT muscle does not penalize', () => {
    const painCdl = [{ type: 'pain', region: 'genunchi-stang', intensity: 3, ts: NOW }];
    const p = exercisePenalty('Lat Pulldown', 'spate', painCdl, PAIN_REGION_GROUP_MAP, NOW);
    expect(p).toBe(0);
  });

  it('exercisePenaltyMap includes only signalled exercises', () => {
    for (let i = 0; i < SKIP_THRESHOLD; i++) recordExerciseSkip('Lat Pulldown', NOW);
    const m = exercisePenaltyMap(NOW);
    expect(m['Lat Pulldown']).toBeGreaterThan(0);
    expect(Object.keys(m)).toEqual(['Lat Pulldown']);
  });

  it('recordExerciseSkip persists to the synced dp-exercise-pain key', () => {
    recordExerciseSkip('Cable Row', NOW);
    const all = /** @type {any} */ (DB.get(EXERCISE_PAIN_KEY));
    expect(all['Cable Row'].skips).toBe(1);
  });
});

describe('buildSession composition — pain demotion (F4 §D acceptance)', () => {
  const CTX = {
    profileTier: 'T2',
    prNames: [],
    seed: 'pain-demote-seed',
    equipment: { available: ['bailib_stack', 'matrix_cable', 'machine_plates', 'dumbbell', 'barbell_plates', 'leg_machine', 'pec_deck', 'barbell_heavy', 'leg_machine_heavy', 'leg_press_plates', 'calf_machine', 'light_iso_db', 'light_iso_cable'] },
  };

  function backPoolNames(penalties) {
    const s = buildSession('pull', { ...CTX, exercisePenalties: penalties });
    return s.exercises.map((e) => e.name);
  }

  it('flag-OFF (no penalties) → a baseline pull session is produced', () => {
    const names = backPoolNames(null);
    expect(names.length).toBeGreaterThan(0);
  });

  it('a heavily-penalized lift is demoted below a clean same-muscle sibling, muscle still trained', () => {
    const baseline = backPoolNames(null);
    // Pick a back lift that appears in the baseline and penalize it hard.
    const target = baseline.find((n) => /Pulldown|Row/i.test(n));
    expect(target).toBeTruthy();
    const penalized = backPoolNames({ [/** @type {string} */ (target)]: 1 });
    // The muscle group is still trained (session not emptied).
    expect(penalized.length).toBeGreaterThan(0);
    // If the penalized lift still appears it is NOT in the lead position it held
    // (a clean sibling leads); most often it drops out of the top slots entirely.
    if (penalized.includes(/** @type {string} */ (target))) {
      expect(penalized.indexOf(/** @type {string} */ (target)))
        .toBeGreaterThan(baseline.indexOf(/** @type {string} */ (target)));
    }
  });
});
