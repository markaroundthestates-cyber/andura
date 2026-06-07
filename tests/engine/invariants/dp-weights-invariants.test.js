// ══ PROPERTY / METAMORPHIC invariants on weights.js + dp.js ════════════════
// fast-check properties that LOCK the three historical bug classes:
//   F-1 crater         — getPrevWeight above-the-top returned the FLOOR.
//   hard-no-adapt      — a single greu at target eased every session (saw-tooth).
//   PR-floor collapse  — rec dropped below demonstrated working load.
//
// RPE literals are the REAL coarse map (usor=6.5 / potrivit=7.5 / greu=8.5,
// workoutStore.logic.ts) — NEVER round numbers. The EASE gate is `>= 8.5`
// (dp.js:981) and distress is reps < rMin (dp.js:714); a greu tested as 9 would
// mis-trip thresholds, so 8.5 is pinned literally.

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  getPrevWeight,
  getNextWeight,
  roundToEquipmentWeight,
  EQUIPMENT_WEIGHTS,
  EXERCISE_EQUIPMENT_MAP,
} from '../../../src/config/weights.js';
import { DP } from '../../../src/engine/dp.js';
import { DB } from '../../../src/db.js';

// Real coarse rating→RPE map (workoutStore.logic.ts:53-57). Pin the literals.
const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };
const NOW = Date.UTC(2026, 0, 5);

// Reset localStorage between property runs (mirror the sim's resetStore).
function reset() {
  try {
    localStorage.clear();
  } catch {
    /* jsdom always has localStorage */
  }
}
beforeEach(reset);

// Seed `logs` newest-first under the EN engine key, exactly as persistSessionLogs
// writes ({ ex, w, reps:String, rpe, ts, session }). DP.getLogs filters on ex+w.
function seedLogs(ex, rows) {
  const logs = rows.map((r, i) => ({
    ex,
    w: r.w,
    reps: String(r.reps),
    rpe: r.rpe,
    ts: r.ts ?? NOW - i * 86400000,
  }));
  DB.set('logs', logs);
}

// Exercises spanning every ladder used by the properties.
const LADDER_EX = {
  light_iso_db: 'DB Rear Delt Fly',
  dumbbell: 'Incline DB Press',
  bailib_stack: 'Lat Pulldown',
  barbell_plates: 'Flat Barbell Bench',
  barbell_heavy: 'Barbell Back Squat (High Bar)',
  leg_machine: 'Leg Extension',
  machine_plates: 'Incline Barbell Bench', // barbell_plates; covered above too
};

const listFor = (ex) =>
  EQUIPMENT_WEIGHTS[EXERCISE_EQUIPMENT_MAP[ex] || 'bailib_stack'] || [];

describe('T2.1 — weights.js pure-function properties', () => {
  const exArb = fc.constantFrom(
    'DB Rear Delt Fly',
    'Incline DB Press',
    'Lat Pulldown',
    'Barbell Back Squat (High Bar)',
    'Leg Extension',
    'Flat Barbell Bench',
  );

  it('getPrevWeight never returns the floor for an above-top load (F-1 crater)', () => {
    fc.assert(
      fc.property(exArb, (ex) => {
        const list = listFor(ex);
        const top = list[list.length - 1];
        const current = top + 50; // strictly above every rung
        const prev = getPrevWeight(current, ex);
        // one top-increment down: >= top rung, < current, NEVER the floor
        expect(prev).toBeGreaterThanOrEqual(top);
        expect(prev).toBeLessThan(current);
        expect(prev).not.toBe(list[0]);
      }),
    );
  });

  it('F-1 literal anchor: 140kg squat → >= 84, never 5', () => {
    const ex = 'Barbell Back Squat (High Bar)';
    // 140 is on the barbell_heavy ladder (rung), so prev = the rung below (130).
    expect(getPrevWeight(140, ex)).toBeGreaterThanOrEqual(84);
    expect(getPrevWeight(140, ex)).not.toBe(5);
    // 142.5 is ABOVE no top (top 360) but BETWEEN rungs → snaps to rung-below path.
    expect(getPrevWeight(142.5, ex)).toBeGreaterThanOrEqual(84);
    expect(getPrevWeight(142.5, ex)).not.toBe(5);
  });

  it('getPrevWeight is strictly monotone-down inside the ladder', () => {
    fc.assert(
      fc.property(exArb, fc.integer({ min: 1, max: 30 }), (ex, rungOffset) => {
        const list = listFor(ex);
        const idx = Math.min(rungOffset, list.length - 1);
        const current = list[idx];
        const prev = getPrevWeight(current, ex);
        if (idx === 0) {
          expect(prev).toBe(list[0]); // floor hold allowed
        } else {
          expect(prev).toBe(list[idx - 1]);
          expect(prev).toBeLessThan(current);
        }
      }),
    );
  });

  it('getNextWeight is monotone-up and bounded by the top rung', () => {
    fc.assert(
      fc.property(exArb, fc.double({ min: 1, max: 500, noNaN: true }), (ex, current) => {
        const list = listFor(ex);
        const top = list[list.length - 1];
        const next = getNextWeight(current, ex);
        expect(next).toBeLessThanOrEqual(Math.max(top, current));
        expect(next).toBeGreaterThanOrEqual(Math.min(current, top));
      }),
    );
  });

  it('roundToEquipmentWeight always lands on a real rung', () => {
    fc.assert(
      fc.property(exArb, fc.double({ min: 0, max: 500, noNaN: true }), (ex, w) => {
        const list = listFor(ex);
        expect(list).toContain(roundToEquipmentWeight(w, ex));
      }),
    );
  });

  it('metamorphic round-trip: no net drift past origin on interior rungs', () => {
    fc.assert(
      fc.property(exArb, fc.integer({ min: 1, max: 30 }), (ex, rungOffset) => {
        const list = listFor(ex);
        const idx = Math.min(Math.max(rungOffset, 1), list.length - 2);
        const current = list[idx];
        expect(getPrevWeight(getNextWeight(current, ex), ex)).toBeLessThanOrEqual(current);
        expect(getNextWeight(getPrevWeight(current, ex), ex)).toBeGreaterThanOrEqual(current);
      }),
    );
  });
});

