// ══ PULSE · RING — circular progress SVG ══════════════════════════════════
// Ported from the Pulse mockup (interfata-noua/ui.jsx Ring ~88-114). A single
// SVG progress ring: a faint full-circle track + a foreground arc whose
// stroke-dasharray fills to `pct`. The arc animates (1.1s ease) whenever pct
// changes and carries a soft drop-shadow glow.
//
// Token-only (substrate rule): the optional `gradId="pulse"` swaps the solid
// stroke for the signature volt→aqua linear gradient (--volt / --aqua). All
// colors flow through CSS var tokens — never raw hex — so every theme + the
// WCAG-tuned Pulse palette stay intact.
//
// Motion safety: the only animation is a CSS transition on stroke-dasharray,
// which the global prefers-reduced-motion block in global.css collapses to
// ~0ms (Maria 65 vestibular safety). Glow is static (no loop).
//
// A11y: the <svg> is decorative (aria-hidden) — semantics live in the
// `children` the caller centers inside (e.g. ReadinessOrb's count-up score
// owns the readable value).
//
// Usage:
//   <Ring size={150} stroke={11} pct={readiness} gradId="pulse">
//     <span className="font-display">{score}</span>
//   </Ring>

import type { CSSProperties, ReactNode, JSX } from 'react';

interface RingProps {
  /** Outer diameter in px. */
  size?: number;
  /** Stroke width in px (both track + arc). */
  stroke?: number;
  /** Progress 0-100 (clamped). */
  pct?: number;
  /** Arc color token when no gradient. Defaults to the primary accent. */
  color?: string;
  /** Track (background ring) color token. */
  track?: string;
  /** Centered overlay content (placed via CSS grid). */
  children?: ReactNode;
  /** Soft drop-shadow glow on the arc (default true). */
  glow?: boolean;
  /** Pass "pulse" to stroke the arc with the volt→aqua gradient. */
  gradId?: 'pulse';
}

// Module-scoped gradient id so multiple Rings on one screen share a single
// <defs> definition (id collisions are harmless — identical stops).
const PULSE_GRAD_ID = 'pulse-ring-grad';

export function Ring({
  size = 132,
  stroke = 10,
  pct = 0,
  color = 'var(--brick)',
  track = 'var(--line)',
  children,
  glow = true,
  gradId,
}: RingProps): JSX.Element {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, pct / 100));
  const dash = circumference * clamped;
  const useGrad = gradId === 'pulse';
  const arcColor = useGrad ? `url(#${PULSE_GRAD_ID})` : color;
  // Glow tints from the visible end of the stroke (aqua when gradient).
  const glowToken = useGrad ? 'var(--aqua)' : color;

  const arcStyle: CSSProperties = {
    transition: 'stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)',
    filter: glow
      ? `drop-shadow(0 0 6px color-mix(in oklab, ${glowToken} 55%, transparent))`
      : 'none',
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
        data-testid="pulse-ring"
      >
        {useGrad && (
          <defs>
            <linearGradient id={PULSE_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--volt)" />
              <stop offset="100%" stopColor="var(--aqua)" />
            </linearGradient>
          </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
          data-testid="pulse-ring-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={arcStyle}
          data-testid="pulse-ring-arc"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
