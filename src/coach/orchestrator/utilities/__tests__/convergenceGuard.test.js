import { describe, it, expect } from 'vitest';
import { resolveTier } from '../convergenceGuard.js';

describe('resolveTier — ADR 030 D5 stub V1 (Q-OPEN-7 PENDING)', () => {
  it('returns existing profileTier passthrough', () => {
    expect(resolveTier({ profileTier: 'T0' })).toBe('T0');
    expect(resolveTier({ profileTier: 'T2' })).toBe('T2');
    expect(resolveTier({ profileTier: 'STABLE' })).toBe('STABLE');
  });

  it('returns null when profileTier missing', () => {
    expect(resolveTier({})).toBeNull();
    expect(resolveTier()).toBeNull();
  });

  it('returns null when input null/undefined', () => {
    expect(resolveTier(null)).toBeNull();
    expect(resolveTier(undefined)).toBeNull();
  });

  it('does NOT mutate the userState (purity guard)', () => {
    const us = { profileTier: 'T1', other: 'preserved' };
    resolveTier(us);
    expect(us).toEqual({ profileTier: 'T1', other: 'preserved' });
  });
});
