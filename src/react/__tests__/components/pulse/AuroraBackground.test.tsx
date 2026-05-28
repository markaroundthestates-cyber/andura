// PULSE · AURORA BACKGROUND tests — render-smoke + layering invariants +
// motion safety. Mockup parity: interfata-noua/bg.jsx AuroraBackground.
// Decorative, non-interactive, clipped inside the desktop bezel.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuroraBackground } from '../../../components/pulse/AuroraBackground';

describe('Pulse AuroraBackground — render + layering', () => {
  it('renders the wrap + 3 blobs + depth + grain + vignette', () => {
    const { container } = render(<AuroraBackground />);
    expect(screen.getByTestId('pulse-aurora')).toBeInTheDocument();
    expect(container.querySelectorAll('.pulse-aurora-blob')).toHaveLength(3);
    expect(container.querySelector('.pulse-aurora-depth')).toBeInTheDocument();
    expect(container.querySelector('.pulse-aurora-grain')).toBeInTheDocument();
    expect(container.querySelector('.pulse-aurora-vignette')).toBeInTheDocument();
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

  it('blob colors flow through volt/aqua/ember tokens (no raw palette hex)', () => {
    const { container } = render(<AuroraBackground />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('var(--volt)');
    expect(style).toContain('var(--aqua)');
    expect(style).toContain('var(--ember)');
    // Base wrapper uses real --paper tokens (mockup --bg-grad does not exist).
    expect(style).toContain('var(--paper)');
  });

  it('light-theme variants are declared (opacity + blend-mode swaps)', () => {
    const { container } = render(<AuroraBackground />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('[data-theme="light"]');
  });

  it('motion-safety: --motion-aware durations + calm + reduced-motion hard-stops', () => {
    const { container } = render(<AuroraBackground />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('max(var(--motion)');
    expect(style).toContain('[data-calm="1"]');
    expect(style).toContain('prefers-reduced-motion: reduce');
  });
});
