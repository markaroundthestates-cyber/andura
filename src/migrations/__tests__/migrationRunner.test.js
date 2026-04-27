import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMigrations, getEntryVersion, LARGE_MIGRATION_THRESHOLD } from '../migrationRunner.js';
import { MIGRATIONS } from '../MIGRATIONS.js';

const makeDb = (initial = {}) => {
  const store = { ...initial };
  return {
    get: vi.fn(k => (k in store ? structuredClone(store[k]) : null)),
    set: vi.fn((k, v) => { store[k] = structuredClone(v); }),
    _store: store,
  };
};

const makeSentry = () => ({ captureException: vi.fn() });
const makeLogger = () => ({ log: vi.fn(), warn: vi.fn(), error: vi.fn() });

describe('migrationRunner — getEntryVersion', () => {
  it('returns explicit schemaVersion when present', () => {
    expect(getEntryVersion({ schemaVersion: 3 })).toBe(3);
  });

  it('treats entries without schemaVersion as v1 (ADR 018 §4)', () => {
    expect(getEntryVersion({ id: 'x' })).toBe(1);
    expect(getEntryVersion({})).toBe(1);
  });

  it('treats null/undefined entries as v1 defensively', () => {
    expect(getEntryVersion(null)).toBe(1);
    expect(getEntryVersion(undefined)).toBe(1);
  });

  it('treats non-numeric schemaVersion as v1', () => {
    expect(getEntryVersion({ schemaVersion: '2' })).toBe(1);
    expect(getEntryVersion({ schemaVersion: null })).toBe(1);
  });
});

describe('migrationRunner — empty / no-op cases', () => {
  it('default MIGRATIONS array is empty in Sprint Foundation Batch 2', () => {
    expect(Array.isArray(MIGRATIONS)).toBe(true);
    expect(MIGRATIONS).toHaveLength(0);
  });

  it('returns zero-state result when migrations array is empty', () => {
    const db = makeDb();
    const result = runMigrations({ migrations: [], db, sentry: makeSentry(), logger: makeLogger() });
    expect(result).toEqual({ migrationsRun: 0, totalEntriesMigrated: 0, perMigration: [], errors: [] });
    expect(db.set).not.toHaveBeenCalled();
  });

  it('returns zero-state result when migrations is non-array', () => {
    const result = runMigrations({ migrations: null, db: makeDb(), sentry: makeSentry(), logger: makeLogger() });
    expect(result.migrationsRun).toBe(0);
  });

  it('skips storage keys with null entries (no app data yet)', () => {
    const db = makeDb({});
    const m = {
      fromVersion: 1, toVersion: 2, description: 'noop',
      storageKeys: ['empty-key'],
      migrate: e => ({ ...e, migrated: true }),
    };
    const result = runMigrations({ migrations: [m], db, sentry: makeSentry(), logger: makeLogger() });
    expect(result.totalEntriesMigrated).toBe(0);
    expect(db.set).not.toHaveBeenCalled();
  });

  it('logs warning + skips non-array values at storage key', () => {
    const db = makeDb({ 'weird-key': { not: 'an-array' } });
    const logger = makeLogger();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'noop',
      storageKeys: ['weird-key'],
      migrate: e => e,
    };
    const result = runMigrations({ migrations: [m], db, sentry: makeSentry(), logger });
    expect(logger.warn).toHaveBeenCalledWith(expect.stringMatching(/not an array/));
    expect(result.totalEntriesMigrated).toBe(0);
  });
});

