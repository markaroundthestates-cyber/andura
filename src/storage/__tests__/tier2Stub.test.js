// ══ src/storage/tier2Stub.js — stub API contract tests (ADR 020) ═══════════
// Tier 2 implementation deferred; this verifies stub shape so callers can
// invoke without runtime errors.

import { describe, it, expect } from 'vitest';
import { tier2Push, tier2Fetch, tier2Stats, tier2Available } from '../tier2Stub.js';

describe('tier2Stub — deferred contract', () => {
  it('tier2Push returns deferred result, no-op', async () => {
    const r = await tier2Push('cdl_tier1', [{ id: 'x' }]);
    expect(r.pushed).toBe(0);
    expect(r.deferred).toBe(true);
    expect(typeof r.reason).toBe('string');
  });

  it('tier2Fetch returns empty array', async () => {
    expect(await tier2Fetch('cdl_tier1')).toEqual([]);
    expect(await tier2Fetch('cdl_tier1', { date: '2024' })).toEqual([]);
  });

  it('tier2Stats returns zero state with deferred flag', async () => {
    const s = await tier2Stats();
    expect(s.entryCount).toBe(0);
    expect(s.lastSync).toBeNull();
    expect(s.monthlyEstCost).toBe(0);
    expect(s.deferred).toBe(true);
  });

  it('tier2Available returns false', () => {
    expect(tier2Available()).toBe(false);
  });
});
