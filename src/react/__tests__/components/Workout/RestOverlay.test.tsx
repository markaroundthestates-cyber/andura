// REST OVERLAY TESTS - pure presentational countdown ring + skip button
// + §F-pass2-restoverlay-03 (MED chat5 Wave 11) contextual exercise cue.
//
// Workout.test.tsx covers integration-level behavior (rest phase transition,
// countdown decrement, kg/reps reset). Acest test file covers RestOverlay
// component-in-isolation contract: prop forwarding, conditional render
// pentru optional currentExerciseName, role/aria preservation.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestOverlay } from '../../../components/Workout/RestOverlay';
// i18n locale pin — these specs assert RO copy (kicker / cue / skip CTA /
// aria-label). Force RO so the i18n indirection resolves to the assertion
// targets. EN coverage is verified separately by i18nNoRoLeak.test.tsx.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
});

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

describe('RestOverlay - next-exercise preview (last-set rest cue)', () => {
  it('rest-up-next ABSENT when nextExerciseName omitted', () => {
    render(<RestOverlay countdownSec={60} initialRestSec={90} onSkip={vi.fn()} />);
    expect(screen.queryByTestId('rest-up-next')).toBeNull();
  });

  it('rest-up-next renders the next exercise name when provided', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Lat Pulldown"
        nextExerciseName="Cable Row"
      />,
    );
    const next = screen.getByTestId('rest-up-next');
    expect(next).toBeInTheDocument();
    expect(next.textContent ?? '').toContain('Cable Row');
  });
});

// Founder UX #2 (2026-06-12) — next-set load under the timer.
describe('RestOverlay - next-set load preview (founder #2)', () => {
  it('rest-next-set ABSENT when no next-set load provided', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Bench Press"
      />,
    );
    expect(screen.queryByTestId('rest-next-set')).toBeNull();
  });

  it('intermediate-set rest shows the next set load "kg x reps" (no exercise name)', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Bench Press"
        nextSetKg={40}
        nextSetReps={8}
      />,
    );
    const line = screen.getByTestId('rest-next-set');
    expect(line).toBeInTheDocument();
    // kg x reps order (matches the dock): "40 kg" before "8".
    expect(line.textContent ?? '').toBe('Urmeaza: 40 kg × 8');
    // No spurious next-exercise line on an intermediate-set rest.
    expect(screen.queryByTestId('rest-up-next')).toBeNull();
  });

  it('bodyweight next set reads "{reps} repetari" with no kg', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Pull-up"
        nextSetKg={0}
        nextSetReps={10}
        nextSetIsBodyweight
      />,
    );
    expect(screen.getByTestId('rest-next-set').textContent ?? '').toBe('Urmeaza: 10 repetari');
  });

  it('per-hand next set load reads "{kg} kg/mana x reps"', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="DB Curl"
        nextSetKg={12.5}
        nextSetReps={12}
        nextSetPerHand
      />,
    );
    expect(screen.getByTestId('rest-next-set').textContent ?? '').toBe('Urmeaza: 12.5 kg/mana × 12');
  });

  it('inter-exercise rest folds the next exercise OPENING load into the up-next line', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Lat Pulldown"
        nextExerciseName="Cable Row"
        nextSetKg={50}
        nextSetReps={10}
      />,
    );
    const next = screen.getByTestId('rest-up-next');
    // Name + opening load, kg x reps order: "Urmeaza: Cable Row — 50 kg × 10".
    expect(next.textContent ?? '').toBe('Urmeaza: Cable Row — 50 kg × 10');
    // The standalone next-set line is NOT also rendered (folded into up-next).
    expect(screen.queryByTestId('rest-next-set')).toBeNull();
  });

  it('next-set preview preserves the no-diacritics rule', () => {
    render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={vi.fn()}
        currentExerciseName="Bench Press"
        nextSetKg={60}
        nextSetReps={5}
      />,
    );
    const root = screen.getByTestId('rest-overlay');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(root.textContent ?? '')).toBe(false);
  });
});
