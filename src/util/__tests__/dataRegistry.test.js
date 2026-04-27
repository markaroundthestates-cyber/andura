/**
 * TASK #27 — Data Registry tests
 *
 * Verifies:
 * 1. Key list completeness and no unexpected overlaps
 * 2. PRESERVE_ON_RESET_KEYS semantics
 * 3. COACH_RELEVANT_KEYS consistency with firebase.js usage
 * 4. DYNAMIC_KEY_PREFIXES coverage
 * 5. getAllDynamicKeys() scan logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  USER_DATA_KEYS,
  TEST_RESIDUE_KEYS,
  COACH_RELEVANT_KEYS,
  DYNAMIC_KEY_PREFIXES,
  PRESERVE_ON_RESET_KEYS,
  CDL_KEYS,
  getAllDynamicKeys,
} from '../dataRegistry.js';
import { SYNC_KEYS } from '../../firebase.js';

describe('dataRegistry — key list integrity', () => {
  it('USER_DATA_KEYS contains all expected training data keys', () => {
    const required = ['weights', 'kcals', 'prots', 'logs', 'readiness', 'workout-skips',
      'session-burns', 'onboarding-done', 'current-kcal', 'phase-override'];
    required.forEach(k => expect(USER_DATA_KEYS, `missing: ${k}`).toContain(k));
  });

  it('TEST_RESIDUE_KEYS contains all expected transient coach/session keys', () => {
    const required = ['equipment-occupied-session',
      'session-draft', 'unavailable-equipment', 'early-stops',
      'weak-group-cache', 'response-profile'];
    required.forEach(k => expect(TEST_RESIDUE_KEYS, `missing: ${k}`).toContain(k));
  });

  it('TEST_RESIDUE_KEYS does not overlap with USER_DATA_KEYS', () => {
    const overlap = TEST_RESIDUE_KEYS.filter(k => USER_DATA_KEYS.includes(k));
    expect(overlap).toHaveLength(0);
  });

  it('PRESERVE_ON_RESET_KEYS does not overlap with USER_DATA_KEYS', () => {
    const overlap = PRESERVE_ON_RESET_KEYS.filter(k => USER_DATA_KEYS.includes(k));
    expect(overlap).toHaveLength(0);
  });

  it('PRESERVE_ON_RESET_KEYS does not overlap with TEST_RESIDUE_KEYS', () => {
    const overlap = PRESERVE_ON_RESET_KEYS.filter(k => TEST_RESIDUE_KEYS.includes(k));
    expect(overlap).toHaveLength(0);
  });

  it('PRESERVE_ON_RESET_KEYS contains device-id, active-theme, last-backup', () => {
    expect(PRESERVE_ON_RESET_KEYS).toContain('device-id');
    expect(PRESERVE_ON_RESET_KEYS).toContain('active-theme');
    expect(PRESERVE_ON_RESET_KEYS).toContain('last-backup');
  });

  it('COACH_RELEVANT_KEYS is a strict subset of USER_DATA_KEYS ∪ TEST_RESIDUE_KEYS ∪ CDL_KEYS', () => {
    const all = new Set([...USER_DATA_KEYS, ...TEST_RESIDUE_KEYS, ...CDL_KEYS]);
    const outside = COACH_RELEVANT_KEYS.filter(k => !all.has(k));
    expect(outside).toHaveLength(0);
  });

  it('COACH_RELEVANT_KEYS contains the 11 expected keys', () => {
    const required = ['logs', 'readiness', 'phase-override', 'current-kcal', 'weights',
      'unavailable-equipment', 'equipment-occupied-session', 'applied-patterns',
      'session-burns', 'early-stops', 'workout-skips'];
    required.forEach(k => expect(COACH_RELEVANT_KEYS, `missing: ${k}`).toContain(k));
    expect(COACH_RELEVANT_KEYS).toHaveLength(11);
  });

  it('DYNAMIC_KEY_PREFIXES covers all known dynamic key patterns', () => {
    const required = ['ex-extra-sets-', 'muscle-extra-', 'aa-cooldown-', 'backup-'];
    required.forEach(p => expect(DYNAMIC_KEY_PREFIXES, `missing prefix: ${p}`).toContain(p));
  });

  it('no key appears in more than one of the three main lists', () => {
    const lists = [USER_DATA_KEYS, TEST_RESIDUE_KEYS, PRESERVE_ON_RESET_KEYS];
    const seen = new Map();
    lists.forEach((list, idx) => {
      list.forEach(k => {
        if (seen.has(k)) throw new Error(`Key "${k}" in both list[${seen.get(k)}] and list[${idx}]`);
        seen.set(k, idx);
      });
    });
  });

  it('profile-history is in USER_DATA_KEYS (per ADR 014 §6)', () => {
    expect(USER_DATA_KEYS).toContain('profile-history');
  });

  it('profile-history is in SYNC_KEYS (Firebase backup, per ADR 014 §6)', () => {
    expect(SYNC_KEYS).toContain('profile-history');
  });
});

describe('getAllDynamicKeys', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns empty array when no dynamic keys are stored', () => {
    localStorage.setItem('logs', '[]');
    localStorage.setItem('weights', '{}');
    expect(getAllDynamicKeys()).toEqual([]);
  });

  it('detects ex-extra-sets-* keys', () => {
    localStorage.setItem('ex-extra-sets-Bench Press', '1');
    localStorage.setItem('ex-extra-sets-Squat', '2');
    const found = getAllDynamicKeys();
    expect(found).toContain('ex-extra-sets-Bench Press');
    expect(found).toContain('ex-extra-sets-Squat');
  });

  it('detects muscle-extra-* keys', () => {
    localStorage.setItem('muscle-extra-chest', 'true');
    expect(getAllDynamicKeys()).toContain('muscle-extra-chest');
  });

  it('detects aa-cooldown-* keys', () => {
    localStorage.setItem('aa-cooldown-Lateral Raises', '1714000000000');
    expect(getAllDynamicKeys()).toContain('aa-cooldown-Lateral Raises');
  });

  it('detects backup-* keys', () => {
    localStorage.setItem('backup-1714000000000', '{"data":{}}');
    expect(getAllDynamicKeys()).toContain('backup-1714000000000');
  });

  it('does not include static keys even if they start with a similar prefix', () => {
    localStorage.setItem('logs', '[]');
    localStorage.setItem('readiness', '{}');
    localStorage.setItem('last-backup', '{}');
    const found = getAllDynamicKeys();
    expect(found).not.toContain('logs');
    expect(found).not.toContain('readiness');
    // last-backup does NOT start with 'backup-', so should not match
    expect(found).not.toContain('last-backup');
  });

  it('returns all dynamic keys mixed together', () => {
    localStorage.setItem('ex-extra-sets-A', '1');
    localStorage.setItem('muscle-extra-legs', 'true');
    localStorage.setItem('aa-cooldown-B', '0');
    localStorage.setItem('backup-99', '{}');
    localStorage.setItem('logs', '[]');
    const found = getAllDynamicKeys();
    expect(found).toHaveLength(4);
    expect(found).not.toContain('logs');
  });
});
