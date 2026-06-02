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

// ── STATUS + SURFACE tokens (PULSE DARK) ────────────────────────────────────
// The banner/alert/rest-card surfaces in the Antrenor tab key off the web's
// --status-* / --surface-* CSS vars (global.css [data-theme="dark"] L224-247).
// RN has no CSS vars, so the dark-theme values are captured statically here.
export const status = {
  dangerBg: '#2e1410',
  dangerBorder: '#5c2820',
  dangerText: '#ff9580',
  neutralBg: '#1a2030',
  neutralBorder: '#333b52',
  neutralText: '#c4cae0',
  infoBg: '#0e2030',
  infoBorder: '#1f3b52',
  infoText: '#8fd4e8',
} as const;

/** Elevated/nested glass fill (global.css [data-theme="dark"] L224-225). RN has
 *  no backdrop-filter, so the alpha is dropped to an opaque approximation that
 *  reads as the elevated surface on the dark paper. */
export const surface = {
  base: '#181d2e', //  --surface  rgba(24,29,46,0.72) → opaque
  s2: '#21273c', //    --surface-2 rgba(33,39,60,0.78) → opaque
} as const;

// ── varColor(cssVar) ────────────────────────────────────────────────────────
// The shared web components carry accent colors as CSS-var strings (e.g.
// `color="var(--aqua)"`, `style={{ color: 'var(--volt)' }}`). RN cannot read
// CSS vars, so the ported screens map those var strings to the static Pulse
// DARK hex. Single source so every Antrenor component resolves identically.
const VAR_MAP: Record<string, string> = {
  '--volt': accent.volt,
  '--volt-deep': accent.voltDeep,
  '--aqua': accent.aqua,
  '--aqua-deep': accent.aquaDeep,
  '--aqua-ink': dark.aquaInk,
  '--ember': accent.ember,
  '--ember-deep': accent.emberDeep,
  '--ember-red': accent.emberRed,
  '--ember-ink': dark.emberInk,
  '--violet': accent.violet,
  '--gold': accent.gold,
  '--brick': dark.brick,
  '--olive': dark.olive,
  '--deep': dark.deep,
  '--ink': dark.ink,
  '--ink-2': dark.ink2,
  '--ink-3': dark.ink3,
  '--on-accent': dark.onAccent,
  '--line': dark.line,
  '--line-strong': dark.lineStrong,
  '--paper': dark.paper,
  '--paper-2': dark.paper2,
  '--surface': surface.base,
  '--surface-2': surface.s2,
  '--status-neutral-text': status.neutralText,
  '--status-danger-text': status.dangerText,
};

/** Resolve a web CSS-var color string to its Pulse DARK hex. Accepts either a
 *  bare token name (`--aqua`) or the `var(--aqua)` wrapper. Returns the input
 *  unchanged when it is already a literal color (best effort; never throws). */
export function varColor(cssVar: string): string {
  const m = cssVar.match(/^var\((--[\w-]+)\)$/);
  const key = m?.[1] ?? cssVar;
  return VAR_MAP[key] ?? cssVar;
}

export const radius = { DEFAULT: 22, sm: 14 } as const;

export const fontFamily = {
  display: 'SpaceGrotesk', // headings — Space Grotesk Variable (web --font-display)
  body: 'Manrope', //         body text — Manrope Variable (web --font-body)
  mono: 'SpaceMono', //       labels/numerals — Space Mono (web --font-mono)
} as const;
