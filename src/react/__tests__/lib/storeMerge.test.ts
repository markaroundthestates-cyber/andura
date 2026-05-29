// ══ storeMerge — no-clobber / dedupe / max / LWW unit tests (08.050/051) ════
// Proves the ANDURA never-delete invariant at the merge primitive level: no
// local entry is ever dropped, remote-only entries are always added, scalars
// never regress (streak), profile/goals are last-write-wins by timestamp.

import { describe, it, expect } from 'vitest';
import {
  mergeArrayUnion,
  mergeMaxScalar,
  mergeMaxIsoDate,
  mergeLastWriteWins,
} from '../../lib/storeMerge';

describe('mergeArrayUnion — id-keyed union, no entry dropped', () => {
  it('keeps both sides, dedup by ts', () => {
    const local = [{ ts: 2, ex: 'Bench' }];
    const remote = [{ ts: 1, ex: 'Squat' }, { ts: 2, ex: 'SHOULD-NOT-WIN' }];
    const merged = mergeArrayUnion(local, remote);
    expect(merged.map((e) => e.ts).sort()).toEqual([1, 2]);
    // Local wins the ts=2 collision (it is what the user touched on this device).
    expect(merged.find((e) => e.ts === 2)?.ex).toBe('Bench');
    // Remote-only ts=1 pulled down.
    expect(merged.find((e) => e.ts === 1)?.ex).toBe('Squat');
  });

  it('dedup by date (weightLog shape)', () => {
    const local = [{ date: '2026-05-25', kg: 80 }];
    const remote = [{ date: '2026-05-20', kg: 81 }, { date: '2026-05-25', kg: 99 }];
    const merged = mergeArrayUnion(local, remote);
    expect(merged).toHaveLength(2);
    expect(merged.find((e) => e.date === '2026-05-25')?.kg).toBe(80); // local wins
    expect(merged.find((e) => e.date === '2026-05-20')?.kg).toBe(81); // remote added
  });

  it('dedup by dateISO (nutrition shape)', () => {
    const local = [{ dateISO: '2026-05-25', kcal: 2000 }];
    const remote = [{ dateISO: '2026-05-25', kcal: 9999 }, { dateISO: '2026-05-24', kcal: 1800 }];
    const merged = mergeArrayUnion(local, remote);
    expect(merged.find((e) => e.dateISO === '2026-05-25')?.kcal).toBe(2000);
    expect(merged.find((e) => e.dateISO === '2026-05-24')?.kcal).toBe(1800);
  });

  it('local-only entries never dropped when remote empty', () => {
    const local = [{ ts: 1 }, { ts: 2 }];
    expect(mergeArrayUnion(local, [])).toEqual(local);
    expect(mergeArrayUnion(local, null)).toEqual(local);
    expect(mergeArrayUnion(local, undefined)).toEqual(local);
  });

  it('remote-only entries fully restored on a fresh device (empty local)', () => {
    const remote = [{ ts: 1 }, { ts: 2 }, { ts: 3 }];
    expect(mergeArrayUnion([], remote)).toEqual(remote);
    expect(mergeArrayUnion(null, remote)).toEqual(remote);
  });

  it('collapses internal local duplicates defensively', () => {
    const local = [{ ts: 1 }, { ts: 1 }];
    expect(mergeArrayUnion(local, [])).toHaveLength(1);
  });

  it('id-less primitive entries dedupe by value signature', () => {
    expect(mergeArrayUnion(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('explicit date key dedupes weightLog regardless of differing ts', () => {
    // Same day on two devices (different write ts) must collapse to one local entry,
    // while a remote-only day is still pulled down.
    const local = [{ date: '2026-05-25', kg: 80, ts: 9999 }];
    const remote = [{ date: '2026-05-25', kg: 99, ts: 1 }, { date: '2026-05-20', kg: 81, ts: 1 }];
    const merged = mergeArrayUnion(local, remote, 'date');
    expect(merged).toHaveLength(2);
    expect(merged.find((e) => e.date === '2026-05-25')?.kg).toBe(80); // local wins
    expect(merged.find((e) => e.date === '2026-05-20')?.kg).toBe(81); // remote added
  });

  it('explicit ts key keeps two same-day sessions distinct', () => {
    const local = [{ ts: 100, date: '2026-05-25' }];
    const remote = [{ ts: 200, date: '2026-05-25' }];
    expect(mergeArrayUnion(local, remote, 'ts')).toHaveLength(2);
  });
});

describe('mergeMaxScalar — streak never regresses', () => {
  it('takes the larger value', () => {
    expect(mergeMaxScalar(3, 7)).toBe(7);
    expect(mergeMaxScalar(9, 2)).toBe(9);
  });
  it('ignores non-finite operands', () => {
    expect(mergeMaxScalar(5, undefined)).toBe(5);
    expect(mergeMaxScalar(null, 4)).toBe(4);
    expect(mergeMaxScalar(NaN as unknown as number, 6)).toBe(6);
  });
  it('both absent → 0', () => {
    expect(mergeMaxScalar(null, undefined)).toBe(0);
  });
});

describe('mergeMaxIsoDate — newest day-key wins', () => {
  it('picks the lexicographically later ISO date', () => {
    expect(mergeMaxIsoDate('2026-05-20', '2026-05-25')).toBe('2026-05-25');
    expect(mergeMaxIsoDate('2026-05-25', '2026-05-20')).toBe('2026-05-25');
  });
  it('handles one side null', () => {
    expect(mergeMaxIsoDate(null, '2026-05-20')).toBe('2026-05-20');
    expect(mergeMaxIsoDate('2026-05-20', null)).toBe('2026-05-20');
    expect(mergeMaxIsoDate(null, null)).toBeNull();
  });
});

describe('mergeLastWriteWins — profile/goals by updatedAt', () => {
  it('newer remote wins', () => {
    expect(mergeLastWriteWins({ w: 80 }, { w: 82 }, 100, 200)).toEqual({ w: 82 });
  });
  it('local wins on tie (never clobber with equally-old remote)', () => {
    expect(mergeLastWriteWins({ w: 80 }, { w: 82 }, 200, 200)).toEqual({ w: 80 });
  });
  it('local wins when remote is older', () => {
    expect(mergeLastWriteWins({ w: 80 }, { w: 82 }, 300, 100)).toEqual({ w: 80 });
  });
  it('undefined remote → keep local', () => {
    expect(mergeLastWriteWins({ w: 80 }, undefined, 0, 999)).toEqual({ w: 80 });
  });
  it('missing timestamps treated as 0 (oldest) → local survives', () => {
    expect(mergeLastWriteWins({ w: 80 }, { w: 82 }, null, null)).toEqual({ w: 80 });
  });
});
