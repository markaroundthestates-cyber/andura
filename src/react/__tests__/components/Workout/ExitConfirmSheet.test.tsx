// EXIT CONFIRM SHEET TESTS - backdrop tap dismiss + stopPropagation guard
// LOW-3 REVIEW-chat3-fresh-eyes: bottom-sheet UX convention tap-backdrop =
// dismiss (= 'continue' action). Inner sheet onClick stopPropagation prevent
// inner taps bubble.
//
// W4-AUDIT-DEEPER chat 5 HIGH a11y DIM 3 KEYBOARD coverage extended:
// aria-modal + aria-labelledby, Escape close, focus auto primary, focus
// trap Tab/Shift+Tab cycle first↔last, restore focus la invoker on close.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import type { JSX } from 'react';
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

describe('ExitConfirmSheet - a11y modal contract (W4 chat 5 HIGH)', () => {
  it('role=dialog + aria-modal=true + aria-labelledby pe sheet', () => {
    render(
      <ExitConfirmSheet
        open={true}
        exIdx={0}
        totalExercises={5}
        onChoose={vi.fn()}
      />,
    );
    const sheet = screen.getByTestId('exit-sheet');
    expect(sheet).toHaveAttribute('role', 'dialog');
    expect(sheet).toHaveAttribute('aria-modal', 'true');
    expect(sheet).toHaveAttribute('aria-labelledby', 'exit-sheet-title');
    expect(document.getElementById('exit-sheet-title')).toHaveTextContent(
      'Iesi din sesiune?',
    );
  });

  it('focus auto pe primary Continua sesiunea button la open', () => {
    render(
      <ExitConfirmSheet
        open={true}
        exIdx={1}
        totalExercises={5}
        onChoose={vi.fn()}
      />,
    );
    const continueBtn = screen.getByTestId('exit-continue');
    expect(document.activeElement).toBe(continueBtn);
  });

  it('Escape key dispatches onChoose continue (safe close)', () => {
    const onChoose = vi.fn();
    render(
      <ExitConfirmSheet
        open={true}
        exIdx={2}
        totalExercises={5}
        onChoose={onChoose}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onChoose).toHaveBeenCalledWith('continue');
  });

  it('Tab focus trap — Shift+Tab pe first cycles la last (discard)', () => {
    render(
      <ExitConfirmSheet
        open={true}
        exIdx={0}
        totalExercises={5}
        onChoose={vi.fn()}
      />,
    );
    const continueBtn = screen.getByTestId('exit-continue');
    const discardBtn = screen.getByTestId('exit-discard');
    // Auto-focus pe continue (first). Shift+Tab → last (discard).
    expect(document.activeElement).toBe(continueBtn);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(discardBtn);
  });

  it('Tab focus trap — Tab pe last (discard) cycles la first (continue)', () => {
    render(
      <ExitConfirmSheet
        open={true}
        exIdx={0}
        totalExercises={5}
        onChoose={vi.fn()}
      />,
    );
    const continueBtn = screen.getByTestId('exit-continue');
    const discardBtn = screen.getByTestId('exit-discard');
    act(() => {
      discardBtn.focus();
    });
    expect(document.activeElement).toBe(discardBtn);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(continueBtn);
  });

  it('restore focus la invoker on close', () => {
    function Harness(): JSX.Element {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button
            type="button"
            data-testid="invoker"
            onClick={() => setOpen(true)}
          >
            Open
          </button>
          <ExitConfirmSheet
            open={open}
            exIdx={0}
            totalExercises={5}
            onChoose={() => setOpen(false)}
          />
        </div>
      );
    }
    render(<Harness />);
    const invoker = screen.getByTestId('invoker');
    act(() => {
      invoker.focus();
    });
    expect(document.activeElement).toBe(invoker);
    fireEvent.click(invoker);
    // After open, focus moved la continue button.
    const continueBtn = screen.getByTestId('exit-continue');
    expect(document.activeElement).toBe(continueBtn);
    // Close via Escape → focus returns la invoker.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(invoker);
  });

  it('no diacritics in UI text', () => {
    const { container } = render(
      <ExitConfirmSheet
        open={true}
        exIdx={2}
        totalExercises={5}
        onChoose={vi.fn()}
      />,
    );
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
