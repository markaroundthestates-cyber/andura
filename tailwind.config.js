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
  darkMode: ['selector', '[data-theme="dark"]'],
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
      },
    },
  },
  plugins: [],
};
