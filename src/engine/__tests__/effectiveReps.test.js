// ══ BUILD F6b V3 #19 — effective-reps / stimulus model tests (spec §2d) ══════
// effectiveReps weights a set by proximity-to-failure via RATING_TO_RIR
// (usor:3, potrivit:1, greu:0) over a fixed EFFECTIVE_WINDOW=5. Deterministic,
// pure, never NaN. summarizeStimulus aggregates to an equivalent full-to-failure
// "stimulus set" count. These traces assert the sim-plan cases:
//   - a greu (RIR 0) set delivers full window stimulus.
//   - a usor (RIR 3) set delivers only the last ~2 reps (junk volume exposed).
//   - a low-rep set never exceeds its own rep count.
//   - a steady all-potrivit week and an all-usor week are deterministic and the
//     all-usor week shows a LOWER stimulusSets than all-potrivit at equal raw sets
//     (the "logged-but-in-the-tank" detection).
//   - absent/legacy rating → neutral potrivit reserve (no crash, no fabrication).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  effectiveReps,
  summarizeStimulus,
  effectiveRepsSetsTrim,
  EFFECTIVE_WINDOW,
  TARGET_EFFECTIVE_PER_SET,
} from '../dp/effectiveReps.js';
import { DB } from '../../db.js';

describe('F6b V3 #19 — effectiveReps(set)', () => {
  it('greu (RIR 0) high-rep set delivers the FULL window of stimulus', () => {
    // RIR 0 → window-0 = 5 effective reps; reps (12) > 5 so capped at the window.
    expect(effectiveReps({ reps: 12, rating: 'greu' })).toBe(EFFECTIVE_WINDOW);
  });

  it('usor (RIR 3) set delivers only the last ~2 reps (junk volume exposed)', () => {
    // RIR 3 → window-3 = 2 effective reps even for a long 15-rep set.
    expect(effectiveReps({ reps: 15, rating: 'usor' })).toBe(EFFECTIVE_WINDOW - 3);
  });

  it('potrivit (RIR 1) set delivers window-1 effective reps', () => {
    expect(effectiveReps({ reps: 10, rating: 'potrivit' })).toBe(EFFECTIVE_WINDOW - 1);
  });

  it('a set with fewer reps than the window counts only the reps performed', () => {
    // greu (RIR 0) but only 3 reps → min(3, 5) = 3.
    expect(effectiveReps({ reps: 3, rating: 'greu' })).toBe(3);
  });

  it('absent / legacy rating → neutral potrivit reserve (no crash)', () => {
    expect(effectiveReps({ reps: 10 })).toBe(EFFECTIVE_WINDOW - 1);
    expect(effectiveReps({ reps: 10, rating: 'unknown' })).toBe(EFFECTIVE_WINDOW - 1);
  });

  it('invalid / zero reps → 0 effective reps (never NaN)', () => {
    expect(effectiveReps({ reps: 0, rating: 'greu' })).toBe(0);
    expect(effectiveReps({ rating: 'greu' })).toBe(0);
    expect(effectiveReps(null)).toBe(0);
  });
});

describe('F6b V3 #19 — summarizeStimulus(sets)', () => {
  it('empty / non-array → zeroed summary', () => {
    expect(summarizeStimulus([])).toEqual({ rawSets: 0, effectiveReps: 0, stimulusSets: 0 });
    expect(summarizeStimulus(null)).toEqual({ rawSets: 0, effectiveReps: 0, stimulusSets: 0 });
  });

  it('all-greu week ≈ rawSets stimulus (every set to failure)', () => {
    const sets = Array.from({ length: 6 }, () => ({ reps: 10, rating: 'greu' }));
    const s = summarizeStimulus(sets);
    expect(s.rawSets).toBe(6);
    // each greu set = full window (5) effective reps → 6×5 / TARGET(5) = 6 stimulus sets.
    expect(s.effectiveReps).toBe(6 * EFFECTIVE_WINDOW);
    expect(s.stimulusSets).toBe((6 * EFFECTIVE_WINDOW) / TARGET_EFFECTIVE_PER_SET);
  });

  it('all-usor week shows MUCH LOWER stimulus than all-greu at equal raw sets', () => {
    const usor = Array.from({ length: 6 }, () => ({ reps: 15, rating: 'usor' }));
    const greu = Array.from({ length: 6 }, () => ({ reps: 15, rating: 'greu' }));
    const su = summarizeStimulus(usor);
    const sg = summarizeStimulus(greu);
    expect(su.rawSets).toBe(sg.rawSets); // same logged volume…
    expect(su.stimulusSets).toBeLessThan(sg.stimulusSets); // …but far less real stimulus.
  });

  it('deterministic — identical input yields identical output', () => {
    const sets = [
      { reps: 8, rating: 'greu' },
      { reps: 12, rating: 'potrivit' },
      { reps: 15, rating: 'usor' },
    ];
    expect(summarizeStimulus(sets)).toEqual(summarizeStimulus(sets.map((x) => ({ ...x }))));
  });
});

// ── V3 DOSE half (spec §2c.2) — the deferred last hop: effective-reps → set TRIM ──
describe('F6b V3 #19 — effectiveRepsSetsTrim (the DOSE, trim-only)', () => {
  beforeEach(() => { localStorage.clear(); });

  const log = (ex, rating, n) =>
    Array.from({ length: n }, (_, i) => ({ ex, w: 60, reps: 10, rating, ts: 1000 + i }));

  it('a consistent grinder (all-greu, near failure) → trim -1 (fewer raw sets needed)', () => {
    DB.set('logs', log('Flat DB Press', 'greu', 8));
    expect(effectiveRepsSetsTrim('Flat DB Press')).toBe(-1);
  });

  it('a left-in-the-tank user (all-usor) → 0 (they NEED the raw volume, never trimmed)', () => {
    DB.set('logs', log('Flat DB Press', 'usor', 8));
    expect(effectiveRepsSetsTrim('Flat DB Press')).toBe(0);
  });

  it('a middling potrivit user is below the 85% efficiency cut → 0', () => {
    // potrivit (RIR 1) → 4 effective / 5 target = 0.8 < 0.85 → no trim.
    DB.set('logs', log('Flat DB Press', 'potrivit', 8));
    expect(effectiveRepsSetsTrim('Flat DB Press')).toBe(0);
  });

  it('too few recent sets (< DOSE_MIN_SETS) → 0 (untrusted → byte-identical)', () => {
    DB.set('logs', log('Flat DB Press', 'greu', 3));
    expect(effectiveRepsSetsTrim('Flat DB Press')).toBe(0);
  });

  it('TRIM-ONLY: even the densest grinder never returns a POSITIVE adjust', () => {
    DB.set('logs', log('Flat DB Press', 'greu', 20));
    expect(effectiveRepsSetsTrim('Flat DB Press')).toBeLessThanOrEqual(0);
  });

  it('total function — no logs / bad name → 0 (never throws)', () => {
    expect(effectiveRepsSetsTrim('Nonexistent Lift')).toBe(0);
    expect(effectiveRepsSetsTrim('')).toBe(0);
    expect(effectiveRepsSetsTrim(null)).toBe(0);
  });
});
