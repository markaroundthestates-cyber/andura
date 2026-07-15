// ══ SET HISTORY CHIPS — EDIT-LOG done-chip tap (founder 2026-07-15) ══════════════
// With onEditDone wired, a DONE chip becomes a button (tap = open the screen's
// inline mis-log editor for that set). Without it (metric/bodyweight exercises,
// legacy call sites) the chips stay presentational — no button role anywhere.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetHistoryChips } from '../../../components/Workout/SetHistoryChips';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

const logged = [
  { kg: 60, reps: 10, rating: 'potrivit' as const, timestamp: 1 },
  { kg: 60, reps: 8, rating: 'greu' as const, timestamp: 2 },
];

beforeEach(() => {
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

describe('SetHistoryChips — onEditDone', () => {
  it('tapping a done chip calls back with that set index', () => {
    const onEditDone = vi.fn();
    render(
      <SetHistoryChips totalSets={4} loggedSets={logged} currentSetIdx={2} isBodyweight={false} onEditDone={onEditDone} />,
    );
    fireEvent.click(screen.getByTestId('set-history-1'));
    expect(onEditDone).toHaveBeenCalledWith(1);
  });

  it('without onEditDone the chips stay presentational (no buttons)', () => {
    const { container } = render(
      <SetHistoryChips totalSets={4} loggedSets={logged} currentSetIdx={2} isBodyweight={false} />,
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(screen.getByTestId('set-history-0')).toBeTruthy(); // testids preserved
  });
});
