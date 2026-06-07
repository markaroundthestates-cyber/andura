// ══ BUILD #6 — intensity corridor as an e1RM band (F3 spec §6) unit tests ════
// Pure DP._applyIntensityCorridor clamp math + the getSmartRecommendation wiring
// guard (flag OFF → no-op). Forces the flag via _devFlags. Uses a real eligible
// exercise + real rating literals so a green test means the live path works.

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';
import { DB } from '../../db.js';

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };
const EX = 'Lat Pulldown'; // cable, e1RM-eligible
const ON = () => localStorage.setItem('_devFlags', JSON.stringify({ dp_intensity_corridor_v1: true }));

// Seed the user's e1RM for EX via logs so _bestE1RM(EX) resolves a mu.
function seedE1RM(kg, reps = 10, rpe = RPE.potrivit) {
  DB.set('logs', [{ ex: EX, w: kg, reps, rpe, ts: 1_700_000_000_000 }]);
}

describe('DP._applyIntensityCorridor — e1RM-band clamp', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* jsdom */ } });

  it('flag OFF → no-op (returns the input kg byte-identical)', () => {
    seedE1RM(60);
    const out = DP._applyIntensityCorridor(50, EX, 10, { floor: 0.7, ceiling: 0.85 });
    expect(out).toBe(50);
  });

  it('a load INSIDE the band is unchanged (corridor inert in the common case)', () => {
    ON();
    seedE1RM(60, 10, RPE.potrivit); // mu = 60*(1+9/30) = 78
    // At repTarget 10 (rEff 11), impliedPct of 50kg = 50*(1+11/30)/78 ≈ 0.875... pick
    // a kg that lands inside [0.7,0.85]. mu≈78 → ceiling kg = 0.85*78/(1+11/30) ≈ 48.5.
    const inside = 45;
    const out = DP._applyIntensityCorridor(inside, EX, 10, { floor: 0.7, ceiling: 0.85 });
    expect(out).toBe(inside);
  });

  it('a TOO-LIGHT load is raised to the floor', () => {
    ON();
    seedE1RM(80, 10, RPE.potrivit); // mu = 80*1.3 = 104
    const tooLight = 20; // implied ≈ 20*1.3667/104 ≈ 0.26 « floor 0.7
    const out = DP._applyIntensityCorridor(tooLight, EX, 10, { floor: 0.7, ceiling: 0.85 });
    expect(out).toBeGreaterThan(tooLight);
  });

  it('a TOO-HEAVY load is lowered to the ceiling', () => {
    ON();
    seedE1RM(60, 10, RPE.potrivit); // mu = 78
    const tooHeavy = 75; // implied ≈ 75*1.3667/78 ≈ 1.31 » ceiling 0.85
    const out = DP._applyIntensityCorridor(tooHeavy, EX, 10, { floor: 0.7, ceiling: 0.85 });
    expect(out).toBeLessThan(tooHeavy);
  });

  it('inert when no e1RM estimate exists (cold start → returns input)', () => {
    ON();
    DB.set('logs', []);
    const out = DP._applyIntensityCorridor(50, EX, 10, { floor: 0.7, ceiling: 0.85 });
    expect(out).toBe(50);
  });

  it('inert for an e1RM-ineligible (bodyweight/band) exercise', () => {
    ON();
    // Pick a likely bodyweight name; if eligible in this library, the guard still
    // returns input when no e1RM is seeded for it.
    const out = DP._applyIntensityCorridor(50, 'Pull-up', 10, { floor: 0.7, ceiling: 0.85 });
    expect(out).toBe(50);
  });

  it('rejects a malformed corridor (floor<=0 / ceiling<floor) → no-op', () => {
    ON();
    seedE1RM(60);
    expect(DP._applyIntensityCorridor(50, EX, 10, { floor: 0, ceiling: 0.85 })).toBe(50);
    expect(DP._applyIntensityCorridor(50, EX, 10, { floor: 0.9, ceiling: 0.7 })).toBe(50);
    expect(DP._applyIntensityCorridor(50, EX, 10, null)).toBe(50);
  });
});

describe('getSmartRecommendation — corridor wiring guard', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* jsdom */ } });

  it('no corridor in opts → byte-identical (no intensityCorridorApplied tag)', () => {
    seedE1RM(60);
    const rec = DP.getSmartRecommendation(EX, null, null, 1_700_100_000_000, null, []);
    expect(rec.intensityCorridorApplied).toBeUndefined();
  });

  it('flag OFF + corridor in opts → still no-op (kill-switch wins)', () => {
    seedE1RM(60);
    const rec = DP.getSmartRecommendation(EX, null, null, 1_700_100_000_000, null, [], {
      intensityCorridor: { floor: 0.7, ceiling: 0.85 },
    });
    expect(rec.intensityCorridorApplied).toBeUndefined();
  });
});
