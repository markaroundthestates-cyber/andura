// ══ PULSE DESIGN TOKENS (RN port) ════════════════════════════════════════
// Translated 1:1 from the PWA's src/styles/global.css Pulse palette. The web
// app keys every component off CSS custom props (--brick, --paper, --ink…) that
// flip between a LIGHT default (:root) and a DARK theme ([data-theme="dark"],
// the CEO-default look since 2026-05-27). RN/NativeWind has no CSS variables or
// `color-mix()` at runtime, so:
//
//   1. Both palettes are captured as static hex below (light + dark).
//   2. `color-mix(in oklab, <c> N%, transparent)` results — which are just the
//      opaque color carried at alpha N/100 — are PRE-CALCULATED to rgba() here.
//      See PRECALC_NOTES for the exact list the manager flagged.
//
// global.css cross-refs: :root L98-185 (light), [data-theme="dark"] L196-230.
// The DARK palette is the primary app look; `tailwind.config.js` wires the dark
// values as the default Tailwind colors (matching the shipped CEO default).

/** Raw Pulse accent family — theme-agnostic (global.css :root L100-101). */
export const accent = {
  volt: '#b6f23a',
  voltDeep: '#8fd218',
  aqua: '#4fd6e8',
  aquaDeep: '#2bb6cc',
  ember: '#ff7d52',
  emberDeep: '#f4571f',
  violet: '#a98bff',
  gold: '#e8c84d',
  emberRed: '#ff5d6c',
} as const;

/** PULSE DARK — primary app look (global.css [data-theme="dark"] L198-213). */
export const dark = {
  paper: '#090b13',
  paper2: '#0d101c',
  ink: '#f3f5fc',
  ink2: '#a7adc4',
  ink3: '#82889e',
  line: 'rgba(255,255,255,0.085)',
  lineStrong: '#5c6278',
  brick: '#b6f23a', // PRIMARY ACCENT — Pulse volt
  brickDark: '#ff8a6e',
  olive: '#b6f23a',
  deep: '#4fd6e8',
  aquaInk: '#4fd6e8',
  emberInk: '#ff7d52',
  onAccent: '#0a0c14',
} as const;

/** PULSE LIGHT — default :root in global.css (L116-135). */
export const light = {
  paper: '#eef0f6',
  paper2: '#ffffff',
  ink: '#12141f',
  ink2: '#565d72',
  ink3: '#5f6479',
  line: 'rgba(12,16,30,0.09)',
  lineStrong: '#787e92',
  brick: '#477006', // PRIMARY ACCENT — Pulse volt-deep (light-readable)
  brickDark: '#bd3a28',
  olive: '#557428',
  deep: '#1d6b7d',
  aquaInk: '#176577',
  emberInk: '#a83817',
  onAccent: '#0a0c14',
} as const;

// ── PRE-CALCULATED color-mix() RESULTS ──────────────────────────────────────
// `color-mix(in oklab, <color> N%, transparent)` == <color> at alpha N/100.
// Listed verbatim from the BottomNav / shell usages so the manager can audit.
export const mix = {
  // BottomNav active chip + sliding-pill wash: brick 16% over transparent.
  brick16Dark: 'rgba(182,242,58,0.16)', // dark brick #b6f23a @ .16
  brick16Light: 'rgba(71,112,6,0.16)', //  light brick #477006 @ .16
  // BottomNav active-icon glow halo: brick 55% over transparent.
  brick55Dark: 'rgba(182,242,58,0.55)',
  brick55Light: 'rgba(71,112,6,0.55)',
} as const;

// ── withAlpha(color, alpha) ─────────────────────────────────────────────────
// Runtime helper for the web's `color-mix(in oklab, <c> N%, transparent)`
// pattern where the color is dynamic (caller-supplied `color` prop on Pill /
// Ring glow / Sparkline tint) so it cannot be pre-baked in `mix` above. Mixing
// an opaque color N% with transparent == that color carried at alpha N/100, so
// we just apply the alpha. Accepts #rgb / #rrggbb / rgb()/rgba(). The oklab vs
// sRGB color space differs slightly from the browser but the perceptual result
// is visually equivalent at these accent hues (Bugatti-acceptable for tints).
export function withAlpha(color: string, alpha: number): string {
  const a = Math.min(1, Math.max(0, alpha));
  const hex = color.trim();
  if (hex.startsWith('#')) {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${a})`;
    }
  }
  const rgbMatch = hex.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch?.[1]) {
    const parts = rgbMatch[1].split(',').map((p) => p.trim());
    const [r, g, b] = parts;
    return `rgba(${r},${g},${b},${a})`;
  }
  // Unknown format — return as-is (best effort; never throw in render path).
  return color;
}

export const radius = { DEFAULT: 22, sm: 14 } as const;

export const fontFamily = {
  display: 'SpaceGrotesk', // headings — Space Grotesk Variable (web --font-display)
  body: 'Manrope', //         body text — Manrope Variable (web --font-body)
  mono: 'SpaceMono', //       labels/numerals — Space Mono (web --font-mono)
} as const;
