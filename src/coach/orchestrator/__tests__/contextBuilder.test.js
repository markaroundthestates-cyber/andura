import { describe, it, expect } from 'vitest';
import { buildEngineContext } from '../contextBuilder.js';

describe('buildEngineContext — ADR 030 D3 LOCKED V1', () => {
  it('returns minimal frozen ctx pe input gol cu constraintObject placeholder', () => {
    const ctx = buildEngineContext();
    expect(ctx.user).toEqual({});
    expect(ctx.recentSessions).toEqual([]);
    expect(ctx.weights).toEqual({});
    expect(ctx.profileTier).toBeNull();
    expect(ctx.flags).toEqual({});
    // Constraint Object placeholder slot per ADR 026 §1.10 + ADR 030 D3 (Faza 3 batch 1 LANDED 2026-05-08)
    expect(ctx.meta).toEqual({ constraintObject: null });
    expect(Object.isFrozen(ctx)).toBe(true);
    expect(Object.isFrozen(ctx.meta)).toBe(true);
  });

  it('passes user object through', () => {
    const user = { id: 'u1', sex: 'M', age: 30 };
    const ctx = buildEngineContext({ user });
    expect(ctx.user).toBe(user);
  });

  it('preserves recentSessions array reference', () => {
    const sessions = [{ id: 's1' }, { id: 's2' }];
    const ctx = buildEngineContext({ recentSessions: sessions });
    expect(ctx.recentSessions).toBe(sessions);
  });

  it('coerces non-array recentSessions to empty array (defensive)', () => {
    expect(buildEngineContext({ recentSessions: 'not-array' }).recentSessions).toEqual([]);
    expect(buildEngineContext({ recentSessions: null }).recentSessions).toEqual([]);
    expect(buildEngineContext({ recentSessions: { 0: 's' } }).recentSessions).toEqual([]);
  });

  it('passes profileTier through cand present', () => {
    expect(buildEngineContext({ profileTier: 'T2' }).profileTier).toBe('T2');
  });

  it('passes weights / flags / meta through cand present (cu constraintObject placeholder slot)', () => {
    const ctx = buildEngineContext({
      weights: { squat: 100 },
      flags: { foo: true },
      meta: { traceId: 'abc' },
    });
    expect(ctx.weights).toEqual({ squat: 100 });
    expect(ctx.flags).toEqual({ foo: true });
    // meta extended cu constraintObject: null placeholder pentru Faza 3 propagation
    expect(ctx.meta).toEqual({ traceId: 'abc', constraintObject: null });
  });

  it('preserves explicit meta.constraintObject cand caller provides it', () => {
    const co = Object.freeze({ phase: 'LOAD', immutable_snapshot: true });
    const ctx = buildEngineContext({ meta: { constraintObject: co } });
    expect(ctx.meta.constraintObject).toBe(co);
  });

  it('frozen ctx prevents mutation by adapters (D2 thin scope guard)', () => {
    const ctx = buildEngineContext({ user: { id: 'u1' } });
    expect(() => { ctx.user = { id: 'mutated' }; }).toThrow(TypeError);
  });

  it('null/undefined input safe', () => {
    expect(() => buildEngineContext(null)).not.toThrow();
    expect(() => buildEngineContext(undefined)).not.toThrow();
  });
});
