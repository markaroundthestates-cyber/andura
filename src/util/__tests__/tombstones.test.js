// Tombstone soft-delete tests — Memory Paradox hotfix (Batch B Task 2).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTombstones,
  markTombstone,
  removeTombstone,
  isTombstoned,
  applyTombstoneFilter,
  applyTombstoneFilterToAll,
  deleteEntry,
  gcTombstones,
  TOMBSTONE_RETENTION_MS,
} from '../tombstones.js';

beforeEach(() => {
  localStorage.clear();
});

describe('tombstones — basic CRUD', () => {
  it('returns empty map when storage empty', () => {
    expect(getTombstones()).toEqual({});
  });

  it('marks + reads tombstone', () => {
    markTombstone(123, 'logs', { now: 1000 });
    const m = getTombstones();
    expect(m['123']).toEqual({ deletedAt: 1000, key: 'logs', source: 'local' });
  });

  it('removes tombstone', () => {
    markTombstone(123, 'logs');
    removeTombstone(123);
    expect(getTombstones()['123']).toBeUndefined();
  });

  it('isTombstoned respects retention window', () => {
    markTombstone(123, 'logs', { now: 1000 });
    expect(isTombstoned(123, undefined, 1000)).toBe(true);
    // Past retention horizon — tombstone expired.
    expect(isTombstoned(123, undefined, 1000 + TOMBSTONE_RETENTION_MS + 1)).toBe(false);
  });

  it('handles malformed JSON gracefully', () => {
    localStorage.setItem('tombstones', '{not valid');
    expect(getTombstones()).toEqual({});
  });

  it('ignores null/empty entry id', () => {
    markTombstone(null, 'logs');
    markTombstone('', 'logs');
    expect(Object.keys(getTombstones()).length).toBe(0);
  });
});

describe('tombstones — array filter', () => {
  it('passes through empty arrays', () => {
    expect(applyTombstoneFilter([])).toEqual([]);
    expect(applyTombstoneFilter(null)).toEqual([]);
  });

  it('filters by ts', () => {
    markTombstone(2000, 'logs');
    const arr = [{ ts: 1000 }, { ts: 2000 }, { ts: 3000 }];
    const out = applyTombstoneFilter(arr);
    expect(out).toEqual([{ ts: 1000 }, { ts: 3000 }]);
  });

  it('filters by id when ts absent', () => {
    markTombstone('foo', 'logs');
    const out = applyTombstoneFilter([{ id: 'foo' }, { id: 'bar' }]);
    expect(out).toEqual([{ id: 'bar' }]);
  });

  it('skips entries without id or ts', () => {
    markTombstone(1, 'logs');
    const arr = [{}, { unrelated: 'x' }];
    expect(applyTombstoneFilter(arr)).toEqual(arr);
  });

  it('expired tombstones do not block entries', () => {
    const oldTs = Date.now() - TOMBSTONE_RETENTION_MS - 10_000;
    markTombstone(2000, 'logs', { now: oldTs });
    const out = applyTombstoneFilter([{ ts: 2000 }]);
    expect(out).toEqual([{ ts: 2000 }]);
  });
});

describe('tombstones — applyTombstoneFilterToAll', () => {
  it('rewrites every ts-indexed key', () => {
    localStorage.setItem('logs', JSON.stringify([{ ts: 1 }, { ts: 2 }]));
    localStorage.setItem('coach-decisions', JSON.stringify([{ ts: 5 }, { ts: 6 }]));
    markTombstone(1, 'logs');
    markTombstone(5, 'coach-decisions');

    const res = applyTombstoneFilterToAll();
    expect(res.filtered).toBe(2);
    expect(res.keysTouched).toEqual(expect.arrayContaining(['logs', 'coach-decisions']));
    expect(JSON.parse(localStorage.getItem('logs'))).toEqual([{ ts: 2 }]);
    expect(JSON.parse(localStorage.getItem('coach-decisions'))).toEqual([{ ts: 6 }]);
  });

  it('no-op when no tombstones', () => {
    localStorage.setItem('logs', JSON.stringify([{ ts: 1 }]));
    expect(applyTombstoneFilterToAll().filtered).toBe(0);
  });

  it('handles missing keys', () => {
    markTombstone(1, 'logs');
    expect(() => applyTombstoneFilterToAll()).not.toThrow();
  });
});

