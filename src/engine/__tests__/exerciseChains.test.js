// ══ SUBSTITUTION CHAINS — chains-as-data (#6) ═════════════════════════════════
// Guards that the doc's EXPLICIT ordered chains resolve as data, every name is a
// real canonical, and getChainSubstitutes returns the downstream order.

import { describe, it, expect } from 'vitest';
import { SUBSTITUTION_CHAINS, getChainSubstitutes } from '../exerciseChains.js';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';

describe('chains-as-data — every chain name is a real canonical engineName', () => {
  it('all chain entries exist as library keys (no orphan / typo)', () => {
    for (const [group, chains] of Object.entries(SUBSTITUTION_CHAINS)) {
      for (const chain of chains) {
        for (const name of chain) {
          expect(
            Object.prototype.hasOwnProperty.call(EXERCISE_METADATA, name),
            `${group}: chain name "${name}" is not a library key`
          ).toBe(true);
        }
      }
    }
  });
});

describe('getChainSubstitutes — ordered downstream resolution', () => {
  it("the chest primary chain resolves in the doc's order", () => {
    // Flat BB Bench -> Flat DB -> Flat Machine -> Smith Bench -> Push-up -> Knee Push-up
    expect(getChainSubstitutes('Flat Barbell Bench')).toEqual([
      'Flat DB Press',
      'Flat Chest Press Machine',
      'Smith Machine Bench',
      'Push-up',
      'Knee Push-up',
    ]);
  });

  it('returns ONLY downstream names (never upstream, never itself)', () => {
    const subs = getChainSubstitutes('Smith Machine Bench');
    expect(subs).toEqual(['Push-up', 'Knee Push-up']);
    expect(subs).not.toContain('Flat Barbell Bench');
    expect(subs).not.toContain('Smith Machine Bench');
  });

  it('de-duplicates across multiple chains a name appears in (Leg Press)', () => {
    // Leg Press is downstream in the squat chain AND heads its own chain.
    const subs = getChainSubstitutes('Leg Press');
    expect(new Set(subs).size).toBe(subs.length); // no dupes
    expect(subs).toContain('Hack Squat Machine'); // from the Leg Press chain
    expect(subs).toContain('Goblet Squat'); // appears in both, once
  });

  it('returns [] for a name in no chain (consumer falls through to its fallback)', () => {
    expect(getChainSubstitutes('Totally Made Up Lift 9000')).toEqual([]);
  });

  it('is defensive on non-string input', () => {
    // @ts-expect-error runtime guard
    expect(getChainSubstitutes(undefined)).toEqual([]);
    expect(getChainSubstitutes('')).toEqual([]);
  });
});
