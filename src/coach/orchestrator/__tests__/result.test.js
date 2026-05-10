import { describe, it, expect } from 'vitest';
import { ok, err, isOk, mapOk } from '../result.js';

describe('Result helpers — ADR 030 D4 LOCKED V1', () => {
  describe('ok()', () => {
    it('wraps a value in ok-discriminated Result', () => {
      const r = ok(42);
      expect(r).toEqual({ ok: true, output: 42 });
    });

    it('preserves undefined output (rare but valid)', () => {
      const r = ok(undefined);
      expect(r).toEqual({ ok: true, output: undefined });
    });

    it('wraps complex objects without mutation', () => {
      const payload = { sets: 3, reps: 8 };
      const r = ok(payload);
      expect(r.output).toBe(payload);
    });
  });

  describe('err()', () => {
    it('wraps a string ca generic error envelope', () => {
      const r = err('boom');
      expect(r).toEqual({ ok: false, error: { code: 'GENERIC', message: 'boom' } });
    });

    it('passes through structured AdapterError envelope', () => {
      const r = err({ code: 'BUDGET_EXCEEDED', message: 'over 50ms' });
      expect(r).toEqual({ ok: false, error: { code: 'BUDGET_EXCEEDED', message: 'over 50ms' } });
    });

    it('preserves cause field for downstream debugging', () => {
      const cause = new Error('underlying');
      const r = err({ code: 'ENGINE_THREW', message: 'wrapped', cause });
      expect(r.error.cause).toBe(cause);
    });

    it('never throws on falsy/empty input', () => {
      expect(() => err('')).not.toThrow();
      expect(err('').error.message).toBe('');
    });
  });

  describe('isOk()', () => {
    it('returns true for ok-result', () => {
      expect(isOk(ok(1))).toBe(true);
    });

    it('returns false for err-result', () => {
      expect(isOk(err('x'))).toBe(false);
    });

    it('returns false for non-Result inputs', () => {
      expect(isOk(null)).toBe(false);
      expect(isOk(undefined)).toBe(false);
      expect(isOk({})).toBe(false);
      expect(isOk({ ok: 'yes' })).toBe(false);
    });
  });

  describe('mapOk()', () => {
    it('transforms output through fn when ok', () => {
      const r = mapOk(ok(2), (x) => x * 10);
      expect(r).toEqual({ ok: true, output: 20 });
    });

    it('passes through err untouched', () => {
      const e = err({ code: 'X', message: 'x' });
      const r = mapOk(e, (x) => x);
      expect(r).toBe(e);
    });

    it('captures fn throw ca MAP_THREW err', () => {
      const r = mapOk(ok(1), () => { throw new Error('blew up'); });
      expect(r.ok).toBe(false);
      expect(r.error.code).toBe('MAP_THREW');
      expect(r.error.message).toBe('blew up');
      expect(r.error.cause).toBeInstanceOf(Error);
    });

    it('handles non-Error throws (string, undefined)', () => {
      const r = mapOk(ok(1), () => { throw 'naked string'; });
      expect(r.ok).toBe(false);
      expect(r.error.message).toBe('naked string');
    });
  });
});
