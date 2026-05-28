// ══ PHONE-FRAME STAGE — desktop framing CSS source invariants ════════════
// Daniel 2026-05-28 verbatim: "in browser vreau sa o faci mai mica nu cat tot
// ecranul" + "vreau sa iasa TOP design ux, si sa nu fie painfull sa o folosesti.
// Sa atraga omul sa stea pe ea".
//
// The desktop phone-frame stage (≥768px) requires three coordinated invariants:
//   1. #root already has max-width:430px (mobile-frame). On desktop it MUST
//      ALSO have an explicit paper bg + a layered luxury shadow + an accent
//      ring so the column reads as "device floating above stage" not "flush
//      against page".
//   2. body bg on desktop MUST tint OFF the column bg so the surround reads
//      as a separate stage (otherwise body=paper=column=paper -> visually
//      flush on light Clasic). Dark themes already have a body radial; we
//      deepen it on desktop for richer perimeter contrast.
//   3. Mobile (<768px) MUST stay edge-to-edge (PWA invariant — zero phone
//      frame visible). The @media min-width:768px wrap is the guard.
//
// Approach (mirroring dark-palette-variant.test.ts): assert the CSS source
// text contains the invariants. Compiled CSS evidence is verified by the
// build/Playwright step separately.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const globalCss = readFileSync(
  resolve(__dirname, '../../../..', 'src/styles/global.css'),
  'utf-8'
);

// Find the desktop phone-frame block — the first @media (min-width: 768px)
// rule that targets #root. The file may contain other 768px media blocks
// for body bg (separate block); we isolate the #root one specifically.
function findRootDesktopBlock(): string {
  const rootMediaRegex =
    /@media \(min-width: 768px\) \{\s*#root \{[\s\S]*?\}\s*\}/;
  const match = globalCss.match(rootMediaRegex);
  if (!match) throw new Error('Desktop #root @media block not found');
  return match[0];
}

function findBodyDesktopLightBlock(): string {
  // The light Clasic body stage rule sits after #root desktop, before the
  // dark-theme override block. Match the @media containing `body {` (not
  // `[data-theme="dark"] body`) — first body-only rule.
  const lightBodyRegex =
    /@media \(min-width: 768px\) \{\s*body \{[\s\S]*?\}\s*\}/;
  const match = globalCss.match(lightBodyRegex);
  if (!match) throw new Error('Desktop body (light) @media block not found');
  return match[0];
}

describe('Phone-frame stage — desktop #root chrome (≥768px)', () => {
  it('declares a desktop-only @media block targeting #root', () => {
    const block = findRootDesktopBlock();
    expect(block).toMatch(/@media \(min-width: 768px\)/);
    expect(block).toMatch(/#root \{/);
  });

  it('sets an explicit paper bg so column separates from body stage tint', () => {
    const block = findRootDesktopBlock();
    expect(block).toMatch(/background:\s*var\(--paper\)/);
  });

  it('applies a layered box-shadow with three luxury layers', () => {
    const block = findRootDesktopBlock();
    // Hairline ring (palette-aware via --line-strong color-mix)
    expect(block).toMatch(/color-mix\([^)]*--line-strong/);
    // Ambient depth shadow (deep neutral, black-based)
    expect(block).toMatch(/color-mix\([^)]*black/);
    // Accent-tinted halo (palette-aware via --brick color-mix)
    expect(block).toMatch(/color-mix\([^)]*--brick/);
  });

  it('keeps the mobile-frame max-width:430px declared at the base #root rule', () => {
    // Base #root rule (outside @media) must still cap at 430px so mobile
    // viewport sees the natural mobile column without desktop chrome.
    expect(globalCss).toMatch(/#root\s*\{[\s\S]*?max-width:\s*430px/);
  });

  it('does NOT introduce border-radius on #root (would clip sticky SubHeader)', () => {
    // We deliberately avoided rounded corners on #root because SubHeader
    // sticks to viewport-top inside #root — rounded corners would create a
    // visual gap. The luxury read comes from shadow + ring only.
    const block = findRootDesktopBlock();
    expect(block).not.toMatch(/border-radius/);
  });

  it('does NOT introduce overflow:hidden on #root (would clip fixed chrome)', () => {
    // overflow:hidden could affect position:fixed descendants in some legacy
    // browser quirks and would clip any pop-out shadow effects. Keep flat.
    const block = findRootDesktopBlock();
    expect(block).not.toMatch(/overflow:\s*hidden/);
  });
});

describe('Phone-frame stage — body stage tint (≥768px, light Clasic)', () => {
  it('declares a desktop-only body bg tint so the column reads vs surround', () => {
    const block = findBodyDesktopLightBlock();
    expect(block).toMatch(/background:/);
    // Uses a radial-gradient with paper-derived stops (color-mix on --paper)
    expect(block).toMatch(/radial-gradient/);
    // --paper appears as the base color inside the color-mix() — match anywhere
    // in the rule body (var(--paper) reference, not as a regex-only token).
    expect(block).toMatch(/var\(--paper\)/);
  });

  it('uses background-attachment:fixed so stage stays anchored on scroll', () => {
    const block = findBodyDesktopLightBlock();
    expect(block).toMatch(/background-attachment:\s*fixed/);
  });
});

describe('Phone-frame stage — dark themes desktop deepening (≥768px)', () => {
  it('declares a desktop-only deepened radial for data-theme=dark body', () => {
    // Match the @media block that includes [data-theme="dark"] body
    const match = globalCss.match(
      /@media \(min-width: 768px\) \{[\s\S]*?\[data-theme="dark"\] body \{[\s\S]*?\}\s*\}/
    );
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/radial-gradient/);
    expect(match![0]).toMatch(/background-attachment:\s*fixed/);
  });

  it('declares a desktop-only deepened radial for luxury palette body', () => {
    const match = globalCss.match(
      /@media \(min-width: 768px\) \{[\s\S]*?\[data-palette="luxury"\] body \{[\s\S]*?\}\s*\}/
    );
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/radial-gradient/);
  });

  it('declares a desktop-only deepened radial for living-body palette body', () => {
    const match = globalCss.match(
      /@media \(min-width: 768px\) \{[\s\S]*?\[data-palette="living-body"\] body \{[\s\S]*?\}\s*\}/
    );
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/radial-gradient/);
  });
});

describe('Phone-frame stage — mobile invariant (<768px)', () => {
  it('app-fixed-column utility unchanged (BottomNav alignment preserved)', () => {
    // The .app-fixed-column rule centers viewport-fixed chrome at the column
    // center using left:50%/translateX(-50%). It must remain untouched so
    // BottomNav still aligns with the 430px column on both mobile and desktop.
    expect(globalCss).toMatch(
      /\.app-fixed-column \{[\s\S]*?left:\s*50%[\s\S]*?max-width:\s*430px/
    );
  });

  it('base body bg (outside @media) keeps mobile flat paper (no stage tint)', () => {
    // The base body rule (line ~703) sets bg: var(--paper) WITHOUT
    // background-attachment:fixed. The fixed bg is only added in the desktop
    // @media block above. Mobile gets the original flat paper.
    const baseBodyMatch = globalCss.match(/html, body \{[\s\S]*?background:\s*var\(--paper[^)]*\)[\s\S]*?\}/);
    expect(baseBodyMatch).not.toBeNull();
  });
});
