// dp_home_day_volume_v1 (founder 2026-10-01: "un antrenament de 27 minute... mi se
// pare cam scurt"). His v-taper 4-day week is push / pull / upper / lower; dividing the
// weekly budget by the plain COUNT of days split his back 7 Pull + 7 Upper, so the day
// named for the muscle was the thinnest of the week. homeDayDivisors weights each day by
// the cluster weights the split already declares.

import { describe, it, expect } from 'vitest';
import { weeklySessionsPerGroup, homeDayDivisors } from '../scheduleAdapter/weeklySessions.js';

const PPUL = ['push', 'pull', 'upper', 'lower'];

describe('homeDayDivisors — a group lives mostly on its own day', () => {
  const counts = weeklySessionsPerGroup(PPUL);

  it('back: ~2/3 of the week on Pull, ~1/3 on Upper (shares sum to the whole week)', () => {
    const onPull = homeDayDivisors(PPUL, 'pull', counts);
    const onUpper = homeDayDivisors(PPUL, 'upper', counts);
    expect(onPull.spate).toBeCloseTo(0.925 / 0.625, 9);
    expect(onUpper.spate).toBeCloseTo(0.925 / 0.30, 9);
    expect(1 / onPull.spate + 1 / onUpper.spate).toBeCloseTo(1, 9);
  });

  it('only groups trained today move; a single-day group keeps its count', () => {
    const onPull = homeDayDivisors(PPUL, 'pull', counts);
    expect(onPull.piept).toBe(counts.piept); // not trained on Pull
    expect(onPull['picioare-quads']).toBe(counts['picioare-quads']); // lower only
  });

  it('equal-weight weeks (U/L x2) keep the plain count — identical', () => {
    const ul = ['upper', 'lower', 'upper', 'lower'];
    expect(homeDayDivisors(ul, 'upper', weeklySessionsPerGroup(ul))).toEqual(weeklySessionsPerGroup(ul));
  });

  it('a de-emphasized group keeps its (balanced) divisor', () => {
    const adjusted = { ...counts, spate: 3 };
    expect(homeDayDivisors(PPUL, 'pull', adjusted, new Set(['spate'])).spate).toBe(3);
  });

  it('a cluster outside the split (override day) changes nothing', () => {
    expect(homeDayDivisors(PPUL, 'legs', counts)).toEqual(counts);
  });
});
