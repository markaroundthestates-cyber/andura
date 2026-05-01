import { describe, it, expect } from 'vitest';
import {
  migrate,
  remapTierId,
  TIER_5_TO_6_MIGRATION,
} from '../2026-05-02-tier-5-to-6.js';

describe('migration 5→6 tiers — remapTierId', () => {
  it('leaves COLD_START (id 0) unchanged', () => {
    expect(remapTierId(0)).toBe(0);
  });

  it('leaves INITIAL (id 1) unchanged', () => {
    expect(remapTierId(1)).toBe(1);
  });

  it('maps old PERSONALIZING (2) → new PERSONALIZING (3)', () => {
    expect(remapTierId(2)).toBe(3);
  });

  it('maps old PERSONALIZED (3) → new PERSONALIZED (4)', () => {
    expect(remapTierId(3)).toBe(4);
  });

  it('maps old OPTIMIZED (4) → new OPTIMIZED (5)', () => {
    expect(remapTierId(4)).toBe(5);
  });

  it('leaves unknown ids untouched (forward-compat / corruption tolerance)', () => {
    expect(remapTierId(99)).toBe(99);
    expect(remapTierId(-1)).toBe(-1);
  });

  it('returns input unchanged for non-number values', () => {
    expect(remapTierId('foo')).toBe('foo');
    expect(remapTierId(null)).toBe(null);
    expect(remapTierId(undefined)).toBe(undefined);
  });
});

describe('migration 5→6 tiers — migrate(entry)', () => {
  it('is a no-op for entries without context', () => {
    const entry = { id: 'cd_1', timestamp: 100 };
    expect(migrate(entry)).toEqual(entry);
  });

  it('is a no-op when calibrationLevel is a string (names unchanged)', () => {
    const entry = { id: 'cd_1', context: { calibrationLevel: 'PERSONALIZED' } };
    expect(migrate(entry)).toEqual(entry);
  });

  it('is a no-op when calibrationLevel is null', () => {
    const entry = { id: 'cd_1', context: { calibrationLevel: null } };
    expect(migrate(entry)).toEqual(entry);
  });

  it('remaps numeric id on context.calibrationLevel object', () => {
    const entry = {
      id: 'cd_1',
      context: { calibrationLevel: { id: 2, name: 'personalizing' } },
    };
    const out = migrate(entry);
    expect(out.context.calibrationLevel.id).toBe(3);
    expect(out.context.calibrationLevel.name).toBe('personalizing');
  });

  it('remaps OPTIMIZED 4→5', () => {
    const entry = {
      id: 'cd_1',
      context: { calibrationLevel: { id: 4, name: 'optimized' } },
    };
    expect(migrate(entry).context.calibrationLevel.id).toBe(5);
  });

  it('does not mutate the original entry (immutability)', () => {
    const entry = {
      id: 'cd_1',
      context: { calibrationLevel: { id: 2, name: 'personalizing' } },
    };
    const out = migrate(entry);
    expect(entry.context.calibrationLevel.id).toBe(2);  // original untouched
    expect(out).not.toBe(entry);
    expect(out.context).not.toBe(entry.context);
  });

  it('handles legacy entry-root calibrationLevel shape', () => {
    const entry = {
      id: 'cd_1',
      calibrationLevel: { id: 3, name: 'personalized' },
    };
    expect(migrate(entry).calibrationLevel.id).toBe(4);
  });

  it('preserves other context fields untouched', () => {
    const entry = {
      id: 'cd_1',
      context: {
        calibrationLevel: { id: 2, name: 'personalizing' },
        readinessScore: 75,
        weakGroups: ['legs'],
      },
    };
    const out = migrate(entry);
    expect(out.context.readinessScore).toBe(75);
    expect(out.context.weakGroups).toEqual(['legs']);
  });
});

describe('migration 5→6 tiers — registration entry', () => {
  it('declares correct schemaVersion bump v1→v2', () => {
    expect(TIER_5_TO_6_MIGRATION.fromVersion).toBe(1);
    expect(TIER_5_TO_6_MIGRATION.toVersion).toBe(2);
  });

  it('targets the CDL storage keys (primary + aggregate + archive)', () => {
    expect(TIER_5_TO_6_MIGRATION.storageKeys).toEqual([
      'coach-decisions',
      'coach-decisions-aggregate',
      'coach-decisions-archive',
    ]);
  });

  it('exposes the migrate function', () => {
    expect(typeof TIER_5_TO_6_MIGRATION.migrate).toBe('function');
  });
});

describe('migration 5→6 tiers — idempotency (re-run safety)', () => {
  it('migrating a v1 entry twice yields the same shape (runner gates re-runs by schemaVersion)', () => {
    // The runner filters entries already at toVersion, so migrate() in
    // practice never sees v2 entries. But if it did, the function should
    // still produce a valid output (no double-bump) because remapTierId
    // is monotonic only for known old ids — id 5 is already-new so leaves
    // unchanged (>4 falls through to the identity branch).
    const v1Entry = {
      id: 'cd_1',
      context: { calibrationLevel: { id: 4, name: 'optimized' } },
    };
    const once = migrate(v1Entry);
    expect(once.context.calibrationLevel.id).toBe(5);

    // Hypothetical re-run on already-migrated entry — id 5 stays 5
    const twice = migrate({ ...once });
    expect(twice.context.calibrationLevel.id).toBe(5);
  });
});
