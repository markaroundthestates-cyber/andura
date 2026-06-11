import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  FLAGS,
  DEV_FLAGS_KEY,
  hashStringDjb2,
  resolveUserId,
  readDevFlags,
  isEnabled,
} from '../featureFlags.js';

const cleanLs = () => {
  try {
    localStorage.removeItem(DEV_FLAGS_KEY);
    localStorage.removeItem('user-id');
    localStorage.removeItem('device-id');
  } catch { /* test environment may not have localStorage */ }
};

beforeEach(cleanLs);
afterEach(cleanLs);

describe('featureFlags — FLAGS registry', () => {
  it('the retired coachDirector-strangler flags stay deleted (2026-06-10 cleanup)', () => {
    // The live path (getDailyWorkout → runPipeline) runs the engines directly;
    // these gated nothing and their comments mis-narrated the wiring.
    expect(FLAGS.aa_via_cluster).toBeUndefined();
    expect(FLAGS.periodization_via_orchestrator).toBeUndefined();
    expect(FLAGS.warmup_via_orchestrator).toBeUndefined();
  });

  it('FLAGS is frozen (immutable)', () => {
    expect(Object.isFrozen(FLAGS)).toBe(true);
    expect(() => { FLAGS.injected = { rollout: 1, default: true }; }).toThrow();
  });
});

describe('featureFlags — hashStringDjb2', () => {
  it('returns deterministic hash for same input', () => {
    expect(hashStringDjb2('hello')).toBe(hashStringDjb2('hello'));
    expect(hashStringDjb2('user-1234abcdvitality_layer_v1')).toBe(hashStringDjb2('user-1234abcdvitality_layer_v1'));
  });

  it('returns different hashes for different inputs', () => {
    expect(hashStringDjb2('a')).not.toBe(hashStringDjb2('b'));
    expect(hashStringDjb2('user-1abc')).not.toBe(hashStringDjb2('user-2abc'));
  });

  it('returns 32-bit unsigned integer', () => {
    const h = hashStringDjb2('arbitrary-string-123');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(2 ** 32);
  });

  it('handles empty string', () => {
    expect(hashStringDjb2('')).toBe(5381); // DJB2 init value
  });
});

describe('featureFlags — resolveUserId', () => {
  it('prefers user-id over device-id', () => {
    localStorage.setItem('user-id', 'real-user-uuid');
    localStorage.setItem('device-id', 'dev-fallback');
    expect(resolveUserId()).toBe('real-user-uuid');
  });

  it('falls back to device-id when user-id missing', () => {
    localStorage.setItem('device-id', 'dev-abc');
    expect(resolveUserId()).toBe('dev-abc');
  });

  it('returns null when neither is present', () => {
    expect(resolveUserId()).toBeNull();
  });
});

describe('featureFlags — readDevFlags', () => {
  it('returns null when key missing', () => {
    expect(readDevFlags()).toBeNull();
  });

  it('parses valid JSON object', () => {
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ a: true, b: false }));
    expect(readDevFlags()).toEqual({ a: true, b: false });
  });

  it('returns null + warns for invalid JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(DEV_FLAGS_KEY, '{not-json');
    expect(readDevFlags()).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/not valid JSON/));
    warn.mockRestore();
  });

  it('returns null + warns for non-object JSON (array)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(['a', 'b']));
    expect(readDevFlags()).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/plain object/));
    warn.mockRestore();
  });

  it('returns null + warns for non-object JSON (string)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify('hi'));
    expect(readDevFlags()).toBeNull();
    warn.mockRestore();
  });
});

describe('featureFlags — isEnabled, unknown flags', () => {
  it('returns false for unknown flag (fail-closed)', () => {
    expect(isEnabled('totally_made_up_flag', 'user-1')).toBe(false);
  });

  it('returns false for unknown flag even when registry empty', () => {
    expect(isEnabled('whatever', 'user-1', { flags: {} })).toBe(false);
  });
});

describe('featureFlags — isEnabled, rollout 0 / 1', () => {
  const flags = { rollout_zero: { rollout: 0, default: true }, rollout_full: { rollout: 1, default: false } };

  it('rollout 0 → always false (regardless of default)', () => {
    expect(isEnabled('rollout_zero', 'user-1', { flags })).toBe(false);
    expect(isEnabled('rollout_zero', 'user-2', { flags })).toBe(false);
    expect(isEnabled('rollout_zero', 'totally-different-user', { flags })).toBe(false);
  });

  it('rollout 1 → always true (regardless of default)', () => {
    expect(isEnabled('rollout_full', 'user-1', { flags })).toBe(true);
    expect(isEnabled('rollout_full', 'user-2', { flags })).toBe(true);
    expect(isEnabled('rollout_full', 'arbitrary', { flags })).toBe(true);
  });
});

