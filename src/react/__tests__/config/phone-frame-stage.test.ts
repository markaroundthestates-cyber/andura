// ══ PHONE BEZEL — desktop device-frame CSS source invariants ════════════
// ANDURA PULSE (2026-05-29) — the Pulse redesign ports the mockup PhoneFrame
// (app.jsx: bezel + notch, 402x856, screen radius 42px) as a REAL desktop
// device frame. TRANSFORM-FREE MIGRATION (2026-06-12) to the POC mechanism
// (04-architecture/mockups/design-pass-2026-06-12/03-phone-bezel.html). On
// desktop (>=768px):
//   1. #root becomes the device SCREEN — fixed-size (var(--device-w/h)),
//      centered, rounded (border-radius), overflow:hidden. It is
//      position:relative (NOT transformed) → the containing block for its
//      position:ABSOLUTE chrome, and overflow:hidden clips the absolute aurora.
//      The inner .app-scroll wrapper is the scroll surface; SubHeader (sticky)
//      sticks to it.
//   2. THE GOLDEN RULE: #root carries NO transform/filter/contain — a prior
//      transform:translateZ(0) containing-block trick was what re-broke
//      sticky/fixed historically. The chrome anchors to #root via the
//      .app-fixed-column desktop override flipping position:fixed → absolute.
//   3. #root draws the bezel via a layered box-shadow ring (#0a0b10 spread)
//      + outer depth + accent halo; #root::after draws an absolute notch pill.
//   4. The legacy Luxury + Living Body desktop body radials are RETIRED.
//   5. Mobile (<768px) stays edge-to-edge (PWA invariant) — the whole bezel
//      is inside @media (min-width: 768px), chrome stays position:fixed.
//
// Approach (mirroring dark-palette-variant.test.ts): assert the CSS source
// text contains the invariants. Compiled CSS + visual evidence is verified by
// the build / Playwright screenshot step separately.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const globalCss = readFileSync(
  resolve(__dirname, '../../../..', 'src/styles/global.css'),
  'utf-8'
);

