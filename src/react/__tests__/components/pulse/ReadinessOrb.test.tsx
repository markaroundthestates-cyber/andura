// PULSE · READINESS ORB tests — render-smoke + count-up score + label prop +
// canPR variant + motion-safety guards. Mockup parity: interfata-noua/ui.jsx
// ReadinessOrb ~116-140. Reuses real useCountUp (snaps to final in tests).

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadinessOrb } from '../../../components/pulse/ReadinessOrb';

describe('Pulse ReadinessOrb — render + props', () => {
  it('renders the orb with the inner ring', () => {
    render(<ReadinessOrb score={80} label="readiness" />);
    expect(screen.getByTestId('readiness-orb')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-ring')).toBeInTheDocument();
  });

  it('shows the score via count-up (snaps to final value in tests)', () => {
    render(<ReadinessOrb score={73} label="readiness" />);
    expect(screen.getByTestId('readiness-orb-score')).toHaveTextContent('73');
  });

  it('renders the label from the prop (no hardcoded English)', () => {
    render(<ReadinessOrb score={80} label="pregatire" />);
    expect(screen.getByTestId('readiness-orb-label')).toHaveTextContent('pregatire');
  });

  it('omits the label node when no label is passed', () => {
    render(<ReadinessOrb score={80} />);
    expect(screen.queryByTestId('readiness-orb-label')).not.toBeInTheDocument();
  });

  it('flags canPR via data attribute', () => {
    render(<ReadinessOrb score={92} label="readiness" canPR />);
    expect(screen.getByTestId('readiness-orb')).toHaveAttribute('data-can-pr', 'true');
  });

  it('defaults canPR false', () => {
    render(<ReadinessOrb score={50} label="readiness" />);
    expect(screen.getByTestId('readiness-orb')).toHaveAttribute('data-can-pr', 'false');
  });

  it('placeholder mode (score=null): em-dash, data-empty, neutral canPR — honest empty state', () => {
    // Honesty invariant (Daniel CEO LOCKED 2026-05-29): no readiness history →
    // the engine refuses a verdict, so the orb shows "—" (NOT 0, NOT a number),
    // flags data-empty, and forces neutral canPR even if canPR is passed true.
    render(<ReadinessOrb score={null} label="readiness" canPR />);
    expect(screen.getByTestId('readiness-orb-score')).toHaveTextContent('—');
    expect(screen.getByTestId('readiness-orb')).toHaveAttribute('data-empty', 'true');
    expect(screen.getByTestId('readiness-orb')).toHaveAttribute('data-can-pr', 'false');
    expect(screen.getByTestId('readiness-orb-label')).toHaveTextContent('readiness');
  });

  it('placeholder mode keeps the breathing orb-core layer (living hero stays present)', () => {
    const { container } = render(<ReadinessOrb score={null} label="readiness" />);
    expect(container.querySelector('.orb-core')).toBeInTheDocument();
  });

  it('decoration layers are aria-hidden (score/label remain readable)', () => {
    const { container } = render(<ReadinessOrb score={80} label="readiness" />);
    // Every span.orb-* layer is decorative.
    container.querySelectorAll('[class^="orb-"]').forEach((el) => {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('motion-safety: scoped style declares reduced-motion hard-stops', () => {
    const { container } = render(<ReadinessOrb score={80} label="readiness" />);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('prefers-reduced-motion: reduce');
    expect(style).toContain('max(var(--motion)');
  });
});
