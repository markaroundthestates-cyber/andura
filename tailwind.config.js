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
  // dark: variant fires under the mov dark theme ([data-theme="dark"]) AND under
  // the two OVERRIDE palettes (Luxury + Living Body), which are fixed-dark designs
  // applied via <html data-palette> by paletteSync.ts WITHOUT setting data-theme.
  // Without the palette selectors here, a LIGHT-mode user selecting a dark palette
  // got the CSS token override (--paper -> noir etc.) but NOT the dark: utilities
  // (~29 dark: usages across 13 components) -> light styling on a dark surface.
  // Tailwind v3 'variant' array form: each format MUST contain '&' (validated in
  // corePlugins darkMode), addVariant emits the utility under EACH selector (OR).
  // :where() keeps specificity at 0,1,0 (parity with the prior 'selector' form).
  darkMode: [
    'variant',
    [
      '&:where([data-theme="dark"], [data-theme="dark"] *)',
      '&:where([data-palette="luxury"], [data-palette="luxury"] *)',
      '&:where([data-palette="living-body"], [data-palette="living-body"] *)',
    ],
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
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
