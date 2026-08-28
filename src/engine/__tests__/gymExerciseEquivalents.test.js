// ══ PER-GYM EXERCISE EQUIVALENCE (founder live 2026-08-28) ═══════════════════
// "tot ce inseamna Converging chest press la mine pana acum a fost defapt chest
// press machine, si tot ce ai pus de chest fly a fost M torture pec fly".
//
// Not cosmetic: his REAL logs are split across near-identical library entries —
// chest press 15 sets under 'Converging Chest Press' + 6 under 'Flat Chest Press
// Machine'; pec fly 15 under 'Cable Fly' + 21 under 'Pec Deck / Cable Fly' + 3
// under 'Cable Pec Deck', with the fly identities disagreeing 23 kg vs 60 kg for
// the SAME machine. Each fragment cold-starts on its own → the "recommends 12 kg
// when I proved 55" report. Fixtures below use those real names and loads.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import { GYMS_KEY, gymEquivalentFor } from '../dp/gymProfile.js';
import { canonicalLoggedName } from '../dp/logIdentity.js';
import * as flags from '../../util/featureFlags.js';

const SESSION = 1787000000000;
const DAY = 86_400_000;

/** The founder's gym, declaring his real one-station equivalences. */
function seedGym(equivalents) {
  DB.set(GYMS_KEY, {
    activeId: 'gym_mygym',
    gyms: {
      gym_mygym: {
        id: 'gym_mygym',
        name: 'MyGym Domnesti',
        stacks: {},
        ...(equivalents ? { equivalents } : {}),
      },
    },
  });
}

/** His real split fly history: light loads under one name, heavy under another. */
function seedSplitFlyLogs() {
  DB.set('logs', [
    // 'Pec Deck / Cable Fly' — the heavy identity (what he actually lifts).
    { ex: 'Pec Deck / Cable Fly', w: 55, reps: '8', rpe: 8.5, ts: SESSION, session: SESSION },
    { ex: 'Pec Deck / Cable Fly', w: 52, reps: '12', rpe: 7.5, ts: SESSION - DAY, session: SESSION - DAY },
    { ex: 'Pec Deck / Cable Fly', w: 45, reps: '12', rpe: 7.5, ts: SESSION - 2 * DAY, session: SESSION - 2 * DAY },
    // 'Cable Fly' — the starved identity (same machine, cold-started separately).
    { ex: 'Cable Fly', w: 18, reps: '14', rpe: 7.5, ts: SESSION - 3 * DAY, session: SESSION - 3 * DAY },
    { ex: 'Cable Fly', w: 16, reps: '14', rpe: 7.5, ts: SESSION - 4 * DAY, session: SESSION - 4 * DAY },
  ]);
}

beforeEach(() => {
  localStorage.clear();
  // logs / pr-records / dp-gyms are SYNC_KEYS: every DB.set schedules a 3s
  // syncToFirebase timer (firebase.js:603). These specs seed them repeatedly, so
  // without this the timers outlive the file and fire during pool teardown — a
  // worker then reports over a closing RPC channel and the run ends with
  // "Timeout calling onTaskUpdate" (all tests green, husky exit 1).
  window._suppressFirebaseSync = true;
});

describe('gymEquivalentFor', () => {
  it('folds a declared name onto the gym canonical', () => {
    seedGym({ 'Cable Fly': 'Pec Deck / Cable Fly' });
    expect(gymEquivalentFor('Cable Fly')).toBe('Pec Deck / Cable Fly');
  });

  it('no active gym / no map / undeclared name / self-map → null (no merge)', () => {
    expect(gymEquivalentFor('Cable Fly')).toBeNull(); // no gym at all
    seedGym(null);
    expect(gymEquivalentFor('Cable Fly')).toBeNull(); // gym without equivalents
    seedGym({ 'Cable Fly': 'Pec Deck / Cable Fly' });
    expect(gymEquivalentFor('Converging Chest Press')).toBeNull(); // undeclared
    seedGym({ 'Cable Fly': 'Cable Fly' });
    expect(gymEquivalentFor('Cable Fly')).toBeNull(); // self-map is not a merge
  });

  it('follows exactly ONE hop (a chained map can never spin)', () => {
    seedGym({ A: 'B', B: 'C' });
    expect(gymEquivalentFor('A')).toBe('B');
  });

  it('malformed shapes never throw', () => {
    DB.set(GYMS_KEY, { activeId: 'g', gyms: { g: { id: 'g', name: 'x', stacks: {}, equivalents: [1, 2] } } });
    expect(() => gymEquivalentFor('Cable Fly')).not.toThrow();
    expect(gymEquivalentFor('Cable Fly')).toBeNull();
  });
});

describe('DP reads ONE history for one machine', () => {
  it('WITHOUT the equivalence the fly history stays split (the shipped bug)', () => {
    seedGym(null);
    seedSplitFlyLogs();
    expect(DP.getLogs('Cable Fly').length).toBe(2); // only its own starved rows
    expect(DP.getLogs('Cable Fly')[0].w).toBe(18);
  });

  it('WITH the equivalence both names read the SAME merged history', () => {
    seedGym({ 'Cable Fly': 'Pec Deck / Cable Fly' });
    seedSplitFlyLogs();
    const viaLight = DP.getLogs('Cable Fly');
    const viaHeavy = DP.getLogs('Pec Deck / Cable Fly');
    expect(viaLight.length).toBe(5);
    expect(viaHeavy.length).toBe(5);
    // Newest-first, so the 55 kg top set leads BOTH reads — the starved identity
    // can no longer recommend 12-18 kg for a machine he presses 55 on.
    expect(viaLight[0].w).toBe(55);
    expect(viaHeavy[0].w).toBe(55);
  });

  it('his chest press pair merges too (Converging <-> Flat Chest Press Machine)', () => {
    seedGym({ 'Converging Chest Press': 'Flat Chest Press Machine' });
    DB.set('logs', [
      { ex: 'Flat Chest Press Machine', w: 70, reps: '7', rpe: 8.5, ts: SESSION, session: SESSION },
      { ex: 'Converging Chest Press', w: 68, reps: '8', rpe: 7.5, ts: SESSION - DAY, session: SESSION - DAY },
    ]);
    expect(DP.getLogs('Converging Chest Press').length).toBe(2);
    expect(DP.getLogs('Flat Chest Press Machine').length).toBe(2);
  });

  it('an UNRELATED lift is never swept into the merge', () => {
    seedGym({ 'Cable Fly': 'Pec Deck / Cable Fly' });
    seedSplitFlyLogs();
    expect(DP.getLogs('Machine Shoulder Press').length).toBe(0);
  });

  it('flag OFF → the split view returns exactly (kill-switch is real)', () => {
    const spy = vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id !== 'dp_gym_exercise_equivalents_v1');
    seedGym({ 'Cable Fly': 'Pec Deck / Cable Fly' });
    seedSplitFlyLogs();
    expect(DP.getLogs('Cable Fly').length).toBe(2);
    spy.mockRestore();
  });
});

describe('canonicalLoggedName', () => {
  it('collapses a gym-equivalent name; unknown names keep themselves', () => {
    seedGym({ 'Cable Fly': 'Pec Deck / Cable Fly' });
    expect(canonicalLoggedName('Cable Fly')).toBe('Pec Deck / Cable Fly');
    expect(canonicalLoggedName('Some Brand New Machine')).toBe('Some Brand New Machine');
  });
});
