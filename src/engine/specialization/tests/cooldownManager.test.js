import { describe, it, expect } from 'vitest';
import {
  getCooldownEntry,
  evaluateCooldown,
  buildCooldownEntry,
} from '../cooldownManager.js';
import { COOLDOWN_WEEKS } from '../constants.js';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// Anchor "now" = 2026-05-06 14:00 UTC roughly
const NOW_MS = 1788183600000;

describe('getCooldownEntry — history lookup defensive', () => {
  it('Map history → returns entry', () => {
    const history = new Map();
    history.set('biceps', { endTimestampMs: NOW_MS - MS_PER_WEEK, reason: 'completed_exit' });
    const r = getCooldownEntry(history, 'biceps');
    expect(r.endTimestampMs).toBe(NOW_MS - MS_PER_WEEK);
    expect(r.reason).toBe('completed_exit');
  });

  it('Object history → returns entry', () => {
    const history = { biceps: { endTimestampMs: NOW_MS, reason: 'hard_reject' } };
    const r = getCooldownEntry(history, 'biceps');
    expect(r.endTimestampMs).toBe(NOW_MS);
    expect(r.reason).toBe('hard_reject');
  });

  it('Missing entry → null endTimestampMs + null reason', () => {
    const r = getCooldownEntry({}, 'biceps');
    expect(r.endTimestampMs).toBeNull();
    expect(r.reason).toBeNull();
  });

  it('Empty group → null entry (defensive)', () => {
    const r = getCooldownEntry({ biceps: { endTimestampMs: NOW_MS, reason: 'completed_exit' } }, '');
    expect(r.endTimestampMs).toBeNull();
  });

  it('Non-object history → null safely', () => {
    expect(getCooldownEntry(null, 'biceps').endTimestampMs).toBeNull();
    expect(getCooldownEntry(undefined, 'biceps').endTimestampMs).toBeNull();
    expect(getCooldownEntry('string', 'biceps').endTimestampMs).toBeNull();
  });
});

describe('evaluateCooldown — Cluster B5 Q10=B + B6 Q16=A N=12 weeks', () => {
  it('no target group → no cooldown evaluation', () => {
    const r = evaluateCooldown({ history: {}, nowMs: NOW_MS });
    expect(r.blocked).toBe(false);
    expect(r.reason).toBe('no_cooldown');
  });

  it('no history for group → eligible no cooldown', () => {
    const r = evaluateCooldown({
      targetGroup: 'biceps',
      history:     {},
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(false);
    expect(r.reason).toBe('no_cooldown');
  });

  it('completed_exit < 12 weeks ago → blocked', () => {
    const history = {
      biceps: { endTimestampMs: NOW_MS - 6 * MS_PER_WEEK, reason: 'completed_exit' },
    };
    const r = evaluateCooldown({
      targetGroup: 'biceps',
      history,
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe('completed_exit');
    expect(r.weeksRemaining).toBeGreaterThan(0);
    expect(r.weeksRemaining).toBeLessThanOrEqual(COOLDOWN_WEEKS);
  });

  it('hard_reject < 12 weeks ago → blocked anti-nagging Q16=A', () => {
    const history = {
      biceps: { endTimestampMs: NOW_MS - 4 * MS_PER_WEEK, reason: 'hard_reject' },
    };
    const r = evaluateCooldown({
      targetGroup: 'biceps',
      history,
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe('hard_reject');
    expect(r.rationale).toContain('q10_b_q16_a');
  });

  it('cooldown expired (>= 12 weeks) → eligible re-specialization', () => {
    const history = {
      biceps: { endTimestampMs: NOW_MS - 13 * MS_PER_WEEK, reason: 'completed_exit' },
    };
    const r = evaluateCooldown({
      targetGroup: 'biceps',
      history,
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(false);
    expect(r.reason).toBe('no_cooldown');
  });

  it('boundary: exactly 12 weeks ago → expired (not blocked)', () => {
    const history = {
      biceps: { endTimestampMs: NOW_MS - COOLDOWN_WEEKS * MS_PER_WEEK, reason: 'completed_exit' },
    };
    const r = evaluateCooldown({
      targetGroup: 'biceps',
      history,
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(false);
  });

  it('different group NOT in cooldown → eligible', () => {
    const history = {
      biceps: { endTimestampMs: NOW_MS - 4 * MS_PER_WEEK, reason: 'completed_exit' },
    };
    const r = evaluateCooldown({
      targetGroup: 'back',  // different group
      history,
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(false);
  });

  it('missing nowMs → conservative block default (anti-bypass via missing timestamp)', () => {
    const history = {
      biceps: { endTimestampMs: NOW_MS - MS_PER_WEEK, reason: 'completed_exit' },
    };
    const r = evaluateCooldown({
      targetGroup: 'biceps',
      history,
      // nowMs omitted
    });
    expect(r.blocked).toBe(true);
    expect(r.rationale).toContain('anti_bypass');
  });

  it('case-insensitive group match', () => {
    const history = {
      biceps: { endTimestampMs: NOW_MS - 2 * MS_PER_WEEK, reason: 'completed_exit' },
    };
    const r = evaluateCooldown({
      targetGroup: 'BICEPS',
      history,
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(true);
  });

  it('invalid endTimestampMs (non-finite) → no cooldown active', () => {
    const history = {
      biceps: { endTimestampMs: 'invalid', reason: 'completed_exit' },
    };
    const r = evaluateCooldown({
      targetGroup: 'biceps',
      history,
      nowMs:       NOW_MS,
    });
    expect(r.blocked).toBe(false);
  });
});

describe('buildCooldownEntry — orchestrator persistence helper', () => {
  it('completed_exit reason → entry cu cooldownEnd 12 weeks later', () => {
    const r = buildCooldownEntry({
      group:  'biceps',
      nowMs:  NOW_MS,
      reason: 'completed_exit',
    });
    expect(r.group).toBe('biceps');
    expect(r.endTimestampMs).toBe(NOW_MS);
    expect(r.cooldownEndMs).toBe(NOW_MS + COOLDOWN_WEEKS * MS_PER_WEEK);
    expect(r.reason).toBe('completed_exit');
  });

  it('hard_reject reason preserved', () => {
    const r = buildCooldownEntry({
      group:  'back',
      nowMs:  NOW_MS,
      reason: 'hard_reject',
    });
    expect(r.reason).toBe('hard_reject');
  });

  it('invalid reason → defaults to completed_exit (safety)', () => {
    const r = buildCooldownEntry({
      group:  'back',
      nowMs:  NOW_MS,
      reason: 'random_xyz',
    });
    expect(r.reason).toBe('completed_exit');
  });

  it('case-normalized group lowercase', () => {
    const r = buildCooldownEntry({
      group:  'BICEPS',
      nowMs:  NOW_MS,
      reason: 'completed_exit',
    });
    expect(r.group).toBe('biceps');
  });

  it('cooldown duration = 12 weeks Q10=B + Q16=A invariant', () => {
    const r = buildCooldownEntry({
      group:  'biceps',
      nowMs:  NOW_MS,
      reason: 'completed_exit',
    });
    const durationWeeks = (r.cooldownEndMs - r.endTimestampMs) / MS_PER_WEEK;
    expect(durationWeeks).toBe(COOLDOWN_WEEKS);
    expect(durationWeeks).toBe(12);
  });
});
