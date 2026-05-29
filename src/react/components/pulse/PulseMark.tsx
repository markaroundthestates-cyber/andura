// ══ PULSE · PULSE MARK — animated brand logo ══════════════════════════════
// Ported from the Pulse mockup (interfata-noua/screens-entry.jsx PulseMark
// ~5-22). The Andura "pulse-wave" logo: a faint outer ring + a volt→aqua
// gradient ECG-style waveform stroke with a soft glow. Used on Splash + Auth.
//
// Token-only: the gradient stops + glow use --volt / --aqua tokens, never raw
// hex. Module-scoped gradient id so multiple marks share one <defs>.
//
// Motion safety: a gentle, optional draw/glow-breath loop driven by
// max(var(--motion), .3); collapsed by the global prefers-reduced-motion block
// (the authoritative motion-safety mechanism). `animated={false}` renders the
// static mark (e.g. a tiny header logo) with zero motion.
//
// A11y: purely decorative (aria-hidden); the wordmark text beside it carries
// the brand name for screen readers.
//
// Usage:
//   <PulseMark size={96} />            // animated splash hero
//   <PulseMark size={40} animated={false} />  // static header logo

import type { JSX } from 'react';

interface PulseMarkProps {
  /** Square size in px. */
  size?: number;
  /** Run the subtle waveform glow-breath loop (default true). */
  animated?: boolean;
}

const MARK_GRAD_ID = 'pulse-mark-grad';

export function PulseMark({ size = 64, animated = true }: PulseMarkProps): JSX.Element {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
      }}
      data-testid="pulse-mark"
    >
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id={MARK_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--volt)" />
            <stop offset="100%" stopColor="var(--aqua)" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke={`url(#${MARK_GRAD_ID})`}
          strokeWidth="2.5"
          opacity="0.5"
        />
        <path
          className={animated ? 'pulse-mark-wave' : undefined}
          d="M8 32 H20 L25 18 L33 46 L39 26 L43 36 H56"
          fill="none"
          stroke={`url(#${MARK_GRAD_ID})`}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter:
              'drop-shadow(0 0 6px color-mix(in oklab, var(--aqua) 60%, transparent))',
          }}
          data-testid="pulse-mark-wave"
        />
      </svg>
      <style>{`
        .pulse-mark-wave {
          stroke-dasharray: 120;
          animation: pulseMarkDraw calc(2.2s / max(var(--motion), .3)) cubic-bezier(.2,.8,.2,1) forwards,
                     pulseMarkGlow calc(3.2s / max(var(--motion), .3)) ease-in-out infinite 2.2s;
        }
        @keyframes pulseMarkDraw { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
        @keyframes pulseMarkGlow {
          0%, 100% { filter: drop-shadow(0 0 5px color-mix(in oklab, var(--aqua) 45%, transparent)); }
          50% { filter: drop-shadow(0 0 9px color-mix(in oklab, var(--volt) 65%, transparent)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-mark-wave { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
