// §F-pass2-reactivate-01 (MED Wave 7 2026-05-23) — ReactivateCard tests
// covering Hand brick icon parity mockup andura-clasic.html L814.
//
// §F-pass2-reactivate-02 (LOW chat5 Wave 10) — border-lineStrong (warm
// taupe interactive boundary) verbatim mockup `var(--line-strong)` L812.
//
// Wave 2c i18n fix (2026-05-29) — the card's literal RO strings now flow
// through t() (reactivate.* keys). Default test locale is EN (jsdom
// navigator.language en-US), so title/body/button copy assert the EN bundle.
// Behavior (onStart/onDismiss wiring + testids) + the border-lineStrong
// surface-contract test are unchanged.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactivateCard } from '../../../components/Antrenor/ReactivateCard';
import type { LastSessionSummary } from '../../../stores/workoutStore';

function makeLastSession(daysAgo = 17): LastSessionSummary {
  return {
    title: 'Pull · spate si biceps',
    meta: '5 seturi · 48 min',
    ts: Date.now() - daysAgo * 86400000,
  };
}

describe('ReactivateCard — render', () => {
  it('renders title "Welcome back" (EN default)', () => {
    render(<ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders dynamic daysAgo computation (EN default)', () => {
    render(<ReactivateCard lastSession={makeLastSession(17)} onStart={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText(/17 days/)).toBeInTheDocument();
  });

  it('renders Start light + Later buttons (EN default)', () => {
    render(<ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Start light' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Later' })).toBeInTheDocument();
  });

  it('§F-pass2-reactivate-01 Hand brick icon present (mockup L814)', () => {
    render(<ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />);
    const icon = screen.getByTestId('reactivate-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('Start light click calls onStart', () => {
    const onStart = vi.fn();
    render(<ReactivateCard lastSession={makeLastSession()} onStart={onStart} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start light' }));
    expect(onStart).toHaveBeenCalled();
  });

  it('Later click calls onDismiss NU onStart', () => {
    const onStart = vi.fn();
    const onDismiss = vi.fn();
    render(<ReactivateCard lastSession={makeLastSession()} onStart={onStart} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(onDismiss).toHaveBeenCalled();
    expect(onStart).not.toHaveBeenCalled();
  });

  it('no diacritics in UI text', () => {
    const { container } = render(
      <ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />,
    );
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('§F-pass2-reactivate-02 Pulse glass surface + line-strong border mockup L812', () => {
    const { container } = render(
      <ReactivateCard lastSession={makeLastSession()} onStart={vi.fn()} onDismiss={vi.fn()} />,
    );
    const card = container.querySelector<HTMLElement>('[role="region"][aria-label="Welcome back"]');
    expect(card).not.toBeNull();
    expect(card?.className).toMatch(/pulse-card/);
    expect(card?.style.borderColor).toContain('var(--line-strong)');
  });
});
