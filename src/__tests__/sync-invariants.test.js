// ══ SYNC INVARIANTS — electric fence around the dual-channel sync layer ══════
//
// Andura syncs local ↔ Firebase RTDB via a dual channel — the flat Tier-0
// SYNC_KEYS path (firebase.js syncTo/FromFirebase) PLUS the wv2 store-sync path
// (react/lib/storeSync.ts) — layered on soft-delete `tombstones` and an
// append-only `coachDecisionLog`. The combination (dual-channel + tombstones +
// append-only) is bug-prone: a naive merge resurrects deletions, an over-eager
// merge clobbers appends, and a stale remote can undo a fresh local write.
//
// This suite LOCKS the invariants so a future change to firebase.js /
// tombstones.js / dataRegistry.js / coachDecisionLog.js can't silently break
// sync/delete coherence. It is test-only hardening — no behavior change. The
// wv2-channel new-device + tombstone cases are already pinned in
// react/__tests__/lib/storeSync.test.ts; this file covers the flat-channel +
// classification SSOT + append-only integrity + wv2 reversible-encode round-trip.
//
// Categories (Hardening A5):
//   1. data classification SSOT (dataRegistry.SYNC_CLASSIFICATION) completeness
//   2. delete → gone (tombstone wins over a stale remote resurrection)
//   3. tombstone precedence (live wins; expired does NOT clobber a fresh write)
//   4. append-only integrity (CDL union/append on sync — never overwrite/reorder)
//   5. new-device coherence (fresh local hydrates remote → same logical state)
//   6. wv2 reversible-encode round-trip (fbKey lossless on push/pull)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SYNC_CLASSIFICATION,
  CDL_KEYS,
  USER_DATA_KEYS,
  TEST_RESIDUE_KEYS,
} from '../util/dataRegistry.js';
import {
  fbKey,
  SYNC_KEYS,
  NAME_KEYED_SYNC_KEYS,
  encodeNameKeyed,
  decodeNameKeyed,
  syncToFirebase,
  syncFromFirebase,
} from '../firebase.js';
import {
  deleteEntry,
  applyTombstoneFilterToAll,
  applyTombstoneFilter,
  markTombstone,
  removeTombstone,
  TOMBSTONE_RETENTION_MS,
} from '../util/tombstones.js';
import { DB } from '../db.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

function seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-sync-inv');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-sync-inv');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

