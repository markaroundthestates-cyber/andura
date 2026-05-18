// Phase 6 task_06 — AlertsBanner UI smoke tests.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertsBanner } from '../../../components/Antrenor/AlertsBanner';
import type { ProactiveAlert } from '../../../lib/engineWrappers';

describe('AlertsBanner — render', () => {
  it('returns null cand empty alerts', () => {
    const { container } = render(<AlertsBanner alerts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders info alert cu role=status', () => {
    const alerts: ProactiveAlert[] = [
      { id: 'inactivity_0', text: 'Reia ritmul cu o sesiune scurta.', severity: 'info' },
    ];
    render(<AlertsBanner alerts={alerts} />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('data-severity', 'info');
  });

  it('renders warn alert cu role=status', () => {
    const alerts: ProactiveAlert[] = [
      { id: 'protein_0', text: 'Proteine sub target azi.', severity: 'warn' },
    ];
    render(<AlertsBanner alerts={alerts} />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('data-severity', 'warn');
  });

  it('renders urgent alert cu role=alert', () => {
    const alerts: ProactiveAlert[] = [
      { id: 'sleep_0', text: 'Somn sub 6h trei zile la rand.', severity: 'urgent' },
    ];
    render(<AlertsBanner alerts={alerts} />);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('data-severity', 'urgent');
  });

  it('renders multiple alerts stacked', () => {
    const alerts: ProactiveAlert[] = [
      { id: 'a_0', text: 'alpha', severity: 'warn' },
      { id: 'b_1', text: 'beta', severity: 'info' },
    ];
    render(<AlertsBanner alerts={alerts} />);
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('container data-testid alerts-banner', () => {
    render(<AlertsBanner alerts={[{ id: 'x_0', text: 'x', severity: 'info' }]} />);
    expect(screen.getByTestId('alerts-banner')).toBeInTheDocument();
  });

  it('no diacritics in default RO copy fed', () => {
    const alerts: ProactiveAlert[] = [
      { id: 'protein_0', text: 'Proteine sub target. Incearca un shake post-antrenament.', severity: 'warn' },
      { id: 'sleep_0', text: 'Somn putin. Coach ajusteaza intensitatea.', severity: 'info' },
    ];
    const { container } = render(<AlertsBanner alerts={alerts} />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
