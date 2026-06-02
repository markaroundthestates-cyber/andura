// SPLIT SPACING INVARIANT (2026-06-02) — systematic guard across EVERY
// frequency × focus-preset combination.
//
// The thin-session bug (live: 5-exercise / 27-min Push day, ~2 sets each) was a
// split-ORDER defect: a v-taper @ 4 days reshaped Upper/Lower/Upper/Lower into
// Upper/Push/Upper/Lower → UPPER then PUSH on consecutive calendar days. Both
// train chest/shoulders/triceps, so the same muscles got hit two days running and
// the second session landed fried (recovery cut + bite collapsed it to ~2 sets).
//
// Only TWO onboarding dimensions affect split ORDER: workouts/week (frequency)
// and focus preset. Goal + experience scale VOLUME only (sets), never which
// muscle lands on which day — so they cannot create this bug and need not be
// swept here. This file sweeps the full ORDER space (frequency 2..5 × all 5
// presets) and asserts the hard invariant: no two CALENDAR-CONSECUTIVE training
// days share a major muscle group.

import { describe, it, expect } from 'vitest';
import { frequencyToSplit, FOCUS_PRESET_IDS } from '../scheduleAdapter.js';

// Major muscles each cluster trains (Big-11 families; legs collapsed to one tag
// since any leg overlap on consecutive days is the same fatigue concern).
const CLUSTER_MUSCLES = Object.freeze({
  push: ['piept', 'umeri', 'triceps'],
  pull: ['spate', 'biceps'],
  legs: ['legs'],
  lower: ['legs'],
  upper: ['piept', 'umeri', 'triceps', 'spate', 'biceps'],
  full: ['piept', 'umeri', 'triceps', 'spate', 'biceps', 'legs'],
});

// Active-day calendar pattern per onboarding frequency (Monday = index 0),
// mirroring FREQUENCY_DEFAULT_WEEK in scheduleAdapter.js. The split's k-th entry
// is the cluster for the k-th ACTIVE day; entries k and k+1 are calendar-
// consecutive only when their active weekday indices are adjacent (no rest day
// between). A rest day breaks the fatigue chain, so only adjacent days conflict.
const ACTIVE_WEEKDAYS = Object.freeze({
  2: [0, 3],          // L, J
  3: [0, 2, 4],       // L, Mi, V
  4: [0, 1, 3, 4],    // L, Ma, J, V
  5: [0, 1, 2, 4, 5], // L, Ma, Mi, V, S
});

function sharesMuscle(clusterA, clusterB) {
  const a = CLUSTER_MUSCLES[clusterA] || [];
  const b = new Set(CLUSTER_MUSCLES[clusterB] || []);
  return a.some((m) => b.has(m));
}

describe('split spacing — no two CALENDAR-CONSECUTIVE days share a muscle', () => {
  for (const freq of [2, 3, 4, 5]) {
    for (const preset of FOCUS_PRESET_IDS) {
      it(`freq ${freq} × ${preset}: consecutive training days never repeat a muscle`, () => {
        const split = frequencyToSplit(freq, preset);
        const active = ACTIVE_WEEKDAYS[freq];
        expect(split.length).toBe(active.length);
        for (let k = 0; k < split.length - 1; k++) {
          const calendarConsecutive = active[k + 1] === active[k] + 1;
          if (!calendarConsecutive) continue; // rest day breaks the fatigue chain
          const conflict = sharesMuscle(split[k], split[k + 1]);
          expect(
            conflict,
            `freq ${freq} ${preset}: ${split[k]}(day ${active[k]}) -> ` +
              `${split[k + 1]}(day ${active[k + 1]}) train the same muscle on ` +
              `back-to-back days -> second session lands fried. Split: ${split.join('/')}`,
          ).toBe(false);
        }
      });
    }
  }

  it('every leg-de-emphasis preset still keeps >=1 leg day at 4 and 5 days', () => {
    for (const freq of [4, 5]) {
      const split = frequencyToSplit(freq, 'v-taper');
      const legDays = split.filter((c) => c === 'lower' || c === 'legs').length;
      expect(legDays).toBeGreaterThanOrEqual(1);
    }
  });
});
