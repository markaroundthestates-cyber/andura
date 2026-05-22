import { describe, it, expect } from 'vitest';
import { pluralRo } from '../../lib/pluralRo';

describe('pluralRo — Romanian plural forms', () => {
  it('1 → singular', () => {
    expect(pluralRo(1, 'zi', 'zile')).toBe('1 zi');
    expect(pluralRo(1, 'sesiune', 'sesiuni')).toBe('1 sesiune');
    expect(pluralRo(1, 'record', 'recorduri')).toBe('1 record');
  });

  it('2-19 → plural without "de"', () => {
    expect(pluralRo(2, 'zi', 'zile')).toBe('2 zile');
    expect(pluralRo(5, 'sesiune', 'sesiuni')).toBe('5 sesiuni');
    expect(pluralRo(19, 'record', 'recorduri')).toBe('19 recorduri');
  });

  it('20+ → "de" + plural', () => {
    expect(pluralRo(20, 'zi', 'zile')).toBe('20 de zile');
    expect(pluralRo(100, 'sesiune', 'sesiuni')).toBe('100 de sesiuni');
    expect(pluralRo(365, 'zi', 'zile')).toBe('365 de zile');
  });

  it('0 → plural without "de" (UX preferred)', () => {
    expect(pluralRo(0, 'zi', 'zile')).toBe('0 zile');
    expect(pluralRo(0, 'sesiune', 'sesiuni')).toBe('0 sesiuni');
  });

  it('handles negative numbers via abs', () => {
    expect(pluralRo(-1, 'zi', 'zile')).toBe('-1 zi');
    expect(pluralRo(-5, 'zi', 'zile')).toBe('-5 zile');
  });

  it('truncates decimals for plural rule check', () => {
    expect(pluralRo(1.5, 'zi', 'zile')).toBe('1.5 zi');
    expect(pluralRo(2.5, 'zi', 'zile')).toBe('2.5 zile');
  });
});