describe('migrationRunner — single migration', () => {
  it('migrates v1 entries to v2 and persists with schemaVersion bumped', () => {
    const db = makeDb({ 'cdl': [{ id: 'a' }, { id: 'b', schemaVersion: 1 }] });
    const m = {
      fromVersion: 1, toVersion: 2, description: 'add foo',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, foo: 'bar' }),
    };
    const result = runMigrations({ migrations: [m], db, sentry: makeSentry(), logger: makeLogger() });

    expect(result.totalEntriesMigrated).toBe(2);
    expect(db.set).toHaveBeenCalledTimes(1);
    const persisted = db._store['cdl'];
    expect(persisted).toEqual([
      { id: 'a', foo: 'bar', schemaVersion: 2 },
      { id: 'b', foo: 'bar', schemaVersion: 2 },
    ]);
  });

  it('skips entries already at or above toVersion (idempotent)', () => {
    const db = makeDb({ 'cdl': [{ id: 'a', schemaVersion: 2 }, { id: 'b', schemaVersion: 1 }] });
    const m = {
      fromVersion: 1, toVersion: 2, description: 'add foo',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, foo: 'bar' }),
    };
    const result = runMigrations({ migrations: [m], db, sentry: makeSentry(), logger: makeLogger() });

    expect(result.totalEntriesMigrated).toBe(1);
    const persisted = db._store['cdl'];
    expect(persisted[0]).toEqual({ id: 'a', schemaVersion: 2 }); // unchanged
    expect(persisted[1]).toEqual({ id: 'b', foo: 'bar', schemaVersion: 2 });
  });

  it('re-running runMigrations after a successful pass is a no-op', () => {
    const db = makeDb({ 'cdl': [{ id: 'a' }] });
    const m = {
      fromVersion: 1, toVersion: 2, description: 'pass',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, touched: true }),
    };
    runMigrations({ migrations: [m], db, sentry: makeSentry(), logger: makeLogger() });
    db.set.mockClear();

    const result2 = runMigrations({ migrations: [m], db, sentry: makeSentry(), logger: makeLogger() });
    expect(result2.totalEntriesMigrated).toBe(0);
  });

  it('iterates multiple storageKeys per migration', () => {
    const db = makeDb({
      'cdl-a': [{ id: 'x' }],
      'cdl-b': [{ id: 'y' }, { id: 'z' }],
    });
    const m = {
      fromVersion: 1, toVersion: 2, description: 'multi-key',
      storageKeys: ['cdl-a', 'cdl-b'],
      migrate: e => ({ ...e, ok: true }),
    };
    const result = runMigrations({ migrations: [m], db, sentry: makeSentry(), logger: makeLogger() });
    expect(result.totalEntriesMigrated).toBe(3);
    expect(db._store['cdl-a']).toHaveLength(1);
    expect(db._store['cdl-b']).toHaveLength(2);
    expect(db._store['cdl-a'][0].schemaVersion).toBe(2);
    expect(db._store['cdl-b'][1].schemaVersion).toBe(2);
  });
});

describe('migrationRunner — chained migrations', () => {
  it('chains v1→v2 then v2→v3 sequentially in a single pass', () => {
    const db = makeDb({ 'cdl': [{ id: 'a' }] });
    const m1 = {
      fromVersion: 1, toVersion: 2, description: 'add foo',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, foo: 1 }),
    };
    const m2 = {
      fromVersion: 2, toVersion: 3, description: 'add bar',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, bar: 2 }),
    };
    const result = runMigrations({ migrations: [m1, m2], db, sentry: makeSentry(), logger: makeLogger() });

    expect(result.migrationsRun).toBe(2);
    expect(result.totalEntriesMigrated).toBe(2); // 1 entry × 2 migrations
    expect(db._store['cdl'][0]).toEqual({ id: 'a', foo: 1, bar: 2, schemaVersion: 3 });
  });

  it('sorts out-of-order migrations by fromVersion ascending', () => {
    const db = makeDb({ 'cdl': [{ id: 'a' }] });
    const m2 = {
      fromVersion: 2, toVersion: 3, description: 'second',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, step: (e.step ?? 0) + 1 }),
    };
    const m1 = {
      fromVersion: 1, toVersion: 2, description: 'first',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, step: (e.step ?? 0) + 1 }),
    };
    runMigrations({ migrations: [m2, m1], db, sentry: makeSentry(), logger: makeLogger() });
    expect(db._store['cdl'][0].step).toBe(2); // applied both
    expect(db._store['cdl'][0].schemaVersion).toBe(3);
  });
});

