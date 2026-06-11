// ══ ID-MIGRATION Phase 3 — migrator (DORMANT): dry-run plan + guarded apply ════
// Design 04-architecture/ID-MIGRATION-DESIGN_2026-06-10.md §3/§4. The module is
// dormant (nothing calls migrateObjectKeyStore on load); these prove the PLANNING
// and the backup-first / idempotent / merge semantics so activation is safe.
//
// Real seeded aliases (exercises.json): "Chest Fly" → canonical "Cable Fly".

import { describe, it, expect, beforeEach } from 'vitest';
import { DB } from '../../db.js';
import {
  planObjectKeyStore,
  planRowFieldStore,
  planDynamicPrefixKeys,
  dryRunAllStores,
  migrateObjectKeyStore,
  NAME_KEYED_STORES,
  SCHEMA_VERSION_KEY,
  TARGET_SCHEMA_VERSION,
} from '../idMigration.js';

beforeEach(() => { localStorage.clear(); });

describe('planObjectKeyStore — dry-run plan (no writes)', () => {
  it('flags an alias key as a re-key onto the canonical name + stable id', () => {
    const plan = planObjectKeyStore('dp-cal-factors', { 'Chest Fly': { kgFactor: 1.1, n: 4 } });
    expect(plan.rekeys).toEqual([{ from: 'Chest Fly', to: 'Cable Fly', id: 'cable-fly' }]);
    expect(plan.changed).toBe(1);
  });

  it('detects an alias↔canonical COLLISION as a merge (never silently dropped)', () => {
    const plan = planObjectKeyStore('dp-cal-factors', {
      'Chest Fly': { kgFactor: 1.1, n: 4 },
      'Cable Fly': { kgFactor: 1.2, n: 6 },
    });
    expect(plan.merges).toEqual([{ canonical: 'Cable Fly', aliases: ['Chest Fly', 'Cable Fly'] }]);
    expect(plan.changed).toBe(1); // only the alias key moves
  });

  it('an already-canonical store at TARGET_SCHEMA_VERSION is "migrated" (idempotent no-op)', () => {
    const plan = planObjectKeyStore('dp-cal-factors', {
      'Cable Fly': { kgFactor: 1.2, n: 6 },
      [SCHEMA_VERSION_KEY]: TARGET_SCHEMA_VERSION,
    });
    expect(plan.changed).toBe(0);
    expect(plan.status).toBe('migrated');
  });

  it('keeps an off-library / reserved key (e.g. dp-temperament "global") verbatim', () => {
    const plan = planObjectKeyStore('dp-temperament', {
      global: { bias: 0.2, n: 10 },
      'Chest Fly': { bias: 0.1, n: 5 },
    });
    // 'global' resolves to null → stays itself → not a re-key; only the alias moves.
    expect(plan.rekeys).toEqual([{ from: 'Chest Fly', to: 'Cable Fly', id: 'cable-fly' }]);
  });

  it('absent / empty / non-object are reported, not crashed', () => {
    expect(planObjectKeyStore('x', null).status).toBe('absent');
    expect(planObjectKeyStore('x', {}).status).toBe('empty');
    expect(planObjectKeyStore('x', [1, 2]).status).toBe('unsupported');
  });
});

describe('planRowFieldStore — logs / pr-records', () => {
  it('flags rows whose name field resolves to a different canonical', () => {
    const plan = planRowFieldStore('logs', [
      { ex: 'Chest Fly', w: 30 },
      { ex: 'Cable Fly', w: 32 },
      { ex: 'Lat Pulldown', w: 60 },
    ], 'ex');
    expect(plan.rekeys).toEqual([{ from: 'Chest Fly', to: 'Cable Fly', id: 'cable-fly' }]);
    expect(plan.changed).toBe(1); // one row carries the alias
  });

  it('off-library row names are left alone', () => {
    const plan = planRowFieldStore('logs', [{ ex: 'My Custom Lift', w: 10 }], 'ex');
    expect(plan.changed).toBe(0);
  });
});

describe('planDynamicPrefixKeys — ex-extra-sets-<name>', () => {
  it('lists an alias-named dynamic key as a re-key target', () => {
    localStorage.setItem('ex-extra-sets-Chest Fly', '2');
    localStorage.setItem('ex-extra-sets-Cable Fly', '1');
    const plan = planDynamicPrefixKeys();
    expect(plan).toContainEqual({
      lsKey: 'ex-extra-sets-Chest Fly', from: 'Chest Fly', to: 'Cable Fly', id: 'cable-fly',
    });
    // The already-canonical one is NOT listed (no change).
    expect(plan.find((p) => p.from === 'Cable Fly')).toBeUndefined();
  });
});

