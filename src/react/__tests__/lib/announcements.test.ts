// ══ announcements lib — parse / sort / cache / unseen (pure logic) ══════════
// Covers the RTDB-node normalization (pinned-first, newest-first, malformed
// entries dropped, no raw HTML trust), the local cache round-trip, and the
// unseen-count / last-seen bookkeeping that drives the Account unseen-dot.
// The network path (fetchAnnouncements) is exercised at the screen level
// (Noutati.test.tsx mocks this module) — here we test the deterministic core.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseAnnouncements,
  sortAnnouncements,
  readCachedAnnouncements,
  writeCachedAnnouncements,
  getUnseenCount,
  getLastSeenTs,
  markAnnouncementsSeen,
  newestTs,
  ANNOUNCEMENTS_CACHE_KEY,
  ANNOUNCEMENTS_LAST_SEEN_KEY,
  type Announcement,
} from '../../lib/announcements';

beforeEach(() => {
  localStorage.clear();
});

// A raw RTDB `/announcements` node (ordered map keyed by push id). Dates are
// intentionally out of insertion order so sorting is actually proven.
const RAW_NODE = {
  '-id-old': { title: 'Old note', body: 'Body A', date: '2026-01-10' },
  '-id-new': { title: 'New note', body: 'Body B', date: '2026-06-01' },
  '-id-pin': { title: 'Pinned note', body: 'Body C', date: '2026-03-15', pinned: true },
};

describe('parseAnnouncements', () => {
  it('returns pinned first, then newest-first by date', () => {
    const list = parseAnnouncements(RAW_NODE);
    expect(list.map((a) => a.id)).toEqual(['-id-pin', '-id-new', '-id-old']);
  });

  it('drops entries with neither title nor body', () => {
    const list = parseAnnouncements({
      '-ok': { title: 'Keep', body: 'x', date: '2026-06-01' },
      '-empty': { date: '2026-06-02' },
      '-blank': { title: '   ', body: '  ' },
    });
    expect(list.map((a) => a.id)).toEqual(['-ok']);
  });

  it('tolerates a malformed node (non-object / array / null) → empty list', () => {
    expect(parseAnnouncements(null)).toEqual([]);
    expect(parseAnnouncements('hostile-string')).toEqual([]);
    expect(parseAnnouncements([1, 2, 3])).toEqual([]);
  });

  it('coerces a non-boolean pinned to false and a bad date to ts 0', () => {
    const list = parseAnnouncements({
      '-x': { title: 'T', body: 'B', date: 'not-a-date', pinned: 'yes' },
    });
    expect(list[0]?.pinned).toBe(false);
    expect(list[0]?.ts).toBe(0);
  });

  it('keeps the body verbatim (rendering layer is responsible for escaping)', () => {
    const list = parseAnnouncements({
      '-h': { title: 'T', body: '<b>not-bold</b>\nline two', date: '2026-06-01' },
    });
    // The lib does NOT strip — it returns the raw string; the screen renders it
    // as text (React escapes). Proven here so the contract is explicit.
    expect(list[0]?.body).toBe('<b>not-bold</b>\nline two');
  });
});

describe('sortAnnouncements', () => {
  it('is stable + deterministic for equal ts (date string tiebreak)', () => {
    const a: Announcement = { id: 'a', title: 'a', body: '', date: '2026-06-02', pinned: false, ts: 0 };
    const b: Announcement = { id: 'b', title: 'b', body: '', date: '2026-06-01', pinned: false, ts: 0 };
    expect(sortAnnouncements([b, a]).map((x) => x.id)).toEqual(['a', 'b']);
  });
});

describe('cache round-trip', () => {
  it('writes + reads the last good list', () => {
    const list = parseAnnouncements(RAW_NODE);
    writeCachedAnnouncements(list);
    expect(localStorage.getItem(ANNOUNCEMENTS_CACHE_KEY)).toBeTruthy();
    const back = readCachedAnnouncements();
    expect(back.map((a) => a.id)).toEqual(['-id-pin', '-id-new', '-id-old']);
  });

  it('returns [] for an absent / corrupt cache', () => {
    expect(readCachedAnnouncements()).toEqual([]);
    localStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, '{not json');
    expect(readCachedAnnouncements()).toEqual([]);
    localStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify('a-string'));
    expect(readCachedAnnouncements()).toEqual([]);
  });
});

describe('unseen bookkeeping', () => {
  it('counts cached entries newer than last-seen', () => {
    writeCachedAnnouncements(parseAnnouncements(RAW_NODE));
    // Never opened → all dated entries are unseen (3 have real dates).
    expect(getUnseenCount()).toBe(3);
  });

  it('markAnnouncementsSeen advances the high-water mark + zeroes the count', () => {
    const list = parseAnnouncements(RAW_NODE);
    writeCachedAnnouncements(list);
    markAnnouncementsSeen(list);
    expect(getLastSeenTs()).toBe(newestTs(list));
    expect(getUnseenCount()).toBe(0);
  });

  it('only newer-than-seen entries count after a partial seen', () => {
    const earlier = parseAnnouncements({
      '-1': { title: 'a', body: 'x', date: '2026-01-01' },
    });
    markAnnouncementsSeen(earlier); // seen up to Jan 1
    writeCachedAnnouncements(parseAnnouncements(RAW_NODE)); // newer entries arrive
    // Jan-10 / Jun-01 / Mar-15 are all after Jan-01 → 3 unseen.
    expect(getUnseenCount()).toBe(3);
    // A fresh seen of the full list clears it.
    markAnnouncementsSeen(parseAnnouncements(RAW_NODE));
    expect(getUnseenCount()).toBe(0);
  });

  it('never lowers the last-seen mark on an older list', () => {
    const newer = parseAnnouncements(RAW_NODE);
    markAnnouncementsSeen(newer);
    const high = getLastSeenTs();
    markAnnouncementsSeen(parseAnnouncements({ '-z': { title: 'z', body: 'x', date: '2025-01-01' } }));
    expect(getLastSeenTs()).toBe(high);
  });

  it('an undated (ts 0) entry never counts as unseen', () => {
    writeCachedAnnouncements(parseAnnouncements({ '-u': { title: 'u', body: 'x' } }));
    expect(getUnseenCount()).toBe(0);
    expect(localStorage.getItem(ANNOUNCEMENTS_LAST_SEEN_KEY)).toBeNull();
  });
});
