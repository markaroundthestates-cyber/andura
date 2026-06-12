// ══ AVATAR GLYPHS — Pulse line-art preset marks (viewBox 0 0 48 48) ════════
// Inline SVG glyphs for the illustrated preset avatar set (registry.ts). Each is
// a single accent-colored stroke in the Pulse line style (rounded caps/joins,
// 2.3-2.6 stroke), drawn on the transparent glyph layer — UserAvatar paints the
// glass pebble background + optional selection ring behind them.
//
// Style direction lifted from the concept mockup
// 04-architecture/mockups/design-pass-2026-06-12/04-avatar.html (avatarSVG):
// athletic silhouettes + abstract marks, gender-neutral, no real faces. Colors
// are the LIVE Pulse accent tokens passed in by the registry (never raw hex).
//
// All accept the accent token string and render the same viewBox so they swap
// cleanly inside UserAvatar's fixed pebble. Decorative — UserAvatar owns the
// aria-label; these are aria-hidden via the parent.

import type { JSX } from 'react';

type Accent = string;

// Shared stroke defaults for the Pulse line look.
const S = 2.4;
const cap = 'round' as const;
const join = 'round' as const;

function Svg({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element {
  return (
    <svg width="100%" height="100%" viewBox="0 0 48 48" aria-hidden="true">
      {children}
    </svg>
  );
}

// (Figure glyphs athlete/figure/runner/flex RETIRED 2026-06-12 — the founder
// illustrated set [registry ai-01..ai-16] replaces figure duty; only the
// abstract marks below remain as neutral/non-person options.)

// ── Abstract / neutral marks ─────────────────────────────────────────────────

/** Heartbeat / ECG line — vitality (Pulse signature). Mockup kind 2. */
export function glyphHeartbeat(a: Accent): JSX.Element {
  return (
    <Svg>
      <path
        d="M7 26h7l4-12 7 20 4-13 3 5h8"
        fill="none"
        stroke={a}
        strokeWidth={2.6}
        strokeLinecap={cap}
        strokeLinejoin={join}
      />
    </Svg>
  );
}

/** Target / focus ring — goal-driven. Mockup kind 3. */
export function glyphTarget(a: Accent): JSX.Element {
  return (
    <Svg>
      <circle cx="24" cy="24" r="12" fill="none" stroke={a} strokeWidth={S} />
      <circle cx="24" cy="24" r="6" fill="none" stroke={a} strokeWidth={S} />
      <circle cx="24" cy="24" r="2" fill={a} />
    </Svg>
  );
}

/** Lightning bolt — energy / power. */
export function glyphBolt(a: Accent): JSX.Element {
  return (
    <Svg>
      <path
        d="M26 7 13 27h9l-2 14 15-21h-9l3-13Z"
        fill="none"
        stroke={a}
        strokeWidth={2.5}
        strokeLinejoin={join}
      />
    </Svg>
  );
}

/** Mountain peak — progress / summit. */
export function glyphMountain(a: Accent): JSX.Element {
  return (
    <Svg>
      <path
        d="M7 37 19 16l7 11 4-6 11 16Z"
        fill="none"
        stroke={a}
        strokeWidth={2.5}
        strokeLinecap={cap}
        strokeLinejoin={join}
      />
      <path d="m17 19 3 3 3-3" fill="none" stroke={a} strokeWidth={2.5} strokeLinecap={cap} strokeLinejoin={join} />
    </Svg>
  );
}

/** Leaf / sprout — recovery, growth (gentle; reads friendly for Maria 65). */
export function glyphLeaf(a: Accent): JSX.Element {
  return (
    <Svg>
      <path
        d="M24 40V22M24 22c0-8 6-13 14-13 0 8-6 13-14 13Z"
        fill="none"
        stroke={a}
        strokeWidth={S}
        strokeLinecap={cap}
        strokeLinejoin={join}
      />
      <path d="M24 28c0-5-4-8-10-8 0 5 4 8 10 8Z" fill="none" stroke={a} strokeWidth={S} strokeLinecap={cap} strokeLinejoin={join} />
    </Svg>
  );
}

/** Orbit / rings — momentum, cycles. */
export function glyphOrbit(a: Accent): JSX.Element {
  return (
    <Svg>
      <circle cx="24" cy="24" r="4" fill={a} />
      <ellipse cx="24" cy="24" rx="16" ry="7" fill="none" stroke={a} strokeWidth={S} />
      <ellipse cx="24" cy="24" rx="16" ry="7" fill="none" stroke={a} strokeWidth={S} transform="rotate(60 24 24)" />
    </Svg>
  );
}

/** Prism / triangle stack — abstract, modern. */
export function glyphPrism(a: Accent): JSX.Element {
  return (
    <Svg>
      <path d="M24 8 40 36H8Z" fill="none" stroke={a} strokeWidth={S} strokeLinejoin={join} />
      <path d="M24 8v28M16 22h16" fill="none" stroke={a} strokeWidth={S} strokeLinecap={cap} strokeLinejoin={join} />
    </Svg>
  );
}

/** Spark / star burst — achievement, streak. Mockup kind 5 (star) evolved. */
export function glyphSpark(a: Accent): JSX.Element {
  return (
    <Svg>
      <path
        d="M24 8c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12Z"
        fill="none"
        stroke={a}
        strokeWidth={2.3}
        strokeLinejoin={join}
      />
    </Svg>
  );
}
