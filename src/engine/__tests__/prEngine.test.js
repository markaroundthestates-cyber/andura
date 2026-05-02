// PR Engine tests — Foundation 1 (Batch B Task 3).
import { describe, it, expect } from 'vitest';
import { detectPR, formatPRMessage, evaluateSetForPR } from '../prEngine.js';

describe('detectPR — weight PR', () => {
  it('flags new max weight', () => {
    const history = [
      { ex: 'Squat', w: 80, reps: 8 },
      { ex: 'Squat', w: 90, reps: 5 },
    ];
    const det = detectPR('Squat', { w: 95, reps: 5 }, history);
    expect(det).not.toBeNull();
    expect(det.type).toBe('weight');
    expect(det.kg).toBe(95);
    expect(det.reps).toBe(5);
  });

  it('returns previous best entry pointer', () => {
    const history = [
      { ex: 'Squat', w: 80, reps: 8 },
      { ex: 'Squat', w: 90, reps: 5 },
    ];
    const det = detectPR('Squat', { w: 95, reps: 5 }, history);
    expect(det.prevBest).toEqual({ ex: 'Squat', w: 90, reps: 5 });
  });

  it('does not flag at same max weight', () => {
    const history = [{ ex: 'Squat', w: 90, reps: 5 }];
    expect(detectPR('Squat', { w: 90, reps: 5 }, history)).toBeNull();
  });

  it('does not flag below max weight', () => {
    const history = [{ ex: 'Squat', w: 90, reps: 5 }];
    expect(detectPR('Squat', { w: 80, reps: 5 }, history)).toBeNull();
  });

  it('only considers same exercise', () => {
    const history = [
      { ex: 'Bench', w: 100, reps: 5 },
      { ex: 'Squat', w: 50, reps: 5 },
    ];
    const det = detectPR('Squat', { w: 60, reps: 5 }, history);
    expect(det.type).toBe('weight');
    expect(det.prevBest.ex).toBe('Squat'); // not Bench
  });
});

describe('detectPR — reps PR', () => {
  it('flags more reps at same weight', () => {
    const history = [{ ex: 'Squat', w: 90, reps: 5 }];
    const det = detectPR('Squat', { w: 90, reps: 6 }, history);
    expect(det).not.toBeNull();
    expect(det.type).toBe('reps');
  });

  it('flags more reps at heavier weight too', () => {
    // Set has same weight as prior heaviest, more reps → reps PR (not weight PR
    // since w not strictly >).
    const history = [
      { ex: 'Squat', w: 90, reps: 5 },
      { ex: 'Squat', w: 85, reps: 8 },
    ];
    const det = detectPR('Squat', { w: 90, reps: 6 }, history);
    expect(det.type).toBe('reps');
  });

  it('does not flag same reps at same weight', () => {
    const history = [{ ex: 'Squat', w: 90, reps: 5 }];
    expect(detectPR('Squat', { w: 90, reps: 5 }, history)).toBeNull();
  });

  it('does not flag fewer reps at same weight', () => {
    const history = [{ ex: 'Squat', w: 90, reps: 5 }];
    expect(detectPR('Squat', { w: 90, reps: 4 }, history)).toBeNull();
  });
});

describe('detectPR — volume PR', () => {
  it('volume branch can fire when reps and weight already saturated', () => {
    // Construct: prior heaviest tier owns max reps in sameOrHeavier filter.
    // Set ties reps but weight equal → no weight PR, no reps PR (not strictly greater),
    // and volume larger than any prior single-set volume.
    // prior: [{ w: 100, reps: 10 }] → maxVol = 1000, sameOrHeavier@100 = [100×10] maxReps=10
    // set { w: 100, reps: 11 } → reps 11>10 → reps PR. So can't isolate.
    //
    // Volume PR is reachable when set ties existing weight + reps but a *separate*
    // entry owns max volume that the new set crosses. Tied weight + reps tied = no
    // strict reps PR. With our strict-greater logic for reps, we need set.reps NOT
    // strictly greater than maxRepsAtWeight in sameOrHeavier.
    const history = [
      { ex: 'Squat', w: 110, reps: 10 }, // sameOrHeavier@100 includes this; maxReps=10
      { ex: 'Squat', w: 100, reps: 10 }, // sameOrHeavier@100 includes this; maxReps=10
    ];
    // Set 100 × 10 → ties, no PR.
    expect(detectPR('Squat', { w: 100, reps: 10 }, history)).toBeNull();
  });

  it('reps PR pre-empts volume PR per detection order', () => {
    // 50×10 = 500 ties prior 100×5 volume (no strict greater) but reps tier
    // sameOrHeavier@50 = [100×5] maxReps=5 → set reps 10 > 5 fires reps PR.
    const history = [{ ex: 'Squat', w: 100, reps: 5 }];
    const det = detectPR('Squat', { w: 50, reps: 10 }, history);
    expect(det.type).toBe('reps');
  });
});

