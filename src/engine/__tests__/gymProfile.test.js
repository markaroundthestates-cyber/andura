// ══ GYM PROFILE — per-gym curated equipment stacks ("Sala mea" 2026-07-02) ══════
// (1) Store CRUD: upsert/active/stack/remove round-trip through the synced dp-gyms key.
// (2) Consumer: with an ACTIVE gym stack, roundToEquipmentWeight snaps a rec onto the
//     gym's REAL rung, winning over the generic ladder; no gym / flag OFF / no stack
//     for the station → byte-identical fall-through.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGymsState, activeGym, activeGymStepsForType,
  upsertGym, setActiveGym, setGymStack, removeGym,
} from '../dp/gymProfile.js';
import { roundToEquipmentWeight } from '../../config/weights.js';

const DEV = '_devFlags';

beforeEach(() => { localStorage.clear(); });

describe('gymProfile — store CRUD', () => {
  it('is empty by default (no active gym, no steps)', () => {
    expect(getGymsState()).toEqual({ activeId: null, gyms: {} });
    expect(activeGym()).toBeNull();
    expect(activeGymStepsForType('dumbbell')).toBeNull();
  });

  it('upsert adds a gym and the FIRST one becomes active automatically', () => {
    upsertGym({ id: 'g1', name: 'MyGym Domnesti', stacks: {} });
    const s = getGymsState();
    expect(s.activeId).toBe('g1');
    expect(s.gyms.g1.name).toBe('MyGym Domnesti');
  });

  it('setGymStack stores SORTED CLEAN positive rungs; activeGymStepsForType reads them', () => {
    upsertGym({ id: 'g1', name: 'MyGym', stacks: {} });
    setGymStack('g1', 'dumbbell', [10, 8, 9, -5, 0, 12, 8]); // unsorted + junk + dup
    expect(activeGymStepsForType('dumbbell')).toEqual([8, 9, 10, 12]);
  });

  it('an empty stack CLEARS the station (falls back to the app default)', () => {
    upsertGym({ id: 'g1', name: 'MyGym', stacks: { dumbbell: [8, 9, 10] } });
    setGymStack('g1', 'dumbbell', []);
    expect(activeGymStepsForType('dumbbell')).toBeNull();
  });

  it('setActiveGym switches which gym drives the snap', () => {
    upsertGym({ id: 'g1', name: 'A', stacks: { dumbbell: [8, 9, 10] } });
    upsertGym({ id: 'g2', name: 'B', stacks: { dumbbell: [5, 10, 15] } });
    expect(getGymsState().activeId).toBe('g1'); // first stays active on second upsert
    setActiveGym('g2');
    expect(activeGymStepsForType('dumbbell')).toEqual([5, 10, 15]);
  });

  it('removeGym re-points active to a remaining gym, then null when none left', () => {
    upsertGym({ id: 'g1', name: 'A', stacks: {} });
    upsertGym({ id: 'g2', name: 'B', stacks: {} });
    setActiveGym('g2');
    removeGym('g2');
    expect(getGymsState().activeId).toBe('g1');
    removeGym('g1');
    expect(getGymsState().activeId).toBeNull();
  });

  it('rejects mutations on an unknown gym', () => {
    expect(setActiveGym('nope').ok).toBe(false);
    expect(setGymStack('nope', 'dumbbell', [8]).ok).toBe(false);
    expect(removeGym('nope').ok).toBe(false);
  });
});

describe('active-gym curated stack wins the weight snap (dp_active_gym_ladder_v1)', () => {
  // Founder real gym change (2026-07-02): MyGym Domnesti ZIVA dumbbells step 2kg
  // (…16,18,20…), his OLD gym was 2.5kg (…15,17.5,20…). A DB rec of 18.7:
  //   - active gym ON → 18   (a REAL ZIVA rung)
  //   - no gym / OFF  → 17.5 (the generic 2.5kg ladder rung the ZIVA rack LACKS)
  // This IS the "presupune ca pot mai putin" fix: the coach stops snapping onto trepte
  // that don't exist on the new machine.
  const ZIVA = [8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50];

  it('snaps a DB rec onto the active gym rung, NOT the old-ladder rung', () => {
    upsertGym({ id: 'mygym', name: 'MyGym Domnesti', stacks: { dumbbell: ZIVA } });
    expect(roundToEquipmentWeight(18.7, 'Seated DB Press')).toBe(18);
  });

  it('no active gym → byte-identical generic snap (the old 2.5kg ladder rung)', () => {
    expect(roundToEquipmentWeight(18.7, 'Seated DB Press')).toBe(17.5);
  });

  it('flag OFF → falls through even with a gym present (byte-identical)', () => {
    localStorage.setItem(DEV, JSON.stringify({ dp_active_gym_ladder_v1: false }));
    upsertGym({ id: 'mygym', name: 'MyGym Domnesti', stacks: { dumbbell: ZIVA } });
    expect(roundToEquipmentWeight(18.7, 'Seated DB Press')).toBe(17.5);
  });

  it('a gym WITHOUT a stack for the station → unaffected (byte-identical)', () => {
    upsertGym({ id: 'mygym', name: 'MyGym Domnesti', stacks: { dumbbell: ZIVA } });
    const withGym = roundToEquipmentWeight(41.3, 'Bayesian Curl'); // matrix_cable — no gym stack
    localStorage.clear();
    const noGym = roundToEquipmentWeight(41.3, 'Bayesian Curl');
    expect(withGym).toBe(noGym);
  });
});
