// ══ Last-write-wins for setting-shaped keys (sync_lww_settings_v1) ══════════
//
// EVIDENCE (founder account dump 2026-10-01): phase-log carries a CUT entry from
// 2026-07-12, yet phase-override read STRENGTH (phase-change-date 2026-06-12): the
// pull merge keeps the LOCAL scalar, so the device that never made the switch kept
// re-pushing its stale token. dp-gyms has the same shape problem (its whole `gyms`
// subtree is one top-level key → shallow local-wins), so an equivalence written from
// elsewhere could never land. And the equivalence map itself is keyed by free-text
// exercise names — "Pec Deck / Cable Fly" as a source key 400'd the whole PATCH.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncToFirebase, syncFromFirebase, LWW_CLOUD_NODES } from '../firebase.js';
import { DB } from '../db.js';
import { gymEquivalentFor } from '../engine/dp/gymProfile.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

const FORBIDDEN = /[.$#[\]/]/;
const T_SERVER = 1790900000000; // 2026-10-02 — the stamp of a write made elsewhere

// His real gym (dump 2026-10-01), stacks trimmed, plus the equivalences he asked for.
const GYMS = {
  activeId: 'gym_mygym_domnesti',
  gyms: {
    gym_mygym_domnesti: {
      id: 'gym_mygym_domnesti',
      name: 'MyGym Domnesti',
      stacks: { matrix_cable: [4.5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 64, 68, 73] },
      equivalents: {
        'Converging Chest Press': 'Flat Chest Press Machine',
        'Cable Fly': 'Pec Deck / Cable Fly',
      },
    },
  },
};

function _seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-lww-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-lww-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

/** A value written by a pre-LWW client: present locally, never stamped. */
function _legacyLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function _assertNoForbiddenKeys(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(_assertNoForbiddenKeys); return; }
  for (const key of Object.keys(node)) {
    expect(FORBIDDEN.test(key), `forbidden char in cloud key "${key}"`).toBe(false);
    _assertNoForbiddenKeys(node[key]);
  }
}