describe('migrationRunner — failsafe on migrate() throws', () => {
  it('persists already-migrated entries + leaves rest at original version', () => {
    const db = makeDb({
      'cdl': [{ id: 'ok1' }, { id: 'ok2' }, { id: 'BOOM' }, { id: 'after1' }, { id: 'after2' }],
    });
    const sentry = makeSentry();
    const logger = makeLogger();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'risky',
      storageKeys: ['cdl'],
      migrate(e) {
        if (e.id === 'BOOM') throw new Error('cannot migrate BOOM');
        return { ...e, migrated: true };
      },
    };
    const result = runMigrations({ migrations: [m], db, sentry, logger });

    const persisted = db._store['cdl'];
    expect(persisted[0]).toEqual({ id: 'ok1', migrated: true, schemaVersion: 2 });
    expect(persisted[1]).toEqual({ id: 'ok2', migrated: true, schemaVersion: 2 });
    expect(persisted[2]).toEqual({ id: 'BOOM' }); // unchanged
    expect(persisted[3]).toEqual({ id: 'after1' }); // unchanged
    expect(persisted[4]).toEqual({ id: 'after2' }); // unchanged

    expect(sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: expect.objectContaining({ severity: 'critical', op: 'migrate' }) })
    );
    expect(logger.error).toHaveBeenCalled();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].entryId).toBe('BOOM');
  });

  it('does not throw — app continues în graceful degradation', () => {
    const db = makeDb({ 'cdl': [{ id: 'BOOM' }] });
    const m = {
      fromVersion: 1, toVersion: 2, description: 'risky',
      storageKeys: ['cdl'],
      migrate() { throw new Error('boom'); },
    };
    expect(() =>
      runMigrations({ migrations: [m], db, sentry: makeSentry(), logger: makeLogger() })
    ).not.toThrow();
  });

  it('rejects migrate() returning non-object as critical', () => {
    const db = makeDb({ 'cdl': [{ id: 'a' }] });
    const sentry = makeSentry();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'bad',
      storageKeys: ['cdl'],
      migrate: () => null, // bad return
    };
    runMigrations({ migrations: [m], db, sentry, logger: makeLogger() });
    expect(sentry.captureException).toHaveBeenCalled();
  });

  it('captures + reports DB.set failure as critical', () => {
    const db = {
      get: () => [{ id: 'a' }],
      set: vi.fn(() => { throw new Error('quota exceeded'); }),
    };
    const sentry = makeSentry();
    const logger = makeLogger();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'persist-fail',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, ok: true }),
    };
    const result = runMigrations({ migrations: [m], db, sentry, logger });
    expect(sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: expect.objectContaining({ severity: 'critical', op: 'persist' }) })
    );
    expect(result.errors.some(e => e.op === 'persist')).toBe(true);
  });

  it('captures DB.get failure + skips key', () => {
    const db = {
      get: vi.fn(() => { throw new Error('storage corrupted'); }),
      set: vi.fn(),
    };
    const sentry = makeSentry();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'read-fail',
      storageKeys: ['cdl'],
      migrate: e => e,
    };
    runMigrations({ migrations: [m], db, sentry, logger: makeLogger() });
    expect(sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: expect.objectContaining({ severity: 'warning', op: 'read' }) })
    );
    expect(db.set).not.toHaveBeenCalled();
  });
});

describe('migrationRunner — fix-loud large migrations (DP-5)', () => {
  it('fires Sentry warning when count exceeds LARGE_MIGRATION_THRESHOLD', () => {
    const big = Array.from({ length: LARGE_MIGRATION_THRESHOLD + 5 }, (_, i) => ({ id: `e${i}` }));
    const db = makeDb({ 'cdl': big });
    const sentry = makeSentry();
    const logger = makeLogger();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'big-batch',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, ok: true }),
    };
    runMigrations({ migrations: [m], db, sentry, logger });

    expect(logger.warn).toHaveBeenCalledWith(expect.stringMatching(/Large migration/));
    expect(sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: expect.objectContaining({ op: 'large_migration', severity: 'warning' }) })
    );
  });

  it('does NOT fire large-migration warning at exactly threshold count', () => {
    const at = Array.from({ length: LARGE_MIGRATION_THRESHOLD }, (_, i) => ({ id: `e${i}` }));
    const db = makeDb({ 'cdl': at });
    const sentry = makeSentry();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'at-threshold',
      storageKeys: ['cdl'],
      migrate: e => ({ ...e, ok: true }),
    };
    runMigrations({ migrations: [m], db, sentry, logger: makeLogger() });
    // sentry should NOT be called for large_migration tag
    const calls = sentry.captureException.mock.calls;
    const largeMigrationCall = calls.find(c => c[1]?.tags?.op === 'large_migration');
    expect(largeMigrationCall).toBeUndefined();
  });
});

describe('migrationRunner — structured logging', () => {
  it('logs per-migration count + storage key list', () => {
    const db = makeDb({ 'cdl-a': [{ id: 'x' }], 'cdl-b': [{ id: 'y' }] });
    const logger = makeLogger();
    const m = {
      fromVersion: 1, toVersion: 2, description: 'multi',
      storageKeys: ['cdl-a', 'cdl-b'],
      migrate: e => ({ ...e, ok: true }),
    };
    runMigrations({ migrations: [m], db, sentry: makeSentry(), logger });
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringMatching(/multi.*v1→v2.*2 entries.*cdl-a, cdl-b/)
    );
  });

  it('returns per-migration breakdown in result', () => {
    const db = makeDb({ 'k1': [{ id: 'a' }], 'k2': [{ id: 'b' }] });
    const m1 = { fromVersion: 1, toVersion: 2, description: 'first',  storageKeys: ['k1'], migrate: e => e };
    const m2 = { fromVersion: 2, toVersion: 3, description: 'second', storageKeys: ['k2'], migrate: e => e };
    const result = runMigrations({ migrations: [m1, m2], db, sentry: makeSentry(), logger: makeLogger() });
    expect(result.perMigration).toHaveLength(2);
    expect(result.perMigration[0].description).toBe('first');
    expect(result.perMigration[0].count).toBe(1);
  });
});
