// SVG COUNTDOWN RING TESTS - F-pass2-restoverlay-01 signature workout UX
// Mockup parity: andura-clasic.html L1517-1522.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SVGCountdownRing, getRingColor } from '../../../components/Workout/SVGCountdownRing';

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

  it('uses CSS var --brick pentru progress stroke pe normal state (substrate B009)', () => {
    // remainingSec=120 of total=120 → progressRatio=0 → normal state → --brick.
    render(<SVGCountdownRing totalSec={120} remainingSec={120} />);
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
});

describe('SVGCountdownRing - F-workout-09 color states + last-10% pulse', () => {
  // getRingColor pure-function thresholds — independent test fixture.
  it('getRingColor returns --brick pe normal state (progressRatio < 0.7)', () => {
    expect(getRingColor(0)).toBe('var(--brick)');
    expect(getRingColor(0.5)).toBe('var(--brick)');
    expect(getRingColor(0.69)).toBe('var(--brick)');
  });

  it('getRingColor returns --warn pe warning state (0.7 <= progressRatio < 0.9)', () => {
    expect(getRingColor(0.7)).toBe('var(--warn)');
    expect(getRingColor(0.8)).toBe('var(--warn)');
    expect(getRingColor(0.89)).toBe('var(--warn)');
  });

  it('getRingColor returns the urgent TOKEN pe last-10% (progressRatio >= 0.9)', () => {
    // Tokenized 2026-06-11 (design-pass follow-up): the urgent red is the Pulse
    // palette's --ember-red, not a component-local hex — the contract asserted
    // here moves WITH the token (one urgency red, one source).
    expect(getRingColor(0.9)).toBe('var(--ember-red)');
    expect(getRingColor(0.95)).toBe('var(--ember-red)');
    expect(getRingColor(1)).toBe('var(--ember-red)');
  });

  it('ring stroke is --brick at start (full ring, progressRatio 0)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={120} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('stroke')).toBe('var(--brick)');
    expect(screen.getByTestId('rest-ring-progress').getAttribute('data-ring-state')).toBe('normal');
  });

  it('ring stroke transitions la --warn cand remaining drops sub 30% (progressRatio >= 0.7)', () => {
    // totalSec=120, remainingSec=30 → progressRatio = 1 - 30/120 = 0.75 → warning.
    render(<SVGCountdownRing totalSec={120} remainingSec={30} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('stroke')).toBe('var(--warn)');
    expect(screen.getByTestId('rest-ring-progress').getAttribute('data-ring-state')).toBe('warning');
  });

  it('ring stroke transitions la urgent red cand remaining drops sub 10% (progressRatio >= 0.9)', () => {
    // totalSec=120, remainingSec=10 → progressRatio = 1 - 10/120 ≈ 0.917 → urgent.
    render(<SVGCountdownRing totalSec={120} remainingSec={10} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('stroke')).toBe('var(--ember-red)');
    expect(screen.getByTestId('rest-ring-progress').getAttribute('data-ring-state')).toBe('urgent');
  });

  it('pulse animation activates pe urgent state (last 10%)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={5} />);
    const styleAttr = screen.getByTestId('rest-ring-progress').getAttribute('style') ?? '';
    expect(styleAttr).toContain('pulse-urgent');
  });

  it('pulse animation absent pe normal state', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={120} />);
    const styleAttr = screen.getByTestId('rest-ring-progress').getAttribute('style') ?? '';
    // Animation literal 'none' set when not urgent.
    expect(styleAttr).toContain('animation: none');
    expect(styleAttr).not.toContain('pulse-urgent');
  });

  it('pulse animation absent pe warning state (0.7 <= progressRatio < 0.9)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={30} />);
    const styleAttr = screen.getByTestId('rest-ring-progress').getAttribute('style') ?? '';
    expect(styleAttr).not.toContain('pulse-urgent');
  });

  it('pulse keyframe definition present in scoped style', () => {
    const { container } = render(<SVGCountdownRing totalSec={120} remainingSec={5} />);
    const style = container.querySelector('style');
    expect(style?.textContent).toContain('@keyframes pulse-urgent');
  });

  it('stroke color transition declared (smooth state change 250ms)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={30} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('style')).toContain('stroke 250ms ease-out');
  });

  it('reduced-motion guard disables both transition AND pulse animation', () => {
    const { container } = render(<SVGCountdownRing totalSec={120} remainingSec={5} />);
    const style = container.querySelector('style');
    expect(style?.textContent).toContain('prefers-reduced-motion: reduce');
    expect(style?.textContent).toContain('transition: none');
    expect(style?.textContent).toContain('animation: none');
  });

  it('threshold boundary — exactly 30% remaining (progressRatio = 0.7) → warning', () => {
    // totalSec=100, remainingSec=30 → progressRatio = 0.7 exact → warning bucket.
    render(<SVGCountdownRing totalSec={100} remainingSec={30} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('data-ring-state')).toBe('warning');
  });

  it('threshold boundary — exactly 10% remaining (progressRatio = 0.9) → urgent', () => {
    // totalSec=100, remainingSec=10 → progressRatio = 0.9 exact → urgent bucket.
    render(<SVGCountdownRing totalSec={100} remainingSec={10} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('data-ring-state')).toBe('urgent');
  });

  it('threshold boundary — 31% remaining stays normal (not warning)', () => {
    // totalSec=100, remainingSec=31 → progressRatio = 0.69 < 0.7 → normal.
    render(<SVGCountdownRing totalSec={100} remainingSec={31} />);
    expect(screen.getByTestId('rest-ring-progress').getAttribute('data-ring-state')).toBe('normal');
  });

  it('rest-ring-track stroke stays --overlay-soft regardless of state (track invariant)', () => {
    render(<SVGCountdownRing totalSec={120} remainingSec={5} />);
    expect(screen.getByTestId('rest-ring-track').getAttribute('stroke')).toBe('var(--overlay-soft)');
  });
});

describe('SVGCountdownRing - mockup parity baseline preserved', () => {
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
