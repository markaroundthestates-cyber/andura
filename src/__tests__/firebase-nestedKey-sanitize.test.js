// ══ RTDB NESTED-key safety — dp-cal-factors exercise-name 400 fix ════════════
//
// EVIDENCE (founder live console + real data): repeated `PATCH .../users/{uid}
// 400 (Bad Request)`. Real `dp-cal-factors` =
//   {"Flat DB Press":{kgFactor,n}, "OHP":{...}, "Pec Deck / Cable Fly":{...},
//    "Lat Pulldown":{...}}
// The nested key "Pec Deck / Cable Fly" carries a `/` (forbidden RTDB key char).
// fbKey() only sanitizes the TOP-LEVEL SYNC_KEYS node name — NOT the keys nested
// inside a value. Because syncToFirebase sends ONE atomic PATCH, that single bad
// nested key 400'd the WHOLE batch → weights/logs/kcals silently stopped syncing
// to the cloud (localStorage kept working, so one device looked fine; a new
// browser saw stale/empty = "I lost my data").
//
// FIX: dp-cal-factors (free-text exercise-name-keyed) is pushed as an ARRAY of
// {name, ...rest} entries — array indices are the cloud keys (always valid), the
// exercise name lives in a VALUE. decodeNameKeyed restores the EXACT original
// object on pull so DP._calFactor reads its factor back by the original name.
// Lossless round-trip (a naive replace(/[.$#[\]/]/g,'_') would collide
// "Pec Deck / Cable Fly" with "Pec Deck _ Cable Fly").

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  encodeNameKeyed,
  decodeNameKeyed,
  syncToFirebase,
  syncFromFirebase,
} from '../firebase.js';
import { DB } from '../db.js';
import { DP } from '../engine/dp.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

const FORBIDDEN = /[.$#[\]/]/;

// The founder's real map — note the `/` in "Pec Deck / Cable Fly" and a dotted
// name as an extra forbidden-char case.
const REAL_FACTORS = {
  'Flat DB Press': { kgFactor: 1.1, n: 3 },
  OHP: { kgFactor: 0.95, n: 7 },
  'Pec Deck / Cable Fly': { kgFactor: 1.25, n: 4 },
  'Lat Pulldown': { kgFactor: 1.4, n: 5 },
  'B.B. Row': { kgFactor: 0.9, n: 2 },
};

function _seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-nested-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-nested-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

function _resetAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

/** Recursively assert no object key anywhere contains a forbidden RTDB char. */
function _assertNoForbiddenKeys(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(_assertNoForbiddenKeys);
    return;
  }
  for (const key of Object.keys(node)) {
    expect(FORBIDDEN.test(key), `forbidden char in cloud key "${key}"`).toBe(false);
    _assertNoForbiddenKeys(node[key]);
  }
}

