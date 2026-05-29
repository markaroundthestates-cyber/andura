// ══ PULSE · SPARKLINE — weight-trend mini chart ═══════════════════════════
// Ported from the Pulse mockup (interfata-noua/ui.jsx Sparkline ~142-176).
// A compact weight-trend line over a gradient area fill, with an animated
// line-draw entrance and a glowing dot on the most recent point. Used by the
// Progres (Progress) TREND zone fed from the real weightLog.
//
// Token-only: stroke/fill/glow derive from a `color` token (default --aqua) —
// never raw hex. The area gradient id is module-scoped so several sparklines
// share one <defs>.
//
// Motion safety: the line-draw (stroke-dashoffset) + area fade are one-shot
// entrance animations; the dot has no loop. The global prefers-reduced-motion
// block collapses the entrance to instant (final state) — the authoritative
// motion-safety mechanism. No infinite loops → vestibular-safe by construction.
//
// A11y: decorative chart (aria-hidden) — the surrounding card copy (delta /
// projection numbers) carries the readable trend. Guards empty/single-point
// data so it never produces NaN paths.
//
// Usage:
//   <Sparkline data={weightLog.map(w => ({ day: w.date, kg: w.kg }))} />

import type { CSSProperties, JSX } from 'react';

interface SparklinePoint {
  /** Label for the x position (unused visually; keeps shape parity w/ store). */
  day: string;
  /** Weight value in kg. */
  kg: number;
}

interface SparklineProps {
  data: SparklinePoint[];
  /** Line + fill + glow color token. */
  color?: string;
  /** viewBox width. */
  w?: number;
  /** viewBox height. */
  h?: number;
  /** Render the gradient area fill under the line. */
  fill?: boolean;
}

const AREA_GRAD_ID = 'pulse-spark-area';

export function Sparkline({
  data,
  color = 'var(--aqua)',
  w = 300,
  h = 90,
  fill = true,
}: SparklineProps): JSX.Element | null {
  // Guard: need at least 2 points for a line. Empty → render nothing (callers
  // show their own empty state); single point would divide-by-zero on x.
  if (!data || data.length < 2) return null;

  const vals = data.map((d) => d.kg);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = 8;
  const span = max - min || 1; // flat series → avoid /0, draws a centered line
  const lastIdx = data.length - 1;

  const pts = data.map((d, i) => {
    const x = pad + (i / lastIdx) * (w - pad * 2);
    const y = pad + (1 - (d.kg - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = pts
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  // noUncheckedIndexedAccess: pts is non-empty here (length >= 2) but TS still
  // widens index access to | undefined — read the guaranteed first/last safely.
  const first = pts[0] ?? ([pad, h] as const);
  const last = pts[lastIdx] ?? ([w - pad, h] as const);
  const area = `${line} L${last[0].toFixed(1)} ${h} L${first[0].toFixed(1)} ${h} Z`;

  const lineStyle: CSSProperties = {
    filter: `drop-shadow(0 0 5px color-mix(in oklab, ${color} 55%, transparent))`,
  };

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: 'block' }}
      aria-hidden="true"
      data-testid="pulse-sparkline"
    >
      <defs>
        <linearGradient id={AREA_GRAD_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && (
        <path
          d={area}
          fill={`url(#${AREA_GRAD_ID})`}
          className="spark-area"
          data-testid="pulse-sparkline-area"
        />
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="spark-line"
        style={lineStyle}
        data-testid="pulse-sparkline-line"
      />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} data-testid="pulse-sparkline-dot" />
      <style>{`
        .spark-line {
          stroke-dasharray: 600; stroke-dashoffset: 600;
          animation: sparkDash 1.4s cubic-bezier(.2,.8,.2,1) forwards;
        }
        .spark-area { opacity: 0; animation: sparkFade 1s .5s forwards; }
        @keyframes sparkDash { to { stroke-dashoffset: 0; } }
        @keyframes sparkFade { to { opacity: 1; } }
      `}</style>
    </svg>
  );
}
