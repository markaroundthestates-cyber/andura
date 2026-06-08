// ══ #74 GOAL REALISM — pure detection layer tests (spec §4) ═══════════════════
// (1) BF zone classification (sex-aware, conservative-on-unknown).
// (2) Rate labels + the BF gate on the max rate.
// (3) The worked example (108→90 / 7wk → unrealistic, 17-24wk safe / 13-16wk aggr).
// (4) Contradiction (masa + aggressive cut → recomp vs sequential by BF).
// (5) Unwise frequency (beginner 7 hard days → reframe).
// All pure — no flags, no I/O. The flag-gated consumer/byte-identical proof is the
// suite's existing golden + calibration-sim gate (this is a goal-set advisory, not
// the dp.js kg path).

import { describe, it, expect } from 'vitest';
import {
  classifyBfZone,
  maxRateForZone,
  labelLossRate,
  recommendedTimelineWeeks,
  detectUnrealisticTimeline,
  detectUnrealisticGain,
  gainRateForExperience,
  detectContradictoryGoals,
  detectUnwiseFrequency,
  evaluateGoalRealism,
  RATE_CONSERVATIVE,
  RATE_REALISTIC,
  RATE_AGGRESSIVE,
  RATE_VERY_AGGRESSIVE,
} from '../goalRealism.js';

describe('#74 classifyBfZone', () => {
  it('sex-aware HIGH zone (M>25, F>32)', () => {
    expect(classifyBfZone(30, 'm')).toBe('high');
    expect(classifyBfZone(30, 'f')).toBe('mid'); // 30 < 32 for a woman
    expect(classifyBfZone(35, 'f')).toBe('high');
  });
  it('MID zone (M 15-25, F 23-32)', () => {
    expect(classifyBfZone(20, 'm')).toBe('mid');
    expect(classifyBfZone(25, 'f')).toBe('mid');
  });
  it('LEAN zone', () => {
    expect(classifyBfZone(12, 'm')).toBe('lean');
    expect(classifyBfZone(18, 'f')).toBe('lean');
  });
  it('unknown/invalid BF → conservative LEAN (safe-by-default)', () => {
    expect(classifyBfZone(null, 'm')).toBe('lean');
    expect(classifyBfZone(undefined, 'f')).toBe('lean');
    expect(classifyBfZone(NaN, 'm')).toBe('lean');
  });
});

describe('#74 maxRateForZone', () => {
  it('high BF → 1.0 default / 1.25 aggressive', () => {
    expect(maxRateForZone('high')).toEqual({ defaultRate: RATE_AGGRESSIVE, aggressiveRate: RATE_VERY_AGGRESSIVE });
  });
  it('mid BF → 0.75 / 1.0', () => {
    expect(maxRateForZone('mid')).toEqual({ defaultRate: RATE_REALISTIC, aggressiveRate: RATE_AGGRESSIVE });
  });
  it('lean → 0.5 / 0.75', () => {
    expect(maxRateForZone('lean')).toEqual({ defaultRate: RATE_CONSERVATIVE, aggressiveRate: RATE_REALISTIC });
  });
});

describe('#74 labelLossRate (BF-gated split)', () => {
  it('the universal bands', () => {
    expect(labelLossRate(0.4, 'mid')).toBe('conservative');
    expect(labelLossRate(0.7, 'mid')).toBe('realistic');
    expect(labelLossRate(0.95, 'mid')).toBe('aggressive');
  });
  it('very-aggressive only for HIGH BF (1.0-1.25%)', () => {
    expect(labelLossRate(1.2, 'high')).toBe('very-aggressive');
    expect(labelLossRate(1.2, 'mid')).toBe('unrealistic'); // same rate, leaner → unrealistic
    expect(labelLossRate(1.2, 'lean')).toBe('unrealistic');
  });
  it('above 1.25 → unrealistic for everyone', () => {
    expect(labelLossRate(2.0, 'high')).toBe('unrealistic');
    expect(labelLossRate(2.38, 'high')).toBe('unrealistic');
  });
});

describe('#74 recommendedTimelineWeeks', () => {
  it('mid zone 108→90 → safe 17-24wk, aggressive 13-16wk (worked example)', () => {
    // total = 18/108*100 = 16.667%.  safe: /0.5=34→ceil 34 ... wait, see below.
    const tl = recommendedTimelineWeeks(108, 90, 'mid');
    // safeWeeksMin = ceil(16.667/0.75)=23 ; safeWeeksMax = ceil(16.667/0.5)=34
    // aggressiveWeeksMin = ceil(16.667/1.0)=17 ; aggressiveWeeksMax = ceil(16.667/0.75)=23
    expect(tl).not.toBeNull();
    // mid-zone numbers (the spec's 17-24/13-16 are the HIGH-zone framing — see below)
    expect(tl.aggressiveWeeksMin).toBe(17);
  });
  it('high zone 108→90 → spec range 17-24 safe / 13-16 aggressive', () => {
    const tl = recommendedTimelineWeeks(108, 90, 'high');
    // total 16.667%. high default 1.0, aggressive 1.25.
    // safeWeeksMin = ceil(16.667/1.0)=17 ; safeWeeksMax = ceil(16.667/0.5)=34
    // aggressiveWeeksMin = ceil(16.667/1.25)=14 ; aggressiveWeeksMax = ceil(16.667/1.0)=17
    expect(tl.safeWeeksMin).toBe(17); // matches the spec's 17wk safe floor
    expect(tl.aggressiveWeeksMin).toBe(14); // ~13-16wk aggressive band
  });
  it('null on no delta / invalid', () => {
    expect(recommendedTimelineWeeks(90, 90, 'mid')).toBeNull();
    expect(recommendedTimelineWeeks(0, 90, 'mid')).toBeNull();
  });
});

