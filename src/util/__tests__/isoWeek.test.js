import { describe, it, expect } from 'vitest';
import { isoWeek } from '../isoWeek.js';

describe('isoWeek — ISO 8601 Thursday rule', () => {
  it('2025-12-29 (Mon) → 2026-W01 (Thursday is Jan 1 2026)', () => {
    expect(isoWeek(new Date('2025-12-29').getTime())).toBe('2026-W01');
  });

  it('2026-01-01 (Thu) → 2026-W01', () => {
    expect(isoWeek(new Date('2026-01-01').getTime())).toBe('2026-W01');
  });

  it('2026-01-04 (Sun) → 2026-W01', () => {
    expect(isoWeek(new Date('2026-01-04').getTime())).toBe('2026-W01');
  });

  it('2025-12-28 (Sun) → 2025-W52', () => {
    expect(isoWeek(new Date('2025-12-28').getTime())).toBe('2025-W52');
  });

  it('Accepts ISO date string', () => {
    expect(isoWeek('2026-01-01')).toBe('2026-W01');
  });

  it('Accepts Date object', () => {
    expect(isoWeek(new Date('2026-01-01'))).toBe('2026-W01');
  });

  it('Throws on invalid input (null, unparseable string)', () => {
    expect(() => isoWeek('not-a-date')).toThrow();
    expect(() => isoWeek(null)).toThrow();
  });
});

// §11-C1 audit fix — DST transition coverage (audit nuclear V3 SUMMARY §11).
// Romania DST forward: ultima duminica martie 02:00 → 03:00.
// Romania DST back: ultima duminica octombrie 03:00 → 02:00.
// Risk: date arithmetic in isoWeek (setDate) crossing DST could shift by 1h
// → potential off-by-one la week-boundary check daca Date interpretation
// uses local clock. Tests verify weeks remain stable across transition.
describe('isoWeek — DST transition stability', () => {
  it('2026-03-29 (DST spring-forward Sunday) → 2026-W13', () => {
    expect(isoWeek('2026-03-29')).toBe('2026-W13');
  });

  it('2026-03-30 (Monday post-DST-forward) → 2026-W14', () => {
    expect(isoWeek('2026-03-30')).toBe('2026-W14');
  });

  it('2026-10-25 (DST fall-back Sunday) → 2026-W43', () => {
    expect(isoWeek('2026-10-25')).toBe('2026-W43');
  });

  it('2026-10-26 (Monday post-DST-back) → 2026-W44', () => {
    expect(isoWeek('2026-10-26')).toBe('2026-W44');
  });

  it('week stays continuous across DST forward (W13 → W14 single increment)', () => {
    const sun = isoWeek('2026-03-29');
    const mon = isoWeek('2026-03-30');
    expect(sun).toBe('2026-W13');
    expect(mon).toBe('2026-W14');
  });

  it('week stays continuous across DST back (W43 → W44 single increment)', () => {
    const sun = isoWeek('2026-10-25');
    const mon = isoWeek('2026-10-26');
    expect(sun).toBe('2026-W43');
    expect(mon).toBe('2026-W44');
  });
});
