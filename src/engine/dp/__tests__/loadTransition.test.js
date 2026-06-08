// ══ #75 load-transition-window + reason-derivation — unit tests ══════════════
import { describe, it, expect } from 'vitest';
import {
  deriveLoadTransition,
  deriveDecreaseReason,
  windowDurationFor,
  painWindowCleared,
  TRANSITION_THRESHOLD,
} from '../loadTransition.js';

// A simple e1RM closure matching dp.js shape (Epley w/ a coarse RIR from rpe).
const e1 = (w, reps, rpe) => {
  if (!(w > 0) || !(reps > 0)) return null;
  const rir = rpe >= 8.5 ? 0 : rpe >= 7.5 ? 1 : 3;
  return w * (1 + Math.min(12, reps + rir) / 30);
};

describe('deriveLoadTransition — UP jump', () => {
  it('suppresses regression when the post-jump rep drop is e1RM continuity', () => {
    // 8kg×20 (easy) → 10kg×12 (hard, short of 20) = +25% load. e1RM ≈ continuity.
    const r = deriveLoadTransition({
      logs: [{ w: 10, reps: 12, rpe: 8.5 }, { w: 8, reps: 20, rpe: 6.5 }],
      e1RMForSet: e1,
    });
    expect(r.transition_active).toBe(true);
    expect(r.direction).toBe('up');
    expect(r.reason).toBe('up_jump');
    expect(r.load_change_pct).toBeCloseTo(0.25, 5);
    expect(r.suppress_regression).toBe(true);
    expect(r.cap_rebound).toBe(false);
  });

  it('does NOT suppress when the jump is genuinely too heavy (e1RM collapsed)', () => {
    // 10kg×20 (e1RM 14) → 11kg×1 (+10% load, e1RM ~11.4): the rep count cratered
    // far past what the small load step explains → e1RM falls below tolerance →
    // real overload, the ease-back must be allowed to fire.
    const r = deriveLoadTransition({
      logs: [{ w: 11, reps: 1, rpe: 8.5 }, { w: 10, reps: 20, rpe: 6.5 }],
      e1RMForSet: e1,
    });
    expect(r.direction).toBe('up');
    expect(r.suppress_regression).toBe(false);
  });

  it('window closes after WINDOW_EXPOSURES exposures at the new load', () => {
    // 3 post-jump exposures already at 10kg → window exhausted.
    const r = deriveLoadTransition({
      logs: [
        { w: 10, reps: 12, rpe: 7.5 }, { w: 10, reps: 12, rpe: 7.5 },
        { w: 10, reps: 12, rpe: 7.5 }, { w: 8, reps: 20, rpe: 6.5 },
      ],
      e1RMForSet: e1,
    });
    expect(r.transition_active).toBe(false);
    expect(r.suppress_regression).toBe(false);
  });
});

describe('deriveLoadTransition — DOWN move', () => {
  it('caps the rebound on a forced drop (fatigue reason)', () => {
    // 10kg → 8kg = −20%, easy spike. Cap the upward correction.
    const r = deriveLoadTransition({
      logs: [{ w: 8, reps: 20, rpe: 6.5 }, { w: 10, reps: 12, rpe: 7.5 }],
      e1RMForSet: e1,
      reasonSignals: { fatigue: true },
    });
    expect(r.direction).toBe('down');
    expect(r.reason).toBe('fatigue');
    expect(r.cap_rebound).toBe(true);
    expect(r.suppress_regression).toBe(false);
  });

  it('pain reason → OPEN-ENDED window, stays active while pain flagged', () => {
    const r = deriveLoadTransition({
      logs: [{ w: 8, reps: 20, rpe: 6.5 }, { w: 10, reps: 12, rpe: 7.5 }],
      e1RMForSet: e1,
      reasonSignals: { painFlag: true },
      painStillFlagged: true,
    });
    expect(r.reason).toBe('pain');
    expect(r.window).toBe(Infinity);
    expect(r.transition_active).toBe(true);
    expect(r.cap_rebound).toBe(true);
  });

  it('pain window clears only after 2 pain-free exposures + memory cleared', () => {
    const r = deriveLoadTransition({
      logs: [
        { w: 8, reps: 20, rpe: 6.5, pain: false },
        { w: 8, reps: 20, rpe: 6.5, pain: false },
        { w: 10, reps: 12, rpe: 7.5 },
      ],
      e1RMForSet: e1,
      reasonSignals: { painFlag: true },
      painStillFlagged: false, // memory cleared
    });
    expect(r.reason).toBe('pain');
    expect(r.transition_active).toBe(false); // cleared
    expect(r.cap_rebound).toBe(false);
  });

  it('unknown reason → conservative default (still caps), asked=true', () => {
    const r = deriveLoadTransition({
      logs: [{ w: 8, reps: 20, rpe: 6.5 }, { w: 10, reps: 12, rpe: 7.5 }],
      e1RMForSet: e1,
      reasonSignals: {}, // nothing flagged
    });
    expect(r.reason).toBe('unknown');
    expect(r.cap_rebound).toBe(true);
    expect(r.asked).toBe(true);
  });
});

