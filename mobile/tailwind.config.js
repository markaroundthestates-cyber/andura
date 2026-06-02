// Tailwind config — NativeWind v4 (Wave 2). The theme mirrors the PWA's Pulse
// token names (bg-paper, text-ink, text-brick…) so RN screens re-skin with the
// SAME class vocabulary as the web app. Default color values = the PULSE DARK
// palette (the CEO-default look since 2026-05-27); the light palette + the
// pre-calculated color-mix() rgba results live in `lib/tokens.ts` for any
// runtime theme swap. Hex sourced 1:1 from src/styles/global.css.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './lib/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Pulse DARK palette (global.css [data-theme="dark"]).
        paper: '#090b13',
        'paper-2': '#0d101c',
        ink: '#f3f5fc',
        ink2: '#a7adc4',
        ink3: '#82889e',
        line: 'rgba(255,255,255,0.085)',
        'line-strong': '#5c6278',
        brick: '#b6f23a', // PRIMARY ACCENT — Pulse volt
        'brick-dark': '#ff8a6e',
        olive: '#b6f23a',
        deep: '#4fd6e8',
        'aqua-ink': '#4fd6e8',
        'ember-ink': '#ff7d52',
        'on-accent': '#0a0c14',
        // Raw accent family (theme-agnostic).
        volt: '#b6f23a',
        aqua: '#4fd6e8',
        ember: '#ff7d52',
        violet: '#a98bff',
      },
      fontFamily: {
        display: ['SpaceGrotesk'],
        body: ['Manrope'],
        mono: ['SpaceMono'],
      },
      borderRadius: {
        DEFAULT: '22px',
        sm: '14px',
      },
    },
  },
  plugins: [],
};
