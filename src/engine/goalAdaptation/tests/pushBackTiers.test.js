import { describe, it, expect } from 'vitest';
import {
  computeRiskScore,
  tierForScore,
  tier3ConservativeModifiers,
  computePushBackSignal,
  evaluateReprompt,
} from '../pushBackTiers.js';
import {
  PUSHBACK_TIERS,
  PUSHBACK_RISK_THRESHOLDS,
  REPROMPT_LIMITS,
} from '../constants.js';

describe('computeRiskScore — §9.2.5 Cluster 5 example verbatim mapping', () => {
  it('lean trained young Marius forta → score 0', () => {
    const r = computeRiskScore({
      goalId: 'forta',
      user: { age: 25, bfPct: 0.12, sex: 'male' },
      recentSessions: [],
    });
    expect(r.score).toBe(0);
    expect(r.reasons).toEqual([]);
  });
  it('male BF% high → score 1 + reason bf_pct_high', () => {
    const r = computeRiskScore({
      goalId: 'sanatate',
      user: { age: 35, bfPct: 0.30, sex: 'male' },
    });
    expect(r.score).toBe(1);
    expect(r.reasons).toContain('bf_pct_high');
  });
  it('female BF% threshold differs from male', () => {
    const female = computeRiskScore({
      goalId: 'sanatate',
      user: { age: 35, bfPct: 0.30, sex: 'female' },
    });
    expect(female.score).toBe(0); // 30% < female 32% threshold
    const male = computeRiskScore({
      goalId: 'sanatate',
      user: { age: 35, bfPct: 0.30, sex: 'male' },
    });
    expect(male.score).toBe(1); // 30% > male 25% threshold
  });
  it('age 60+ → score 1 + reason age_60_plus', () => {
    const r = computeRiskScore({
      goalId: 'sanatate',
      user: { age: 65, bfPct: 0.18, sex: 'female' },
    });
    expect(r.reasons).toContain('age_60_plus');
  });
  it('forta + age 60+ → +2 cumulative (age + aggressive forta)', () => {
    const r = computeRiskScore({
      goalId: 'forta',
      user: { age: 65, bfPct: 0.18 },
    });
    expect(r.score).toBe(2);
    expect(r.reasons).toContain('age_60_plus');
    expect(r.reasons).toContain('aggressive_forta_at_age_60_plus');
  });
  it('recent injury within 6w → score +1', () => {
    const r = computeRiskScore({
      goalId: 'sanatate',
      user: { age: 35, bfPct: 0.18 },
      recentSessions: [{ injury: true, daysAgo: 14 }],
    });
    expect(r.score).toBe(1);
    expect(r.reasons).toContain('recent_injury_6w');
  });
  it('injury outside 6w window → NOT counted', () => {
    const r = computeRiskScore({
      goalId: 'sanatate',
      user: { age: 35, bfPct: 0.18 },
      recentSessions: [{ injury: true, daysAgo: 50 }],
    });
    expect(r.score).toBe(0);
  });
  it('Forta + BF% high + age 60+ + injury verbatim spec example → score >= 2 (Tier 3)', () => {
    const r = computeRiskScore({
      goalId: 'forta',
      user: { age: 65, bfPct: 0.30, sex: 'male' },
      recentSessions: [{ injury: true, daysAgo: 10 }],
    });
    expect(r.score).toBeGreaterThanOrEqual(PUSHBACK_RISK_THRESHOLDS.tier3Threshold);
  });
});

describe('tierForScore — §9.2.5 thresholds', () => {
  it('score 0 → Tier 1 silent', () => {
    expect(tierForScore(0)).toBe(PUSHBACK_TIERS.TIER_1_SILENT);
  });
  it('score 1 → Tier 2 banner', () => {
    expect(tierForScore(1)).toBe(PUSHBACK_TIERS.TIER_2_BANNER);
  });
  it('score 2 → Tier 3 modal', () => {
    expect(tierForScore(2)).toBe(PUSHBACK_TIERS.TIER_3_MODAL);
  });
  it('score 5 → Tier 3 modal (saturate)', () => {
    expect(tierForScore(5)).toBe(PUSHBACK_TIERS.TIER_3_MODAL);
  });
  it('invalid score → Tier 1 defensive', () => {
    expect(tierForScore('foo')).toBe(PUSHBACK_TIERS.TIER_1_SILENT);
    expect(tierForScore(null)).toBe(PUSHBACK_TIERS.TIER_1_SILENT);
  });
});

