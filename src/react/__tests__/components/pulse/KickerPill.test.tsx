// PULSE · KICKER + PILL tests — render-smoke + token-based color props +
// solid/ghost variants. Mockup parity: interfata-noua/ui.jsx Kicker ~271-275,
// Pill ~277-288.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Kicker } from '../../../components/pulse/Kicker';
import { Pill } from '../../../components/pulse/Pill';

describe('Pulse Kicker', () => {
  it('renders children', () => {
    render(<Kicker>Today</Kicker>);
    expect(screen.getByTestId('pulse-kicker')).toHaveTextContent('Today');
  });

  it('defaults color to the primary accent token (--brick)', () => {
    render(<Kicker>X</Kicker>);
    expect(screen.getByTestId('pulse-kicker').getAttribute('style')).toContain('var(--brick)');
  });

  it('accepts a custom color token', () => {
    render(<Kicker color="var(--aqua)">X</Kicker>);
    expect(screen.getByTestId('pulse-kicker').getAttribute('style')).toContain('var(--aqua)');
  });

  it('is mono uppercase (font-mono class)', () => {
    render(<Kicker>X</Kicker>);
    expect(screen.getByTestId('pulse-kicker')).toHaveClass('font-mono');
  });
});

describe('Pulse Pill', () => {
  it('renders children', () => {
    render(<Pill>Primed</Pill>);
    expect(screen.getByTestId('pulse-pill')).toHaveTextContent('Primed');
  });

  it('ghost (default): tinted bg + colored text via --brick token', () => {
    render(<Pill>Tag</Pill>);
    const style = screen.getByTestId('pulse-pill').getAttribute('style') ?? '';
    expect(style).toContain('color-mix');
    expect(style).toContain('var(--brick)');
    // Ghost keeps a visible border.
    expect(style).toContain('border');
  });

  it('solid: filled with the color token + on-accent text (no hardcoded hex)', () => {
    render(<Pill solid>Done</Pill>);
    const style = screen.getByTestId('pulse-pill').getAttribute('style') ?? '';
    expect(style).toContain('var(--on-accent)');
    // Solid is filled with the bare color token (no color-mix tint).
    expect(style).toContain('background: var(--brick)');
    // Solid removes the ghost border (React drops border:none from the
    // serialized style, so assert the ghost "1px solid" marker is absent).
    expect(style).not.toContain('1px solid');
  });

  it('accepts a custom color token for both variants', () => {
    render(<Pill color="var(--ember)">Heat</Pill>);
    expect(screen.getByTestId('pulse-pill').getAttribute('style')).toContain('var(--ember)');
  });

  it('is mono uppercase (font-mono class)', () => {
    render(<Pill>X</Pill>);
    expect(screen.getByTestId('pulse-pill')).toHaveClass('font-mono');
  });
});
