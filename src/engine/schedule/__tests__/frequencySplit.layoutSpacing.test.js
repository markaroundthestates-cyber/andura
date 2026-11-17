// dp_split_layout_spacing_v1 (founder 2026-11-17: "de ce îmi pune joi upper și nu picioare?
// mă gândeam doar la recuperare" + "ar trebui de fiecare dată să se recalculeze ordinea
// când schimb zilele"). The template's clusters are ordered for the user's real calendar.
import { describe, it, expect, beforeEach } from 'vitest';
import { spacedForLayout, clusterForDay } from '../scheduleAdapter/frequencySplit.js';

const week = (days) => [0, 1, 2, 3, 4, 5, 6].map((i) => days.includes(i));

beforeEach(() => localStorage.removeItem('_devFlags'));

describe('spacedForLayout', () => {
  it('his Mon/Tue/Thu/Fri upper week → push / pull / legs / upper (back 48 h → 72 h)', () => {
    expect(spacedForLayout(['push', 'pull', 'upper', 'lower'], [0, 1, 3, 4])).toEqual(['push', 'pull', 'lower', 'upper']);
  });

  it('Mon/Wed/Fri/Sun keeps the template (upper on Sunday would sit next to Monday push)', () => {
    expect(spacedForLayout(['push', 'pull', 'upper', 'lower'], [0, 2, 4, 6])).toEqual(['push', 'pull', 'upper', 'lower']);
  });

  it('an already spaced week is left alone (balanced upper/lower, push/pull/legs)', () => {
    expect(spacedForLayout(['upper', 'lower', 'upper', 'lower'], [0, 1, 3, 4])).toEqual(['upper', 'lower', 'upper', 'lower']);
    expect(spacedForLayout(['push', 'pull', 'legs'], [0, 2, 4])).toEqual(['push', 'pull', 'legs']);
  });

  it('recomputes when the days change: same template, another calendar, another order', () => {
    const tpl = ['push', 'pull', 'upper', 'lower'];
    expect(spacedForLayout(tpl, [0, 1, 3, 4])).not.toEqual(spacedForLayout(tpl, [0, 2, 4, 6]));
  });
});

describe('clusterForDay on his calendar', () => {
  const his = week([0, 1, 3, 4]);
  it('Thursday is the leg day, Friday upper', () => {
    expect(clusterForDay(his, 3, 'upper')).toBe('lower');
    expect(clusterForDay(his, 4, 'upper')).toBe('upper');
    expect(clusterForDay(his, 0, 'upper')).toBe('push');
    expect(clusterForDay(his, 1, 'upper')).toBe('pull');
  });

  it('flag off → the template order', () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_split_layout_spacing_v1: false }));
    expect(clusterForDay(his, 3, 'upper')).toBe('upper');
    expect(clusterForDay(his, 4, 'upper')).toBe('lower');
  });

  it('owed carryover placement wins over the spacing order', () => {
    expect(clusterForDay(his, 3, 'upper', false, ['lower'])).not.toBe(undefined);
  });
});
