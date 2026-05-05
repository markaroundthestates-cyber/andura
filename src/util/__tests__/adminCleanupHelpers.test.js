import { describe, it, expect } from 'vitest';
import {
  SEVEN_DAYS_MS,
  isExpiredArchive,
  isPastHardDeleteSchedule,
} from '../adminCleanupHelpers.js';

describe('§56.14.A admin-cleanup helpers — pure', () => {
  it('SEVEN_DAYS_MS = 7 * 24h', () => {
    expect(SEVEN_DAYS_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  describe('isExpiredArchive — 7 zile grace cutoff', () => {
    const now = 1_700_000_000_000;
    it('timestamp 8 zile în trecut → expired', () => {
      expect(isExpiredArchive(now - 8 * 24 * 60 * 60 * 1000, now)).toBe(true);
    });
    it('timestamp 6 zile în trecut → NU expired', () => {
      expect(isExpiredArchive(now - 6 * 24 * 60 * 60 * 1000, now)).toBe(false);
    });
    it('exact 7 zile → NU expired (strict <)', () => {
      expect(isExpiredArchive(now - SEVEN_DAYS_MS, now)).toBe(false);
    });
    it('non-number → false (defensive)', () => {
      expect(isExpiredArchive('foo', now)).toBe(false);
      expect(isExpiredArchive(null, now)).toBe(false);
      expect(isExpiredArchive(undefined, now)).toBe(false);
    });
  });

  describe('isPastHardDeleteSchedule — 30 zile soft delete cutoff', () => {
    const now = 1_700_000_000_000;
    it('scheduledHardDelete în trecut → past schedule', () => {
      expect(isPastHardDeleteSchedule(now - 1000, now)).toBe(true);
    });
    it('scheduledHardDelete în viitor → NU past schedule', () => {
      expect(isPastHardDeleteSchedule(now + 1000, now)).toBe(false);
    });
    it('non-number → false', () => {
      expect(isPastHardDeleteSchedule('foo', now)).toBe(false);
      expect(isPastHardDeleteSchedule(null, now)).toBe(false);
    });
  });
});
