// ══ src/storage/tieredRead.js — unified Tier 0 + Tier 1 read tests ══════════

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';

import { getTieredArrayAsync, getTier0Array } from '../tieredRead.js';
import { _resetNamespaceCache, closeDb, STORES, tier1Bulk } from '../db.js';

const DEFAULT_DB_NAME = 'salafull_users_daniel';

beforeEach(async () => {
  await closeDb();
  try { await Dexie.delete(DEFAULT_DB_NAME); } catch { /* swallow */ }
  _resetNamespaceCache();
  try { localStorage.clear(); } catch { /* swallow */ }
});

afterEach(async () => {
  await closeDb();
  try { await Dexie.delete(DEFAULT_DB_NAME); } catch { /* swallow */ }
});

describe('getTier0Array', () => {
  it('returns [] for missing key', () => {
    expect(getTier0Array('nope')).toEqual([]);
  });

  it('returns array as-is when localStorage has array', () => {
    localStorage.setItem('foo', JSON.stringify([{ id: 'a' }]));
    expect(getTier0Array('foo')).toEqual([{ id: 'a' }]);
  });

  it('returns [] when localStorage value is non-array', () => {
    localStorage.setItem('foo', JSON.stringify({ obj: true }));
    expect(getTier0Array('foo')).toEqual([]);
  });
});

describe('getTieredArrayAsync', () => {
  it('returns Tier 0 only for non-rotatable keys', async () => {
    localStorage.setItem('weights', JSON.stringify([{ kg: 100 }]));
    const got = await getTieredArrayAsync('weights');
    expect(got).toEqual([{ kg: 100 }]);
  });

  it('merges Tier 0 + Tier 1 for rotatable keys', async () => {
    const t0 = [{ id: 'recent_1', ts: Date.now() }];
    const t1 = [{ id: 'archived_1', ts: 0 }, { id: 'archived_2', ts: 1 }];
    localStorage.setItem('coach-decisions', JSON.stringify(t0));
    await tier1Bulk(STORES.CDL_TIER1, t1);

    const got = await getTieredArrayAsync('coach-decisions');
    const ids = got.map(e => e.id).sort();
    expect(ids).toEqual(['archived_1', 'archived_2', 'recent_1']);
  });

  it('falls back gracefully when Tier 1 read fails', async () => {
    localStorage.setItem('coach-decisions', JSON.stringify([{ id: 'a' }]));
    // No Dexie data, no IDBFactory reset — should still return Tier 0
    const got = await getTieredArrayAsync('coach-decisions');
    expect(got).toEqual([{ id: 'a' }]);
  });

  it('returns Tier 1 only when Tier 0 empty', async () => {
    await tier1Bulk(STORES.CDL_TIER1, [{ id: 'archived' }]);
    const got = await getTieredArrayAsync('coach-decisions');
    expect(got.map(e => e.id)).toEqual(['archived']);
  });

  it('returns empty array when both tiers empty', async () => {
    const got = await getTieredArrayAsync('coach-decisions');
    expect(got).toEqual([]);
  });
});