describe('firebase — nested name-key safety (dp-cal-factors 400 fix)', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    _seedAuth();
    fetchMock = vi.fn().mockResolvedValue(new Response('null', { status: 200 }));
    globalThis.fetch = fetchMock;
    delete window._suppressFirebaseSync;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    _resetAuth();
    delete window._suppressFirebaseSync;
  });

  it('encodeNameKeyed produces a cloud shape with ZERO forbidden key chars', () => {
    const encoded = encodeNameKeyed(REAL_FACTORS);
    expect(Array.isArray(encoded)).toBe(true);
    _assertNoForbiddenKeys(encoded);
    // The name lives in a value, not a key.
    expect(encoded).toContainEqual({ name: 'Pec Deck / Cable Fly', kgFactor: 1.25, n: 4 });
  });

  it('push (PATCH body): the serialized dp-cal-factors has NO forbidden key char', async () => {
    DB.set('dp-cal-factors', REAL_FACTORS);
    await syncToFirebase();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const payload = JSON.parse(init.body);
    // The whole PATCH body — every nested key — must be RTDB-safe (no 400).
    _assertNoForbiddenKeys(payload);
    // dp-cal-factors landed as an array of entries, not a slashed-key object.
    expect(Array.isArray(payload['dp-cal-factors'])).toBe(true);
    // Sibling keys still ship in the same atomic PATCH (nothing was dropped).
    DB.set('weights', { '2026-06-06': 80 });
  });

  it('a slashed/dotted nested name never escapes into a cloud key', () => {
    const payloadStr = JSON.stringify(encodeNameKeyed({
      'A/B': { kgFactor: 1, n: 1 },
      'C.D': { kgFactor: 1, n: 1 },
      'E[F]': { kgFactor: 1, n: 1 },
      'G#H$I': { kgFactor: 1, n: 1 },
    }));
    _assertNoForbiddenKeys(JSON.parse(payloadStr));
  });

  it('round-trip restores the EXACT original names (lossless, no collision)', () => {
    const restored = decodeNameKeyed(encodeNameKeyed(REAL_FACTORS));
    expect(restored).toEqual(REAL_FACTORS);
    // Specifically the two would-collide-under-naive-replace names survive distinct.
    const both = decodeNameKeyed(encodeNameKeyed({
      'Pec Deck / Cable Fly': { kgFactor: 1.25, n: 4 },
      'Pec Deck _ Cable Fly': { kgFactor: 0.8, n: 9 },
    }));
    expect(Object.keys(both)).toEqual(['Pec Deck / Cable Fly', 'Pec Deck _ Cable Fly']);
    expect(both['Pec Deck / Cable Fly'].kgFactor).toBe(1.25);
    expect(both['Pec Deck _ Cable Fly'].kgFactor).toBe(0.8);
  });

  it('push→pull round-trips so DP reads the factor back by the original name', async () => {
    // Capture the exact cloud array that the push wrote, then feed it to the pull.
    DB.set('dp-cal-factors', REAL_FACTORS);
    await syncToFirebase();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const cloudArray = JSON.parse(init.body)['dp-cal-factors'];

    // Fresh device: no local dp-cal-factors, only the remote doc.
    DB.set('dp-cal-factors', null);
    const remoteDoc = { 'dp-cal-factors': cloudArray, _ts: Date.now() };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));
    await syncFromFirebase();

    expect(DB.get('dp-cal-factors')).toEqual(REAL_FACTORS);
    // The engine clamps to [CAL_MIN, CAL_MAX]; 1.25 is in-band → read back exactly.
    expect(DP._calFactor('Pec Deck / Cable Fly')).toBeCloseTo(1.25, 5);
    expect(DP._calFactor('Lat Pulldown')).toBeCloseTo(1.4, 5);
  });

  it('pull tolerates the LEGACY plain-object shape (defensive, no corruption)', async () => {
    // A value that was never an array (e.g. an all-safe-key map written some other
    // way) must pass through decode untouched.
    DB.set('dp-cal-factors', null);
    const legacy = { 'Cable Row': { kgFactor: 1.3, n: 4 } };
    const remoteDoc = { 'dp-cal-factors': legacy, _ts: Date.now() };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));
    await syncFromFirebase();
    expect(DB.get('dp-cal-factors')).toEqual(legacy);
  });

  it('encode/decode leave non-object input untouched', () => {
    expect(encodeNameKeyed(null)).toBe(null);
    expect(encodeNameKeyed([1, 2])).toEqual([1, 2]);
    expect(decodeNameKeyed(null)).toBe(null);
    expect(decodeNameKeyed({ already: 'object' })).toEqual({ already: 'object' });
  });

  // Audit 2026-06-07 (L-1): the old wrapper key `value` was AMBIGUOUS — a
  // name-keyed map whose object value's ONLY key is literally `value` decoded
  // back to a scalar (object → scalar lossiness). The reserved sentinel wrapper
  // makes any future name-keyed map round-trip.
  it('round-trips an object value whose only key is literally `value` (was lossy)', () => {
    const map = { Ex: { value: 3 } };
    const restored = decodeNameKeyed(encodeNameKeyed(map));
    // Stays an OBJECT — does NOT collapse to the scalar 3.
    expect(restored).toEqual(map);
    expect(typeof restored.Ex).toBe('object');
    expect(restored.Ex.value).toBe(3);
  });

  it('round-trips genuine scalar + array values via the sentinel', () => {
    const map = { A: 5, B: 'txt', C: [1, 2, 3] };
    const restored = decodeNameKeyed(encodeNameKeyed(map));
    expect(restored).toEqual(map);
  });

  it('a {name, value} cloud entry now decodes to the OBJECT {value} (no scalar collapse)', () => {
    // Post-sentinel contract: the ambiguous `value` heuristic is gone. The sole
    // name-keyed key (dp-cal-factors) never wrote bare scalars, so this is lossless
    // for real data — and an object value {value:N} now round-trips correctly.
    const cloudArray = [{ name: 'Ex', value: 7 }];
    expect(decodeNameKeyed(cloudArray)).toEqual({ Ex: { value: 7 } });
  });
});
