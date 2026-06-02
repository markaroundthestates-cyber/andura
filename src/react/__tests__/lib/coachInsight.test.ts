// ══ COACH INSIGHT COMPOSER TESTS — the daily "why" line ════════════════════
// Locks the Coach Voice composer: CoachAdaptation[] (engine tokens) → ONE
// plain-language sentence via t(). Salience ordering, single vs combined,
// graceful null on empty, and RO no-diacritics (D-LEGACY-064).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { composeCoachInsight } from '../../lib/coachInsight';
import type { CoachAdaptation } from '../../lib/engineWrappers.types';
import { setLocale, _resetI18nCache } from '../../../i18n/index.js';

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