describe('tier3ConservativeModifiers — §9.2.5 verbatim example caps', () => {
  it('volume cap 50% MEV-50% + intensity cap 75% 1RM Layer C', () => {
    const m = tier3ConservativeModifiers();
    expect(m.volumeMul).toBe(0.50);
    expect(m.intensityCap).toBe(0.75);
  });
});

describe('computePushBackSignal — full integration §9.2.5', () => {
  it('low-risk user → Tier 1 silent, no modifiers attached', () => {
    const s = computePushBackSignal({
      goalId: 'sanatate',
      user: { age: 30, bfPct: 0.18, sex: 'male' },
    });
    expect(s.tier).toBe(PUSHBACK_TIERS.TIER_1_SILENT);
    expect(s.conservativeModifiers).toBeUndefined();
  });
  it('Tier 2 banner score 1 → no modifiers attached', () => {
    const s = computePushBackSignal({
      goalId: 'sanatate',
      user: { age: 35, bfPct: 0.30, sex: 'male' },
    });
    expect(s.tier).toBe(PUSHBACK_TIERS.TIER_2_BANNER);
    expect(s.conservativeModifiers).toBeUndefined();
  });
  it('Tier 3 modal → conservativeModifiers attached cu volumeMul + intensityCap', () => {
    const s = computePushBackSignal({
      goalId: 'forta',
      user: { age: 65, bfPct: 0.30 },
      recentSessions: [{ injury: true, daysAgo: 10 }],
    });
    expect(s.tier).toBe(PUSHBACK_TIERS.TIER_3_MODAL);
    expect(s.conservativeModifiers).toBeDefined();
    expect(s.conservativeModifiers.volumeMul).toBe(0.50);
    expect(s.conservativeModifiers.intensityCap).toBe(0.75);
  });
});

describe('evaluateReprompt — §9.2.5 + ADR 024 §2.8 Q8 anti-spam logic', () => {
  const NOW = 1735689600000; // 2026-01-01
  const day = (n) => NOW - n * 86400000;

  it('zero history → shouldPrompt true', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      repromptCountThisYear: 0,
    });
    expect(r.shouldPrompt).toBe(true);
    expect(r.blockedReasons).toEqual([]);
  });
  it('cap 4/an reached → blocked', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      repromptCountThisYear: REPROMPT_LIMITS.capPerYear,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons).toContain('cap_per_year_reached');
  });
  it('cap 5 (over) → blocked', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      repromptCountThisYear: 5,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons).toContain('cap_per_year_reached');
  });
  it('cooldown 21d post-confirm → blocked when within window', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      lastConfirmMs: day(10),
      repromptCountThisYear: 0,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons).toContain('cooldown_post_confirm');
  });
  it('cooldown 21d post-confirm → allowed when past window', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      lastConfirmMs: day(22),
      repromptCountThisYear: 0,
    });
    expect(r.shouldPrompt).toBe(true);
  });
  it('cooldown 60d post Goal Shift → blocked when within window', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      lastGoalShiftMs: day(30),
      repromptCountThisYear: 0,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons).toContain('cooldown_post_goal_shift');
  });
  it('cooldown 60d post Goal Shift → allowed when past window', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      lastGoalShiftMs: day(61),
      repromptCountThisYear: 0,
    });
    expect(r.shouldPrompt).toBe(true);
  });
  it('rolling 28d trigger → blocked when within window', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      lastRepromptMs: day(15),
      repromptCountThisYear: 0,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons).toContain('rolling_window_28d');
  });
  it('rolling 28d trigger → allowed when past window', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      lastRepromptMs: day(29),
      repromptCountThisYear: 0,
    });
    expect(r.shouldPrompt).toBe(true);
  });
  it('multiple blocks accumulate in reasons', () => {
    const r = evaluateReprompt({
      nowMs: NOW,
      lastConfirmMs: day(10),
      lastGoalShiftMs: day(30),
      lastRepromptMs: day(10),
      repromptCountThisYear: 5,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.blockedReasons.length).toBeGreaterThanOrEqual(3);
  });
});
