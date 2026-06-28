// Bug 3b — subfloorDemoW: the sub-floor demonstrated-load bridge for the recommend
// PR-floor. Pure unit isolation with injected Epley-style e1RM primitives.
import { describe, it, expect } from 'vitest';
import { subfloorDemoW } from '../demoFloorSubfloor.js';

const e1RMForSet = (w, reps) => w * (1 + reps / 30); // Epley, deterministic
const kgFromE1RM = (e, rt) => e / (1 + rt / 30);

describe('subfloorDemoW — sub-floor demonstrated-load bridge (Bug 3b)', () => {
  it('credits a heavy SUB-FLOOR set (43x6 + 40x7 vs floor 8) the raw helper discards', () => {
    const kg = subfloorDemoW(
      [{ w: 43, reps: 6, rpe: 7 }, { w: 40, reps: 7, rpe: 7 }], 8, e1RMForSet, kgFromE1RM,
    );
    expect(kg).toBeGreaterThan(36);      // PR-floor now fires (was 0) → rec catches up
    expect(kg).toBeLessThanOrEqual(43);  // never above the logged load (back-solved to MORE reps)
  });

  it('returns 0 when every set is AT/ABOVE the floor (raw helper already credits those)', () => {
    expect(subfloorDemoW(
      [{ w: 40, reps: 10, rpe: 7 }, { w: 42, reps: 8, rpe: 7 }], 8, e1RMForSet, kgFromE1RM,
    )).toBe(0);
  });

  it('excludes a failed-AND-short grind (rpe >= 8.5) — a set he could not own sets no floor', () => {
    expect(subfloorDemoW([{ w: 60, reps: 5, rpe: 9 }], 8, e1RMForSet, kgFromE1RM)).toBe(0);
  });

  it('takes the heaviest sub-floor set (best e1RM), ignores lighter ones', () => {
    const kg = subfloorDemoW(
      [{ w: 30, reps: 7, rpe: 7 }, { w: 50, reps: 6, rpe: 7 }], 8, e1RMForSet, kgFromE1RM,
    );
    expect(kg).toBeCloseTo(kgFromE1RM(e1RMForSet(50, 6), 8), 5);
  });

  it('defensive: empty / bad input → 0, never throws', () => {
    expect(subfloorDemoW([], 8, e1RMForSet, kgFromE1RM)).toBe(0);
    expect(subfloorDemoW(null, 8, e1RMForSet, kgFromE1RM)).toBe(0);
    expect(() => subfloorDemoW([{ w: 'x', reps: 'y' }], 8, e1RMForSet, kgFromE1RM)).not.toThrow();
  });
});
