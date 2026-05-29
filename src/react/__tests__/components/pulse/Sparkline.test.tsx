// PULSE · SPARKLINE tests — render-smoke + path geometry + guards + motion.
// Mockup parity: interfata-noua/ui.jsx Sparkline ~142-176. Token-only color,
// decorative (aria-hidden).

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkline } from '../../../components/pulse/Sparkline';

const DATA = [
  { day: 'Mon', kg: 80 },
  { day: 'Tue', kg: 79.5 },
  { day: 'Wed', kg: 79 },
  { day: 'Thu', kg: 78.4 },
];

describe('Pulse Sparkline — render + geometry', () => {
  it('renders line, area, and last-point dot', () => {
    render(<Sparkline data={DATA} />);
    expect(screen.getByTestId('pulse-sparkline')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-sparkline-line')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-sparkline-area')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-sparkline-dot')).toBeInTheDocument();
  });

  it('SVG is decorative (aria-hidden)', () => {
    render(<Sparkline data={DATA} />);
    expect(screen.getByTestId('pulse-sparkline')).toHaveAttribute('aria-hidden', 'true');
  });

  it('line path starts with a move command and contains line segments', () => {
    render(<Sparkline data={DATA} />);
    const d = screen.getByTestId('pulse-sparkline-line').getAttribute('d') ?? '';
    expect(d.startsWith('M')).toBe(true);
    expect(d).toContain('L');
  });

  it('produces no NaN in the path (valid numeric geometry)', () => {
    render(<Sparkline data={DATA} />);
    const d = screen.getByTestId('pulse-sparkline-line').getAttribute('d') ?? '';
    expect(d).not.toContain('NaN');
  });

  it('fill=false omits the area path', () => {
    render(<Sparkline data={DATA} fill={false} />);
    expect(screen.queryByTestId('pulse-sparkline-area')).not.toBeInTheDocument();
    expect(screen.getByTestId('pulse-sparkline-line')).toBeInTheDocument();
  });

  it('uses the color token for the stroke (default --aqua, no hardcoded hex)', () => {
    render(<Sparkline data={DATA} />);
    expect(screen.getByTestId('pulse-sparkline-line').getAttribute('stroke')).toBe('var(--aqua)');
  });

  it('accepts a custom color token', () => {
    render(<Sparkline data={DATA} color="var(--ember)" />);
    expect(screen.getByTestId('pulse-sparkline-line').getAttribute('stroke')).toBe('var(--ember)');
  });

  it('renders nothing for fewer than 2 points (empty/single guard)', () => {
    const { container: c0 } = render(<Sparkline data={[]} />);
    expect(c0.querySelector('[data-testid="pulse-sparkline"]')).toBeNull();
    const { container: c1 } = render(<Sparkline data={[{ day: 'Mon', kg: 80 }]} />);
    expect(c1.querySelector('[data-testid="pulse-sparkline"]')).toBeNull();
  });

  it('flat series (all equal) still produces a valid path (no divide-by-zero)', () => {
    const flat = [
      { day: 'a', kg: 80 },
      { day: 'b', kg: 80 },
      { day: 'c', kg: 80 },
    ];
    render(<Sparkline data={flat} />);
    const d = screen.getByTestId('pulse-sparkline-line').getAttribute('d') ?? '';
    expect(d).not.toContain('NaN');
  });

  it('motion-safety: entrance draw is a one-shot (forwards) — vestibular-safe', () => {
    const { container } = render(<Sparkline data={DATA} />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('sparkDash 1.4s');
    expect(style).toContain('forwards');
  });
});
