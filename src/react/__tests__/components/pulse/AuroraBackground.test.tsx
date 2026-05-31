// PULSE · AURORA BACKGROUND (TURBO) tests — render-smoke + layering invariants +
// motion safety. The Turbo backdrop: 5 vivid blobs + 2 conic beam sets + grid +
// scan bar + flash + corona, under a readability scrim. Decorative,
// non-interactive, clipped inside the desktop bezel.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuroraBackground } from '../../../components/pulse/AuroraBackground';

describe('Pulse AuroraBackground — render + layering', () => {
  it('renders the turbo wrap + 5 blobs + 2 beam sets + grid + scan + flash + corona + scrim', () => {
    const { container } = render(<AuroraBackground />);
    expect(screen.getByTestId('pulse-aurora')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-aurora')).toHaveClass('pulse-aurora-wrap', 'turbo');
    expect(container.querySelectorAll('.t-blob')).toHaveLength(5);
    expect(container.querySelectorAll('.t-beams')).toHaveLength(2);
    expect(container.querySelector('.t-grid')).toBeInTheDocument();
    expect(container.querySelector('.t-scan')).toBeInTheDocument();
    expect(container.querySelector('.t-flash')).toBeInTheDocument();
    expect(container.querySelector('.t-corona')).toBeInTheDocument();
    expect(container.querySelector('.t-scrim')).toBeInTheDocument();
    expect(container.querySelector('.t-vignette')).toBeInTheDocument();
  });

  it('is decorative (aria-hidden) so it is invisible to assistive tech', () => {
    render(<AuroraBackground />);
    expect(screen.getByTestId('pulse-aurora')).toHaveAttribute('aria-hidden', 'true');
  });

  it('layering: absolute inset-0, z-index 0, pointer-events none (no hit-target interference)', () => {
    const { container } = render(<AuroraBackground />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('position: absolute');
    expect(style).toContain('inset: 0');
    expect(style).toContain('z-index: 0');
    expect(style).toContain('pointer-events: none');
    expect(style).toContain('overflow: hidden');
  });

  it('layer colors flow through volt/aqua/ember/violet tokens (no raw palette hex)', () => {
    const { container } = render(<AuroraBackground />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('var(--volt)');
    expect(style).toContain('var(--aqua)');
    expect(style).toContain('var(--ember)');
    expect(style).toContain('var(--violet)');
    // Base wrapper uses real --paper tokens (mockup --bg-grad does not exist).
    expect(style).toContain('var(--paper)');
  });

  it('light-theme variants are declared (opacity + blend-mode swaps)', () => {
    const { container } = render(<AuroraBackground />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('[data-theme="light"]');
  });

  it('motion-safety: --motion-aware durations + reduced-motion hard-stops', () => {
    const { container } = render(<AuroraBackground />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('max(var(--motion)');
    expect(style).toContain('prefers-reduced-motion: reduce');
  });
});