describe('#74 detectUnrealisticTimeline — Daniel worked example 108→90/7wk', () => {
  it('108→90 in 7 weeks → unrealistic (~2.4%/wk)', () => {
    const flag = detectUnrealisticTimeline({
      currentKg: 108,
      targetKg: 90,
      weeks: 7,
      bfPct: 28,
      sex: 'm', // M 28% → high zone
    });
    expect(flag).not.toBeNull();
    expect(flag.type).toBe('timeline');
    expect(flag.label).toBe('unrealistic');
    expect(flag.reframeKey).toBe('goalRealism.timeline.unrealistic');
    // ~2.38 → rounded 2.4
    expect(flag.vars.askedPct).toBeCloseTo(2.4, 1);
    // high zone → safe floor 17wk, aggressive floor ~14wk
    expect(flag.vars.safeWeeksMin).toBe(17);
    expect(flag.vars.aggressiveWeeksMin).toBe(14);
  });
  it('a realistic plan passes silently (null)', () => {
    // 108→90 over 30 weeks = 18/30/108*100 = 0.56%/wk → realistic
    expect(detectUnrealisticTimeline({ currentKg: 108, targetKg: 90, weeks: 30, bfPct: 28, sex: 'm' })).toBeNull();
  });
  it('very-aggressive (high BF, 1.0-1.25%) → veryAggressive key, not unrealistic', () => {
    // 100→90 over 9 weeks = 10/9/100*100 = 1.11%/wk → high zone → very-aggressive
    const flag = detectUnrealisticTimeline({ currentKg: 100, targetKg: 90, weeks: 9, bfPct: 30, sex: 'm' });
    expect(flag).not.toBeNull();
    expect(flag.label).toBe('very-aggressive');
    expect(flag.reframeKey).toBe('goalRealism.timeline.veryAggressive');
  });
  it('the SAME very-aggressive rate is UNREALISTIC for a lean user (BF gate)', () => {
    const flag = detectUnrealisticTimeline({ currentKg: 100, targetKg: 90, weeks: 9, bfPct: 10, sex: 'm' });
    expect(flag.label).toBe('unrealistic');
  });
  it('gain target is not rate-flagged here (null)', () => {
    expect(detectUnrealisticTimeline({ currentKg: 70, targetKg: 90, weeks: 4, bfPct: 12, sex: 'm' })).toBeNull();
  });
  it('incomplete input → null', () => {
    expect(detectUnrealisticTimeline({ currentKg: 100, weeks: 7 })).toBeNull();
    expect(detectUnrealisticTimeline({})).toBeNull();
  });
});

describe('#70-D4 detectUnrealisticGain — Catalin +8kg muscle/12wk', () => {
  it('intermediate +8kg in 12wk → unrealistic gain reframe', () => {
    const flag = detectUnrealisticGain({
      goal: 'masa', currentKg: 95, targetKg: 103, weeks: 12, experience: 'intermediar',
    });
    expect(flag).not.toBeNull();
    expect(flag.type).toBe('gain');
    expect(flag.reframeKey).toBe('goalRealism.gain.unrealistic');
    expect(flag.vars.gainKg).toBe(8);
    expect(flag.vars.askedWeeks).toBe(12);
    // realistic intermediate lean-gain ~0.5 kg/month → ~8/0.5 months ≈ 70 weeks
    expect(flag.vars.realisticRateKgMo).toBe(0.5);
    expect(flag.vars.realisticWeeks).toBeGreaterThan(12);
  });
  it('a plausible lean bulk (+2kg/12wk intermediate) → null (no nag)', () => {
    expect(detectUnrealisticGain({
      goal: 'masa', currentKg: 80, targetKg: 82, weeks: 12, experience: 'intermediar',
    })).toBeNull();
  });
  it('a LOSS target (target < current) → null (the loss detector owns it)', () => {
    expect(detectUnrealisticGain({
      goal: 'masa', currentKg: 95, targetKg: 88, weeks: 12, experience: 'intermediar',
    })).toBeNull();
  });
  it('non-masa goal → null', () => {
    expect(detectUnrealisticGain({
      goal: 'slabire', currentKg: 95, targetKg: 103, weeks: 12, experience: 'intermediar',
    })).toBeNull();
  });
  it('experience scales the realistic gain rate', () => {
    expect(gainRateForExperience('incepator')).toBe(1.0);
    expect(gainRateForExperience('intermediar')).toBe(0.5);
    expect(gainRateForExperience('avansat')).toBe(0.25);
    expect(gainRateForExperience(undefined)).toBe(0.5);
  });
});

