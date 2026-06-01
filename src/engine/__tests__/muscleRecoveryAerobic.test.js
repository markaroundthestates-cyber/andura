// ══ Aerobic -> recovery (light, fast-recovery cardio touch, concern C) ══════
// Aerobic CLASSES (aerobicStore) load muscles too, but cardio fatigue is NOT
// resistance fatigue: it eases a fresh muscle group up to "Easing" (partial),
// NEVER drives it deep "Loaded"/fatigued, and clears fast (~24h window). The
// gradient follows the real movement (marching, jacks, lunges, burpees...):
// core dominant, legs heavy, upper light, arms light isometric; spinning is
// legs+core dominant with minimal upper. NOTHING is fully untouched.

import { describe, it, expect } from 'vitest';
import { MS_PER_HOUR } from '../../constants.js';
import {
  getRecoveryByGroup,
  getAerobicRecoveryContribution,
  mergeAerobicRecovery,
  AEROBIC_GROUP_GRADIENT,
  BIG11_GROUPS,
} from '../muscleRecovery.js';

const now = Date.now();
const hoursAgo = (h) => now - h * MS_PER_HOUR;
const aero = (type, ts) => ({ type, ts });

describe('getAerobicRecoveryContribution', () => {
  it('returns {} for empty / non-array sessions', () => {
    expect(getAerobicRecoveryContribution([], now)).toEqual({});
    expect(getAerobicRecoveryContribution(undefined, now)).toEqual({});
  });

  it('a recent class eases core + legs to partial (dominant groups)', () => {
    const out = getAerobicRecoveryContribution([aero('aerobic', hoursAgo(1))], now);
    expect(out.core).toBe('partial');
    expect(out['picioare-quads']).toBe('partial');
    expect(out.fese).toBe('partial');
  });

  it('NEVER reports fatigued — cardio caps at partial', () => {
    const out = getAerobicRecoveryContribution(
      [aero('step', hoursAgo(0.5)), aero('zumba', hoursAgo(0.5))],
      now,
    );
    for (const v of Object.values(out)) expect(v).toBe('partial');
  });

  it('light upper-body touch stays mostly below the ease bar (honest: cardio barely taxes upper)', () => {
    const out = getAerobicRecoveryContribution([aero('aerobic', hoursAgo(1))], now);
    // biceps/forearms are a light isometric touch — a single class should not
    // ease them (core + legs do).
    expect(out.biceps).toBeUndefined();
    expect(out.antebrate).toBeUndefined();
  });

  it('spinning is legs+core dominant with minimal upper', () => {
    const out = getAerobicRecoveryContribution([aero('spinning', hoursAgo(1))], now);
    expect(out['picioare-quads']).toBe('partial');
    expect(out.core).toBe('partial');
    // Minimal upper — spinning does not ease chest/biceps.
    expect(out.piept).toBeUndefined();
    expect(out.biceps).toBeUndefined();
  });

  it('clears fast — a class older than the 24h window eases nothing', () => {
    expect(getAerobicRecoveryContribution([aero('aerobic', hoursAgo(30))], now)).toEqual({});
  });

  it('AEROBIC_GROUP_GRADIENT touches every Big-11 group (nothing fully untouched)', () => {
    for (const gradient of Object.values(AEROBIC_GROUP_GRADIENT)) {
      for (const g of BIG11_GROUPS) {
        expect(gradient[g]).toBeGreaterThan(0);
      }
    }
  });
});

describe('mergeAerobicRecovery', () => {
  it('raises a recovered group to partial from a recent class', () => {
    const merged = mergeAerobicRecovery(
      { core: 'recovered', piept: 'recovered' },
      [aero('aerobic', hoursAgo(1))],
      now,
    );
    expect(merged.core).toBe('partial');
  });

  it('does NOT deepen an already-stressed (weights) group', () => {
    // Heavy lifting put picioare-quads fatigued; a same-day class must not lower
    // it to partial — the weights state wins.
    const merged = mergeAerobicRecovery(
      { 'picioare-quads': 'fatigued' },
      [aero('spinning', hoursAgo(1))],
      now,
    );
    expect(merged['picioare-quads']).toBe('fatigued');
  });

  it('full pipeline: a pure-aerobic day eases core+legs, leaves untrained upper recovered', () => {
    const resistance = getRecoveryByGroup([], undefined, now); // no weights logged
    const merged = mergeAerobicRecovery(resistance, [aero('aerobic', hoursAgo(1))], now);
    expect(merged.core).toBe('partial');
    expect(merged['picioare-quads']).toBe('partial');
    expect(merged.biceps).toBe('recovered'); // light isometric, below the bar
  });

  it('no aerobic sessions -> resistance state unchanged', () => {
    const resistance = { core: 'recovered', piept: 'fatigued' };
    expect(mergeAerobicRecovery(resistance, [], now)).toEqual(resistance);
  });
});
