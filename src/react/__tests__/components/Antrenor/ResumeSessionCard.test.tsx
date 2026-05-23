// §F-pass2-resume-01 (MED Wave 7 2026-05-23) — ResumeSessionCard tests
// covering PlayCircle brick icon parity mockup andura-clasic.html L796.
//
// §F-pass2-resume-02 (LOW chat5 Wave 11) — extend tests cu cream warm bg
// class verification + data-testid root scope. Mockup L795 verbatim.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeSessionCard } from '../../../components/Antrenor/ResumeSessionCard';
import type { PausedSession } from '../../../stores/workoutStore';

function makeSnapshot(overrides: Partial<PausedSession> = {}): PausedSession {
  return {
    title: 'Push · piept & umeri',
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
    expect(screen.getByText('Push · piept & umeri')).toBeInTheDocument();
  });

  it('renders meta line "Oprit la ex 2 · acum 18 min"', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByText(/Oprit la ex 2 · acum 18 min/)).toBeInTheDocument();
  });

  it('renders Reia + Renunta buttons', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Reia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Renunta' })).toBeInTheDocument();
  });

  it('§F-pass2-resume-01 PlayCircle brick icon present (mockup L796)', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    const icon = screen.getByTestId('resume-session-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('Reia button click calls onResume', () => {
    const onResume = vi.fn();
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={onResume} onDiscard={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reia' }));
    expect(onResume).toHaveBeenCalled();
  });

  it('Renunta button click calls onDiscard NU onResume', () => {
    const onResume = vi.fn();
    const onDiscard = vi.fn();
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={onResume} onDiscard={onDiscard} />);
    fireEvent.click(screen.getByRole('button', { name: 'Renunta' }));
    expect(onDiscard).toHaveBeenCalled();
    expect(onResume).not.toHaveBeenCalled();
  });

  it('§F-pass2-resume-02 warm cream bg #fdf6e8 (mockup L795 light theme)', () => {
    render(<ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />);
    const root = screen.getByTestId('resume-session-card');
    expect(root.className).toContain('bg-[#fdf6e8]');
    expect(root.className).toContain('dark:bg-paper2');
  });

  it('no diacritics in UI text', () => {
    const { container } = render(
      <ResumeSessionCard snapshot={makeSnapshot()} onResume={vi.fn()} onDiscard={vi.fn()} />,
    );
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
