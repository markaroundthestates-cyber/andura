import { describe, it, expect } from 'vitest';
import {
  detectFlapPattern,
  applyYoyoSuppression,
  getProfileTypingModulator,
} from '../yoyoAntiFlap.js';
import { ADJUSTMENT_DIRECTION } from '../constants.js';

describe('detectFlapPattern — §9.3.4 Cluster 4 Q14=D 3-session window', () => {
  it('most-recent-first [UP, DOWN] → pattern UP_DOWN (chrono DOWN→UP)', () => {
    const r = detectFlapPattern([ADJUSTMENT_DIRECTION.UP, ADJUSTMENT_DIRECTION.DOWN]);
    expect(r.flapDetected).toBe(true);
    expect(r.pattern).toBe('UP_DOWN');
  });
  it('most-recent-first [DOWN, UP] → pattern DOWN_UP (chrono UP→DOWN)', () => {
    const r = detectFlapPattern([ADJUSTMENT_DIRECTION.DOWN, ADJUSTMENT_DIRECTION.UP]);
    expect(r.flapDetected).toBe(true);
    expect(r.pattern).toBe('DOWN_UP');
  });
  it('UP→UP no flap (monotone)', () => {
    const r = detectFlapPattern([ADJUSTMENT_DIRECTION.UP, ADJUSTMENT_DIRECTION.UP]);
    expect(r.flapDetected).toBe(false);
    expect(r.pattern).toBe(null);
  });
  it('NONE→UP no flap (single direction transition)', () => {
    const r = detectFlapPattern([ADJUSTMENT_DIRECTION.UP, ADJUSTMENT_DIRECTION.NONE]);
    expect(r.flapDetected).toBe(false);
  });
  it('insufficient history (<2) → no flap', () => {
    expect(detectFlapPattern([]).flapDetected).toBe(false);
    expect(detectFlapPattern([ADJUSTMENT_DIRECTION.UP]).flapDetected).toBe(false);
  });
  it('null / undefined → no flap defensive', () => {
    expect(detectFlapPattern(null).flapDetected).toBe(false);
    expect(detectFlapPattern(undefined).flapDetected).toBe(false);
  });
});

describe('applyYoyoSuppression — Q14=D V1 3rd flip suppression chronological', () => {
  it('chronological UP→DOWN→UP → suppress, hold DOWN', () => {
    // most-recent-first: [DOWN, UP] (most recent DOWN, prior UP)
    // pattern UP_DOWN... wait — let me re-trace:
    // a=window[0]=DOWN, b=window[1]=UP → pattern 'DOWN_UP' (chrono UP→DOWN)
    // incoming UP would extend: chrono UP→DOWN→UP ✓ true flap, suppress
    const r = applyYoyoSuppression({
      incomingDirection: ADJUSTMENT_DIRECTION.UP,
      recentDirections: [ADJUSTMENT_DIRECTION.DOWN, ADJUSTMENT_DIRECTION.UP],
    });
    expect(r.flapDetected).toBe(true);
    expect(r.suppressed).toBe(true);
    expect(r.heldDirection).toBe(ADJUSTMENT_DIRECTION.DOWN);
  });
  it('chronological DOWN→UP→DOWN → suppress, hold UP', () => {
    // most-recent-first: [UP, DOWN] → pattern UP_DOWN (chrono DOWN→UP)
    // incoming DOWN → chrono DOWN→UP→DOWN ✓ true flap, suppress
    const r = applyYoyoSuppression({
      incomingDirection: ADJUSTMENT_DIRECTION.DOWN,
      recentDirections: [ADJUSTMENT_DIRECTION.UP, ADJUSTMENT_DIRECTION.DOWN],
    });
    expect(r.flapDetected).toBe(true);
    expect(r.suppressed).toBe(true);
    expect(r.heldDirection).toBe(ADJUSTMENT_DIRECTION.UP);
  });
  it('monotone UP→UP→UP no flap detected, NU suppression', () => {
    const r = applyYoyoSuppression({
      incomingDirection: ADJUSTMENT_DIRECTION.UP,
      recentDirections: [ADJUSTMENT_DIRECTION.UP, ADJUSTMENT_DIRECTION.UP],
    });
    expect(r.flapDetected).toBe(false);
    expect(r.suppressed).toBe(false);
    expect(r.heldDirection).toBe(ADJUSTMENT_DIRECTION.UP);
  });
  it('chronological UP→DOWN + incoming DOWN (continues DOWN, NU alternates) → no suppression', () => {
    // most-recent-first: [DOWN, UP] → pattern DOWN_UP (chrono UP→DOWN)
    // incoming DOWN → chrono UP→DOWN→DOWN no alternation → flapDetected pattern but NU suppress
    const r = applyYoyoSuppression({
      incomingDirection: ADJUSTMENT_DIRECTION.DOWN,
      recentDirections: [ADJUSTMENT_DIRECTION.DOWN, ADJUSTMENT_DIRECTION.UP],
    });
    // Pattern DOWN_UP exists in window, but incoming DOWN doesn't extend alternation
    expect(r.suppressed).toBe(false);
    expect(r.heldDirection).toBe(ADJUSTMENT_DIRECTION.DOWN);
  });
  it('insufficient history → no suppression', () => {
    const r = applyYoyoSuppression({
      incomingDirection: ADJUSTMENT_DIRECTION.UP,
      recentDirections: [],
    });
    expect(r.suppressed).toBe(false);
    expect(r.heldDirection).toBe(ADJUSTMENT_DIRECTION.UP);
  });
  it('NONE direction în window NU trigger flap', () => {
    const r = applyYoyoSuppression({
      incomingDirection: ADJUSTMENT_DIRECTION.UP,
      recentDirections: [ADJUSTMENT_DIRECTION.NONE, ADJUSTMENT_DIRECTION.UP],
    });
    expect(r.flapDetected).toBe(false);
  });
});

describe('getProfileTypingModulator — Q14 deferred V1 stub', () => {
  it('always returns null V1 (Sprinter/Marathon DEFERRED post-Beta)', () => {
    expect(getProfileTypingModulator('sprinter')).toBe(null);
    expect(getProfileTypingModulator('marathon')).toBe(null);
    expect(getProfileTypingModulator(null)).toBe(null);
  });
});
