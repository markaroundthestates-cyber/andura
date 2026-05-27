// REST OVERLAY TESTS - pure presentational countdown ring + skip button
// + §F-pass2-restoverlay-03 (MED chat5 Wave 11) contextual exercise cue.
//
// Workout.test.tsx covers integration-level behavior (rest phase transition,
// countdown decrement, kg/reps reset). Acest test file covers RestOverlay
// component-in-isolation contract: prop forwarding, conditional render
// pentru optional currentExerciseName, role/aria preservation.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestOverlay } from '../../../components/Workout/RestOverlay';

describe('RestOverlay - baseline render', () => {
  it('renders root dialog cu data-testid + role + aria-label', () => {
    render(<RestOverlay countdownSec={90} initialRestSec={90} onSkip={vi.fn()} />);
    const root = screen.getByTestId('rest-overlay');
    expect(root).toBeInTheDocument();
    expect(root.getAttribute('role')).toBe('dialog');
    expect(root.getAttribute('aria-label')).toBe('Pauza activa');
  });

  it('renders Pauza header text', () => {
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={vi.fn()} />);
    expect(screen.getByText('Pauza')).toBeInTheDocument();
  });

  it('renders countdown ring (rest-countdown testid inherited)', () => {
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={vi.fn()} />);
    expect(screen.getByTestId('rest-countdown')).toBeInTheDocument();
  });

  it('skip button click invokes onSkip', () => {
    const onSkip = vi.fn();
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={onSkip} />);
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('skip button label "Sari pauza" no diacritics', () => {
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={vi.fn()} />);
    const btn = screen.getByTestId('rest-skip');
    expect(btn.textContent).toBe('Sari pauza');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(btn.textContent ?? '')).toBe(false);
  });

  // BUG #7 — dark bottom card paritate mockup (suprafata DARK) vs vechiul
  // bg-paper deschis fullscreen. THEME-INVERSION fix (2026-05-27): clase
  // bg-ink/text-paper (light) + dark:bg-paper2/dark:text-ink (mov) ca suprafata
  // sa ramana dark in ambele teme, NU inline var(--ink) care inversa pe mov.
  it('renders dark card (bg-ink/text-paper + dark overrides) per mockup parity', () => {
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={vi.fn()} />);
    const root = screen.getByTestId('rest-overlay');
    expect(root.className).toContain('bg-ink');
    expect(root.className).toContain('text-paper');
    expect(root.className).toContain('dark:bg-paper2');
    expect(root.className).toContain('dark:text-ink');
  });

  // BUG #8 — cardul e pinned bottom (NU full-screen inset-0), deci NU acopera
  // header-ul cu X + ... → butoanele raman clickabile in timpul pauzei. Fara
  // fix, fixed inset-0 z-50 intercepta pointer events peste header z-10.
  it('is a bottom-pinned card, NOT a full-screen inset-0 blocking overlay', () => {
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={vi.fn()} />);
    const root = screen.getByTestId('rest-overlay');
    expect(root.className).not.toContain('inset-0');
    expect(root.className).toContain('bottom-');
  });
});

describe('RestOverlay - §F-pass2-restoverlay-03 contextual exercise cue', () => {
  it('rest-context-line ABSENT when currentExerciseName omitted', () => {
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={vi.fn()} />);
    expect(screen.queryByTestId('rest-context-line')).toBeNull();
  });

  it('rest-context-line ABSENT when currentExerciseName empty string', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName=""
      />,
    );
    expect(screen.queryByTestId('rest-context-line')).toBeNull();
  });

  it('rest-context-line renders "{name} recupereaza" when provided', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Bench Press"
      />,
    );
    const cue = screen.getByTestId('rest-context-line');
    expect(cue).toBeInTheDocument();
    expect(cue.textContent).toBe('Bench Press recupereaza');
  });

  it('contextual cue preserves no-diacritics rule for exercise names', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Tractiuni la helcometru"
      />,
    );
    const root = screen.getByTestId('rest-overlay');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(root.textContent ?? '')).toBe(false);
  });

  it('rest-context-line italic styling (mockup hint pattern)', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Squat"
      />,
    );
    const cue = screen.getByTestId('rest-context-line');
    expect(cue.className).toContain('italic');
  });
});
