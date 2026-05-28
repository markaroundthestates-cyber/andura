/** @type {import('tailwindcss').Config} */
// §1-C3 audit fix: colors migrated to CSS var() refs (single source of truth
// global.css :root). Adds missing tokens ink3 + lineStrong from WCAG v4 audit.
// §1-H2 audit prep: exclude src/_legacy-vanilla/** from content scan when
// legacy migration lands. (Currently src/pages/* still scanned — exclusion
// pattern preserved for forward-compat.)
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '!./src/_legacy-vanilla/**',
  ],
  // dark: variant fires under the Pulse dark theme ([data-theme="dark"]).
  // ANDURA PULSE (2026-05-29) — the two OVERRIDE palettes (Luxury + Living
  // Body) are RETIRED, so the prior [data-palette=...] dark: branches are
  // dropped (they would never match — paletteSync no longer sets data-palette).
  // Tailwind v3 'variant' array form kept (each format MUST contain '&',
  // validated in corePlugins darkMode); :where() keeps specificity at 0,1,0
  // (parity with the prior 'selector' form, no specificity regression).
  darkMode: [
    'variant',
    ['&:where([data-theme="dark"], [data-theme="dark"] *)'],
  ],
  theme: {
    extend: {
      // Andura Pulse fonts (2026-05-29) — self-hosted @fontsource (CSP-safe,
      // declared @font-face in src/styles/global.css). sans→Manrope (body),
      // display→Space Grotesk (headings/numerals), mono→Space Mono (labels).
      // Inter retained as system fallback. serif→Lora kept for the Splash
      // tagline pairing (italic coach-quote, intentionally distinct).
      fontFamily: {
        sans: ['Manrope Variable', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk Variable', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: 'var(--paper)',
        paper2: 'var(--paper-2)',
        ink: 'var(--ink)',
        ink2: 'var(--ink-2)',
        ink3: 'var(--ink-3)',
        line: 'var(--line)',
        lineStrong: 'var(--line-strong)',
        brick: 'var(--brick)',
        brickdark: 'var(--brick-dark)',
        olive: 'var(--olive)',
        deep: 'var(--deep)',
        succ: 'var(--succ)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        overlayStrong: 'var(--overlay-strong)',
        overlaySoft: 'var(--overlay-soft)',
        // F-istoric-01 + F-istoric-03 signature feature tokens
        heatUsor: 'var(--heat-usor)',
        heatUsorText: 'var(--heat-usor-text)',
        heatNormal: 'var(--heat-normal)',
        heatGreu: 'var(--heat-greu)',
        heatRecovery: 'var(--heat-recovery)',
        heatRecoveryBorder: 'var(--heat-recovery-border)',
        ratingUsor: 'var(--rating-usor)',
      },
    },
  },
  plugins: [],
};
