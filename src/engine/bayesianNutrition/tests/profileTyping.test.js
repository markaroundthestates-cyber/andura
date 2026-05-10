import { describe, it, expect } from 'vitest';
import {
  computeMoodScore,
  resolveProfileTypingThreshold,
  exceedsHammingHysteresis,
  meetsConsecutiveQualifier,
  evaluateProfileTypingFlip,
  evaluateAntiSpam,
} from '../profileTyping.js';
import {
  CALIBRATION_TIERS,
  PROFILE_TYPING,
  ANTI_SPAM,
} from '../constants.js';

describe('computeMoodScore — Cluster B4 Linear Sum Weighted normalized', () => {
  it('all components 1.0 → max score 1.0', () => {
    const r = computeMoodScore({
      energyReadiness: 1.0,
      emoji: 'green',
      sleepSelfReport: 1.0,
    });
    expect(r).toBeCloseTo(1.0, 5);
  });
  it('all components 0 → min score 0', () => {
    const r = computeMoodScore({
      energyReadiness: 0,
      emoji: 'red',
      sleepSelfReport: 0,
    });
    expect(r).toBe(0);
  });
  it('emoji yellow → 0.5 mid-point', () => {
    const r = computeMoodScore({ emoji: 'yellow' });
    expect(r).toBe(0.5);
  });
  it('partial input → averages available components', () => {
    const r = computeMoodScore({ emoji: 'green', sleepSelfReport: 0.5 });
    // (1.0 + 0.5) / 2 = 0.75
    expect(r).toBe(0.75);
  });
  it('empty input → neutral 0.5 default', () => {
    expect(computeMoodScore({})).toBe(0.5);
  });
  it('invalid energyReadiness out-of-range → ignored', () => {
    const r = computeMoodScore({ energyReadiness: 1.5, emoji: 'green' });
    expect(r).toBe(1.0); // only emoji counted
  });
});

describe('resolveProfileTypingThreshold — Cluster D3 0.55-0.85 + 0.70 default', () => {
  it('T0 → 0.70 default', () => {
    expect(resolveProfileTypingThreshold({ tier: CALIBRATION_TIERS.T0 })).toBe(0.70);
  });
  it('T1+ adaptive value clamped 0.55-0.85', () => {
    expect(resolveProfileTypingThreshold({
      tier: CALIBRATION_TIERS.T1, adaptiveValue: 0.60,
    })).toBe(0.60);
    expect(resolveProfileTypingThreshold({
      tier: CALIBRATION_TIERS.T1, adaptiveValue: 0.40,
    })).toBe(PROFILE_TYPING.t1PlusMin); // clamped 0.55
    expect(resolveProfileTypingThreshold({
      tier: CALIBRATION_TIERS.T1, adaptiveValue: 0.95,
    })).toBe(PROFILE_TYPING.t1PlusMax); // clamped 0.85
  });
  it('T1+ no adaptiveValue → 0.70 V1 default', () => {
    expect(resolveProfileTypingThreshold({
      tier: CALIBRATION_TIERS.T1,
    })).toBe(PROFILE_TYPING.t0Default);
  });
});

describe('exceedsHammingHysteresis — Cluster D3 15% anti-flap', () => {
  it('diff < 15% → false (flap suppressed)', () => {
    expect(exceedsHammingHysteresis({
      currentThreshold: 0.70, incomingThreshold: 0.75,
    })).toBe(false); // 5/70 ≈ 7%
  });
  it('diff > 15% → true (flap allowed)', () => {
    expect(exceedsHammingHysteresis({
      currentThreshold: 0.70, incomingThreshold: 0.85,
    })).toBe(true); // 15/70 ≈ 21%
  });
  it('diff exactly 15% boundary → false (strict >)', () => {
    expect(exceedsHammingHysteresis({
      currentThreshold: 1.0, incomingThreshold: 1.15,
    })).toBe(false); // 15/100 = 15%, NOT strictly >
  });
  it('invalid inputs → false defensive', () => {
    expect(exceedsHammingHysteresis({
      currentThreshold: NaN, incomingThreshold: 0.85,
    })).toBe(false);
  });
});

