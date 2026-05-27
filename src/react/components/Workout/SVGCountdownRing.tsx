// SVG COUNTDOWN RING - Signature Workout UX (F-pass2-restoverlay-01)
// Mockup parity: andura-clasic.html L1517-1522 — two concentric circles
// (track + progress) cu stroke-dashoffset animation 350ms linear + centered
// mm:ss text overlay. Substrate B009 — CSS vars (NU hardcoded palette).
// prefers-reduced-motion: reduce → disable transition (Maria 65 a11y).
//
// F-workout-09 (2026-05-22): 3-state ring color machine + last-10% pulse
// animation per audit nuclear findings-workout.md spec. Color thresholds:
//   normal   — remaining > 30% of total → var(--brick)  brick signature
//   warning  — remaining <= 30% of total → var(--warn)  amber alert
//   urgent   — remaining <= 10% of total → ring-urgent  red push
// Pulse animation activates at urgent threshold (progressRatio > 0.9).
// prefers-reduced-motion disables pulse animation (Maria 65 a11y guarantee).

import type { JSX } from 'react';
import { formatMMSS } from '../../lib/format';

// Audit-spec urgent hex (#ff4757). Component-scoped const — kept here vs
// global.css pentru localized signature usage (single-component); promote
// la vault palette dacă reused future cross-component.
const RING_URGENT_COLOR = '#ff4757';

interface SVGCountdownRingProps {
  totalSec: number;
  remainingSec: number;
  diameter?: number;
  strokeWidth?: number;
  // Tailwind class pentru culoarea textului mm:ss central. Default `text-ink`
  // (fundal deschis). RestOverlay dark card paseaza `text-paper` (alb) pentru
  // contrast pe fundalul --ink. Track + progress arc nemodificate.
  timeColorClass?: string;
}

// Pure-function color state — exported pentru test fixture independent. Returns
// CSS var ref (normal/warning) sau hex literal (urgent). progressRatio in
// [0,1] = elapsed fraction (0 full ring at start, 1 empty ring at end).
export function getRingColor(progressRatio: number): string {
  if (progressRatio >= 0.9) return RING_URGENT_COLOR;
  if (progressRatio >= 0.7) return 'var(--warn)';
  return 'var(--brick)';
}

export function SVGCountdownRing({
  totalSec,
  remainingSec,
  diameter = 64,
  strokeWidth = 4,
  timeColorClass = 'text-ink',
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
  // F-workout-09 — derive ring color state per progressRatio + pulse flag
  // (last 10%). Pulse triggers CSS keyframe `pulse-urgent` defined in scoped
  // <style> block below.
  const ringColor = getRingColor(progressRatio);
  const isUrgent = progressRatio >= 0.9;

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
        {/* Progress ring — F-workout-09 color state machine + urgent pulse.
            Stroke color advances brick→warn→urgent across thresholds. */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: 'stroke-dashoffset 350ms linear, stroke 250ms ease-out',
            animation: isUrgent ? 'pulse-urgent 700ms ease-in-out infinite' : 'none',
          }}
          data-testid="rest-ring-progress"
          data-ring-state={isUrgent ? 'urgent' : progressRatio >= 0.7 ? 'warning' : 'normal'}
        />
      </svg>
      <span
        className={`absolute text-lg font-bold ${timeColorClass} font-mono`}
        data-testid="rest-ring-time"
      >
        {mmss}
      </span>
      {/* Reduced-motion guard — disable transition + pulse animation pentru
          Maria 65 a11y (prefers-reduced-motion: reduce). Pulse keyframe
          defined here scoped la component pentru localized signature usage. */}
      <style>{`
        @keyframes pulse-urgent {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="rest-ring-progress"] {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
