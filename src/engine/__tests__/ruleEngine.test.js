import { describe, it, expect } from 'vitest';
import { evaluate, evaluateAction, RULES } from '../ruleEngine.js';

describe('ruleEngine', () => {
  it('returns normal action when no rules fire', () => {
    const ctx = { readiness: { score: 70 }, fatigueIndex: 0, isInCut: false };
    const result = evaluate(ctx);
    expect(result.action).toBe('normal');
    expect(result.winner).toBeNull();
    expect(result.trace).toHaveLength(0);
  });

  it('REST_DAY fires for readiness < 40', () => {
    const ctx = { readiness: { score: 35 }, fatigueIndex: 0, isInCut: false };
    const result = evaluate(ctx);
    expect(result.action).toBe('rest');
    expect(result.winner.id).toBe('REST_DAY');
    expect(result.winner.priority).toBe(100);
  });

  it('DELOAD fires when fatigueIndex >= 0.85', () => {
    const ctx = { readiness: { score: 70 }, fatigueIndex: 0.9, isInCut: false };
    const result = evaluate(ctx);
    expect(result.action).toBe('deload');
    expect(result.winner.id).toBe('DELOAD');
  });

  it('REST_DAY beats DELOAD when both fire (priority 100 > 95)', () => {
    const ctx = { readiness: { score: 30 }, fatigueIndex: 0.9, isInCut: false };
    const result = evaluate(ctx);
    expect(result.winner.id).toBe('REST_DAY');
    expect(result.overridden.some(r => r.id === 'DELOAD')).toBe(true);
  });

  it('CUT_CONSERVATIVE fires when isInCut and readiness >= 85', () => {
    const ctx = { readiness: { score: 90 }, fatigueIndex: 0, isInCut: true };
    const result = evaluate(ctx);
    expect(result.action).toBe('conservative');
    expect(result.winner.id).toBe('CUT_CONSERVATIVE');
  });

  it('CUT_CONSERVATIVE does NOT fire if readiness < 85', () => {
    const ctx = { readiness: { score: 80 }, fatigueIndex: 0, isInCut: true };
    const result = evaluate(ctx);
    expect(result.action).toBe('normal');
  });

  it('WEAK_GROUP_PRIORITY fires when weakGroups present', () => {
    const ctx = { readiness: { score: 70 }, weakGroups: ['biceps', 'shoulders'], isInCut: false };
    const result = evaluate(ctx);
    expect(result.action).toBe('prioritize_weak');
    expect(result.winner.data.weakGroups).toContain('biceps');
  });

  it('STAGNATION_WEEK_8 fires at 8+ weeks', () => {
    const ctx = { readiness: { score: 70 }, stagnationWeeks: 8, isInCut: false };
    const result = evaluate(ctx);
    expect(result.winner.id).toBe('STAGNATION_WEEK_8');
  });

  it('STAGNATION_WEEK_6 fires at exactly 6 weeks', () => {
    const ctx = { readiness: { score: 70 }, stagnationWeeks: 6 };
    const result = evaluate(ctx);
    expect(result.winner.id).toBe('STAGNATION_WEEK_6');
  });

  it('STAGNATION_WEEK_4 fires at exactly 4 weeks', () => {
    const ctx = { readiness: { score: 70 }, stagnationWeeks: 4 };
    const result = evaluate(ctx);
    expect(result.winner.id).toBe('STAGNATION_WEEK_4');
  });

  it('PATTERN_EARLY_END fires when patterns include early_end', () => {
    const ctx = {
      readiness: { score: 70 },
      patterns: [{ type: 'early_end', message: 'Sesiune scurtată frecvent' }],
    };
    const result = evaluate(ctx);
    expect(result.winner.id).toBe('PATTERN_EARLY_END');
  });

  it('evaluateAction returns action string directly', () => {
    expect(evaluateAction({ readiness: { score: 25 } })).toBe('rest');
    expect(evaluateAction({ readiness: { score: 70 } })).toBe('normal');
  });

  it('trace includes all fired rules', () => {
    const ctx = {
      readiness: { score: 90 }, // >=85 so CUT_CONSERVATIVE fires
      fatigueIndex: 0.9,        // DELOAD fires
      isInCut: true,
      weakGroups: ['legs'],
      stagnationWeeks: 5,
    };
    const result = evaluate(ctx);
    const ids = result.trace.map(r => r.id);
    expect(ids).toContain('DELOAD');
    expect(ids).toContain('CUT_CONSERVATIVE');
    expect(ids).toContain('WEAK_GROUP_PRIORITY');
  });

  it('VOLUME_COMPENSATION fires for 1-2 missed sessions', () => {
    const ctx = { readiness: { score: 70 }, missedSessions: 2 };
    const result = evaluate(ctx);
    expect(result.trace.some(r => r.id === 'VOLUME_COMPENSATION')).toBe(true);
  });

  it('does not fire VOLUME_COMPENSATION for 3+ missed sessions', () => {
    const ctx = { readiness: { score: 70 }, missedSessions: 3 };
    const result = evaluate(ctx);
    expect(result.trace.some(r => r.id === 'VOLUME_COMPENSATION')).toBe(false);
  });
});
