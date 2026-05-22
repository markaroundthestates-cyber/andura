// §F-pass2-reactivate-01 (MED Wave 7 2026-05-23) — ReactivateCard tests
// covering Hand brick icon parity mockup andura-clasic.html L814.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactivateCard } from '../../../components/Antrenor/ReactivateCard';
import type { LastSessionSummary } from '../../../stores/workoutStore';

function makeLastSession(daysAgo = 17): LastSessionSummary {
  return {
    title: 'Pull · spate & biceps',
    meta: '5 seturi · 48 min',
    ts: Date.now() - daysAgo * 86400000,
  };
}

describe('ReactivateCard — render', () => {
  it('renders title "Bun venit inapoi"', () => {
    render(<ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText('Bun venit inapoi')).toBeInTheDocument();
  });

  it('renders dynamic daysAgo computation', () => {
    render(<ReactivateCard lastSession={makeLastSession(17)} onStart={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText(/17 zile/)).toBeInTheDocument();
  });

  it('renders Incep usor + Mai tarziu buttons', () => {
    render(<ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Incep usor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mai tarziu' })).toBeInTheDocument();
  });

  it('§F-pass2-reactivate-01 Hand brick icon present (mockup L814)', () => {
    render(<ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />);
    const icon = screen.getByTestId('reactivate-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('Incep usor click calls onStart', () => {
    const onStart = vi.fn();
    render(<ReactivateCard lastSession={makeLastSession()} onStart={onStart} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Incep usor' }));
    expect(onStart).toHaveBeenCalled();
  });

  it('Mai tarziu click calls onDismiss NU onStart', () => {
    const onStart = vi.fn();
    const onDismiss = vi.fn();
    render(<ReactivateCard lastSession={makeLastSession()} onStart={onStart} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mai tarziu' }));
    expect(onDismiss).toHaveBeenCalled();
    expect(onStart).not.toHaveBeenCalled();
  });

  it('no diacritics in UI text', () => {
    const { container } = render(
      <ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />,
    );
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
