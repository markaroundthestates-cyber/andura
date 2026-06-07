// F0 dedup #3 — RPE-scale TWO-HORIZONS guard.
//
// There are intentionally TWO rating→RPE maps (co-located in
// workoutStore.logic.ts): a CROSS-SESSION persisted map (greu = 8.5, feeds
// dp.js's lastRPE >= 8.5 cross-session gate) and a LIVE in-session map
// (greu = 10, feeds DP.checkInSessionAdjust whose ease branch fires at
// lastRPE >= 9.5). Unifying the numbers is a PRESCRIPTION change, not a cleanup.
//
// This test PINS the relationships the engine relies on so nobody "fixes" the
// divergence into a regression:
//   - in-session greu (10) >= 9.5  → the live ease branch stays reachable
//   - persisted   greu (8.5) >= 8.5 → the cross-session greu gate stays armed
//   - persisted   greu (8.5) <  9.5 → a persisted hard set never trips the
//                                      in-session-only ease branch
// If a future edit collapses the two numbers, one of these breaks loudly.

import { describe, it, expect } from 'vitest';
import {
  RATING_TO_RPE,
  INSESSION_RATING_TO_RPE,
} from '../../stores/workoutStore.logic';

// dp.js thresholds the maps are calibrated against (mirrored as test constants).
const CROSS_SESSION_GREU_GATE = 8.5; // dp.js greu gate: lastRPE >= 8.5
const IN_SESSION_EASE_GATE = 9.5; // dp.js checkInSessionAdjust greu: >= 9.5

describe('rating→RPE two-horizons invariant (do not unify)', () => {
  it('in-session greu reaches the live ease branch (>= 9.5)', () => {
    expect(INSESSION_RATING_TO_RPE.greu).toBeGreaterThanOrEqual(IN_SESSION_EASE_GATE);
  });

  it('persisted greu arms the cross-session gate (>= 8.5)', () => {
    expect(RATING_TO_RPE.greu).toBeGreaterThanOrEqual(CROSS_SESSION_GREU_GATE);
  });

  it('persisted greu never trips the in-session-only ease branch (< 9.5)', () => {
    expect(RATING_TO_RPE.greu).toBeLessThan(IN_SESSION_EASE_GATE);
  });

  it('the two horizons disagree on greu by design', () => {
    expect(INSESSION_RATING_TO_RPE.greu).not.toBe(RATING_TO_RPE.greu);
  });

  it('usor/potrivit agree across horizons (only greu diverges)', () => {
    expect(INSESSION_RATING_TO_RPE.usor).toBe(RATING_TO_RPE.usor);
    expect(INSESSION_RATING_TO_RPE.potrivit).toBe(RATING_TO_RPE.potrivit);
  });
});