describe('dryRunAllStores — read-only aggregate', () => {
  it('writes NOTHING and totals the pending changes across stores', () => {
    DB.set('dp-cal-factors', { 'Chest Fly': { kgFactor: 1.1, n: 4 } });
    DB.set('logs', [{ ex: 'Chest Fly', w: 30 }]);
    localStorage.setItem('ex-extra-sets-Chest Fly', '2');
    const before = JSON.stringify(localStorage);
    const { totalChanged, stores, dynamic } = dryRunAllStores();
    expect(totalChanged).toBe(3); // cal-factors + logs row + dynamic key
    expect(dynamic).toHaveLength(1);
    expect(stores.find((s) => s.key === 'dp-cal-factors').changed).toBe(1);
    // Read-only: localStorage is byte-identical after the dry run.
    expect(JSON.stringify(localStorage)).toBe(before);
  });

  it('inventory excludes the non-exercise-keyed stores (weights/recovery/etc.)', () => {
    const keys = NAME_KEYED_STORES.map((d) => d.key);
    expect(keys).not.toContain('weights');             // date-keyed
    expect(keys).not.toContain('dp-recovery-constants'); // muscle-keyed
    expect(keys).not.toContain('dp-learned-volume');     // muscle-keyed
    expect(keys).toContain('dp-cal-factors');
    expect(keys).toContain('logs');
  });
});

describe('migrateObjectKeyStore — backup-first, idempotent, merge (guarded apply)', () => {
  const NOW = 1781100000000;
  const sum = (_canon, entries) => entries.reduce((a, e) => a + e, 0);

  it('re-keys an alias onto the canonical, backs up FIRST, stamps the schema version', () => {
    DB.set('dp-cal-factors', { 'Chest Fly': 7 });
    const res = migrateObjectKeyStore('dp-cal-factors', sum, { now: NOW });
    expect(res.ok).toBe(true);
    expect(res.status).toBe('migrated');
    expect(res.changed).toBe(1);
    // Backup holds the ORIGINAL pre-migration value.
    expect(DB.get(res.backupKey)).toEqual({ 'Chest Fly': 7 });
    // Live store is now canonical + versioned.
    const after = DB.get('dp-cal-factors');
    expect(after['Cable Fly']).toBe(7);
    expect(after['Chest Fly']).toBeUndefined();
    expect(after[SCHEMA_VERSION_KEY]).toBe(TARGET_SCHEMA_VERSION);
  });

  it('folds an alias↔canonical collision via mergeColliding', () => {
    DB.set('dp-cal-factors', { 'Chest Fly': 3, 'Cable Fly': 4 });
    migrateObjectKeyStore('dp-cal-factors', sum, { now: NOW });
    expect(DB.get('dp-cal-factors')['Cable Fly']).toBe(7); // 3 + 4 merged
  });

  it('is IDEMPOTENT — a second run is a no-op (no re-key, no second backup)', () => {
    DB.set('dp-cal-factors', { 'Chest Fly': 7 });
    const first = migrateObjectKeyStore('dp-cal-factors', sum, { now: NOW });
    const snapshot = JSON.stringify(DB.get('dp-cal-factors'));
    const second = migrateObjectKeyStore('dp-cal-factors', sum, { now: NOW + 1 });
    expect(second.status).toBe('migrated');
    expect(second.changed).toBe(0);
    expect(second.backupKey).toBeNull(); // no new backup on the no-op
    expect(JSON.stringify(DB.get('dp-cal-factors'))).toBe(snapshot);
    expect(first.backupKey).not.toBeNull();
  });

  it('dryRun option plans without writing', () => {
    DB.set('dp-cal-factors', { 'Chest Fly': 7 });
    const res = migrateObjectKeyStore('dp-cal-factors', sum, { now: NOW, dryRun: true });
    expect(res.status).toBe('planned');
    expect(res.changed).toBe(1);
    expect(DB.get('dp-cal-factors')).toEqual({ 'Chest Fly': 7 }); // untouched
  });

  it('absent store → safe no-op', () => {
    expect(migrateObjectKeyStore('dp-cal-factors', sum).status).toBe('absent');
  });
});
