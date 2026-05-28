// PULSE · RING tests — render-smoke + progress geometry + gradient variant.
// Mockup parity: interfata-noua/ui.jsx Ring ~88-114. Token-only (no hardcoded
// hex). Decorative SVG (aria-hidden).

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Ring } from '../../../components/pulse/Ring';

describe('Pulse Ring — render + geometry', () => {
  it('renders track + arc circles', () => {
    render(<Ring pct={50} />);
    expect(screen.getByTestId('pulse-ring')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-ring-track')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-ring-arc')).toBeInTheDocument();
  });

  it('SVG is decorative (aria-hidden)', () => {
    render(<Ring pct={50} />);
    expect(screen.getByTestId('pulse-ring')).toHaveAttribute('aria-hidden', 'true');
  });

  it('arc dash length tracks pct (50% → half the circumference)', () => {
    const size = 132;
    const stroke = 10;
    render(<Ring size={size} stroke={stroke} pct={50} />);
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dashAttr = screen.getByTestId('pulse-ring-arc').getAttribute('stroke-dasharray') ?? '';
    const dash = parseFloat(dashAttr.split(' ')[0] ?? '0');
    expect(dash).toBeCloseTo(circ * 0.5, 1);
  });

  it('clamps pct over 100 (full ring, no overflow)', () => {
    const size = 132;
    const stroke = 10;
    render(<Ring size={size} stroke={stroke} pct={150} />);
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dashAttr = screen.getByTestId('pulse-ring-arc').getAttribute('stroke-dasharray') ?? '';
    const dash = parseFloat(dashAttr.split(' ')[0] ?? '0');
    expect(dash).toBeCloseTo(circ, 1);
  });

  it('clamps negative pct to 0 (empty arc)', () => {
    render(<Ring pct={-20} />);
    const dashAttr = screen.getByTestId('pulse-ring-arc').getAttribute('stroke-dasharray') ?? '';
    const dash = parseFloat(dashAttr.split(' ')[0] ?? '0');
    expect(dash).toBeCloseTo(0, 1);
  });

  it('default stroke uses --brick token (no hardcoded hex)', () => {
    render(<Ring pct={50} />);
    expect(screen.getByTestId('pulse-ring-arc').getAttribute('stroke')).toBe('var(--brick)');
  });

  it('gradId="pulse" strokes the arc with the gradient url + emits a linearGradient', () => {
    const { container } = render(<Ring pct={50} gradId="pulse" />);
    expect(screen.getByTestId('pulse-ring-arc').getAttribute('stroke')).toContain('url(#');
    expect(container.querySelector('linearGradient')).toBeInTheDocument();
    // Gradient stops use the volt/aqua tokens.
    const stops = container.querySelectorAll('linearGradient stop');
    expect(stops[0]?.getAttribute('stop-color')).toBe('var(--volt)');
    expect(stops[1]?.getAttribute('stop-color')).toBe('var(--aqua)');
  });

  it('renders centered children', () => {
    render(<Ring pct={50}><span data-testid="ring-child">42</span></Ring>);
    expect(screen.getByTestId('ring-child')).toHaveTextContent('42');
  });

  it('glow=false drops the drop-shadow filter', () => {
    render(<Ring pct={50} glow={false} />);
    const style = screen.getByTestId('pulse-ring-arc').getAttribute('style') ?? '';
    expect(style).toContain('filter: none');
  });
});
