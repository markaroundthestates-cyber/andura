// ══ FOCUS-VISIBLE GLOBAL STYLE — A11Y KEYBOARD NAVIGATION ════════════════
// W4-AUDIT-DEEPER chat 5 CRIT a11y DIM 3 KEYBOARD fix verify.
// Tailwind preflight elimina default outline pe button:focus. Pre-fix ZERO
// focus indicator across buttons/inputs/anchors. Maria 65 + Gigel cu
// keyboard = focus invisible = unusable.
//
// jsdom NU aplica @tailwind base preflight + NU parseaza @layer cascade
// faithful → cannot assert getComputedStyle outline. Practical Bugatti:
// read global.css as text + assert :focus-visible rule exists cu brick
// outline. Smoke test (NU full behavioral parity) confirms CSS surface
// area declared — manual browser smoke separate confirms render real.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const globalCss = readFileSync(
  resolve(__dirname, '../../../styles/global.css'),
  'utf-8',
);

describe('global.css focus-visible — a11y keyboard navigation', () => {
  it(':focus-visible rule declared global', () => {
    expect(globalCss).toMatch(/:focus-visible\s*\{/);
  });

  it('outline 2px brick token applied', () => {
    // Match block content tolerant la whitespace/order properties.
    const match = globalCss.match(/:focus-visible\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match?.[1] ?? '';
    expect(body).toMatch(/outline:\s*2px\s+solid\s+var\(--brick\)/);
    expect(body).toMatch(/outline-offset:\s*2px/);
  });

  it('declared inside @layer base pentru Tailwind cascade priority', () => {
    // Assert the rule appears after "@layer base {" and before its closing.
    // Simple containment check — @layer base block has :focus-visible inside.
    const baseLayerMatch = globalCss.match(/@layer\s+base\s*\{[\s\S]*?:focus-visible[\s\S]*?\}\s*\}/);
    expect(baseLayerMatch).not.toBeNull();
  });
});
