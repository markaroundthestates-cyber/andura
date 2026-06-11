// ══ WarmupRampCard — in-workout primer stepper (gym-log arc follow-up) ════════
// Self-contained warm-up walker: own SHORT rests (30/45/60s by primer pct — the
// founder rule: never the full working rest), per-session done memory in
// sessionStorage, zero FSM/DP coupling (nothing here calls logSet or the engine).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WarmupRampCard } from '../../../components/Workout/WarmupRampCard';

// The real 100kg-bench ramp warmupRampFor emits (50/70/90%, bar-snapped).
const STEPS = [
  { kg: 50, reps: 10, pct: 50 },
  { kg: 70, reps: 6, pct: 70 },
  { kg: 90, reps: 3, pct: 90 },
];
const SESSION = 1_750_000_000_000;

beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('WarmupRampCard', () => {
  it('renders the primer chips and the current-step CTA', () => {
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION} />);
    expect(screen.getByTestId('warmup-ramp-card')).toBeInTheDocument();
    expect(screen.getByTestId('warmup-step-0')).toHaveTextContent('50 kg x 10');
    expect(screen.getByTestId('warmup-step-2')).toHaveTextContent('90 kg x 3');
    expect(screen.getByTestId('warmup-step-done')).toHaveTextContent('50');
  });

  it('completing a step starts the SHORT rest for that intensity (50% → 30s)', () => {
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION} />);
    fireEvent.click(screen.getByTestId('warmup-step-done'));
    expect(screen.getByTestId('warmup-rest')).toHaveTextContent('30');
    // Counts down (founder rule: a movement break, not a full working rest).
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('warmup-rest')).toHaveTextContent('29');
  });

  it('rest end advances to the next primer; 70% earns 45s', () => {
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION} />);
    fireEvent.click(screen.getByTestId('warmup-step-done'));
    act(() => { vi.advanceTimersByTime(30_000); });
    // Now on the 70kg primer.
    expect(screen.getByTestId('warmup-step-done')).toHaveTextContent('70');
    fireEvent.click(screen.getByTestId('warmup-step-done'));
    expect(screen.getByTestId('warmup-rest')).toHaveTextContent('45');
  });

  it('skip-rest jumps straight to the next primer', () => {
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION} />);
    fireEvent.click(screen.getByTestId('warmup-step-done'));
    fireEvent.click(screen.getByTestId('warmup-rest-skip'));
    expect(screen.getByTestId('warmup-step-done')).toHaveTextContent('70');
  });

  it('finishing the LAST primer (90% → 60s) collapses the card and persists done', () => {
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION} />);
    // Walk all three primers via skip (rest behavior covered above).
    fireEvent.click(screen.getByTestId('warmup-step-done'));
    fireEvent.click(screen.getByTestId('warmup-rest-skip'));
    fireEvent.click(screen.getByTestId('warmup-step-done'));
    fireEvent.click(screen.getByTestId('warmup-rest-skip'));
    fireEvent.click(screen.getByTestId('warmup-step-done'));
    // The 90% primer's rest is the LONGEST (60s) — the CNS one before the work set.
    expect(screen.getByTestId('warmup-rest')).toHaveTextContent('60');
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(screen.queryByTestId('warmup-ramp-card')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(`wu-done-${SESSION}`)).toBe('1');
  });

  it('a done session never resurrects the card on remount (per-session memory)', () => {
    sessionStorage.setItem(`wu-done-${SESSION}`, '1');
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION} />);
    expect(screen.queryByTestId('warmup-ramp-card')).not.toBeInTheDocument();
  });

  it('a NEW session (different key) gets a fresh card', () => {
    sessionStorage.setItem(`wu-done-${SESSION}`, '1');
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION + 1} />);
    expect(screen.getByTestId('warmup-ramp-card')).toBeInTheDocument();
  });

  it('dismiss ("Sar peste") hides the card and persists, never nagging again', () => {
    render(<WarmupRampCard steps={STEPS} sessionKey={SESSION} />);
    fireEvent.click(screen.getByTestId('warmup-dismiss'));
    expect(screen.queryByTestId('warmup-ramp-card')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(`wu-done-${SESSION}`)).toBe('1');
  });

  it('renders nothing for an empty ramp (flag off / light load)', () => {
    render(<WarmupRampCard steps={[]} sessionKey={SESSION} />);
    expect(screen.queryByTestId('warmup-ramp-card')).not.toBeInTheDocument();
  });
});