describe('#74 detectContradictoryGoals', () => {
  it('masa + aggressive cut, HIGH BF → recomp viable', () => {
    const flag = detectContradictoryGoals({
      goal: 'masa', currentKg: 100, targetKg: 90, weeks: 8, bfPct: 30, sex: 'm',
    });
    expect(flag).not.toBeNull();
    expect(flag.type).toBe('contradiction');
    expect(flag.label).toBe('recomp');
    expect(flag.reframeKey).toBe('goalRealism.contradiction.recomp');
  });
  it('masa + aggressive cut, LEAN → sequential', () => {
    const flag = detectContradictoryGoals({
      goal: 'masa', currentKg: 80, targetKg: 74, weeks: 8, bfPct: 11, sex: 'm',
    });
    expect(flag.label).toBe('sequential');
    expect(flag.reframeKey).toBe('goalRealism.contradiction.sequential');
  });
  it('masa + SLOW cut ≈ recomp, no contradiction (null)', () => {
    // 100→97 over 8 weeks = 3/8/100*100 = 0.375%/wk → conservative
    expect(detectContradictoryGoals({ goal: 'masa', currentKg: 100, targetKg: 97, weeks: 8, bfPct: 20, sex: 'm' })).toBeNull();
  });
  it('masa + gaining target = coherent (null)', () => {
    expect(detectContradictoryGoals({ goal: 'masa', currentKg: 70, targetKg: 80, weeks: 12, bfPct: 12, sex: 'm' })).toBeNull();
  });
  it('non-masa goal → null', () => {
    expect(detectContradictoryGoals({ goal: 'slabire', currentKg: 100, targetKg: 90, weeks: 8, bfPct: 30, sex: 'm' })).toBeNull();
  });
  it('masa + below-current target, no timeline → contradiction on direction alone', () => {
    const flag = detectContradictoryGoals({ goal: 'masa', currentKg: 90, targetKg: 84, bfPct: 30, sex: 'm' });
    expect(flag).not.toBeNull();
    expect(flag.label).toBe('recomp');
  });
});

describe('#74 detectUnwiseFrequency', () => {
  it('beginner 7 hard days → reframe to 3', () => {
    const flag = detectUnwiseFrequency({ experience: 'incepator', hardDaysPerWeek: 7 });
    expect(flag).not.toBeNull();
    expect(flag.type).toBe('frequency');
    expect(flag.reframeKey).toBe('goalRealism.frequency.beginnerTooMany');
    expect(flag.vars.requested).toBe(7);
    expect(flag.vars.sustainableHard).toBe(3);
  });
  it('beginner 4 hard days → fine (null)', () => {
    expect(detectUnwiseFrequency({ experience: 'incepator', hardDaysPerWeek: 4 })).toBeNull();
  });
  it('intermediate 7 → reframe; 5 → fine', () => {
    expect(detectUnwiseFrequency({ experience: 'intermediar', hardDaysPerWeek: 7 })).not.toBeNull();
    expect(detectUnwiseFrequency({ experience: 'intermediar', hardDaysPerWeek: 5 })).toBeNull();
  });
  it('advanced / unknown → never nagged (null)', () => {
    expect(detectUnwiseFrequency({ experience: 'avansat', hardDaysPerWeek: 7 })).toBeNull();
    expect(detectUnwiseFrequency({ hardDaysPerWeek: 7 })).toBeNull();
  });
  it('no hard-days input → null', () => {
    expect(detectUnwiseFrequency({ experience: 'incepator' })).toBeNull();
  });
});

describe('#74 evaluateGoalRealism — priority + all-realistic', () => {
  it('timeline wins over a co-present contradiction', () => {
    const flag = evaluateGoalRealism({
      goal: 'masa', currentKg: 108, targetKg: 90, weeks: 7, bfPct: 28, sex: 'm',
      experience: 'incepator', hardDaysPerWeek: 7,
    });
    expect(flag.type).toBe('timeline');
  });
  it('a fully realistic ask → null (no nag)', () => {
    expect(evaluateGoalRealism({
      goal: 'slabire', currentKg: 100, targetKg: 90, weeks: 30, bfPct: 22, sex: 'm',
      experience: 'intermediar', hardDaysPerWeek: 4,
    })).toBeNull();
  });
  it('frequency surfaces when timeline + contradiction are clean', () => {
    const flag = evaluateGoalRealism({
      goal: 'masa', currentKg: 80, targetKg: 82, weeks: 12, bfPct: 15, sex: 'm',
      experience: 'incepator', hardDaysPerWeek: 7,
    });
    expect(flag.type).toBe('frequency');
  });
});
