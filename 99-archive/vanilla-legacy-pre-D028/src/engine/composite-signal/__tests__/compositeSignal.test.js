import { describe, it, expect } from 'vitest';
import {
  detectCompositeSignal, COMPOSITE_SIGNAL_THRESHOLDS,
  advanceLifecycle, COMPOSITE_SIGNAL_LIFECYCLE,
} from '../index.js';

describe('Composite Signal §36.41 — 3/3 simultaneous trigger', () => {
  it('all 3 metrics abnormal → trigger', () => {
    const r = detectCompositeSignal({
      performanceDropPct: 0.20,
      restTimeMultiplier: 1.6,
      expectedRepsAtRir: 10,
      actualRepsAtFailure: 7,
    });
    expect(r.trigger).toBe(true);
    expect(r.fired).toHaveLength(3);
  });
  it('only 2 of 3 abnormal → no trigger (false positive prevention)', () => {
    const r = detectCompositeSignal({
      performanceDropPct: 0.20,
      restTimeMultiplier: 1.6,
      expectedRepsAtRir: 10,
      actualRepsAtFailure: 10,
    });
    expect(r.trigger).toBe(false);
  });
  it('exposes thresholds', () => {
    expect(COMPOSITE_SIGNAL_THRESHOLDS.PERFORMANCE_DROP_THRESHOLD).toBe(0.15);
    expect(COMPOSITE_SIGNAL_THRESHOLDS.REST_TIME_MULTIPLIER_THRESHOLD).toBe(1.5);
  });
});

describe('Composite Signal §36.41 — Lifecycle', () => {
  it('idle → flagged on detection', () => {
    const r = advanceLifecycle({ status: 'idle', sessionsInState: 0 }, { triggerDetected: true });
    expect(r.status).toBe('flagged');
  });
  it('flagged → cooldown next session', () => {
    const r = advanceLifecycle({ status: 'flagged', sessionsInState: 0 }, { triggerDetected: false });
    expect(r.status).toBe('cooldown');
  });
  it('cooldown advances session counter, exits to resolving after 3', () => {
    let s = { status: 'cooldown', sessionsInState: 0 };
    s = advanceLifecycle(s, { triggerDetected: false });
    expect(s.sessionsInState).toBe(1);
    s = advanceLifecycle(s, { triggerDetected: false });
    s = advanceLifecycle(s, { triggerDetected: false });
    expect(s.status).toBe('resolving');
  });
  it('resolving → idle after 2 clean sessions', () => {
    let s = { status: 'resolving', sessionsInState: 0 };
    s = advanceLifecycle(s, { triggerDetected: false });
    s = advanceLifecycle(s, { triggerDetected: false });
    expect(s.status).toBe('idle');
  });
  it('resolving + new trigger → flagged (re-flag)', () => {
    const r = advanceLifecycle({ status: 'resolving', sessionsInState: 1 }, { triggerDetected: true });
    expect(r.status).toBe('flagged');
  });
  it('exposes lifecycle config', () => {
    expect(COMPOSITE_SIGNAL_LIFECYCLE.COOLDOWN_SESSIONS).toBe(3);
    expect(COMPOSITE_SIGNAL_LIFECYCLE.RESOLUTION_CLEAN_SESSIONS).toBe(2);
  });
});
