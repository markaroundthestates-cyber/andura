// Fast unit coverage for the sim GATE machinery (pure analysis + crater detector
// + hash) on a tiny synthetic cohort — guards the detectors themselves so the
// big regression gate (sim-regression.test.js) can be trusted. No engine run here.

import { describe, it, expect } from 'vitest';
import { analyzeCohort, craterViolations } from './sim-analyze.js';
import { cohortStreamHash, cohortStream } from './sim-hash.js';

// A tiny hand-built cohort: one exercise, the user currently working ~100kg,
// then a planted CRATER (rec collapses to 5kg) — the detector must catch it.
function craterCohort() {
  const mk = (s, recKg, enteredKg, status = 'ON TARGET') => ({
    sessionIdx: s,
    missed: false,
    recLog: [{ ex: 'Squat', set: 1, recKg, enteredKg, enteredReps: 8, rating: 'potrivit', status }],
  });
  return {
    cohort: [
      {
        profile: { id: 'T0', archetype: 'consistent', experience: 'intermediate' },
        sessions: [mk(0, 100, 100), mk(1, 100, 102), mk(2, 100, 100), mk(3, 5, 5)],
      },
    ],
  };
}

describe('sim gate machinery (fast)', () => {
  it('craterViolations catches a collapse below 25% of the recent worked load', () => {
    const v = craterViolations(craterCohort());
    expect(v.length).toBe(1);
    expect(v[0].ex).toBe('Squat');
    expect(v[0].recKg).toBe(5);
  });

  it('craterViolations exempts a RETURN DELOAD (the only legal sub-floor)', () => {
    const data = craterCohort();
    data.cohort[0].sessions[3].recLog[0].status = 'RETURN DELOAD';
    expect(craterViolations(data)).toHaveLength(0);
  });

  it('analyzeCohort returns convergence + flag counts on a small cohort', () => {
    const an = analyzeCohort(craterCohort());
    expect(an.convergence.overall).toHaveProperty('convergedPct');
    expect(an.failureFlags.counts).toHaveProperty('oscillation');
  });

  it('cohortStreamHash is stable + ignores volatile non-prescription fields', () => {
    const a = craterCohort();
    const b = craterCohort();
    // mutate a volatile field the hash must ignore (entered load, not the rec)
    b.cohort[0].sessions[0].recLog[0].enteredKg = 999;
    expect(cohortStreamHash(a)).toBe(cohortStreamHash(b));
    expect(cohortStream(a)).toContain('Squat');
  });
});
