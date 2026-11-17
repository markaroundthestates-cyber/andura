// dp_extra_day_recovered_v1 (founder 2026-11-17: "dacă luni am push, marți pull, joi
// picioare și vineri upper... și mă decid să fac 5-6 zile în loc de 4, Andura de ce nu
// recomandă, cu volum redus, grupa care e cea mai recuperată?"). His calendar Mon/Tue/
// Thu/Fri, focus upper → push / pull / legs / upper (dp_split_layout_spacing_v1).
import { describe, it, expect, beforeEach } from 'vitest';
import { pickExtraDayCluster, extraDaySets } from '../scheduleAdapter/extraDay.js';

const HIS = [true, true, false, true, true, false, false];
const pick = (dayIdx, recoveryState) => pickExtraDayCluster({ activeWeek: HIS, dayIdx, recoveryState, focusPreset: 'upper' });

beforeEach(() => localStorage.removeItem('_devFlags'));

describe('pickExtraDayCluster', () => {
  it('Wednesday after Mon push + Tue pull: push (not Thursday\'s legs, not the tired back)', () => {
    // Monday's push 48 h ago reads partial, Tuesday's pull fatigued, legs fresh — but
    // legs are tomorrow, so they read fatigued for an extra day.
    const state = { piept: 'partial', umeri: 'partial', triceps: 'partial', spate: 'fatigued', biceps: 'fatigued' };
    expect(pick(2, state)).toBe('push');
  });

  it('Saturday after Thu legs + Fri upper: legs (upper groups are a day old)', () => {
    const state = {
      piept: 'fatigued', spate: 'fatigued', umeri: 'fatigued', biceps: 'fatigued', triceps: 'fatigued',
      'picioare-quads': 'partial', 'picioare-hamstrings': 'partial', fese: 'partial', gambe: 'recovered',
    };
    expect(pick(5, state)).toBe('lower');
  });

  it('only the week\'s own clusters are offered (never a full-body bonus)', () => {
    expect(['push', 'pull', 'lower', 'upper']).toContain(pick(6, {}));
  });

  it('a week with no training day → null', () => {
    expect(pickExtraDayCluster({ activeWeek: Array(7).fill(false), dayIdx: 2, recoveryState: {} })).toBeNull();
  });
});

describe('extraDaySets', () => {
  it('x0.6, never under 2 (a 1-set exercise stays 1)', () => {
    expect(extraDaySets([{ sets: 4 }, { sets: 3 }, { sets: 2 }, { sets: 1 }]).map((e) => e.sets)).toEqual([2, 2, 2, 1]);
    expect(extraDaySets([{ sets: 5 }]).map((e) => e.sets)).toEqual([3]);
  });
});