// Find the desktop bezel block — the @media (min-width: 768px) rule that
// targets #root with the device-screen treatment (the one declaring
// --device-w). The file has other 768px blocks (body stage, html/body); we
// isolate the #root device block specifically by its --device-w marker.
function findRootBezelBlock(): string {
  // Match from the @media open through the #root rule's closing brace. The
  // #root rule contains the --device-w var. Non-greedy to the first `}` that
  // closes the #root rule (its declarations have no nested braces). The rule
  // following the #root device rule is the `#root > *` shell-fill rule (the
  // 2026-05-29 nav-freeze fix introduced an inner .app-scroll surface and moved
  // the scroll overflow off #root, so the prior #root::-webkit-scrollbar anchor
  // no longer follows #root directly).
  const re = /@media \(min-width: 768px\) \{\s*html, body \{[\s\S]*?#root \{[\s\S]*?--device-w[\s\S]*?--brick[^}]*\}/;
  const match = globalCss.match(re);
  if (!match) throw new Error('Desktop #root bezel block not found');
  return match[0];
}

describe('Phone bezel — desktop #root device screen (>=768px)', () => {
  it('declares a desktop-only @media block making #root a device screen', () => {
    const block = findRootBezelBlock();
    expect(block).toMatch(/@media \(min-width: 768px\)/);
    expect(block).toMatch(/#root \{/);
    expect(block).toMatch(/--device-w/);
  });

  it('sets explicit device dimensions (mockup 402x856 inner)', () => {
    const block = findRootBezelBlock();
    expect(block).toMatch(/--device-w:\s*402px/);
    // Height clamps to the viewport so the device + bezel always fit.
    expect(block).toMatch(/--device-h:\s*min\(856px/);
    expect(block).toMatch(/height:\s*var\(--device-h\)/);
    expect(block).toMatch(/width:\s*var\(--device-w\)/);
  });

  it('rounds the screen + clips content (overflow) like real glass', () => {
    const block = findRootBezelBlock();
    expect(block).toMatch(/border-radius:\s*var\(--screen-radius\)/);
    expect(block).toMatch(/--screen-radius:\s*42px/);
    // #root clips its rounded corners with overflow:hidden. The scroll surface
    // is the inner .app-scroll wrapper (asserted below), NOT #root — the
    // 2026-05-29 nav-freeze fix moved overflow off #root so the fixed BottomNav
    // (containing block = #root) pins to the screen instead of scrolling away.
    expect(block).toMatch(/overflow:\s*hidden/);
    // #root must NOT carry the scroll overflow anymore.
    expect(block).not.toMatch(/overflow-y:\s*auto/);
  });

  it('moves the scroll overflow onto an inner .app-scroll surface (nav-freeze fix)', () => {
    // The fixed BottomNav scrolled off the screen on desktop because #root was
    // BOTH the containing block (transform) AND the scroll container
    // (overflow-y:auto). The scroll now lives on .app-scroll inside #root.
    expect(globalCss).toMatch(
      /\.app-scroll \{[\s\S]*?overflow-y:\s*auto[\s\S]*?\}/
    );
  });

  it('GOLDEN RULE: #root device screen carries NO transform (POC mechanism)', () => {
    // The transform-free migration (2026-06-12): a prior transform:translateZ(0)
    // containing-block trick on #root was exactly the ancestor transform the
    // project memory blames for re-breaking sticky SubHeader + fixed BottomNav.
    // #root must NOT carry a transform/filter/contain — it is the containing
    // block for its ABSOLUTE chrome via position:relative alone. (The notch
    // pseudo's own translateX is a leaf, not an ancestor of the viewport, so it
    // is allowed and is asserted separately.)
    const block = findRootBezelBlock();
    expect(block).not.toMatch(/transform:/);
    expect(block).not.toMatch(/translateZ/);
    expect(block).not.toMatch(/-webkit-filter:|[^-]filter:/);
    expect(block).not.toMatch(/contain:/);
    // It IS the containing block via position:relative (so absolute chrome pins
    // to the screen and overflow:hidden clips the absolute aurora) — no
    // transform needed.
    expect(block).toMatch(/position:\s*relative/);
  });

  it('draws the bezel ring + outer depth + accent halo via layered box-shadow', () => {
    const block = findRootBezelBlock();
    expect(block).toMatch(/box-shadow:/);
    // Dark bezel ring spread (#0a0b10) — the metal frame.
    expect(block).toMatch(/#0a0b10/);
    // Accent-tinted halo (palette-aware via --brick color-mix).
    expect(block).toMatch(/color-mix\([^)]*--brick/);
  });

  it('draws a notch pill via #root::after pinned to the screen top (absolute, not fixed)', () => {
    // Absolute (not fixed): #root is transform-free, so a fixed pseudo would
    // anchor to the window. position:absolute pins it to #root (the screen).
    expect(globalCss).toMatch(/#root::after \{[\s\S]*?position:\s*absolute[\s\S]*?width:\s*120px[\s\S]*?\}/);
  });

  it('caps the mobile-frame at 430px via --app-col-w var at the base #root rule', () => {
    // The base #root rule (mobile-first) still caps the column at 430px so the
    // fixed chrome (.app-fixed-column) stays aligned there. Desktop overrides
    // --app-col-w to the device width.
    expect(globalCss).toMatch(/#root\s*\{[\s\S]*?--app-col-w:\s*430px/);
    expect(globalCss).toMatch(/#root\s*\{[\s\S]*?max-width:\s*var\(--app-col-w\)/);
  });
});

describe('Phone bezel — fixed chrome anchors to the screen (>=768px)', () => {
  it('flips .app-fixed-column to position:absolute (anchors to #root) + edge-to-edge on desktop', () => {
    // THE POC MECHANISM: the "fixed" chrome (BottomNav/SessionPill/banners/
    // Workout dock) is flipped from position:fixed (→window) to position:absolute
    // so it anchors to #root (the device screen, position:relative, transform-
    // free) instead of the browser window — "fixed becomes absolute within the
    // viewport". Edge-to-edge across the device width (left/right:0, no
    // viewport-centering translateX). This unlayered rule beats Tailwind's
    // layered `.fixed` without !important.
    expect(globalCss).toMatch(
      /@media \(min-width: 768px\) \{\s*\.app-fixed-column \{[\s\S]*?position:\s*absolute[\s\S]*?left:\s*0[\s\S]*?transform:\s*none/
    );
  });

  it('base .app-fixed-column tracks --app-col-w so BottomNav stays aligned on mobile', () => {
    // Mobile (<768px): the .app-fixed-column rule centers viewport-fixed chrome
    // at the column center using left:50%/translateX(-50%) + max-width var.
    expect(globalCss).toMatch(
      /\.app-fixed-column \{[\s\S]*?left:\s*50%[\s\S]*?max-width:\s*var\(--app-col-w/
    );
  });
});

describe('Phone bezel — body stage backdrop (>=768px)', () => {
  it('centers the device on a stage (grid place-items center)', () => {
    const block = findRootBezelBlock();
    expect(block).toMatch(/place-items:\s*center/);
  });

  it('declares a desktop-only body bg tint so the device reads vs the surround (light)', () => {
    const match = globalCss.match(
      /@media \(min-width: 768px\) \{\s*body \{[\s\S]*?background:[\s\S]*?radial-gradient[\s\S]*?\}\s*\}/
    );
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/var\(--paper\)/);
    expect(match![0]).toMatch(/background-attachment:\s*fixed/);
  });

  it('declares a desktop-only deepened radial for the Pulse dark body', () => {
    const match = globalCss.match(
      /@media \(min-width: 768px\) \{\s*\[data-theme="dark"\] body \{[\s\S]*?\}\s*\}/
    );
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/radial-gradient/);
    expect(match![0]).toMatch(/background-attachment:\s*fixed/);
  });
});

describe('Phone bezel — legacy palette desktop rules retired', () => {
  it('has NO luxury palette desktop body radial', () => {
    expect(globalCss).not.toMatch(/\[data-palette="luxury"\] body/);
  });

  it('has NO living-body palette desktop body radial', () => {
    expect(globalCss).not.toMatch(/\[data-palette="living-body"\] body/);
  });
});

describe('Phone bezel — mobile invariant (<768px)', () => {
  it('base body bg (outside @media) keeps mobile flat paper (no stage tint)', () => {
    // The base html/body rule sets bg: var(--paper) WITHOUT
    // background-attachment:fixed; the fixed bg + grid centering are only in
    // the desktop @media. Mobile gets the original flat paper edge-to-edge.
    const baseBodyMatch = globalCss.match(
      /html, body \{[\s\S]*?background:\s*var\(--paper[^)]*\)[\s\S]*?\}/
    );
    expect(baseBodyMatch).not.toBeNull();
  });
});
