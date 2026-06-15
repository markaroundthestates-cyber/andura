// ══ BUILD F6a #32 — dip classifier tests (F6a spec §5e) ═════════════════════
// PURE fusion of pre-computed signals. Asserts the four sim-plan cases:
//   - GAP pass-through → DETRAINING, no suppression (the ramp owns it).
//   - FATIGUE pass-through → high-ACWR + drift → FATIGUE, deload fires.
//   - LIFE_DIP suppression → low-ACWR + bad-sleep week → LIFE_DIP, deload suppressed.
//   - no mis-suppression → a TRUE high-ACWR fatigue is NEVER LIFE_DIP (the guard).
//   - degrade → null ACWR/drift (#5/#26 OFF) → gap-vs-fatigue only, no LIFE_DIP.

import { describe, it, expect } from 'vitest';
import {
  classifyPerformanceDip,
  DIP_CLASS,
  ACWR_LIFEDIP_MAX,
} from '../dp/dipClassifier.js';

describe('F6a #32 dip classifier', () => {
  it('GAP detected → DETRAINING, no suppression (ramp owns it)', () => {
    const r = classifyPerformanceDip({
      returnDeload: { multiplier: 0.7 },
      acwr: { acwr: 0.6 },
      drift: { systemic: false },
      fatigue: { recommend: 'deload', sleepBad: 3 },
    });
    expect(r.class).toBe(DIP_CLASS.DETRAINING);
    expect(r.suppressDeload).toBe(false);
  });

  it('high ACWR + systemic drift → FATIGUE, deload fires (no suppression)', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: 1.8 },
      drift: { systemic: true },
      fatigue: { recommend: 'deload', sleepBad: 0 },
    });
    expect(r.class).toBe(DIP_CLASS.FATIGUE);
    expect(r.suppressDeload).toBe(false);
  });

  it('low ACWR + bad-sleep week (no drift) → LIFE_DIP, deload SUPPRESSED', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: 0.9 },
      drift: { systemic: false },
      fatigue: { recommend: 'deload', sleepBad: 3 },
    });
    expect(r.class).toBe(DIP_CLASS.LIFE_DIP);
    expect(r.suppressDeload).toBe(true);
  });

  it('no mis-suppression — a TRUE high-ACWR fatigue is NEVER LIFE_DIP', () => {
    // even with a bad-sleep week, ACWR HIGH forces FATIGUE (the safety guard).
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: 1.7 },
      drift: { systemic: false },
      fatigue: { recommend: 'deload', sleepBad: 4 },
    });
    expect(r.class).toBe(DIP_CLASS.FATIGUE);
    expect(r.suppressDeload).toBe(false);
  });

  it('degrade: null ACWR/drift (#5/#26 OFF) → FATIGUE, no LIFE_DIP', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: null,
      drift: null,
      fatigue: { recommend: 'deload', sleepBad: 3 },
    });
    expect(r.class).toBe(DIP_CLASS.FATIGUE);
    expect(r.suppressDeload).toBe(false);
  });

  it('no dip signal at all → NONE (today behavior)', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: 1.0 },
      drift: { systemic: false },
      fatigue: { recommend: 'normal', sleepBad: 0 },
    });
    expect(r.class).toBe(DIP_CLASS.NONE);
    expect(r.suppressDeload).toBe(false);
  });

  it('closed-days / kcal shortfall also source a LIFE_DIP at low volume', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: 1.0 },
      drift: { systemic: false },
      fatigue: { recommend: 'reduce', sleepBad: 0 },
      lifestyle: { closedDaysRecent: 2, kcalShortfall: true },
    });
    expect(r.class).toBe(DIP_CLASS.LIFE_DIP);
    expect(r.suppressDeload).toBe(true);
  });

  // dp_lifedip_inputs_v1 — the REAL inputs the builder now threads (closedDaysRecent
  // from computeAdherence.skipped + kcalShortfall from a CUT deficit) must each fire the
  // LIFE_DIP branch ALONE, with sleepBad 0 (proving they are NOT riding the sleep
  // trigger). Uses the production volume boundary (ACWR_LIFEDIP_MAX) + the real engine
  // outputs' shape, NOT round convenience numbers.
  it('real closedDaysRecent ALONE (sleepBad 0, at the ACWR_LIFEDIP_MAX boundary) → LIFE_DIP', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: ACWR_LIFEDIP_MAX }, // exactly the volume-not-high boundary (<=)
      drift: { systemic: false },
      fatigue: { recommend: 'deload', sleepBad: 0 }, // dip present, NOT sleep-sourced
      lifestyle: { closedDaysRecent: 2, kcalShortfall: false }, // missed sessions are the cause
    });
    expect(r.class).toBe(DIP_CLASS.LIFE_DIP);
    expect(r.suppressDeload).toBe(true);
  });

  it('real kcalShortfall ALONE (no skips, sleepBad 0) → LIFE_DIP', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: 1.0 },
      drift: { systemic: false },
      fatigue: { recommend: 'deload', sleepBad: 0 },
      lifestyle: { closedDaysRecent: 0, kcalShortfall: true }, // a real CUT deficit is the cause
    });
    expect(r.class).toBe(DIP_CLASS.LIFE_DIP);
    expect(r.suppressDeload).toBe(true);
  });

  // The OFF-path contract the builder honors: the hard-coded zeros (closedDaysRecent 0 +
  // kcalShortfall false) leave NO lifestyle source, so the SAME low-volume dip stays a
  // plain FATIGUE (deload fires) — this is the byte-identical baseline the flag preserves.
  it('builder OFF-path zeros (no lifestyle source) → FATIGUE, deload NOT suppressed', () => {
    const r = classifyPerformanceDip({
      returnDeload: null,
      acwr: { acwr: 1.0 },
      drift: { systemic: false },
      fatigue: { recommend: 'deload', sleepBad: 0 },
      lifestyle: { closedDaysRecent: 0, kcalShortfall: false }, // the hard-coded zeros
    });
    expect(r.class).toBe(DIP_CLASS.FATIGUE);
    expect(r.suppressDeload).toBe(false);
  });
});
