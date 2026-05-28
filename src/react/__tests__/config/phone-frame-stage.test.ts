// ══ PHONE BEZEL — desktop device-frame CSS source invariants ════════════
// ANDURA PULSE (2026-05-29) — the Pulse redesign ports the mockup PhoneFrame
// (app.jsx: bezel + notch, 402x856, screen radius 42px) as a REAL desktop
// device frame, replacing the prior "stage shadow only, no physical chrome"
// approach. On desktop (>=768px):
//   1. #root becomes the device SCREEN — fixed-size (var(--device-w/h)),
//      centered, internally-scrolling (overflow-y:auto), rounded
//      (border-radius), and a containing block for fixed chrome (it has
//      transform:translateZ(0)) so BottomNav/SubHeader pin to the SCREEN.
//   2. #root draws the bezel via a layered box-shadow ring (#0a0b10 spread)
//      + outer depth + accent halo; #root::after draws the notch pill.
//   3. The legacy Luxury + Living Body desktop body radials are RETIRED.
//   4. Mobile (<768px) stays edge-to-edge (PWA invariant) — the whole bezel
//      is inside @media (min-width: 768px).
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
  // closes the #root rule (its declarations have no nested braces).
  const re = /@media \(min-width: 768px\) \{\s*html, body \{[\s\S]*?#root \{[\s\S]*?--device-w[\s\S]*?\}\s*#root::-webkit-scrollbar/;
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
    // Internal scroll so content scrolls inside the screen, chrome stays put.
    expect(block).toMatch(/overflow-y:\s*auto/);
  });

  it('establishes a containing block (transform) so fixed chrome pins to the SCREEN', () => {
    // The deliberate reversal of the 2026-05-28 removal: now #root IS the
    // device, so BottomNav/SubHeader SHOULD pin to it (not the viewport).
    const block = findRootBezelBlock();
    expect(block).toMatch(/transform:\s*translateZ\(0\)/);
  });

  it('draws the bezel ring + outer depth + accent halo via layered box-shadow', () => {
    const block = findRootBezelBlock();
    expect(block).toMatch(/box-shadow:/);
    // Dark bezel ring spread (#0a0b10) — the metal frame.
    expect(block).toMatch(/#0a0b10/);
    // Accent-tinted halo (palette-aware via --brick color-mix).
    expect(block).toMatch(/color-mix\([^)]*--brick/);
  });

  it('draws a notch pill via #root::after pinned to the screen top', () => {
    expect(globalCss).toMatch(/#root::after \{[\s\S]*?position:\s*fixed[\s\S]*?width:\s*120px[\s\S]*?\}/);
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
  it('overrides .app-fixed-column to span the screen edge-to-edge on desktop', () => {
    // #root is the containing block for the fixed chrome (it has the
    // transform), so the chrome anchors edge-to-edge across the device width
    // (left/right:0, no viewport-centering translateX).
    expect(globalCss).toMatch(
      /@media \(min-width: 768px\) \{\s*\.app-fixed-column \{[\s\S]*?left:\s*0[\s\S]*?transform:\s*none/
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