describe('tombstones — deleteEntry wrapper', () => {
  it('removes entry from logs and writes tombstone', () => {
    localStorage.setItem('logs', JSON.stringify([
      { ts: 1, ex: 'A' }, { ts: 2, ex: 'B' }, { ts: 3, ex: 'C' },
    ]));
    const ok = deleteEntry(2, 'logs');
    expect(ok).toBe(true);
    expect(JSON.parse(localStorage.getItem('logs'))).toEqual([
      { ts: 1, ex: 'A' }, { ts: 3, ex: 'C' },
    ]);
    expect(getTombstones()['2']).toBeDefined();
  });

  it('still writes tombstone when entry not found', () => {
    localStorage.setItem('logs', JSON.stringify([{ ts: 1 }]));
    const ok = deleteEntry(99, 'logs');
    // Returned false because nothing was actually removed locally, but
    // tombstone is still in place to scrub Firebase resurrection.
    expect(ok).toBe(false);
    expect(getTombstones()['99']).toBeDefined();
  });

  it('writes tombstone when key missing entirely', () => {
    deleteEntry(42, 'logs');
    expect(getTombstones()['42']).toBeDefined();
  });

  it('rejects null entry id', () => {
    expect(deleteEntry(null, 'logs')).toBe(false);
  });
});

describe('tombstones — Memory Paradox regression', () => {
  // ⭐ This is the canonical regression test for the user-visible bug:
  // delete entry → reload → entry RE-APARE through Firebase pull.
  // After applying the tombstone filter, the entry must NOT come back.
  it('delete + Firebase resurrect → tombstone scrubs', () => {
    // 1. Local state: 3 entries.
    localStorage.setItem('logs', JSON.stringify([
      { ts: 1000, ex: 'Squat', w: 100 },
      { ts: 2000, ex: 'Bench', w: 80 },
      { ts: 3000, ex: 'Row',   w: 70 },
    ]));

    // 2. User deletes entry ts=2000.
    expect(deleteEntry(2000, 'logs')).toBe(true);
    expect(JSON.parse(localStorage.getItem('logs')).length).toBe(2);

    // 3. Firebase pull resurrects the entry (simulated — sync layer naively
    //    wrote remote union back to local).
    localStorage.setItem('logs', JSON.stringify([
      { ts: 1000, ex: 'Squat', w: 100 },
      { ts: 2000, ex: 'Bench', w: 80 },  // ← resurrected
      { ts: 3000, ex: 'Row',   w: 70 },
    ]));

    // 4. Apply tombstone filter (this is what syncFromFirebase does
    //    post-merge per firebase.js).
    const result = applyTombstoneFilterToAll();
    expect(result.filtered).toBe(1);

    // 5. Verify final state — deleted entry is GONE.
    const final = JSON.parse(localStorage.getItem('logs'));
    expect(final.find(e => e.ts === 2000)).toBeUndefined();
    expect(final.length).toBe(2);
  });
});

describe('tombstones — GC', () => {
  it('drops expired tombstones', () => {
    const oldTs = Date.now() - TOMBSTONE_RETENTION_MS - 10_000;
    markTombstone(1, 'logs', { now: oldTs });
    markTombstone(2, 'logs');
    const removed = gcTombstones();
    expect(removed).toBe(1);
    expect(getTombstones()['1']).toBeUndefined();
    expect(getTombstones()['2']).toBeDefined();
  });

  it('drops malformed entries', () => {
    localStorage.setItem('tombstones', JSON.stringify({ x: { deletedAt: 'not-a-number' } }));
    expect(gcTombstones()).toBe(1);
  });

  it('returns 0 when nothing expired', () => {
    markTombstone(1, 'logs');
    expect(gcTombstones()).toBe(0);
  });
});
