// Phase 6 task_06 — PatternsBanner UI smoke tests.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PatternsBanner } from '../../../components/Antrenor/PatternsBanner';
import type { PatternBanner } from '../../../lib/engineWrappers';

describe('PatternsBanner — render', () => {
  it('returns null cand empty banners array', () => {
    const { container } = render(<PatternsBanner banners={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders STAGNATION banner cu severity=warn', () => {
    const banners: PatternBanner[] = [
      { id: 'STAGNATION', severity: 'warn', text: 'Stagnare 3 saptamani.' },
    ];
    render(<PatternsBanner banners={banners} />);
    const banner = screen.getByText(/Stagnare 3 saptamani/);
    expect(banner).toBeInTheDocument();
    const wrap = banner.closest('[data-pattern-id]');
    expect(wrap).toHaveAttribute('data-pattern-id', 'STAGNATION');
    expect(wrap).toHaveAttribute('data-severity', 'warn');
  });

  it('renders LOW_ADHERENCE banner cu severity=info', () => {
    const banners: PatternBanner[] = [
      { id: 'LOW_ADHERENCE', severity: 'info', text: 'Adherenta scazuta.' },
    ];
    render(<PatternsBanner banners={banners} />);
    const banner = screen.getByText(/Adherenta scazuta/);
    const wrap = banner.closest('[data-pattern-id]');
    expect(wrap).toHaveAttribute('data-pattern-id', 'LOW_ADHERENCE');
    expect(wrap).toHaveAttribute('data-severity', 'info');
  });

  it('renders both banners stacked', () => {
    const banners: PatternBanner[] = [
      { id: 'STAGNATION', severity: 'warn', text: 'Stagnare 2 saptamani.' },
      { id: 'LOW_ADHERENCE', severity: 'info', text: 'Adherenta scazuta saptamana asta.' },
    ];
    render(<PatternsBanner banners={banners} />);
    expect(screen.getByText(/Stagnare/)).toBeInTheDocument();
    expect(screen.getByText(/Adherenta/)).toBeInTheDocument();
  });

  it('container data-testid present cand non-empty', () => {
    render(<PatternsBanner banners={[
      { id: 'STAGNATION', severity: 'warn', text: 'x' },
    ]} />);
    expect(screen.getByTestId('patterns-banner')).toBeInTheDocument();
  });

  it('no diacritics in default RO copy', () => {
    const banners: PatternBanner[] = [
      { id: 'STAGNATION', severity: 'warn', text: 'Stagnare 3 saptamani. Coach ajusteaza intensitatea.' },
      { id: 'LOW_ADHERENCE', severity: 'info', text: 'Adherenta scazuta saptamana asta. Reia ritmul cu o sesiune scurta.' },
    ];
    const { container } = render(<PatternsBanner banners={banners} />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
