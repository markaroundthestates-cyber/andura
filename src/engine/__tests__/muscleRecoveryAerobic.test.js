// ══ Aerobic -> recovery (light, fast-recovery cardio touch, concern C) ══════
// Aerobic CLASSES (aerobicStore) load muscles too, but cardio fatigue is NOT
// resistance fatigue: it eases a fresh muscle group up to "Easing" (partial),
// NEVER drives it deep "Loaded"/fatigued, and clears fast (~24h window). The
// gradient follows the real movement (marching, jacks, lunges, burpees...):
// core dominant, legs heavy, upper light, arms light isometric; spinning is
// legs+core dominant with minimal upper. NOTHING is fully untouched.

import { describe, it, expect, beforeEach } from 'vitest';
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

beforeEach(() => {
  localStorage.clear();
});

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

  // Backward logging (decision #45): a class logged TODAY for a PAST day carries
  // a fresh `ts` but an older `date`. Recency must anchor on `date` (when the
  // class HAPPENED), not `ts` (when it was logged) — otherwise a days-old class
  // would wrongly read as "just done" and ease groups in the 24h window.
  it('a backdated class (old date, fresh ts) eases NOTHING — recency uses date, not ts', () => {
    // date = 3 days ago, ts = now (just logged). The 24h window must reject it.
    const threeDaysAgo = new Date(now - 3 * 24 * MS_PER_HOUR);
    const iso = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(threeDaysAgo.getDate()).padStart(2, '0')}`;
    const out = getAerobicRecoveryContribution([{ type: 'aerobic', date: iso, ts: now }], now);
    expect(out).toEqual({});
  });

  it("a class dated TODAY eases its dominant groups (date anchor, today's noon is in-window)", () => {
    const t = new Date(now);
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const out = getAerobicRecoveryContribution([{ type: 'aerobic', date: iso, ts: now }], now);
    expect(out.core).toBe('partial');
    expect(out['picioare-quads']).toBe('partial');
  });
});

// FIX 3 (dp_aerobic_load_cap_v1) — the cardio→ease is intended for legs/core, but the
// upper-body classification over-fired AND stacking classes ACCUMULATED, pushing upper
// groups (shoulders/back/chest) into eased and cutting a both-user's push/pull volume.
describe('getAerobicRecoveryContribution — upper-body false-ease cap (FIX 3)', () => {
  const setFlag = (on) =>
    localStorage.setItem('_devFlags', JSON.stringify({ dp_aerobic_load_cap_v1: on }));
  const clearFlag = () => localStorage.removeItem('_devFlags');

  it('flag OFF (legacy): N stacked generic classes FALSELY ease the upper body (the bug)', () => {
    setFlag(false);
    // 3 same-day generic classes — the additive accumulation pushes shoulders/back
    // (gradient 0.35/0.30) well past the 0.35 ease threshold.
    const out = getAerobicRecoveryContribution(
      [aero('aerobic', hoursAgo(0.5)), aero('aerobic', hoursAgo(0.5)), aero('aerobic', hoursAgo(0.5))],
      now,
    );
    clearFlag();
    // The defect: upper groups read 'partial' from stacked generic cardio.
    expect(out.umeri).toBe('partial');
    expect(out.spate).toBe('partial');
  });

  it('flag ON: one generic class eases legs+core, leaves the upper body untouched', () => {
    setFlag(true);
    const out = getAerobicRecoveryContribution([aero('aerobic', hoursAgo(0.5))], now);
    clearFlag();
    // legs + core eased (the legitimate cardio touch)
    expect(out.core).toBe('partial');
    expect(out['picioare-quads']).toBe('partial');
    expect(out.fese).toBe('partial');
    // upper body NOT eased (generic class → legs+core only)
    expect(out.umeri).toBeUndefined();
    expect(out.piept).toBeUndefined();
    expect(out.spate).toBeUndefined();
    expect(out.triceps).toBeUndefined();
  });

  it('flag ON: N stacked generic classes STILL leave the upper body untouched (Math.max cap)', () => {
    setFlag(true);
    const out = getAerobicRecoveryContribution(
      [aero('aerobic', hoursAgo(0.5)), aero('aerobic', hoursAgo(0.5)), aero('aerobic', hoursAgo(0.5))],
      now,
    );
    clearFlag();
    expect(out.umeri).toBeUndefined();
    expect(out.spate).toBeUndefined();
    expect(out.piept).toBeUndefined();
    // legs/core still eased — but never deepened past 'partial' (cardio caps at partial).
    expect(out.core).toBe('partial');
    expect(out['picioare-quads']).toBe('partial');
  });

  it('flag ON: spinning (leg-dominant) still eases legs+core, no false upper ease', () => {
    setFlag(true);
    const out = getAerobicRecoveryContribution([aero('spinning', hoursAgo(0.5))], now);
    clearFlag();
    expect(out['picioare-quads']).toBe('partial');
    expect(out.core).toBe('partial');
    expect(out.piept).toBeUndefined();
    expect(out.umeri).toBeUndefined();
  });

  it('flag ON: no aerobic sessions (resistance-only user) → unchanged (empty)', () => {
    setFlag(true);
    const out = getAerobicRecoveryContribution([], now);
    clearFlag();
    expect(out).toEqual({});
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
