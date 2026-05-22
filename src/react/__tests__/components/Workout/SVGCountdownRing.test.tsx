// SVG COUNTDOWN RING TESTS - F-pass2-restoverlay-01 signature workout UX
// Mockup parity: andura-clasic.html L1517-1522.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SVGCountdownRing } from '../../../components/Workout/SVGCountdownRing';

describe('SVGCountdownRing - mockup parity L1517-1522', () => {
  it('renders 2 SVG circles (track + progress)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={120} />);
    expect(screen.getByTestId('rest-ring-track')).toBeInTheDocument();
    expect(screen.getByTestId('rest-ring-progress')).toBeInTheDocument();
  });

  it('renders centered mm:ss text 2:00 pentru remaining 120s', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={120} />);
    expect(screen.getByTestId('rest-ring-time')).toHaveTextContent('2:00');
  });

  it('renders mm:ss 1:30 pentru remaining 90s (bench-press default)', () => {
    render(<SVGCountdownRing totalSec={90} remainingSec={90} />);
    expect(screen.getByTestId('rest-ring-time')).toHaveTextContent('1:30');
  });

  it('renders mm:ss 0:05 pentru remaining 5s', () => {
    render(<SVGCountdownRing totalSec={60} remainingSec={5} />);
    expect(screen.getByTestId('rest-ring-time')).toHaveTextContent('0:05');
  });

  it('full ring at start - dashoffset 0 when remaining = total', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={120} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('stroke-dashoffset')).toBe('0');
  });

  it('half ring at midpoint - dashoffset circa circumference/2 when half remaining', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={60} />);
    const radius = 32 - 4;
    const expected = 0.5 * 2 * Math.PI * radius;
    const actual = parseFloat(screen.getByTestId('rest-ring-progress').getAttribute('stroke-dashoffset') ?? '0');
    expect(actual).toBeCloseTo(expected, 2);
  });

  it('empty ring at end - dashoffset circa circumference when remaining = 0', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={0} />);
    const radius = 32 - 4;
    const expected = 2 * Math.PI * radius;
    const actual = parseFloat(screen.getByTestId('rest-ring-progress').getAttribute('stroke-dashoffset') ?? '0');
    expect(actual).toBeCloseTo(expected, 2);
  });

  it('guards divide-by-zero - totalSec 0 produces offset 0 no NaN', () => {
    render(<SVGCountdownRing totalSec={0} remainingSec={0} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('stroke-dashoffset')).toBe('0');
  });

  it('clamps overflow - remainingSec > totalSec dashoffset stays 0', () => {
    render(<SVGCountdownRing totalSec={60} remainingSec={120} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('stroke-dashoffset')).toBe('0');
  });

  it('clamps negative - remainingSec negative dashoffset stays circumference', () => {
    render(<SVGCountdownRing totalSec={60} remainingSec={-5} />);
    const radius = 32 - 4;
    const expected = 2 * Math.PI * radius;
    const actual = parseFloat(screen.getByTestId('rest-ring-progress').getAttribute('stroke-dashoffset') ?? '0');
    expect(actual).toBeCloseTo(expected, 2);
  });

  it('uses CSS var --brick pentru progress stroke (substrate B009 NU hardcoded)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={60} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('stroke')).toBe('var(--brick)');
  });

  it('uses CSS var --overlay-soft pentru track stroke (substrate B009)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={60} />);
    expect(screen.getByTestId('rest-ring-track').getAttribute('stroke')).toBe('var(--overlay-soft)');
  });

  it('applies stroke-dashoffset transition 350ms linear (motion budget)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={60} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('style')).toContain('stroke-dashoffset 350ms linear');
  });

  it('exposes role timer + aria-label pentru a11y screen readers', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={75} />);
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-label', 'Pauza ramanere 1:15');
  });

  it('preserves data-testid rest-countdown pentru Workout.test.tsx baseline', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={90} />);
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:30');
  });

  it('respects custom diameter + strokeWidth props', () => {
    render(<SVGCountdownRing totalSec={60} remainingSec={30} diameter={100} strokeWidth={6} />);
    const progress = screen.getByTestId('rest-ring-progress');
    expect(progress.getAttribute('r')).toBe('44');
    expect(progress.getAttribute('cx')).toBe('50');
    expect(progress.getAttribute('cy')).toBe('50');
  });

  it('emits reduced-motion CSS guard pentru Maria 65 a11y', () => {
    const { container } = render(<SVGCountdownRing totalSec={120} remainingSec={60} />);
    const style = container.querySelector('style');
    expect(style?.textContent).toContain('prefers-reduced-motion: reduce');
    expect(style?.textContent).toContain('transition: none');
  });

  it('no diacritics in aria-label (D-LEGACY-064)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={75} />);
    const label = screen.getByRole('timer').getAttribute('aria-label') ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(label)).toBe(false);
  });
});