describe('firebase — last-write-wins settings (phase-override, phase-change-date, dp-gyms)', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;
  const remote = (doc) => fetchMock.mockResolvedValue(new Response(JSON.stringify(doc), { status: 200 }));
  const lastPatch = () => JSON.parse(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1].body);

  beforeEach(() => {
    localStorage.clear();
    _seedAuth();
    fetchMock = vi.fn().mockResolvedValue(new Response('null', { status: 200 }));
    globalThis.fetch = fetchMock;
    delete window._suppressFirebaseSync;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('a newer mirror beats the stale local token even after an old client re-pushed the plain key', async () => {
    _legacyLocal('phase-override', 'STRENGTH');
    _legacyLocal('phase-change-date', '2026-06-12');
    remote({
      'phase-override': 'STRENGTH', // clobbered back by a pre-LWW client
      'phase-change-date': '2026-06-12',
      '_lww_phase-override': { ts: T_SERVER, v: 'CUT' },
      '_lww_phase-change-date': { ts: T_SERVER, v: '2026-07-12' },
    });
    await syncFromFirebase();
    expect(DB.get('phase-override')).toBe('CUT');
    expect(DB.get('phase-change-date')).toBe('2026-07-12');
    // Adopted at the REMOTE stamp (not re-stamped "now"), so it does not outrank a later edit.
    expect(DB.get('sync-lww-ts')['phase-override']).toBe(T_SERVER);
  });

  it('no mirror anywhere → the legacy merge (local scalar kept)', async () => {
    _legacyLocal('phase-override', 'STRENGTH');
    remote({ 'phase-override': 'CUT' });
    await syncFromFirebase();
    expect(DB.get('phase-override')).toBe('STRENGTH');
  });

  it('a local edit newer than the mirror wins (true last-write-wins, not remote-wins)', async () => {
    vi.setSystemTime(new Date(T_SERVER));
    DB.set('phase-override', 'CUT'); // stamped T_SERVER
    vi.useRealTimers();
    remote({ '_lww_phase-override': { ts: T_SERVER - 86_400_000, v: 'STRENGTH' } });
    await syncFromFirebase();
    expect(DB.get('phase-override')).toBe('CUT');
  });

  it('a mirror without a value (switched to AUTO elsewhere) clears the local token', async () => {
    _legacyLocal('phase-override', 'STRENGTH');
    remote({ '_lww_phase-override': { ts: T_SERVER } });
    await syncFromFirebase();
    expect(DB.get('phase-override')).toBe(null);
  });

  it('push mirrors {ts, v} only for keys this device stamped', async () => {
    _legacyLocal('phase-change-date', '2026-06-12'); // unstamped
    DB.set('phase-override', 'CUT');
    await syncToFirebase();
    const body = lastPatch();
    expect(body['phase-override']).toBe('CUT');
    expect(body['_lww_phase-override']).toEqual({ ts: expect.any(Number), v: 'CUT' });
    expect(body['_lww_phase-change-date']).toBeUndefined();
    expect(LWW_CLOUD_NODES).toContain('_lww_phase-override');
  });

  it('a stamp written while pulling never claims "edited here now"', async () => {
    remote({ 'phase-override': 'CUT' }); // fresh device adopts via the legacy path
    await syncFromFirebase();
    expect(DB.get('phase-override')).toBe('CUT');
    expect(DB.get('sync-lww-ts')['phase-override']).toBeUndefined();
  });

  it('dp-gyms: a slashed equivalence key never reaches a cloud key (no whole-PATCH 400)', async () => {
    const withSlashSource = structuredClone(GYMS);
    withSlashSource.gyms.gym_mygym_domnesti.equivalents = { 'Pec Deck / Cable Fly': 'Cable Fly' };
    DB.set('dp-gyms', withSlashSource);
    await syncToFirebase();
    const body = lastPatch();
    _assertNoForbiddenKeys(body['dp-gyms']);
    _assertNoForbiddenKeys(body['_lww_dp-gyms']);
  });

  it('dp-gyms: the equivalences written elsewhere land on a device that already had the gym', async () => {
    const before = structuredClone(GYMS);
    delete before.gyms.gym_mygym_domnesti.equivalents;
    _legacyLocal('dp-gyms', before);
    // What the other side pushed: encoded exactly as syncToFirebase encodes it.
    DB.set('dp-gyms', GYMS);
    await syncToFirebase();
    const pushed = lastPatch();
    localStorage.clear();
    _seedAuth();
    _legacyLocal('dp-gyms', before);
    remote({ 'dp-gyms': pushed['dp-gyms'], '_lww_dp-gyms': pushed['_lww_dp-gyms'] });
    await syncFromFirebase();
    expect(DB.get('dp-gyms')).toEqual(GYMS);
    expect(gymEquivalentFor('Cable Fly')).toBe('Pec Deck / Cable Fly');
    expect(gymEquivalentFor('Converging Chest Press')).toBe('Flat Chest Press Machine');
  });

  it('flag OFF → mirrors ignored and not written (legacy byte-identical)', async () => {
    localStorage.setItem('_devFlags', JSON.stringify({ sync_lww_settings_v1: false }));
    _legacyLocal('phase-override', 'STRENGTH');
    remote({ '_lww_phase-override': { ts: T_SERVER, v: 'CUT' } });
    await syncFromFirebase();
    expect(DB.get('phase-override')).toBe('STRENGTH');
    DB.set('phase-override', 'CUT');
    await syncToFirebase();
    expect(lastPatch()['_lww_phase-override']).toBeUndefined();
  });
});