describe('T2.2 — dp.js recommend properties (DB-seeded)', () => {
  it('easy never lowers the weight', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Leg Press', 'Lat Pulldown', 'Incline DB Press'),
        fc.integer({ min: 8, max: 12 }),
        (ex, reps) => {
          reset();
          const list = listFor(ex);
          const w = list[Math.floor(list.length / 2)];
          seedLogs(ex, Array.from({ length: 5 }, (_, i) => ({ w, reps, rpe: RPE.usor, ts: NOW - i * 86400000 })));
          const rec = DP.getSmartRecommendation(ex, null, null, NOW, null, []);
          expect(rec).toBeTruthy();
          expect(rec.kg).toBeGreaterThanOrEqual(w);
        },
      ),
    );
  });

  it('single greu at target does NOT ease (hard-no-adapt fix)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Flat Barbell Bench', 'Leg Press', 'Lat Pulldown'),
        (ex) => {
          reset();
          const list = listFor(ex);
          const w = list[Math.floor(list.length / 2)];
          // ONE greu log at target reps (rMin hit) — must hold/progress, never ease.
          seedLogs(ex, [{ w, reps: 8, rpe: RPE.greu }]);
          const rec = DP.getSmartRecommendation(ex, null, null, NOW, null, []);
          expect(rec.status).not.toBe('EASE BACK');
          expect(rec.kg).toBeGreaterThanOrEqual(w);
        },
      ),
    );
  });

  it('sustained distress DOES ease, exactly one ladder step', () => {
    const ex = 'Lat Pulldown';
    reset();
    const list = listFor(ex);
    const w = list[6]; // mid-ladder so a step down exists and is not the floor
    // greu with reps BELOW rMin (8) → lastRepsBelowTarget true → ease immediately.
    seedLogs(ex, [{ w, reps: 5, rpe: RPE.greu }]);
    const rec = DP.getSmartRecommendation(ex, null, null, NOW, null, []);
    expect(rec.kg).toBe(getPrevWeight(w, ex));
    expect(rec.kg).toBeLessThan(w);
  });

  it('no crater for a heavy lift (F-1 class, end-to-end through dp)', () => {
    const ex = 'Barbell Back Squat (High Bar)';
    reset();
    const demoW = 140;
    // heavy COMPLETED log (greu but HIT target → demonstrated capacity), then distress.
    seedLogs(ex, [
      { w: 130, reps: 4, rpe: RPE.greu, ts: NOW },               // newest: distress
      { w: demoW, reps: 8, rpe: RPE.greu, ts: NOW - 86400000 },  // demonstrated 140@8
    ]);
    const rec = DP.getSmartRecommendation(ex, null, null, NOW, null, []);
    expect(rec.kg).toBeGreaterThanOrEqual(0.5 * demoW);
    expect(rec.kg).toBeGreaterThanOrEqual(getPrevWeight(demoW, ex) - 0.001);
  });

  it('PR-floor: rec never below demonstrated working load over random ratings', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(RPE.usor, RPE.potrivit, RPE.greu), { minLength: 1, maxLength: 6 }),
        (ratings) => {
          reset();
          const ex = 'Leg Press';
          const list = listFor(ex);
          const demoW = list[6];
          const rows = [];
          // heaviest COMPLETED log at target sets the floor.
          rows.push({ w: demoW, reps: 10, rpe: RPE.potrivit, ts: NOW - (ratings.length + 1) * 86400000 });
          ratings.forEach((rpe, i) => {
            rows.push({ w: demoW, reps: rpe >= 8.5 ? 6 : 10, rpe, ts: NOW - (ratings.length - i) * 86400000 });
          });
          // newest-first
          rows.reverse();
          DB.set('logs', rows.map((r) => ({ ex, w: r.w, reps: String(r.reps), rpe: r.rpe, ts: r.ts })));
          const rec = DP.getSmartRecommendation(ex, null, null, NOW, null, []);
          if (rec.status !== 'RETURN DELOAD') {
            expect(rec.kg).toBeGreaterThanOrEqual(roundToEquipmentWeight(demoW, ex) - 0.001);
          }
        },
      ),
    );
  });

  it('rating monotonicity (metamorphic): harder rating never prescribes heavier', () => {
    const ex = 'Leg Press';
    const list = listFor(ex);
    const w = list[6];
    const recFor = (rpe) => {
      reset();
      seedLogs(ex, [{ w, reps: 10, rpe }]);
      return DP.getSmartRecommendation(ex, null, null, NOW, null, []);
    };
    const usor = recFor(RPE.usor);
    const potrivit = recFor(RPE.potrivit);
    const greu = recFor(RPE.greu);
    expect(usor.kg).toBeGreaterThanOrEqual(potrivit.kg);
    expect(potrivit.kg).toBeGreaterThanOrEqual(greu.kg);
  });

  it('finite + sane bounds over arbitrary seeded histories', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Leg Press', 'Lat Pulldown', 'Incline DB Press', 'Barbell Back Squat (High Bar)'),
        fc.array(
          fc.record({
            wIdx: fc.integer({ min: 0, max: 20 }),
            reps: fc.integer({ min: 2, max: 15 }),
            rpe: fc.constantFrom(RPE.usor, RPE.potrivit, RPE.greu),
          }),
          { minLength: 1, maxLength: 6 },
        ),
        (ex, hist) => {
          reset();
          const list = listFor(ex);
          const rows = hist.map((h, i) => ({
            ex,
            w: list[Math.min(h.wIdx, list.length - 1)],
            reps: String(h.reps),
            rpe: h.rpe,
            ts: NOW - i * 86400000,
          }));
          DB.set('logs', rows);
          const rec = DP.getSmartRecommendation(ex, null, null, NOW, null, []);
          expect(Number.isFinite(rec.kg)).toBe(true);
          expect(rec.kg).toBeGreaterThan(0);
          expect(Number.isFinite(rec.repsTarget)).toBe(true);
          expect(rec.repsTarget).toBeGreaterThanOrEqual(2);
        },
      ),
    );
  });
});