describe('deriveLoadTransition — no transition', () => {
  it('inert when the change is below the 10% threshold', () => {
    const r = deriveLoadTransition({
      logs: [{ w: 10.5, reps: 12, rpe: 7.5 }, { w: 10, reps: 12, rpe: 7.5 }],
      e1RMForSet: e1,
    });
    expect(r.transition_active).toBe(false);
    expect(r.direction).toBe(null);
    expect(Math.abs(r.load_change_pct)).toBeLessThan(TRANSITION_THRESHOLD);
  });

  it('inert with fewer than 2 logs', () => {
    expect(deriveLoadTransition({ logs: [{ w: 10, reps: 12, rpe: 7.5 }] }).transition_active).toBe(false);
    expect(deriveLoadTransition({ logs: [] }).transition_active).toBe(false);
    expect(deriveLoadTransition({}).transition_active).toBe(false);
  });
});

describe('deriveDecreaseReason — priority', () => {
  it('pain wins over everything', () => {
    expect(deriveDecreaseReason({ painFlag: true, deloadActive: true, failedReps: true }).reason).toBe('pain');
  });
  it('deload > equipment > manual > failed > form > fatigue', () => {
    expect(deriveDecreaseReason({ deloadActive: true, equipmentSwap: true }).reason).toBe('deload');
    expect(deriveDecreaseReason({ equipmentSwap: true, manualReason: 'asa-am-vrut' }).reason).toBe('equipment');
    expect(deriveDecreaseReason({ manualReason: 'asa-am-vrut', failedReps: true }).reason).toBe('manual');
    expect(deriveDecreaseReason({ failedReps: true, formBreakdown: true }).reason).toBe('failed_reps');
    expect(deriveDecreaseReason({ formBreakdown: true, fatigue: true }).reason).toBe('form');
    expect(deriveDecreaseReason({ fatigue: true }).reason).toBe('fatigue');
  });
  it('unknown is conservative default with asked=true', () => {
    const r = deriveDecreaseReason({});
    expect(r.reason).toBe('unknown');
    expect(r.asked).toBe(true);
  });
  it('manual durere maps to pain; oboseala maps to fatigue', () => {
    expect(deriveDecreaseReason({ manualReason: 'durere' }).reason).toBe('pain');
    expect(deriveDecreaseReason({ manualReason: 'oboseala' }).reason).toBe('fatigue');
  });
});

describe('windowDurationFor + painWindowCleared', () => {
  it('pain is open-ended; others finite', () => {
    expect(windowDurationFor('pain')).toBe(Infinity);
    expect(windowDurationFor('deload')).toBeGreaterThan(0);
    expect(Number.isFinite(windowDurationFor('fatigue'))).toBe(true);
    expect(Number.isFinite(windowDurationFor('unknown'))).toBe(true);
  });
  it('painWindowCleared reopens while flagged, clears on pain-free run', () => {
    expect(painWindowCleared(true, [])).toBe(false); // re-flagged
    expect(painWindowCleared(false, [{ pain: false }, { pain: false }])).toBe(true);
    expect(painWindowCleared(false, [{ pain: true }, { pain: false }])).toBe(false);
  });
});
