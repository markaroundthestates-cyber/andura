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
