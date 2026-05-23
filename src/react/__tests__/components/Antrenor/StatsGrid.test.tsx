// §MED-CODE-23 — StatsGrid streak/zile plural via pluralRo helper.
// Romanian paucal forms: 1 zi / 2-19 zile / 20+ de zile / 0 zile.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from '../../../components/Antrenor/StatsGrid';

describe('StatsGrid — Romanian streak/zile plural (pluralRo helper reuse)', () => {
  it('streak=1 → label "zi" (singular)', () => {
    render(<StatsGrid streak={1} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak')).toHaveTextContent('1');
    expect(screen.getByTestId('stats-streak-label')).toHaveTextContent('zi');
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('zi');
  });

  it('streak=2 → label "zile" (small plural, no "de")', () => {
    render(<StatsGrid streak={2} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('zile');
  });

  it('streak=5 → label "zile" (small plural)', () => {
    render(<StatsGrid streak={5} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('zile');
  });

  it('streak=19 → label "zile" (boundary upper small plural)', () => {
    render(<StatsGrid streak={19} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('zile');
  });

  it('streak=20 → label "de zile" (boundary lower 20+ paucal)', () => {
    render(<StatsGrid streak={20} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('de zile');
  });

  it('streak=100 → label "de zile" (20+ paucal)', () => {
    render(<StatsGrid streak={100} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('de zile');
  });

  it('streak=365 → label "de zile" (large 20+ paucal)', () => {
    render(<StatsGrid streak={365} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('de zile');
  });

  it('streak=0 → label "zile" (UX preferred over "de zile")', () => {
    render(<StatsGrid streak={0} fatigue={null} readiness={null} />);
    expect(screen.getByTestId('stats-streak-label').textContent).toBe('zile');
  });

  it('no diacritics in streak label', () => {
    const { container } = render(<StatsGrid streak={25} fatigue={null} readiness={null} />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