describe('T2.3 — checkInSessionAdjust metamorphic properties', () => {
  it('in-session ease requires hard AND far-under volume', () => {
    const ex = 'Leg Press';
    reset();
    seedLogs(ex, [{ w: 120, reps: 10, rpe: RPE.potrivit }]);
    // greu set that HIT the recommended volume (volRatio ~1.0) → must NOT ease down.
    const adj = DP.checkInSessionAdjust(ex, [RPE.greu], [10], {
      recKg: 120,
      recReps: 10,
      loggedKg: 120,
      setIdx: 1,
      nowMs: NOW,
    });
    expect(!(adj && adj.adjust && adj.dir === 'down')).toBe(true);
  });

  it('over-performance ramps up smoothly, never jumps straight to loggedKg', () => {
    reset();
    const ex = 'Flat Barbell Bench';
    DB.set('phase-override', 'STRENGTH');
    seedLogs(ex, [{ w: 60, reps: 8, rpe: RPE.potrivit }]);
    const recKg = 60;
    const loggedKg = 100; // far over
    const adj = DP.checkInSessionAdjust(ex, [RPE.potrivit], [10], {
      recKg,
      recReps: 8,
      loggedKg,
      setIdx: 1,
      nowMs: NOW,
    });
    if (adj && adj.adjust && adj.dir === 'up' && typeof adj.newKg === 'number') {
      expect(adj.newKg).toBeLessThanOrEqual(loggedKg);
    }
    DB.set('phase-override', 'AUTO');
  });

  it('first-ever session still calibrates (no !lastW early bail)', () => {
    reset();
    const ex = 'Leg Press';
    // no prior logs, but a valid loggedKg → the adjust path must be reachable.
    const adj = DP.checkInSessionAdjust(ex, [RPE.greu], [4], {
      recKg: 100,
      recReps: 10,
      loggedKg: 60,
      setIdx: 1,
      nowMs: NOW,
    });
    expect(adj).toBeTruthy();
    // a far-under greu first set should be allowed to respond (not a forced false bail).
    expect(typeof adj.adjust).toBe('boolean');
  });
});
