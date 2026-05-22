// ══ OBIECTIV SELECTOR TESTS — F-antrenor-03 Coverage ════════════════════
// Per MOCKUP-PARITY-chat3 §2.2 + §4 P4 + task spec §7 (4 tests).
// Mockup verbatim ref: 04-architecture/mockups/andura-clasic.html L862-870.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObiectivSelector } from '../../../components/Antrenor/ObiectivSelector';
import { useOnboardingStore } from '../../../stores/onboardingStore';

function resetStore(): void {
  useOnboardingStore.setState({
    data: {
      age: null,
      sex: null,
      goal: null,
      frequency: null,
      experience: null,
      weight: null,
    },
    completed: false,
    completedAt: null,
  });
  localStorage.clear();
}

describe('ObiectivSelector — 6 obiective V1 LOCK render', () => {
  beforeEach(resetStore);

  it('renders all 6 obiective rows cu labels mockup verbatim', () => {
    render(<ObiectivSelector />);
    expect(screen.getByTestId('obiectiv-row-auto')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-forta')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-masa')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-slabire')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-mentenanta')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-longevitate')).toBeInTheDocument();
    // Mockup verbatim text labels.
    expect(screen.getByText('Masa musculara')).toBeInTheDocument();
    expect(screen.getByText('Longevitate / Sanatate')).toBeInTheDocument();
    expect(screen.getByText('Mentenanta')).toBeInTheDocument();
  });

  it('defaults to Auto selected when store goal=null (mockup L864 is-active)', () => {
    render(<ObiectivSelector />);
    const autoRow = screen.getByTestId('obiectiv-row-auto');
    expect(autoRow).toHaveAttribute('aria-pressed', 'true');
    // "Ales" badge visible on selected row only.
    expect(screen.getByTestId('obiectiv-ales-auto')).toBeInTheDocument();
    // Other rows NOT pressed.
    expect(screen.getByTestId('obiectiv-row-forta')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ObiectivSelector — pick action wires store', () => {
  beforeEach(resetStore);

  it('clicking row sets onboardingStore.data.goal', () => {
    render(<ObiectivSelector />);
    fireEvent.click(screen.getByTestId('obiectiv-row-masa'));
    expect(useOnboardingStore.getState().data.goal).toBe('masa');
  });

  it('selected state reflects pressed row via aria-pressed=true', () => {
    useOnboardingStore.setState({
      data: {
        age: null,
        sex: null,
        goal: 'slabire',
        frequency: null,
        experience: null,
        weight: null,
      },
      completed: false,
      completedAt: null,
    });
    render(<ObiectivSelector />);
    expect(screen.getByTestId('obiectiv-row-slabire')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('obiectiv-row-auto')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('obiectiv-ales-slabire')).toBeInTheDocument();
  });

  it('switching pick replaces previous goal (single-select)', () => {
    render(<ObiectivSelector />);
    fireEvent.click(screen.getByTestId('obiectiv-row-forta'));
    expect(useOnboardingStore.getState().data.goal).toBe('forta');
    fireEvent.click(screen.getByTestId('obiectiv-row-longevitate'));
    expect(useOnboardingStore.getState().data.goal).toBe('longevitate');
    // Forta no longer pressed.
    expect(screen.getByTestId('obiectiv-row-forta')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('obiectiv-row-longevitate')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('ObiectivSelector — no diacritics (D-LEGACY-064)', () => {
  beforeEach(resetStore);

  it('no diacritics in rendered text', () => {
    const { container } = render(<ObiectivSelector />);
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
