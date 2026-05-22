// EXIT CONFIRM SHEET TESTS - backdrop tap dismiss + stopPropagation guard
// LOW-3 REVIEW-chat3-fresh-eyes: bottom-sheet UX convention tap-backdrop =
// dismiss (= 'continue' action). Inner sheet onClick stopPropagation prevent
// inner taps bubble.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExitConfirmSheet } from '../../../components/Workout/ExitConfirmSheet';

describe('ExitConfirmSheet - backdrop tap dismiss (LOW-3)', () => {
  it('backdrop click dispatches onChoose with continue', () => {
    const onChoose = vi.fn();
    render(
      <ExitConfirmSheet
        open={true}
        exIdx={2}
        totalExercises={5}
        onChoose={onChoose}
      />
    );
    fireEvent.click(screen.getByTestId('exit-sheet-backdrop'));
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith('continue');
  });

  it('click inside sheet does NOT trigger backdrop dismiss', () => {
    const onChoose = vi.fn();
    render(
      <ExitConfirmSheet
        open={true}
        exIdx={1}
        totalExercises={5}
        onChoose={onChoose}
      />
    );
    // Click the inner sheet container (NOT one of the action buttons).
    // stopPropagation guard MUST prevent backdrop onClick firing.
    fireEvent.click(screen.getByTestId('exit-sheet'));
    expect(onChoose).not.toHaveBeenCalled();
  });
});
