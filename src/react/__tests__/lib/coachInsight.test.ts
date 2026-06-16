// ══ COACH INSIGHT COMPOSER TESTS — the daily "why" line ════════════════════
// Locks the Coach Voice composer: CoachAdaptation[] (engine tokens) → ONE
// plain-language sentence via t(). Salience ordering, single vs combined,
// graceful null on empty, and RO no-diacritics (D-LEGACY-064).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { composeCoachInsight, getPlanAllocationByGroup } from '../../lib/coachInsight';
import type { CoachAdaptation, PlannedExercise } from '../../lib/engineWrappers.types';
import { setLocale, _resetI18nCache } from '../../../i18n/index.js';

// Minimal PlannedExercise fixture — only the fields the allocation reads matter
// (engineName/name → Big-11 group, sets → volume share). engineName values are
// real EXERCISE_MUSCLES keys so the engine resolver maps them to real groups.
function ex(engineName: string, sets: number): PlannedExercise {
  return {
    id: engineName,
    name: engineName,
    engineName,
    sets,
    targetReps: 8,
    targetKg: 60,
    restSec: 90,
  };
}

function en(): void {
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
}
function ro(): void {
  setLocale('ro');
  _resetI18nCache();
  setLocale('ro');
}

beforeEach(() => {
  en();
});
afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('composeCoachInsight — graceful empty', () => {
  it('returns null for an empty adaptations array (nothing adapted → no line)', () => {
    expect(composeCoachInsight([])).toBeNull();
  });

  it('returns null for null / undefined', () => {
    expect(composeCoachInsight(null)).toBeNull();
    expect(composeCoachInsight(undefined)).toBeNull();
  });

  it('returns null when no entry has a recognized kind', () => {
    expect(
      composeCoachInsight([{ kind: 'bogus' as CoachAdaptation['kind'] }]),
    ).toBeNull();
  });
});