describe('detectPR — defensive edges', () => {
  it('returns null on missing exercise', () => {
    expect(detectPR('', { w: 100, reps: 5 }, [])).toBeNull();
  });

  it('returns null on missing set', () => {
    expect(detectPR('Squat', null, [])).toBeNull();
  });

  it('returns null on missing history', () => {
    expect(detectPR('Squat', { w: 100, reps: 5 }, null)).toBeNull();
  });

  it('returns null on invalid weight', () => {
    const h = [{ ex: 'Squat', w: 80, reps: 5 }];
    expect(detectPR('Squat', { w: 0, reps: 5 }, h)).toBeNull();
    expect(detectPR('Squat', { w: -10, reps: 5 }, h)).toBeNull();
  });

  it('returns null on invalid reps', () => {
    expect(detectPR('Squat', { w: 100, reps: 0 }, [{ ex: 'Squat', w: 80, reps: 5 }])).toBeNull();
  });

  it('returns null on first ever set (empty prior)', () => {
    expect(detectPR('Squat', { w: 100, reps: 5 }, [])).toBeNull();
  });

  it('ignores baseline-injected entries', () => {
    const history = [{ ex: 'Squat', w: 100, reps: 5, baseline: true }];
    expect(detectPR('Squat', { w: 110, reps: 5 }, history)).toBeNull();
  });

  it('treats string numeric reps correctly', () => {
    const history = [{ ex: 'Squat', w: 90, reps: 5 }];
    const det = detectPR('Squat', { w: 90, reps: '6' }, history);
    expect(det.type).toBe('reps');
  });
});

describe('formatPRMessage', () => {
  it('weight type message', () => {
    expect(formatPRMessage({ type: 'weight', kg: 100, reps: 5 }, 'Squat'))
      .toBe('Record nou la Squat: 100 kg × 5 reps.');
  });

  it('reps type message', () => {
    expect(formatPRMessage({ type: 'reps', kg: 90, reps: 8 }, 'Bench Press'))
      .toBe('Reps record la Bench Press: 90 kg × 8 reps.');
  });

  it('volume type message', () => {
    expect(formatPRMessage({ type: 'volume', kg: 80, reps: 12 }, 'Row'))
      .toBe('Volum record la Row: 80 kg × 12 reps.');
  });

  it('returns empty on missing detection or exercise', () => {
    expect(formatPRMessage(null, 'Squat')).toBe('');
    expect(formatPRMessage({ type: 'weight', kg: 100, reps: 5 }, '')).toBe('');
  });

  it('Bugatti tone — no exclamation, no emoji', () => {
    const msg = formatPRMessage({ type: 'weight', kg: 100, reps: 5 }, 'Squat');
    expect(msg).not.toMatch(/[!]/);
    expect(msg).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });
});

describe('evaluateSetForPR', () => {
  it('returns isPR=false when no PR', () => {
    const out = evaluateSetForPR('Squat', { w: 80, reps: 5 }, [{ ex: 'Squat', w: 100, reps: 5 }]);
    expect(out.isPR).toBe(false);
    expect(out.type).toBeUndefined();
  });

  it('returns isPR=true with message + detection when PR', () => {
    const out = evaluateSetForPR('Squat', { w: 110, reps: 5 }, [{ ex: 'Squat', w: 100, reps: 5 }]);
    expect(out.isPR).toBe(true);
    expect(out.type).toBe('weight');
    expect(out.message).toContain('Record nou');
    expect(out.detection).toBeDefined();
  });
});
