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

// MANUAL calendar range (Daniel 2026-06-02): onboarding offers 2-5 days, but the
// calendar lets users go down to 1 or up to 7 — and a dense week (6-7 days) is
// usually CONSECUTIVE. So the v-taper split must be spacing-safe by POSITION (no
// canonical rest-day gaps to lean on): no two adjacent split entries may share a
// muscle, for every n in 1..7. full-body templates are exempt (full×N is a
// deliberate full-frequency choice the recovery engine manages).
describe('v-taper split is spacing-safe across the full MANUAL range (1..7)', () => {
  // n=4 is intentionally EXCLUDED from the layout-independent (worst-case)
  // sweep: its template push/pull/UPPER/lower uses an `upper` day so that BOTH
  // width regions land 2× (umeri via push+upper, spate via pull+upper) — the only
  // way to get umeri2×+spate2×+1-leg into four days. That packs a pull->upper
  // (spate/biceps) adjacency which is safe ONLY with a mid-week gap, exactly what
  // the onboarding default 4-day pattern (L,Ma,J,V — Wed rest) provides; the
  // CALENDAR-pattern suite above already guarantees freq-4 safety on that layout.
  // 5-7 use pure push/pull/legs (no upper) → safe at ANY manual day layout.
  for (let n = 1; n <= 7; n++) {
    if (n === 4) continue;
    it(`v-taper @ ${n} days: no adjacent split positions share a muscle`, () => {
      const split = frequencyToSplit(n, 'v-taper');
      expect(split.length).toBe(n);
      for (let k = 0; k < split.length - 1; k++) {
        // full×N (n=1 single, n=3 full,full,full) is intentional full-frequency.
        if (split[k] === 'full' && split[k + 1] === 'full') continue;
        const conflict = sharesMuscle(split[k], split[k + 1]);
        expect(
          conflict,
          `v-taper @ ${n}d: ${split[k]} -> ${split[k + 1]} share a muscle on ` +
            `adjacent days. Split: ${split.join('/')}`,
        ).toBe(false);
      }
    });
  }

  it('v-taper keeps exactly ONE leg day at every reshaped frequency (4..7)', () => {
    for (let n = 4; n <= 7; n++) {
      const split = frequencyToSplit(n, 'v-taper');
      const legDays = split.filter((c) => c === 'lower' || c === 'legs').length;
      expect(legDays, `v-taper @ ${n}d leg days`).toBe(1);
    }
  });
});

// W-Split REBALANCE path (dp_split_rebalance_v1 — the LIVE default). Daniel
// focus-sweep review 2026-06-11: the day-mix lean's blind first-slot flip broke
// the spaced template's alternation at 6 days — push/pull/push/pull/push/legs
// became PULL/PULL/push/pull/push/legs ("Pull + Pull back-to-back e prost ca
// split automat"). The lean now repairs adjacency (spaceOutSplit): same
// day-type counts, alternation restored.
describe('v-taper REBALANCED split (lean) is spacing-safe (2026-06-11)', () => {
  it('v-taper @ 6 days rebalanced: pull-lean keeps the day-type mix AND the alternation', () => {
    const split = frequencyToSplit(6, 'v-taper', true);
    // The lean's intended mix: the focus region LEADS the week (3 pull / 2 push / 1 legs)…
    const counts = split.reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});
    expect(counts).toEqual({ pull: 3, push: 2, legs: 1 });
    // …with NO same-cluster back-to-back (6-7 active days are consecutive calendar days).
    for (let k = 0; k < split.length - 1; k++) {
      expect(split[k], `position ${k}->${k + 1} in ${split.join('/')}`).not.toBe(split[k + 1]);
    }
  });

  it('rebalanced v-taper @ 5..7: no adjacent positions share a muscle (full×N exempt)', () => {
    for (const n of [5, 6, 7]) {
      const split = frequencyToSplit(n, 'v-taper', true);
      expect(split.length).toBe(n);
      for (let k = 0; k < split.length - 1; k++) {
        if (split[k] === 'full' && split[k + 1] === 'full') continue;
        const conflict = sharesMuscle(split[k], split[k + 1]);
        expect(
          conflict,
          `rebalanced v-taper @ ${n}d: ${split[k]} -> ${split[k + 1]} share a ` +
            `muscle on adjacent days. Split: ${split.join('/')}`,
        ).toBe(false);
      }
    }
  });
});