describe('composeCoachInsight — each kind → its localized sentence (EN)', () => {
  it('deload', () => {
    const line = composeCoachInsight([{ kind: 'deload' }]);
    expect(line).toBe("This week is lighter on purpose — you're due a deload.");
  });

  it('recovery-cut (resistance cause) names the group', () => {
    const line = composeCoachInsight([
      { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
    ]);
    expect(line).toContain('chest');
    expect(line).toContain('still recovering');
  });

  it('recovery-cut (aerobic cause) → cardio wording', () => {
    const line = composeCoachInsight([
      { kind: 'recovery-cut', group: 'picioare-hamstrings', cause: 'aerobic' },
    ]);
    expect(line).toContain('hamstrings');
    expect(line).toContain('cardio');
  });

  it('weakness-amp names the lagging group', () => {
    const line = composeCoachInsight([{ kind: 'weakness-amp', group: 'spate' }]);
    expect(line).toContain('back');
    expect(line).toContain('lagging');
  });

  it('imbalance-fix names the group', () => {
    const line = composeCoachInsight([{ kind: 'imbalance-fix', group: 'picioare-hamstrings' }]);
    expect(line).toContain('hamstrings');
    expect(line).toContain('balance');
  });
});

describe('composeCoachInsight — salience + combination', () => {
  it('deload outranks a recovery cut as the PRIMARY clause', () => {
    const line = composeCoachInsight([
      { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
      { kind: 'deload' },
    ]);
    expect(line).not.toBeNull();
    // deload sentence leads; recovery clause follows in the combined line.
    expect(line!.indexOf('deload')).toBeLessThan(line!.indexOf('chest'));
  });

  it('combines at most TWO signals (deload + recovery, drops weakness)', () => {
    const line = composeCoachInsight([
      { kind: 'imbalance-fix', group: 'picioare-hamstrings' },
      { kind: 'weakness-amp', group: 'spate' },
      { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
      { kind: 'deload' },
    ]);
    expect(line).not.toBeNull();
    // Top-2 salience = deload + recovery-cut; weakness/imbalance dropped.
    expect(line).toContain('deload');
    expect(line).toContain('chest');
    expect(line).not.toContain('lagging'); // weakness clause dropped
  });

  it('de-dupes multiple cuts of the same KIND into one clause', () => {
    const line = composeCoachInsight([
      { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
      { kind: 'recovery-cut', group: 'spate', cause: 'resistance' },
    ]);
    expect(line).not.toBeNull();
    // Only the FIRST recovery-cut group is voiced (single clause, short line).
    expect(line).toContain('chest');
    expect(line).not.toContain('back');
  });

  it('weakness + imbalance combine when no higher-salience signal present', () => {
    const line = composeCoachInsight([
      { kind: 'weakness-amp', group: 'spate' },
      { kind: 'imbalance-fix', group: 'picioare-hamstrings' },
    ]);
    expect(line).not.toBeNull();
    expect(line).toContain('back');
    expect(line).toContain('hamstrings');
    // weakness (rank 2) leads imbalance (rank 3).
    expect(line!.indexOf('back')).toBeLessThan(line!.indexOf('hamstrings'));
  });
});

// ── Plan-allocation truth reconciliation (chest-heavy-plan bug, 2026-06-05) ──
// The founder caught the coach claiming what the generated plan does NOT do:
// "focus on biceps" while the plan was chest-heavy (8 chest sets vs 3 biceps),
// and "lighter on your back" while back was at standard load. Every clause must
// trace to the SAME live plan/maturity state — these tests pin those lies shut.
describe('getPlanAllocationByGroup — per-group share of the proposed plan', () => {
  it('names the real top group of a chest-heavy plan (chest, NOT biceps)', () => {
    // Founder's exact shape: 2 chest exercises (8 sets) + 1 biceps (3 sets).
    const alloc = getPlanAllocationByGroup([
      ex('Incline DB Press', 4),
      ex('Flat DB Press', 4),
      ex('Cable Curl', 3),
    ]);
    expect(alloc.topGroup).toBe('piept');
    expect(alloc.focusGroups.has('piept')).toBe(true);
    // Biceps is an afterthought (3 sets = 0.375 of chest's 8) → NOT a focus.
    expect(alloc.focusGroups.has('biceps')).toBe(false);
    // But it IS present in the plan (allocation), just not a focus.
    expect(alloc.allocatedGroups.has('biceps')).toBe(true);
  });

  it('empty / absent exercise list → empty allocation, null top group', () => {
    expect(getPlanAllocationByGroup([]).topGroup).toBeNull();
    expect(getPlanAllocationByGroup(undefined).topGroup).toBeNull();
    expect(getPlanAllocationByGroup(null).allocatedGroups.size).toBe(0);
  });

  it('zero-set / unknown exercises do not allocate any group', () => {
    const alloc = getPlanAllocationByGroup([
      ex('Flat DB Press', 0), // zero sets — ignored
      ex('Totally Unknown Lift', 5), // unknown engine name — no group
    ]);
    expect(alloc.allocatedGroups.size).toBe(0);
    expect(alloc.topGroup).toBeNull();
  });
});

describe('composeCoachInsight — plan-allocation reconciliation', () => {
  it('DROPS "lighter on back" when the plan keeps back as a focus (standard load)', () => {
    // The bug: engine emitted a recovery-cut for back, but the PLAN still trains
    // back as a top group (8 back sets) → "lighter on back" is a lie. Suppress it.
    const alloc = getPlanAllocationByGroup([
      ex('Cable Row', 4),
      ex('Lat Pulldown', 4),
    ]);
    const line = composeCoachInsight(
      [{ kind: 'recovery-cut', group: 'spate', cause: 'resistance' }],
      { allocation: alloc },
    );
    // No other supported clause → nothing to say.
    expect(line).toBeNull();
  });

  it('KEEPS "lighter on back" when the plan really does go light on back', () => {
    // Plan is chest-heavy; back is barely touched (1 set, far below chest focus).
    const alloc = getPlanAllocationByGroup([
      ex('Incline DB Press', 4),
      ex('Flat DB Press', 4),
      ex('Cable Row', 1),
    ]);
    const line = composeCoachInsight(
      [{ kind: 'recovery-cut', group: 'spate', cause: 'resistance' }],
      { allocation: alloc },
    );
    expect(line).not.toBeNull();
    expect(line).toContain('back');
    expect(line).toContain('still recovering');
  });

  it('DROPS a weakness-amp "focus" clause for a group the plan does not allocate', () => {
    // Engine flags biceps weak, but TODAY's plan trains zero biceps → can't claim
    // to "push biceps harder" today.
    const alloc = getPlanAllocationByGroup([
      ex('Incline DB Press', 4),
      ex('Flat DB Press', 4),
    ]);
    const line = composeCoachInsight(
      [{ kind: 'weakness-amp', group: 'biceps' }],
      { allocation: alloc },
    );
    expect(line).toBeNull();
  });

  it('KEEPS a weakness-amp clause for a group the plan actually trains', () => {
    const alloc = getPlanAllocationByGroup([ex('Cable Row', 5), ex('Lat Pulldown', 4)]);
    const line = composeCoachInsight([{ kind: 'weakness-amp', group: 'spate' }], {
      allocation: alloc,
      calibrationImmature: false,
    });
    expect(line).not.toBeNull();
    expect(line).toContain('back');
    expect(line).toContain('lagging');
  });

  it('DROPS an imbalance-fix clause for a group the plan does not allocate', () => {
    // LLM-judge `imbalance-NOT-allocated`: plan = chest 8 + shoulders 6 (zero
    // hamstrings), engine flags an imbalance-fix on hamstrings → "adding hamstring
    // volume" is a lie on a chest/shoulders plan. The prior exemption let it leak.
    const alloc = getPlanAllocationByGroup([
      ex('Incline DB Press', 4),
      ex('Flat DB Press', 4),
      ex('DB Shoulder Press', 6),
    ]);
    const line = composeCoachInsight(
      [{ kind: 'imbalance-fix', group: 'picioare-hamstrings' }],
      { allocation: alloc },
    );
    expect(line).toBeNull();
  });

  it('KEEPS an imbalance-fix clause for a group the plan actually trains', () => {
    const alloc = getPlanAllocationByGroup([
      ex('Romanian Deadlift', 5),
      ex('Leg Curl', 4),
    ]);
    const line = composeCoachInsight(
      [{ kind: 'imbalance-fix', group: 'picioare-hamstrings' }],
      { allocation: alloc },
    );
    expect(line).not.toBeNull();
    expect(line).toContain('hamstrings');
    expect(line).toContain('balance');
  });

  // ── Same-muscle contradiction guard (cycle-7 BLOCKER) ────────────────────
  // A single fatigued-AND-lagging group can emit BOTH a recovery-cut (M1) and a
  // weakness-amp (M2) for the SAME muscle → without a guard the combined line
  // says "Lighter on your chest — still recovering. Pushing your chest harder —
  // it's been lagging." (same muscle, opposite directions). Recovery (same-day
  // physiological fact) WINS over weakness-amp (a trend claim) for that group.
  it('SUPPRESSES a contradictory same-muscle weakness-amp (recovery wins)', () => {
    // Chest allocated but NOT a focus (1 chest set vs back-heavy focus) → the
    // recovery-cut for chest survives the allocation gate, and the weakness-amp
    // for chest would too (chest is allocated). Mature model → trend not gated.
    const alloc = getPlanAllocationByGroup([
      ex('Cable Row', 4),
      ex('Lat Pulldown', 4),
      ex('Flat DB Press', 1),
    ]);
    const line = composeCoachInsight(
      [
        { kind: 'weakness-amp', group: 'piept' },
        { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
      ],
      { allocation: alloc, calibrationImmature: false },
    );
    expect(line).not.toBeNull();
    // Chest named exactly ONCE, in the recovery direction — no contradiction.
    expect(line).toContain('chest');
    expect((line!.match(/chest/g) ?? []).length).toBe(1);
    expect(line).toContain('still recovering');
    expect(line).not.toContain('lagging');
  });

  // cycle-11: the SAME guard must also cover imbalance-fix. A group that is both
  // antagonist-imbalanced (M3 imbalance-fix → "adding volume to balance you out")
  // AND fatigued (M1 recovery-cut → "lighter — still recovering") would otherwise
  // merge into one sentence telling the user to go BOTH lighter and heavier.
  it('SUPPRESSES a contradictory same-muscle imbalance-fix (recovery wins)', () => {
    const alloc = getPlanAllocationByGroup([
      ex('Cable Row', 4),
      ex('Lat Pulldown', 4),
      ex('Flat DB Press', 1),
    ]);
    const line = composeCoachInsight(
      [
        { kind: 'imbalance-fix', group: 'piept' },
        { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
      ],
      { allocation: alloc, calibrationImmature: false },
    );
    expect(line).not.toBeNull();
    // Chest named exactly ONCE, in the recovery direction — no contradiction.
    expect(line).toContain('chest');
    expect((line!.match(/chest/g) ?? []).length).toBe(1);
    expect(line).toContain('still recovering');
    expect(line).not.toContain('balance');
  });

  it('KEEPS imbalance-fix when recovery-cut names a DIFFERENT group', () => {
    // Distinct groups → no collision; both survive. Chest allocated-but-not-focus
    // keeps its recovery-cut; back (focus) keeps its imbalance-fix.
    const alloc = getPlanAllocationByGroup([
      ex('Cable Row', 4),
      ex('Lat Pulldown', 4),
      ex('Flat DB Press', 1),
    ]);
    const line = composeCoachInsight(
      [
        { kind: 'imbalance-fix', group: 'spate' },
        { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
      ],
      { allocation: alloc, calibrationImmature: false },
    );
    expect(line).not.toBeNull();
    expect(line).toContain('balance');
    expect(line).toContain('still recovering');
  });

  it('KEEPS both clauses when recovery-cut and weakness-amp name DIFFERENT groups', () => {
    // Distinct groups → no collision; both survive and combine. Back is the
    // focus (weakness-amp allocated), chest is allocated-but-not-focus (1 set)
    // so the recovery-cut for chest survives its allocation gate too.
    const alloc = getPlanAllocationByGroup([
      ex('Cable Row', 4),
      ex('Lat Pulldown', 4),
      ex('Flat DB Press', 1),
    ]);
    const line = composeCoachInsight(
      [
        { kind: 'weakness-amp', group: 'spate' },
        { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
      ],
      { allocation: alloc, calibrationImmature: false },
    );
    expect(line).not.toBeNull();
    expect(line).toContain('chest');
    expect(line).toContain('back');
    expect(line).toContain('still recovering');
    expect(line).toContain('lagging');
  });
});

describe('composeCoachInsight — calibration-maturity gate (trend vs still-learning)', () => {
  it('SUPPRESSES the weakness-amp TREND claim while the model is still immature', () => {
    // A confident "it's been lagging behind" claim and "still learning you" must
    // be mutually exclusive — never both at once.
    const line = composeCoachInsight([{ kind: 'weakness-amp', group: 'spate' }], {
      calibrationImmature: true,
    });
    expect(line).toBeNull();
  });

  it('still voices a recovery-cut while immature (not a multi-session trend claim)', () => {
    // Recovery is a same-day physiological fact, not a multi-week trend → it is
    // NOT gated by maturity (only allocation gates it).
    const line = composeCoachInsight(
      [{ kind: 'recovery-cut', group: 'piept', cause: 'resistance' }],
      { calibrationImmature: true },
    );
    expect(line).not.toBeNull();
    expect(line).toContain('chest');
  });

  it('voices the weakness-amp claim once the model is mature', () => {
    const line = composeCoachInsight([{ kind: 'weakness-amp', group: 'spate' }], {
      calibrationImmature: false,
    });
    expect(line).not.toBeNull();
    expect(line).toContain('lagging');
  });
});

describe('composeCoachInsight — RO no-diacritics (D-LEGACY-064)', () => {
  const RO_DIACRITICS = /[ăâîșțĂÂÎȘȚşţŞŢ]/;

  it('RO single clause carries zero diacritics', () => {
    ro();
    const line = composeCoachInsight([
      { kind: 'recovery-cut', group: 'piept', cause: 'aerobic' },
    ]);
    expect(line).not.toBeNull();
    expect(RO_DIACRITICS.test(line!)).toBe(false);
  });

  it('RO combined sentence carries zero diacritics', () => {
    ro();
    const line = composeCoachInsight([
      { kind: 'deload' },
      { kind: 'weakness-amp', group: 'spate' },
    ]);
    expect(line).not.toBeNull();
    expect(RO_DIACRITICS.test(line!)).toBe(false);
  });
});