// ───────────────────────────────────────────────────────────────────────────
// 1. DATA CLASSIFICATION SSOT — every synced key behaves as one of three kinds.
// ───────────────────────────────────────────────────────────────────────────
describe('sync invariant — data classification SSOT (dataRegistry.SYNC_CLASSIFICATION)', () => {
  const VALID = new Set(['append-only', 'mutable', 'deletable']);

  it('classifies EVERY SYNC_KEY (no synced key left unclassified)', () => {
    const unclassified = SYNC_KEYS.filter((k) => !(k in SYNC_CLASSIFICATION));
    expect(unclassified, `SYNC_KEYS missing a classification: ${unclassified.join(', ')}`).toHaveLength(0);
  });

  it('classifies NOTHING outside SYNC_KEYS (the map mirrors the sync surface)', () => {
    const syncSet = new Set(SYNC_KEYS);
    const extra = Object.keys(SYNC_CLASSIFICATION).filter((k) => !syncSet.has(k));
    expect(extra, `classified keys not in SYNC_KEYS: ${extra.join(', ')}`).toHaveLength(0);
  });

  it('uses only the three valid categories', () => {
    for (const [k, cat] of Object.entries(SYNC_CLASSIFICATION)) {
      expect(VALID.has(cat), `invalid category "${cat}" for key "${k}"`).toBe(true);
    }
  });

  it('every CDL key is classified append-only (CDL log is never per-entry deleted)', () => {
    // CDL_KEYS that are also synced must carry the append-only contract.
    const syncedCdl = CDL_KEYS.filter((k) => SYNC_KEYS.includes(k));
    syncedCdl.forEach((k) =>
      expect(SYNC_CLASSIFICATION[k], `CDL key ${k} must be append-only`).toBe('append-only'),
    );
  });

  it('the deletable set is exactly the tombstone-protected ts-indexed history keys', () => {
    // tombstones.js TS_INDEXED_KEYS = ['logs','coach-decisions','pr-records'].
    // Of those, `coach-decisions` is classified by its primary append-only
    // semantic; the remaining two are the user-deletable history arrays.
    const deletable = Object.entries(SYNC_CLASSIFICATION)
      .filter(([, c]) => c === 'deletable')
      .map(([k]) => k)
      .sort();
    expect(deletable).toEqual(['logs', 'pr-records']);
  });

  it('classification is frozen (SSOT cannot be mutated at runtime)', () => {
    expect(Object.isFrozen(SYNC_CLASSIFICATION)).toBe(true);
  });

  it('every classified key is also tracked by the local reset registry (no orphan)', () => {
    // A synced key the reset registry does not know about would survive a local
    // wipe while the cloud copy is cleared → cross-user bleed. Mirrors the
    // dataRegistry SYNC_KEYS ⊆ RESET guard, asserted here from the classification.
    const resetCovered = new Set([...USER_DATA_KEYS, ...TEST_RESIDUE_KEYS, ...CDL_KEYS]);
    const orphan = Object.keys(SYNC_CLASSIFICATION).filter((k) => !resetCovered.has(k));
    expect(orphan, `classified keys not in reset registry: ${orphan.join(', ')}`).toHaveLength(0);
  });

  it('every NAME_KEYED_SYNC_KEY is classified mutable (object-merge LWW, not a log)', () => {
    NAME_KEYED_SYNC_KEYS.forEach((k) =>
      expect(SYNC_CLASSIFICATION[k], `name-keyed map ${k} must be mutable`).toBe('mutable'),
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. DELETE → GONE — a deleted entry does NOT resurrect through a remote pull.
// ───────────────────────────────────────────────────────────────────────────
describe('sync invariant — delete → gone (tombstone beats a stale remote copy)', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    seedAuth();
    delete window._suppressFirebaseSync;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    delete window._suppressFirebaseSync;
  });

  it('deleting a deletable key writes a tombstone; syncFromFirebase does not resurrect it', async () => {
    // Local: 3 logs. User deletes ts=2000 (writes tombstone + drops the row).
    DB.set('logs', [
      { ts: 1000, ex: 'Squat', w: 100 },
      { ts: 2000, ex: 'Bench', w: 80 },
      { ts: 3000, ex: 'Row', w: 70 },
    ]);
    expect(deleteEntry(2000, 'logs')).toBe(true);
    expect(DB.get('logs')).toHaveLength(2);

    // Remote still carries the deleted row (the delete had not synced up yet) —
    // the exact "delete → reload → re-apare" Memory Paradox bug.
    const remoteDoc = {
      logs: [
        { ts: 1000, ex: 'Squat', w: 100 },
        { ts: 2000, ex: 'Bench', w: 80 }, // ← would resurrect on a naive merge
        { ts: 3000, ex: 'Row', w: 70 },
      ],
      _ts: Date.now(),
    };
    fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));
    globalThis.fetch = fetchMock;

    await syncFromFirebase();

    // The merge re-added ts=2000, but applyTombstoneFilterToAll (run post-merge
    // inside syncFromFirebase) must scrub it back out.
    const final = DB.get('logs');
    expect(final.find((e) => e.ts === 2000)).toBeUndefined();
    expect(final).toHaveLength(2);
  });

  it('a re-created entry (tombstone removed) is allowed to sync back in', async () => {
    // User deleted then explicitly re-created the same entry — removeTombstone
    // clears the gravestone so a legit re-add is NOT blocked.
    DB.set('logs', [{ ts: 5000, ex: 'Deadlift', w: 200 }]);
    deleteEntry(5000, 'logs');
    expect(DB.get('logs')).toHaveLength(0);

    removeTombstone(5000);

    const remoteDoc = { logs: [{ ts: 5000, ex: 'Deadlift', w: 200 }], _ts: Date.now() };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));

    await syncFromFirebase();

    expect(DB.get('logs').find((e) => e.ts === 5000)).toBeDefined();
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. TOMBSTONE PRECEDENCE — a live tombstone wins; an expired one does NOT
//    clobber a newer legit write (the retention window is the version horizon).
// ───────────────────────────────────────────────────────────────────────────
describe('sync invariant — tombstone precedence (live wins, expired yields to a fresh write)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('a LIVE tombstone (within retention) beats a remote re-add of the same id', () => {
    markTombstone(2000, 'logs', { now: Date.now() });
    const remoteArr = [{ ts: 1000 }, { ts: 2000 }, { ts: 3000 }];
    const out = applyTombstoneFilter(remoteArr);
    expect(out.map((e) => e.ts)).toEqual([1000, 3000]); // 2000 stays gone
  });

  it('an EXPIRED tombstone does NOT clobber a newer legit write (entry survives)', () => {
    // Tombstone older than the 90d retention horizon → the user clearly re-added
    // the entry later; the stale gravestone must not keep blocking it.
    const expired = Date.now() - TOMBSTONE_RETENTION_MS - 60_000;
    markTombstone(2000, 'logs', { now: expired });
    const out = applyTombstoneFilter([{ ts: 2000, freshWrite: true }]);
    expect(out).toEqual([{ ts: 2000, freshWrite: true }]);
  });

  it('a tombstone only blocks its own id — unrelated newer entries pass through', () => {
    markTombstone(2000, 'logs', { now: Date.now() });
    const out = applyTombstoneFilter([{ ts: 2000 }, { ts: 9999, newer: true }]);
    expect(out).toEqual([{ ts: 9999, newer: true }]);
  });

  it('applyTombstoneFilterToAll scrubs only tombstoned ids across every ts-indexed key', () => {
    DB.set('logs', [{ ts: 1 }, { ts: 2 }]);
    DB.set('pr-records', [{ ts: 10 }, { ts: 20 }]);
    markTombstone(2, 'logs');
    markTombstone(20, 'pr-records');
    const res = applyTombstoneFilterToAll();
    expect(res.filtered).toBe(2);
    expect(DB.get('logs').map((e) => e.ts)).toEqual([1]);
    expect(DB.get('pr-records').map((e) => e.ts)).toEqual([10]);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. APPEND-ONLY INTEGRITY — coach-decisions entries are never overwritten or
//    reordered by sync; the merge is a UNION by ts (both sides survive).
// ───────────────────────────────────────────────────────────────────────────
describe('sync invariant — append-only integrity (CDL union on sync, never overwrite/reorder)', () => {
  beforeEach(() => {
    localStorage.clear();
    seedAuth();
    delete window._suppressFirebaseSync;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    delete window._suppressFirebaseSync;
  });

  it('a remote CDL append and a local CDL append BOTH survive a merge (union, no loss)', async () => {
    // Local logged decision A; remote (other device) logged decision B. Neither
    // may drop the other — appends from both devices must converge.
    DB.set('coach-decisions', [
      { ts: 1000, id: 'cd_A', date: '2026-06-01', context: {}, proposed: {} },
    ]);
    const remoteDoc = {
      'coach-decisions': [
        { ts: 2000, id: 'cd_B', date: '2026-06-02', context: {}, proposed: {} },
      ],
      _ts: Date.now(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));

    await syncFromFirebase();

    const merged = DB.get('coach-decisions');
    const ids = merged.map((e) => e.id).sort();
    expect(ids).toEqual(['cd_A', 'cd_B']); // both kept
  });

  it('a colliding ts does NOT overwrite the local CDL entry (local wins, content preserved)', async () => {
    // Same ts on both sides — the existing logs merge rule is local-wins-on-ts.
    // For an append-only log this means a remote copy can never silently rewrite
    // a decision the user's device already recorded under that ts.
    DB.set('coach-decisions', [
      { ts: 1000, id: 'cd_local', date: '2026-06-01', proposed: { sessionType: 'PUSH' } },
    ]);
    const remoteDoc = {
      'coach-decisions': [
        { ts: 1000, id: 'cd_REMOTE', date: '2026-06-01', proposed: { sessionType: 'TAMPERED' } },
      ],
      _ts: Date.now(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));

    await syncFromFirebase();

    const merged = DB.get('coach-decisions');
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('cd_local');
    expect(merged[0].proposed.sessionType).toBe('PUSH'); // remote did NOT overwrite
  });

  it('CDL ordering is deterministic (reverse-chrono by ts) after merge — not source-order-dependent', async () => {
    DB.set('coach-decisions', [
      { ts: 3000, id: 'cd_new' },
      { ts: 1000, id: 'cd_old' },
    ]);
    const remoteDoc = {
      'coach-decisions': [{ ts: 2000, id: 'cd_mid' }],
      _ts: Date.now(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));

    await syncFromFirebase();

    const merged = DB.get('coach-decisions');
    expect(merged.map((e) => e.ts)).toEqual([3000, 2000, 1000]); // sorted desc, deterministic
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. NEW-DEVICE COHERENCE — a fresh device (empty local) hydrating from remote
//    reconstructs the same logical state: no resurrected deletions (tombstones
//    travel in the synced `tombstones` key), no lost appends, mutable = latest.
// ───────────────────────────────────────────────────────────────────────────
describe('sync invariant — new-device coherence (flat channel)', () => {
  beforeEach(() => {
    localStorage.clear();
    seedAuth();
    delete window._suppressFirebaseSync;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    delete window._suppressFirebaseSync;
  });

  it('fresh device pulls remote logs + appends + mutable state, with remote tombstones applied', async () => {
    // The remote carries: a logs history, a tombstone for one of those rows
    // (deleted on the prior device), a CDL append, and a mutable profile blob.
    // `tombstones` is itself a SYNC_KEY, so the gravestone travels with the doc.
    const remoteDoc = {
      logs: [
        { ts: 1000, ex: 'Squat' },
        { ts: 2000, ex: 'Bench' }, // ← deleted on the old device (tombstoned)
        { ts: 3000, ex: 'Row' },
      ],
      'coach-decisions': [{ ts: 5000, id: 'cd_remote' }],
      'sf_userConfig': { bio: { targetKg: 75 } }, // mutable, sanitized node name
      tombstones: { '2000': { deletedAt: Date.now(), key: 'logs', source: 'firebase' } },
      _ts: Date.now(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));

    await syncFromFirebase();

    // Deletion did NOT resurrect on the fresh device.
    const logs = DB.get('logs');
    expect(logs.find((e) => e.ts === 2000)).toBeUndefined();
    expect(logs.map((e) => e.ts).sort((a, b) => a - b)).toEqual([1000, 3000]);
    // Append pulled down intact.
    expect(DB.get('coach-decisions').map((e) => e.id)).toEqual(['cd_remote']);
    // Mutable profile pulled down (round-tripped from sanitized remote node).
    expect(DB.get('sf.userConfig')).toEqual({ bio: { targetKg: 75 } });
  });

  it('two fresh devices hydrating the SAME remote doc converge to identical logical state', async () => {
    const remoteDoc = {
      logs: [{ ts: 1000, ex: 'A' }, { ts: 2000, ex: 'B' }],
      weights: { '2026-06-01': 80, '2026-06-02': 81 },
      _ts: Date.now(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));

    // Device 1.
    await syncFromFirebase();
    const dev1Logs = JSON.stringify(DB.get('logs'));
    const dev1Weights = JSON.stringify(DB.get('weights'));

    // Device 2 — fresh local.
    localStorage.clear();
    seedAuth();
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));
    await syncFromFirebase();

    expect(JSON.stringify(DB.get('logs'))).toBe(dev1Logs);
    expect(JSON.stringify(DB.get('weights'))).toBe(dev1Weights);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. wv2 REVERSIBLE-ENCODE ROUND-TRIP — fbKey() maps a localStorage key to a
//    valid RTDB node name on PUSH and the SAME map is applied on PULL, so a
//    forbidden-char key (the prior Firebase-400 work, e.g. `sf.userConfig`)
//    round-trips losslessly: pull(push(x)) === x.
// ───────────────────────────────────────────────────────────────────────────
describe('sync invariant — fbKey reversible-encode round-trip (lossless push/pull)', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    seedAuth();
    delete window._suppressFirebaseSync;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    delete window._suppressFirebaseSync;
  });

  it('fbKey is stable + idempotent (encoding an already-encoded key is a no-op)', () => {
    expect(fbKey('sf.userConfig')).toBe('sf_userConfig');
    expect(fbKey(fbKey('sf.userConfig'))).toBe('sf_userConfig'); // idempotent
    expect(fbKey('pr-records')).toBe('pr-records'); // clean key unchanged
  });

  it('every SYNC_KEY encodes to a Firebase-legal node name (no forbidden chars survive)', () => {
    const FORBIDDEN = /[.$#[\]/]/;
    SYNC_KEYS.forEach((k) => {
      expect(FORBIDDEN.test(fbKey(k)), `fbKey('${k}') still contains a forbidden RTDB char`).toBe(false);
    });
  });

  it('encode/decodeNameKeyed is a lossless inverse for a forbidden-char-keyed map', () => {
    // The real reversible-encode (the Firebase-400 fix): a name-keyed map whose
    // KEY is a free-text exercise name carrying a forbidden RTDB char (`/`). A
    // naive replace would collide "Pec Deck / Cable Fly" with "Pec Deck _ Cable
    // Fly"; the array-of-{name,...} encode survives it intact.
    const original = {
      'Pec Deck / Cable Fly': { kgFactor: 1.05, n: 4 },
      'Squat': { kgFactor: 0.98, n: 9 },
    };
    const encoded = encodeNameKeyed(original);
    // Encoded form is an array — every RTDB key is now a numeric index (legal).
    expect(Array.isArray(encoded)).toBe(true);
    // decode(encode(x)) === x exactly (the at-risk name preserved verbatim).
    expect(decodeNameKeyed(encoded)).toEqual(original);
  });

  it('decodeNameKeyed round-trips a scalar/array value via the reserved sentinel (no collision)', () => {
    // A value whose only key is literally `value` must NOT be mis-decoded as a
    // scalar (the prior `value`-wrapper trap, audit L-1). The sentinel is unambiguous.
    const original = {
      'Bench': { value: 42 }, // object value whose only key is `value`
      'Row': [1, 2, 3], // array value
      'Deadlift': 7, // bare scalar value
    };
    expect(decodeNameKeyed(encodeNameKeyed(original))).toEqual(original);
  });

  it('decodeNameKeyed is tolerant of the legacy plain-object shape (non-array passthrough)', () => {
    // A value that pre-dates the encode (or an all-safe-key map written directly)
    // arrives as a plain object — decode must return it untouched, not corrupt it.
    const legacy = { Squat: { kgFactor: 1.0, n: 3 } };
    expect(decodeNameKeyed(legacy)).toEqual(legacy);
  });

  it('a name-keyed map round-trips through a real push→pull cycle (forbidden char survives)', async () => {
    // End-to-end: DP learns a factor for an exercise with a `/` in its name, the
    // push encodes it (array body), and a fresh-device pull decodes it back to the
    // exact name so DP._calFactor finds it. This is the live "sync silently
    // stopped after a `/` exercise" regression guard.
    const original = { 'Pec Deck / Cable Fly': { kgFactor: 1.1, n: 6 } };
    DB.set('dp-cal-factors', original);

    /** @type {Record<string, unknown> | null} */
    let pushedBody = null;
    globalThis.fetch = vi.fn().mockImplementation(async (_url, init) => {
      if (init?.method === 'PATCH') pushedBody = JSON.parse(init.body);
      return new Response('null', { status: 200 });
    });
    await syncToFirebase();

    // Pushed as an ARRAY (forbidden-char-safe), never the raw forbidden-key object.
    expect(Array.isArray(pushedBody['dp-cal-factors'])).toBe(true);

    // Fresh device pulls the captured doc back.
    localStorage.clear();
    seedAuth();
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(pushedBody), { status: 200 }));
    await syncFromFirebase();

    expect(DB.get('dp-cal-factors')).toEqual(original);
  });

  it('push then pull round-trips a forbidden-char key value losslessly (pull(push(x)) === x)', async () => {
    // Capture what the PUSH wrote, then feed it straight back as the remote doc
    // for the PULL — proving the encode applied on write is exactly reversed on
    // read, so the value survives intact through the dual transform.
    const original = { bio: { targetKg: 88, equipment: ['rack', 'bench'] } };
    DB.set('sf.userConfig', original);

    /** @type {Record<string, unknown> | null} */
    let pushedBody = null;
    fetchMock = vi.fn().mockImplementation(async (_url, init) => {
      if (init?.method === 'PATCH') {
        pushedBody = JSON.parse(init.body);
      }
      return new Response('null', { status: 200 });
    });
    globalThis.fetch = fetchMock;

    await syncToFirebase();

    // The push wrote under the SANITIZED node name, never the dotted key.
    expect(pushedBody).not.toBeNull();
    expect(pushedBody).toHaveProperty('sf_userConfig');
    expect(pushedBody).not.toHaveProperty('sf.userConfig');

    // Now pull the captured remote doc back into a fresh local.
    localStorage.clear();
    seedAuth();
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(pushedBody), { status: 200 }));

    await syncFromFirebase();

    // Lossless: the original value re-materialized under the ORIGINAL local key.
    expect(DB.get('sf.userConfig')).toEqual(original);
  });
});
