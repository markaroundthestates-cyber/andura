// SVG COUNTDOWN RING - Signature Workout UX (F-pass2-restoverlay-01)
// Mockup parity: andura-clasic.html L1517-1522 — two concentric circles
// (track + progress) cu stroke-dashoffset animation 350ms linear + centered
// mm:ss text overlay. Substrate B009 — CSS vars (NU hardcoded palette).
// prefers-reduced-motion: reduce → disable transition (Maria 65 a11y).

import type { JSX } from 'react';
import { formatMMSS } from '../../lib/format';

interface SVGCountdownRingProps {
  totalSec: number;
  remainingSec: number;
  diameter?: number;
  strokeWidth?: number;
}

export function SVGCountdownRing({
  totalSec,
  remainingSec,
  diameter = 64,
  strokeWidth = 4,
}: SVGCountdownRingProps): JSX.Element {
  const center = diameter / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  // Guard divide-by-zero — total 0 → no progress drained (offset 0 full ring).
  const progressRatio = totalSec > 0
    ? Math.min(1, Math.max(0, 1 - remainingSec / totalSec))
    : 0;
  const dashOffset = progressRatio * circumference;
  const mmss = formatMMSS(remainingSec);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: diameter, height: diameter }}
      data-testid="rest-countdown"
      role="timer"
      aria-label={`Pauza ramanere ${mmss}`}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        aria-hidden="true"
      >
        {/* Track ring — soft overlay token per substrate B009 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--overlay-soft)"
          strokeWidth={strokeWidth}
          data-testid="rest-ring-track"
        />
        {/* Progress ring — brick accent token (Clasic signature) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--brick)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 350ms linear' }}
          data-testid="rest-ring-progress"
        />
      </svg>
      <span
        className="absolute text-lg font-bold text-ink font-mono"
        data-testid="rest-ring-time"
      >
        {mmss}
      </span>
      {/* Reduced-motion guard — disable transition pentru Maria 65 a11y */}
      <style>{`@media (prefers-reduced-motion: reduce) {
        [data-testid="rest-ring-progress"] { transition: none !important; }
      }`}</style>
    </div>
  );
}
