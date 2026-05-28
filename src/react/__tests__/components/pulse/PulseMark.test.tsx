// PULSE · PULSE MARK tests — render-smoke + animated toggle + motion safety.
// Mockup parity: interfata-noua/screens-entry.jsx PulseMark ~5-22. Token-only
// gradient (volt/aqua), decorative (aria-hidden).

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PulseMark } from '../../../components/pulse/PulseMark';

describe('Pulse PulseMark — render + variants', () => {
  it('renders the mark + waveform path', () => {
    render(<PulseMark />);
    expect(screen.getByTestId('pulse-mark')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-mark-wave')).toBeInTheDocument();
  });

  it('SVG is decorative (aria-hidden) — wordmark text carries the brand name', () => {
    const { container } = render(<PulseMark />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('gradient stops use volt/aqua tokens (no hardcoded hex)', () => {
    const { container } = render(<PulseMark />);
    const stops = container.querySelectorAll('linearGradient stop');
    expect(stops[0]?.getAttribute('stop-color')).toBe('var(--volt)');
    expect(stops[1]?.getAttribute('stop-color')).toBe('var(--aqua)');
  });

  it('animated (default) adds the wave animation class', () => {
    render(<PulseMark />);
    expect(screen.getByTestId('pulse-mark-wave')).toHaveClass('pulse-mark-wave');
  });

  it('animated={false} renders the static mark (no wave animation class)', () => {
    render(<PulseMark animated={false} />);
    expect(screen.getByTestId('pulse-mark-wave')).not.toHaveClass('pulse-mark-wave');
  });

  it('motion-safety: scoped style declares calm + reduced-motion hard-stops', () => {
    const { container } = render(<PulseMark />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('[data-calm="1"]');
    expect(style).toContain('prefers-reduced-motion: reduce');
    expect(style).toContain('max(var(--motion)');
  });

  it('respects a custom size', () => {
    const { container } = render(<PulseMark size={96} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('96');
    expect(svg?.getAttribute('height')).toBe('96');
  });
});