describe('meetsConsecutiveQualifier — Cluster D3 2 sesiuni 14d window', () => {
  it('2 consecutive aligned in 14d → true', () => {
    const sessions = [
      { thresholdAligned: true, daysAgo: 1 },
      { thresholdAligned: true, daysAgo: 5 },
    ];
    expect(meetsConsecutiveQualifier({ recentSessions: sessions })).toBe(true);
  });
  it('only 1 aligned → false (need 2)', () => {
    const sessions = [
      { thresholdAligned: true, daysAgo: 1 },
      { thresholdAligned: false, daysAgo: 5 },
    ];
    expect(meetsConsecutiveQualifier({ recentSessions: sessions })).toBe(false);
  });
  it('outside 14d window → false', () => {
    const sessions = [
      { thresholdAligned: true, daysAgo: 1 },
      { thresholdAligned: true, daysAgo: 20 },
    ];
    expect(meetsConsecutiveQualifier({ recentSessions: sessions })).toBe(false);
  });
  it('empty → false defensive', () => {
    expect(meetsConsecutiveQualifier({ recentSessions: [] })).toBe(false);
    expect(meetsConsecutiveQualifier({})).toBe(false);
  });
});

describe('evaluateProfileTypingFlip — full integration D3', () => {
  it('Hamming exceeds + qualifier met → flip allowed', () => {
    const r = evaluateProfileTypingFlip({
      currentThreshold: 0.70,
      incomingThreshold: 0.85,
      recentSessions: [
        { thresholdAligned: true, daysAgo: 1 },
        { thresholdAligned: true, daysAgo: 5 },
      ],
    });
    expect(r.flapSuppressed).toBe(false);
    expect(r.threshold).toBe(0.85);
  });
  it('Hamming NU exceeds → flap suppressed, threshold unchanged', () => {
    const r = evaluateProfileTypingFlip({
      currentThreshold: 0.70,
      incomingThreshold: 0.72,
      recentSessions: [
        { thresholdAligned: true, daysAgo: 1 },
        { thresholdAligned: true, daysAgo: 5 },
      ],
    });
    expect(r.flapSuppressed).toBe(true);
    expect(r.threshold).toBe(0.70);
  });
  it('qualifier NU met → flap suppressed', () => {
    const r = evaluateProfileTypingFlip({
      currentThreshold: 0.70,
      incomingThreshold: 0.85,
      recentSessions: [{ thresholdAligned: true, daysAgo: 1 }], // only 1
    });
    expect(r.flapSuppressed).toBe(true);
    expect(r.threshold).toBe(0.70);
  });
});

describe('evaluateAntiSpam — Cluster D6 28d cooldown + cap 4/year', () => {
  const NOW = 1735689600000; // 2026-01-01
  const day = (n) => NOW - n * 86400000;

  it('zero history → shouldPrompt true', () => {
    const r = evaluateAntiSpam({ nowMs: NOW, promptCountThisYear: 0 });
    expect(r.shouldPrompt).toBe(true);
    expect(r.blockedReasons).toEqual([]);
  });
  it('cap 4/year reached → blocked', () => {
    const r = evaluateAntiSpam({ nowMs: NOW, promptCountThisYear: ANTI_SPAM.maxPromptsPerYear });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons).toContain('cap_4_per_year_reached');
  });
  it('rolling 28d cooldown active → blocked', () => {
    const r = evaluateAntiSpam({
      nowMs: NOW,
      lastPromptMs: day(15), // 15 days ago < 28
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons).toContain('rolling_28d_cooldown');
  });
  it('past 28d cooldown → shouldPrompt true', () => {
    const r = evaluateAntiSpam({
      nowMs: NOW,
      lastPromptMs: day(29),
    });
    expect(r.shouldPrompt).toBe(true);
  });
});
