import { describe, it, expect } from 'vitest';
import {
  resolveEmojiState,
  resolveDrillDownCause,
  requiresDrillDown,
  applyAggregationRule,
  aggregateEmojiInputs,
} from '../emojiAggregation.js';
import { EMOJI_STATE, DRILL_DOWN_CAUSES } from '../constants.js';

describe('resolveEmojiState — §9.3.2 Cluster 2 Q1=C manual input', () => {
  it('green / g / 🟢 → green', () => {
    expect(resolveEmojiState({ energyEmoji: 'green' })).toBe(EMOJI_STATE.GREEN);
    expect(resolveEmojiState({ energyEmoji: 'g' })).toBe(EMOJI_STATE.GREEN);
    expect(resolveEmojiState({ energyEmoji: '🟢' })).toBe(EMOJI_STATE.GREEN);
  });
  it('yellow / y / 🟡 → yellow', () => {
    expect(resolveEmojiState({ energyEmoji: 'yellow' })).toBe(EMOJI_STATE.YELLOW);
    expect(resolveEmojiState({ energyEmoji: '🟡' })).toBe(EMOJI_STATE.YELLOW);
  });
  it('red / r / 🔴 → red', () => {
    expect(resolveEmojiState({ energyEmoji: 'red' })).toBe(EMOJI_STATE.RED);
    expect(resolveEmojiState({ energyEmoji: '🔴' })).toBe(EMOJI_STATE.RED);
  });
  it('case-insensitive', () => {
    expect(resolveEmojiState({ energyEmoji: 'GREEN' })).toBe(EMOJI_STATE.GREEN);
    expect(resolveEmojiState({ energyEmoji: 'Red' })).toBe(EMOJI_STATE.RED);
  });
  it('missing / unknown → null defensive', () => {
    expect(resolveEmojiState({})).toBe(null);
    expect(resolveEmojiState(null)).toBe(null);
    expect(resolveEmojiState({ energyEmoji: 'foo' })).toBe(null);
  });
});

describe('resolveDrillDownCause — §9.3.2 Cluster 2 Q15=C strict 🔴 only', () => {
  it('4 cauze fixed labels', () => {
    expect(resolveDrillDownCause({ drillDownCause: 'stres' })).toBe(DRILL_DOWN_CAUSES.STRES);
    expect(resolveDrillDownCause({ drillDownCause: 'somn' })).toBe(DRILL_DOWN_CAUSES.SOMN);
    expect(resolveDrillDownCause({ drillDownCause: 'durere' })).toBe(DRILL_DOWN_CAUSES.DURERE);
    expect(resolveDrillDownCause({ drillDownCause: 'altul' })).toBe(DRILL_DOWN_CAUSES.ALTUL);
  });
  it('case-insensitive', () => {
    expect(resolveDrillDownCause({ drillDownCause: 'STRES' })).toBe(DRILL_DOWN_CAUSES.STRES);
  });
  it('missing → null defensive', () => {
    expect(resolveDrillDownCause({})).toBe(null);
    expect(resolveDrillDownCause(null)).toBe(null);
  });
  it('unknown cause → null', () => {
    expect(resolveDrillDownCause({ drillDownCause: 'oboseala' })).toBe(null);
  });
});

describe('requiresDrillDown — Q15=C strict 🔴 only NU 🟡 anti-Maria-65-friction', () => {
  it('🔴 RED → true', () => {
    expect(requiresDrillDown(EMOJI_STATE.RED)).toBe(true);
  });
  it('🟡 YELLOW → false (NU drill-down anti-friction)', () => {
    expect(requiresDrillDown(EMOJI_STATE.YELLOW)).toBe(false);
  });
  it('🟢 GREEN → false', () => {
    expect(requiresDrillDown(EMOJI_STATE.GREEN)).toBe(false);
  });
  it('null → false defensive', () => {
    expect(requiresDrillDown(null)).toBe(false);
  });
});

describe('applyAggregationRule — §9.3.2 Cluster 2 Q3=C categorical rules table', () => {
  it('GREEN → UP_ELIGIBLE (cumulative N≥3 still required Cluster 3)', () => {
    expect(applyAggregationRule(EMOJI_STATE.GREEN)).toBe('UP_ELIGIBLE');
  });
  it('YELLOW → NONE (caution preserve baseline)', () => {
    expect(applyAggregationRule(EMOJI_STATE.YELLOW)).toBe('NONE');
  });
  it('RED → DOWN_IMMEDIATE (anti-burnout protect prima)', () => {
    expect(applyAggregationRule(EMOJI_STATE.RED)).toBe('DOWN_IMMEDIATE');
  });
  it('null → NONE defensive', () => {
    expect(applyAggregationRule(null)).toBe('NONE');
  });
});

describe('aggregateEmojiInputs — full integration', () => {
  it('GREEN no drill-down → UP_ELIGIBLE state preserved', () => {
    const r = aggregateEmojiInputs({ emoji: EMOJI_STATE.GREEN, drillDownCause: null });
    expect(r.state).toBe(EMOJI_STATE.GREEN);
    expect(r.drillDownCause).toBe(null);
    expect(r.categoryRule).toBe('UP_ELIGIBLE');
  });
  it('RED + drill-down preserved', () => {
    const r = aggregateEmojiInputs({
      emoji: EMOJI_STATE.RED,
      drillDownCause: DRILL_DOWN_CAUSES.SOMN,
    });
    expect(r.state).toBe(EMOJI_STATE.RED);
    expect(r.drillDownCause).toBe(DRILL_DOWN_CAUSES.SOMN);
    expect(r.categoryRule).toBe('DOWN_IMMEDIATE');
  });
  it('YELLOW + drill-down DISCARDED (strict 🔴 only)', () => {
    const r = aggregateEmojiInputs({
      emoji: EMOJI_STATE.YELLOW,
      drillDownCause: DRILL_DOWN_CAUSES.STRES,
    });
    expect(r.state).toBe(EMOJI_STATE.YELLOW);
    expect(r.drillDownCause).toBe(null); // discarded — NU 🔴
    expect(r.categoryRule).toBe('NONE');
  });
  it('GREEN + drill-down DISCARDED (strict 🔴 only)', () => {
    const r = aggregateEmojiInputs({
      emoji: EMOJI_STATE.GREEN,
      drillDownCause: DRILL_DOWN_CAUSES.STRES,
    });
    expect(r.drillDownCause).toBe(null);
  });
  it('null emoji → state null + NONE rule', () => {
    const r = aggregateEmojiInputs({ emoji: null, drillDownCause: null });
    expect(r.state).toBe(null);
    expect(r.categoryRule).toBe('NONE');
  });
});