// ══ Learned engine state rides the same stamp (sync_lww_learned_v1) ═════════
// EVIDENCE (founder account, 2026-10-09): his phone pushed its learned state at
// 15:23; at 21:22 a second device of his — idle since the summer — opened the app
// and its old copy replaced the phone's in the cloud: hamstring recovery back to the
// inflated 192h (the phone had the recomputed 96h v2), the Leg Press 90 he logged
// that morning gone from the observed loads, behavior tuning n 11129 → 17. Values
// below are the two real copies.
describe('firebase — learned engine state is last-learned-wins', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;
  const remote = (doc) => fetchMock.mockResolvedValue(new Response(JSON.stringify(doc), { status: 200 }));
  const lastPatch = () => JSON.parse(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1].body);
  const PHONE_RECOVERY = { hamstring: { hours: 96, n: 3, v: 2 }, lat: { hours: 72, n: 3, v: 2 } };
  const STALE_RECOVERY = { hamstring: { hours: 192, n: 14 }, lat: { hours: 60, n: 2 } };
  const PHONE_OBS = { 'Leg Press': { loads: [90, 190, 210, 230], templateId: 'plate_metric_daniel' } };
  const STALE_OBS = { 'Leg Press': { loads: [190, 210, 230], templateId: 'plate_metric_daniel' }, 'Pec Deck / Cable Fly': { loads: [18] } };

  /** What the phone pushes after learning: the real encoded cloud nodes. */
  async function phonePush() {
    DB.set('dp-recovery-constants', PHONE_RECOVERY);
    DB.set('dp-equipment-obs', PHONE_OBS);
    await syncToFirebase();
    const p = lastPatch();
    localStorage.clear();
    _seedAuth();
    return p;
  }

  beforeEach(() => {
    localStorage.clear();
    _seedAuth();
    fetchMock = vi.fn().mockResolvedValue(new Response('null', { status: 200 }));
    globalThis.fetch = fetchMock;
    delete window._suppressFirebaseSync;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('the idle device adopts what the phone learned, name-keyed values decoded', async () => {
    const p = await phonePush();
    _legacyLocal('dp-recovery-constants', STALE_RECOVERY);
    _legacyLocal('dp-equipment-obs', STALE_OBS);
    remote(p);
    await syncFromFirebase();
    expect(DB.get('dp-recovery-constants')).toEqual(PHONE_RECOVERY);
    expect(DB.get('dp-equipment-obs')).toEqual(PHONE_OBS);
    // ...and its next push carries the phone's copy, not its own old one.
    await syncToFirebase();
    expect(lastPatch()['dp-recovery-constants'].hamstring.hours).toBe(96);
  });

  it('the device that learned last keeps its copy whole — no stale entries unioned back', async () => {
    DB.set('dp-equipment-obs', PHONE_OBS); // stamped now
    remote({ 'dp-equipment-obs': [{ name: 'Leg Press', loads: [190, 210, 230] }, { name: 'Pec Deck / Cable Fly', loads: [18] }] });
    await syncFromFirebase();
    expect(DB.get('dp-equipment-obs')).toEqual(PHONE_OBS);
  });

  it('no stamp anywhere → the legacy union merge (local wins per entry)', async () => {
    _legacyLocal('dp-recovery-constants', PHONE_RECOVERY);
    remote({ 'dp-recovery-constants': { ...STALE_RECOVERY, quad: { hours: 96, n: 3, v: 2 } } });
    await syncFromFirebase();
    expect(DB.get('dp-recovery-constants')).toEqual({ ...PHONE_RECOVERY, quad: { hours: 96, n: 3, v: 2 } });
  });

  it('a learned write is mirrored with cloud-safe keys', async () => {
    DB.set('dp-equipment-obs', STALE_OBS);
    await syncToFirebase();
    const body = lastPatch();
    expect(body['_lww_dp-equipment-obs']).toEqual({ ts: expect.any(Number), v: expect.any(Array) });
    _assertNoForbiddenKeys(body['_lww_dp-equipment-obs']);
    expect(LWW_CLOUD_NODES).toContain('_lww_dp-recovery-constants');
  });

  it('flag OFF → learned keys keep the legacy merge and are not mirrored', async () => {
    const p = await phonePush();
    localStorage.setItem('_devFlags', JSON.stringify({ sync_lww_learned_v1: false }));
    _legacyLocal('dp-recovery-constants', STALE_RECOVERY);
    remote(p);
    await syncFromFirebase();
    expect(DB.get('dp-recovery-constants')).toEqual(STALE_RECOVERY);
    DB.set('dp-recovery-constants', PHONE_RECOVERY);
    await syncToFirebase();
    expect(lastPatch()['_lww_dp-recovery-constants']).toBeUndefined();
  });
});
