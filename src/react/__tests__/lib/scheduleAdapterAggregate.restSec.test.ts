// ══ displayRestSec — heavy-compound REST classification + lower-body floor ═══════
// Daniel live audit 2026-07-05 ("pauza dupa squats e un joke"): the legacy rest
// resolver keyed only on the 9-item COMPOUND_EX list, which OMITTED the barbell
// squat / deadlift / split squat / hip thrust. So the single heaviest lift in the
// room fell to the ISOLATION MIN band (45s in a cut). The fix classifies heavy
// compounds by the library's force_demand ('high'), unioned with the legacy list
// (no regression), and floors the lower-body/glute compounds to ~2.5min. Gated
// behind dp_rest_heavy_compound_v1 (default ON) — flag OFF restores the legacy list.

import { describe, it, expect, afterEach } from 'vitest';
import { displayRestSec } from '../../lib/scheduleAdapterAggregate.compose';

// slabire (cut) rest band [minSec, maxSec] — the exact case Daniel hit: an 80kg
// squat used to fall to the MIN (45s) because it wasn't in COMPOUND_EX.
const CUT = [45, 90] as const;

describe('displayRestSec — heavy-compound classification + lower-body floor', () => {
  afterEach(() => {
    localStorage.removeItem('_devFlags');
  });

  it('barbell back squat (was misclassified as isolation → 45s) now floors to 150s in a cut', () => {
    expect(displayRestSec('Barbell Back Squat (High Bar)', CUT)).toBe(150);
  });

  it('deadlift + RDL + split squat + hip thrust also get the lower-body floor', () => {
    expect(displayRestSec('Conventional Deadlift', CUT)).toBe(150);
    expect(displayRestSec('Romanian Deadlift', CUT)).toBe(150);
    expect(displayRestSec('Bulgarian Split Squat', CUT)).toBe(150);
    expect(displayRestSec('Hip Thrust', CUT)).toBe(150);
  });

  it('upper-body compound (Lat Pulldown) rests at the goal MAX — NOT floored', () => {
    // spate, force_demand high → range MAX (90), no lower-body floor. This is the
    // contract the realwire suite already pins; the fix must not disturb it.
    expect(displayRestSec('Lat Pulldown', CUT)).toBe(90);
  });

  it('isolation (Lateral Raises) rests at the goal MIN', () => {
    expect(displayRestSec('Lateral Raises', CUT)).toBe(45);
  });

  it('the goal band wins when it already exceeds the floor (forta 120–240 → 240)', () => {
    expect(displayRestSec('Barbell Back Squat (High Bar)', [120, 240])).toBe(240);
  });

  it('malformed / absent range → documented 90s fallback', () => {
    expect(displayRestSec('Barbell Back Squat (High Bar)', null)).toBe(90);
    expect(displayRestSec('Lat Pulldown', [90] as unknown as [number, number])).toBe(90);
  });

  it('flag OFF → legacy behavior: squat falls to isolation MIN, listed compound at MAX', () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_rest_heavy_compound_v1: false }));
    // Legacy: squat not in COMPOUND_EX → MIN (the bug, preserved as kill-switch escape).
    expect(displayRestSec('Barbell Back Squat (High Bar)', CUT)).toBe(45);
    // Legacy: Lat Pulldown in COMPOUND_EX → MAX (unchanged either way).
    expect(displayRestSec('Lat Pulldown', CUT)).toBe(90);
  });
});
