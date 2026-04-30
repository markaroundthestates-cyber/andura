import { describe, it, expect, beforeEach } from 'vitest';
import { explainRecommendation, whySummary, selectVerdict } from '../whyEngine.js';
import { setLocale, _resetI18nCache } from '../../i18n/index.js';

const makeCtx = (overrides = {}) => ({
  readiness: { score: 75 },
  isInCut: false,
  user: { phase: 'AUTO' },
  patterns: [],
  ...overrides,
});

beforeEach(() => {
  _resetI18nCache();
  setLocale('ro');
});

// ── selectVerdict logic ────────────────────────────────────────────────────

describe('selectVerdict — priority ladder', () => {
  it('recovery overrides everything when readiness < MED (55)', () => {
    expect(selectVerdict({ kg: 100, lastWeight: 80 }, makeCtx({ readiness: { score: 50 } })))
      .toBe('recovery');
  });

  it('recovery overrides INCREASE status', () => {
    expect(selectVerdict({ status: 'INCREASE', kg: 90 }, makeCtx({ readiness: { score: 30 } })))
      .toBe('recovery');
  });

  it('progression_up când rec.kg > lastWeight', () => {
    expect(selectVerdict({ kg: 85, lastWeight: 80 }, makeCtx())).toBe('progression_up');
  });

  it('progression_down când rec.kg < lastWeight', () => {
    expect(selectVerdict({ kg: 75, lastWeight: 80 }, makeCtx())).toBe('progression_down');
  });

  it('hold când rec.kg === lastWeight', () => {
    expect(selectVerdict({ kg: 80, lastWeight: 80 }, makeCtx())).toBe('hold');
  });

  it('progression_up via status INCREASE când no lastWeight', () => {
    expect(selectVerdict({ status: 'INCREASE' }, makeCtx())).toBe('progression_up');
  });

  it('progression_down via status SCALE_BACK când no lastWeight', () => {
    expect(selectVerdict({ status: 'SCALE_BACK' }, makeCtx())).toBe('progression_down');
  });

  it('hold pentru initial recommendation (isInitial)', () => {
    expect(selectVerdict({ isInitial: true }, makeCtx())).toBe('hold');
  });

  it('hold default fallback când nimic nu match', () => {
    expect(selectVerdict({}, makeCtx())).toBe('hold');
  });
});

// ── explainRecommendation contract ─────────────────────────────────────────

describe('explainRecommendation', () => {
  it('returns { summary, verdict, reasons } shape', () => {
    const ex = { name: 'Bench Press', recommendation: { kg: 80, status: 'CONSOLIDATE' } };
    const result = explainRecommendation(ex, makeCtx());
    expect(typeof result.summary).toBe('string');
    expect(typeof result.verdict).toBe('string');
    expect(Array.isArray(result.reasons)).toBe(true);
  });

  it('summary contains exercise name interpolated', () => {
    const ex = { name: 'Squat', recommendation: { kg: 100, lastWeight: 95 } };
    const result = explainRecommendation(ex, makeCtx());
    expect(result.summary).toContain('Squat');
  });

  it('progression_up summary uses lock-uit wording (creștem greutatea)', () => {
    const ex = { name: 'Bench', recommendation: { kg: 85, lastWeight: 80 } };
    const result = explainRecommendation(ex, makeCtx());
    expect(result.verdict).toBe('progression_up');
    expect(result.summary).toContain('Creștem greutatea');
  });

  it('progression_down summary uses lock-uit wording (Reducem puțin greutatea)', () => {
    const ex = { name: 'Bench', recommendation: { kg: 75, lastWeight: 80 } };
    const result = explainRecommendation(ex, makeCtx());
    expect(result.verdict).toBe('progression_down');
    expect(result.summary).toContain('Reducem puțin');
  });

  it('hold summary uses lock-uit wording (Păstrăm greutatea)', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80, lastWeight: 80 } };
    const result = explainRecommendation(ex, makeCtx());
    expect(result.verdict).toBe('hold');
    expect(result.summary).toContain('Păstrăm greutatea');
  });

  it('recovery summary uses lock-uit wording (Reducem volumul)', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80, lastWeight: 80 } };
    const result = explainRecommendation(ex, makeCtx({ readiness: { score: 30 } }));
    expect(result.verdict).toBe('recovery');
    expect(result.summary).toContain('Reducem volumul');
  });

  it('handles missing exercise gracefully', () => {
    const result = explainRecommendation(null, makeCtx());
    expect(result.summary).toBeTruthy();
    expect(result.verdict).toBeTruthy();
  });

  it('reasons array contains single-element with summary text only (NO category leak)', () => {
    const ex = { name: 'Bench', recommendation: { kg: 85, lastWeight: 80 } };
    const result = explainRecommendation(ex, makeCtx());
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0].text).toBe(result.summary);
    // CRITICAL: no category field exposed (anti-RE)
    expect(result.reasons[0].category).toBeUndefined();
  });
});

// ── ZERO LEAK verification (anti-RE compliance per ADR 013 + COG-ARCH §Q5) ──

describe('zero leak — anti-RE compliance', () => {
  it('NO category brackets [phase]/[readiness]/[pattern] in any output', () => {
    const verdicts = [
      { ex: { name: 'Squat', recommendation: { kg: 100, lastWeight: 95 } }, ctx: makeCtx() },
      { ex: { name: 'Squat', recommendation: { kg: 90, lastWeight: 95 } }, ctx: makeCtx() },
      { ex: { name: 'Squat', recommendation: { kg: 95, lastWeight: 95 } }, ctx: makeCtx() },
      { ex: { name: 'Squat', recommendation: { kg: 95, lastWeight: 95 } }, ctx: makeCtx({ readiness: { score: 30 } }) },
    ];
    for (const { ex, ctx } of verdicts) {
      const result = explainRecommendation(ex, ctx);
      expect(result.summary).not.toMatch(/\[phase\]|\[readiness\]|\[pattern\]|\[performance\]|\[equipment\]/);
    }
  });

  it('NO numeric leaks (score, kg, RPE) in summary text', () => {
    const ex = { name: 'Bench', recommendation: { kg: 85, lastWeight: 80 } };
    const result = explainRecommendation(ex, makeCtx({ readiness: { score: 92 } }));
    // No "92" (score) or "85" or "80" (kg) in summary
    expect(result.summary).not.toMatch(/\b92\b|\b85\b|\b80\b/);
  });

  it('exercise name interpolation correct (ZERO {exercise} placeholder leak)', () => {
    const ex = { name: 'Lat Pulldown', recommendation: { kg: 60, lastWeight: 55 } };
    const result = explainRecommendation(ex, makeCtx());
    expect(result.summary).not.toContain('{exercise}');
    expect(result.summary).toContain('Lat Pulldown');
  });
});

// ── whySummary shorthand ───────────────────────────────────────────────────

describe('whySummary', () => {
  it('returns string', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80, status: 'CONSOLIDATE' } };
    expect(typeof whySummary(ex, makeCtx())).toBe('string');
  });

  it('matches explainRecommendation.summary exactly', () => {
    const ex = { name: 'Squat', recommendation: { kg: 100, lastWeight: 95 } };
    const ctx = makeCtx();
    expect(whySummary(ex, ctx)).toBe(explainRecommendation(ex, ctx).summary);
  });
});
