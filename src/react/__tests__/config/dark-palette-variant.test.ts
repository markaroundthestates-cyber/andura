// ══ DARK: VARIANT — Pulse single-design-system invariant ════════════════
// ANDURA PULSE (2026-05-29) — the Pulse redesign collapsed the four named
// palettes into ONE design system (Daniel: "doar asta o sa ramana"). The two
// fixed-dark OVERRIDE palettes (Luxury + Living Body) are RETIRED: their
// [data-palette=...] token blocks + the four [data-preview-palette=...] swatch
// scopes + their body radial-glow rules are removed from global.css, and
// paletteSync.ts no longer sets <html data-palette>.
//
// This test now guards the Pulse reality:
//   1. darkMode keys ONLY on [data-theme="dark"] (the Pulse dark theme). The
//      dead [data-palette] dark: branches are gone.
//   2. global.css contains NO [data-palette=...] override or
//      [data-preview-palette=...] scope token blocks (retired).
//
// Tailwind config is not executed under vitest the same way the compiled CSS
// is, so (mirroring sw-cache-invariants.test.ts + focus-visible.test.tsx) we
// read the config + global.css as TEXT and assert the source invariants.

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
  // closing bracket of the OUTER array.
  const end = tailwindConfig.indexOf('\n  ]', start);
  return tailwindConfig.slice(start, end > -1 ? end + 4 : undefined);
})();

describe('tailwind darkMode — Pulse dark theme only', () => {
  it('uses the v3 "variant" custom-selector form (not bare "selector")', () => {
    expect(darkModeBlock).toMatch(/['"]variant['"]/);
  });

  it('keeps the data-theme=dark branch (Pulse dark default)', () => {
    expect(darkModeBlock).toMatch(/\[data-theme="dark"\]/);
  });

  it('NO longer references the retired luxury override palette', () => {
    expect(darkModeBlock).not.toMatch(/\[data-palette="luxury"\]/);
  });

  it('NO longer references the retired living-body override palette', () => {
    expect(darkModeBlock).not.toMatch(/\[data-palette="living-body"\]/);
  });

  it('the single dark: format contains "&" (required by Tailwind v3 variant mode)', () => {
    // corePlugins darkMode disables the variant (with a warn) for any format
    // missing '&'. Assert the one remaining :where() format includes it.
    const formats = darkModeBlock.match(/'&:where\([^']*\)'/g) ?? [];
    expect(formats.length).toBe(1);
    formats.forEach((f) => expect(f).toContain('&'));
  });

  it('uses :where() to keep dark: specificity at 0,1,0 (no specificity bump)', () => {
    expect(darkModeBlock).toMatch(/&:where\(\[data-theme="dark"\]/);
  });
});

describe('global.css — legacy override palettes retired', () => {
  it('contains NO [data-palette="luxury"] token block', () => {
    // A token-block selector ends with "{". The retirement note mentions the
    // names in prose, so match the actual rule-opening form only.
    expect(globalCss).not.toMatch(/\[data-palette="luxury"\]\s*\{/);
  });

  it('contains NO [data-palette="living-body"] token block', () => {
    expect(globalCss).not.toMatch(/\[data-palette="living-body"\]\s*\{/);
  });

  it('contains NO [data-preview-palette=...] swatch-scope blocks', () => {
    // Match the actual CSS rule-opening form (selector + "{"), not prose in
    // the retirement note which mentions the name. A scope block looked like
    // `[data-preview-palette="clasic"] {`.
    expect(globalCss).not.toMatch(/\[data-preview-palette="[^"]*"\]\s*\{/);
  });
});

describe('global.css — CoachTodayCard --coach-* tokens defined on BOTH Pulse themes', () => {
  // CoachTodayCard.tsx reads var(--coach-lora|meta|lagging|override, <hex>).
  // With the override palettes retired, the cream-on-dark hex fallbacks would
  // be near-invisible on Pulse LIGHT. So the four tokens are now defined on the
  // base Pulse themes (:root light + [data-theme="dark"]) so the card re-skins
  // AA on both surfaces, like every other tokenized component.
  const tokens = ['--coach-lora', '--coach-meta', '--coach-lagging', '--coach-override'];

  function themeBlock(selector: string): string {
    const start = globalCss.indexOf(`${selector} {`);
    expect(start).toBeGreaterThan(-1);
    const end = globalCss.indexOf('\n  }', start);
    return globalCss.slice(start, end > -1 ? end : undefined);
  }

  it(':root (Pulse light) defines all four --coach-* tokens', () => {
    const block = themeBlock(':root');
    tokens.forEach((t) => expect(block).toContain(`${t}:`));
  });

  it('[data-theme="dark"] (Pulse dark) defines all four --coach-* tokens', () => {
    const block = themeBlock('[data-theme="dark"]');
    tokens.forEach((t) => expect(block).toContain(`${t}:`));
  });
});