describe('featureFlags — isEnabled, hash bucketing distribution', () => {
  it('rollout 0.5 distributes ~50/50 across 1000 random userIds', () => {
    const flags = { half: { rollout: 0.5, default: false } };
    let enabled = 0;
    for (let i = 0; i < 1000; i++) {
      if (isEnabled('half', `user-${i}`, { flags })) enabled++;
    }
    expect(enabled).toBeGreaterThanOrEqual(450);
    expect(enabled).toBeLessThanOrEqual(550);
  });

  it('rollout 0.10 distributes ~10% across 1000 userIds', () => {
    const flags = { ten: { rollout: 0.10, default: false } };
    let enabled = 0;
    for (let i = 0; i < 1000; i++) {
      if (isEnabled('ten', `user-${i}`, { flags })) enabled++;
    }
    expect(enabled).toBeGreaterThanOrEqual(70);
    expect(enabled).toBeLessThanOrEqual(130);
  });

  it('same userId + flagId yields deterministic result across calls', () => {
    const flags = { sticky: { rollout: 0.5, default: false } };
    const first = isEnabled('sticky', 'user-stable-uuid', { flags });
    for (let i = 0; i < 20; i++) {
      expect(isEnabled('sticky', 'user-stable-uuid', { flags })).toBe(first);
    }
  });

  it('independent buckets per flag — same user, different flags get distinct distributions', () => {
    // Use realistic, distinct flag IDs; adjacent single chars under DJB2 are
    // too correlated since hash diff is dominated by trailing char position.
    const flags = {
      vitality_layer_v1:    { rollout: 0.5, default: false },
      demographic_prior_v1: { rollout: 0.5, default: false },
      aa_detection_v1:      { rollout: 0.5, default: false },
    };
    let mismatches = 0;
    for (let i = 0; i < 200; i++) {
      const uid = `user-${i}-uuid`;
      const ra = isEnabled('vitality_layer_v1',    uid, { flags });
      const rb = isEnabled('demographic_prior_v1', uid, { flags });
      const rc = isEnabled('aa_detection_v1',      uid, { flags });
      if (ra !== rb || rb !== rc) mismatches++;
    }
    // Independent buckets: expect ~75% mismatch (3 indep coin flips, P(all-equal)=0.25).
    // Lower threshold (>100 = >50%) accommodates DJB2 imperfections at small N.
    expect(mismatches).toBeGreaterThan(100);
  });
});

describe('featureFlags — isEnabled, _devFlags override', () => {
  it('_devFlags true override wins over rollout=0', () => {
    const flags = { vitality: { rollout: 0, default: false } };
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ vitality: true }));
    expect(isEnabled('vitality', 'user-1', { flags })).toBe(true);
  });

  it('_devFlags false override wins over rollout=1', () => {
    const flags = { aa: { rollout: 1, default: true } };
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ aa: false }));
    expect(isEnabled('aa', 'user-1', { flags })).toBe(false);
  });

  it('_devFlags only overrides matched flag, others use rollout', () => {
    const flags = { a: { rollout: 1, default: false }, b: { rollout: 0, default: false } };
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ a: false }));
    expect(isEnabled('a', 'user-1', { flags })).toBe(false); // overridden
    expect(isEnabled('b', 'user-1', { flags })).toBe(false); // rollout 0
  });

  it('invalid JSON in _devFlags ignored gracefully (falls through to bucketing)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const flags = { x: { rollout: 1, default: false } };
    localStorage.setItem(DEV_FLAGS_KEY, 'not-valid-json');
    expect(isEnabled('x', 'user-1', { flags })).toBe(true); // rollout wins
    warn.mockRestore();
  });
});

describe('featureFlags — isEnabled, missing userId fallback', () => {
  it('falls back to flag.default when userId missing and rollout is partial', () => {
    const flagsTrue  = { x: { rollout: 0.5, default: true  } };
    const flagsFalse = { x: { rollout: 0.5, default: false } };
    expect(isEnabled('x', undefined, { flags: flagsTrue  })).toBe(true);
    expect(isEnabled('x', undefined, { flags: flagsFalse })).toBe(false);
  });

  it('uses resolveUserId() when no userId argument provided', () => {
    const flags = { x: { rollout: 0.5, default: false } };
    localStorage.setItem('device-id', 'dev-deterministic-id');
    const r1 = isEnabled('x', undefined, { flags });
    const r2 = isEnabled('x', 'dev-deterministic-id', { flags });
    expect(r1).toBe(r2);
  });
});
