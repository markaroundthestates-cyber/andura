// §F-pass2-resume-01 (MED Wave 7 2026-05-23) — ResumeSessionCard tests
// covering PlayCircle brick icon parity mockup andura-clasic.html L796.
//
// §F-pass2-resume-02 (LOW chat5 Wave 11) — extend tests cu cream warm bg
// class verification + data-testid root scope. Mockup L795 verbatim.
//
// Wave 2c i18n fix (2026-05-29) — the card's literal RO strings now flow
// through t() (resumeSession.* keys). Default test locale is EN (jsdom
// navigator.language en-US), so the meta line + Resume/Discard button copy
// assert the EN bundle. Behavior (onResume/onDiscard wiring + testids)
// unchanged.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeSessionCard } from '../../../components/Antrenor/ResumeSessionCard';
import type { PausedSession } from '../../../stores/workoutStore';

function makeSnapshot(overrides: Partial<PausedSession> = {}): PausedSession {
  return {
    title: 'Push · piept si umeri',
    meta: '5 seturi · 32 min',
    exIdx: 1,
    setIdx: 0,
    phase: 'logging',
    history: {},
    sessionStart: Date.now() - 18 * 60 * 1000,
    ...overrides,
  };
}

describe('ResumeSessionCard — render', () => {
  it('renders title from snapshot', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByText('Push · piept si umeri')).toBeInTheDocument();
  });

  it('renders meta line "Stopped at ex 2 · 18 min ago" (EN default)', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByText(/Stopped at ex 2 · 18 min ago/)).toBeInTheDocument();
  });

  it('renders Resume + Discard buttons (EN default)', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('§F-pass2-resume-01 PlayCircle brick icon present (mockup L796)', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    const icon = screen.getByTestId('resume-session-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('Resume button click calls onResume', () => {
    const onResume = vi.fn();
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={onResume} onDiscard={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(onResume).toHaveBeenCalled();
  });

  it('Discard button click calls onDiscard NU onResume', () => {
    const onResume = vi.fn();
    const onDiscard = vi.fn();
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={onResume} onDiscard={onDiscard} />);
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onDiscard).toHaveBeenCalled();
    expect(onResume).not.toHaveBeenCalled();
  });

  // ANDURA PULSE glass parity (2026-05-29): the surface is the translucent
  // .pulse-card glass primitive (fill + backdrop-blur + depth shadow + sheen),
  // keeping the 1.5px brick accent border (the most time-sensitive home card).
  // Token-only.
  it('§F-pass2-resume-02 Pulse glass surface + brick accent border', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    const root = screen.getByTestId('resume-session-card');
    expect(root.className).toContain('pulse-card');
    expect(root.style.border).toContain('var(--brick)');
  });

  it('no diacritics in UI text', () => {
    const { container } = render(
      <ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />,
    );
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
