// ══ DARK: VARIANT — OVERRIDE-PALETTE COVERAGE INVARIANT ══════════════════
// Phase 7 added Luxury + Living Body as fixed-dark palettes applied via
// <html data-palette="luxury|living-body"> by paletteSync.ts (which sets ONLY
// data-palette, NOT data-theme). The Tailwind dark: variant originally keyed on
// darkMode: ['selector', '[data-theme="dark"]'] alone, so a LIGHT-mode user who
// selected a dark palette got the CSS token override (--paper -> noir) but NOT
// the dark: utilities (~29 dark: usages across 13 components) -> light styling
// painted on a dark surface (e.g. a cream ResumeSessionCard on a noir page).
//
// FIX (option B, declarative): darkMode is the Tailwind v3 'variant' array form
// so dark: fires under data-theme=dark OR data-palette=luxury OR
// data-palette=living-body. Each format contains '&' (required by corePlugins'
// darkMode validation) and uses :where() to hold specificity at 0,1,0 (parity
// with the prior 'selector' form -> no specificity regression on the mov theme).
//
// Tailwind config is not executed under vitest the same way the compiled CSS is,
// so (mirroring sw-cache-invariants.test.ts + focus-visible.test.tsx) we read the
// config + global.css as TEXT and assert the source invariants that encode the
// fix. The compiled dist/assets/*.css evidence (all three :where branches on
// .dark\:bg-paper2) is verified separately by the build step.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../../../..');
const tailwindConfig = readFileSync(resolve(root, 'tailwind.config.js'), 'utf-8');
const globalCss = readFileSync(resolve(root, 'src/styles/global.css'), 'utf-8');

// Isolate the darkMode array so assertions cannot match an unrelated mention
// of these attributes elsewhere in the config.
const darkModeBlock = (() => {
  const start = tailwindConfig.indexOf('darkMode:');
  expect(start).toBeGreaterThan(-1);
  // darkMode value is a multi-line array literal. Slice to the 2-space-indented
  // closing bracket of the OUTER array (not the ']' inside [data-theme="dark"]).
  const end = tailwindConfig.indexOf('\n  ]', start);
  return tailwindConfig.slice(start, end > -1 ? end + 4 : undefined);
})();

describe('tailwind darkMode — dark: variant covers override palettes', () => {
  it('uses the v3 "variant" custom-selector form (not bare "selector")', () => {
    // 'variant' is what lets darkMode take an ARRAY of formats (OR across them).
    expect(darkModeBlock).toMatch(/['"]variant['"]/);
  });

  it('keeps the existing data-theme=dark branch (mov default must not regress)', () => {
    expect(darkModeBlock).toMatch(/\[data-theme="dark"\]/);
  });

  it('adds the luxury override palette to the dark: variant', () => {
    expect(darkModeBlock).toMatch(/\[data-palette="luxury"\]/);
  });

  it('adds the living-body override palette to the dark: variant', () => {
    expect(darkModeBlock).toMatch(/\[data-palette="living-body"\]/);
  });

  it('every dark: format contains "&" (required by Tailwind v3 variant mode)', () => {
    // corePlugins darkMode disables the variant (with a warn) for any format
    // missing '&'. Assert all three :where() formats include it.
    const formats = darkModeBlock.match(/'&:where\([^']*\)'/g) ?? [];
    expect(formats.length).toBe(3);
    formats.forEach((f) => expect(f).toContain('&'));
  });

  it('uses :where() to keep dark: specificity at 0,1,0 (no specificity bump)', () => {
    expect(darkModeBlock).toMatch(/&:where\(\[data-theme="dark"\]/);
    expect(darkModeBlock).toMatch(/&:where\(\[data-palette="luxury"\]/);
    expect(darkModeBlock).toMatch(/&:where\(\[data-palette="living-body"\]/);
  });
});

// Isolate each override-palette token block so a --coach-* assertion is scoped
// to the correct palette (not matched against the other palette's block).
function paletteBlock(selector: string): string {
  const start = globalCss.indexOf(`[data-palette="${selector}"] {`);
  expect(start).toBeGreaterThan(-1);
  const end = globalCss.indexOf('\n  }', start);
  return globalCss.slice(start, end > -1 ? end : undefined);
}

describe('global.css — CoachTodayCard --coach-* tokens defined per override palette', () => {
  // CoachTodayCard.tsx reads var(--coach-lora|meta|lagging|override, <cream hex>).
  // Once dark: fires for these palettes the card surface is dark, so the cream
  // fallbacks must be replaced by in-palette warm values (else cream-on-noir).
  const tokens = ['--coach-lora', '--coach-meta', '--coach-lagging', '--coach-override'];

  it('luxury block defines all four --coach-* tokens', () => {
    const block = paletteBlock('luxury');
    tokens.forEach((t) => expect(block).toContain(`${t}:`));
  });

  it('living-body block defines all four --coach-* tokens', () => {
    const block = paletteBlock('living-body');
    tokens.forEach((t) => expect(block).toContain(`${t}:`));
  });
});
