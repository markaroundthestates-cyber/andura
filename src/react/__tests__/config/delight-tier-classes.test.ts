// ══ DELIGHT TIER — premium polish classes CSS source invariants ══════════
// Daniel 2026-05-28: "TOP design ux" + "sa nu fie painfull sa o folosesti" +
// "sa atraga omul sa stea pe ea". Pass A6 added six opt-in utility classes
// to global.css for micro-craft signals across the app:
//   - .focus-ring-premium     (hero CTA soft halo, palette-aware)
//   - .card-hover-lift        (interactive cards, hover translate + shadow)
//   - .num-display            (tabular+lining nums, tight tracking)
//   - .press-feedback-refined (scale 0.97, 100ms — replaces 0.94 bolder)
//   - .typography-polish      (Inter ss01+ss03+cv11 alternates on h1/h2)
//   - .surface-elevated-sheen (top-down sheen for hero cards)
//   - .divider-fade           (centered-fade hairline divider)
//
// Each class is opt-in (per-component apply) so consumers can stage rollout
// without changing existing component styling.
//
// Approach: read global.css text + assert each class block contains the
// expected declaration. Same pattern as dark-palette-variant.test.ts and
// phone-frame-stage.test.ts in this dir.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const globalCss = readFileSync(
  resolve(__dirname, '../../../..', 'src/styles/global.css'),
  'utf-8'
);

function classBlock(name: string): string {
  // Match the next CSS rule whose selector starts with .{name} (allow
  // pseudo-class suffix like :focus-visible / :hover / :active).
  const re = new RegExp(`\\.${name}[^\\{]*\\{[^\\}]*\\}`, 's');
  const match = globalCss.match(re);
  if (!match) throw new Error(`Class .${name} not found in global.css`);
  return match[0];
}

describe('Delight tier — premium polish classes (opt-in)', () => {
  it('.focus-ring-premium declares a soft accent-tinted halo via box-shadow', () => {
    const block = classBlock('focus-ring-premium');
    // Two-layer halo: thin paper-bg offset ring + soft accent spread
    expect(block).toMatch(/box-shadow:/);
    expect(block).toMatch(/--paper/);
    expect(block).toMatch(/color-mix\([^)]*--brick/);
    // outline:none replaces default outline so the box-shadow halo owns focus
    expect(block).toMatch(/outline:\s*none/);
  });

  it('.card-hover-lift declares transition + hover translate + accent shadow', () => {
    const block = classBlock('card-hover-lift');
    expect(block).toMatch(/transition:/);
    expect(block).toMatch(/transform/);
    // hover:translateY(-2px) inside a (hover: hover) media block
    expect(globalCss).toMatch(
      /@media \(hover: hover\) \{\s*\.card-hover-lift:hover \{[\s\S]*?translateY\(-2px\)/
    );
    // accent-tinted hover shadow via --brick color-mix
    expect(globalCss).toMatch(
      /\.card-hover-lift:hover \{[\s\S]*?color-mix\([^)]*--brick/
    );
  });

  it('.num-display engages tabular + lining numerals via OpenType features', () => {
    const block = classBlock('num-display');
    expect(block).toMatch(/font-feature-settings:[^;]*'tnum'/);
    expect(block).toMatch(/font-feature-settings:[^;]*'lnum'/);
    expect(block).toMatch(/font-variant-numeric:\s*tabular-nums\s+lining-nums/);
    expect(block).toMatch(/letter-spacing:\s*-0\.02em/);
  });

  it('.press-feedback-refined uses scale 0.97 (premium confirm, not boop)', () => {
    const block = globalCss.match(/\.press-feedback-refined:active \{[^}]*\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/scale\(0\.97\)/);
    // 100ms transition kept under perception budget (16ms-response).
    expect(globalCss).toMatch(
      /\.press-feedback-refined \{\s*transition:\s*transform 100ms/
    );
  });

  it('.typography-polish activates Inter stylistic alternates on h1/h2', () => {
    const match = globalCss.match(
      /\.typography-polish h1,\s*\.typography-polish h2 \{[\s\S]*?\}/
    );
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/font-feature-settings:[^;]*'ss01'/);
    expect(match![0]).toMatch(/font-feature-settings:[^;]*'ss03'/);
  });

  it('.surface-elevated-sheen uses a 3-stop top-down gradient (light catches top)', () => {
    const block = classBlock('surface-elevated-sheen');
    expect(block).toMatch(/linear-gradient\(\s*180deg/);
    // Top stop slightly lighter (white 6%), bottom slightly darker (black 4%).
    // color-mix nests var(--paper-2) so we just assert the modifier appears
    // anywhere in the rule body.
    expect(block).toMatch(/white\s*6%/);
    expect(block).toMatch(/black\s*4%/);
  });

  it('.divider-fade renders a centered-fade hairline', () => {
    const block = classBlock('divider-fade');
    expect(block).toMatch(/height:\s*1px/);
    expect(block).toMatch(/linear-gradient\(\s*90deg/);
    // Edges transparent, center heavier (var(--line-strong) sits at 50%)
    expect(block).toMatch(/transparent 0%/);
    expect(block).toMatch(/var\(--line-strong\)\s*50%/);
    expect(block).toMatch(/transparent 100%/);
  });
});

describe('Delight tier — opt-in posture (no global mass-apply regression)', () => {
  it('focus-ring-premium has NO catch-all selector (only .focus-ring-premium)', () => {
    // Guard against accidental mass-apply via `:focus-visible` global rewrite.
    // The global :focus-visible (line ~301) keeps the outline-style baseline;
    // the premium ring is opt-in via class only.
    const baseFocus = globalCss.match(/:focus-visible \{[^}]*\}/);
    expect(baseFocus).not.toBeNull();
    expect(baseFocus![0]).toMatch(/outline:\s*2px solid var\(--brick\)/);
  });

  it('card-hover-lift hover effect gated by @media (hover: hover) (no touch strobe)', () => {
    // Touch devices must not strobe the hover lift on tap. The hover branch
    // sits inside a hover: hover media block so it only fires on capable input.
    expect(globalCss).toMatch(
      /@media \(hover: hover\) \{\s*\.card-hover-lift:hover/
    );
  });
});
