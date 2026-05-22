// §35-H2 storageEstimate scaffold tests. jsdom navigator.storage undefined →
// fail-silent verify. Mock path verifies pct ratio + threshold helper.

import { describe, it, expect, afterEach } from 'vitest';
import {
  getStorageEstimate,
  isStorageNearLimit,
  STORAGE_ALERT_THRESHOLD_PCT,
} from '../../lib/storageEstimate';

const ORIGINAL_STORAGE = (navigator as { storage?: unknown }).storage;

afterEach(() => {
  Object.defineProperty(navigator, 'storage', {
    value: ORIGINAL_STORAGE,
    configurable: true,
    writable: true,
  });
});

describe('storageEstimate — §35-H2', () => {
  it('returns supported=false in jsdom no-API env (fail-silent)', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const result = await getStorageEstimate();
    expect(result.supported).toBe(false);
    expect(result.usage).toBe(0);
    expect(result.quota).toBe(0);
    expect(result.pct).toBe(0);
  });

  it('computes pct correctly when API supported', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: async () => ({ usage: 250, quota: 1000 }),
      },
      configurable: true,
      writable: true,
    });
    const result = await getStorageEstimate();
    expect(result.supported).toBe(true);
    expect(result.usage).toBe(250);
    expect(result.quota).toBe(1000);
    expect(result.pct).toBe(0.25);
  });

  it('handles quota=0 without divide-by-zero', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: async () => ({ usage: 100, quota: 0 }),
      },
      configurable: true,
      writable: true,
    });
    const result = await getStorageEstimate();
    expect(result.pct).toBe(0);
  });

  it('handles estimate() rejection fail-silent', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: async () => {
          throw new Error('quota api blocked');
        },
      },
      configurable: true,
      writable: true,
    });
    const result = await getStorageEstimate();
    expect(result.supported).toBe(false);
  });

  it('isStorageNearLimit true when pct >= 80%', () => {
    expect(
      isStorageNearLimit({ usage: 80, quota: 100, pct: 0.8, supported: true })
    ).toBe(true);
    expect(
      isStorageNearLimit({ usage: 79, quota: 100, pct: 0.79, supported: true })
    ).toBe(false);
  });

  it('isStorageNearLimit false when API unsupported regardless of pct', () => {
    expect(
      isStorageNearLimit({ usage: 99, quota: 100, pct: 0.99, supported: false })
    ).toBe(false);
  });

  it('exports STORAGE_ALERT_THRESHOLD_PCT = 0.8 per ADR 020 §Open Items 2', () => {
    expect(STORAGE_ALERT_THRESHOLD_PCT).toBe(0.8);
  });
});
