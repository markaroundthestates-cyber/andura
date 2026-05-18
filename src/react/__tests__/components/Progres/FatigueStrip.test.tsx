// Phase 6 task_22 — FatigueStrip Progres dashboard tests.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../lib/engineWrappers', () => ({
  getFatigue: vi.fn(() => null),
}));

import { FatigueStrip } from '../../../components/Progres/FatigueStrip';
import { getFatigue } from '../../../lib/engineWrappers';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFatigue).mockReturnValue(null);
});

describe('FatigueStrip', () => {
  it('renders heading "Oboseala azi"', () => {
    render(<FatigueStrip />);
    expect(screen.getByText(/Oboseala azi/i)).toBeInTheDocument();
  });

  it('renders empty state cand getFatigue null', () => {
    render(<FatigueStrip />);
    expect(screen.getByTestId('fatigue-empty')).toBeInTheDocument();
  });

  it('renders score + label cand fatigue present', () => {
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 45,
      key: 'MODERATE_FATIGUE',
      label: 'Pas mai conservator',
      icon: '',
      color: '',
      recommend: 'reduce',
      detail: 'Astazi mentinem greutatile.',
    });
    render(<FatigueStrip />);
    expect(screen.getByText(/45\/100/)).toBeInTheDocument();
    expect(screen.getByText(/Pas mai conservator/)).toBeInTheDocument();
  });

  it('renders detail cand fatigue.detail prezent', () => {
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 30,
      key: 'MODERATE_FATIGUE',
      label: 'Bun',
      icon: '',
      color: '',
      recommend: 'normal',
      detail: 'Sesiune fluenta azi.',
    });
    render(<FatigueStrip />);
    expect(screen.getByTestId('fatigue-detail').textContent).toMatch(/Sesiune fluenta/);
  });

  it('container data-testid present', () => {
    render(<FatigueStrip />);
    expect(screen.getByTestId('fatigue-strip')).toBeInTheDocument();
  });

  it('no diacritics in UI', () => {
    const { container } = render(<FatigueStrip />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
